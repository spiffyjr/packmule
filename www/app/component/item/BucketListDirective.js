var BucketListDirective = function() {
    return {
        restrict: 'E',
        scope: {
            buckets: '='
        },
        templateUrl: packmule.basedir + '/component/item/bucket-list.html'
    };
};

angular
    .module('app.item')
    .directive('bucketList', BucketListDirective);
