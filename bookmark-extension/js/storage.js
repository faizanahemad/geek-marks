var superagent = Promise.promisifyAll(superagent);

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
        this.db = new PouchDB(dbName, {revs_limit: 10});
        this.remote = new PouchDB(remoteUrl)
        this.userId = userId
        this.db.sync(this.remote,{
            live: true,
            retry: true,
            filter: 'app/by_user',
            query_params: { "userId": userId }
        })
        this.db.createIndex({
                           index: {
                               fields: ['userId']
                           }
                       })
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
        return this.getAll(userId).then((allDocs)=> {
            var tagSet = new Set();
            allDocs.forEach(d=> {
                if (Array.isArray(d.tags)) {
                    d.tags.forEach(tag=>tagSet.add(tag))
                }
            });
            return Array.from(tagSet)
        }, promiseRejectionHandler)
    }

    getAllCollections(userId) {
        return this.getAll(userId).then((allDocs)=> {
            var collections = new Set();
            allDocs.forEach(d=> {
                if (typeof d.collection!=='undefined' && d.collection!==null) {
                    collections.add(d.collection)
                }
            });
            // add default collections
            defaultCollections.forEach(c=>collections.add(c))
            
            return Array.from(collections)
        }, promiseRejectionHandler)
    }

    _isPersistable(newEntry, oldEntry) {
        var hasFields = (entry)=>((entry.tags && entry.tags.length>0) || (entry.videoTime && entry.videoTime.length>0) || (entry.note && entry.note.length>0))?true:false;
        if (newEntry && newEntry.useless) {
            return true
        } else if (oldEntry && oldEntry.useless){
            return true
        }
        if(typeof newEntry.userId==='undefined' || newEntry.userId===null) {
            return false;
        }
        if(typeof newEntry.collection==='undefined' || newEntry.collection===null) {
            return false;
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

    _insertOrUpdateEntry(entry) {
        var self = this;
        var valid = this._isPersistable(entry);

        var promise = Promise.resolve(entry)
        return promise.then(e=>self.db.get(entry._id))
        .then(localDoc=>{
            if(!this._isPersistable(entry,localDoc)) {
                return Promise.reject("Not persistable")
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
            return valid?Promise.resolve(entry):Promise.reject("Not persistable")
        })
        .then((entry)=>self.db.post(entry))
        .then(data=>self.db.get(data.id))
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
            },(err)=>self.db.post(entry)).catch(console.error)

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
