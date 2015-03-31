'use strict';

angular.module('app.ad', []);
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
        'packmule.cordova',
        //'ionic',

        'hmTouchEvents',
        'ngAnimate',
        'ngMaterial',
        //'ngSanitize',
        'ui.router',
        'app.ad',
        'app.auth',
        'app.bungie',
        'app.item',
        'app.layout',
        'app.test',
        'app.vault'
    ])
    .config(['$animateProvider', function($animateProvider) {
        $animateProvider.classNameFilter(/animate/);
    }])
    .run(['AdService', function(AdService) {
        AdService.init();
    }]);

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
