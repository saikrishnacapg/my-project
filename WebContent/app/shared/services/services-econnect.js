angular.module('myaccount.shared.services').service('EconnectService', function($q, http) {

    var self = this;

   
    function fetchEConnectSetting(contractAccountNumber) {
		return http({
			method: 'POST',
			url: '/account/' + contractAccountNumber + '/getEConnectSetting.json',
			httpCodes: ['all']
		});
    }
    
    function getEConnectSetting(account, forceFetch) {
    	if (account.contractAccountType && account.paperlessBillSetting && account.paymentInfo && forceFetch !== true) {
    		// account object has enough information for us to build the eConnect setting
    		var isEligible = account.contractAccountType == 'RESD' && !account.paperlessBillSetting.isBPay; // previously used the businessPartnerType == Person

			var isPromoBox = false;
			if(!(account.contractAccountType == 'RESD')){
                isPromoBox=true;
			}
    		return $q.when({
    			contractAccountNumber: account.contractAccountNumber,
    			isEligible: isEligible,
                isPromoBox:isPromoBox,
    			isActive: isEligible && account.paperlessBillSetting.isPaperless && account.paymentInfo.directDebitExists,
    			isPaperless: account.paperlessBillSetting.isPaperless,
    			directDebitExists: account.paymentInfo.directDebitExists,
    			directDebitInstalmentExists: account.paymentInfo.directDebitInstalmentExists
    		});
    	}
    	else {
    		// load the eConnect setting from the server
    		return fetchEConnectSetting(account.contractAccountNumber);
    	}
    }

    var EconnectService = {
		fetchEConnectSetting: fetchEConnectSetting,
		getEConnectSetting: getEConnectSetting
    };
    
    return EconnectService;
});