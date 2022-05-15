/**
 * todo combine this with the resume function
 * Sy-stage directive ... ensures that outages are checked before the system loads
 *
 */
function syStageDirective() {
	return {
		restrict: 'A',
		transclude: false,
		templateUrl: 'app/stage/sy-stage.html',
		controller: [
			'$scope',
			'$location',
			'promiseTracker',
			'NotificationsServer',
			'Wizards',
			'Session',
			function ($scope, $location, promiseTracker, NotificationsServer, Wizards, Session) {
				var self = this;
		    // place our busy tracker right here
		    this.busyTracker = promiseTracker('global');
		    this.hasBorderRadius = Modernizr.borderradius; // feature sniff IE8 / 9.
		    this.openForgotCredentials = Wizards.openForgotCredentials;
		    this.openRegister = Wizards.openRegister;
		    this.openContactUs = Wizards.openContactUs;
		    this.openRenewableEnergyApplication = Wizards.openRenewableEnergyApplication;
		    this.initialised = false;
			  this.outageMessage = '';
			$scope.$watch('Session.user', function (customer) {
				if (customer) {
					self.customerType = customer.customerType;
					// Residential check
					const isResidentialCustomer = customer.customerType === 'RESIDENTIAL' || customer.customerType === 'RESD';
					self.isResidential = isResidentialCustomer;
				}
			});

		    this.startup = function() {
		    	self.notifications = undefined;

			    // load the notifications
			    var promise = NotificationsServer.getNotifications();
			    var success = function(result) {
			    	self.notifications = result;
			    };
			    var failure = function() {
						self.notifications = {
							outage: true,
							messages: [
								{
									message: 'My Account and online forms are currently unavailable - please try again later',
									outageType: 'SAP',
									severity: 'high'
								}
							]
						};
			    };
					promise.finally(function () {
						self.initialised = true;
					});
					promise.then(success, failure);
				};
				function isFormWhichToleratesSapOutage() {
					return $location.$$url.indexOf('/forms/pay') !== -1 || $location.$$url.indexOf('/forms/moving') !== -1;
				}
			this.showOutageMessage = function () {
				let outageEnable = false;
				if (self.notifications.outage && self.notifications.messages) {
					for (let i = 0; i < self.notifications.messages.length; i++) {
						if (self.notifications.messages[i].outageType === 'SAP') {
							outageEnable = true;
							this.outageMessage = self.notifications.messages[i].message;
						}
					}
				} else if (self.notifications.outage && !self.notifications){
					outageEnable = true;
				}
				return outageEnable;
			};

			this.onlineSupportLink = function () {
				return self.isResidential ? 'residential.supportlink' : 'business.supportlink';
			};

		    // run the startup
		    this.startup();
		}],
		controllerAs: 'appCtrl'
	};
}

function NotificationsServer(http) {
	var NotificationsServer = {
		getNotifications: function () {
			var promise = http({
				method: 'GET',
				url: '/notifications/current',
				httpCodes: [200, 400, 404, 500]
			});

			return promise;
		}
	};
	return NotificationsServer;
}

function StageRun($rootScope, Resources, Modals, Session) {
	// Make the Modals service available on the rootScope
	$rootScope.Modals = Modals;
	// Make Session is available on the rootScope
	$rootScope.Session = Session;
	// Make the Resources service available on the rootScope
	$rootScope.Resources = Resources;
}

NotificationsServer.$inject = ['http'];
StageRun.$inject = ['$rootScope', 'Resources', 'Modals', 'Session'];

angular
	.module('myaccount.stage')
	.directive('syStage', syStageDirective)
	.factory('NotificationsServer', NotificationsServer)
	.run(StageRun);
