var fs = require('fs'); 
var express = require('express');
var heartbeat = require('./heartbeat');
var https = require('https');
var os = require('os');

var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/**
properties
*/
var slaves = [];

/**
send heartbeats to all slaves
*/

// setInterval(function() {
// 	heartbeat.broadcastHeartBeats(slaves);
// }, 5*1000);

/**
routes
*/
app.post('/register', function(req, res) {
	if (!req.query.hostname) {
		console.log('here');
		res.status(404).json({'mes': 'no hostname provided'});
		return;
	}
	let serverURL = 'https://' + req.query.hostname + ':8433';
	if (slaves.indexOf(serverURL) == -1) {
		heartbeat.addSlaveAndNotifyLoadBalancer(serverURL, slaves);
		res.json({'mes': serverURL + ' is registered'});
	} else {
		res.json({'mes': serverURL + ' has been registered before'});
	}
})

app.get('/', function(req, res) {
	res.json({'slaves': slaves});
});

/**
server config
*/

var options = { 
    key: fs.readFileSync('../certs/key.pem'), 
    cert: fs.readFileSync('../certs/cert.pem'), 
    passphrase: "passphrase",
    requestCert: true, 
    rejectUnauthorized: true,
    ca: [ 
    	fs.readFileSync('../certs/cert.pem'),  // slaves' cert
    ] 
}; 
var httpsServer = https.createServer(options, app);
httpsServer.listen(5433);

/**
Helper functions
*/



