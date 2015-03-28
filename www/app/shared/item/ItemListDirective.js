var ItemListDirective = function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            items: '='
        },
        controller: function($rootScope, $scope, $mdBottomSheet, BungieService, ItemService) {
            $scope.chars = BungieService.account.characters;
            $scope.accountDefs = BungieService.accountDefs;
            $scope.getCharacter = function(charId) {
                if (!charId) {
                    return 'In Vault';
                }

                var character = BungieService.getCharacterById(charId);
                var parts = [
                    character.characterLevel,
                    BungieService.getCharacterClass(character)
                ];

                return parts.join(' ');
            };

            $scope.getCharacterEmblem = function(charId) {
                var character = BungieService.getCharacterById(charId);

                return character.emblemPath;
            };

            $scope.getLightLevel = function(item) {
                var light = _.find(item.stats, _.matchesProperty('statHash', 2391494160));

                return light ? light.value : null;
            };

            $scope.showBottomSheet = function(item) {
                var sheetScope = $rootScope.$new(true);
                sheetScope.item = item;
                sheetScope.chars = $scope.chars;
                sheetScope.getCharacter = $scope.getCharacter;
                sheetScope.getCharacterEmblem = $scope.getCharacterEmblem;

                $mdBottomSheet.show({
                    controller: 'BottomSheetCtrl',
                    scope: sheetScope,
                    locals: {
                        ItemService: ItemService
                    },
                    templateUrl: packmule.basedir + '/shared/item/bottom-sheet.html'
                });
            }
        },
        templateUrl: packmule.basedir + '/shared/item/item-list.html'
    };
};

angular
    .module('app.item')
    .directive('itemList', ItemListDirective);
