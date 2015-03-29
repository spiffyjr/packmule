var exec = require('cordova/exec');

var Http = function($q, $timeout) {
    var request = function(method, params) {
        return $q(function(resolve, reject) {
            var success = function(response) {
                $timeout(function() {
                    resolve(response);
                });
            };

            var fail = function(response) {
                $timeout(function() {
                    reject(response);
                });
            };

            return exec(success, fail, 'HttpPlugin', method, params);
        });
    };

    this.get = function(url, headers) {
        return request('get', [url, headers]);
    };

    this.post = function(url, headers, data) {
        return request('post', [url, headers, JSON.stringify(data)]);
    };
};

angular
    .module('packmule.cordova')
    .service('packmuleHttp', Http);

module.exports = Http;
