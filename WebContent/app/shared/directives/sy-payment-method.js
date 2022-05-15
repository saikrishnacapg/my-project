/**
 * Payment method directive
 *
 */
angular.module('myaccount.directives').directive('syPaymentMethod', function ($log,$parse,$compile) {
    return {
        restrict: 'E',
        scope: {
            paymentModel: '=',
            useButtonSelector: '='
        },
        templateUrl: 'app/shared/directives/sy-payment-method.html',
		controller: function ($scope) {
            if (!$scope.paymentModel) {
                $scope.paymentModel = {};
            }
        }
    };
});