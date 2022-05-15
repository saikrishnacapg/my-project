angular.module('myaccount.wizard').config([
    'formRegistryProvider',
    'arrangementConstants',
    (formRegistryProvider, arrangementConstants) => {
        formRegistryProvider.registerForm({
            id: 'makepaymentp2p',
            title: 'Make a payment',
            analytics: {
                formName: 'make a payment'
            },
            controller: [
                'viewArrangementDetailsModel',
                'account',
                '$filter',
                'formController',
                '$scope',
                'formArgs',
                'p2pArrangementService',
                function (
                    viewArrangementDetailsModel,
                    account,
                    $filter,
                    formController,
                    $scope,
                    formArgs,
                    p2pArrangementService
                ) {
                    let self = this;
                    const zeroAmount = 0;
                    const fractionDigits = 2;
                    self.contractAccountType = account.contractAccountType;
                    self.contractAccountNumber = account.contractAccountNumber;
                    self.viewArrangementDetails = viewArrangementDetailsModel;
                    self.minimumValidationAmount = arrangementConstants.minimumTransaction.DIRECTDEBIT_MIN_AMOUNT;
                    self.paymentArrangementData = this.viewArrangementDetails.p2p_instalment.filter(
                        p => p.outstanding_amount > zeroAmount
                    );
                    self.date = $filter('date')(new Date(), 'yyyy-MM-dd');
                    self.p2pPendingArrangementData = [];
                    self.p2pSelectedArrangementData = [];
                    self.installmentNumber = undefined;

                    const initIndex = 1;
                    angular.forEach(this.paymentArrangementData, function (value, index) {
                        if (value.outstanding_amount > zeroAmount) {
                            value.id = index + initIndex;
                            self.p2pPendingArrangementData.push(value);
                        }
                    });
                    self.setPaymentInstalments = () => {
                        self.p2pSelectedArrangementData = self.p2pPendingArrangementData.filter(
                            p => p.id <= self.installmentNumber.id
                        );
                        self.paymentOption = undefined;
                        let sum = zeroAmount;
                        angular.forEach(self.p2pSelectedArrangementData, function (value) {
                            sum += parseFloat(value.payment_amount_promised);
                        });
                        self.totalPaymentAmount = parseFloat(sum).toFixed(fractionDigits);
                        if (self.totalPaymentAmount < arrangementConstants.minimumTransaction.DIRECTDEBIT_MIN_AMOUNT) {
                            self.paymentOption = 'paymentByCard';
                        }
                        let p2pArrangementModel = {
                            p2pArrangementFlag: true,
                            numberOfInstalments: self.installmentNumber.id,
                            totalPaymentAmount: parseFloat(sum).toFixed(fractionDigits),
                            promiseId: self.installmentNumber.promise_id
                        };
                        // FormArgs is used to pass the value to next journey, which indicates previous journey flag
                        formArgs.p2pArrangementJourneyFlag = true;
                        p2pArrangementService.assignPaymentInstalments(p2pArrangementModel);
                    };
                }
            ],
            controllerAs: 'p2pArrangementCtrl',
            authenticated: true,
            resolve: {
                account: [
                    'formArgs',
                    'Session',
                    (formArgs, Session) => {
                        return formArgs.contractAccountNumber
                            ? Session.getAccount(formArgs.contractAccountNumber)
                            : undefined;
                    }
                ],
                viewArrangementDetailsModel: [
                    'formArgs',
                    'AccountBillServer',
                    'ViewArrangementDetailsModel',
                    'Utils',
                    (formArgs, AccountBillServer, ViewArrangementDetailsModel, Utils) => {
                        if (!formArgs.contractAccountNumber) {
                            return;
                        }
                        return Utils.promiseThen(
                            AccountBillServer.getPaymentArrangementDetails(formArgs.contractAccountNumber),
                            result => {
                                return ViewArrangementDetailsModel.build(result);
                            }
                        );
                    }
                ]
            },
            states: [
                {
                    id: 'make-payment-details',
                    checkpoint: true,
                    title: 'Make a payment',
                    templateUrl: 'app/wizards/view-arrangement/p2p-arrangement.html',
                    nextMsg: 'Next',
                    next: [
                        '$scope',
                        // eslint-disable-next-line consistent-return
                        $scope => {
                            if ($scope.p2pArrangementCtrl.paymentOption === 'paymentByBank') {
                                return '^paymentByBank';
                            } else if ($scope.p2pArrangementCtrl.paymentOption === 'paymentByCard') {
                                return '^payment';
                            }
                        }
                    ],
                    disableNext: function ($scope) {
                        return !(
                            $scope.p2pArrangementCtrl.installmentNumber && $scope.p2pArrangementCtrl.paymentOption
                        );
                    }
                }
            ]
        });
    }
]);

angular.module('myaccount.wizard').service('p2pArrangementService', function () {
    let self = this;
    self.p2pArrangementModel = {};

    self.assignPaymentInstalments = _p2pArrangementModel => {
        self.p2pArrangementModel = {
            p2pArrangementFlag: _p2pArrangementModel.p2pArrangementFlag,
            numberOfInstalments: _p2pArrangementModel.numberOfInstalments,
            totalPaymentAmount: _p2pArrangementModel.totalPaymentAmount,
            promiseId: _p2pArrangementModel.promiseId
        };
    };
});
