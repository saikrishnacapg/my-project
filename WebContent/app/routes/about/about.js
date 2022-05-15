angular.module('myaccount.route').config(function($stateProvider) {
	$stateProvider.state('terms-and-conditions', {
		url: '/terms-and-conditions',
        templateUrl: "app/routes/about/terms-and-conditions.html",
        data: {
        	auth: false,
			content: true // what does this do?
        }
    });
	
	$stateProvider.state('faq', {
		url: '/faq',
        templateUrl: "app/routes/about/faq.html",
        data: {
        	auth: false,
			content: true // what does this do?
        }
    });
});
