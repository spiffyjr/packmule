var LoginCtrl = function($scope, $state, AuthService) {
    $scope.login = function(provider) {
        AuthService.login(provider).then(function() {
            $state.go('app.vault');
        });
    };

    $scope.login();
};

angular
    .module('app.auth')
    .controller('LoginCtrl', ['$scope', '$state', 'AuthService', LoginCtrl]);
