var fs = require('fs'); 
var encryptAndDecrypt = require('../encryptAndDecrypt');
var httpsRequest = require("../httpsRequest");

exchangePublicKey()
.then(function(msg) {
    fs.writeFileSync("devicePublicKey.pem", msg.publicKey);
})
.then(sendQuery)
.then(function(msg) {
    console.log(encryptAndDecrypt.decryptStringWithRsaPrivateKey(msg.mes, 'key.pem'));
});

/*
helper functions
*/
function exchangePublicKey() {
    let options = { 
        hostname: 'localhost', 
        port: 8433, 
        path: '/exchangePublicKey', 
        method: 'GET', 
        key: fs.readFileSync('key.pem'), 
        cert: fs.readFileSync('cert.pem'), 
        passphrase: "passphrase",
        ca: [ fs.readFileSync('../../cert.pem') ]
    };    
    return httpsRequest.sendRequest(options);
}

function sendQuery() {
    let postData = JSON.stringify({
        'command':encryptAndDecrypt.encryptStringWithRsaPublicKey("WOCAO", "devicePublicKey.pem")
    });      
    let options = { 
        hostname: 'localhost',
        port: 8433, 
        path: '/commu/user1/1user1', 
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




