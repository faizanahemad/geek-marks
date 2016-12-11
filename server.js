'use strict';
console.log("DIRECTORY = ", __dirname);
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

var express = require('express'),
    config = require('config'),
    http = require('http');

var fs = require('fs');
var compression = require('compression');
var https = require('https');
var privateKey  = fs.readFileSync('localhost.key', 'utf8');
var certificate = fs.readFileSync('localhost.cert', 'utf8');

var credentials = {key: privateKey, cert: certificate};

// your express configuration here


var app = express();

(function middlewareSetup(app) {
    app.use(compression({filter: (res, resp)=>true}));
    app.use(express.static(__dirname + '/public'));
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    var session = require('express-session'),
        cookieParser = require('cookie-parser'),
        multer = require('multer'),
        bodyParser = require('body-parser');
    app.use(multer());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser('myCookieSecret'));
    app.use(function(req, res, next) {
        req._startTime = new Date().getTime();
        next();
    })
})(app);
(function appDefault(app) {
    app.set('port', process.env.NODE_PORT || 8000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view cache', true);
})(app);
(function appRoutes(app) {
    require('./routes/routes')(app);
})(app);
var server = http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port: ' + app.get('port'))
});
var httpsServer = https.createServer(credentials, app).listen(8443);
