var crypto = require('crypto');
var config = require('config');
var Promise = require("bluebird");
var loginConfig = require('config').loginConfig;
var users = require("./model/user-store");
function doCreate(req, res, next) {
    var creds = req.body;
    if (creds.email && creds.password) {
        creds.password = getSHA512ofJSON(creds.password);
        var userCreatePromise =  users.insertUser(creds)
            .then((user)=> {
                setSession(req, res, user._id);
                res.send({});
            }, (msg)=> {
                return Promise.reject({error: msg})
            });
        res.promise(userCreatePromise);
    } else {
        res.promise(Promise.reject({error: "Insufficient data for User Creation"}));
    }

}

function doLoginPromise(req, res, next) {
    var creds = req.body;
    creds.password = getSHA512ofJSON(creds.password);
    if (creds.email && creds.password) {
        return users.getOrCreateOneByEmail(creds.email, creds.password).then((user)=>{
            setSession(req, res, user._id);
            return {email:user.email,created:user.created || false};
        })
    } else {
        return Promise.reject({error:"Provide both email and password for login"})
    }
}

function doLogin(req, res, next) {
    var creds = req.body;
    creds.password = getSHA512ofJSON(creds.password);
    if (creds.email && creds.password) {
        users.getOneByEmail(creds.email, creds.password).then((user)=>{
            setSession(req, res, user._id);
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
    request.session.destroy(function() {
        response.clearCookie('_id');
        response.redirect('/login');
    });
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
    res.cookie('_id',id);

}
function isSessionValid(request) {
    return (request.session && request.cookies
            && request.session.user_id === request.cookies._id);
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
    "doCreate":doCreate,
    "logout":logout,
    "checkLoggedIn":checkLoggedIn,
    "doLoginPromise":doLoginPromise
};
