var config = require('config');
module.exports = function(app) {
	// if no path is specified then this will be used
    var loginConfig = config.loginConfig;
    app.get('/', function(req, res, next) {
        res.redirect(loginConfig.loginSuccessRedirect);
    });
    app.post('/',function(req,res,next){
    	console.logger.error("POST not allowed on url: \'/\'");
    	res.send(403);
    });
    // if no path is specified then this will be used
    app.use('/index', function(req, res, next) {
        res.redirect('/');
    });

    app.get("/health",function (req, res, next) {
        res.sendStatus(204);
    });
    // other common routes except the ones specified above should go in separate files in common folder
};
