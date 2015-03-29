(function() {
    try {
        angular.module('packmule.cordova');
    } catch (e) {
        angular
            .module('packmule.cordova', [])
            .service('packmuleHttp', function($q, $http) {
                var request = function(method, url, headers, data) {
                    return $q(function(resolve, reject) {
                        var request = {
                            method: method,
                            url: url,
                            data: data,
                            headers: headers
                        };

                        return $http(request)
                            .success(function(response) {
                                resolve({data: JSON.stringify(response)});
                            })
                            .error(reject);
                    });
                };

                this.get = function(url, headers) {
                    return request('get', url, headers)
                };

                this.post = function(url, headers, data) {
                    return request('post', url, headers, data);
                }
            });
    }
})();
