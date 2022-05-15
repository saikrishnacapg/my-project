/**
 * TODO consider updating all to Interval
 */

angular.module('myaccount.route').controller('AmiIntervalCtrl', function($scope, amiIntervalChartServer, Events, HTML5_DATE_FORMAT, amiInterval, amiIntervalService, Modals, $state, AmiInsightService) {
	var self = this;
	this.account = $scope.accountCtrl.currentAccount;
	this.contractAccountNumber = this.account.contractAccountNumber;
	this.dailyUsageCost = AmiInsightService.unbilledInsight.unbilledAmount;
	this.supplyPeriod = this.account.consumptionHistory.supplyPeriod;
	this.billPeriods = this.account.consumptionHistory.records;
	this.latestBillPeriodEndDate = function(){
		var latestBill = _.find(this.billPeriods, {'billIsNew': true});
		return moment(latestBill.supplyPeriod.endDate).format(HTML5_DATE_FORMAT);
	};
	this.latestBillPeriodEndDate = $scope.accountCtrl.isAmiCustomer() ? this.latestBillPeriodEndDate() : null;

	this.getBilledAndUnbilledStatus = function (index, type) {
		var startDate, unBilledDate
		var BillPeriodEndDate = this.latestBillPeriodEndDate
		if (type==='date'){
			startDate= moment(new Date(index)).format("YYYY-MM-DDTHH:mm:ss.sss[Z]")
			unBilledDate=moment(new Date(BillPeriodEndDate)).format("YYYY-MM-DDTHH:mm:ss.sss[Z]");
		} else {
			startDate= moment(new Date(amiIntervalService.current.startDate)).add(index, 'days').format("YYYY-MM-DDTHH:mm:ss.sss[Z]")
			unBilledDate=moment(new Date(BillPeriodEndDate)).format("YYYY-MM-DDTHH:mm:ss.sss[Z]");
		}
		if (startDate > unBilledDate) {
			return 'Not yet billed'
		}
		return 'Billed'

	};

	amiIntervalService.init(this.contractAccountNumber, this.account.installationDetails.intervalDevices, this.supplyPeriod, this.latestBillPeriodEndDate);

	// Scope functions
	this.clickNavigate = function(index){

		if (amiIntervalService.current.dayInterval === 0) {
			amiIntervalService.dateSearch(this.goBackStartDate(), this.goBackEndDate());
		} else {
			var clickedDate = moment(this.startDate()).add(index, 'days').format(HTML5_DATE_FORMAT);
			amiIntervalService.dateSearch(clickedDate, clickedDate);
		}
	};

	this.returnToDailyView = function () {
		amiIntervalService.dailyViewPreviousSearch();
	};

	this.previousInterval = function() {
		amiIntervalService.previousInterval();
	};

	this.nextInterval = function() {
		amiIntervalService.nextInterval();
	};

	this.displayGraph = function() {
		return amiInterval.dayInterval >= 0 && amiInterval.hasData;
	};

	this.displayLookupErrorMessage = function() {
		return amiInterval.dayInterval >= 0 && !amiInterval.hasData;
	};

	this.chartTitle = function() {
		if (!(amiIntervalService.current.startDate && amiIntervalService.current.startDate)) {
			return "";
		}

		return amiIntervalService.current.dayInterval === 0 ? "Select the graph to return to the selected date range" : "Select day to view half hourly data";

	};

	this.tableTitle = function() {
		if (!(amiIntervalService.current.startDate && amiIntervalService.current.startDate)) {
			return "";
		}

		return amiIntervalService.current.dayInterval === 0 ? "" : "Select day to view half hourly data";

	};

	this.footerTitle = function() {
		if (!(amiIntervalService.current.startDate && amiIntervalService.current.startDate)) {
			return "";
		}

		return amiIntervalService.current.dayInterval === 0 ? "30 minute usage" : "Daily usage";

	};


	this.tabularDate = function(index) {
		return moment(amiIntervalService.current.startDate).add(index, 'days').format('DD/MM/YYYY');
	};

	this.tabularTime = function(index, interval) {
		var minutes = index * interval;
		return moment(amiIntervalService.current.startDate).add(minutes, 'minutes').format('HH:mm');
	};

	this.tabularKwh = function (peakValue, offpeakValue){
		return peakValue === null ? offpeakValue : peakValue;
	}

	this.showHelpText = function(title, text) {
		Modals.showAlert(title, text);
	};

	// Start exposing of charts - TODO just expose service?
	this.consumptionChart = function() {
		var singleDay = amiIntervalService.current.dayInterval === 0;
		return amiIntervalChartServer.consumptionChart(singleDay);
	};

	// End exposing charts

	this.startDate = function() {
		return amiIntervalService.current.startDate;
	};

	this.endDate = function() {
		return amiIntervalService.current.endDate;
	};

	this.goBackStartDate = function() {
		return amiIntervalService.lastSearched.startDate || amiIntervalService.current.startDate;
	};

	this.goBackEndDate = function() {
		return amiIntervalService.lastSearched.endDate || amiIntervalService.current.endDate;
	};

	this.goBackDevices = function() {
		return amiIntervalService.lastSearched.meters || amiIntervalService.current.meters;
	};

	this.printChart = function() {
		if (amiInterval.isVisual()) {
			$scope.$broadcast(Events.INTERVAL_PRINT);
		} else {
			window.print();
		}
	};


	this.setDataMode = function (mode, buttonClass) {
		$(".btn-chart").removeClass("activeButton");
		$("." + buttonClass).addClass("activeButton");
		amiInterval.setTabMode({title: mode});
	}

	this.showGeneration = function (){
		/* ** So it DIRECTION = ‘G’ and SHOW_GENERATION = ‘X’ then you can show it.
                Otherwise DIRECTION = ‘G’ and SHOW_GENERATION = ‘ ’ hide it.
        */
		var devices = this.account.installationDetails.intervalDevices;
		if (!_.isEmpty(devices) && !_.isEmpty(_.where(devices, {direction: 'G', showGeneration: true}))){
			amiInterval.showGenerationTab=true;
			return true;
		}

		return false;
	}

	amiIntervalService.landingSearch();
	amiInterval.setTabMode({title: 'Consumption'});


	this.amiInterval = amiInterval;

});

angular.module('myaccount.route').controller('AmiIntervalSearchCtrl', function($scope, HTML5_DATE_FORMAT, amiInterval, amiIntervalService, Modals, $state) {
	var self = this;

	this.selectTrigger = Modernizr.borderradius ? 'focus' : 'click'
	this.dropdownSettings={
		scrollableHeight: '130px',
		scrollable: true,
		enableSearch: false
	};
	this.translationbutton={checkAll:'Select all',uncheckAll:'Deselect all'}
	this.userSearch = {
		startDate: amiIntervalService.current.startDate,
		endDate: amiIntervalService.current.endDate,
		meters: amiIntervalService.current.meters,
		error: undefined
	};

	this.meterDisplayName = function(meter) {
		return angular.isDefined(meter.customDeviceName) ? meter.deviceId : meter.deviceId ;
		//Return angular.isDefined(meter.customDeviceName) ? meter.deviceId +'  From:'+moment(meter.installFrom).format("DD/MM/YYYY") +' To:'+ moment(meter.installTo).format("DD/MM/YYYY") : meter.deviceId +' '+moment(meter.installFrom).format("DD/MM/YYYY") +'-'+ moment(meter.installTo).format("DD/MM/YYYY");
	};

	this.meterSelected = function(meter) {
		return _.findIndex(this.userSearch.meters, {deviceId: meter.deviceId}) !== -1;
	};
	this.electricityMeters = function() {
		return amiIntervalService.eDevices || [];
	};
	this.gasMeters = function() {
		return amiIntervalService.gDevices || [];
	};

	this.displayMeters = function() {
		return this.electricityMeters().length + this.gasMeters().length > 1;
	};

	this.dualMetered = function() {
		return self.electricityMeters().length > 0 && self.gasMeters().length > 0;
	};

	this.lastWeek = function() {
		this.userSearch.startDate = moment(amiIntervalService.current.startDate).subtract(7, 'days').format(HTML5_DATE_FORMAT);
		this.userSearch.endDate = moment(amiIntervalService.current.endDate).subtract(7, 'days').format(HTML5_DATE_FORMAT);
		this.display();
	};

	this.lastYear = function() {
		this.userSearch.startDate = moment(amiIntervalService.current.startDate).subtract(1, 'years').format(HTML5_DATE_FORMAT);
		this.userSearch.endDate = moment(amiIntervalService.current.endDate).subtract(1, 'years').format(HTML5_DATE_FORMAT);
		this.display();
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
				max: amiIntervalService.lastSearched.maxLimitDate,
				min: amiIntervalService.lastSearched.minLimitDate
			},
			end: {
				max: amiIntervalService.lastSearched.maxLimitDate,
				min: amiIntervalService.lastSearched.minLimitDate
			}
		};

    	var promise = Modals.showDateRange(searchDto, filter);

    	promise.then(function(result) {
			self.userSearch.startDate = searchDto.startDate;
			self.userSearch.endDate = searchDto.endDate;
			amiIntervalService.dateSearch(self.userSearch.startDate, self.userSearch.endDate);
    	});
	};

	this.dateRangeLabel = function() {
		if (!(amiIntervalService.current.startDate && amiIntervalService.current.startDate)) {
			return "";
		}

		return moment(amiIntervalService.current.startDate).format("MMM DD, YYYY") + " - " + moment(amiIntervalService.current.endDate).format("MMM DD, YYYY");
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
		amiIntervalService.search(self.userSearch.meters, self.userSearch.startDate, self.userSearch.endDate);
	};
	this.amiInterval = amiInterval;
});

