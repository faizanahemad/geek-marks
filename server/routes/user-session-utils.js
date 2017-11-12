var crypto = require('crypto');
var config = require('config');
var Promise = require("bluebird");
var loginConfig = require('config').loginConfig;
var users = require("./model/user-store");

function doLoginPromise(req, res, next) {
    var creds = req.body;
    if (creds.email && creds.password) {
        return users.getOrCreateOneByEmail(creds.email, creds.password).then((user)=>{
            console.log(user)
            setSession(req, res, md5(user.name));
            return {email:user.name,created:user.created || false};
        })
    } else {
        return Promise.reject({error:"Provide both email and password for login"})
    }
}

function doLogin(req, res, next) {
    var creds = req.body;
    if (creds.email && creds.password) {
        users.getOneByEmail(creds.email, creds.password).then((user)=>{
            setSession(req, res, md5(user.name));
            res.redirect(loginConfig.loginSuccessRedirect);
        },()=>res.redirect(config.loginConfig.loginFailureRedirect))
    } else {
        res.redirect(config.loginConfig.loginFailureRedirect)
    }
}
function checkLoggedIn(req, res, next) {
    return isSessionValid(req)||isTokenValid(req);
}
function verifyLogin(req, res, next) {
    if (checkLoggedIn(req, res, next)||isWhiteListedURL(req, res)) {
        next();
    } else {
        logout(res,res,next);
        res.redirect('/login');
    }
}
function isTokenValid() {
    return false;
}
function logout(request, response, next) {
    response.clearCookie('_id');
    if(request.session && request.session.destroy) {
        request.session.destroy(function() {
            response.clearCookie('_id');
            response.redirect('/login');
        });
    }
}
function md5(name) {
    var hash = crypto.createHash('md5').update(name).digest('hex');
    return hash;
}
var getSHA512ofJSON = function(input){
    input = input || "";
    var hash=crypto.createHash('sha512').update(JSON.stringify(input)+config.salt).digest('hex');
    for (var i=1;i<= 16;i++) {
        hash = crypto.createHash('sha512').update(hash+config.salt).digest('hex')
    }
    return hash;
};
function setSession(req, res, id) {
    req.session.user_id = id;
    req.session.cookie._id = id;
    res.cookie('_id',id,{maxAge:config.session.sessionTimeOut});

}
function isSessionValid(request) {
    return (request.session && request.session.user_id);
}

function startsWith (path, pattern){
    return (path.indexOf(pattern) === 0);
}
/*
 * checks if the specified path is in starting of the any element of the specified list
 */
function anyStartsWith (path, list){
    for (var i=0; i < list.length; i++){
        if (startsWith(path, list[i]))
            return true;
    }
    return false;
}
/*
 * checks if path specified matches exactly with any path in the specified list
 */
function anyExactMatch (path, list){
    for (var i=0; i < list.length; i++){
        if (path === list[i])
            return true;
    }
    return false;
}
function isWhiteListedURL(request, response) {
    var path = request.path;

    return anyStartsWith(path, loginConfig.noLoginPathStartPathList) ||
           anyExactMatch(path, loginConfig.noLoginExactMatch) ||
           (!request.session && path=="/");
}

module.exports = {
    "verifyLogin":verifyLogin,
    "doLogin":doLogin,
    "logout":logout,
    "checkLoggedIn":checkLoggedIn,
    "md5":md5,
    "doLoginPromise":doLoginPromise
};
