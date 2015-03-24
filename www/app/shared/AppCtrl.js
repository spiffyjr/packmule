var AppCtrl = function($scope, $state, AuthService, BungieService) {
    $scope.basedir = packmule.basedir;
    $scope.AuthService = AuthService;
    $scope.Platform = packmule.Platform;

    $scope.$on('AuthService:loginSuccess', function() {
        BungieService.init();
    });

    $scope.$on('BungieService:changeMemberType', function() {
        BungieService.init();
    });

    $state.go('app.login');
};

angular
    .module('app')
    .controller('AppCtrl', AppCtrl);
