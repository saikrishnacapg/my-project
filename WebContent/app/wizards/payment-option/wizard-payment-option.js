/**
 * BANK:
 * bsb: 062039
 * acc: 123456789
 *
 * CARD:
 * cardNumber: 5123456789012346
 * expiry: 05/17
 */

angular.module('myaccount.wizard').config(['formRegistryProvider', function(formRegistryProvider) {
    formRegistryProvider.registerForm({
        id: 'paymentOptions',
        title: 'Pay now',
        analytics: {
            formName: 'payment options'
        },
        controller: ['$q', '$scope', 'account',
            function ($q, $scope, account) {
                // may or may not have an account
                this.account = account;
            }],
        controllerAs: 'paymentOptionCtrl',
        authenticated: true,
        resolve: {
            account: ['formArgs', 'Session', function (formArgs, Session) {
                return formArgs.contractAccountNumber ? Session.getAccount(formArgs.contractAccountNumber) : undefined;
            }]
        },
        states:
            [
                {
                    id: 'paymentOptionsDetails',
                    title: 'Payment Options details',
                    checkpoint: true,
                    templateUrl: 'app/wizards/payment-option/pay-option.html',
                    next: ['$scope', function ($scope) {
                        if ($scope.paymentOptionCtrl.paymentOption == "paymentByBank") {
                            return '^paymentByBank';
                        }
                        if ($scope.paymentOptionCtrl.paymentOption == "paymentByCard") {
                            return '^payment';
                        }
                    }],
                    disableNext: function($scope) {
                        return !$scope.paymentOptionCtrl.paymentOption;
                    }
                }
            ]
    });
}]);



