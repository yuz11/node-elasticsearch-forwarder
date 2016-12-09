var cluster = require('cluster');
var path = require('path');
var numCPUs = require('os').cpus().length;
var isInit = false;

var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//Http Req Handler
function register_handler(app) {
	app.post('/', function(req, res) {
		console.log(new Date().toLocaleString());
		console.log(req.body);
		var esLogger = require('./esLogger');
		var resCode = esLogger.es_log(req.body);
		res.sendStatus(resCode);
	});
}

//Main
if (cluster.isMaster) {
	var worker = null;
	// Fork workers.
	for (var i = 0; i < numCPUs; i++) {
		worker = cluster.fork();
	}

	cluster.on('exit', function(worker, code, signal) {
		console.log('worker ' + worker.process.pid + ' died');
		//重启worker进程
		worker = cluster.fork();
	});

} else {
	var app = express();

	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'jade');
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: false
	}));
	app.use(cookieParser());
	app.use(express.static(path.join(__dirname, 'public')));

	register_handler(app); //@Rafer Routes Add Here

	var config = require('./config')
	app.listen(config.http_listen_port);
}