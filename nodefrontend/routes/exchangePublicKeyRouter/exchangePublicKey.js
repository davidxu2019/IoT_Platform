var fs = require('fs'); 
var https = require('https'); 
const ossl = require('openssl-wrapper')
var express = require('express');
var Promise = require("bluebird");
var httpsRequest = require("./httpsRequest");
var router = express.Router();

var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

/*
routes
*/

router.get('/', function(req,res) {
    let deviceId = req.query.id;
    getPublicKeyInPemPromise(req)
    .then(function(buffer) {
        return sendPublicKeyToDevice(buffer, deviceId);
    })
    .then(function(msg) { 
        res.send(JSON.stringify(msg));
    });
});
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
        key: fs.readFileSync('../certs/key.pem'), 
        cert: fs.readFileSync('../certs/cert.pem'), 
        passphrase: "passphrase",
        ca: [ fs.readFileSync('../certs/cert.pem') ],
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

module.exports = router;