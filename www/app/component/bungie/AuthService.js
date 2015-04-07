var AuthService = function($q, $rootScope, $interval) {
    var csrf;
    var self = this;

    var loginSuccess = function(value) {
        if (csrf) {
            return;
        }
        csrf = value;
        $rootScope.$broadcast('AuthService:loginSuccess');
    };

    var loginMobile = function(type) {
        return $q(function(resolve) {
            var url = 'https://www.bungie.net/en/User/SignIn/' + type;
            var win = window.open(url, '_blank', 'zoom=no,clearcache=no,toolbar=yes,location=yes');

            win.addEventListener('loadstart', function(event) {
                if (event.url != url) {
                    return;
                }
                var stop = $interval(function() {
                    win.executeScript({code: 'document.cookie'}, function(cookie) {
                        var matches;
                        if (matches = cookie[0].match(/bungled=(\d+)/)) {
                            $interval.cancel(stop);
                            win.close();
                            loginSuccess(matches[1]);

                            resolve();
                        }
                    });
                }, 100);
            });
        });
    };

    var loginChrome = function() {
        return $q(function(resolve) {
            var stop = $interval(function() {
                chrome.cookies.get({url: 'https://www.bungie.net', name: 'bungleme'}, function(bungleme) {
                    if (bungleme) {
                        chrome.cookies.get({url: 'https://www.bungie.net', name: 'bungled'}, function (bungled) {
                            if (bungled) {
                                $interval.cancel(stop);
                                loginSuccess(bungled.value);

                                resolve();
                            }
                        });
                    }
                });
            }, 100);
        });
    };

    this.isAuthorized = function() {
        return undefined !== csrf;
    };

    this.getCsrf = function() {
        return csrf;
    };

    this.logout = function() {
        return $q(function(resolve) {
            if (packmule.Platform.isMobile()) {
                packmule.Cookies.clear(resolve);
            } else if (packmule.Platform.isChrome()) {
                var stop = $interval(function() {
                    chrome.cookies.get({url: 'https://www.bungie.net', name: 'bungleme'}, function(cookie) {
                        if (!cookie) {
                            $interval.cancel(stop);
                            resolve();
                        }
                    });
                }, 100);
            }
        });
    };

    this.login = function(type) {
        return $q(function(resolve, reject) {
            if (typeof type == 'undefined') {
                type = packmule.Platform.isChrome() ? 'chrome' : localStorage.getItem('AuthService:loginType')
            }

            if (self.isAuthorized()) {
                resolve();
                return;
            }

            var promise;

            switch (type) {
                case 'chrome':
                    promise = loginChrome();
                    break;
                case 'Psnid':
                case 'Wlid':
                    promise = loginMobile(type);
                    break;
            }

            if (promise) {
                promise.then(function() {
                    localStorage.setItem('AuthService:loginType', type);
                    resolve();
                },  reject);
                return promise;
            } else {
                reject();
            }
        });
    };
};

angular
    .module('app.bungie')
    .service('AuthService', ['$q', '$rootScope', '$interval', AuthService]);
