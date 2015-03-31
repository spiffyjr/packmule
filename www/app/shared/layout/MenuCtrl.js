var MenuCtrl = function($scope, $state, $mdSidenav, $mdMedia, AuthService, BungieService) {
    $scope.$on('BungieService:init', function() {
        var availablePlatforms = _.values(BungieService.memberIds);
        $scope.hasPsn = availablePlatforms.indexOf(2) > -1;
        $scope.hasXbox = availablePlatforms.indexOf(1) > -1;
        $scope.memberType = BungieService.account.membershipType;

        BungieService.getBungieNetUser().then(function(result) {
            $scope.user = result.user;
        });
    });

    $scope.showMenuToggle = function() {
        return $mdMedia('(max-width: 1400px)');
    };

    $scope.onChangeMemberType = function(memberType) {
        if (memberType == BungieService.account.membershipType) {
            return;
        }
        $mdSidenav('left').toggle();
        BungieService.changeMemberType(memberType);
    };

    $scope.$on('BungieClient:requestStart', function() {
        $scope.loadingBarEnabled = true;
    });

    $scope.$on('BungieClient:requestEnd', function() {
        $scope.loadingBarEnabled = false;
    });

    $scope.closeLeft = function() {
        $mdSidenav('left').close();
    };

    $scope.closeRight = function() {
        $mdSidenav('right').close();
    };

    $scope.toggleLeft = function() {
        $mdSidenav('left').toggle();
    };

    $scope.toggleRight = function() {
        $mdSidenav('right').toggle();
    };

    $scope.navigate = function(state) {
        $mdSidenav('left').toggle();
        $state.go(state);
    };
};

angular
    .module('app.layout')
    .controller('MenuCtrl', ['$scope', '$state', '$mdSidenav', '$mdMedia', 'AuthService', 'BungieService', MenuCtrl]);
