var BungieService = function($q, $rootScope, $http, $filter, BungieClient, ItemFilters) {
    var CACHE_MEMBER_TYPE = 'BungieService.activeMemberType';

    var self = this;
    /**
     * Set once init() is ran and complete.
     * @type {boolean}
     */
    var loaded = false;
    /**
     * Customized item definitions which are built from SQLite using a grunt task.
     * @type {{}}
     */
    var itemDefs = {};
    /**
     * Customized bucket definitions which are built from SQLite using a grunt task.
     * @type {{}}
     */
    var bucketDefs = {};
    /**
     * Hash of current buckets and items.
     * @type {{}}
     */
    this.buckets = {};

    var sortBuckets = function() {
        var array = [];

        // sort items by tier and then by name
        _.forEach(self.buckets, function(bucket, bucketKey) {
            if (!bucket.bucketName) {
                delete bucket[bucketKey];
                return;
            }

            if (bucket.bucketIdentifier == 'BUCKET_LEGACY_CURRENCY') {
                delete bucket[bucketKey];
                return;
            }

            if (bucket.items.length == 0) {
                delete bucket[bucketKey];
                return;
            }

            bucket
                .items
                .sort(
                    firstBy(function(a, b) {
                        if (a.isEquipped && b.isEquipped) {
                            return 0;
                        }
                        if (a.isEquipped) {
                            return -1;
                        }
                        if (b.isEquipped) {
                            return 1;
                        }
                        return 0;
                    })
                    .thenBy(function(a, b) {
                        return b.tierType - a.tierType;
                    })
                    .thenBy(function(a, b) {
                        if (a.itemName < b.itemName) {
                            return -1;
                        }
                        if (a.itemName > b.itemName) {
                            return 1;
                        }
                        return 0;
                    })
                );

            array.push(bucket);
        });

        // sort buckets by category and then order
        array
            .sort(
                firstBy(function(a, b) {
                    if (a.category > b.category) {
                        return -1;
                    }
                    if (a.category < b.category) {
                        return 1;
                    }
                    return 0;
                })
                .thenBy(function(a, b) {
                    if (a.bucketOrder < b.bucketOrder) {
                        return -1;
                    }
                    if (a.bucketOrder > b.bucketOrder) {
                        return 1;
                    }
                    return 0;
                })
            );

        return array;
    };

    // todo: make me more efficient
    var cleanBucketItems = function(charId) {
        _.forEach(self.buckets, function(bucket) {
            for (var i = bucket.items.length - 1; i >= 0; i--) {
                var item = bucket.items[i];

                if (item.charId == charId) {
                    bucket.items.splice(i, 1);
                }
            }
        });
    };

    var addItemToBucket = function(bucketHash, item, charId) {
        if (!bucketHash) {
            return null;
        }

        var bucketDef = bucketDefs[bucketHash];

        if (!self.buckets[bucketHash]) {
            self.buckets[bucketHash] = {
                id: _.uniqueId('b:'),
                bucketHash: bucketHash,
                bucketName: bucketDef.bucketName,
                bucketOrder: bucketDef.bucketOrder,
                category: bucketDef.category,
                bucketIdentifier: bucketDef.bucketIdentifier,
                items: []
            };
        }

        var itemDef = itemDefs[item.itemHash];
        var newItem = {
            id: _.uniqueId('i:'),
            charId: (charId ? charId : null),
            itemName: itemDef.itemName,
            itemType: itemDef.itemType,
            classType: itemDef.classType,
            bucketTypeHash: itemDef.bucketTypeHash,
            tierType: itemDef.tierType,
            tierTypeName: itemDef.tierTypeName,
            icon: itemDef.icon,
            canEquip: item.canEquip,
            cannotEquipReason: item.cannotEquipReason,
            damageType: item.damageType,
            isEquipment: item.isEquipment,
            isEquipped: item.isEquipped,
            isGridComplete: item.isGridComplete,
            itemHash: item.itemHash,
            itemInstanceId: item.itemInstanceId,
            primaryStat: item.primaryStat,
            stackSize: item.stackSize,
            stats: item.stats,
            transferStatus: item.transferStatus,
            hidden: false
        };

        self.buckets[bucketHash].items.push(newItem);
    };

    var onInventoryResponse = function(result, charId) {
        var buckets = {};

        cleanBucketItems(charId);

        _.forEach(result.data.buckets, function(bucketData) {
            _.forEach(bucketData, function(bucket) {
                _.forEach(bucket.items, function(item) {
                    addItemToBucket(bucket.bucketHash, item, charId);
                });
            });
        });

        return buckets;
    };

    var onVaultResponse = function(result) {
        var buckets = {};

        cleanBucketItems(null);

        _.forEach(result.data.buckets, function(bucket) {
            _.forEach(bucket.items, function(item) {
                addItemToBucket(itemDefs[item.itemHash].bucketTypeHash, item);
            });
        });

        return buckets;
    };

    this.account = null;
    this.accountDefs = null;
    this.memberIds = null;
    this.activeMemberType = null;
    this.activeMemberId = null;

    this.reset = function() {
        this.account = null;
        this.accountDefs = null;
        this.memberIds = null;
        this.activeMemberType = null;
        this.activeMemberId = null;

        loaded = false;
    };

    this.init = function(memberType) {
        var cachedMemberType = localStorage.getItem(CACHE_MEMBER_TYPE);
        if (!memberType && cachedMemberType) {
            memberType = cachedMemberType;
        }

        return $q(function(resolve, reject) {
            if (loaded) {
                resolve();
            } else {
                $http
                    .get('asset/json/item-defs.json')
                    .then(function(result) {
                        itemDefs = result.data;
                        return $http.get('asset/json/bucket-defs.json');
                    }, reject)
                    .then(function(result) {
                        bucketDefs = result.data;
                        return BungieClient.findMembershipIds()
                    })
                    .then(function (result) {
                        self.memberIds = result;

                        if (memberType) {
                            self.activeMemberId = _.findKey(result, function(e) {
                                return e == memberType;
                            });
                            self.activeMemberType = memberType;
                        } else {
                            self.activeMemberId = _.first(Object.keys(result));
                            self.activeMemberType = result[self.activeMemberId];
                        }

                        return BungieClient.findAccount(
                            self.activeMemberType,
                            self.activeMemberId,
                            true
                        );
                    }, reject)
                    .then(function (result) {
                        self.account = result.data;
                        self.accountDefs = result.definitions;

                        loaded = true;
                        resolve();

                        $rootScope.$broadcast('BungieService:init');
                    }, reject);
            }
        });
    };

    this.changeMemberType = function(memberType) {
        if (memberType < 1 || memberType > 2) {
            return;
        }

        if (memberType == this.account.membershipType) {
            return;
        }

        this.reset();

        localStorage.setItem(CACHE_MEMBER_TYPE, memberType);
        $rootScope.$broadcast('BungieService:changeMemberType');
    };

    this.getBungieNetUser = function() {
        return BungieClient.findBungieNetUser();
    };

    this.getCharacterRace = function(character) {
        return this.accountDefs.races[character.characterBase.raceHash].raceName;
    };

    this.getCharacterClass = function(character) {
        return this.accountDefs.classes[character.characterBase.classHash].className;
    };

    this.getCharacterGender = function(character) {
        return this.accountDefs.genders[character.characterBase.genderHash].genderName;
    };

    this.getCharacterById = function(charId) {
        if (!this.account || !this.account.characters) {
            return null;
        }

        for (var i = 0; i < this.account.characters.length; i++) {
            var character = this.account.characters[i];
            if (character.characterBase.characterId == charId) {
                return character;
            }
        }
        return null;
    };

    this.aggregateBuckets = function(charIds, includeVault) {
        return $q(function(resolve) {
            if (!charIds) {
                charIds = _.pluck(_.pluck(self.account.characters, 'characterBase'), 'characterId');
            }

            var promises = {};

            _.forEach(charIds, function (id) {
                promises[id] = BungieClient.findCharacterInventory(self.activeMemberType, self.activeMemberId, id);
            });

            if (typeof includeVault == 'undefined' || includeVault) {
                promises.vault = BungieClient.findVault(self.activeMemberType);
            }

            $q.all(promises).then(function(results) {
                _.forEach(results, function(result, charId) {
                    charId == 'vault' ? onVaultResponse(result) : onInventoryResponse(result, charId);
                });

                resolve(self.buckets);
            });
        });
    };

    this.filterBuckets = function() {
        var filters = ItemFilters.filters;
        var buckets = sortBuckets(_.merge({}, self.buckets));

        _.forEach(buckets, function (bucket) {
            // order here is important - items first then bucket can be filtered if empty
            $filter('bucketItemsFilter')(bucket.items, filters);
            $filter('bucketFilter')(bucket, filters);
        });

        return buckets;
    };
};

angular
    .module('app.bungie')
    .service('BungieService', BungieService);
