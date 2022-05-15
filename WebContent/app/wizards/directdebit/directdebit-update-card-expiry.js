angular.module('myaccount.wizard').config(['formRegistryProvider', function(formRegistryProvider) {

    formRegistryProvider.registerForm({
        id: 'directdebit-update-card-expiry',
        title: 'Direct Debit',
        appendTitle: 'Update expiry date',
        analytics: {
            formName: function(formArgs) {
                return formArgs.paymentType === 'FULL' ? 'Manage Direct Debit update card expiry bill' : 'Manage Direct Debit update card expiry instalments'
            },
            subFormId: function(formArgs) {
                return formArgs.paymentType === 'FULL' ? 'bill' : 'instalments'
            }
        },
        controller: ['$log', 'formArgs', 'formController', 'Busy', 'DirectDebitServer', 'Utils', 'AccountUtils',
            function($log, formArgs, formController, Busy, DirectDebitServer, Utils, AccountUtils) {
                var self = this;
                self.account = formArgs.account,
                self.model = {
                    todayDate: moment().format('DD MMM YYYY'),
                    paymentType: formArgs.paymentType,
                    directDebit: formArgs.directDebit,
                    instalment: formArgs.instalment,
                    termsAccepted: false
                };

                self.isResidential = AccountUtils.isResidential(self.account);

                self.updateDirectDebitCreditCardExpiryDate = function() {
                    if ('FULL' === self.model.paymentType && 'CARD' === self.model.directDebit.directDebitType) {
                        return Utils.promiseThen(Busy.doing('next', DirectDebitServer.updateDirectDebitCreditCardExpiryDate(self.account.contractAccountNumber, self.model.directDebit.ccDetails)), undefined);
                    } else if ('SPLIT' === self.model.paymentType && 'CARD' === self.model.instalment.directDebitType) {
                        return Utils.promiseThen(Busy.doing('next', DirectDebitServer.updateInstalmentCreditCardExpiryDate(self.account.contractAccountNumber, self.model.instalment.ccDetails)), undefined);
                    }
                    else if("UPDATE" === self.model.paymentType){
                        return alert("need a method to update credit card details..");
                    }
                }
            }
        ],
        controllerAs: 'signUpCtrl',
        showProgress: true,
        authenticated: true,
        states: [{
            id: 'update-card-expiry',
            checkpoint: true,
            templateUrl: 'app/wizards/directdebit/directdebit-edit.html',
            next: ['$scope', 'Utils', 'Busy',  function($scope, Utils, Busy) {
                return Busy.doing('next', $scope.signUpCtrl.updateDirectDebitCreditCardExpiryDate());
            }]
        }, {
            id: 'success',
            completed: true,
            templateUrl: 'app/wizards/directdebit/directdebit-success-update.html',
            nextMsg: ['$scope', function($scope) {
                return $scope.signUpCtrl.nextState ? 'Next' : 'Close';
            }],
            next: ['$scope', 'Wizards', function ($scope, Wizards) {
                if (!$scope.signUpCtrl.nextState) {
                    Wizards.close();
                } else {
                    return $scope.signUpCtrl.nextState;
                }
            }]
        }]
    });
}]);