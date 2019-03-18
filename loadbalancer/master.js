var fs = require('fs'); 
var express = require('express');
var heartbeat = require('./heartbeat');
var https = require('https');

var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/**
properties
*/
var slaves = ['https://localhost:8433'];
// var slaves = [];

/**
send heartbeats to all slaves
*/

setInterval(function() {
	heartbeat.broadcastHeartBeats(slaves);
}, 5*1000);

/**
routes
*/
app.post('/register', function(req, res) {
	let serverIp = 'https://' + req.ip + ':8433';
	console.log(serverIp);
	if (slaves.indexOf(serverIp) == -1) {
		heartbeat.addSlaveAndNotifyLoadBalancer(serverIp, slaves);
		res.json({'mes': serverIp + ' is registered'});
	} else {
		res.json({'mes': serverIp + ' has been registered before'});
	}
})

app.get('/', function(req, res) {
	res.json({'slaves': slaves});
});

/**
server config
*/

var options = { 
    key: fs.readFileSync('key.pem'), 
    cert: fs.readFileSync('cert.pem'), 
    passphrase: "passphrase",
    requestCert: true, 
    rejectUnauthorized: true,
    ca: [ fs.readFileSync('../nodefrontend/cert.pem') ] // slaves' cert
}; 
console.log('HEY');
var httpsServer = https.createServer(options, app);
httpsServer.listen(5433, '127.0.0.1');

/**
Helper functions
*/



