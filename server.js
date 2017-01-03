'use strict';
console.log("DIRECTORY = ", __dirname);
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

var express = require('express'),
    config = require('config'),
    http = require('http');

var fs = require('fs');
var userSession = require("./routes/user-session-utils");
var compression = require('compression');
var https = require('https');
var privateKey  = fs.readFileSync('localhost.key', 'utf8');
var certificate = fs.readFileSync('localhost.cert', 'utf8');

var credentials = {key: privateKey, cert: certificate};

// your express configuration here


var app = express();
var staticDirectory = __dirname + '/public';

(function middlewareSetup(app) {
    app.use(compression({filter: (res, resp)=>true}));
    app.use(express.static(staticDirectory));
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Content-Range, Content-Disposition, Content-Description");
        res.header("Access-Control-Allow-Credentials", true);
        res.header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
        res.header('Access-Control-Max-Age: 1000000');
        next();
    });
    var session = require('express-session');
    var cookieParser = require('cookie-parser');
    app.use(cookieParser(config.session.secret));
    app.use(session({
                        secret: config.session.secret,
                        name: config.session.name,
                        resave: false,
                        saveUninitialized: false,
                        cookie: { secure: false,maxAge:config.session.sessionTimeOut}
                    }));
    app.use(function promiseify(request, response, next) {
        response.promise = function(promise) {
            promise.then(function(result) {
                response.send(result);
            }).catch(function(error) {
                response.status(500).send(error);
            });
        };

        next();
    })
    var multer = require('multer'),
        bodyParser = require('body-parser');
    app.use(userSession.verifyLogin);
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(function(req, res, next) {
        req._startTime = new Date().getTime();
        next();
    })
})(app);
(function appDefault(app) {
    app.set('port', process.env.NODE_PORT ||config.serverConfig.port|| 8000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view cache', true);
})(app);
(function appRoutes(app) {
    require('./routes/routes')(app);
})(app);
var server = http.createServer(app).listen(app.get('port'));
var httpsServer = https.createServer(credentials, app).listen((app.get('port')+1),function() {
    console.log('Express https server listening on port: ' + (app.get('port')+1))
});
