window.digitalData = window.digitalData || [];
angular.module('myaccount.conf').constant('TrackingEvents', {
	registration: {
		REGISTRATION_STARTED: 'registration_started',
		REGISTRATION_VALIDATED_ACCOUNT_NUMBER: 'registration_validated_account_number',
		REGISTRATION_PROGRESS: 'registration_progress'
	},
	moving: {},
	login: {
		LOGIN_SUCCESS: 'LoginSuccess'
	}
});

angular.module('myaccount.conf').config(function ($provide) {
	// Decorate the Session to notify the Login success
	$provide.decorator('Session', [
		'$delegate',
		'$log',
		'TrackingEvents',
		function ($delegate, $log, TrackingEvents) {
			var loginFn = $delegate.login;
			$delegate.login = function (username, password, httpCodes) {
				var promise = loginFn(username, password, httpCodes);
				promise.then(notifyLoginSuccess);
				return promise;
			};
			// Following code was written with omniture in mind
			function notifyLoginSuccess() {
				// Login success event
			}

			return $delegate;
		}
	]);
});

angular
	.module('myaccount.conf')
	.run(function (
		$rootScope,
		$timeout,
		$window,
		$location,
		Session,
		AnalyticsServer,
		AdobePageModel,
		AdobeFormModel,
		AdobeUserModel,
		AccountUtils
	) {
		// Emitted in sy-wizard.js
		$rootScope.$on('$wizardPageChangeSuccess', function (evt, args) {
			if (args.analytics) {
				var adobeFormModel = new AdobeFormModel();
				adobeFormModel.name = args.analytics.formStartName
					? args.analytics.formStartName.toLowerCase()
					: args.analytics.formName
						? args.analytics.formName.toLowerCase()
						: $rootScope.adobeFormModel.name;
				adobeFormModel.stepName = args.stateTitle ? args.stateTitle.toLowerCase() : args.stateId;
				adobeFormModel.step = args.step;
				adobeFormModel.category = '';
				adobeFormModel.subCategory = '';
				adobeFormModel.error = '';
				adobeFormModel.virtualUrl = (Session.isLoggedIn() ? "/ma/" : "/site/") + args.formId + "/" + (args.analytics.subFormId ? args.analytics.subFormId + '/' : '') + args.stateId;
				if (args.analytics.isStart) {
					adobeFormModel.stage = 'start';
				} else {
					adobeFormModel.stage = 'incomplete';
				}
				if (args.analytics.completed) {
					adobeFormModel.stage = 'complete';
					adobeFormModel.stepName = 'complete';
				}
				if (evt.currentScope && evt.currentScope.adobeFormModel && evt.currentScope.adobeFormModel.optionSelection) {
					adobeFormModel.optionSelection = evt.currentScope.adobeFormModel.optionSelection;
				}
				$rootScope.adobeFormModel = adobeFormModel;
				AnalyticsServer.trackFormNavigation(adobeFormModel);
			}
		});

		$rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
			var referrer = '';
			if ('referrer' in document) {
				referrer = document.referrer.toLowerCase();
			}
			var adobePageModel = new AdobePageModel();
			adobePageModel.destinationUrl =
				$location && $location.$$absUrl
					? $location.$$absUrl.toLowerCase()
					: $window.location.href
						? $window.location.href.toLowerCase()
						: $window.location.origin.toLowerCase();
			adobePageModel.referringUrl = fromState.name ? $window.location.href : referrer;
			adobePageModel.abort = false;
			adobePageModel.platform = 'selfserve';
			adobePageModel.environment = $window.currentEnvironment;
			AdobeUserModel.authState = Session.isLoggedIn() ? 'logged in' : 'logged out';
			AdobeUserModel.userType = Session.isLoggedIn() && Session.user ? Session.user.customerType.toLowerCase() : '';
			AdobeUserModel.userSubType =
				Session.isLoggedIn() &&
				Session.currentContractAccountNumber &&
				Session._accountDetails &&
				Session._accountDetails[Session.currentContractAccountNumber].userSubType &&
				Session._accountDetails[Session.currentContractAccountNumber].userSubType.length > 0
					? Session._accountDetails[Session.currentContractAccountNumber].userSubType
					: '[n/a]';
			AdobeUserModel.userIdHashed =
				Session.isLoggedIn() && Session.user ? AccountUtils.encode(Session.user.username) : '';
			if (toState.name && toState.name.indexOf('user') !== -1 && toState.name !== fromState.name) {
				var tab = toState.name.replace('user', '').replace(/\./g, '/');
				adobePageModel.virtualUrl = tab.toLowerCase();
			}
			if (!toState.disableAdobeAnalyticsTracking) {
				$rootScope.adobePageModel = adobePageModel;
				AnalyticsServer.trackPageLoad(adobePageModel);
			}
		});
		var focusedformControls = [];
		$rootScope.$on('$fieldFocused', function (evt, args) {
			var adobeFormModel = angular.copy($rootScope.adobeFormModel || new AdobeFormModel());
			var elementName = args.name ? args.name : '';
			var elementId = args.id ? args.id : '';
			var modElementName = adobeFormModel.name + '-' + elementName;
			if (focusedformControls.indexOf(modElementName) < 0) {
				adobeFormModel.lastFieldInteractedId = elementId;
				adobeFormModel.lastFieldInteractedName = elementName;
				AnalyticsServer.trackFormInteraction(adobeFormModel);
				focusedformControls.push(modElementName);
			}
		});
	});
