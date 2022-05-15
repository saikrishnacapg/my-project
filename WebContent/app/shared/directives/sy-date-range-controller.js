/**
 * Date range directive - start and end date fields
 *
 */
angular.module('myaccount.directives').controller('DateRangeController', ['$scope', '$element', '$attrs', '$transclude', 'DateRangeService', '$rootScope', function ($scope, $element, $attrs, $transclude, DateRangeService, $rootScope) {

    this.pastCutoffDate = function () {
        return DateRangeService.pastCutoffDate($scope.data.startDate);
    };

    this.startDateAfterEndDate = function() {
        return DateRangeService.startDateAfterEndDate($scope.data.startDate, $scope.data.endDate);
    };

    this.overMaxRange = function() {
        return DateRangeService.overMaxRange($scope.data.startDate, $scope.data.endDate, $scope.maxRangeValue);
    };

    this.endDateIsInFuture = function() {
        return DateRangeService.endDateIsInFuture();
    };
    this.checkMoveInDate=function () {
        if ($scope.filter != null){
            return DateRangeService.checkMoveInDate($scope.data.startDate, $scope.data.endDate, $scope.filter);
        }
        return false;
    };
    this.checkMoveOutDate=function () {
        return DateRangeService.checkMoveOutDate($scope.data.startDate, $scope.data.endDate, $scope.filter);
    };
    this.valid = function() {
        let dayDiff = `${Math.abs(moment($scope.data.startDate).diff(moment($scope.data.endDate), 'days')) + 1 } days`;
        $('#modalOK').attr("data-description", dayDiff);
        $('#modalOK').attr("data-location", 'AMI usage date request');
        $('#modalOK').attr("data-event", 'tool-interaction');
        return $scope.data.valid = !(this.pastCutoffDate() || this.startDateAfterEndDate() || this.overMaxRange() || this.endDateIsInFuture() || this.checkMoveInDate());
    };

}]);