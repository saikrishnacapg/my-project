/**
 * Payment method directive
 *
 */
angular.module('myaccount.directives').directive('syDdiPaymentMethod', function ($log,$parse,$compile) {
    return {
        restrict: 'E',
        scope: {
            paymentModel: '=',
            useButtonSelector: '='
        },
        templateUrl: 'app/shared/directives/sy-ddi-payment-method.html',
		controller: function ($scope) {
            if (!$scope.paymentModel)
                $scope.paymentModel = {}
        }
//        ,
//        controller: 'PaymentController',
//        controllerAs: 'ctrl'
    };
});