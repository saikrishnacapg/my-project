angular.module('myaccount.wizard').factory('ArrangementServer', function ($http, DateUtils, AnalyticsServer) {
	const HTTP_METHOD_POST = 'POST';
	const AT_RISK_URL = 'paymentAtRisk';
	const DEFAULT_PAYMENT_FREQUENCY = 'WEEKLY';
	const service = 'MYACCOUNT';

	const ArrangementServer = {
		getArrangementOffer(contractAccountNumber, arrangement) {
			if (angular.isUndefined(arrangement.paymentFreq)) {
				arrangement.paymentFreq = DEFAULT_PAYMENT_FREQUENCY;
			}
			return $http({
				method: HTTP_METHOD_POST,
				url: `/${AT_RISK_URL}/${contractAccountNumber}/getArrangementOffer.json`,
				data: _.extend({}, arrangement, { service })
			}).then(function (offer) {
				// Format the dates for compatibility with html5 date selector
				_.each(offer.data.instalments, function (instalment) {
					instalment.date = moment(instalment.date).startOf('day').toDate();
				});
				return offer;
			});
		},
		modifyPaymentArrangement(contractAccountNumber, modifyOperation, promiseNumber, paymentDetails = {}) {
			return $http({
				method: HTTP_METHOD_POST,
				url: `/${AT_RISK_URL}/${contractAccountNumber}/modifyPaymentArrangement`,
				data: {
					paymentDetails,
					modifyOperation,
					promiseNumber
				}
			});
		},
		cancelPaymentArrangement(contractAccountNumber, modifyOperation, promiseNumber, paymentDetails = {}) {
			return $http({
				method: HTTP_METHOD_POST,
				url: `/${AT_RISK_URL}/${contractAccountNumber}/cancelPaymentArrangement`,
				data: {
					paymentDetails,
					modifyOperation,
					promiseNumber
				}
			});
		},
		acceptArrangement(contractAccountNumber, data) {
			_.each(data.instalments, function (instalment) {
				instalment.date = DateUtils.formatPaymentArrangementDate(new Date(instalment.date));
			});
			return $http({
				method: HTTP_METHOD_POST,
				url: `/${AT_RISK_URL}/${contractAccountNumber}/acceptArrangementMyAccount`,
				data: _.extend({}, data, { service })
			});
		},
		cardValidateGetDVToken(data, expiryMonth, expiryYear) {
			return $http({
				method: HTTP_METHOD_POST,
				url: '/directDebit/cardValidateGetDVToken',
				data,
				transformRequest: angular.identity,
				headers: { 'Content-Type': undefined }
			}).then(function (result) {
				const {
					cardDetails,
					token,
					expiryDate,
					creditCardHolder,
					maskedCreditCard,
					synergyCreditCardType
				} = result.data;
				// Return as the format expected by the setupDirectDebit call
				return {
					cardDetails,
					dvToken: token,
					expiryDate: moment(expiryDate).format('YYYY-MM-DD'),
					expiryMonth,
					expiryYear,
					creditCardHolder,
					maskedCreditCardNumber: maskedCreditCard,
					cardType: synergyCreditCardType
				};
			});
		},
		setupDirectDebit(contractAccountNumber, data) {
			return $http({
				method: HTTP_METHOD_POST,
				url: `/${AT_RISK_URL}/${contractAccountNumber}/saveCardDetails`,
				data
			});
		},
		getAtRiskFlag(contractAccountNumber) {
			return $http({
				method: HTTP_METHOD_POST,
				url: `/${AT_RISK_URL}/${contractAccountNumber}/getAtRiskFlag`
			}).then(response => response.data);
		},
		getArrangementMaxStartDates(contractAccountNumber) {
			return $http({
				method: HTTP_METHOD_POST,
				url: `/${AT_RISK_URL}/${contractAccountNumber}/getArrangementMaxStartDates.json`,
				data: { service }
			}).then(response => response.data);
		},
		validatePaymentDetails: function (contractAccountNumber, data) {
			return $http({
				method: 'POST',
				url: `/paymentAtRisk/${contractAccountNumber}/validatePaymentDetails`,
				data
			});
		},
		addOptionSelectedToAnalyticsFormModel(optionSelectedKey, optionSelectedValue) {
			AnalyticsServer.addFormOptionSelection(optionSelectedKey, optionSelectedValue);
		}
	};

	return ArrangementServer;
});
