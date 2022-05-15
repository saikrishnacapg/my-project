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
	        id: 'creditcard-selectaccount',
        title: 'Manage cards',
        analytics: {
            formName: 'Manage cards'
        },
        controller: ['$scope', 'accountList', 'formController', function($scope, accountList, formController) {
            var self = this;
            this.accountList = accountList;
            this.selectAccount = function(contractAccountNumber) {
                // pop on the mydetails-state
                formController.addTask('creditcard', {'contractAccountNumber': contractAccountNumber});

            }
        }],
        controllerAs: 'myCtrl',
        showProgress: false,
        authenticated: true,
        resolve: {
            accountList: ['Session', function(Session) {
                return Session.getAccountList();
            }]
        },
        states:
            [
                {
                    id: 'select',
                    title: 'Choose an account',
                    templateUrl: 'app/wizards/mydetails/mydetails-selectaccount.html',
                    nextMsg: 'Edit your details',
                    showNext: false
                }
            ]
    });


    formRegistryProvider.registerForm({
        id: 'creditcard',
        title: 'Manage cards',
        controller: ['$q', 'account', 'Busy', 'Modals', 'PayServer', 'Utils', 'CardService', 'HiddenIframe', 'StoredCardServer', 'formController',
            function( $q, account, Busy, Modals, PayServer, Utils, CardService, HiddenIframe, StoredCardServer, formController) {
                //using the same model as pay wizard since this whole wizard was designed from pay wizard and my details wizard.
                // may or may not have an account
                var self = this;
                this.account = account;
                this.existingAccount = angular.isDefined(account) && angular.isDefined(account.contractAccountNumber);
                this.hasStoredCards = this.existingAccount && angular.isArray(account.paymentInfo.storedCards) && account.paymentInfo.storedCards.length > 0;
                this.storedCards = this.hasStoredCards ? account.paymentInfo.storedCards : undefined;

                // this is the payData we will be submitting
                this.payData = {
                    contractAccountNumber: undefined,
                    paymentNumber: undefined,
                    amount: undefined,
                    cardIndex: undefined, // stored card payments
                    newCard: { // new card payments
                        cardHolderName: undefined,
                        cardNumber: undefined,
                        expiryMonth: undefined,
                        expiryYear: undefined,
                        saveCard: false,
                        cardType: undefined
                    },
                    termsAccepted: false
                };

                this.initPaymentResult = undefined;
                this.payResult = undefined;

                // TODO: remove me
                this.CREDIT_CARD_EXPIRY_MONTHS = function() {
                    return CardService.CREDIT_CARD_EXPIRY_MONTHS_INCLUSIVE(this.payData.newCard.expiryYear);
                };

                this.CREDIT_CARD_EXPIRY_YEARS = function() {
                    return CardService.CREDIT_CARD_EXPIRY_YEARS_INCLUSIVE(this.payData.newCard.expiryMonth);
                };

                this.showHelpText = function(title, text) {
                    Modals.showAlert(title, text);
                };

                if (this.existingAccount) {
                    // prepopulate
                    this.payData.contractAccountNumber = this.account.contractAccountNumber;
                    this.payData.paymentNumber = this.account.paymentInfo.paymentNumber;
                    this.payData.amount = (this.account.paymentInfo.accountBalance && this.account.paymentInfo.accountBalance > 0) ? this.account.paymentInfo.accountBalance.toFixed(2) : "";

                    if (this.hasStoredCards) {
                        this.payData.cardIndex = this.storedCards.length - 1;
                    }
                }

                this.isStoredCardPayment = function () {
                    return !_.isUndefined(this.payData.cardIndex) && this.payData.cardIndex != -1;
                };

                this.getStoredCard = function () {
                    return this.isStoredCardPayment() ? this.storedCards[this.payData.cardIndex] : undefined;
                };


                this.setCardType = function() {
                    this.payData.newCard.cardType = Utils.getCreditCardType(this.payData.newCard.cardNumber);
                };

                this.formatCardExpiryDate = function(date) {
                    return _.padLeft(date.getMonth() + 1, 2, '0') + '/' + date.getFullYear().toString().substr(2, 2);
                };

                this.isCardExpired = function(index) {
                    var card = this.storedCards[index];
                    return new Date().getTime() > card.expiryDate.getTime();
                };

                this.requestStoredCardDeletion = function(index) {
                    var card = this.storedCards[index];
                    var promise = Modals.showConfirm('Delete saved card', 'Are you sure you wish to delete card '+card.maskedCreditCardNumber+' ?');
                    promise.then(function() {
                        return StoredCardServer.deleteStoredCreditCardDetails(self.account.contractAccountNumber, card.maskedCreditCardNumber, card.cardType, card.dvToken);
                    }).then( function() {
                        self.storedCards.splice(index, 1);
                        self.hasStoredCards = self.storedCards.length > 0;
                    }).then( function() {
                        Modals.showAlert("Card deleted", "Your card has been successfully deleted. <br/> <br/> Please note this does not affect any cards you may have setup for Direct Debit.");
                    });
                };

                this.updateCardExpiry = function(index) {
                    var card = this.storedCards[index];
                    formController.addTask('SavedCard-Update-expiry', {
                        account: self.account,
                        paymentType: "UPDATE", //"FULL",
                        directDebit: {
                            bankDetails: null,
                            ccDetails: {
                                creditCardHolder: card.cardHolderName,
                                creditCardType: card.cardType,
                                dvToken: card.dvToken,
                                expiryDate: card.expiryDate,
                                maskedCreditCardNumber: card.maskedCreditCardNumber
                            },
                            directDebitType: "CARD"
                        },
                        instalment: null
                    });
                };

            }],
        controllerAs: 'myCtrl',
        showProgress: false,
        authenticated: true,
        resolve: {
            account: ['formArgs', 'Session', function (formArgs, Session) {
                return formArgs.contractAccountNumber ? Session.getAccount(formArgs.contractAccountNumber) : undefined;
            }]
        },
        states:
            [
                {
                    id: 'creditcardlist',
                    title: 'Saved cards',
                    checkpoint: false,
                    templateUrl: 'app/wizards/creditcard/creditcard-list.html',
                    controller: ['$scope', 'Modals'],
                    nextMsg: 'Add card',
                    next: ['$scope', '$q', 'Modals', 'Utils', function($scope, $q, Modals, Utils) {
                        return '^creditcard-add';
                    }]
                }
            ]
    });

    formRegistryProvider.registerForm({
        id: 'creditcard-add',
        title: 'Add card',
        appendTitle: 'Add card',
        analytics: {
            formName: 'Manage cards - Add card'
        },
        controller: ['$q', 'account', 'Busy', 'Modals', 'PayServer', 'Utils', 'CardService', 'HiddenIframe', 'DirectDebitServer',
            function( $q, account, Busy, Modals, PayServer, Utils, CardService, HiddenIframe, DirectDebitServer) {
                // may or may not have an account
                this.account = account;
                this.existingAccount = angular.isDefined(account) && angular.isDefined(account.contractAccountNumber);

                // this is the payData we will be submitting
                this.payData = {
                    contractAccountNumber: undefined,
                    paymentNumber: undefined,
                    amount: undefined,
                    cardIndex: undefined, // stored card payments
                    newCard: { // new card payments
                        cardHolderName: undefined,
                        cardNumber: undefined,
                        expiryMonth: undefined,
                        expiryYear: undefined,
                        saveCard: false,
                        cardType: undefined
                    },
                    termsAccepted: false
                };

                // TODO: remove me
                this.CREDIT_CARD_EXPIRY_MONTHS = function() {
                    return CardService.CREDIT_CARD_EXPIRY_MONTHS_INCLUSIVE(this.payData.newCard.expiryYear);
                };

                this.CREDIT_CARD_EXPIRY_YEARS = function() {
                    return CardService.CREDIT_CARD_EXPIRY_YEARS_INCLUSIVE(this.payData.newCard.expiryMonth);
                };

                this.showHelpText = function(title, text) {
                    Modals.showAlert(title, text);
                };

                if (this.existingAccount) {
                    // prepopulate
                    this.payData.contractAccountNumber = this.account.contractAccountNumber;
                    this.payData.paymentNumber = this.account.paymentInfo.paymentNumber;
                    this.payData.amount = (this.account.paymentInfo.accountBalance && this.account.paymentInfo.accountBalance > 0) ? this.account.paymentInfo.accountBalance.toFixed(2) : "";

                    if (this.hasStoredCards) {
                        this.payData.cardIndex = this.storedCards.length - 1;
                    }
                }

                this.isStoredCardPayment = function () {
                    return !_.isUndefined(this.payData.cardIndex) && this.payData.cardIndex != -1;
                };

                this.getStoredCard = function () {
                    return this.isStoredCardPayment() ? this.storedCards[this.payData.cardIndex] : undefined;
                };

                this.setCardType = function() {
                    this.payData.newCard.cardType = Utils.getCreditCardType(this.payData.newCard.cardNumber);
                };

                this.formatCardExpiryDate = function(date) {
                    return _.padLeft(date.getMonth() + 1, 2, '0') + '/' + date.getFullYear().toString().substr(2, 2);
                }

            }],
        controllerAs: 'myCtrl',
        showProgress: true,
        authenticated: true,
        resolve: {
            account: ['formArgs', 'Session', function (formArgs, Session) {
                return formArgs.contractAccountNumber ? Session.getAccount(formArgs.contractAccountNumber) : undefined;
            }]
        },
        states:[
            {
                id: 'add',
                title: 'Add card',
                checkpoint: true,
                templateUrl: 'app/wizards/creditcard/creditcard-add.html',
                nextMsg: 'Next'
            },
            {
                id: 'confirm',
                title: 'Confirmation',
                appendTitle: 'Add card',
                checkpoint: true,
                templateUrl: 'app/wizards/creditcard/creditcard-confirm.html',
                nextMsg: 'Confirm',
                disableNext: function ($scope) {
                    return !$scope.myCtrl.payData.termsAccepted;
                },
                next: ['$scope', 'Busy', 'Utils', 'DirectDebitServer', 'Wizards', 'Modals', function($scope, Busy, Utils, DirectDebitServer, Wizards, Modals) {
                    var ccDetails =
                    {
                        cardNumber: $scope.myCtrl.payData.newCard.cardNumber,
                        creditCardHolder: $scope.myCtrl.payData.newCard.cardHolderName,
                        expiryMonth: $scope.myCtrl.payData.newCard.expiryMonth,
                        expiryYear: $scope.myCtrl.payData.newCard.expiryYear,
                        cardType: $scope.myCtrl.payData.newCard.cardType
                    };
                    var promise = Busy.doing('next', DirectDebitServer.addCCCard($scope.myCtrl.payData.contractAccountNumber, ccDetails));
                    return Utils.promiseThen(promise, function() {
                        var innerPromise = DirectDebitServer.addCardDetailsSAP($scope.myCtrl.payData.contractAccountNumber, ccDetails);
                        return Utils.promiseThen(innerPromise, function() {
                            return 'success';
                        });
                    });

                }]
            },
            {
                id: 'success',
                title: 'Success',
                checkpoint:true,
                completed: true,
                templateUrl: 'app/wizards/creditcard/creditcard-success.html',
                nextMsg: 'Close',
                next:['$scope', 'Utils', 'Wizards', function($scope, Utils, Wizards) {
                    return Utils.reopenWizard($scope.myCtrl.payData.contractAccountNumber, Wizards.close, Wizards.openCreditCard);
                }]

            }
        ]
    });
}]);
