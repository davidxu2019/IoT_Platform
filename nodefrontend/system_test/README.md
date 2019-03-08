## Communication Format:

Application (Send Request to Platform):  
*ExchangePublicKey*: /GET, need to specify 'deviceId' in query  
*Query Info*: /POST, request body format is {'msg' : "<instruction for device>" }  

Device (Send Response to Platform):
*ExchangePublicKey*: /POST, response body format is {'publicKey': "<publicKey>"}  
*Query Info*: /POST, response body format is {'info': "<info>"}

## Command to generate public and private keys
`openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -subj '/CN=localhost'`  

Currently, the public and private for application, device, and platform are stored in their own folders, and public keys are named as `cert.pem`, private `key.pem`. The exchanged keys are named as `appPublicKey` and `devicePublicKey` respectively.
