angular.module('myaccount.directives').directive('syBusyChevron', function (Busy, $log, $rootScope, promiseTracker) {
    return {
        restrict: 'A',
        scope: {
            busyClass: '@?'
        },
        transclude: true,
        templateUrl: 'app/shared/directives/sy-busy-chevron.html',
        link: function ($scope, elem, attrs, ctrls) {
            $scope.busyClass = attrs.busyClass || "glyphicon-chevron-right pull-right";

            // track promises
            var trackerId = attrs.syBusyChevron || 'global';
            var pt = promiseTracker(trackerId);

            $scope.isBusy = function() {
                return pt.active() || Busy.isDoing(trackerId);
            }
        }
    };
});