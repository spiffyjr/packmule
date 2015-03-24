var LogoutCtrl = function($scope, $state, AuthService, BungieService) {
    AuthService.logout().then(function() {
        BungieService.reset();
        location.reload();
    })
};

angular
    .module('app.auth')
    .controller('LogoutCtrl', LogoutCtrl);
