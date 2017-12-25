function merge(oldRecord, newRecord) {
    var record = {};
    var lastVisited = Date.now();
    if (oldRecord && newRecord) {
        record = {
            "_id":oldRecord._id,
            "userId":newRecord.userId||oldRecord.userId,
            "href": newRecord.href || oldRecord.href,
            "hostname": newRecord.hostname || oldRecord.hostname,
            "pathname": newRecord.pathname || oldRecord.pathname,
            "lastVisited": lastVisited,
            "difficulty": newRecord.difficulty || oldRecord.difficulty,
            "title":newRecord.title || oldRecord.title,
            "videoTime": newRecord.videoTime || oldRecord.videoTime || [],
            "collection": newRecord.collection || oldRecord.collection,
            "visits": oldRecord.visits && typeof oldRecord.visits==="number"?oldRecord.visits:1,
            "tags": newRecord.tags || oldRecord.tags || []
        };
        if(newRecord.note===undefined) {
            record.note = oldRecord.note;
        } else {
            record.note = newRecord.note;
        }
        if (newRecord.useless!=undefined && newRecord.useless!=null) {
            record.useless = newRecord.useless;
        } else if (oldRecord.useless!=undefined && oldRecord.useless!=null) {
            record.useless = oldRecord.useless;
        } else {
            record.useless = false;
        }
        return record;
    } else if (oldRecord) {
        oldRecord.lastVisited = lastVisited;
        return oldRecord
    } else if (newRecord) {
        record = {
            "userId":newRecord.userId,
            "href": newRecord.href,
            "hostname": newRecord.hostname,
            "pathname": newRecord.pathname,
            "lastVisited": lastVisited,
            "difficulty": newRecord.difficulty,
            "note": newRecord.note,
            "visits": 1,
            "tags": newRecord.tags || [],
            "videoTime": newRecord.videoTime || [],
            "collection": newRecord.collection,
            "useless":newRecord.useless || false
        };
        return record
    } else {
        return {}
    }
}
var Storage = class Storage {
    constructor(dbName,remoteUrl,userId) {
        this.collectionCache = {}
        this.tagCache = {}
        this.db = new PouchDB(dbName, {revs_limit: 10, adapter: 'memory'});
        this.persisted = new PouchDB(dbName, {revs_limit: 20});
        this.remote = new PouchDB(remoteUrl)
        this.userId = userId
        this.persisted.sync(this.remote,{
            live: true,
            retry: true,
            filter: 'app/by_user',
            query_params: { "userId": userId }
        })
        this.db.sync(this.persisted,{
            live: true,
            retry: true,
            filter: 'app/by_user',
            query_params: { "userId": userId }
        })
        this.persisted.createIndex({
            index: {
                fields: ['userId']
            }
        })
    }

    _updateCache(entry) {
        var userId = entry.userId
        var self = this
        if(this._checkCollectionCacheValidity(userId) && this._checkTagCacheValidity(userId)) {
            this.collectionCache[userId].collections.add(entry.collection)
            entry.tags.forEach(t=>self.tagCache[userId].tags.add(t))
        } else {
            _initCache(userId) 
        }
        return entry
    }

    _initCache(userId) {
        this.getAllCollections(userId)
        this.getAllTags(userId)
    }
    _checkCollectionCacheValidity(userId) {
        if(this.collectionCache[userId] && this.collectionCache[userId].time>Date.now()-cacheRefreshTime) {
            return true
        }
        return false;
    }

    _checkTagCacheValidity(userId) {
        if(this.tagCache[userId] && this.tagCache[userId].time>Date.now()-cacheRefreshTime) {
            return true
        }
        return false;
    }

    _getCollections(allDocs) {
        var collections = new Set(allDocs.filter(d=>typeof d.collection!=='undefined' && d.collection!==null).map(d=>d.collection))
        // add default collections
        defaultCollections.forEach(c=>collections.add(c))
        return collections;
    }

    _getTags(allDocs) {
        // Array concat is used here for flattening
        var tags = Array.prototype.concat.apply([], allDocs.filter(d=>Array.isArray(d.tags)).map(d=>d.tags)) 
        var tagSet = new Set(tags);
        return tagSet;
    }

    getAll(userId) {
        return this.db.find({
                         selector: {userId: userId},
                     })
            .then(result=>{
                return result.docs
            },promiseRejectionHandler)
    }

    getAllCount(userId) {
        return this.getAll(userId).then(doc=>doc.length-1)
    }

    getAllTags(userId) {
        var self = this;
        if(this._checkTagCacheValidity(userId)) {
            return Promise.resolve(Array.from(this.tagCache[userId].tags))
        } else {
            return this._getAllTags(userId).then(tags=>{
                self.tagCache[userId] = {
                    tags: new Set(tags),
                    time: Date.now()
                }
                return tags;
            })
        }
        
    }

    _getAllTags(userId) {
        return this.getAll(userId).then((allDocs)=> {
            return Array.from(this._getTags(allDocs))
        }, promiseRejectionHandler)
    }

    getAllCollections(userId) {
        var self = this
        if(this._checkCollectionCacheValidity(userId)) {
            return Promise.resolve(Array.from(this.collectionCache[userId].collections))
        } else {
            return this._getAllCollections(userId).then(cls=>{
                self.collectionCache[userId] = {}
                self.collectionCache[userId].collections = new Set(cls)
                self.collectionCache[userId].time = Date.now()
                return cls;
            })
        }
    }

    _getAllCollections(userId) {
        var el=elapser("collections")
        return this.getAll(userId).then((allDocs)=> {
            el("collected:")
            return Array.from(this._getCollections(allDocs))
        }, promiseRejectionHandler)
    }

    _isPersistable(newEntry, oldEntry) {
        var hasFields = (entry)=>((entry.tags && entry.tags.length>0) 
        || (entry.videoTime && entry.videoTime.length>0) 
        || (entry.note && entry.note.length>0) 
        || (typeof entry.collection==="string" && entry.collection.length>0))?true:false;
        if (newEntry && newEntry.useless) {
            return [true,""]
        } else if (oldEntry && oldEntry.useless){
            return [true,""]
        } else if(typeof newEntry.collection==='undefined' || newEntry.collection===null) {
            return [false,"_isPersistable: No Collection defined"];
        }
        if(typeof newEntry.userId==='undefined' || newEntry.userId===null) {
            return [false,"_isPersistable: No userId defined"];
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
        return [false,"_isPersistable: Difficulty or Other Necessart Attributes missing"];;
    }

    _insertOrUpdateEntry(entry) {
        var self = this;

        var promise = Promise.resolve(entry)
        return promise.then(e=>self.db.get(entry._id))
        .then(localDoc=>{
            var persistable = this._isPersistable(entry,localDoc)
            if(!persistable[0]) {
                return Promise.reject(persistable[1])
            }
            return localDoc
        })
        .then(localDoc=>{
            entry = merge(localDoc,entry)
            entry._rev = localDoc._rev;
            return entry;
        })
        .then(entry=>self.db.put(entry))
        .then(data=>self.db.get(data.id))
        .catch((err)=>{
            var valid = this._isPersistable(entry);
            return valid[0]?Promise.resolve(entry):Promise.reject(valid[1])
        })
        .then((entry)=>self.db.post(entry))
        .then(data=>self.db.get(data.id))
        .then(entry=>self._updateCache(entry))
    }

    insertOrUpdateEntry(entry, userId) {
        var self = this;
        if(typeof entry.userId==='undefined'||entry.userId===null) {
            entry['userId'] = userId
        }
        return this._insertOrUpdateEntry(entry).then(undefined,promiseRejectionHandler)
    }

    bulkInsertOrUpdate(entries,userId) {
        var self = this;
        entries.forEach(entry=>{
            if(typeof entry.userId==='undefined'||entry.userId===null) {
                entry['userId'] = userId
            }
            this.db.get(entry._id).then(localDoc=>{
                entry._rev = localDoc._rev;
                return self.db.put(entry)
            },(err)=>self.db.post(entry))
            .then(e=>self._updateCache(e)).catch(console.error)

        })
    }

    remove(id, userId) {
        var self = this;
        self.db.get(id).then(doc=>{
            doc._deleted=true;
            self.db.put(doc)
        },promiseRejectionHandler)
    }

    logVisit(id, userId) {
        var self = this;
        return self.db.get(id).then(localDoc=>{
            if (localDoc) {
                localDoc.visits = (localDoc.visits||0) + 1;
                return self.db.put(localDoc);
            }
        },promiseRejectionHandler)
    }
};

var storage = null;
function initStorageOnce(dbName,couchStoreUrl,userId) {
    if(storage===null) {
        storage = new Storage(dbName,couchStoreUrl,userId);
    }
    
}
