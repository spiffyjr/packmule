var BucketListDirective = function() {
    return {
        restrict: 'E',
        scope: {
            buckets: '='
        },
        templateUrl: packmule.basedir + '/shared/item/bucket-list.html'
    };
};

angular
    .module('app.item')
    .directive('bucketList', BucketListDirective);
