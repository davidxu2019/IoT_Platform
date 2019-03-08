var fs = require('fs'); 
var https = require('https'); 
var encryptAndDecrypt = require('../encryptAndDecrypt');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/*
routes
*/
app.post('/exchangePublicKey', function(req, res) {
    fs.writeFileSync("appPublicKey.pem", req.body.msg);
    // for consistency add public key into response body
    res.send(JSON.stringify({'publicKey': fs.readFileSync('cert.pem').toString('utf-8')}));
});

app.post('/info', function(req, res) {
    let receivedMsg = encryptAndDecrypt.decryptStringWithRsaPrivateKey(req.body.msg, 'key.pem');
    console.log('instruction is:', receivedMsg);
    let msg = {'temperature': 70, 'moisture': '10%'};
    let encryptedMsg = encryptAndDecrypt.encryptStringWithRsaPublicKey(JSON.stringify(msg), 'appPublicKey.pem');
    res.send(JSON.stringify({'info': encryptedMsg}));
});

/*
server config
*/
var options = { 
    key: fs.readFileSync('key.pem'), 
    cert: fs.readFileSync('cert.pem'), 
    passphrase: "passphrase",
    requestCert: true, 
    rejectUnauthorized: true,
    ca: [ fs.readFileSync('../server/cert.pem') ] 
}; 
var httpsServer = https.createServer(options, app);

httpsServer.listen(4444);