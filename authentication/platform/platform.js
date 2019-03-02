var fs = require('fs'); 
var https = require('https'); 
const ossl = require('openssl-wrapper')
var express = require('express');
var Promise = require("bluebird");
var httpsRequest = require("../httpsRequest");

var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/*
routes
*/

app.get('/exchangePublicKey', function(req,res) {
    let deviceId = req.query.id;
    getPublicKeyInPemPromise(req)
    .then(function(buffer) {
        return sendPublicKeyToDevice(buffer, deviceId);
    })
    .then(function(msg) { 
        res.send(JSON.stringify(msg));
    });
});

app.post('/forward', function(req, res) {
    console.log("received");
    let postData = JSON.stringify({
       "msg": req.body.msg
    });
    forwardRequestForInfo(req.query.deviceId, postData)
    .then(function(msg) {
        res.send(JSON.stringify(msg));
    });
});

/*
server config
*/

var options = { 
    key: fs.readFileSync('key.pem'), 
    cert: fs.readFileSync('cert.pem'), 
    passphrase: "passphrase",
    requestCert: true, 
    rejectUnauthorized: true,
    ca: [ fs.readFileSync('../client/cert.pem') ] 
}; 
var httpsServer = https.createServer(options, app);
httpsServer.listen(4433);

/*
Helper functions
*/

function getPublicKeyInPemPromise(req) {
    let rawDer = req.connection.getPeerCertificate().raw;
    let func = Promise.promisify(ossl.exec);
    return func('x509', rawDer, { inform: 'der', outform: 'pem' });
}

// todo: implement this method
function getIp(deviceId) {
    return "localhost";
}

function sendPublicKeyToDevice(buffer, deviceId) {
    const publicKey = buffer.toString('utf8'); // PEM encoded public key safe to use now
    let postData = JSON.stringify({'msg': publicKey});
    let options = { 
        hostname: getIp(deviceId),
        port: 4444, 
        path: '/exchangePublicKey', 
        method: 'POST', 
        key: fs.readFileSync('key.pem'), 
        cert: fs.readFileSync('cert.pem'), 
        passphrase: "passphrase",
        ca: [ fs.readFileSync('../device/cert.pem') ],
        headers: {
           'Content-Type': 'application/json',
           'Content-Length': postData.length
        },
        // avoid cache session so that getPublicKeyInPemPromise, may affect performance
        agent: new https.Agent({ 
            maxCachedSessions: 0
        }),
    }; 
    return httpsRequest.sendRequest(options, postData);
}

function forwardRequestForInfo(deviceId, postData) {
    let options = { 
        hostname: getIp(deviceId),
        port: 4444, 
        path: '/info', 
        method: 'POST', 
        key: fs.readFileSync('key.pem'), 
        cert: fs.readFileSync('cert.pem'), 
        passphrase: "passphrase",
        ca: [ fs.readFileSync('../device/cert.pem') ],
        headers: {
           'Content-Type': 'application/json',
           'Content-Length': postData.length
        },
    }; 
    return httpsRequest.sendRequest(options, postData);
}