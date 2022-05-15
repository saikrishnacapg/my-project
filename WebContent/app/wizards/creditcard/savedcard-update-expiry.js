angular.module('myaccount.wizard').config(['formRegistryProvider', function(formRegistryProvider) {
    formRegistryProvider.registerForm({
        id: 'SavedCard-Update-expiry',
        title: 'Manage cards - Update expiry',
        /*//appendTitle: 'Update expiry date',*/
        analytics: {
            formName: function(formArgs) {
                return formArgs.paymentType === 'FULL' ? 'Manage Direct Debit update card expiry bill' : 'Manage Direct Debit update card expiry instalments';
            },
            subFormId: function(formArgs) {
                return formArgs.paymentType === 'FULL' ? 'bill' : 'instalments';
            }
        },
        controller: ['$log', 'formArgs', 'formController', 'Busy', 'DirectDebitServer', 'Utils', 'AccountUtils',
            function($log, formArgs, formController, Busy, DirectDebitServer, Utils, AccountUtils) {
                var self = this;
                self.account = formArgs.account,
                    self.model = {
                        paymentType: formArgs.paymentType,
                        directDebit: formArgs.directDebit,
                        instalment: formArgs.instalment,
                        termsAccepted: false
                    }


                self.isResidential = AccountUtils.isResidential(self.account);

                self.updateDirectDebitCreditCardExpiryDate = function() {
                    if ('FULL' === self.model.paymentType && 'CARD' === self.model.directDebit.directDebitType) {
                        return Utils.promiseThen(Busy.doing('next', DirectDebitServer.updateDirectDebitCreditCardExpiryDate(self.account.contractAccountNumber, self.model.directDebit.ccDetails)), undefined);
                    } else if ('SPLIT' === self.model.paymentType && 'CARD' === self.model.instalment.directDebitType) {
                        return Utils.promiseThen(Busy.doing('next', DirectDebitServer.updateInstalmentCreditCardExpiryDate(self.account.contractAccountNumber, self.model.instalment.ccDetails)), undefined);
                    }
                    else if("UPDATE" === self.model.paymentType){
                        //return alert("need a method to update credit card details..");
                        return Utils.promiseThen(Busy.doing('next', DirectDebitServer.updateDirectDebitCreditCardDetails_EXP(self.account.contractAccountNumber, self.model.directDebit.ccDetails)).then(function(wasSuccessful) {
                            if (wasSuccessful) {
                                Utils.setGoal('Goal_Credit_Card_Updated');
                            }
                        }), undefined);
                    }
                };

                self.getCreditCardType = function(CreditCardtypecode) {
                    if(CreditCardtypecode == "0008") {
                        return "Mastercard credit";
                    }
                    else if(CreditCardtypecode == "0009") {
                       return "Mastercard debit";
                    }
                    else if(CreditCardtypecode == "0006") {
                       return "Visa credit";
                    }
                    else if(CreditCardtypecode == "0007") {
                        return "Visa debit";

                    }
                    else if(CreditCardtypecode == "0005") {
                       return "American Express credit";

                    }
                    else if(CreditCardtypecode == "0004") {
                        return "American Express debit";
                    }else {
                       return "";
                    }

                    /*var cardtypeupdatexpiry= Utils.getCreditCardType(maskedCreditCardNumber);
                    if( cardtypeupdatexpiry === 'amex'){
                        return "American Express";}
                    else if( cardtypeupdatexpiry === 'mastercard'){
                        return 'Mastercard credit';}
                    else if( cardtypeupdatexpiry ==='visa'){
                        return "Visa";
                    }*/
                };
            }
        ],
        controllerAs: 'SavecardexpiryCtrl',
        showProgress: true,
        authenticated: true,
        states: [{
            id: 'update-card-expiry',
            checkpoint: true,
            templateUrl: 'app/wizards/creditcard/savedcards-edit.html',
            next: ['$scope', 'Utils', 'Busy',  function($scope, Utils, Busy) {
                return Busy.doing('Confirm', $scope.SavecardexpiryCtrl.updateDirectDebitCreditCardExpiryDate());
            }]
        }, {
            id: 'success',
            completed: true,
            templateUrl: 'app/wizards/creditcard/savedcards-success-update.html',
            nextMsg: ['$scope', function($scope) {
                return $scope.SavecardexpiryCtrl.nextState ? 'Confirm' : 'Close';
            }],
            next: ['$scope', 'Wizards', function ($scope, Wizards) {
                if (!$scope.SavecardexpiryCtrl.nextState) {
                    Wizards.close();
                } else {
                    return $scope.SavecardexpiryCtrl.nextState;
                }
            }]
        }]
    });
}]);