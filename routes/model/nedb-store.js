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

    getAll(userId) {
        var query = {};
        if (userId) {
            query = {userId: userId}
        } else {
            return Promise.reject("User Id not specified");
        }
        return this.db.findAsync(query).then(undefined, console.error);
    }

    getAllTags(userId) {
        return this.getAll(userId)
            .then((allDocs)=> {
                var tagSet = new CSet();
                allDocs.forEach(d=> {
                    if (d.tags && d.tags instanceof Array) {
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
        if (hostnames && hostnames instanceof Array) {
            query.hostname = {$in: hostnames};
            return this.db.findAsync(query, console.error);
        } else {
            return Promise.resolve([]);
        }
    }

    insertOrUpdateEntry(entry, userId) {
        var newEntryToStore = entry;
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
                newEntryToStore = utils.merge(doc, entry);
                return self.db.updateAsync({_id: doc._id}, newEntryToStore, {});
            } else {
                return self.db.insertAsync(newEntryToStore)
            }
        }).then(()=>newEntryToStore)
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
        var query = {};
        if (userId) {
            query = {userId: userId}
        } else {
            return Promise.reject("User Id not specified");
        }
        sort = sort || {};
        var thenFunc = (v)=>v;
        if (difficulties && difficulties instanceof Array && difficulties.length > 0) {
            query.difficulty = {$in: difficulties}
        }
        if (hostnames && hostnames instanceof Array && hostnames.length > 0) {
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
        if (tags && tags instanceof Array && tags.length > 0) {
            query.tags = tags[0];
            thenFunc = docs=>docs.filter(d=>utils.isSuperSet(d.tags, tags))
        }
        if (search && typeof search == "string" && search.length > 0) {
            var searchRegex = new RegExp(search, "i");
            var searchQuery = {
                $or: [{title: {$regex: searchRegex}}, {href: {$regex: searchRegex}},
                    {pathname: {$regex: searchRegex}}]
            };
            query = {$and: [_.cloneDeep(query), searchQuery]}
        }
        var sortedOutput = Promise.promisifyAll(this.db.find(query).sort(sort));
        return sortedOutput.execAsync().then(thenFunc, console.error);
    }
};

module.exports = new NedbStore(utils.convertRelativeToAbsolutePath(config.datafile));

