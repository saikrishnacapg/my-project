angular.module('myaccount.wizard').config(['formRegistryProvider', function(formRegistryProvider) {
    formRegistryProvider.registerForm({
        id: 'renewablerefund',
        title: 'Automated REBS Payment',
        analytics: {
            formName: 'Automatic REBS signup',
            startFunction: function(state) {
                return state.$$idx === 5 || state.$$idx === 9;
            }
        },
        controller: ['renewableRefundModel', 'formController', 'AccountUtils', 'Busy', 'PaperlessServer', 'Session', 'RebsServer', 'Utils', '$scope', 'Modals',
            function(renewableRefundModel, formController, AccountUtils, Busy, PaperlessServer, Session, RebsServer, Utils, $scope, Modals) {
                var self = this;
                self.isLoggedIn = Session.isLoggedIn();
                self.model = renewableRefundModel;
                self.paperlessEmailAddress = angular.copy(self.model.customer.emailAddress);
                self.isBpay = renewableRefundModel.account.paperlessBillSetting.isBPay;

                // No index for current transaction or 1 for next transaction
                self.multipleSupplyAddresses = function() {
                    return self.model.supplyAddresses.length > 1;
                };
                self.showBankHolderNameInfo = function() {
                    Modals.showAlert("Bank Holder Name", $rootScope.messages.H124, {});
                };

                self.setPaperlessBilling = function(withSMS) {
                    var mobileNumber = withSMS? self.model.sendSMSMobileNumber:null;
                    var mobileCountry = withSMS? self.model.mobileTelephoneCountry:null;
                    return Utils.promiseThen(Busy.doing('next', PaperlessServer.setPaperlessBilling(self.model.contractAccountNumber, self.paperlessEmailAddress, mobileNumber, mobileCountry)), function() {
                        self.model.paperlessBillingUpdated = true;
                        return 'skipdirectdebit';
                    }).then(function(){
                        Utils.setGoal('Goal_Automated_REBS_Opt_In');
                        if (mobileNumber){
                            Utils.setGoal('Goal_SMS_Opt_In');
                        }
                        if (self.paperlessEmailAddress){
                            Utils.setGoal('Goal_Paperless_Opt_In');
                        }
                    });
                };

                self.submitApplication = function() {
                    var parentCAN = self.isCollective ? _.safeAccess(renewableRefundModel, 'contractAccountNumber') : undefined;
                    return Utils.promiseThen(Busy.doing('next', RebsServer.submitRefundApplication(self.model, parentCAN).then(function () {
                        Utils.setGoal('Goal_Automated_REBS_Opt_In');
                        if (self.model.directDebit) {
                            Utils.setGoal('Goal_DD_Opt_In');
                        }
                    })), undefined);
                };
                $scope.showBankAccountName = function () {
                    Modals.showAlert('Bank Account Holder Name', $rootScope.messages.H124, {});
                };
            }],
        controllerAs: 'rrCtrl',
        showProgress: true,
        authenticated: true,
        resolve: {
        	renewableRefundModel: ['$q', 'formArgs', 'RebsServer', 'RenewableRefundModel', 'Session', 'Utils', 'ValidationService', function($q, formArgs, RebsServer, RenewableRefundModel, Session, Utils, ValidationService) {
                if (!formArgs.contractAccountNumber) {
                    return;
                }
                var promises = $q.all([RebsServer.show(formArgs.contractAccountNumber), Session.getAccount(formArgs.contractAccountNumber), ValidationService.getInternationalAreaCodesWithAU()]);
                return Utils.promiseThen(promises, function(result) {
                    return RenewableRefundModel.build(result[0], result[1], result[2]);
                });
            }]
        },
        states:
            [
                {
                    id: 'beforebeginstart',
                    title: 'Before you begin',
                    progress: false,
                    templateUrl: 'app/wizards/renewable-refund/renewable-refund-before-you-begin.html',
                    nextMsg: 'Register now',
                    skip: ['$scope', function($scope) {
                        if ($scope.rrCtrl.isBpay ){
                            return "bpay";
                        }
                    }]
                },
                {
                    skip: ['$scope', function($scope) {
                        if ($scope.rrCtrl.isBpay ) {
                            return "bpay";
                        }

                        return $scope.rrCtrl.model.paperlessBilling;
                    }],
                    id: 'refundpaperless',
                    title: 'Paperless Billing',
                    templateUrl: 'app/wizards/renewable-refund/renewable-refund-paperless.html',
                    checkpoint: true,
                    nextMsg: 'Setup paperless',
                    next: ['$scope', function($scope) {
                        return $scope.rrCtrl.setPaperlessBilling($scope.rrCtrl.model.showSMSMobileNumber);
                    }]
                },
                {
                    id: 'refundbankdetails',
                    title: 'Bank details',
                    checkpoint: true,
                    showBack: false,
                    templateUrl: 'app/wizards/renewable-refund/renewable-refund-bankdetails.html'
                },
                {
                    id: 'refundconfirm',
                    title: 'Confirmation',
                    checkpoint: true,
                    templateUrl: 'app/wizards/renewable-refund/renewable-refund-confirm.html',
                    nextMsg: 'Confirm',
                    disableNext: function($scope) {
                        return !$scope.rrCtrl.model.refundTermsAccepted;
                    },
                    next: ['$scope', function($scope) {
                        return $scope.rrCtrl.submitApplication;
                    }]
                },
                {
                    id: 'refundsuccess',
                    title: 'Success',
                    checkpoint: true,
                    completed: true,
                    templateUrl: 'app/wizards/renewable-refund/renewable-refund-success.html'
                },
                {
                    id: 'bpay',
                    progress: false,
                    title: 'Automated REBS payment',
                    templateUrl: 'app/wizards/renewable-refund/renewable-bpay-message.html',
                    completed: true
                }
            ]
    });

}]);
