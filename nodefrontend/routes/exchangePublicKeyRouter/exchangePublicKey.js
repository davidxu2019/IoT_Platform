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

router.get('/:deviceID', function(req,res) {
    handleRequest(req, res);
});

/*
Helper functions
*/

async function handleRequest(req, res) {
    let deviceId = req.params.deviceID;
    try {
        let buffer = await getPublicKeyInPemPromise(req);
        let msg = await sendPublicKeyToDevice(buffer, deviceId, req.db); // msg is a json object
        res.json(msg);
    } catch(err) {
        console.log(err);
        res.status(422).json({'error': err.message});
    }    
}

function getPublicKeyInPemPromise(req) {
    let rawDer = req.connection.getPeerCertificate().raw;
    let func = Promise.promisify(ossl.exec);
    return func('x509', rawDer, { inform: 'der', outform: 'pem' });
}

async function getIp(db, deviceId) {
    query = {"deviceID": deviceId};
    let devices = await db.collection("Devices").find(query).toArray();
    if (devices && devices.length > 0) {
        console.log("=========");
        console.log(devices[0].IP);
        console.log(typeof(devices[0].IP));
        console.log("=========");
        return devices[0].IP;
    } else {
        throw new Error("Not such device exists");
    }
}

async function sendPublicKeyToDevice(buffer, deviceId, db) {
    const publicKey = buffer.toString('utf8'); // PEM encoded public key safe to use now
    let postData = JSON.stringify({'msg': publicKey});
    let options = { 
        hostname: await getIp(db, deviceId),
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