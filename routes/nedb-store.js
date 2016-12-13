const storage = require("./store");
var Datastore = require('nedb');
var utils = require('./utils');

var NedbStore = class NedbStore extends storage {
    constructor(datafile) {
        super();
        this.datafile = datafile;
        this.db = new Datastore({ filename: this.datafile, autoload: true , corruptAlertThreshold:1});
        this.db.persistence.compactDatafile();
        this.db.persistence.setAutocompactionInterval(utils.minsToMilliseconds(5));
        this.db.ensureIndex({ fieldName: 'href', unique: true });
        this.db.ensureIndex({ fieldName: 'difficulty'});
    }

    getDefaultCallback(callback, extra) {
        return function (err, docs) {
            if (err) {
                console.error(err);
            }
            if (callback && callback instanceof Function) {
                if (docs instanceof Object || docs instanceof Array) {
                    callback(docs,extra)
                } else {
                    callback(extra)
                }
            }
        }
    }

    getAll(callback) {
        this.db.find({},this.getDefaultCallback(callback))
    }
    getByHref(href,callback) {

    }
    getAllTags(callback) {

    }
    getByTags(tags,callback) {

    }

    getByDifficulties(difficulties,callback) {

    }
    getByDifficultiesAndHostnames(difficulties,hostnames,callback) {

    }
    getByTagsAndHostnames(tags,hostnames,callback) {

    }

    insertOrUpdateEntry(entry,callback) {
        var newEntryToStore = entry;
        var self = this;
        var insertHelper = function (query) {
            self.db.findOne(query, function (err, doc) {
                if (doc) {
                    newEntryToStore = utils.merge(doc, entry);
                    self.db.update({_id:doc._id}, newEntryToStore, {}, self.getDefaultCallback(callback,newEntryToStore));
                } else {
                    self.db.insert(entry,self.getDefaultCallback(callback))
                }
            });
        }
        if (entry._id) {
            insertHelper({ _id: entry._id })
        } else if(entry.href) {
            insertHelper({href:entry.href})
        } else {
            console.error("Cannot update/insert entry");
            console.error(entry);
        }

    }

    getAllByFilters(difficulties,
                    hostnames,
                    tagsInclude,
                    tagsExclude,
                    visitsGreaterThan,
                    lastVisitedBefore,
                    lastVisitedAfter,
                    callback) {

    }
};

module.exports = NedbStore;

