var ItemFilters = function($rootScope) {
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
        location: 'any',
        quality: {
            exotic: true,
            legendary: true,
            rare: false,
            uncommon: false,
            common: false
        },
        isEquipped: false,
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
    .filter('itemName', function() {
        return function(items, name) {
            _.forEach(items, function(item) {
                if (name.length > 0) {
                    var regex = new RegExp(name, 'i');
                    if (!item.itemName.match(regex)) {
                        item.hidden = true;
                    }
                }
            });

            return items;
        }
    })
    .filter('itemTier', function() {
        return function(items, quality) {
            _.forEach(items, function(item) {
                if (quality[item.tierTypeName.toLocaleLowerCase()] != true) {
                    item.hidden = true;
                }
            });

            return items;
        }
    })
    .filter('itemDamage', function() {
        return function(items, damage) {
            _.forEach(items, function(item) {
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
            });

            return items;
        }
    })
    .filter('itemGridComplete', function() {
        return function(items, isGridComplete) {
            _.forEach(items, function(item) {
                if (isGridComplete && !item.isGridComplete) {
                    item.hidden = true;
                }
            });

            return items;
        }
    })
    .filter('itemEquipped', function() {
        return function(items, isEquipped) {
            _.forEach(items, function(item) {
                if (isEquipped && !item.isEquipped) {
                    item.hidden = true;
                }
            });

            return items;
        }
    })
    .filter('itemLocation', function() {
        return function(items, location) {
            _.forEach(items, function(item) {
                if (location == 'vault') {
                    if (item.charId) {
                        item.hidden = true;
                    }
                } else if (location != 'any') {
                    if (location != item.charId) {
                        item.hidden = true;
                    }
                }
            });

            return items;
        }
    });
