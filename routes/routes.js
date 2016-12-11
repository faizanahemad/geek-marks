'use strict';
var jsonfile = require('jsonfile');
var CSet = require("collections/set");
var Map = require("collections/map");
function persist(data, file) {
    jsonfile.writeFile(file, data, {spaces: 2}, function(err) {
        console.error(err)
    });
}

module.exports = function(app) {
    var file = process.cwd()+"/history.json";
    var hrefSet = new CSet();
    var tagSet = new CSet();
    var pathnameSet = new CSet();
    var hrefMap = new Map();
    var tagHrefMap = new Map();
    var locationData = jsonfile.readFileSync(file);
    locationData.forEach((e)=> {
        pathnameSet.add(e["pathname"]);
        hrefSet.add(e["href"]);
        hrefMap.set(e["href"],e);
        if (e.tags && e.tags instanceof Array) {
            e.tags.forEach(t=>{
                tagSet.add(t)
                var linkArr = tagHrefMap.get(t) || [];
                linkArr.push(e);
                tagHrefMap.set(t, linkArr);
            });
        }
    });
    app.get('/', function(req, res, next) {
        res.send(locationData);
    });
    app.get('/tags', function(req, res, next) {
        res.send(Array.from(tagSet));
    });
    app.get('/search', function(req, res, next) {
        res.send({});
    });
    app.post('/', function(req, res, next) {
    	console.log(req.body);
    	var cld = req.body;
        cld.lastVisited = (new Date()).getTime();
    	if(!hrefSet.has(cld.href)){
    	    cld["visits"] = 1;
            cld.notes = cld.notes || [];
            cld.tags = cld.tags || [];
            cld.tags.forEach(t=>{
                tagSet.add(t);
                var linkArr = tagHrefMap.get(t) || [];
                linkArr.push(cld);
                tagHrefMap.set(t, linkArr);
            });
			locationData.push(cld);
            pathnameSet.add(cld["pathname"]);
            hrefSet.add(cld["href"]);
            hrefMap.set(cld["href"],cld);
    	} else {
    	    var storedVar = hrefMap.get(cld.href);
            storedVar["lastVisited"] = cld.lastVisited;
            storedVar["visits"] = storedVar["visits"]+1;

            storedVar.title = cld.title || storedVar.title || "";
            storedVar.difficulty = cld.difficulty || storedVar.difficulty;
            storedVar.notes = cld.notes || storedVar.notes || [];
            storedVar.tags = cld.tags || storedVar.tags || [];
            storedVar.tags.forEach(t=>{
                tagSet.add(t);
                var linkArr = tagHrefMap.get(t) || [];
                if (linkArr.filter((e)=>e.href===storedVar.href).size==0) {
                    linkArr.push(storedVar);
                }
                tagHrefMap.set(t, linkArr);
            });
        }
        jsonfile.writeFile(file, locationData, {spaces: 2}, function(err) {
            console.error(err)
        });
        res.send({});
    })
};
