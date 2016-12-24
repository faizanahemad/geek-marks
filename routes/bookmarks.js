'use strict';
var config = require('config');
var utils = require('./utils');

var store = require('./model/nedb-store');

module.exports = function(app) {

    app.get('/', function(req, res, next) {
        var userId = req.session.user_id;
        res.promise(store.getAll(userId));
    });
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
        var visitsGreaterThan = parseInt(query.visits_gte);
        var lastVisitedDaysWithin = parseInt(query.days_within);
        var lastVisitedDaysBeyond = parseInt(query.days_beyond);
        var search = query.search;
        var sortBy = utils.csvToArrayString(query.sort_by);
        var orderBy = utils.csvToArrayNumber(query.order_by);
        var sort = {};
        var min = Math.min(sortBy.length, orderBy.length);
        for (var i=0;i<min;i++) {
            sort[sortBy[i]] = orderBy[i];
        }
        var result = store.getAllByFilters(difficulties,
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
    app.post('/entry', function(req, res, next) {
        var userId = req.session.user_id;
        var storeInsert = store.insertOrUpdateEntry(req.body, userId);
        res.promise(storeInsert);
    });
    app.delete('/entry/:entryId', function(req, res, next) {
        var userId = req.session.user_id;
        var storeRemove = store.remove(req.params.entryId, userId);
        res.promise(storeRemove);
    })
};
