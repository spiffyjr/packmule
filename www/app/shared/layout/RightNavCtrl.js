var RightNavCtrl = function($scope, $timeout, $mdSidenav, BungieService, ItemFilters) {
    var apply = function(value) {
        ItemFilters.set(value);
    };

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

    $scope.data = ItemFilters.defaults();

    $scope.clear = function() {
        ItemFilters.clear();
    };

    $scope.$on('BungieService:init', function() {
        $scope.characters = BungieService.account.characters;
    });

    $scope.$watch('data', apply, true);
};

angular
    .module('app.layout')
    .controller('RightNavCtrl', RightNavCtrl);
