angular.module('myaccount.wizard').constant('arrangementConstants', {
	phoneNumber: {
		RESIDENTIAL: '13 13 53',
		BUSINESS: '13 13 54',
		SYNERGY_ENGAGE: '(08) 6212 2633',
		TRACK_TO_CHANGE_CUSTOMER_NUMBER: '1800 943 449',
		CASE_MANAGED_CUSTOMER_NUMBER: '1800 749 180'
	},
	accountSummaryCategory: {
		IS_ACCOUNT_OVERDUE: '6',
		IS_NEW_BILL: '7'
	},
	promiseToPayReasonCode: {
		SYNERGY_ENGAGE: '11'
	},
	promiseToPayTypes: {
		PAYMENT_EXTENSION: 'payextn',
		PAYMENT_ARRANGEMENT: 'payarr'
	},
	paymentFrequencyOptions: {
		SINGLE_PAYMENT: 'SINGLE PAYMENT',
		WEEKLY: 'WEEKLY',
		FORTNIGHTLY: 'FORTNIGHTLY'
	},
	numberOfInstalments: {
		SINGLE_INSTALMENT: 1
	},
	modifyPath: {
		MODIFY_P2P: 'MODIFY',
		UPDATE_PAYMENT_DETAILS: 'UPDATE_PAYMENT',
		CANCEL_DIRECT_DEBIT: 'CANCEL_DD'
	},
	directDebitPaymentType: {
		BANK: 'BANK',
		CARD: 'CARD'
	},
	paymentMethod: {
		DIRECT_DEBIT: 'DD',
		MANUAL_PAYMENTS: 'MANUAL'
	},
	analyticsPaymentFrequency: {
		single: 'single',
		weekly: 'weekly',
		fortnightly: 'fortnightly',
		paymentFrequency: 'paymentFrequency',
		numberOfInstalments:'numberOfInstalments'
	},
	minimumTransaction: {
		DIRECTDEBIT_MIN_AMOUNT: 20
	}
});
