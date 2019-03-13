let express = require('express');
let router = express.Router();
let httpsRequest = require('./exchangePublicKeyRouter/httpsRequest');
let jwt = require('jsonwebtoken');
const assert = require('assert');
let fs = require('fs'); 

router.all('/:username/:deviceID', function(req, res, next) {
    console.log("checking cookie");
    console.log(req.cookies);
    if(req.cookies.jwt == null){
        res.status(401).json({mes:"unauthenticated"});
    }
    else{
        try {
            let token = jwt.verify(req.cookies.jwt, "C-UFRaksvPKhx1txJYFcut3QGxsafPmwCY6SCly3G6c");
            let username = token.usr;
            let exp = token.exp * 1000;
            let iat = token.iat;
            let query = {"username": username};
            let dbo = req.db;
            dbo.collection("Users").find(query).toArray(function (err, user) {
                if (username == req.params.username && exp > Date.now() && iat == user[0].iat) {
                    next();
                }
                else {
                    console.log("unauthenticated 2!");
                    res.status(401).json({mes:"unauthenticated"});
                }
            });
        }catch(err){
            res.status(401).send(err);
        }
    }
});

router.post('AD/:username/:deviceID', function(req, res, next) {
    console.log("you have entering application to device dataForwarding api");
    if (req.body.command == null) {
        console.log("No embedded command in request");
        res.status(400).json({mes:"No embedded command in request"});
    }
    else{
        let username  = req.params.username;
        let deviceID = req.params.deviceID;
        let command  = req.body.command;

        // check if this user has the authority to interact with device
        let dbo = req.db;
        let query = {$and:[{"username":username},
                {"deviceID": deviceID}]};
        console.log(username);
        console.log(deviceID);
        dbo.collection("Bindings").find(query).toArray(function(err, device) {
            assert.equal(null, err);
            if (device.length == 0) {
                console.log("Sorry, user doesn't have the authority to interact with this device or this device doesn't exist");
                res.status(400).json({mes:"Sorry, user doesn't have the authority to interact with this device or this device doesn't exist"});
            }
            else{
                // find ip and port
                query = {"deviceID": deviceID};
                dbo.collection("Devices").find(query).toArray(function(err, device){
                    assert.equal(null, err);
                    let IP = device[0].IP;
                    let port = device[0].port;
                    let postData = JSON.stringify({
                        "command": command
                    });
                    forwardRequestForInfo(IP, port, postData)
                    .then(function(msg) {
                        res.send(JSON.stringify(msg));
                    });
                });
            }
        });
    }
});


/**********************************************
 * ********************************************
 * lao ma remembers to test below block! ******
 * ********************************************
 *  *******************************************/

router.post('DD/:fromDeviceID/:toDeviceID', function(req, res, next) {
    console.log("you have entering device to device dataForwarding api");
    if(req.body.command == null){
        console.log("No embedded command in request");
        res.status(400).json({mes:"No embedded command in request"});
    }
    else{
        let fromDeviceID  = req.params.fromDeviceID;
        let toDeviceID = req.params.toDeviceID;
        let command  = req.body.command;

        // check if this user has the authority to interact with device
        let dbo = req.db;
        let query = {$or:[{"deviceID1":fromDeviceID, "deviceID2": toDeviceID},
                {"deviceID1":toDeviceID, "deviceID2": fromDeviceID}]};
        dbo.collection("Connections").find(query).toArray(function(err, connection){
            assert.equal(null, err);
            if(connection.length==0){
                console.log("Sorry, ${fromDeviceID} doesn't have the authority to interact with this device or this device doesn't exist");
                res.status(400).json({mes:"Sorry, ${fromDeviceID} doesn't have the authority to interact with this device or this device doesn't exist"});
            }
            else{
                // find ip and port
                query = {"deviceID": toDeviceID};
                dbo.collection("Devices").find(query).toArray(function(err, device){
                    assert.equal(null, err);
                    let IP = device[0].IP;
                    let port = device[0].port;
                    let postData = JSON.stringify({
                        "command": command
                    });
                    forwardRequestForInfo(IP, port, postData)
                        .then(function(msg) {
                            res.send(JSON.stringify(msg));
                        });
                });
            }
        });
    }
});

/**
Helper functions
*/

function forwardRequestForInfo(IP, port, postData) {
    let options = { 
        hostname: IP,
        port: port, 
        path: '/mes', 
        method: 'POST', 
        key: fs.readFileSync('key.pem'), 
        cert: fs.readFileSync('cert.pem'), 
        passphrase: "passphrase",
        ca: [ fs.readFileSync('system_test/device/cert.pem') ],
        headers: {
           'Content-Type': 'application/json',
           'Content-Length': postData.length
        },
    }; 
    return httpsRequest.sendRequest(options, postData);
}

module.exports = router;