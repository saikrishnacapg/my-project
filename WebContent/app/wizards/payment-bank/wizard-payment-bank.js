/**
 * BANK:
 * bsb: 062039
 * acc: 123456789
 *
 * CARD:
 * cardNumber: 5123456789012346
 * expiry: 05/17
 */
angular.module('myaccount.wizard').constant('AmountMaxLimit', { amount: 500 });
angular.module('myaccount.wizard').config([
    'formRegistryProvider',
    function (formRegistryProvider) {
        formRegistryProvider.registerForm({
            id: 'paymentByBank',
            title: 'One-off bank account payment',
            analytics: {
                startFunction: function (state) {
                    return false;
                }
            },
            controller: [
                '$scope',
                'account',
                'OneOffPaymentServer',
                '$filter',
                'checkOneOffPaymentDetails',
                'Modals',
                'AmountMaxLimit',
                'Source',
                'AccountUtils',
                'arrangementConstants',
                'formArgs',
                'p2pArrangementService',
                'AnalyticsServer',
                function (
                    $scope,
                    account,
                    OneOffPaymentServer,
                    $filter,
                    checkOneOffPaymentDetails,
                    Modals,
                    AmountMaxLimit,
                    Source,
                    AccountUtils,
                    arrangementConstants,
                    formArgs,
                    p2pArrangementService,
                    AnalyticsServer
                ) {
                    let self = this;
                    // May or may not have an account
                    self.account = account;
                    self.transferp2pArrangementModel = formArgs.p2pArrangementJourneyFlag
                        ? p2pArrangementService.p2pArrangementModel
                        : undefined;
                    self.numberOfInstalments =
                        self.transferp2pArrangementModel && self.transferp2pArrangementModel.p2pArrangementFlag
                            ? self.transferp2pArrangementModel.numberOfInstalments
                            : '';
                    self.p2pPromiseId =
                        self.transferp2pArrangementModel && self.transferp2pArrangementModel.p2pArrangementFlag
                            ? self.transferp2pArrangementModel.promiseId
                            : '';
                    self.viewStatusBankPaymentsDetails = checkOneOffPaymentDetails;
                    self.existingAccount =
                        angular.isDefined(account) && angular.isDefined(account.contractAccountNumber);
                    self.payData = {
                        contractAccountNumber: undefined,
                        paymentNumber: undefined,
                        instalment: {
                            amount: undefined,
                            bankDetails: {
                                accountName: undefined,
                                bsbNumber: undefined,
                                accountNumber: undefined
                            },
                            directDebitType: 'BANK',
                            paymentFreq: 'DAILY'
                        },
                        todayDate: undefined,
                        termsAccepted: false,
                        sourceId: Source.sourceId
                    };
                    if (self.p2pPromiseId) {
                        angular.extend(self.payData, {
                            promiseId: self.p2pPromiseId
                        });
                    }

                    self.customerAmountlimit = AmountMaxLimit.amount;
                    if (self.existingAccount) {
                        // Prepopulate
                        self.payData.contractAccountNumber = self.account.contractAccountNumber;
                        self.payData.paymentNumber = self.account.paymentInfo.paymentNumber;
                        self.payData.instalment.amount =
                            this.transferp2pArrangementModel && self.transferp2pArrangementModel.p2pArrangementFlag
                                ? parseFloat(self.transferp2pArrangementModel.totalPaymentAmount)
                                : self.account.paymentInfo.accountBalance && self.account.paymentInfo.accountBalance > 0
                                    ? parseFloat(self.account.paymentInfo.accountBalance.toFixed(2))
                                    : "";
                        self.totalOwningAmount =
                            self.account.paymentInfo.accountBalance && self.account.paymentInfo.accountBalance > 0
                                ? self.account.paymentInfo.accountBalance.toFixed(2)
                                : '';
                        self.maxAmountlimitErrorLabel =
                            parseFloat(self.totalOwningAmount) > parseFloat(self.customerAmountlimit)
                                ? self.totalOwningAmount
                                : self.customerAmountlimit;
                        self.payData.todayDate = $filter('date')(new Date(), 'yyyy-MM-dd');
                    }
                    self.makeBankPayment = () => {
                        if (self.numberOfInstalments) {
                            AnalyticsServer.addFormOptionSelection(arrangementConstants.analyticsPaymentFrequency.numberOfInstalments, self.numberOfInstalments);
                        }
                        let contractAccountNumber = self.payData.contractAccountNumber;
                        self.payData.instalment.endDate = self.payData.instalment.startDate;
                        let requestData = self.payData;
                        return OneOffPaymentServer.processBankPayment(contractAccountNumber, requestData, false).then(
                            function (servicesResponse) {
                                return OneOffPaymentServer.getPaymentResult(contractAccountNumber).then(function (
                                    paymentResponse
                                ) {
                                    let paymentValue = paymentResponse;
                                    paymentValue.paymentNumber = self.payData.paymentNumber;
                                    paymentValue.numberOfInstallment = self.numberOfInstalments
                                        ? self.numberOfInstalments
                                        : null;
                                    self.payResult = paymentValue;
                                    return paymentValue;
                                });
                            }
                        );
                    };
                    self.showHelpText = function (title, text) {
                        Modals.showAlert(title, text);
                    };

                    self.usabilla_surveytrigger = function (VURL) {
                        vocvirtualurlsurvey(VURL);
                        return true;
                    };

                    $scope.showBankAccountName = function () {
                        Modals.showAlert('Bank Account Holder Name', $rootScope.messages.H124, {});
                    };
                    $scope.showBsbInfo = function () {
                        Modals.showAlert('BSB', $rootScope.messages.MA_H10, {});
                    };

                    $scope.showAccountNumberInfo = function () {
                        Modals.showAlert('Account number', $rootScope.messages.MA_H11, {});
                    };

                    self.getTelelphoneAnchor = function () {
                        return this.getTelephoneByAccountType().split(' ').join();
                    };

                    self.getTelephoneByAccountType = function () {
                        return AccountUtils.isResidential(this.account)
                            ? arrangementConstants.phoneNumber.RESIDENTIAL
                            : arrangementConstants.phoneNumber.BUSINESS;
                    };
                }
            ],
            controllerAs: 'oneOffPaymentCtrl',
            showProgress: true,
            authenticated: true,
            resolve: {
                account: [
                    'formArgs',
                    'Session',
                    function (formArgs, Session) {
                        return formArgs.contractAccountNumber
                            ? Session.getAccount(formArgs.contractAccountNumber)
                            : undefined;
                    }
                ],
                checkOneOffPaymentDetails: [
                    'formArgs',
                    'OneOffPaymentServer',
                    'Utils',
                    function (formArgs, OneOffPaymentServer, Utils) {
                        if (!formArgs.contractAccountNumber) {
                            return;
                        }
                        return Utils.promiseThen(
                            OneOffPaymentServer.checkOneOffPayment(formArgs.contractAccountNumber),
                            function (result) {
                                return result;
                            }
                        );
                    }
                ]
            },
            states: [
                {
                    skip: [
                        '$scope',
                        function ($scope) {
                            return $scope.oneOffPaymentCtrl.viewStatusBankPaymentsDetails.oneOffPaymentActive
                                ? 'noviewAccessExistingOOP'
                                : $scope.oneOffPaymentCtrl.viewStatusBankPaymentsDetails.isPaymentLock
                                    ? 'lockViewExistingOOP'
                                    : false;
                        }
                    ],
                    id: 'bankPaymentDetails',
                    title: 'Bank payment details',
                    checkpoint: true,
                    templateUrl: 'app/wizards/payment-bank/pay-bank.html',
                    disableNext: function ($scope) {
                        return false;
                    }
                },
                {
                    id: 'bankPaymentConfirm',
                    title: 'Confirmation',
                    checkpoint: true,
                    templateUrl: 'app/wizards/payment-bank/pay-bank-confirm.html',
                    nextMsg: 'Submit payment',
                    disableNext: function ($scope) {
                        return !$scope.oneOffPaymentCtrl.payData.termsAccepted;
                    },
                    next: [
                        '$scope',
                        'Busy',
                        'Utils',
                        function ($scope, Busy, Utils) {
                            $scope.wizard.context.navbar.disableNext = true;
                            return Busy.doing(
                                'next',
                                $scope.oneOffPaymentCtrl.makeBankPayment().then(function (paymentResponse) {
                                    return paymentResponse ? 'bankpaymentsuccess' : 'declined';
                                }, _.constant('failed'))
                            );
                        }
                    ]
                },
                {
                    id: 'bankpaymentsuccess',
                    title: 'Success',
                    completed: true,
                    templateUrl: 'app/wizards/payment-bank/pay-bank-success.html'
                },
                {
                    id: 'noviewAccessExistingOOP',
                    title: 'No Access to View',
                    progress: false,
                    completed: true,
                    templateUrl: 'app/wizards/payment-bank/pay-bank-noViewAccess.html'
                },
                {
                    id: 'lockViewExistingOOP',
                    title: 'No Access to View',
                    progress: false,
                    checkpoint: true,
                    templateUrl: 'app/wizards/payment-bank/pay-bank-lockView.html',
                    back: 'exit',
                    backMsg: 'Close',
                    exitOnBack: true,
                    next: [
                        function goToCreditCardPayment() {
                            return '^payment';
                        }
                    ],
                    nextMsg: 'Next'
                }
            ]
        });
    }
]);

angular.module('myaccount.wizard').factory('OneOffPaymentServer', function (http) {
    var OneOffPaymentServer = {
        processBankPayment: function (contractAccountNumber, requestData) {
            return http({
                method: 'POST',
                url: `/oneOffPayment/${contractAccountNumber}/setupOneOffPayment`,
                data: requestData
            });
        },
        checkOneOffPayment: function (contractAccountNumber) {
            return http({
                method: 'POST',
                url: `/oneOffPayment/${contractAccountNumber}/checkOneOffPaymentDetails`
            });
        },

        getPaymentResult: function (contractAccountNumber) {
            return http({
                method: 'POST',
                url: `/oneOffPayment/${contractAccountNumber}/getPaymentResult`
            });
        },
        sendResultEmail: function (payResult) {
            return http({
                method: 'POST',
                url: '/oneOffPayment/notifyPaymentResultByEmail',
                data: payResult
            });
        },
        downloadPdf: function (payResult) {
            return http({
                method: 'POST',
                url: '/oneOffPayment/downloadPdf',
                data: payResult,
                responseType: 'arraybuffer'
            });
        }
    };

    return OneOffPaymentServer;
});
