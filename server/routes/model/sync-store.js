var config = require('config');
var Datastore = require('nedb');
var utils = require('./../utils');
var store = require('./nedb-store');
var Promise = require("bluebird");

var SyncStore = class SyncStore {
    constructor(syncfile) {
        this.syncfile = syncfile;
        this.db =
            new Datastore({filename: this.syncfile, autoload: true, corruptAlertThreshold: 1});
        Promise.promisifyAll(this.db);
        this.db.persistence.compactDatafile();
        this.db.persistence.setAutocompactionInterval(utils.minsToMilliseconds(5));
    }

    getDbVersion(userId) {
        var query = {_id:userId};
        return this.db.findOneAsync(query)
    }

    getChangedIds(userId,prevVersion) {
        var query = {_id:userId};

        return this.db.findOneAsync(query).then(doc=>{
            if(doc) {
                var nextVersionInResponse = prevVersion + 1000;
                var hasNext = true;
                if(nextVersionInResponse>doc.dbVersion) {
                    nextVersionInResponse = doc.dbVersion;
                    hasNext = false;
                }
                return {
                    userId:doc._id,
                    changeIds:doc.changeIds.slice(prevVersion,nextVersionInResponse),
                    version:nextVersionInResponse,
                    hasNext:hasNext,
                    total:doc.total
                }
            } else {
                return {
                    userId:userId,
                    changeIds:[],
                    version:0,
                    hasNext:false,
                    total:0
                }
            }
        })

    }

    logChange(userId,changeIds, incr) {
        var self=this;
        var query = {_id:userId};
        return this.db.findOneAsync(query).then(doc=>{
            if(doc) {
                return self.db.updateAsync({_id:userId},{ $push: { changeIds: { $each: changeIds } },$inc: { dbVersion: changeIds.length, total:incr } })
            } else {
                self.db.insertAsync({_id:userId,changeIds:changeIds,dbVersion: changeIds.length, total:changeIds.length})
            }
        })

    }

    reconcile(userId,version) {
        if(version==0) {
            var query = {_id:userId};
            var self=this;
            return this.db.removeAsync(query, { multi: true }).then(()=>{
                return store.getAll(userId).then((docs)=>{
                    var ids = docs.map(d=>d._id);
                    return self.logChange(userId,ids)
                });
            })
        } else {
            return Promise.resolve();
        }


    }
};

module.exports = new SyncStore(utils.convertRelativeToAbsolutePath(config.syncfile));
