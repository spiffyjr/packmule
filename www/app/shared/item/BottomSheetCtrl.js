'use strict';

var BottomSheetCtrl = function($scope, $mdBottomSheet, $mdToast, ItemService) {
    var toasty = function(message) {
        $mdToast.showSimple(message);
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
    .controller('BottomSheetCtrl', BottomSheetCtrl);
