var express = require('express');
var https = require('https');
var fs = require('fs'); 
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var request = require('request');
var requestPromise = require('request-promise');
var serverManagement = require('./serverManagement');

var app = express();

/**
* Global variables. TODO: change all properties into config files
*/
var masterURL = 'https://cs219master.dynu.net:5433';
var masterQuerySlaveRoute = '/';

/**
 * Get port from environment and store in Express.
 */
var port = normalizePort(process.env.PORT || '4433');
app.set('port', port);

/**
* Routes
*/
let parser = express.urlencoded({ extended: false });
let jsonParser = bodyParser.json();

app.get('/servers', function(req, res) {
  res.json({'servers' : serverManagement.getAllServers()});
});

app.post('/serversChange', parser, jsonParser, function(req, res) {
  if (req.body.newServers) {
    let newServers = req.body.newServers;
    newServers.forEach(function(serverIp) {
      serverManagement.addServer(serverIp);
    });    
  }
  if (req.body.removeServers) {
    let removeServers = req.body.removeServers;
    removeServers.forEach(function(serverIp) {
      serverManagement.removeServer(serverIp);
    });    
  }
  res.send(JSON.stringify(serverManagement.getAllServers()));
});


app.all('*', function(req, res) {
  let url = serverManagement.getServer(req);
  if (!url) {
    res.status(500).json({'mes': 'all servers down'});
    return;
  }
  console.log(url);
  console.log('LoadBalancer:' + 'received route "' + req.url + '"');
  let options = { 
    url: url + req.url, 
    method: req.method, 
    key: fs.readFileSync('../certs/key.pem'), 
    cert: fs.readFileSync('../certs/cert.pem'), 
    passphrase: "passphrase",
    ca: [ fs.readFileSync('../certs/cert.pem') ],
    qs: req.query
  }; 
  req.pipe(request(options, function(err, slaveRes, body) {
    if (err) {
      res.json({'mse': err});
    }
  })).pipe(res);
});



/**
 * Create HTTPS server.
 */

var options = { 
    key: fs.readFileSync('../certs/key.pem'), 
    cert: fs.readFileSync('../certs/cert.pem'), 
    passphrase: "passphrase",
    requestCert: true, 
    rejectUnauthorized: true,
    ca: [ 
      fs.readFileSync('../certs/cert.pem')
    ], 
}; 
var server = https.createServer(options, app);
server.listen(port, getSlaveServers);

/**
 * Listen on provided port, on all network interfaces.
 */

server.on('error', onError);
server.on('listening', onListening);


async function getSlaveServers() {
  let options = { 
    url: masterURL + masterQuerySlaveRoute,
    method: 'GET', 
    key: fs.readFileSync('../certs/key.pem'), 
    cert: fs.readFileSync('../certs/cert.pem'), 
    passphrase: "passphrase",
    ca: [ fs.readFileSync('../certs/cert.pem') ],
  }; 
  try {
    let body = await requestPromise(options);
    let slaves = await JSON.parse(body).slaves
    slaves.forEach(function(slave) {
      serverManagement.addServer(slave);
      console.log('Added slave server ' + slave + ' into hash ring');
    })
  } catch(err) {
    console.log(err); 
  }
}

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
}
