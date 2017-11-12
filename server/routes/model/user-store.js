var config = require('config');
var utils = require('../utils');
var Promise = require("bluebird");
var _ = require('lodash');
var couch = require('./couch-store')['couch']
var admin = require('./couch-store')['admin']


var CouchUserStore = class CouchUserStore {
    constructor() {
        this.db = couch.use('_users')
        this.session = couch.use("_session")
        // this.admin = admin
        Promise.promisifyAll(this.db);
        Promise.promisifyAll(this.session);
    }

    getOrCreateOneByEmail(email, password) {
        var self = this;
        return this.getOneByEmail(email,password).catch(err=>{
            console.log(err)
            return self.insertUser({email:email,password:password})
        })

        // return this.admin.verifyUser(email,password,console.log)
    }

    getOneByEmail(email, password) {
        return this.session.insertAsync({'name':email,'password':password})
    }

    insertUser(entry) {

        var self = this;
        var query = {};
        if (entry.email && entry.password) {
            var email = entry.email
            var password = entry.password
            var _id = "org.couchdb.user:"+email
            var data = {_id:_id,"name": email, "password": password, "roles": [], "type": "user"}
            return self.db.insertAsync(data).then(data=>{
                data.name = email
                data.created = true
                return data;
            })
            .catch(err=>{
                console.error(err);
                return Promise.reject("User Already Exists")
            })
        } else {
            console.error("Cannot insert user");
            console.error(entry);
            return Promise.reject("Insufficient data for User Creation");
        }

    }
}

module.exports = new CouchUserStore()
