var express     = require('express'),

    app         = express(),
    server      = require('http').createServer(app),

    cons        = require('consolidate'),
    swig        = require('swig'),

    browserify  = require('browserify'),
    chromeframe = require('express-chromeframe'),
    geoip       = require('express-cf-geoip'),

    stylus      = require('stylus'),
    nib         = require('nib'),

    net         = require('net'),
    fs          = require('fs'),

    config      = JSON.parse(fs.readFileSync(__dirname + '/config.json'));

app.set('port', process.env.PORT || 3000);

app.configure(function() {
	app.engine('.html', cons.swig);
	app.set('view engine', 'html');

	swig.init({
		root: app.get('views'),
		allowErrors: true,
		cache: false
	});

	app.use(chromeframe());
	app.use(express.favicon(__dirname + '/public/favicon.ico'));
	app.use(express.cookieParser(config.cookieSecret));
	app.use(express.session({ secret: config.sessionSecret }));

	app.use(
		browserify({
			watch: true,
			require: {
				jquery: 'jquery-browserify'
			}
		})
		.addEntry(__dirname + '/scripts/index.js')
	);

	app.use(stylus.middleware({
		src:  __dirname + '/styles',
		dest: __dirname + '/public/assets',
		compile: function(str, path) {
			return stylus(str)
				.set('filename', path)
				.set('compress', false)
				//.set('linenos', true)
				.use(nib());
		}
	}));

	app.use(function(req, res, next) { req.realip = req.header('cf-connecting-ip') || req.ip; next(); });
	app.use(geoip.middleware('gb'));

	app.use(app.router);

	app.use(express.static(__dirname + '/public/assets'));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

fs.readdirSync(__dirname + '/routes').forEach(function(file) {
	var routes = require(__dirname + '/routes/' + file);

	Object.keys(routes).forEach(function(route) {
		if (typeof routes[route] == 'function')
			app.get(route, routes[route]);

		if (routes.hasOwnProperty(route)) {
			Object.keys(routes[route]).forEach(function(method) {
				if (routes[route].hasOwnProperty(method))
					app[method](route, routes[route][method]);
			});
		}
	});
});

server.listen(app.get('port'), function() {
	console.log('Server listening on port', app.get('port'));
});