angular.module('myaccount.shared.services').constant('Cookies', {
	LAST_CONTRACT_ACCOUNT_NUMBER: 'last.contractAccountNumber',
	LAST_ACTIVE_TAB: 'synergy.myaccount.sytabs.mode',
	LAST_INTERVAL_DATA_TAB: 'synergy.myaccount.intervaldata.mode'
});

angular.module('myaccount.shared.services').factory('ClientStorage', function(localStorageService, Cookies) {

    var ClientStorage = {
        setLastContractAccountNumber: function(contractAccountNumber) {
            localStorageService.set(Cookies.LAST_CONTRACT_ACCOUNT_NUMBER, contractAccountNumber);
        },

        // Used on sy-tabs directive site-wide
        getActiveTab: function() {
        	return localStorageService.get(Cookies.LAST_ACTIVE_TAB);
        },
        setActiveTab: function(tab) {
        	return localStorageService.set(Cookies.LAST_ACTIVE_TAB, tab);
        },

        getLastIntervalDataTab: function() {
        	return localStorageService.get(Cookies.LAST_INTERVAL_DATA_TAB);
        },
        setLastIntervalDataTab: function(tab) {
        	return localStorageService.set(Cookies.LAST_INTERVAL_DATA_TAB, tab);
        }
    };

    return ClientStorage;
});