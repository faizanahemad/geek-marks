'use strict';
var utils = require('./utils');
var Promise = require("bluebird");
var SortedSet = require("collections/sorted-set");

var store = require('./model/couch-store')['couchStore'];

module.exports = function(app) {

    app.get('/tags', function(req, res, next) {
        var userId = req.session.user_id;
        var collections = utils.csvToArrayString(req.query.collections);
        res.promise(store.getAllTags(userId,collections));
    });
    app.get('/collections', function(req, res, next) {
        var userId = req.session.user_id;
        res.promise(store.getAllCollections(userId));
    });
    app.get('/autocompletions', function(req, res, next) {
        var userId = req.session.user_id;
        res.promise(store.getAutocompletions(userId));
    });
    app.post('/autocompletions', function(req, res, next) {
        var userId = req.session.user_id;
        var body = req.body
        res.promise(store.storeAutocompletions(body,userId));
    });
    app.get('/search', function(req, res, next) {
        var userId = req.session.user_id;
        var query = req.query;
        var difficulties = utils.csvToArrayNumber(query.difficulty);
        var hostnames = utils.csvToArrayString(query.hostnames);
        var tags = utils.csvToArrayString(query.tags);
        var collections = utils.csvToArrayString(query.collections);
        var useless = query.useless;
        var visitsGreaterThan = parseInt(query.visits_gte);
        var lastVisitedDaysWithin = parseInt(query.days_within);
        var lastVisitedDaysBeyond = parseInt(query.days_beyond);
        var search = query.search;
        var tags_or = query.tags_or;
        var sortBy = utils.csvToArrayString(query.sort_by);
        // order_by denotes whether sort order is asc or descending
        var orderBy = utils.csvToArrayNumber(query.order_by);
        var sort = [];
        var min = Math.min(sortBy.length, orderBy.length);
        for (var i=0;i<min;i++) {
            var sorter = {}
            sorter[sortBy[i]] = orderBy[i];
            sort.push(sorter)
        }
        if(sort.length===0){
            sort.push({"lastVisited":-1})
        }
        var result = store.getAllByFilters(difficulties,
                                           useless,
                                           hostnames,
                                           tags,
                                           tags_or,
                                           collections,
                                           visitsGreaterThan,
                                           lastVisitedDaysWithin,
                                           lastVisitedDaysBeyond,
                                           search,
                                           sort,
                                           userId);
        res.promise(result)
    });
    app.delete('/entry/:entryId', function(req, res, next) {
        var userId = req.session.user_id;
        var storeRemove = store.remove(req.params.entryId, userId)
        res.promise(storeRemove);
    });
};
