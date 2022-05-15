angular.module('myaccount.shared.services').factory('AddressServer', function (http) {

	function premiseQuery(searchstring) {
		
		// replace special characters with a space
		var strippedQuery = searchstring.replace(/\W/g,' ');
			
		return http({
			method: 'POST',
			url: '/addressSearch/searchPremise.json',
			params: {
	          query: strippedQuery
			}
		});
	}
	
	function postalAddressQuery(searchstring) {
		
		// replace special characters with a space
		var strippedQuery = searchstring.replace(/\W/g,' ');
			
		return http({
			method: 'POST',
			url: '/addressSearch/searchPostalAddress.json',
			params: {
	          query: strippedQuery
			}
		});
	}


    var AddressServer = {
        premiseQuery: premiseQuery,
        postalAddressQuery: postalAddressQuery
    };

    return AddressServer;
});
