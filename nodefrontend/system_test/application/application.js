var fs = require('fs'); 
var encryptAndDecrypt = require('../encryptAndDecrypt');
var httpsRequest = require("../httpsRequest");

/** 
test signup 
*/

/**
test login
*/


/**
test singup, login, exchangePublicKey, and forwarding data
*/

async function testForwardingData() {
    let username = 'testUser';
    let password = 'password';
    let deviceID = '1user1';
    try {
        // await signup(username, password);
        let loginData = await login(username, password);
        let jwt = loginData.cookies.jwt;
        let publicKeyData = await exchangePublicKey(jwt, deviceID);
        if (publicKeyData) {
            fs.writeFileSync("devicePublicKey.pem", publicKeyData.body.publicKey);
            let data = await sendQuery(jwt, username, deviceID, "GOOD!");
            return data;            
        } 
    } catch(err) {
        throw err;
    }
}

testForwardingData()
.then(function(data) {
    console.log(encryptAndDecrypt.decryptStringWithRsaPrivateKey(data.body.mes, 'key.pem'));
})
.catch(function(err) {
    console.log(err);
})

/*
helper functions
*/

function signup(username, password) {
    let postData = JSON.stringify({
        'username': username,
        'password': password
    });      
    let options = { 
        hostname: 'localhost',
        port: 8433, 
        path: '/identity/signup', 
        method: 'POST', 
        key: fs.readFileSync('key.pem'), 
        cert: fs.readFileSync('cert.pem'), 
        passphrase: "passphrase",
        ca: [ fs.readFileSync('../../cert.pem') ],
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postData.length
        }
    };  
    return httpsRequest.sendRequest(options, postData);
}

function login(username, password) {
    let postData = JSON.stringify({
        'username': username,
        'password': password
    });      
    let options = { 
        hostname: 'localhost',
        port: 8433, 
        path: '/identity/login', 
        method: 'POST', 
        key: fs.readFileSync('key.pem'), 
        cert: fs.readFileSync('cert.pem'), 
        passphrase: "passphrase",
        ca: [ fs.readFileSync('../../cert.pem') ],
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postData.length
        }
    };  
    return httpsRequest.sendRequest(options, postData);   
}

function exchangePublicKey(jwt, deviceId) {
    postData = JSON.stringify({'deviceID': deviceId});
    let options = { 
        hostname: 'localhost', 
        port: 8433, 
        path: '/exchangePublicKey', 
        method: 'GET', 
        key: fs.readFileSync('key.pem'), 
        cert: fs.readFileSync('cert.pem'), 
        passphrase: "passphrase",
        ca: [ fs.readFileSync('../../cert.pem') ],
        headers: {
            'Cookie': 'jwt=' + jwt,
            'Content-Type': 'application/json',
            'Content-Length': postData.length
        }
    };    
    return httpsRequest.sendRequest(options, postData);
}

function sendQuery(jwt, username, deviceID, command) {
    let postData = JSON.stringify({
        'command':encryptAndDecrypt.encryptStringWithRsaPublicKey(command, "devicePublicKey.pem")
    });      
    let options = { 
        hostname: 'localhost',
        port: 8433, 
        path: '/commu/AD/' + username + '/' + deviceID, 
        method: 'POST', 
        key: fs.readFileSync('key.pem'), 
        cert: fs.readFileSync('cert.pem'), 
        passphrase: "passphrase",
        ca: [ fs.readFileSync('../../cert.pem') ],
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postData.length,
          'Cookie': 'jwt=' + jwt
        }
    };  
    return httpsRequest.sendRequest(options, postData);
}




