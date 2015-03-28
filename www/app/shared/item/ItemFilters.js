var ItemFilters = function($rootScope) {
    var self = this;

    this.filterGroups = {
        armor: [
            'BUCKET_ARMS',
            'BUCKET_CHEST',
            'BUCKET_HEAD',
            'BUCKET_LEGS'
        ],
        weapons: [
            'BUCKET_HEAVY_WEAPON',
            'BUCKET_PRIMARY_WEAPON',
            'BUCKET_SPECIAL_WEAPON'
        ],
        vanity: [
            'BUCKET_CLASS_ITEMS',
            'BUCKET_EMBLEM',
            'BUCKET_GHOST',
            'BUCKET_SHADER',
            'BUCKET_SHIP',
            'BUCKET_VEHICLE'
        ],
        other: [
            'BUCKET_CONSUMABLES',
            'BUCKET_MATERIALS'
        ]
    };

    this.filterDefaults = {
        name: '',
        category: {
            armor: true,
            other: false,
            vanity: true,
            weapons: true
        },
        damage: {
            arc: true,
            kinetic: true,
            solar: true,
            void: true
        },
        location: {
            vault: true
        },
        quality: {
            exotic: true,
            legendary: true,
            rare: false,
            uncommon: false,
            common: false
        },
        isEquipped: false,
        isGridOpen: false,
        isGridComplete: false
    };

    this.filters = _.merge({}, this.filterDefaults);

    this.defaults = function() {
        return _.merge({}, this.filterDefaults);
    };

    this.clear = function() {
        this.set(_.merge({}, this.filterDefaults));
    };

    this.set = function(value) {
        this.filters = _.merge({}, value);
        $rootScope.$broadcast('ItemFilters:updated');
    };
};

angular
    .module('app.item')
    .service('ItemFilters', ItemFilters)
    .filter('bucketFilter', function($filter) {
        return function(bucket, filters) {
            bucket.hidden = false;

            $filter('bucketCategory')(bucket, filters.category);
            $filter('bucketEmpty')(bucket);

            return bucket;
        }
    })
    .filter('bucketItemsFilter', function($filter) {
        return function(items, filters) {
            _.forEach(items, function(item) {
                item.hidden = false;

                $filter('itemName')(item, filters.name);
                $filter('itemTier')(item, filters.quality);
                $filter('itemDamage')(item, filters.damage);
                $filter('itemEquipped')(item, filters.isEquipped);
                $filter('itemGridComplete')(item, filters.isGridComplete);
                $filter('itemGridOpen')(item, filters.isGridOpen);
                $filter('itemLocation')(item, filters.location);
            });
            return items;
        };
    })
    .filter('bucketCategory', function(ItemFilters) {
        return function(bucket, categories) {
            _.forEach(categories, function(value, category) {
                var groups = ItemFilters.filterGroups[category];
                if (!groups) {
                    return;
                }

                if (!value && groups.indexOf(bucket.bucketIdentifier) > -1) {
                    bucket.hidden = true;
                }
            });
            return bucket;
        }
    })
    .filter('bucketEmpty', function() {
        return function(bucket) {
            if (_.where(bucket.items, {hidden: true}).length == bucket.items.length) {
                bucket.hidden = true;
            }
            return bucket;
        }
    })
    .filter('itemName', function() {
        return function(item, name) {
            if (name.length > 0) {
                var regex = new RegExp(name, 'i');
                if (!item.itemName.match(regex)) {
                    item.hidden = true;
                }
            }
            return item;
        }
    })
    .filter('itemTier', function() {
        return function(item, quality) {
            if (quality[item.tierTypeName.toLocaleLowerCase()] != true) {
                item.hidden = true;
            }
            return item;
        }
    })
    .filter('itemDamage', function() {
        return function(item, damage) {
            if (item.isEquipment) {
                if (item.damageType == 2 && !damage.arc) {
                    item.hidden = true;
                }
                if (item.damageType == 3 && !damage.solar) {
                    item.hidden = true;
                }
                if (item.damageType == 4 && !damage.void) {
                    item.hidden = true;
                }
                if (item.damageType == 0 && item.primaryStat && item.primaryStat.value > 0 && !damage.kinetic) {
                    item.hidden = true;
                }
            }
            return item;
        }
    })
    .filter('itemGridComplete', function() {
        return function(item, isGridComplete) {
            if (isGridComplete && !item.isGridComplete) {
                item.hidden = true;
            }
            return item;
        }
    })
    .filter('itemGridOpen', function() {
        return function(item, isGridOpen) {
            if (isGridOpen && item.isGridComplete) {
                item.hidden = true;
            }
            return item;
        }
    })
    .filter('itemEquipped', function() {
        return function(item, isEquipped) {
            if (isEquipped && !item.isEquipped) {
                item.hidden = true;
            }
            return item;
        }
    })
    .filter('itemLocation', function() {
        return function(item, location) {
            if (item.charId && !location[item.charId]) {
                item.hidden = true;
            } else if (!item.charId && !location.vault) {
                item.hidden = true;
            }
            return item;
        }
    });
