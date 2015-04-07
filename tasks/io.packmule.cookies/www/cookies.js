var exec = require('cordova/exec');

var Cookies = function() {};

Cookies.get = function(url, callback) {
    exec(callback, null, "CookiesPlugin", "get", [url]);
};

Cookies.clear = function(callback) {
    exec(callback, null, "CookiesPlugin", "clear", []);
};

module.exports = Cookies;
