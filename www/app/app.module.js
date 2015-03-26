'use strict';

angular.module('app.auth', []);
angular.module('app.bungie', ['app.auth']);
angular.module('app.item', []);
angular.module('app.layout', []);
angular.module('app.test', ['app.bungie']);
angular.module('app.vault', []);

var packmule = {};

if (DEBUG) {
    packmule.basedir = 'app'
} else {
    packmule.basedir = 'build';
}

angular.module(
    'app',
    [
        'cordovaHTTP',
        'hmTouchEvents',
        'ngAnimate',
        'ngMaterial',
        'ui.router',
        'app.auth',
        'app.bungie',
        'app.item',
        'app.layout',
        'app.test',
        'app.vault'
    ])
    .run(function($rootScope, $state, AuthService) {
        $rootScope.$on('$stateChangeStart',
            function(e, toState) {
                if (!AuthService.isAuthorized() && toState.name != 'app.login') {
                    console.log('redirecting to login');
                    e.preventDefault();
                    return $state.go('app.login');
                }
            });
    });

document.addEventListener(window.cordova ? 'deviceready' : 'DOMContentLoaded', function() {
    var bootstrap = function() {
        angular.bootstrap(document, ['app']);
    };

    if (window.cordova) {
        setTimeout(bootstrap, 1000);
    } else {
        bootstrap();
    }
}, false);
