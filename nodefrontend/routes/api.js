// adding library into api router
let express = require('express');
let router = express.Router();
const assert = require('assert');

// getAll api
router.get('/:username', function(req, res, next) {
    console.log("you have entering getAll api");
    let username  = req.params.username;

    let dbo = req.db;
    let query = {"username": username};
    dbo.collection("Bindings").find(query).toArray(function (err, devices) {
        assert.equal(null, err);
        console.log("below are the query results for \"username\"")
        console.log(devices);
        res.status(200).json(devices);
    });
});

// get certain "device" under certain "username"
router.get('/:username/:id', function(req, res, next) {
    console.log("you have entering get api");
    let username  = req.params.username;
    let deviceID = req.params.id;

    let dbo = req.db;
    let query = {$and:[{"username":username},
            {"deviceID": deviceID}]};
    dbo.collection("Bindings").find(query).toArray(function(err, device){
        assert.equal(null, err);
        console.log("below are the query results for /username/did")
        console.log(device);
        if(device.length==0){
            console.log("there isn't such device");
            res.status(404).json(device);
        }
        else{
            console.log("post has been found");
            res.status(200).json(device);
        }
    });
});

// bind "device" with "username", if "device" has been bound, return 400
router.post('/:username/:id', function(req, res, next) {
    console.log("you have entering deviceBinding api")
    if(req.body.deviceName == null){
        console.log("No embedded deviceName in request");
        res.status(400).json({mes:"No embedded deviceName in request"});
    }
    else {
        let username = req.params.username;
        let deviceID = req.params.id;
        let deviceName = req.body.deviceName

        // check whether this device has been binding or not
        let dbo = req.db;
        let query = {"deviceID": deviceID};
        dbo.collection("Bindings").find(query).toArray(function (err, devices) {
            assert.equal(null, err);
            if (devices.length==0){
                console.log("no such device");
                res.status(404).json({mes:"no such device"});
            }
            else if (devices.length > 1) {
                console.log("such device has been bound already");
                res.status(400).json({mes:"such device has been bound already"});
            }
            else{
                // update binding for admin
                dbo.collection('Bindings').updateOne(query, {$set: {deviceName: deviceName}}, function (err, r) {
                    assert.equal(null, err);
                    assert.equal(1, r.matchedCount);
                    assert.equal(1, r.modifiedCount);

                    // insert new document for user-device binding
                    let doc = {
                        deviceID: deviceID,
                        username: username,
                        deviceName: deviceName
                    };

                    dbo.collection('Bindings').insertOne(doc, function (err, r) {
                        assert.equal(null, err);
                        assert.equal(1, r.insertedCount);
                        console.log("successfully update admin and insert new user-device binding");
                        res.status(201).json({mes:"successfully update admin and insert new user-device binding"});
                    });
                });
            }
        });
    }
});

module.exports = router;