var superagent = Promise.promisifyAll(superagent);
var postInput = function postInput(data) {
    var storageData = $.extend(true, {}, data);

    var postData = {
        "href": storageData.href,
        "protocol": storageData.protocol,
        "hostname": storageData.hostname,
        "pathname": storageData.pathname,
        "title": storageData.title,
        "note": storageData.note,
        "tags": storageData.tags,
        "difficulty":storageData.difficulty,
        "userId": storageData.userId,
        "useless":storageData.useless
    };
    postData["lastVisited"] = Date.now();
    return superagent.postAsync(entryUrl, postData).then(res=>res.body,console.error);
};

var deleteEntry = function deleteEntry(id) {
    return superagent.deleteAsync(getDeleteUrl(id)).then(undefined,console.error);
};
var putVisit = function putVisit(id) {
    return superagent.putAsync(getVisitUrl(id))
};

function reconcile(userId, storage, total) {
    return storage.getAllCount(userId).then(count=>{
        if(count==total)
            return Promise.resolve(true);
        else
            return Promise.reject(false);
    }).then(undefined,(err)=>{
        console.error(err);
        return storage.setDbVersion(0,userId)
    })
}
function sync(userId,storage) {
    if(userId) {
        storage.getDbVersion(userId)
            .then(version=>{
                return superagent.postAsync(syncUrl,{version:version})
            }).then(res=>res.body)
            .then(body=>{
                if(body) {
                    var allPromises = body.deleted.map(d=>storage.remove(d,userId));
                    allPromises = allPromises.concat(body.modified.map(m=>storage._insertOrUpdateEntry(m)));
                    allPromises = allPromises.concat([storage.setDbVersion(body.version,userId)]);
                    if(body.hasNext) {
                        allPromises = allPromises.concat([sync()]);
                    }
                    return Promise.all(allPromises).then(()=>reconcile(userId,storage,body.total))
                }
                return Promise.reject("No body in response");
            },console.error)
    }
}
var Storage = class Storage {
    constructor(dbName) {
        this.db = new PouchDB(dbName, {revs_limit: 1});
        this.db.createIndex({
                           index: {
                               fields: ['userId']
                           }
                       })
    }

    getDbVersion(userId) {
        var self = this;
        return this.db.get(userId + '_metainfo_').then(doc=> {
            if (doc) {
                return doc.version;
            } else {
                return 0;
            }
        },(err)=>{
            if(err.status === 404) {
                self.db.put({
                                       _id: userId + '_metainfo_',
                                       userId:userId,
                                       version: 0
                                   });
            }
            return Promise.resolve(0);
        })
    }

    setDbVersion(version, userId) {
        var self = this;
        return this.db.get(userId + '_metainfo_').then(doc=> {
            if (doc) {
                return self.db.put({
                                       _id: doc._id,
                                       _rev: doc._rev,
                                       userId:userId,
                                       version: version
                                   });
            } else {
                return self.db.put({
                                       _id: userId + '_metainfo_',
                                       userId:userId,
                                       version: version
                                   });
            }
        },(err)=>{
            if(err.status === 404) {
                self.db.put({
                                _id: userId + '_metainfo_',
                                userId:userId,
                                version: version
                            });
            }
            return Promise.resolve(version);
        })
    }

    getAll(userId) {
        return this.db.find({
                         selector: {userId: userId},
                     })
            .then(result=>{
                return result.docs.filter(d=>d._id.indexOf(userId+ "_metainfo_")<0)
            },console.error)
    }

    getAllCount(userId) {
        return this.getAll(userId).then(doc=>doc.length)
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
        }, console.error)
    }

    _insertOrUpdateEntry(entry) {
        var self = this;
        return self.db.get(entry._id).then(localDoc=>{
            if (localDoc) {
                entry._rev = localDoc._rev;
                return self.db.put(entry);
            } else {
                return self.db.put(entry);
            }
        },()=>self.db.put(entry))
    }

    insertOrUpdateEntry(entry, userId) {
        var self = this;
        return postInput(entry).then(doc=>{
            return self._insertOrUpdateEntry(doc)
        },console.error)
    }

    remove(id, userId) {
        var self = this;
        return deleteEntry(id).then(()=>{
            return self.db.get(id).then(doc=>self.db.remove(doc),console.error)
        },console.error)
    }

    logVisit(id, userId) {
        var self = this;
        return putVisit(id).then((doc)=>{
            self.db.get(id).then(localDoc=>{
                if (localDoc) {
                    localDoc.visits = doc.visits;
                    return self.db.put(localDoc);
                } else {
                    return self.db.put(doc);
                }
            },console.error)
        },console.error)
    }
};
var storage = new Storage(dbName);
