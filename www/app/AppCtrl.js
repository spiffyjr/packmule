var AppCtrl = function($scope, $state, $http, AuthService, BungieService) {
    $scope.basedir = packmule.basedir;
    $scope.Platform = packmule.Platform;
    $scope.AuthService = AuthService;

    $http
        .get('manifest.json')
        .success(function(response) {
            $scope.manifest = response;
        });

    $scope.$on('AuthService:loginSuccess', function() { BungieService.init(); });
    $scope.$on('BungieService:changeMemberType', function() { BungieService.init(); });
};

angular
    .module('app')
    .controller('AppCtrl', ['$scope', '$state', '$http', 'AuthService', 'BungieService', AppCtrl]);
