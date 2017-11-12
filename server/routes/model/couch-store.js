var couch = require('nano')('http://localhost:5984')
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

module.exports = {couch:couch,admin:admin};