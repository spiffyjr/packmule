'use strict';

var VaultCtrl = function($scope, BungieService) {
    var load = function() {
        if (!BungieService.account) {
            return;
        }
        BungieService
            .aggregateBuckets(null, true)
            .then(function() {
                $scope.buckets = BungieService.buckets;
            });
    };

    $scope.$on('BungieService:init', load);
    $scope.$on('BungieService:filterBuckets', function(e, result) {
        $scope.buckets = result;
    });

    load();
};

angular
    .module('app.vault')
    .controller('VaultCtrl', VaultCtrl);
