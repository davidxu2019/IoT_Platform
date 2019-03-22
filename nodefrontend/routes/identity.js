let express = require('express');
let router = express.Router();
let jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');
const assert = require('assert');
const saltRounds = 10;


/* GET home page. */

router.post('/signup', function(req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    let dbo = req.db;
    let query = {"username": username};
    dbo.collection("Users").find(query).toArray(function (err, users) {
        assert.equal(null, err);
        if(users.length>=1){
            console.log("user has been registered");
            res.status(404).json({mes:"user has been registered"});
        }
        else{
            bcrypt.hash(password, saltRounds, function(err, hash){
                query = {"username": username,
                    "password": hash};
                dbo.collection('Users').insertOne(query,function(err, result){
                    if (err) throw err;
                    console.log("user successfully registered");
                    res.status(200).json({mes:"user successfully registered"});
                });
            });
        }
    })
});

router.post('/login', function(req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    let dbo = req.db;
    let query = {"username": username};
    let time = Math.floor(Date.now()/1000);

    dbo.collection("Users").find(query).toArray(function (err, dbpassword) {
        assert.equal(null, err);
        if(dbpassword.length==1){
            bcrypt.compare(password, dbpassword[0].password, function(err, result){
                if(result==true){
                    var payload = {
                        "exp": time + (2*60*60),
                        "usr": username,
                        "iat": time
                    };
                    var secretKey = "C-UFRaksvPKhx1txJYFcut3QGxsafPmwCY6SCly3G6c";
                    var token = jwt.sign(payload, secretKey);

                    dbo.collection('Users').updateOne(query, {$set: {iat: time}}, function (err, r) {
                        assert.equal(null, err);
                        assert.equal(1, r.matchedCount);
                        assert.equal(1, r.modifiedCount);

                        res.cookie('jwt', token);
                        res.status(200).json({mes:"authentication succeeded"});
                    });
                }
                else{
                    console.log("password not correct");
                    res.status(401).json({mes:"password not correct"});

                }
            })
        }
        else{
            console.log("user doesn't exist");
            res.status(401).json({mes:"user doesn't exist"});
        }
    });
});

module.exports = router;