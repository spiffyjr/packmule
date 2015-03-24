angular.module('app')
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: packmule.basedir + '/shared/layout/menu.html'
            })
            .state('app.login', {
                url: '/login',
                views: {
                    content: {
                        controller: 'LoginCtrl',
                        templateUrl: packmule.basedir + '/component/auth/login.html'
                    }
                }
            })
            .state('app.logout', {
                url: '/logout',
                views: {
                    content: {
                        controller: 'LogoutCtrl',
                        templateUrl: packmule.basedir + '/component/auth/logout.html'
                    }
                }
            })
            .state('app.vault', {
                url: '/vault',
                views: {
                    content: {
                        controller: 'VaultCtrl',
                        templateUrl: packmule.basedir + '/component/vault/vault.html'
                    }
                }
            });
    });
