(function() {
    try {
        angular.module('cordovaHTTP');
    } catch (e) {
        angular
            .module('cordovaHTTP', [])
            .service('cordovaHTTP', function($q, $http) {
                var request = function(method, url, data, headers) {
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

                this.get = function(url, data, headers) {
                    return request('get', url, data, headers)
                };

                this.post = function(url, data, headers) {
                    return request('post', url, data, headers);
                }
            });
    }
})();
