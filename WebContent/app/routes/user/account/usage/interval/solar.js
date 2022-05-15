/**
 * TODO consider updating all to Interval
 */

angular.module('myaccount.route').controller('SolarCtrl', function($scope, solarChartServer, Events, HTML5_DATE_FORMAT, solar, solarService, Modals, $state, AmiInsightService) {
	var self = this;

	this.account = $scope.accountCtrl.currentAccount;
	this.contractAccountNumber = this.account.contractAccountNumber;

	this.supplyPeriod = this.account.consumptionHistory.supplyPeriod;
	this.billPeriods = this.account.consumptionHistory.records;
	this.latestBillPeriodEndDate = function(){
		var latestBill = _.find(this.billPeriods, {'billIsNew': true});
		return moment(latestBill.supplyPeriod.endDate).format(HTML5_DATE_FORMAT);
	};
	this.latestBillPeriodEndDate = $scope.accountCtrl.isAmiCustomer() ? this.latestBillPeriodEndDate() : null;

	solarService.init(this.contractAccountNumber, this.account.installationDetails.intervalDevices, this.supplyPeriod, this.latestBillPeriodEndDate);

	// Scope functions
	this.clickNavigate = function(index){

		// eslint-disable-next-line eqeqeq
		if (solarService.current.dayInterval == 0) {
			solarService.dateSearch(this.goBackStartDate(), this.goBackEndDate());
		} else {
			var clickedDate = moment(this.startDate()).add(index, 'days').format(HTML5_DATE_FORMAT);
			solarService.dateSearch(clickedDate, clickedDate);
		}
	};

	this.returnToDailyView = function () {
		solarService.dailyViewPreviousSearch();
	};

	this.previousInterval = function() {
		solarService.previousInterval();
	};

	this.nextInterval = function() {
		solarService.nextInterval();
	};

	this.displayGraph = function() {
		return solar.dayInterval >= 0 && solar.hasData;
	};

	this.displayLookupErrorMessage = function() {
		return solar.dayInterval >= 0 && !solar.hasData;
	};

	this.chartTitle = function() {
		if (!(solarService.current.startDate && solarService.current.startDate)) {
			return "";
		}

		return solarService.current.dayInterval === 0 ? "Select the graph to return to the selected date range" : "Select the graph to switch to the daily view";

	};

	this.tabularDate = function(index) {
		return moment(solarService.current.startDate).add(index, 'days').format('DD/MM/YYYY');
	};

	this.tabularTime = function(index, interval) {
		var minutes = index * interval;
		return moment(solarService.current.startDate).add(minutes, 'minutes').format('HH:mm');
	};

	this.tabularKwh = function (peakValue, offpeakValue){
		return peakValue === null ? offpeakValue : peakValue;
	}

	this.showHelpText = function(title, text) {
		Modals.showAlert(title, text);
	};

	// Start exposing of charts - TODO just expose service?
	this.consumptionChart = function() {
		var singleDay = solarService.current.dayInterval === 0;
		return solarChartServer.consumptionChart(singleDay);
	};

	// End exposing charts

	this.startDate = function() {
		return solarService.current.startDate;
	};

	this.endDate = function() {
		return solarService.current.endDate;
	};

	this.goBackStartDate = function() {
		return solarService.lastSearched.startDate || solarService.current.startDate;
	};

	this.goBackEndDate = function() {
		return solarService.lastSearched.endDate || solarService.current.endDate;
	};

	this.goBackDevices = function() {
		return solarService.lastSearched.meters || solarService.current.meters;
	};

	this.printChart = function() {
		if (solar.isVisual()) {
			$scope.$broadcast(Events.INTERVAL_PRINT);
		} else {
			window.print();
		}
	};


	this.setDataMode = function (mode, buttonClass) {
		$(".btn-chart").removeClass("activeButton");
		$("." + buttonClass).addClass("activeButton");
		solar.setTabMode({title: mode});
	}

	this.showGeneration = function (){
		/* ** So it DIRECTION = ‘G’ and SHOW_GENERATION = ‘X’ then you can show it.
                Otherwise DIRECTION = ‘G’ and SHOW_GENERATION = ‘ ’ hide it.
        */
		var devices = this.account.installationDetails.intervalDevices;
		if (!_.isEmpty(devices) && !_.isEmpty(_.where(devices, {direction: 'G', showGeneration: true}))){
			solar.showGenerationTab=true;
			return true;
		}

		return false;
	}
	solarService.landingSearch();
	solar.setTabMode({title: 'Consumption'});


	this.solar = solar;

});

angular.module('myaccount.route').controller('SolarSearchCtrl', function($scope, HTML5_DATE_FORMAT, solar, solarService, Modals, $state) {
	var self = this;

	this.selectTrigger = Modernizr.borderradius ? 'focus' : 'click'
	this.dropdownSettings={
		scrollableHeight: '130px',
		scrollable: true,
		enableSearch: false
	}
	this.translationbutton={checkAll:'Select all',uncheckAll:'Deselect all'}
	this.userSearch = {
		startDate: solarService.current.startDate,
		endDate: solarService.current.endDate,
		meters: solarService.current.meters,
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
		return solarService.eDevices || [];
	};
	this.gasMeters = function() {
		return solarService.gDevices || [];
	};

	this.displayMeters = function() {
		return this.electricityMeters().length + this.gasMeters().length > 1;
	};

	this.dualMetered = function() {
		return self.electricityMeters().length > 0 && self.gasMeters().length > 0;
	};

	this.lastWeek = function() {
		this.userSearch.startDate = moment(solarService.current.startDate).subtract(7, 'days').format(HTML5_DATE_FORMAT);
		this.userSearch.endDate = moment(solarService.current.endDate).subtract(7, 'days').format(HTML5_DATE_FORMAT);
		this.display();
	};

	this.lastYear = function() {
		this.userSearch.startDate = moment(solarService.current.startDate).subtract(1, 'years').format(HTML5_DATE_FORMAT);
		this.userSearch.endDate = moment(solarService.current.endDate).subtract(1, 'years').format(HTML5_DATE_FORMAT);
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
				max: solarService.lastSearched.maxLimitDate,
				min: solarService.lastSearched.minLimitDate
			},
			end: {
				max: solarService.lastSearched.maxLimitDate,
				min: solarService.lastSearched.minLimitDate
			}
		};

    	var promise = Modals.showDateRange(searchDto, filter);

    	promise.then(function(result) {
			self.userSearch.startDate = searchDto.startDate;
			self.userSearch.endDate = searchDto.endDate;
			solarService.dateSearch(self.userSearch.startDate, self.userSearch.endDate);
    	});
	};

	this.dateRangeLabel = function() {
		if (!(solarService.current.startDate && solarService.current.startDate)) {
			return "";
		}

		return moment(solarService.current.startDate).format("MMM DD, YYYY") + " - " + moment(solarService.current.endDate).format("MMM DD, YYYY");
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
		solarService.search(self.userSearch.meters, self.userSearch.startDate, self.userSearch.endDate);
		/*If($scope.accountCtrl.isAmiCustomer()){
            $state.go('user.account.usage.amiinsight');
        }*/
	};
	this.solar = solar;
});

