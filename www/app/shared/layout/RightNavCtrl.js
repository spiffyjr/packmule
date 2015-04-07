var RightNavCtrl = function($scope, BungieService, ItemFilters) {
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

    $scope.clear = function() {
        ItemFilters.clear();
        $scope.data = ItemFilters.defaults();
    };

    $scope.$on('BungieService:init', function() {
        $scope.characters = BungieService.account.characters;
        _.forEach($scope.characters, function(character) {
            $scope.data.location[character.characterBase.characterId] = true;
        });
    });

    $scope.data = ItemFilters.defaults();
    $scope.$watch('data', apply, true);
};

angular
    .module('app.layout')
    .controller('RightNavCtrl', ['$scope', 'BungieService', 'ItemFilters', RightNavCtrl]);
