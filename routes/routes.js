'use strict';
module.exports=function(app) {
    var express = require('express');
    // mini apps
    // to have separate middleware stack for each app
    var login = express.Router();
    var bookmarks = express.Router();
    var common = express.Router();
    require('./users')(login);
    // these apps cater to http requests of particular angular UI app
    require('./bookmarks')(bookmarks);
    // this app caters to requests that cannot be classified in any other way.
    require('./common')(common);

    app.use(common);
    app.use(login);
    app.use('/bookmarks',bookmarks);
};
