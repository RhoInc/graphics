const fetch = require('node-fetch');
const base64 = require('base-64');
const read = require('read');
global.Headers = fetch.Headers;

module.exports = function(callback) {
    const headers = new Headers();

    if (process.argv[2]) {
        headers.append(
            'Authorization',
            'Basic ' + base64.encode('jwildfire@gmail.com' + ':' + process.argv[2])
        );
        callback(headers);
    } else {
        read({ prompt: 'Username: ' }, function(error, username) {
            if (error) {
                console.log('Error: ' + error);
                return;
            }

            read({ prompt: 'Password: ', silent: true }, function(error, password) {
                if (error) {
                    console.log('Error: ' + error);
                    return;
                }

                //Define fetch headers.
                headers.append(
                    'Authorization',
                    'Basic ' + base64.encode(username + ':' + password)
                );
                callback(headers);
            });
        });
    }
};
