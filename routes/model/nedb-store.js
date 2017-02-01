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

    getAllCount(userId) {
        return this.getAll(userId).then(docs=>docs.length)
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

    _isPersistable(newEntry, oldEntry) {
        var hasFields = (entry)=>((entry.tags && entry.tags.length>0) || (entry.videoTime && entry.videoTime.length>0) || (entry.note && entry.note.length>0))?true:false;
        if (newEntry && newEntry.useless) {
            return true
        } else if (oldEntry && oldEntry.useless){
            return true
        }
        if(!oldEntry) {
            if(newEntry) {
                if(newEntry.difficulty) {
                    return true;
                } else if(hasFields(newEntry)) {
                    newEntry.difficulty = newEntry.difficulty || 2;
                    return true;
                }
            }
        } else {
            if(newEntry.difficulty || oldEntry.difficulty) {
                return true;
            } else if(hasFields(newEntry) || hasFields(oldEntry)) {
                return true;
            }
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
                if (!self._isPersistable(entry, doc)) {
                    return Promise.reject("Difficulty is mandatory to persist")
                }
                newEntryToStore = utils.merge(doc, entry);
                return self.db.updateAsync({_id: doc._id}, newEntryToStore, {returnUpdatedDocs:true}).then(()=>[newEntryToStore,false]);
            } else {
                if (!self._isPersistable(newEntryToStore)) {
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
                    useless,
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
            query = query.userId = userId;
        } else {
            return Promise.reject("User Id not specified");
        }
        if(useless) {
            query.useless = useless;
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

