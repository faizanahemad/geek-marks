'use strict';
var utils = require('./utils');
var Promise = require("bluebird");
var SortedSet = require("collections/sorted-set");

var store = require('./model/couch-store')['couchStore'];

module.exports = function(app) {

    app.get('/tags', function(req, res, next) {
        var userId = req.session.user_id;
        res.promise(store.getAllTags(userId));
    });
    app.get('/search', function(req, res, next) {
        var userId = req.session.user_id;
        var query = req.query;
        var difficulties = utils.csvToArrayNumber(query.difficulty);
        var hostnames = utils.csvToArrayString(query.hostnames);
        var tags = utils.csvToArrayString(query.tags);
        var useless = query.useless;
        var visitsGreaterThan = parseInt(query.visits_gte);
        var lastVisitedDaysWithin = parseInt(query.days_within);
        var lastVisitedDaysBeyond = parseInt(query.days_beyond);
        var search = query.search;
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
        var result = store.getAllByFilters(difficulties,
                                           useless,
                                           hostnames,
                                           tags,
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
