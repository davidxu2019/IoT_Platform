var https = require('https'); 

function httpsRequest(params, postData) {
    return new Promise(function(resolve, reject) {
        var req = https.request(params, function(res) {
            let hasError = (res.statusCode < 200 || res.statusCode >= 300);
            // cumulate data
            var body = [];
            res.on('data', function(chunk) {
                body.push(chunk);
            });
            // resolve on end
            res.on('end', function() {
                try {
                    bodyObject = JSON.parse(Buffer.concat(body).toString());
                } catch(e) {
                    reject(e);
                }
                if (hasError) {
                    reject(new Error('status code: ' + res.statusCode + '\n' + body.toString('utf-8'))); 
                } else {
                    if (res.headers['set-cookie']) {
                        let cookies = {};
                        res.headers['set-cookie'].forEach(function(cookieStr) {
                            Object.assign(cookies, parseCookies(cookieStr));
                        });
                        resolve({"cookies": cookies, "body": bodyObject});
                    } else {
                        resolve({"body": bodyObject});
                    }
                }
            });
        });
        // reject on request error
        req.on('error', function(err) {
            // This is not a "Second reject", just a different sort of failure
            reject(err);
        });
        if (postData) {
            req.write(postData);
        }
        // IMPORTANT
        req.end();
    });
}

function parseCookies(rc) {
    var list = {};

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}

module.exports = {
    sendRequest: httpsRequest,
}