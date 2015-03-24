var RightNavCtrl = function($scope, $timeout, $mdSidenav, BungieService, ItemFilters) {
    var apply = function() {
        $mdSidenav('right').toggle();
        $timeout(function() {
            BungieService.applyFilters($scope.data);
        }, 250);
    };

    $scope.data = ItemFilters.defaults();

    $scope.getCharacter = function(charId) {
        var character = BungieService.getCharacterById(charId);
        var parts = [
            character.characterLevel,
            BungieService.getCharacterGender(character),
            BungieService.getCharacterRace(character),
            BungieService.getCharacterClass(character)
        ];

        return parts.join(' ');
    };

    $scope.clear = function() {
        $scope.data = ItemFilters.defaults();
        apply();
    };

    $scope.apply = function() {
        apply();
    };

    $scope.$on('BungieService:init', function() {
        $scope.characters = BungieService.account.characters;
    });
};

angular
    .module('app.layout')
    .controller('RightNavCtrl', RightNavCtrl);
