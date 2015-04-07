'use strict';

var AdCtrl = function($scope) {
    if (packmule.Platform.isMobile()) {
        $scope.isOwned = function() {
            return store.get('ads').owned;
        };

        $scope.removeAds = function () {
            store.order('ads');
        };
    }
};

angular
    .module('app.ad')
    .controller('AdCtrl', ['$scope', AdCtrl]);
