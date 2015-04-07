'use strict';

var VaultCtrl = function($scope, BungieService) {
    var loading = false;

    var load = function(charIds, vault) {
        if (!BungieService.account) {
            return;
        }

        if (loading) {
            return;
        }

        loading = true;

        BungieService
            .aggregateBuckets(charIds, vault)
            .then(function() {
                $scope.buckets = BungieService.filterBuckets();
                loading = false;
            });
    };

    $scope.$on('BungieService:init', function() { load(); });
    $scope.$on('ItemService:updated', function(e, result) {
        var charIds = [];
        var vault = false;

        _.forEach(result, function(id) {
            id == 'vault' ? vault = true : charIds.push(id);
        });

        load(charIds, vault);
    });
    $scope.$on('ItemFilters:updated', function() {
        $scope.buckets = BungieService.filterBuckets();
    });

    load();
};

angular
    .module('app.vault')
    .controller('VaultCtrl', ['$scope', 'BungieService', VaultCtrl]);
