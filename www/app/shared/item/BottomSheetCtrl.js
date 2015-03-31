'use strict';

var BottomSheetCtrl = function($scope, $mdBottomSheet, $mdToast, ItemService) {
    var toasty = function(message) {
        $mdToast.show(
            $mdToast.simple()
                .content(message)
                .position('top right')
        );
    };

    $scope.equipItem = function(item, charId) {
        $mdBottomSheet.hide();
        ItemService
            .equipItem(item, charId)
            .then(toasty, toasty);
    };

    $scope.transferItem = function(item, charId) {
        $mdBottomSheet.hide();
        ItemService
            .transferItem(item, charId)
            .then(toasty, toasty);
    };
};

angular
    .module('app.item')
    .controller('BottomSheetCtrl', ['$scope', '$mdBottomSheet', '$mdToast', 'ItemService', BottomSheetCtrl]);
