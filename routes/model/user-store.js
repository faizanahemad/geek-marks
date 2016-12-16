var config = require('config');
var Datastore = require('nedb');
var utils = require('../utils');
var Promise = require("bluebird");
var _ = require('lodash');

var UserStore = class UserStore {
    constructor(datafile) {
        this.datafile = datafile;
        this.db =
            new Datastore({filename: this.datafile, autoload: true, corruptAlertThreshold: 1});
        Promise.promisifyAll(this.db);
        this.db.persistence.compactDatafile();
        this.db.persistence.setAutocompactionInterval(utils.minsToMilliseconds(5));
        this.db.ensureIndex({fieldName: 'username', unique: true});
        this.db.ensureIndex({fieldName: 'email', unique: true});
    }

    getAll() {
        return this.db.findAsync({}).then(undefined, console.error);
    }
    getOneByUserName(username,password) {
        return this.db.findOneAsync({username:username,password:password}).then((doc)=>{
            if (doc){
                return Promise.resolve(doc)
            } else {
                return Promise.reject()
            }
        }, console.error);
    }
    getOneByEmail(email,password) {
        return this.db.findOneAsync({email:email,password:password}).then((doc)=>{
            if (doc){
                return Promise.resolve(doc)
            } else {
                return Promise.reject()
            }
        }, console.error);
    }

    insertUser(entry) {
        var self = this;
        var query = {};
        if (entry.username && entry.email && entry.password) {
            query = {username: entry.username};
            return this.db.findOneAsync(query).then((doc)=> {
                if (doc) {
                    console.error("User Already Exists");
                    console.error(entry);
                    Promise.reject("User Already Exists");
                } else {
                    return self.db.insertAsync(entry)
                }
            })
        } else {
            console.error("Cannot insert user");
            console.error(entry);
            Promise.reject("Insufficient data for User Creation");
        }
    }

    updateUser(entry) {
        var newEntryToStore = entry;
        var self = this;
        var query = {};
        if (entry.username) {
            query = {username: entry.username};
            return this.db.findOneAsync(query).then((doc)=> {
                if (doc) {
                    newEntryToStore = utils.mergeUserRecord(doc, entry);
                    return self.db.updateAsync({_id: doc._id}, newEntryToStore, {});
                } else {
                    return Promise.reject("User does not Exist")
                }
            }).then(()=>newEntryToStore)
        } else {
            console.error("Cannot update/insert entry");
            console.error(entry);
            return Promise.reject("UserName not specified")
        }
    }
};

module.exports = new UserStore(utils.convertRelativeToAbsolutePath(config.userfile));
