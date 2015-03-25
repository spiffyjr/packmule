(function() {
    try {
        angular.module('cordovaHTTP');
    } catch (e) {
        angular
            .module('cordovaHTTP', [])
            .service('cordovaHTTP', function($q, $http) {
                this.get = function(url, data, headers) {
                    return $q(function(resolve, reject) {
                        var request = {
                            method: 'get',
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

                this.post = function(url, data, headers) {
                    return $q(function(resolve, reject) {
                        var request = {
                            method: 'post',
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
                }
            });
    }
})();
