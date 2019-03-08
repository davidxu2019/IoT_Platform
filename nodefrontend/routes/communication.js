// adding library into api router
let express = require('express');
let router = express.Router();
let http = require('http');
const assert = require('assert');

router.post('/:username/:deviceID', function(req, res, next) {
    console.log("you have entering dataForwarding api");
    if(req.body.command == null){
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
        dbo.collection("Bindings").find(query).toArray(function(err, device){
            assert.equal(null, err);
            if(device.length==0){
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

                    // setting up http connection, transmit command and wait for response
                    var post_options = {
                        host: IP,
                        port: port,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'text/plain',
                            'Content-Length': Buffer.byteLength(command)
                        }
                    };

                    // Set up the request
                    let deviceFeedback = null;
                    var post_req = http.request(post_options, function(responseFromD) {
                        responseFromD.setEncoding('utf8');
                        responseFromD.on('data', function (chunk) {
                            console.log('Response: ' + chunk);
                            res.status(200).json(chunk);
                        });
                    });
                    // post the data
                    post_req.write(command);
                    post_req.end();
                });
            }
        });
    }
});

module.exports = router;