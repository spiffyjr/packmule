'use strict';

var ItemService = function($q, $rootScope, $timeout, AuthService, BungieClient, BungieService) {
    var MAX_VAULT_SPACE = 20;
    var MAX_INVENTORY_SPACE = 9;
    var RATE_LIMIT = 1100;

    var self = this;

    /**
     * An hash of characters (or vault) and the item affected by the move. Characters use charId and vault uses 'vault'.
     * This is useful to determine space required before the move as well as broadcasting an update event with the
     * characters that were changed.
     * @type {{}}
     */
    var affected = {};
    /**
     * The queue which holds a list of functions and arguments to be ran. Each command in the queue
     * is limited by RATE_LIMIT above.
     * @type {Array}
     */
    var queue = [];

    // todo: check if character inventory is full and make room
    var findReplacementItem = function(item) {
        var bucket = _.first(_.where(BungieService.buckets, {bucketHash: item.bucketTypeHash}));
        var character = BungieService.getCharacterById(item.charId);
        var choices = [];

        _.forEach(bucket.items, function(replace) {
            if (!replace.isEquipped &&
                replace.tierType < 6 &&
                (replace.classType == 3 || replace.classType == character.characterBase.classType)
            ) {
                choices.push(replace);
            }
        });

        choices.sort(function(a, b) {
            if (a.charId == item.charId && b.charId != item.charId) {
                return -1;
            }
            if (b.charId == item.charId && a.charId != item.charId) {
                return 1;
            }
            if (!a.charId && b.charId) {
                return -1;
            }
            if (a.charId && !b.charId) {
                return 1;
            }
            return 0;
        });

        return choices[0];
    };

    var run = function(successMessage) {
        var needsSpace = [];

        _.forEach(affected, function(item, charId) {
            if (!item) {
                return;
            }
            if (charId == 'vault' && self.checkVaultSpace(item) == 0) {
                needsSpace.push('vault');
            } else if (charId != 'vault' && self.checkInventorySpace(item, charId) == 0) {
                var character = BungieService.getCharacterById(charId);

                needsSpace.push([
                    character.characterLevel,
                    BungieService.getCharacterGender(character),
                    BungieService.getCharacterRace(character),
                    BungieService.getCharacterClass(character)
                ].join(' '));
            }
        });

        if (needsSpace.length > 0) {
            return $q(function(resolve, reject) {
                queue = [];
                affected = {};

                reject('Out of slots: ' + needsSpace.join(', '));
            });
        }

        return $q(function(resolve, reject) {
            var promise = null;
            var abort = false;

            _.forEach(queue, function(args) {
                if (abort) {
                    return;
                }

                var fn = args.shift();

                if (promise) {
                    promise = promise.then(function () {
                        return $timeout(function() {
                            return fn.apply(self, args);
                        }, RATE_LIMIT);
                    }, function(msg) {
                        abort = true;
                        reject(msg);
                    });
                } else {
                    promise = fn.apply(self, args);
                }
            });

            promise.then(function() {
                resolve(successMessage);
                $rootScope.$broadcast('ItemService:updated', Object.keys(affected));

                affected = {};
                queue = [];
            }, function(message) {
                reject(message);

                affected = {};
                queue = [];
            });
        });
    };

    var doEquip = function(item, charId) {
        return $q(function(resolve, reject) {
            var data = {
                characterId: charId,
                itemId: item.itemInstanceId,
                membershipType: BungieService.account.membershipType
            };

            return BungieClient.equipItem(data).then(resolve, reject);
        });
    };

    /**
     * Moves an item to or from the vault.
     * @param item
     * @param charId This id is the characterId the item is moving to
     *               (if item in vault) or moving from (if item on character).
     * @param toVault
     * @returns {*}
     */
    var doVault = function(item, charId, toVault) {
        return $q(function(resolve, reject) {
            var data = {
                characterId: charId,
                itemId: item.itemInstanceId,
                itemReferenceHash: item.itemHash,
                membershipType: BungieService.account.membershipType,
                stackSize: item.stackSize,
                transferToVault: toVault
            };

            return BungieClient.transferItem(data).then(resolve, reject);
        });
    };

    /**
     * Moves an item to destination.
     * @param itemToMove
     * @param destination null for vault otherwise a character id
     */
    var move = function(itemToMove, destination) {
        if (itemToMove.charId == destination) {
            return;
        }

        // item is on a character
        if (itemToMove.charId) {
            affected[itemToMove.charId] = null;
            affected.vault = itemToMove;
            queue.push([doVault, itemToMove, itemToMove.charId, true]);

            // if final destination is not vault move again
            if (destination) {
                affected[destination] = itemToMove;
                queue.push([doVault, itemToMove, destination, false]);
            }
        } else {
            affected['vault'] = null;
            affected[destination] = itemToMove;
            queue.push([doVault, itemToMove, destination, false]);
        }
    };

    var equip = function(item, charId) {
        affected[charId] = null;
        queue.push([doEquip, item, charId]);
    };

    var unequip = function(item) {
        if (!item.isEquipped) {
            return;
        }

        var replaceWith = findReplacementItem(item);

        if (replaceWith.charId != item.charId) {
            move(replaceWith, item.charId);
        }

        equip(replaceWith, item.charId);
    };

    this.checkInventorySpace = function(item, charId) {
        var count = 0;

        _.forEach(BungieService.buckets, function(bucket) {
            _.forEach(bucket.items, function(bucketItem) {
                if (bucketItem.charId == charId &&
                    bucketItem.bucketTypeHash == item.bucketTypeHash &&
                    !bucketItem.isEquipped
                ) {
                    count++;
                }
            });
        });

        return MAX_INVENTORY_SPACE - count;
    };

    this.checkVaultSpace = function(item) {
        var count = 0;

        _.forEach(BungieService.buckets, function(bucket) {
            _.forEach(bucket.items, function(bucketItem) {
                if (!bucketItem.charId && bucketItem.itemType == item.itemType ) {
                    count++;
                }
            });
        });

        return MAX_VAULT_SPACE - count;
    };

    this.equipItem = function(item, equipOnCharId) {
        if (item.charId == equipOnCharId && item.isEquipped) {
            return;
        }

        unequip(item);
        move(item, equipOnCharId);
        equip(item, equipOnCharId);

        return run(item.itemName + ' equipped');
    };

    this.transferItem = function(item, transferToCharId) {
        if (item.charId == transferToCharId) {
            return;
        }

        unequip(item);
        move(item, transferToCharId);

        return run(item.itemName + ' transferred');
    };
};

angular
    .module('app.item')
    .service('ItemService', ['$q', '$rootScope', '$timeout', 'AuthService', 'BungieClient', 'BungieService', ItemService]);
