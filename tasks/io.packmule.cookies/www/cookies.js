var exec = require('cordova/exec');

var Cookies = function() {};

Cookies.get = function(url, callback) {
    exec(function(cookie) {
        callback(cookie);
    }, function(result) {
        console.log('error: ' + result);
    }, "CookiesPlugin", "get", [url]);
};

module.exports = Cookies;
