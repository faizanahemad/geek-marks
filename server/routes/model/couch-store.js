var couch = require('nano')('http://localhost:5984')
var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));
var admin = require('couch-admin')({
    url: 'http://localhost:5984',
    // user: 'admin',
    // pass: 'mysecretpassword',
    user_db: '_users'
});
var config = require('config');
var Datastore = require('nedb');
var utils = require('./../utils');
var CSet = require("collections/set");
var Promise = require("bluebird");
var _ = require('lodash');

var CouchStore = class CouchStore {
    constructor(dbName) {
        this.dbName = dbName;
        this.remote = couch.use(dbName);
        this.db = new PouchDB('http://localhost:5984/history');
        // this.db.sync(this.remote,{
        //     live: true,
        //     retry: true
        // })
        Promise.promisifyAll(this.db);
        this.db.createIndex({
            index: {
              fields: ['href']
            }
        })
        this.db.createIndex({
            index: {
              fields: ['lastVisited','difficulty','visits']
            }
        })

        this.db.createIndex({
            index: {
              fields: ['lastVisited']
            }
        })

        this.db.createIndex({
            index: {
              fields: ['difficulty']
            }
        })

        this.db.createIndex({
            index: {
              fields: ['visits']
            }
        })
    }

    _find(mango) {
        var sort = mango.sort || [];
        var sortFn = utils.createSortFn(sort)
        
        delete mango.sort
        mango = _.merge({},{limit:10000000000},mango)
        return this.db.find(mango).then((res)=>{
            var sortedResults = res.docs.sort(sortFn)
            return sortedResults
        }, console.error)
    }

    getByIds(ids,sort) {
        ids = ids || [];
        var query = {"_id":{$in: ids}};
        return this._find({
            selector:query,
            sort:sort
        });
    }

    getAllCount(userId) {
        return this.getAll(userId).then(docs=>docs.length)
    }

    getAll(userId,sort) {
        var query = {};
        if (userId) {
            query = {userId: userId}
        } else {
            return Promise.reject("User Id not specified");
        }
        return this._find({
            selector:query,
            sort:sort
        });
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

    remove(id,userId) {
        var query = {};
        if (userId && id) {
            query = {_id: id, userId: userId};
        } else {
            console.error("Cannot remove entry");
            console.error(id);
            return Promise.reject("Cannot remove entry");
        }
        var self = this;
        return this.db.get(id).then(doc=>{
            doc._deleted=true;
            self.db.put(doc)
        },console.error)
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
            query.userId = userId;
        } else {
            return Promise.reject("User Id not specified");
        }
        if(useless) {
            delete query.useless
        }
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
            if(query.lastVisited)
                query.lastVisited.$lte = utils.subtractDaysFromNow(lastVisitedDaysBeyond)
            else
                query.lastVisited = {$lte: utils.subtractDaysFromNow(lastVisitedDaysBeyond)}
        }
        if (Array.isArray(tags) && tags.length > 0) {
            query.tags = tags[0];
            thenFunc = docs=>docs.filter(d=>utils.isSuperSet(d.tags, tags))
        }
        if (search && typeof search == "string" && search.length > 0) {
            // var searchRegex = new RegExp(search, "i");
            var searchRegex = "(?mi)"+search
            var searchQuery = {
                $or: [{title: {$regex: searchRegex}}, {href: {$regex: searchRegex}},{note: {$regex: searchRegex}},
                    {pathname: {$regex: searchRegex}}]
            };
            query = {$and: [_.cloneDeep(query), searchQuery]}
        }
        return this._find({
            selector:query,
            sort:sort
        });
    }
};


module.exports = {couch:couch,admin:admin,couchStore:new CouchStore('history')};