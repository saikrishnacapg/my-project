angular.module('myaccount.directives').directive('syWizardFailure', function() {
    return {
        restrict: 'EA',
        transclude: true,
        replace: true,
        scope: {
            realTime: '@',
            success: '@'
        },
        templateUrl: "app/shared/directives/sy-wizard-failure.html",
        controller: function($scope) {
            this.realTime = $scope.realTime === 'false' ? false : true; // defaults to real time transaction.
            this.success = $scope.success  === 'false' ? false : true; // defaults to success. Allows us to create different styling for successful cancellations if needed.
        },
        controllerAs: 'failureCtrl'
    }
});