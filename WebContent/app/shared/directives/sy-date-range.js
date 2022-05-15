/**
 * date range directive - start and end date fields
 *
 */
angular.module('myaccount.directives').directive('syDateRange', function ($log,$parse,$compile) {
    return {
        restrict: 'E',
        scope: {
            data: "=",
            filter: "=",
            maxRangeText: "@",
            maxRangeValue: "@"
        },
        templateUrl: 'app/shared/directives/sy-date-range.html',
        controller: 'DateRangeController',
        controllerAs: 'ctrl'
    };
});