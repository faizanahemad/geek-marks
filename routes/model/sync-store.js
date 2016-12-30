var config = require('config');
var Datastore = require('nedb');
var utils = require('./../utils');
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
};

module.exports = new SyncStore(utils.convertRelativeToAbsolutePath(config.syncfile));
