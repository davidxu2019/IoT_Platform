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
        return sendPublicKeyToDevice(buffer, deviceId, req.db);
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
async function getIp(db, deviceId) {
    query = {"deviceID": toDeviceID};
    let devices = await dbo.collection("Devices").find(query).toArray();
    if (devices && devices.length > 0) {
        return devices[0].IP;
    }
}

function sendPublicKeyToDevice(buffer, deviceId, db) {
    const publicKey = buffer.toString('utf8'); // PEM encoded public key safe to use now
    let postData = JSON.stringify({'msg': publicKey});
    let options = { 
        hostname: getIp(db, deviceId),
        port: 4444, 
        path: '/exchangePublicKey', 
        method: 'POST', 
        key: fs.readFileSync('key.pem'), 
        cert: fs.readFileSync('cert.pem'), 
        passphrase: "passphrase",
        ca: [ fs.readFileSync('system_test/device/cert.pem') ],
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