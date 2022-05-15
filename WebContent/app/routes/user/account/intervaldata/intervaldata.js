/* eslint-disable keyword-spacing */
/**
 * TODO consider moving under history
 */
angular.module('myaccount.route').config(function($stateProvider) {

	// Resolve a child account from the childAccountIdentifier route parameter
	var resolveChildAccount = ['$stateParams', '$q', '$log', 'Session', 'user', 'account', function ($stateParams, $q, $log, Session, user, account) {
		if ($stateParams.childAccountIdentifier) {
			return _.find(account.collectiveDetails.childAccounts, function(it) {
				return it.accountIdentifier === $stateParams.childAccountIdentifier && (!$stateParams.contractIdentifier || $stateParams.contractIdentifier === it.contractIdentifier);
			});
		}

		return undefined;

	}];

	// Fetch consumption data
	var resolveConsumptionData = ['$stateParams', '$q', '$log', 'Session', 'IntervalSearchCtrl', 'intervalDataHttpServer', 'user', 'account', 'childAccount', function ($stateParams, $q, $log, Session, IntervalSearchCtrl, intervalDataHttpServer, user, account, childAccount) {
		if (UsageCustomSearch.active) {
			// Do the custom search
			return UsageRecordsServer.getConsumptionHistory(account, childAccount, UsageCustomSearch);
		}

		// Perform a default search
		if (account.collective && childAccount) {
			// Return the child account data over the default consumptionHistory
			return UsageRecordsServer.getConsumptionHistory(account, childAccount, account.consumptionHistory.supplyPeriod);
		}

		// Return a copy of the default consumptionHistory
		return angular.copy(account.consumptionHistory);



	}];

	//Resolve: {childAccount: resolveChildAccount, consumptionData: resolveConsumptionData}

	$stateProvider.state('user.account.intervaldata', {
		url: 'intervaldata',
		templateUrl: "app/routes/user/account/intervaldata/intervaldata.html",
		controller: "IntervalDataCtrl", // Note was using accountCtrl!!
		controllerAs: "intervalDataCtrl",
		resolve: {childAccount: resolveChildAccount} // , consumptionData: resolveConsumptionData , consumptionData: resolveConsumptionData
	});
});

angular.module('myaccount.route').controller('IntervalDataCtrl', function($scope, ChartServer, Events, HTML5_DATE_FORMAT, intervalData, intervalDataService, Modals) {
	var self = this;

	this.account = $scope.accountCtrl.currentAccount;
	this.contractAccountNumber = this.account.contractAccountNumber;
	this.supplyPeriod = this.account.consumptionHistory.supplyPeriod;
	if (this.account.collective) {
		intervalData.showfooter = false;
		intervalDataService.initChild(this.account, this.supplyPeriod);
	} else {
		intervalData.showfooter = true;
		intervalDataService.init(this.contractAccountNumber, this.account.installationDetails.intervalDevices, this.supplyPeriod);
	}
	//IntervalDataService.init(this.contractAccountNumber, this.account.installationDetails.intervalDevices);

	// Scope functions
	this.clickNavigate = function (index) {
		if (intervalDataService.current.dayInterval === 0) {

			intervalDataService.dateSearch(this.goBackStartDate(), this.goBackEndDate());
		} else {
			var clickedDate = moment(this.startDate()).add(index, 'days').format(HTML5_DATE_FORMAT);
			intervalDataService.dateSearch(clickedDate, clickedDate);
		}
	};
	this.returnToDailyView = function () {
		intervalDataService.dailyViewPreviousSearch();
	}
	this.previousInterval = function () {
		intervalDataService.previousInterval();
	};

	this.nextInterval = function () {
		intervalDataService.nextInterval();
	};

	this.displayGraph = function () {
		return intervalData.dayInterval >= 0 && intervalData.hasData;
	};

	this.displayLookupErrorMessage = function () {
		return intervalData.dayInterval >= 0 && !intervalData.hasData;
	};

	this.chartTitle = function () {
		if (!(intervalDataService.current.startDate && intervalDataService.current.startDate)) {
			return "";
		}

		return moment(intervalDataService.current.startDate).format("D MMMM YYYY") + (intervalDataService.current.dayInterval === 0 ? "" :
			" to " + moment(intervalDataService.current.endDate).format("D MMMM YYYY"));
	};

	this.tabularDate = function (index) {
		return moment(intervalDataService.current.startDate).add(index, 'days').format('DD/MM/YYYY');
	};

	this.tabularTime = function (index, interval) {
		var minutes = index * interval;
		return moment(intervalDataService.current.startDate).add(minutes, 'minutes').format('HH:mm');
	};

	this.tabularKwh = function (peakValue, offpeakValue, weekendValue) {
		return weekendValue!==null ? weekendValue : peakValue === null ? offpeakValue : peakValue;
	}

	this.showHelpText = function (title, text) {
		Modals.showAlert(title, text);
	};

	// Start exposing of charts - TODO just expose service?
	this.consumptionChart = function () {
		var singleDay = intervalDataService.current.dayInterval === 0;
		return ChartServer.consumptionChart(singleDay);
	};

	this.singleDayElecLoadProfileChart = function () {
		return ChartServer.singleDayElecLoadProfileChart();
	};
	this.dailyElecLoadProfileChart = function () {
		return ChartServer.dailyElecLoadProfileChart();
	};

	this.powerFactorChart = function () {
		var singleDay = intervalDataService.current.dayInterval === 0;
		return ChartServer.powerFactorChart(singleDay);
	};

	this.loadFactorChart = function () {
		var singleDay = intervalDataService.current.dayInterval === 0;
		return ChartServer.loadFactorChart(singleDay);
	};

	this.gasConsumptionChart = function () {
		var singleDay = intervalDataService.current.dayInterval === 0;
		return ChartServer.gasConsumptionChart(singleDay);
	};

	this.gasLoadProfileChart = function () {
		var singleDay = intervalDataService.current.dayInterval === 0;
		return ChartServer.gasLoadProfileChart(singleDay);
	};
	// End exposing charts

	this.startDate = function () {
		return intervalDataService.current.startDate;
	};

	this.endDate = function () {
		return intervalDataService.current.endDate;
	};

	this.goBackStartDate = function () {
		return intervalDataService.lastSearched.startDate || intervalDataService.current.startDate;
	};

	this.goBackEndDate = function () {
		return intervalDataService.lastSearched.endDate || intervalDataService.current.endDate;
	};

	this.goBackDevices = function () {
		return intervalDataService.lastSearched.meters || intervalDataService.current.meters;
	};

	this.printChart = function () {
		window.print();
	};

	this.showGeneration = function () {

		if(!this.account.collective) {
			var devices = this.account.installationDetails.intervalDevices;
			if (!_.isEmpty(devices) && !_.isEmpty(_.where(devices, {direction: 'G', showGeneration: true}))) {
				intervalData.showGenerationTab=true;
				return true;
			}
		}else{
			intervalData.showGenerationTab = intervalDataService.intervalGenerationdevices;
			return intervalDataService.intervalGenerationdevices;
		}

		return false;
	}

	if (!this.account.collective) {
		intervalDataService.landingSearch();
	}
	intervalData.setTabMode();
	this.intervalData = intervalData;


});

angular.module('myaccount.route').controller('IntervalSearchCtrl', function($scope, HTML5_DATE_FORMAT, intervalData, intervalDataService, Modals) {
	var self = this;

	//This.showfooter =false;

	this.selectTrigger = Modernizr.borderradius ? 'focus' : 'click';
	this.dropdownSettings={
		scrollableHeight: '130px',
		scrollable: true,
		enableSearch: false
	}
	this.translationbutton={checkAll:'Select all',uncheckAll:'Deselect all'}

	this.userSearch = {
		startDate: intervalDataService.current.startDate,
		endDate: intervalDataService.current.endDate,
		meters: intervalDataService.current.meters,
		error: undefined
	};
	// +'  From:'+moment(meter.installFrom).format("DD/MM/YYYY") +' To:'+ moment(meter.installTo).format("DD/MM/YYYY") : +'  From:'+moment(meter.installFrom).format("DD/MM/YYYY") +' To:'+ moment(meter.installTo).format("DD/MM/YYYY")
	this.meterDisplayName = function(meter) {
		return angular.isDefined(meter.customDeviceName) ? meter.customDeviceName + ' - ' + meter.deviceId : meter.deviceId ;
	};

	this.childAccountDisplay = function(account) {
		return angular.isDefined(account) ? account.contractAccountNumber + " / " + account.contract + " - " + account.premiseAddress.label : null;
	};

	this.meterSelected = function(meter) {
		return _.findIndex(this.userSearch.meters, {deviceId: meter.deviceId}) !== -1;
	};
	this.electricityMeters = function() {
		return intervalDataService.eDevices || [];
	};
	this.gasMeters = function() {
		return intervalDataService.gDevices || [];
	};

	this.displayChildAccount = function() {
		return intervalDataService.collectiveChilAccount || [];
	};

	this.displayMeters = function() {
		return this.electricityMeters().length + this.gasMeters().length > 1;
	};

	this.dualMetered = function() {
		return self.electricityMeters().length > 0 && self.gasMeters().length > 0;
	};

	this.lastWeek = function() {
		this.userSearch.startDate = moment(intervalDataService.current.startDate).subtract(7, 'days').format(HTML5_DATE_FORMAT);
		this.userSearch.endDate = moment(intervalDataService.current.endDate).subtract(7, 'days').format(HTML5_DATE_FORMAT);
		this.display();
	};

	this.lastYear = function() {
		if(moment(intervalDataService.current.startDate).subtract(1, 'years').format(HTML5_DATE_FORMAT) > moment(intervalDataService.lastSearched.minLimitDate).format(HTML5_DATE_FORMAT)) {
			this.userSearch.startDate = moment(intervalDataService.current.startDate).subtract(1, 'years').format(HTML5_DATE_FORMAT);
			this.userSearch.endDate = moment(intervalDataService.current.endDate).subtract(1, 'years').format(HTML5_DATE_FORMAT);
			this.display();
		}else{
			Modals.showConfirmation("Interval Data", "Sorry, you cannot view the same period last year as this account was not active in that period. Please select a different date range.");
		}

	};
	this.intervalGenerationdevices =function(intervaldevices){
		var devices = intervaldevices;
		if (!_.isEmpty(devices) && !_.isEmpty(_.where(devices, {direction: 'G', showGeneration: true}))) {
			//Return true;
			intervalDataService.intervalGenerationdevices =true;
		}else{
			intervalDataService.intervalGenerationdevices =false;
		}
	}
	this.selectChildAccount = function() {
		intervalData.showfooter=false;
		if (this.userSearch.childAccount.contractAccountNumber !== "") {

			self = this;
			intervalDataService.getDeviceList(this.userSearch.childAccount.contractAccountNumber).then(function(result){
				self.intervalGenerationdevices(result);
				intervalDataService.init(self.userSearch.childAccount.contractAccountNumber, result, intervalDataService.usageSupplyPeriod);
				intervalDataService.landingSearch();
				self.userSearch.startDate = intervalDataService.current.startDate;
				self.userSearch.endDate = intervalDataService.current.endDate;
				self.userSearch.meters = intervalDataService.current.meters;
				intervalData.showfooter=true;
			}, function(error){
				//If an error happened, handle it here
			});
		}
	};
	this.search = function() {

		// Angular Strap and IE8 don't play nicely when a string is passed in
		// So we need to create a temp object for the search. Can be retired with
		// IE8 and self.userSearch passed straight through.
		var searchDto = {
			startDate: moment(self.userSearch.startDate),
			endDate: moment(self.userSearch.endDate)
		};
		var filter = {
			start: {
				max: intervalDataService.lastSearched.maxLimitDate,
				min: intervalDataService.lastSearched.minLimitDate
			},
			end: {
				max: intervalDataService.lastSearched.maxLimitDate,
				min: intervalDataService.lastSearched.minLimitDate
			}
		};

    	var promise = Modals.showDateRange(searchDto, filter);

    	promise.then(function(result) {
			self.userSearch.startDate = searchDto.startDate;
			self.userSearch.endDate = searchDto.endDate;
			intervalDataService.dateSearch(self.userSearch.startDate, self.userSearch.endDate);
    	});
	};

	this.dateRangeLabel = function() {
		if (!(intervalDataService.current.startDate && intervalDataService.current.startDate)) {
			return "";
		}

		return moment(intervalDataService.current.startDate).format("MMM DD, YYYY") + " - " + moment(intervalDataService.current.endDate).format("MMM DD, YYYY");
	};

	this.disableSearch = function() {
		return moment(self.userSearch.startDate).isAfter(moment(self.userSearch.endDate));
	};

	this.display = function() {
		if (!angular.isDefined(this.userSearch.meters) || this.userSearch.meters.length === 0) {
        	self.userSearch.error = "Please select a meter.";return;
		} else if (!angular.isDefined(self.userSearch.startDate)) {
        	self.userSearch.error = "Please select a start date.";return;
		} else if (!angular.isDefined(self.userSearch.endDate)) {
        	self.userSearch.error = "Please select an end date.";return;
		}

		self.userSearch.error = undefined;
		intervalDataService.search(self.userSearch.meters, self.userSearch.startDate, self.userSearch.endDate);
	};

	this.intervalData = intervalData;
});

