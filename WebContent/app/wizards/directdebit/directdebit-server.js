angular.module('myaccount.wizard').factory('DirectDebitServer', function ($q, http, $log, Utils, HiddenIframe) {

    var addCard = function(contractAccountNumber, cardModel) {

        var _authorise = function() {
            return true;//DirectDebitServer.initAddCard(contractAccountNumber);
        };

        var _addCard = function () {
            var requestData = DirectDebitServer.getIframeCardDirectDebitData(contractAccountNumber, cardModel);

            return DirectDebitServer.AddCard(contractAccountNumber, requestData).then(
                function(AddCardresponse) {
                    if (AddCardresponse.resultcardToken != "") {
                        var cardToken = AddCardresponse.resultcardToken;
                        return DirectDebitServer.getCardDetails(contractAccountNumber, cardToken).then(function (cardDetailsResults) {
                            cardModel.dvToken = cardDetailsResults.token;
                            cardModel.creditCardHolder = cardDetailsResults.creditCardHolder;
                            cardModel.expiryDate = moment(cardDetailsResults.expiryDate).format("YYYY-MM-DD");
                            cardModel.maskedCreditCardNumber = cardDetailsResults.maskedCreditCard;
                            cardModel.cardNumber = cardDetailsResults.maskedCreditCard;
                            cardModel.cardType = cardDetailsResults.synergyCreditCardType;
                        })
                    }
                    else{

                        Modals.showAlert('Invalid card details', "<p>" + $rootScope.messages["MA_E22"] + "</p>");
                        return $q.reject('Invalid card details');
                    }
                });
        } ;

        return _addCard().then(
            function(initAddCardResult) {
                return initAddCardResult;
            },
            function(failureReason) {
                // TODO this looks incorrect?
                return $q.reject('Authorisation denied for card.');
            }
        );
        //return _authorise().then(
/*        return _addCard().then(
            function(initAddCardResult) {
                return initAddCardResult;
            },
            function(failureReason) {
                // TODO this looks incorrect?
                return $q.reject('Authorisation denied for card.');
            }
        );*/
    };

    var DirectDebitServer = {

        addCCCard: function (contractAccountNumber, ccDetails) {
            return addCard(contractAccountNumber, ccDetails);
        },
        setup: function (contractAccountNumber, data, silentUpdate) {
            data.silentUpdate = silentUpdate || false;

            if (data.paymentType === 'FULL') {
                delete data.instalment;
            }

            if ((data.directDebit && data.directDebit.directDebitType === 'CARD') || (data.instalment && data.instalment.directDebitType === 'CARD')) {

                //Clean up
                if (data.directDebit && data.directDebit.directDebitType === 'CARD') {
                    delete data.directDebit.bankDetails;
                }
                if (data.instalment && data.instalment.directDebitType === 'CARD') {
                    delete data.instalment.bankDetails;
                }

                var promises = [];
                if (data.directDebit && data.directDebit.ccDetails && !data.directDebit.ccDetails.dvToken) {
                    var sameCcNumber = (data.instalment && data.instalment.ccDetails && data.instalment.ccDetails.cardNumber == data.directDebit.ccDetails.cardNumber) ? true : false;
                    if (!sameCcNumber) {
                        promises.push(function () {
                            return addCard(contractAccountNumber, data.directDebit.ccDetails)
                        });
                    }
                }

                if (data.instalment && data.instalment.ccDetails && !data.instalment.ccDetails.dvToken) {
                    promises.push(function () {
                        return addCard(contractAccountNumber, data.instalment.ccDetails)
                    });
                }

                promises.push(function () {
                    return http({
                        method: 'POST',
                        url: '/directDebit/' + contractAccountNumber + '/setup',
                        data: data
                    })
                });

                // execute promises in sequence
                return Utils.chainPromises(promises);

            } else {

                //Clean up
                if (data.directDebit) {
                    delete data.directDebit.ccDetails;
                }
                if (data.instalment) {
                    delete data.instalment.ccDetails;
                }

                return http({
                    method: 'POST',
                    url: '/directDebit/' + contractAccountNumber + '/setup',
                    data: data
                });
            }
        },

        cancel: function (contractAccountNumber, type) {
            return http({
                method: 'POST',
                url: '/directDebit/' + contractAccountNumber + '/cancel',
                data: {type: type}
            });
        },
        /**
         *
         * @param contractAccountNumber
         */
        initAddCard: function (contractAccountNumber) {
            return http({
                method: 'POST',
                url: '/directDebit/' + contractAccountNumber + '/initAddCard'
            });
        },

        AddCard: function (contractAccountNumber, ccdetails) {
            //return HiddenIframe.postToIframe('/apps/rest/directDebit/newinitAddCard',ccdetails);
            return http({
                method: 'POST',
                url: '/directDebit/' + contractAccountNumber + '/initAddNewCard',
                data: ccdetails
            });
        },
        /**
         *
         * constructs the url to be inserted into the iframe
         *
         * @param bpoint
         * @param cardNumb
         * @param expiryMonth
         * @param expiryYear
         * @param accountName
         */
        getCardDetails: function (contractAccountNumber, token) {
            return http({
                method: 'GET',
                url: '/directDebit/' + contractAccountNumber + '/getCardDetails?token=' + token
            });
        },

        addCardDetailsSAP: function (contractAccountNumber, data) {
            return http({
                method: 'POST',
                url: '/directDebit/' + contractAccountNumber + '/addCardSAP',
                data: data
            });
        },

        /**
         *
         * constructs the url to be inserted into the iframe
         *
         * @param bpoint
         * @param cardNumber
         * @param expiryMonth
         * @param expiryYear
         * @param accountName
         */
        getIframeCardDirectDebitData: function (caNumber, ddCard) {
            $log.log('getIframeCardDirectDebitData');
            var paymentData = {
                contractAccountNumber: caNumber,
                cardNumber: ddCard.cardNumber,
                expiryMonth: ddCard.expiryMonth,
                expiryYear: ddCard.expiryYear,
                cardHolderName: ddCard.creditCardHolder
            };

            return paymentData;
        },

        updateDirectDebitCreditCardExpiryDate: function (contractAccountNumber, model) {
            return http({
                method: 'POST',
                url: '/directDebit/' + contractAccountNumber + '/updateDirectDebitCreditCardExpiryDate',
                data: {
                    dvToken: model.dvToken,
                    cardType: model.creditCardType,
                    maskedCreditCardNumber: model.maskedCreditCardNumber,
                    creditCardHolder: model.creditCardHolder,
                    expiryMonth: model.expiryMonth,
                    expiryYear: model.expiryYear
                }
            });
        },

        updateInstalmentCreditCardExpiryDate: function (contractAccountNumber, model) {
            return http({
                method: 'POST',
                url: '/directDebit/' + contractAccountNumber + '/updateInstalmentCreditCardExpiryDate',
                data: {
                    dvToken: model.dvToken,
                    cardType: model.creditCardType,
                    maskedCreditCardNumber: model.maskedCreditCardNumber,
                    creditCardHolder: model.creditCardHolder,
                    expiryMonth: model.expiryMonth,
                    expiryYear: model.expiryYear
                }
            });
        },

        updateDirectDebitCreditCardDetails_EXP: function (contractAccountNumber, model) {
            console.log(model);
            return http({
                method: 'POST',
                url: '/directDebit/' + contractAccountNumber + '/updateDirectDebitCreditCardDetails_EXP',
                data: {
                    dvToken: model.dvToken,
                    cardType: model.creditCardType,
                    maskedCreditCardNumber: model.maskedCreditCardNumber,
                    creditCardHolder: model.creditCardHolder,
                    expiryMonth: model.expiryMonth,
                    expiryYear: model.expiryYear
                }
            });
        },

        /**
         *
         * @param contractAccountNumber, cancellationDetail object
         * @returns {Promise}
         */
        submitFeedback: function (contractAccountNumber, cancellationDetail) {
            return http({
                method: 'POST',
                url: '/accountUpdate/' + contractAccountNumber + '/submitDirectDebitFeedback.json',
                data: cancellationDetail
            });
        },
        getActiveP2PSetting: function (contractAccountNumber) {
            return http({
                method: 'POST',
                url: '/directDebit/' + contractAccountNumber + '/checkActiveP2PSetting'
            });
        }

    };

    return DirectDebitServer;
});
