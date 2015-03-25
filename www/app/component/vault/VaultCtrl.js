'use strict';

var VaultCtrl = function($scope, BungieService) {
    var load = function() {
        if (!BungieService.account) {
            return;
        }
        BungieService
            .aggregateBuckets(null, true)
            .then(function() {
                $scope.buckets = BungieService.filterBuckets();
            });
    };

    $scope.$on('BungieService:init', load);
    $scope.$on('ItemFilters:updated', function() {
        $scope.buckets = BungieService.filterBuckets();
    });

    load();
};

angular
    .module('app.vault')
    .controller('VaultCtrl', VaultCtrl);
