// contains the urls for the grails ap in the various different environments
angular
	.module('myaccount.conf')
	.constant('AppVersion', window.AppConfig.version)
	.constant('MyAccountClient', window.AppConfig.urls.client)
	.constant('MyAccountServer', window.AppConfig.urls.server) // "https://www.synergy.net.au/apps/rest"
	.constant('MyAccountApps', window.AppConfig.urls.apps) // "https://www.synergy.net.au/apps"
	.constant('SynergyDomain', 'www.synergy.net.au')
	.constant('SynergySite', window.AppConfig.urls.synergysite) // "https://www.synergy.net.au"
	.constant('SynergyLogoutPage', window.AppConfig.urls.synergysite + 'logout') // "https://www.synergy.net.au/logout"
	.constant('Handheld', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))

	.factory('MyAccountPrefix', function () {
		return window.location.host.indexOf('synergy.net.au') === -1 ? '/#/' : '/myaccount/#/';
	})
	.factory('SynergySiteParams', function (Handheld) {
		return Handheld ? '?desktop=true' : '';
	})
	.factory('mobileValue', function (Handheld) {
		return Handheld ? true : false;
	})

	.run(function ($state, $rootScope, AppVersion) {
		$rootScope.AppVersion = AppVersion;

		// Feature toggling - can all be turned on by adding this to the URL - ?noBackground=true&balanceStrap=true&newOptions=true&accountToggle=true&stripAccount=true
		$rootScope.feature = {
			contentStyling: false
		};
    angular.lowercase = angular.$$lowercase;
		$rootScope.$on('$stateChangeSuccess', function () {
			$rootScope.feature.contentStyling = $state.current && $state.current.data && $state.current.data.contentStyling;
		});
	});
