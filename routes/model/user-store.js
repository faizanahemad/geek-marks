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
        this.db.ensureIndex({fieldName: 'email', unique: true});
    }

    getAll() {
        return this.db.findAsync({}).then((d)=>d, console.error);
    }
    getOrCreateOneByEmail(email, password) {
        var self = this;
        return this.db.findOneAsync({email:email,password:password}).then((doc)=>{
            if (doc){
                return Promise.resolve(doc)
            } else {
                return this.db.findOneAsync({email:email}).then((doc)=>{
                    if(doc) {
                        return Promise.reject({error:"Incorrect Password!"})
                    } else {
                        return self.insertUser({email:email,password:password}).then((user)=>{
                            user.created = true;
                            return user;
                        })
                    }
                });
            }
        }, (err)=>{
            console.error(err);
            return Promise.reject({error:"Server Error."});
        });
    }

    getOneByEmail(email, password) {
        var self = this;
        return this.db.findOneAsync({email:email,password:password}).then((doc)=>{
            if (doc){
                return Promise.resolve(doc)
            } else {
                return this.db.findOneAsync({email:email}).then((doc)=>{
                    if(doc) {
                        return Promise.reject({error:"Incorrect Password!"})
                    } else {
                        return Promise.reject({error:"Both email and username needed"})
                    }
                });
            }
        }, (err)=>{
            console.error(err);
            return Promise.reject({error:"Server Error."});
        });
    }

    insertUser(entry) {
        var self = this;
        var query = {};
        if (entry.email && entry.password) {
            query = {email: entry.email};
            return this.db.findOneAsync(query).then((doc)=> {
                if (doc) {
                    console.error("User Already Exists");
                    console.error(entry);
                    return Promise.reject("User Already Exists");
                } else {
                    return self.db.insertAsync(entry)
                }
            })
        } else {
            console.error("Cannot insert user");
            console.error(entry);
            return Promise.reject("Insufficient data for User Creation");
        }
    }

    updateUser(entry) {
        var newEntryToStore = entry;
        var self = this;
        var query = {};
        if (entry.email) {
            query = {email: entry.email};
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
            return Promise.reject("Email not specified")
        }
    }
};

module.exports = new UserStore(utils.convertRelativeToAbsolutePath(config.userfile));
