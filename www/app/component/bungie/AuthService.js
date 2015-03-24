var AuthService = function($q, $rootScope, $interval) {
    var csrf;

    var loginSuccess = function(value) {
        csrf = value;
        $rootScope.$broadcast('AuthService:loginSuccess');
    };

    var loginMobile = function(deferred, type) {
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

                        loginSuccess(matches[1]);
                        win.close();
                        deferred.resolve();
                    }
                });
            }, 100);
        });
    };

    var loginChrome = function(deferred) {
        var stop = $interval(function() {
            chrome.cookies.get({url: 'https://www.bungie.net', name: 'bungleme'}, function(bungleme) {
                if (!bungleme) {
                    return;
                }

                chrome.cookies.get({url: 'https://www.bungie.net', name: 'bungled'}, function(bungled) {
                    if (bungled) {
                        loginSuccess(bungled.value);
                        $interval.cancel(stop);
                        deferred.resolve();
                    }
                });
            });
        }, 100);
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
                window.cookies.clear(function() {
                    resolve();
                });
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
        var d = $q.defer();

        if (this.isAuthorized()) {
            d.resolve();
            return d.promise;
        }

        if (type == 'chrome') {
            loginChrome(d);
        } else {
            loginMobile(d, type);
        }

        return d.promise;
    };
};

angular
    .module('app.bungie')
    .service('AuthService', AuthService);
