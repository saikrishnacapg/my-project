/**
 * BANK:
 * bsb: 062039
 * acc: 123456789
 *
 * CARD:
 * cardNumber: 5123456789012346
 * expiry: 05/17
 */

angular.module('myaccount.wizard').config([
  'formRegistryProvider',
  function (formRegistryProvider) {
    formRegistryProvider.registerForm({
      id: 'payment',
      title: 'Online card payment',
      analytics: {
        startFunction: function (state) {
          return false;
        },
      },
      controller: [
        '$q',
        '$scope',
        'account',
        'Busy',
        'Modals',
        'PayServer',
        'Utils',
        'CardService',
        'StoredCardServer',
        'DirectDebitServer',
        'HiddenIframe',
        'formController',
        'MyAccountConstant',
        'formArgs',
        'p2pArrangementService',
        'arrangementConstants',
        'AnalyticsServer',
        function (
          $q,
          $scope,
          account,
          Busy,
          Modals,
          PayServer,
          Utils,
          CardService,
          StoredCardServer,
          DirectDebitServer,
          HiddenIframe,
          formController,
          MyAccountConstant,
          formArgs,
          p2pArrangementService,
          arrangementConstants,
          AnalyticsServer
        ) {
          // May or may not have an account
          this.account = account;
          this.transferp2pArrangementModel = formArgs.p2pArrangementJourneyFlag ? p2pArrangementService.p2pArrangementModel : undefined;
          this.numberOfInstalments =
              this.transferp2pArrangementModel && formArgs.p2pArrangementJourneyFlag
                  ? this.transferp2pArrangementModel.numberOfInstalments
                  : '';
          this.existingAccount =
            angular.isDefined(account) &&
            angular.isDefined(account.contractAccountNumber);
          this.hasStoredCards =
            this.existingAccount &&
            angular.isArray(account.paymentInfo.storedCards) &&
            account.paymentInfo.storedCards.length > 0;
          this.storedCards = this.hasStoredCards
            ? account.paymentInfo.storedCards
            : undefined;

          // This is the payData we will be submitting
          this.payData = {
            contractAccountNumber: undefined,
            paymentNumber: undefined,
            amount: undefined,
            cardIndex: undefined, // Stored card payments
            cardTransactionFee: undefined,
            totalPaymentAmount: undefined,
            dvToken: undefined,
            newCard: {
              // New card payments
              cardHolderName: undefined,
              cardNumber: undefined,
              expiryMonth: undefined,
              expiryYear: undefined,
              saveCard: 'No',
              cardType: undefined,
              subType: undefined,
              maskedCardNumber: undefined,
              cardSurCharge: undefined,
              displayCardType: undefined,
            },
            termsAccepted: false,
          };

          this.initPaymentResult = undefined;
          this.payResult = undefined;
          this.analyticsFlag = true;

          // TODO: remove me
          this.CREDIT_CARD_EXPIRY_MONTHS = function () {
            return CardService.CREDIT_CARD_EXPIRY_MONTHS_INCLUSIVE(
              this.payData.newCard.expiryYear,
            );
          };

          this.CREDIT_CARD_EXPIRY_YEARS = function () {
            return CardService.CREDIT_CARD_EXPIRY_YEARS_INCLUSIVE(
              this.payData.newCard.expiryMonth,
            );
          };

          this.showHelpText = function (title, text) {
            Modals.showAlert(title, text);
          };

          if (this.existingAccount) {
            // Prepopulate
            this.payData.contractAccountNumber = this.account.contractAccountNumber;
            this.payData.paymentNumber = this.account.paymentInfo.paymentNumber;
            this.payData.amount = this.transferp2pArrangementModel && this.transferp2pArrangementModel.p2pArrangementFlag ? this.transferp2pArrangementModel.totalPaymentAmount :
              this.account.paymentInfo.accountBalance &&
              this.account.paymentInfo.accountBalance > 0
                ? this.account.paymentInfo.accountBalance.toFixed(2)
                : '';

            if (this.hasStoredCards) {
              this.payData.cardIndex = this.storedCards.length - 1;
            }
          }
          this.formatCardExpiryDate = function (date) {
            return (
              _.padLeft(date.getMonth() + 1, 2, '0') +
              '/' +
              date.getFullYear().toString().substr(2, 2)
            );
          };

          this.isCardExpired = function (index) {
            var card = this.storedCards[index];
            return new Date().getTime() > card.expiryDate.getTime();
          };

          this.validatePaymentNumber = function () {
            return Busy.doing(
              'next',
              PayServer.validatePaymentNumber(this.payData.paymentNumber),
            );
          };

          this.getTemplate = function (card, $index, edit) {
            return 'app/shared/wizards/directdebit/display.html';
          };

          this.reset = function () {
            $scope.card = {};
            $scope.$index = '';
          };

          this.updateCardDeatils = function (index) {
            var card = this.storedCards[index];
            formController.addTask('SavedCard-Update-expiry', {
              account: this.account,
              paymentType: 'UPDATE', //"FULL",
              directDebit: {
                bankDetails: null,
                ccDetails: {
                  creditCardHolder: card.cardHolderName,
                  creditCardType: card.cardType,
                  dvToken: card.dvToken,
                  expiryDate: card.expiryDate,
                  maskedCreditCardNumber: card.maskedCreditCardNumber,
                },
                directDebitType: 'CARD',
              },
              instalment: null,
            });
          };
          this.requestStoredCardDeletion = function (index) {
            var card = this.storedCards[index];
            self = this;
            var promise = Modals.showConfirm(
              'Manage cards - Delete card',
              'Are you sure you wish to delete card ' +
                card.maskedCreditCardNumber +
                ' ?',
            );
            promise
              .then(function () {
                return StoredCardServer.deleteStoredCreditCardDetails(
                  self.account.contractAccountNumber,
                  card.maskedCreditCardNumber,
                  card.cardType,
                  card.dvToken,
                ).then(function (wasSuccessful) {
                  if (wasSuccessful) {
                    Utils.setGoal('Goal_Credit_Card_Removed');
                  }
                });
              })
              .then(function () {
                self.storedCards.splice(index, 1);
                self.hasStoredCards = self.storedCards.length > 0;
              })
              .then(function () {
                Modals.showAlert(
                  'Manage cards - Delete card',
                  'Your card has been successfully deleted. <br/> <br/> Please note this does not affect any cards you may have setup for Direct Debit.',
                  'savCardDelete',
                );
              });
          };
          this.validateCardDetail = function () {
            var fd = new FormData();
            fd.append('cardHolderName', this.payData.newCard.cardHolderName);
            fd.append('cardNumber', this.payData.newCard.cardNumber);
            fd.append('cvn', this.payData.newCard.cvv);
            fd.append(
              'expiryDate',
              String(this.payData.newCard.expiryMonth) +
                this.payData.newCard.expiryYear,
            );
            fd.append('acceptBADirectDebitTC', this.payData.termsAccepted);
            fd.append('emailAddress', '');
            fd.append('crn1', this.payData.paymentNumber);
            fd.append('crn2', this.payData.contractAccountNumber);
            fd.append('amount', this.payData.amount);

            return Busy.doing('next', PayServer.getCardDetail(fd)).then(
              function (result) {
                //Self.initPaymentResult = initPaymentResult;
                if (
                  result.APIResponse.responseText ===
                    MyAccountConstant.paymentConstant.Success &&
                  result.DVTokenResp.cardType !==
                    MyAccountConstant.paymentConstant.UnknownCard &&
                  result.DVTokenResp.cardType !==
                    MyAccountConstant.paymentConstant.Un &&
                  result.DVTokenResp.cardDetails.subType !== '' &&
                  result.DVTokenResp.cardType !== '' &&
                  result.DVTokenResp.DVToken !== null
                ) {
                  $scope.payCtrl.payData.newCard.maskedCardNumber =
                    result.DVTokenResp.cardDetails.maskedCardNumber;
                  $scope.payCtrl.payData.dvToken = result.DVTokenResp.DVToken;
                  $scope.payCtrl.payData.cardTransactionFee =
                    result.resultCardValidateData.cardTransactionFee;
                  $scope.payCtrl.payData.totalPaymentAmount =
                    result.resultCardValidateData.totalPaymentAmount;
                  $scope.payCtrl.payData.newCard.cardSurCharge =
                    result.resultCardValidateData.cardSurCharge;
                  $scope.payCtrl.payData.newCard.displayCardType =
                    result.resultCardValidateData.displayCardType;
                } else {
                  if (
                    result.DVTokenResp.cardType ===
                      MyAccountConstant.paymentConstant.UnknownCard ||
                    result.DVTokenResp.cardType ===
                      MyAccountConstant.paymentConstant.Un
                  ) {
                    Modals.showAlert(
                      'Invalid card type',
                      '<p>Sorry there is an issue whilst processing your card details. No payment was taken. Please try again with another card or try again later.</p>',
                    );
                    return $q.reject('Invalid card type');
                  }
                  Modals.showAlert(
                    'Invalid card type',
                    '<p>Sorry there is an issue whilst processing your card details. No payment was taken. Please try again with another card or try again later.</p>',
                  );
                  return $q.reject('Invalid card type.');
                }
              },
              function (failureReason) {
                // TODO this looks incorrect?
                return $q.reject('Invalid card type.');
              },
            );
          };

          /*This Function is not in used Now*/
          this.authorise = function () {
            var self = this;
            var Amount =
              this.payData.totalPaymentAmount !== undefined
                ? this.payData.totalPaymentAmount
                : this.payData.amount;
            return Busy.doing(
              'next',
              PayServer.initPayment(
                this.payData.paymentNumber,
                Amount.toString(),
                this.payData.contractAccountNumber,
              ),
            ).then(
              function (initPaymentResult) {
                self.initPaymentResult = initPaymentResult;
              },
              function (failureReason) {
                // TODO this looks incorrect?
                return $q.reject('Authorisation denied for card.');
              },
            );
          };

          this.getPaymentDetail = function () {
            var self = this;
            var card = this.getStoredCard();

            return Busy.doing(
              'next',
              PayServer.initPaymentDetail(card.cardType, this.payData.amount),
            ).then(
              function (result) {
                if (
                  result.cardSurCharge === '' ||
                  result.cardTransactionFee === '' ||
                  result.totalPaymentAmount === ''
                ) {
                  // TODO this looks incorrect?
                  Modals.showAlert(
                    'Invalid card type',
                    '<p>Sorry there is an issue whilst processing your card details. Delete this card and Add new card .Please try again later.</p>',
                  );
                  return $q.reject('Invalid card type');
                }
                angular.extend(
                  $scope.payCtrl.storedCards[$scope.payCtrl.payData.cardIndex],
                  {
                    cardSurCharge: result.cardSurCharge,
                    displayCardType: result.displayCardType,
                    cardTransactionFee: result.cardTransactionFee,
                    totalPaymentAmount: result.totalPaymentAmount,
                  },
                );
              },
              function (failureReason) {
                // TODO this looks incorrect?
                Modals.showAlert(
                  'Invalid card type',
                  '<p>Sorry there is an issue whilst processing your card details. No payment was taken. Please try again with another card or try again later.</p>',
                );
                return $q.reject('Invalid card type');
              },
            );
          };

          this.makeBpointPayment = function () {
            var self = this;
            if (self.numberOfInstalments) {
              AnalyticsServer.addFormOptionSelection(arrangementConstants.analyticsPaymentFrequency.numberOfInstalments, self.numberOfInstalments);
            }
            var resultToken = self.payData.dvToken;
            var requestData = getIframePaymentData(self.payData);

            return PayServer.processCardPayment(requestData).then(function (
              APIresponse,
            ) {
              return PayServer.getPaymentResult(
                APIresponse.paymentCardToken,
              ).then(function (paymentResult) {
                let paymentValue = paymentResult;
                paymentValue.numberOfInstallment = self.numberOfInstalments
                    ? self.numberOfInstalments
                    : null;
                self.payResult = paymentValue;
                return paymentResult.wasSuccessful;
              });
            });
          };

          this.isStoredCardPayment = function () {
            return (
              !_.isUndefined(this.payData.cardIndex) &&
              this.payData.cardIndex !== -1
            );
          };
          this.successcallback = function () {
            Utils.setGoal('Goal_Card_Payment_Successful');
            return 'success';
          };
          this.failureCallback = function (reason) {
            Utils.setGoal('Goal_Card_Payment_Unsuccessful');
            return $q.reject(reason);
          };

          this.getStoredCard = function () {
            return this.isStoredCardPayment()
              ? this.storedCards[this.payData.cardIndex]
              : undefined;
          };

          this.payWithStoredCard = function () {
            var self = this;
            var deferred = $q.defer();
            var card = this.getStoredCard();

            var success = function (paymentResult) {
              if (paymentResult.responseCode === '0') {
                self.payResult = paymentResult;
                deferred.resolve(paymentResult);
              } else {
                self.usabilla_surveytrigger('/ma/payment/bpoint-declined');
                Modals.showAlert(
                  'Error',
                  '<p>Payment Unsuccessful: ' +
                    paymentResult.responseText +
                    '</p>',
                );
                deferred.reject('Error');
              }
            };
            var error = function (error) {
              self.usabilla_surveytrigger('/ma/payment/bpoint-failed');
              deferred.reject(
                'Authorisation denied for card or a server error occuured;' +
                  error,
              );
            };

            Busy.doing(
              'next',
              PayServer.payWithExistingCreditCard(this.payData, card),
            ).then(success, error);
            return deferred.promise;
          };

          this.setCardType = function () {
            this.payData.newCard.cardType = Utils.getCreditCardType(
              this.payData.newCard.cardNumber,
            );
          };

          this.usabilla_surveytrigger = function (VURL) {
            vocvirtualurlsurvey(VURL);
            return true;
          };
          this.checkCardSave = function () {
            if (this.payData.newCard.saveCard !== undefined) {
              this.payData.newCard.saveCard;
            } else {
              this.payData.newCard.saveCard = 'No';
            }
          };
          this.isNewCardAdd = function () {
            if (
              this.payData.cardIndex === -1 ||
              !(this.storedCards.length > 0)
            ) {
              return true;
            }
            return false;
          };
        },
      ],
      controllerAs: 'payCtrl',
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
          },
        ],
      },
      states: [
        {
          id: 'card-payment-details',
          title: 'Card payment details',
          checkpoint: true,
          templateUrl: 'app/wizards/payment/pay-method.html',
          controller: [
            '$scope',
            'Modals',
            function ($scope, Modals) {
              $scope.showPaymentNumberHelp = function () {
                Modals.showBillHelp('PAYMENT_NUMBER');
              };
            },
          ],
          next: [
            '$scope',
            '$q',
            'Modals',
            'Utils',
            function ($scope, $q, Modals, Utils) {
              if (
                $scope.payCtrl.isStoredCardPayment() &&
                !$scope.payCtrl.isNewCardAdd()
              ) {
                return Utils.promiseThen(
                  $scope.payCtrl.getPaymentDetail(),
                  'confirm',
                );
              }

              return $scope.payCtrl.validatePaymentNumber().then(
                function () {
                  return Utils.promiseThen(
                    $scope.payCtrl.validateCardDetail(),
                    'confirm',
                  );
                },
                function (reason) {
                  Modals.showAlert(
                    'Invalid payment number',
                    '<p>' + $rootScope.messages.MA_H15 + '</p>',
                  );
                  return $q.reject('Invalid payment number');
                },
              );
            },
          ],
        },
        {
          id: 'confirm',
          title: 'Confirmation',
          checkpoint: true,
          templateUrl: 'app/wizards/payment/pay-confirm.html',
          nextMsg: 'Submit payment',
          disableNext: function ($scope) {
            return !$scope.payCtrl.payData.termsAccepted;
          },
          next: [
            '$scope',
            'Busy',
            'Utils',
            function ($scope, Busy, Utils) {
              $scope.wizard.context.navbar.disableNext = true;
              if (
                $scope.payCtrl.isStoredCardPayment() &&
                !$scope.payCtrl.isNewCardAdd()
              ) {
                var promise = Busy.doing(
                  'next',
                  $scope.payCtrl.payWithStoredCard(),
                );
                return Utils.promiseThen(
                  promise,
                  $scope.payCtrl.successcallback,
                  $scope.payCtrl.failureCallback,
                );
              }

              return Busy.doing(
                'next',
                $scope.payCtrl
                  .makeBpointPayment()
                  .then(function (wasSuccessful) {
                    if (wasSuccessful) {
                      Utils.setGoal('Goal_Card_Payment_Successful');
                    } else {
                      Utils.setGoal('Goal_Card_Payment_Unsuccessful');
                    }
                    return wasSuccessful ? 'bpoint-success' : 'bpoint-declined';
                  }, _.constant('bpoint-failed')),
              );
            },
          ],
        },
        {
          id: 'success',
          title: 'Success',
          completed: true,
          templateUrl: 'app/wizards/payment/pay-success.html',
        },
        {
          id: 'bpoint-success',
          title: 'Success',
          completed: true,
          templateUrl: 'app/wizards/payment/pay-bpoint-success.html',
        },
        {
          id: 'bpoint-declined',
          title: 'Payment Declined',
          completed: true,
          templateUrl: 'app/wizards/payment/pay-bpoint-declined.html',
        },
        {
          id: 'bpoint-failed',
          title: 'Payment Failed',
          completed: true,
          templateUrl: 'app/wizards/payment/pay-bpoint-failed.html',
        },
      ],
    });

    /**
     * Returns a url to be embedded in the iframe src
     *
     * @returns {*}
     * @param requestUrl
     * @param paymentData
     */
    function getIframePaymentData(payData) {
      var paymentObject = new Object();
      paymentObject.in_amount = Math.round(payData.totalPaymentAmount * 100);
      (paymentObject.in_credit_card = payData.newCard.maskedCardNumber),
        (paymentObject.in_expiry_month = payData.newCard.expiryMonth),
        (paymentObject.in_expiry_year = payData.newCard.expiryYear),
        (paymentObject.in_cvc = payData.newCard.cvv),
        (paymentObject.app_credit_card_holder = payData.newCard.cardHolderName),
        (paymentObject.AmountOriginal = Math.round(payData.amount * 100)),
        (paymentObject.AmountSurcharge = Math.round(
          payData.cardTransactionFee * 100,
        )),
        (paymentObject.DVToken = payData.dvToken),
        (paymentObject.in_store_card =
          payData.newCard.saveCard === 'Yes' ? 1 : 0),
        (paymentObject.in_crn1 = payData.paymentNumber),
        (paymentObject.in_crn2 = payData.contractAccountNumber);

      return paymentObject;
    }
  },
]);

angular.module('myaccount.wizard').factory('PayServer', function (http) {
  var PayServer = {
    validatePaymentNumber: function (paymentNumber) {
      return http({
        method: 'POST',
        url: '/payment/validatePaymentNumber',
        httpCodes: [400],
        data: {
          paymentNumber: paymentNumber,
        },
      });
    },
    processCardPayment: function (requestData) {
      return http({
        method: 'POST',
        url: '/payment/processCardPaymentMyAccount',
        data: requestData,
      });
    },
    getCardDetail: function (data) {
      /*Return http({
                method: 'POST',
                url: '/accountUpdate/validateCardDetail',
                data: {
                    bankaccountDetails : null,
                    CardDetails : {
                        cardHolderName : data.newCard.cardHolderName,
                        cardNumber : data.newCard.cardNumber,
                        cvn : null,
                        expiryDate : data.newCard.expiryMonth+""+data.newCard.expiryYear
                    },
                    acceptBADirectDebitTC : data.termsAccepted,
                    emailAddress : null,
                    crn1 : data.paymentNumber,
                    crn2 : null,
                    crn3 : null
                }
            });*/
      return http({
        method: 'POST',
        url: '/accountUpdate/validateCardDetail',
        data: data,
        transformRequest: angular.identity,
        headers: { 'Content-Type': undefined },
      });
    },
    payWithExistingCreditCard: function (data, card) {
      return http({
        method: 'POST',
        url:
          '/accountUpdate/' +
          data.contractAccountNumber +
          '/payWithExistingCreditCard',
        data: {
          paymentNumber: data.paymentNumber,
          amountInDollars: data.amount
            ? data.amount.replace('$', '')
            : data.amount,
          amountSurchargeInDollars: card.cardTransactionFee
            ? card.cardTransactionFee.replace('$', '')
            : card.cardTransactionFee,
          amountTotalPaidInDollars: card.totalPaymentAmount
            ? card.totalPaymentAmount.replace('$', '')
            : card.totalPaymentAmount,
          dvToken: card.dvToken,
          expiryDate: card.expiryDate,
        },
      });
    },
    initPayment: function (
      paymentNumber,
      amountInDollars,
      contractAccountNumber,
    ) {
      var data = {
        paymentNumber: paymentNumber,
        amountInDollars: amountInDollars
          ? amountInDollars.replace('$', '')
          : amountInDollars,
      };

      // ContractAccountNumber is optional
      if (angular.isDefined(contractAccountNumber)) {
        data.contractAccountNumber = contractAccountNumber;
      }

      return http({
        method: 'POST',
        url: '/payment/initCardPayment',
        data: data,
      });
    },
    initPaymentDetail: function (cardType, amount) {
      var data = {
        cardType: cardType,
        amount: amount,
      };

      return http({
        method: 'POST',
        url: '/payment/initCardPaymentDetail',
        data: data,
      });
    },
    getPaymentResult: function (paymentToken) {
      return http({
        method: 'POST',
        url: '/payment/getExternalCardPaymentResult',
        httpCodes: ['all'],
        data: {
          paymentToken: paymentToken,
        },
      });
    },
    sendResultEmail: function (payResult) {
      return http({
        method: 'POST',
        url: '/payment/notifyPaymentResultByEmail',
        data: payResult,
      });
    },
    downloadPdf: function (payResult) {
      return http({
        method: 'POST',
        url: '/payment/downloadPdf',
        data: payResult,
        responseType: 'arraybuffer',
      });
    },
  };

  return PayServer;
});
