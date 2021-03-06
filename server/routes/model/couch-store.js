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

        this.db.createIndex({
            index: {
              fields: ['videoTime.[].description']
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

    getAllTags(userId,collections) {
        var allPromise = Promise.resolve([])
        if(Array.isArray(collections) && collections.length>0) {
            var query = {userId:userId,collection:{$in:collections}}
            allPromise = this._find({selector:query})
        } else {
            allPromise = this.getAll(userId)
        }
        return allPromise.then((allDocs)=> {
                var tagSet = new CSet();
                allDocs.forEach(d=> {
                    if (Array.isArray(d.tags)) {
                        d.tags.forEach(tag=>tagSet.add(tag))
                    }
                });
                return Array.from(tagSet)
            }, console.error)
    }

    getAllCollections(userId) {
        var defaultCollections = ["Misc","Data Structures and Algorithms","Machine Learning & AI",
        "Software Engineering","Personal Development"]
        return this.getAll(userId).then((allDocs)=> {
            var collections = new Set();
            allDocs.forEach(d=> {
                if (d.collection) {
                    collections.add(d.collection)
                }
            });
            // add default collections
            defaultCollections.forEach(c=>collections.add(c))
            
            return Array.from(collections)
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

    getAutocompletions(userId) {
        var query = {}
        if(userId) {
            query = {userId: userId,docType:"autocomplete"};
        } else {
            console.error("Empty UserId");
            console.error(id);
            return Promise.reject("Empty UserId");
        }
        return this._find({
            selector:query
        }).then(res=>{
            console.log(res)
            if(res.length===1) {
                return res[0]
            }
            return null;
        })
    }

    storeAutocompletions(body,userId) {
        var query = {}
        if(userId) {
            query = {userId: userId,docType:"autocomplete"};
        } else {
            console.error("Empty UserId");
            console.error(id);
            return Promise.reject("Empty UserId");
        }

        return this._find({
            selector:query
        }).then(res=>{
            if(res.length===1) {
                res = res[0]
                res.completions = body.completions;
                res.lastUpdated = body.lastUpdated+1;
                return res
            } else {
                return Promise.reject(null);
            }
        }).then(res=>this.db.put(res))
        .catch(()=>{
            var res = {
                completions:body.completions,
                lastUpdated:body.lastUpdated,
                "docType":"autocomplete",
                "userId":userId
            }
            return this.db.post(res)
        })
    }

    getAllByFilters(difficulties,
                    useless,
                    hostnames,
                    tags,
                    tags_or,
                    collections,
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
        if (Array.isArray(collections) && collections.length > 0) {
            query.collection = {$in: collections}
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
            if(typeof tags_or==='undefined' || tags_or===null || !tags_or) {
                thenFunc = docs=>docs.filter(d=>utils.isSuperSet(d.tags, tags))
            } else {
                thenFunc = docs=>docs.filter(d=>utils.isSetIntersect(d.tags, tags))                                
            }
            
        }
        if (search && typeof search == "string" && search.length > 0) {
            // var searchRegex = new RegExp(search, "i");
            var searchRegex = "(?mi)"+search
            var videoTagQuery = {videoTime:{$elemMatch:{description:{$regex:searchRegex}}}}
            var searchQuery = {
                $or: [{title: {$regex: searchRegex}}, {href: {$regex: searchRegex}},{note: {$regex: searchRegex}},
                    {pathname: {$regex: searchRegex}},videoTagQuery]
            };
            query = {$and: [_.cloneDeep(query), searchQuery]}
        }
        return this._find({
            selector:query,
            sort:sort
        }).then(thenFunc);
    }
};


module.exports = {couch:couch,admin:admin,couchStore:new CouchStore('history')};