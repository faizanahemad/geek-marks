'use strict';
var utils = require('./utils');
var Promise = require("bluebird");
var SortedSet = require("collections/sorted-set");

var store = require('./model/nedb-store');
var syncStore = require('./model/sync-store');

module.exports = function(app) {

    app.get('/', function(req, res, next) {
        var userId = req.session.user_id;
        var sort = {"difficulty":-1,"lastVisited":-1,"visits":-1};
        res.promise(store.getAll(userId,sort));
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
        var storeInsert = store.insertOrUpdateEntry(req.body, userId).then(data=>{
            var doc = data[0];
            var incr = 0;
            if (data[1]) {
                incr = 1
            }
            syncStore.logChange(userId,[doc._id], incr);
            return doc;
        });
        res.promise(storeInsert);
    });
    app.put('/visit/:entryId', function(req, res, next) {
        var userId = req.session.user_id;
        var markVisit = store.logVisit(req.params.entryId, userId);
        res.promise(markVisit);
    });
    app.delete('/entry/:entryId', function(req, res, next) {
        var userId = req.session.user_id;
        var storeRemove = store.remove(req.params.entryId, userId).then(id=>{
            syncStore.logChange(userId,[id],-1)
        });
        res.promise(storeRemove);
    });

    app.post('/sync', function(req, res, next) {
        var userId = req.session.user_id;
        var version =  req.body.version;
        var finalResult = syncStore.getChangedIds(userId,version).then(vdata=>{
            var changeIds = (new SortedSet(vdata.changeIds)).toArray();
            var data = [];
            if(changeIds.length>0) {
                data = store.getByIds(changeIds.toArray());
            }
            return Promise.join(data,vdata);
        });
        var f3 = finalResult.then((data)=>{
            var meta = data[1];
            data = data[0]
            var cIdsSet = new SortedSet(meta.changeIds);
            var deleted = cIdsSet.difference(data.map(d=>d._id));
            return {
                deleted:deleted.toArray(),
                modified:data,
                version:meta.version,
                clientVersion:version,
                changeIds:meta.changeIds,
                hasNext:meta.hasNext,
                total:meta.total
            }
        });
        res.promise(f3);
    });
};
