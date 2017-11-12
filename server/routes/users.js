'use strict';
var config = require("config");
var userSessionUtils = require("./user-session-utils");


module.exports = function(app) {
    var loginConfig = require('config').loginConfig;
    app.get('/logout', userSessionUtils.logout);
    app.get('/login', (req, res, next)=>{
        res.redirect(loginConfig.loginFailureRedirect)
    });
    app.post('/login', userSessionUtils.doLogin);
    app.post('/login_api',(req,res,next)=> {
        res.promise(userSessionUtils.doLoginPromise(req, res, next))
    });
    app.get('/check_login',(req, res, next)=> {
        if (userSessionUtils.checkLoggedIn(req,res,next)) {
            res.status(200).send({is_login:true})
        } else {
            res.status(401).send({is_login:false})
        }
    });
    app.get('/bookmark', function(req, res, next) {
        res.send({});
    });
};
