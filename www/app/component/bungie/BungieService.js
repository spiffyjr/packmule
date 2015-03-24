var BungieService = function($q, $rootScope, $http, $filter, BungieClient) {
    var CACHE_MEMBER_TYPE = 'BungieService.activeMemberType';

    var self = this;
    var loaded = false;

    this.itemDefs = null;
    this.bucketDefs = null;

    this.buckets = null;

    var sortBuckets = function(buckets) {
        var array = [];

        // sort items by tier and then by name
        _.forEach(buckets, function(bucket, bucketKey) {
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

    var aggregateResult = function(aggregate, buckets, charId) {
        _.forEach(buckets, function(bucket) {
            var bucketDef = self.bucketDefs[bucket.bucketHash];

            if (!bucketDef) {
                return;
            }

            if (!aggregate[bucket.bucketHash]) {
                aggregate[bucket.bucketHash] = {
                    id: _.uniqueId('b:'),
                    bucketHash: bucket.bucketHash,
                    bucketName: bucketDef.bucketName,
                    bucketOrder: bucketDef.bucketOrder,
                    category: bucketDef.category,
                    bucketIdentifier: bucketDef.bucketIdentifier,
                    items: []
                };
            }

            _.forEach(bucket.items, function(item) {
                var itemDef = self.itemDefs[item.itemHash];

                if (!itemDef) {
                    return;
                }

                aggregate[bucket.bucketHash].items.push({
                    id: _.uniqueId('i:'),
                    charId: (charId == 'vault' ? null : charId),
                    itemName: itemDef.itemName,
                    itemType: itemDef.itemType,
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
                });
            });
        });

        return aggregate;
    };

    var convertInventoryBuckets = function(result) {
        var buckets = {};

        _.forEach(result.data.buckets, function(bucketData) {
            _.forEach(bucketData, function(bucket) {
                buckets[bucket.bucketHash] = bucket;
            });
        });

        return buckets;
    };

    var convertVaultBuckets = function(result) {
        var buckets = {};

        _.forEach(result.data.buckets, function(bucket) {
            _.forEach(bucket.items, function(item) {
                var bucketHash = self.itemDefs[item.itemHash].bucketTypeHash;

                if (!buckets[bucketHash]) {
                    buckets[bucketHash] = {
                        items: [],
                        bucketHash: bucketHash
                    }
                }

                buckets[bucketHash].items.push(item);
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
                        self.itemDefs = result.data;
                        return $http.get('asset/json/bucket-defs.json');
                    }, reject)
                    .then(function(result) {
                        self.bucketDefs = result.data;
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

                        $rootScope.$broadcast('BungieService:init');
                        loaded = true;
                        resolve()
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

            _.forEach(charIds, function (cid) {
                promises[cid] = BungieClient.findCharacterInventory(
                    self.activeMemberType,
                    self.activeMemberId,
                    cid
                );
            });

            if (includeVault) {
                promises.vault = BungieClient.findVault(self.activeMemberType);
            }

            var aggregate = {};

            $q.all(promises).then(function(results) {
                _.forEach(results, function(result, key) {
                    if (key === 'vault') {
                        result = convertVaultBuckets(result);
                    } else {
                        result = convertInventoryBuckets(result);
                    }

                    aggregate = aggregateResult(aggregate, result, key);
                });

                self.buckets = sortBuckets(aggregate);
                resolve();
            });
        });
    };

    this.applyFilters = function(filters) {
        var buckets = _.defaults({}, this.buckets);

        _.forEach(buckets, function (bucket) {
            bucket.hidden = false;

            _.forEach(bucket.items, function(item) {
                item.hidden = false;
            });

            bucket.items = $filter('itemName')(bucket.items, filters.name);
            bucket.items = $filter('itemTier')(bucket.items, filters.quality);
            bucket.items = $filter('itemDamage')(bucket.items, filters.damage);
            bucket.items = $filter('itemEquipped')(bucket.items, filters.isEquipped);
            bucket.items = $filter('itemGridComplete')(bucket.items, filters.isGridComplete);
            bucket.items = $filter('itemLocation')(bucket.items, filters.location);
        });

        $rootScope.$broadcast('BungieService:filterBuckets', buckets);
    };
};

angular
    .module('app.bungie')
    .service('BungieService', BungieService);
