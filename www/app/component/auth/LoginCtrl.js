var LoginCtrl = function($scope, $state, AuthService) {
    $scope.login = function(provider) {
        AuthService.login(provider).then(function() {
            $state.go('app.vault');
        });
    };

    if (packmule.Platform.isChrome()) {
        $scope.login('chrome');
    }
};

angular
    .module('app.auth')
    .controller('LoginCtrl', ['$scope', '$state', 'AuthService', LoginCtrl]);
