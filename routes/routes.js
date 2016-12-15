'use strict';
var NedbStoreClass = require('./nedb-store');
var config = require('config');
var utils = require('./utils');

var store = new NedbStoreClass(utils.convertRelativeToAbsolutePath(config.datafile));

module.exports = function(app) {

    app.get('/', function(req, res, next) {
        res.promise(store.getAll());
    });
    app.get('/tags', function(req, res, next) {
        res.promise(store.getAllTags());
    });
    app.get('/difficulty', function(req, res, next) {
        var difficulties = [];
        if (req.query.q && typeof req.query.q==="string") {
            var query = req.query.q+"";
            difficulties = utils.csvToArrayNumber(query)
        }
        res.promise(store.getByDifficulties(difficulties));
    });
    app.get('/search', function(req, res, next) {
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
                                           sort);
        res.promise(result)
    });
    app.post('/', function(req, res, next) {
        var storeInsert = store.insertOrUpdateEntry(req.body)
        res.promise(storeInsert);
    })
};
