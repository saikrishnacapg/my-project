/**
 * Global routing rules
 * note MMA uses https://github.com/angular-ui/ui-router
 * handle the exption not print this on browser console after update router in angularjs 1.8
 */
angular.module('myaccount.conf').config(function ($urlRouterProvider, $locationProvider, $uiRouterProvider) {
	$locationProvider.hashPrefix('');

	$uiRouterProvider.stateService.defaultErrorHandler(function (exception) {
	 if ( exception && (exception.toString().toLowerCase().indexOf("Possibly unhandled rejection".toLowerCase()) || exception.toString().toLowerCase().indexOf('The transition has been superseded by a different transition'))) {
			return true;
		}
	});
	$urlRouterProvider.otherwise(function($injector, $location){
		var searchParams = $location.search();
		$location.path('/login').search(searchParams);
	});
});

angular.module('myaccount.conf').run(function ($rootScope, $state, $log, ClientStorage, Session, Router, Events) {

	$rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
		$log.error('$stateChangeError');
		$log.error(error);

		if (!Session.isLoggedIn()) {
        	// Assume the problem is the login
        	Router.gotoLogin();
		}

		// Consider having a failedRouteChange route?
		//Modals.showErrors(['Unexpected Application Error']);
	});
});

