angular.module('myaccount.wizard').config(['formRegistryProvider', function (formRegistryProvider) {

    formRegistryProvider.registerForm({
        id: 'directdebit-update-instalments',
        title: 'Direct Debit',
        analytics: {
            formName: 'direct debit instalments'
        },
        controller: ['formArgs', 'Busy', 'DirectDebitServer', 'Utils', 'AccountUtils', 'Source',
            function (formArgs, Busy, DirectDebitServer, Utils, AccountUtils, Source) {
                var self = this;
                self.account = formArgs.account,
                    self.model = {
                        paymentType: formArgs.paymentType,
                        Type: 'Update Setup',
                        instalment: formArgs.instalment,
                        sourceId: Source.sourceId
                    };
                self.isResidential = AccountUtils.isResidential(self.account);
                self.minDate = moment();
                self.maxDate = moment().add(1, 'year');
                self.model.instalment['amount'] = parseFloat(self.model.instalment.amount);
                self.model.instalment.ccDetails['expiryMonth'] = moment(self.model.instalment.ccDetails.expiryDate).format("MM");
                self.model.instalment.ccDetails['expiryYear'] = moment(self.model.instalment.ccDetails.expiryDate).format("YY");
                self.model.instalment.ccDetails['showdefaultdetails'] = true;
                self.model.todayDate = moment().format('DD MMM YYYY');
                if (self.model.instalment.directDebitType === "CARD") {
                    self.model.instalment.ccDetails['showdefaultdetails'] = false;
                    angular.extend(self.model.instalment.ccDetails, {
                        storedCards: [{
                            expiryMonth: moment(self.model.instalment.ccDetails.expiryDate).format("MM"),
                            expiryYear: moment(self.model.instalment.ccDetails.expiryDate).format("YY"),
                            dvToken: self.model.instalment.ccDetails.dvToken,
                            maskedCreditCardNumber: self.model.instalment.ccDetails.maskedCreditCardNumber,
                            creditCardHolder: self.model.instalment.ccDetails.creditCardHolder,
                            creditCardType: self.model.instalment.ccDetails.creditCardType,

                        }],
                        newCard: {                  // new card payments
                            cardHolderName: undefined,
                            cardNumber: undefined,
                            expiryMonth: undefined,
                            expiryYear: undefined,
                            cardType: undefined,
                            subType: undefined,
                            maskedCardNumber: undefined,
                            cardSurCharge: undefined,
                            displayCardType: undefined
                        }
                    });
                    self.model.instalment.ccDetails['hasStoredCards'] = self.model.instalment.ccDetails.storedCards.length > 0;
                }
                self.showStartDateWarning = false;
                self.showEndDateWarning = false;
                var todayInstalmentDate= moment().add('days', 1).format("YYYY-MM-DD");
                var existingInstalmentDate =  moment(self.model.instalment.startDate).format("YYYY-MM-DD");
                if (todayInstalmentDate <= existingInstalmentDate) {
                    self.model.instalment.startDate = moment(self.model.instalment.startDate).format("YYYY-MM-DD");
                } else {
                    self.model.instalment.startDate = todayInstalmentDate;
                }
                self.updateInstalment_Payment = function () {
                    if (self.model.paymentType === 'SPLIT') {
                        //delete self.model['directDebit'];
                        self.model.instalment.startDate = moment(self.model.instalment.startDate).format("YYYY-MM-DD");
                        self.model.instalment.endDate = (self.model.instalment.endDate) ? self.model.instalment['endDate'] = moment(self.model.instalment.endDate).format("YYYY-MM-DD") : '9999-12-31';

                        if ('BANK' === self.model.instalment.directDebitType) {
                            //delete self.model.instalment['ccDetails'];

                        } else if ('CARD' === self.model.instalment.directDebitType) {
                            //delete self.model.instalment['bankDetails'];
                            if (self.model.instalment.ccDetails.showdefaultdetails === true || self.model.instalment.ccDetails.newCardSelected === true) {
                                self.model.instalment.ccDetails.maskedCreditCardNumber = self.model.instalment.ccDetails.newCard.maskedCreditCardNumber;
                                self.model.instalment.ccDetails.creditCardHolder = self.model.instalment.ccDetails.newCard.creditCardHolder;
                                self.model.instalment.ccDetails.cardNumber = self.model.instalment.ccDetails.newCard.cardNumber;
                                self.model.instalment.ccDetails.expiryMonth = self.model.instalment.ccDetails.newCard.expiryMonth;
                                self.model.instalment.ccDetails.expiryYear = self.model.instalment.ccDetails.newCard.expiryYear;
                                self.model.instalment.ccDetails.dvToken = "";
                                self.model.instalment.ccDetails.creditCardType = "";
                                self.model.instalment.ccDetails['cardType'] = "";
                                delete self.model.instalment.ccDetails['newCard'];
                            } else {
                                delete self.model.instalment.ccDetails['newCard'];
                                self.model.instalment.ccDetails.creditCardHolder = self.model.instalment.ccDetails.storedCards[0].creditCardHolder;
                                self.model.instalment.ccDetails['cardType'] = self.model.instalment.ccDetails.storedCards[0].creditCardType;
                                self.model.instalment.ccDetails.expiryDate = moment(self.model.instalment.ccDetails.expiryDate).format("YYYY-MM-DD");
                                self.model.instalment.ccDetails.expiryMonth = moment(self.model.instalment.ccDetails.expiryDate).format("MM");
                                self.model.instalment.ccDetails.expiryYear = moment(self.model.instalment.ccDetails.expiryDate).format("YY");
                                self.model.instalment.ccDetails.dvToken = self.model.instalment.ccDetails.storedCards[0].dvToken
                                self.model.instalment.ccDetails.maskedCreditCardNumber = self.model.instalment.ccDetails.storedCards[0].maskedCreditCardNumber;
                            }
                        }
                        return true;
                    }
                };
                self.updateInstalment = function () {
                    if (self.model.paymentType === 'SPLIT') {
                        delete self.model['directDebit'];
                        self.model.instalment.startDate = moment(self.model.instalment.startDate).format("YYYY-MM-DD");
                        self.model.instalment.endDate = (self.model.instalment.endDate) ? self.model.instalment['endDate'] = moment(self.model.instalment.endDate).format("YYYY-MM-DD") : '9999-12-31';

                        if ('BANK' === self.model.instalment.directDebitType) {
                            delete self.model.instalment['ccDetails'];

                        } else if ('CARD' === self.model.instalment.directDebitType) {
                            delete self.model.instalment['bankDetails'];
                            /*if (self.model.instalment.ccDetails.showdefaultdetails === true || self.model.instalment.ccDetails.newCardSelected === true){
                                //self.model.instalment.ccDetails['cardType'] = self.model.instalment.ccDetails.newCard.creditCardType;
                                //self.model.instalment.ccDetails.expiryDate = moment(self.model.instalment.ccDetails.expiryDate).format("YYYY-MM-DD");
                                self.model.instalment.ccDetails.creditCardHolder = self.model.instalment.ccDetails.newCard.creditCardHolder ;
                                self.model.instalment.ccDetails.cardNumber= self.model.instalment.ccDetails.newCard.cardNumber;
                                self.model.instalment.ccDetails.expiryMonth = self.model.instalment.ccDetails.newCard.expiryMonth;
                                self.model.instalment.ccDetails.expiryYear = self.model.instalment.ccDetails.newCard.expiryYear;
                                self.model.instalment.ccDetails.dvToken = "";
                                //delete self.model.instalment.ccDetails['newCard'];
                            }else {
                                //delete self.model.instalment.ccDetails['newCard'];
                                self.model.instalment.ccDetails['cardType'] = self.model.instalment.ccDetails.creditCardType;
                                self.model.instalment.ccDetails.expiryDate = moment(self.model.instalment.ccDetails.expiryDate).format("YYYY-MM-DD");
                                self.model.instalment.ccDetails.expiryMonth = moment(self.model.instalment.ccDetails.expiryDate).format("MM");
                                self.model.instalment.ccDetails.expiryYear = moment(self.model.instalment.ccDetails.expiryDate).format("YY");
                            }*/
                            if(self.model.instalment.ccDetails.showdefaultdetails === true || self.model.instalment.ccDetails.newCardSelected === true){
                                self.model.instalment.ccDetails['cardType'] = self.model.instalment.ccDetails.creditCardType;
                            }
                            self.model.instalment.ccDetails.expiryDate = moment(self.model.instalment.ccDetails.expiryDate).format("YYYY-MM-DD");
                            self.model.instalment.ccDetails.expiryMonth = self.model.instalment.ccDetails.expiryMonth;
                            self.model.instalment.ccDetails.expiryYear = self.model.instalment.ccDetails.expiryYear;
                        }
                        return Utils.promiseThen(Busy.doing('next', DirectDebitServer.setup(self.account.contractAccountNumber, self.model, false)), undefined).then(function () {
                            if (self.model.paymentType === 'SPLIT') {
                                Utils.setGoal("Goal_DDI_Opt_In");
                            }else{
                                Utils.setGoal("Goal_DD_Opt_In");
                            }
                        });;
                    }
                };
            }],
        controllerAs: 'signUpCtrl',
        showProgress: true,
        authenticated: true,
        states: [
            {
                id: 'setup-instalments',
                checkpoint: true,
                templateUrl: 'app/wizards/directdebit/directdebit-instalments.html',
                controller: ['$scope', 'DateUtils', function ($scope, DateUtils) {
                    $scope.$watch('signUpCtrl.model.instalment.startDate', function (newValue, oldValue) {
                        if (!!newValue) {
                            try {
                                var momentDate = moment(newValue);
                                var day = momentDate.day();
                                $scope.signUpCtrl.showStartDateWarning = (day == 6 || day == 0 || DateUtils.isPublicHoliday(momentDate)) ? true : false;
                            }
                            catch (e) {
                                $scope.signUpCtrl.showStartDateWarning = false;
                            }
                        }
                    });

                    $scope.$watch('signUpCtrl.model.instalment.endDate', function (newValue, oldValue) {
                        if (!!newValue) {
                            try {
                                var momentDate = moment(newValue);
                                var day = momentDate.day();
                                $scope.signUpCtrl.showEndDateWarning = (day == 6 || day == 0 || DateUtils.isPublicHoliday(momentDate)) ? true : false;
                            }
                            catch (e) {
                                $scope.signUpCtrl.showEndDateWarning = false;
                            }
                        }
                    });
                }]
            },
            {
                id: 'setup-instalments-payment',
                checkpoint: true,
                templateUrl: 'app/wizards/directdebit/directdebit-setup-payment.html',
                next: ['$scope', function ($scope) {
                    $scope.wizard.context.navbar.disableNext = true;
                    return $scope.signUpCtrl.updateInstalment_Payment();
                }]
            },

            {
                id: 'confirm',
                checkpoint: true,
                templateUrl: 'app/wizards/directdebit/directdebit-confirm.html',
                nextMsg: 'Confirm',
                disableNext: function ($scope) {
                    return !$scope.signUpCtrl.model.termsAccepted;
                },
                next: ['$scope', function ($scope) {
                    $scope.wizard.context.navbar.disableNext = true;
                    return $scope.signUpCtrl.updateInstalment();
                }]
            },
            {
                id: 'success',
                checkpoint: true,
                completed: true,
                templateUrl: 'app/wizards/directdebit/directdebit-success-update.html',
                nextMsg: ['$scope', function ($scope) {
                    return $scope.signUpCtrl.nextState ? 'Next' : 'Close';
                }],
                next: ['$scope', 'Wizards', function ($scope, Wizards) {
                    if (!$scope.signUpCtrl.nextState) {
                        Wizards.close();
                    } else {
                        return $scope.signUpCtrl.nextState;
                    }

                }]
            }
        ]
    });
}]);