
angular.module('myaccount.route').constant('T2CUnbilledData', {NoIncentiveAmount: 'No'});

angular.module('myaccount.route').constant('T2CFailureCase', {
	brokenPromise: '01',
	consumptionGoalNotMet: '02',
	noMeterReding: '99'
});

angular.module('myaccount.route').constant('T2CBilledData', {
	goalLevel1: [{altText: 'Reward Level 1 of 3 earned', imgsrc: 'img/t2c/happy-face-1star.svg', goallevel: 'L1' }],
	goalLevel2: [{altText: 'Reward Level 2 of 3 earned', imgsrc: 'img/t2c/happy-face-2star.svg', goallevel: 'L2' }],
	goalLevel3: [{altText: 'Reward Level 3 of 3 earned', imgsrc: 'img/t2c/happy-face-3star.svg', goallevel: 'L3' }],
	goalLevel4: [{altText: '', imgsrc: 'img/t2c/Welcome-3star.svg', goallevel: 'Welcome' }],
	goalLevel5: [{altText: 'No reward earned of 3 levels', imgsrc: 'img/t2c/sad-face-star.svg', goallevel: 'Sad' }],
	goalLevel6: [{altText: '', imgsrc: 'img/t2c/sad-face.svg', goallevel: 'Error' }]
});

angular.module('myaccount.route').config(function($stateProvider) {

	var resolveT2CData = ['$stateParams', '$q', '$log', 'Session', 'account', 'Utils', 'T2cCustomerData', function ($stateParams, $q, $log, Session, account, Utils, T2cCustomerData) {
		return Utils.promiseThen(T2cCustomerData.getT2cCustomerData(account.contractAccountNumber), function(result) {
			return result;
		});
	}];

	$stateProvider.state('user.account.dashboard.t2c', {
		disableAdobeAnalyticsTracking: true,
		views: {
			't2cView': {
				templateUrl: "app/routes/user/account/dashboard/t2c/t2c_customer-dashboard.html",
				controller: "TracktoChangeDashboardCtrl",
				controllerAs: "track2changeCtrl"
			}
		},
		resolve: {
			t2cdata: resolveT2CData
		}
	});
});

angular.module('myaccount.route').controller('TracktoChangeDashboardCtrl',
	['t2cdata', '$scope', 'Modals', '$filter', 'T2CUnbilledData', 'T2CBilledData', 'T2CFailureCase',
	function(t2cdata, $scope, Modals, $filter, T2CUnbilledData, T2CBilledData, T2CFailureCase) {
	var self = this;
	self.account = $scope.accountCtrl.currentAccount;
	self.contractAccountNumber = this.account.contractAccountNumber;
	self.customerFirstName = $filter('capitalize')(this.account.businessPartnerDetails.firstName);
	self.brokenPromise = T2CFailureCase.brokenPromise;
	self.consumptionGoalNotMet = T2CFailureCase.consumptionGoalNotMet;
	self.noMeterReding = T2CFailureCase.noMeterReding;
	self.t2cServiceData = t2cdata;
	self.caseManagerEmailID = self.t2cServiceData.emailIdCaseManager;
	self.hasServiceError = self.t2cServiceData.hasError;
	if (!self.hasServiceError) {
		self.billedData = self.t2cServiceData.billedData ? self.t2cServiceData.billedData[0] : undefined;
		self.unbilledData = self.t2cServiceData.unbilledData ? self.t2cServiceData.unbilledData[0] : undefined;
		if (self.unbilledData) {
			self.unbilledUsageList = [];
			self.unbilledUsageList.push({
				goalLevel: self.unbilledData.level1Goal,
				incentiveAmount: T2CUnbilledData.NoIncentiveAmount,
				show: parseFloat(self.unbilledData.avgDailyCons) > parseFloat(self.unbilledData.level1Goal)
			});
			self.unbilledUsageList.push({
				goalLevel: self.unbilledData.level1Goal,
				incentiveAmount: self.unbilledData.level1IncentiveAmt,
				show: parseFloat(self.unbilledData.avgDailyCons) < parseFloat(self.unbilledData.level1Goal) && parseFloat(self.unbilledData.avgDailyCons) > parseFloat(self.unbilledData.level2Goal)
			});
			self.unbilledUsageList.push({
				goalLevel: self.unbilledData.level2Goal,
				incentiveAmount: self.unbilledData.level2IncentiveAmt,
				show: parseFloat(self.unbilledData.avgDailyCons) < parseFloat(self.unbilledData.level2Goal) && parseFloat(self.unbilledData.avgDailyCons) > parseFloat(self.unbilledData.level3Goal)
			});
			self.unbilledUsageList.push({
				goalLevel: self.unbilledData.level3Goal,
				incentiveAmount: self.unbilledData.level3IncentiveAmt,
				show: parseFloat(self.unbilledData.avgDailyCons) < parseFloat(self.unbilledData.level3Goal)
			});
		}
		self.schduleBillDate = self.unbilledData ? moment(self.unbilledData.endDate).format("Do [of] MMMM") : null;
	}
	self.goalLevel1 = [{
		altText: T2CBilledData.goalLevel1[0].altText,
		imgsrc: T2CBilledData.goalLevel1[0].imgsrc,
		goallevel: T2CBilledData.goalLevel1[0].goallevel
	}];
	self.goalLevel2 = [{
		altText: T2CBilledData.goalLevel2[0].altText,
		imgsrc: T2CBilledData.goalLevel2[0].imgsrc,
		goallevel: T2CBilledData.goalLevel2[0].goallevel
	}];
	self.goalLevel3 = [{
		altText: T2CBilledData.goalLevel3[0].altText,
		imgsrc: T2CBilledData.goalLevel3[0].imgsrc,
		goallevel: T2CBilledData.goalLevel3[0].goallevel
	}];
	self.goalLevelWelcome = [{
		altText: T2CBilledData.goalLevel4[0].altText,
		imgsrc: T2CBilledData.goalLevel4[0].imgsrc,
		goallevel: T2CBilledData.goalLevel4[0].goallevel
	}];
	self.goalLevelSad = [{
		altText: T2CBilledData.goalLevel5[0].altText,
		imgsrc: T2CBilledData.goalLevel5[0].imgsrc,
		goallevel: T2CBilledData.goalLevel5[0].goallevel
	}];
	self.goalLevelSadErrorCase = [{
		altText: T2CBilledData.goalLevel6[0].altText,
		imgsrc: T2CBilledData.goalLevel6[0].imgsrc,
		goallevel: T2CBilledData.goalLevel6[0].goallevel
	}];


	self.showTracktoChangeInfo = function() {
		var text = "<p>This section tracks how you're progressing towards your goals by showing what average daily usage you need to reach to earn each reward level, based on the savings goals you set with your Case Manager.</p>" +
            "<p class='t2c-tooltip'>Need more help understanding your incentive goals? Please <a title='email your Case Manager' data-event='site-interaction' data-type='click to call' data-location='body' data-description='email your Case Manager' href=mailto:"+self.caseManagerEmailID+">email your Case Manager</a> who will guide you on ways to save. </p>";
		text += "</div>";
		Modals.showAlert('Your Track to Change progress', text);
	};
}]);

angular.module('myaccount.route').factory('T2cCustomerData', function(http) {
	var cachedT2CData= {};
	var T2cCustomerData;
	T2cCustomerData = {
		getT2cCustomerData: function (contractAccountNumber) {
			if (angular.isDefined(cachedT2CData[contractAccountNumber])) {
				return cachedT2CData[contractAccountNumber];
			}
			cachedT2CData = {};
			return cachedT2CData[contractAccountNumber] = http({
				method: 'POST',
				url: '/t2cDashboard/' + contractAccountNumber + "/getT2cCustomerData"
			});
		}
	};
	return T2cCustomerData;
});



