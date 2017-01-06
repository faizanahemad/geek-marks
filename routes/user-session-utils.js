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
    var agentValidation = checkForUserAgentValidation(req);
    var sessionValidity = isSessionValid(req);
    var tokenValidity = isTokenValid(req);
    if (tokenValidity||(agentValidation && sessionValidity)) {
        return true
    } else {
        return false;
    }
}
function verifyLogin(req, res, next) {
    var isLoggedIn = checkLoggedIn(req, res, next);
    var isWhiteListed = isWhiteListedURL(req, res);
    if (isLoggedIn||isWhiteListed) {
        next();
    } else {
        clearCookies(res);
        res.redirect('/login');
    }
}
function isTokenValid() {
    return false;
}
function logout(request, response, next) {
    request.session.destroy(function() {
        response.clearCookie('is_login');
        response.clearCookie('username');
        response.clearCookie(config.session.secret);
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
function clearCookies(res) {
    res.clearCookie('is_login');
    res.clearCookie('username');
    res.clearCookie(config.session.secret);
};
function setSession(req, res, id) {
    req.session.is_login = true;
    req.session.user_id = id;
    req.session.type = config.session.name;
    req.session.userAgent = md5(req.headers['user-agent']);
    req.session.ipAddress = req.connection.remoteAddress||req.headers['x-forwarded-for']||req.headers['x-requester-ip'];
    req.session.timeOut = Date.now() + config.session.sessionTimeOut;
    req.session.cookie.maxAge = config.session.sessionTimeOut;
    req.session.cookie.expires = new Date(Date.now() + config.session.sessionTimeOut);
    req.session.cookie.is_login = true;
    req.session.cookie._id = id;
    res.cookie('username', req.body.username);
    res.cookie('_id',id);
    res.cookie('is_login', 'true');

}

function checkForCookieValidation(request) {
    return (ipAddressCheck(request) && !isConnectionDestroyed(request));
}
function isConnectionDestroyed(request) {
    if (request.connection) {
        if(request.connection.destroyed){
            console.logger.error('Request Connection Connection Destroyed');
            return true;
        }
        return false;
    } else{
        console.logger.error('Request Does Not Have Connection Object');
        return true;
    }
}
function ipAddressCheck(request) {
    var ipAddress = request.connection.remoteAddress||request.headers['x-forwarded-for']||request.headers['x-requester-ip'];
    if(!request.session.ipAddress){
        return false;
    }
    if (request.session.ipAddress != ipAddress) {

        return false;
    }
    return true;
}
function isSessionActive(sessionObject) {
    return (Date.now() < sessionObject.timeOut);
}
function isSessionValid(request) {
    return (request.session && request.cookies
            && (request.session.user_id === request.cookies._id)
            && checkForCookieValidation(request)
            && isSessionActive(request.session));
}


function checkForUserAgentValidation(request) {
    var requestUserAgent = md5(request.headers['user-agent']);
    return (requestUserAgent === request.session.userAgent);
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
           ((!(request.session && request.session.is_login) && path=="/"));
}

module.exports = {
    "verifyLogin":verifyLogin,
    "doLogin":doLogin,
    "doCreate":doCreate,
    "logout":logout,
    "checkLoggedIn":checkLoggedIn,
    "doLoginPromise":doLoginPromise
};
