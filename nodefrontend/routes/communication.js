let express = require('express');
let router = express.Router();
let httpsRequest = require('./exchangePublicKeyRouter/httpsRequest');
const assert = require('assert');
let fs = require('fs'); 

router.post('/:username/:deviceID', function(req, res, next) {
    console.log("you have entering dataForwarding api");
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