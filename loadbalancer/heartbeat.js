var requestPromise = require("request-promise");
var request = require("request");
var async = require("async");
var fs = require('fs'); 
var util = require('util');

var heartbeatRoute = '/heartbeat';
var loadBalancerServerChangeRoute = '/serversChange';
var loadBalancerURL = 'https://cs219iotplatform.dynu.net:4433';


/**
* @params slaves: a list of slave urls
*/
function broadcastHeartBeats(slaves) {
	slaves.forEach(function(ip) {
		sendWithRetries(ip, 3, slaves);
	});
}

function getSlaves() {
	return slaves;
}

/*
Helper functions
*/

function sendWithRetries(ip, n, slaves) {
	let url = ip + heartbeatRoute;
  let options = { 
    url: url,
    method: 'GET', 
    key: fs.readFileSync('../certs/key.pem'),  // key and cert has to be the same as that under `../nodefrontend/system_test/application/key.pem`
    cert: fs.readFileSync('../certs/cert.pem'), 
    passphrase: "passphrase",
    ca: [ fs.readFileSync('../certs/cert.pem') ],
  }; 
  async.retry({times: n, interval: 300}, async function() {
  	return sendRequest(url)
  }, function(err, result) {
  	if (err) {
  		console.log(ip + ' is removed');
  		removeSlaveAndNotifyLoadBalancer(ip, slaves);
  	}
  	// TODO: deal with the data sent by slaves (currently we only care about errors)
  });
}

function addSlaveAndNotifyLoadBalancer(ip, slaves) {
	slaves.push(ip);
	notifyLoadBalancer([ip], []);
}

function removeSlaveAndNotifyLoadBalancer(ip, slaves) {
	var index = slaves.indexOf(ip);
	if (index > -1) {
  	slaves.splice(index, 1);
	}
	notifyLoadBalancer([], [ip]);
}

function notifyLoadBalancer(newServers, removeServers) {
  console.log(loadBalancerURL + loadBalancerServerChangeRoute);
	let options = { 
    url: loadBalancerURL + loadBalancerServerChangeRoute,
    method: 'POST', 
    body: {
    	'newServers': newServers, 
    	'removeServers': removeServers
    },
    json: true,
    key: fs.readFileSync('../certs/key.pem'),
    cert: fs.readFileSync('../certs/cert.pem'), 
    passphrase: "passphrase",
    ca: [ fs.readFileSync('../certs/cert.pem') ], // cert for loadBalancer
  }; 
	request(options, function(err, res, body) {
    if (err) {
      console.log(err);  
    } else {
      console.log(body);
    }
  }); // TODO: handle response from loadbalancer
}

async function sendRequest(url) {
	let options = { 
    url: url,
    method: 'GET', 
    key: fs.readFileSync('../certs/key.pem'),  
    cert: fs.readFileSync('../certs/cert.pem'), 
    passphrase: "passphrase",
    ca: [ fs.readFileSync('../certs/cert.pem') ],
  }; 
  return await requestPromise(options);
}

module.exports = {
	getSlaves, 
	broadcastHeartBeats,
	addSlaveAndNotifyLoadBalancer,
	removeSlaveAndNotifyLoadBalancer
}



