'use strict';

var VaultCtrl = function($scope, BungieService) {
    var load = function(charIds, vault) {
        if (!BungieService.account) {
            return;
        }

        BungieService
            .aggregateBuckets(charIds, vault)
            .then(function() {
                $scope.buckets = BungieService.filterBuckets();
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
};

angular
    .module('app.vault')
    .controller('VaultCtrl', ['$scope', 'BungieService', VaultCtrl]);
