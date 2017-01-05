var config = require('config');
var Datastore = require('nedb');
var utils = require('./../utils');
var CSet = require("collections/set");
var Promise = require("bluebird");
var _ = require('lodash');

var NedbStore = class NedbStore {
    constructor(datafile) {
        this.datafile = datafile;
        this.db =
            new Datastore({filename: this.datafile, autoload: true, corruptAlertThreshold: 1});
        Promise.promisifyAll(this.db);
        this.db.persistence.compactDatafile();
        this.db.persistence.setAutocompactionInterval(utils.minsToMilliseconds(5));
        this.db.ensureIndex({fieldName: 'href', unique: true});
        this.db.ensureIndex({fieldName: 'difficulty'});
    }

    getByIds(ids,sort) {
        ids = ids || [];
        var query = {"_id":{$in: ids}};
        var sortedOutput = Promise.promisifyAll(this.db.find(query).sort(sort));
        return sortedOutput.execAsync().then(undefined, console.error);
    }

    getAll(userId,sort) {
        var query = {};
        sort = sort || {};
        if (userId) {
            query = {userId: userId}
        } else {
            return Promise.reject("User Id not specified");
        }
        var sortedOutput = Promise.promisifyAll(this.db.find(query).sort(sort));
        return sortedOutput.execAsync().then(undefined, console.error);
    }

    getAllTags(userId) {
        return this.getAll(userId)
            .then((allDocs)=> {
                var tagSet = new CSet();
                allDocs.forEach(d=> {
                    if (Array.isArray(d.tags)) {
                        d.tags.forEach(tag=>tagSet.add(tag))
                    }
                });
                return Array.from(tagSet)
            }, console.error)
    }

    getAllHostnames(userId) {
        this.getAll(userId).then((allDocs)=> {
            var hostSet = new CSet();
            allDocs.forEach(d=> {
                hostSet.add(d.hostname)
            });
            return Array.from(hostSet)
        }, console.error)
    }

    getByHostnames(hostnames, userId) {
        var query = {};
        if (userId) {
            query = {userId: userId}
        } else {
            return Promise.reject("User Id not specified");
        }
        if (Array.isArray(hostnames)) {
            query.hostname = {$in: hostnames};
            return this.db.findAsync(query, console.error);
        } else {
            return Promise.resolve([]);
        }
    }

    logVisit(id,userId) {
        var self = this;
        return self.db.findOneAsync({_id:id,userId: userId}).then(doc=>{
            if(doc) {
                doc.visits = doc.visits || 0;
                doc.visits = doc.visits+1;
                doc.lastVisited=Date.now();
                self.db.updateAsync({_id:doc._id},doc);
                return doc;
            } else {
                Promise.reject("Document not found");
            }
        },console.error);
    }

    _isUseless(entry, doc) {
        if (entry && entry.useless!=undefined) {
            return entry.useless
        } else if (doc && doc.useless!=undefined){
            return doc.useless
        }
        return false;
    }
    insertOrUpdateEntry(entry, userId) {
        var newEntryToStore = entry;
        newEntryToStore.userId = userId;
        var self = this;
        var query = {};
        if (entry._id) {
            query = {_id: entry._id};
        } else if (userId && entry.href) {
            query = {href: entry.href, userId: userId};
        } else {
            console.error("Cannot update/insert entry");
            console.error(entry);
            return Promise.reject("Cannot update/insert entry");
        }
        return this.db.findOneAsync(query).then((doc)=> {
            if (doc) {
                if ((doc.difficulty==undefined||doc.difficulty==null) &&
                    (entry.difficulty==undefined||entry.difficulty==null) &&
                    !self._isUseless(entry, doc)) {
                    return Promise.reject("Difficulty is mandatory to persist")
                }
                newEntryToStore = utils.merge(doc, entry);
                return self.db.updateAsync({_id: doc._id}, newEntryToStore, {returnUpdatedDocs:true}).then(()=>[newEntryToStore,false]);
            } else {
                if ((newEntryToStore.difficulty==undefined||newEntryToStore.difficulty==null)&& !self._isUseless(newEntryToStore)) {
                    return Promise.reject("Difficulty is mandatory to persist")
                }
                return self.db.insertAsync(newEntryToStore).then(doc=>[doc,true])
            }
        }).then((doc)=>doc)
    }
    remove(id,userId) {
        var query = {};
        if (userId && id) {
            query = {_id: id, userId: userId};
        } else {
            console.error("Cannot remove entry");
            console.error(id);
            return Promise.reject("Cannot remove entry");
        }
        return this.db.removeAsync(query, { multi: true }).then((numRemoved)=>{
            if (numRemoved==0) {
                return Promise.resolve();
            } else {
                return id;
            }
        });
    }

    getAllByFilters(difficulties,
                    hostnames,
                    tags,
                    visitsGreaterThan,
                    lastVisitedDaysWithin,
                    lastVisitedDaysBeyond,
                    search,
                    sort,
                    userId) {
        var query = {useless:false};
        if (userId) {
            query = {userId: userId}
        } else {
            return Promise.reject("User Id not specified");
        }
        sort = sort || {};
        var thenFunc = (v)=>v;
        if (Array.isArray(difficulties) && difficulties.length > 0) {
            query.difficulty = {$in: difficulties}
        }
        if (Array.isArray(hostnames) && hostnames.length > 0) {
            query.hostname = {$in: hostnames}
        }
        if (visitsGreaterThan && typeof visitsGreaterThan == "number") {
            query.visits = {$gte: visitsGreaterThan}
        }
        if (lastVisitedDaysWithin && typeof lastVisitedDaysWithin == "number") {
            query.lastVisited = {$gte: utils.subtractDaysFromNow(lastVisitedDaysWithin)}
        }
        if (lastVisitedDaysBeyond && typeof lastVisitedDaysBeyond == "number") {
            query.lastVisited = {$lte: utils.subtractDaysFromNow(lastVisitedDaysBeyond)}
        }
        if (Array.isArray(tags) && tags.length > 0) {
            query.tags = tags[0];
            thenFunc = docs=>docs.filter(d=>utils.isSuperSet(d.tags, tags))
        }
        if (search && typeof search == "string" && search.length > 0) {
            var searchRegex = new RegExp(search, "i");
            var searchQuery = {
                $or: [{title: {$regex: searchRegex}}, {href: {$regex: searchRegex}},{note: {$regex: searchRegex}},
                    {pathname: {$regex: searchRegex}}]
            };
            query = {$and: [_.cloneDeep(query), searchQuery]}
        }
        var sortedOutput = Promise.promisifyAll(this.db.find(query).sort(sort));
        return sortedOutput.execAsync().then(thenFunc, console.error);
    }
};

module.exports = new NedbStore(utils.convertRelativeToAbsolutePath(config.datafile));

