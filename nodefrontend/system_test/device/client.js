var fs = require('fs'); 
var encryptAndDecrypt = require('../encryptAndDecrypt');
var httpsRequest = require("../httpsRequest");

async function testForwardingData() {
	let from = 'uclaece1';
    let to = 'uclaece2';
    try {
        let publicKeyData = await exchangePublicKey(to);
        if (publicKeyData) {
            fs.writeFileSync("devicePublicKey.pem", publicKeyData.body.publicKey);
            let data = await sendQuery(from, to, "GOOD!");
            return data;            
        } 
    } catch(err) {
        throw err;
    }
}

testForwardingData()
.then(function(data) {
    console.log(encryptAndDecrypt.decryptStringWithRsaPrivateKey(data.body.mes, '../application/key.pem'));
})
.catch(function(err) {
    console.log(err);
})

/*
helper functions
*/

function exchangePublicKey(deviceId) {
    postData = JSON.stringify({'deviceID': deviceId});
    let options = { 
        hostname: 'localhost', 
        port: 8433, 
        path: '/exchangePublicKey', 
        method: 'GET', 
        key: fs.readFileSync('../application/key.pem'), 
        cert: fs.readFileSync('../application/cert.pem'), 
        passphrase: "passphrase",
        ca: [ fs.readFileSync('../../cert.pem') ],
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length
        }
    };    
    return httpsRequest.sendRequest(options, postData);
}

function sendQuery(fromdevice, todevice, command) {
    let postData = JSON.stringify({
        'command':encryptAndDecrypt.encryptStringWithRsaPublicKey(command, "devicePublicKey.pem")
    });      
    let options = { 
        hostname: 'localhost',
        port: 8433, 
        path: '/commu/DD/' + fromdevice + '/' + todevice, 
        method: 'POST', 
        key: fs.readFileSync('../application/key.pem'), 
        cert: fs.readFileSync('../application/cert.pem'), 
        passphrase: "passphrase",
        ca: [ fs.readFileSync('../../cert.pem') ],
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postData.length,
        }
    };  
    return httpsRequest.sendRequest(options, postData);
}