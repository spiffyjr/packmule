var AppCtrl = function($scope, $state, AuthService, BungieService) {
    $scope.basedir = packmule.basedir;
    $scope.Platform = packmule.Platform;
    $scope.AuthService = AuthService;

    $scope.$on('AuthService:loginSuccess', function() { BungieService.init(); });
    $scope.$on('BungieService:changeMemberType', function() { BungieService.init(); });
};

angular
    .module('app')
    .controller('AppCtrl', ['$scope', '$state', 'AuthService', 'BungieService', AppCtrl]);
