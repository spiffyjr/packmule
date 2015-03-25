'use strict';

var ItemService = function($q, BungieClient, BungieService) {
    var doVault = function(item, charId, toVault) {
        return $q(function(resolve, reject) {
            if (item.isEquipped) {
                reject('Cannot move equiped items (yet)');
            } else {
                var data = {
                    characterId: charId,
                    itemId: item.itemInstanceId,
                    itemReferenceHash: item.itemHash,
                    membershipType: BungieService.account.membershipType,
                    stackSize: item.stackSize,
                    transferToVault: toVault
                };

                BungieClient.transferItem(data).then(resolve, reject);
            }
        });
    };

    this.transferItem = function(item, charId) {
        return $q(function(resolve, reject) {
            // item is in vault - move to character
            if (!item.charId) {
                doVault(item, charId, false)
                    .then(function() {
                        var character = BungieService.getCharacterById(charId);
                        resolve(item.itemName + ' moved to ' + BungieService.getCharacterClass(character))
                    }, reject);
            }

            // item is on character - move to vault
            if (item.charId == charId) {
                doVault(item, charId, true)
                    .then(function() {
                        resolve(item.itemName + ' moved to vault');
                    }, reject);
            }
        });
    };
};

angular
    .module('app.item')
    .service('ItemService', ItemService);
