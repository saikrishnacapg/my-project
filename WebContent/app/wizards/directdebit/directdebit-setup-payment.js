angular.module('myaccount.wizard').config(['formRegistryProvider', function(formRegistryProvider) {

    formRegistryProvider.registerForm({
        id: 'directdebit-setup-payment',
        title: 'Direct Debit',
        analytics: {
            formName: function(formArgs) {
                return formArgs.paymentType === 'FULL' ? 'Manage Direct Debit nominate account bill' : 'Manage Direct Debit nominate account instalments'
            },
            subFormId: function(formArgs) {
                return formArgs.paymentType === 'FULL' ? 'bill' : 'instalments'
            }
        },
        controller: ['formArgs', 'Busy', 'DirectDebitServer', 'Utils', 'AccountUtils', 'account',
            function(formArgs, Busy, DirectDebitServer, Utils, AccountUtils, account) {
                var self = this;

                if(formArgs.skipInstalmentOption)
                {
                    formArgs.account = account;
                    formArgs.paymentType = 'FULL';
                    formArgs.hidePaymentPlan = false;
                    formArgs.formId = 'directdebit-status';
                }

                self.account = formArgs.account;
                self.model = {
                    todayDate: moment().format('DD MMM YYYY'),
                    paymentType: formArgs.paymentType,
                    directDebit: {},
                    instalment: {}
                };
                self.hidePaymentPlan = formArgs.hidePaymentPlan;
                self.isResidential = AccountUtils.isResidential(self.account);

                self.setupPayment = function() {
                    if (self.model.paymentType === 'SPLIT') {
                        delete self.model['directDebit'];
                        self.model.instalment['paymentFreq'] = self.account.paymentInfo.directDebitInstalmentDetails.paymentFreq;
                        self.model.instalment['amount'] = self.account.paymentInfo.directDebitInstalmentDetails.amount;
                        self.model.instalment['startDate'] = moment(self.account.paymentInfo.directDebitInstalmentDetails.startDate).format("YYYY-MM-DD");
                        self.model.instalment['endDate'] = (self.account.paymentInfo.directDebitInstalmentDetails.endDate) ?
                            self.account.paymentInfo.directDebitInstalmentDetails.endDate = moment(self.account.paymentInfo.directDebitInstalmentDetails.endDate).format("YYYY-MM-DD") :
                            '9999-12-31';

                        if (self.model.instalment.directDebitType === 'CARD') {
                            delete self.model['bankDetails'];
                            self.model.instalment.ccDetails['cardType'] = self.model.instalment.ccDetails.creditCardType;
                            self.model.instalment.ccDetails.expiryDate = moment(self.model.instalment.ccDetails.expiryDate).format("YYYY-MM-DD");
                        } else {
                            delete self.model['ccDetails'];
                        }

                    } else {
                        delete self.model['instalment'];
                        if (self.model.directDebit.directDebitType === 'CARD') {
                            delete self.model['bankDetails'];
                            self.model.directDebit.ccDetails['cardType'] = self.model.directDebit.ccDetails.creditCardType;
                            self.model.directDebit.ccDetails.expiryDate = moment(self.model.directDebit.ccDetails.expiryDate).format("YYYY-MM-DD");
                        } else {
                            delete self.model['ccDetails'];
                        }
                    }
                    return Utils.promiseThen(Busy.doing('next', DirectDebitServer.setup(self.account.contractAccountNumber, self.model, false)), undefined).then(function () {
                        if (self.model.paymentType === 'SPLIT') {
                            Utils.setGoal("Goal_DDI_Opt_In");
                        }else{
                            Utils.setGoal("Goal_DD_Opt_In");
                        }
                    });
                };
            }],
        controllerAs: 'signUpCtrl',
        showProgress: true,
        authenticated: true,
        resolve: {
            account: ['formArgs', 'Session', function (formArgs, Session) {
                return Session.getAccount(formArgs.contractAccountNumber);
            }]
        },
        states: [{
            id: 'setup-payment',
            checkpoint: true,
            templateUrl: 'app/wizards/directdebit/directdebit-setup-payment.html'
        }, {
            id: 'confirm-payment',
            checkpoint: true,
            templateUrl: 'app/wizards/directdebit/directdebit-confirm.html',
            nextMsg: 'Confirm',
            disableNext: function ($scope) {
                return !$scope.signUpCtrl.model.termsAccepted;
            },
            next: ['$scope',  function($scope) {
                $scope.wizard.context.navbar.disableNext = true;
                return $scope.signUpCtrl.setupPayment();
            }]
        }, {
            id: 'success-payment',
            checkpoint: true,
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