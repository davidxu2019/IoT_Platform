// adding library into api router
let express = require('express');
let router = express.Router();
let jwt = require('jsonwebtoken');
const assert = require('assert');


// jwt check
router.all('/:username', function(req, res, next) {
    console.log("checking cookie");
    console.log(req.cookies);
    if(req.cookies.jwt == null){
        console.log("unauthenticated 1!");
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
                console.log(user[0].iat);
                if (username == req.params.username && exp > Date.now() && iat == user[0].iat) {
                    next();
                }
                else {
                    console.log("unauthenticated 2!");
                    res.status(401).json({mes:"unauthenticated"});
                }
            });

        }catch(err){
            console.log(err);
            res.status(401).send(err);
        }
    }
});

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


// getAll api
router.get('/:username', function(req, res, next) {
    console.log("you have entering getAll api");
    let username  = req.params.username;

    let dbo = req.db;
    let query = {"username": username};
    dbo.collection("Bindings").find(query, function (err, devices) {
        assert.equal(null, err);
        console.log("below are the query results for \"username\"")
        console.log(devices);
        res.status(200).json(devices);
    });
});

// get certain "device" under certain "username"
router.get('/:username/:deviceID', function(req, res, next) {
    console.log("you have entering get api");
    let username  = req.params.username;
    let deviceID = req.params.deviceID;

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
            console.log("device has been found");
            res.status(200).json(device);
        }
    });
});

// bind "device" with "username", if "device" has been bound, return 400
router.post('/:username/:deviceID', function(req, res, next) {
    console.log("you have entering deviceBinding api")
    if(req.body.deviceName == null){
        console.log("No embedded deviceName in request");
        res.status(400).json({mes:"No embedded deviceName in request"});
    }
    else {
        let username = req.params.username;
        let deviceID = req.params.deviceID;
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