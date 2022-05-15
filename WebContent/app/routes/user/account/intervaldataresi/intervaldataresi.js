/**
 * TODO consider moving under history
 */
angular.module('myaccount.route').config(function($stateProvider) {
	$stateProvider.state('user.account.evhomeplan', {
		url: 'evhomeplan',
        templateUrl: "app/routes/user/account/intervaldataresi/intervaldataresi.html",
        controller: "IntervalDataResiCtrl", // note was using accountCtrl!!
        controllerAs: "intervalDataResiCtrl"
    });
});

angular.module('myaccount.route').controller('IntervalDataResiCtrl', function($scope, intervalDataResiChartServer, Events, HTML5_DATE_FORMAT, intervalDataResi, intervalDataResiService, Modals) {
    var self = this;
	
	this.account = $scope.accountCtrl.currentAccount;
    this.contractAccountNumber = this.account.contractAccountNumber;

    intervalDataResiService.init(this.contractAccountNumber, this.account.installationDetails.intervalDevices);

    // Scope functions
    this.clickNavigate = function(index){

        if (intervalDataResiService.current.dayInterval == 0) {
            intervalDataResiService.dateSearch(this.goBackStartDate(), this.goBackEndDate());
        } else {
            var clickedDate = moment(this.startDate()).add(index, 'days').format(HTML5_DATE_FORMAT);
            intervalDataResiService.dateSearch(clickedDate, clickedDate);
        }
    };
    
    this.previousInterval = function() {
        intervalDataResiService.previousInterval();
    };

    this.nextInterval = function() {
        intervalDataResiService.nextInterval();
    };

    this.displayGraph = function() {
        return intervalDataResi.dayInterval >= 0 && intervalDataResi.hasData;
    };

    this.displayLookupErrorMessage = function() {
        return intervalDataResi.dayInterval >= 0 && !intervalDataResi.hasData;
    };

    this.chartTitle = function() {
        if (!(intervalDataResiService.current.startDate && intervalDataResiService.current.startDate)) { return ""; }

        return intervalDataResiService.current.dayInterval === 0 ? "Select the graph to return to the selected date range" : "Select the graph to switch to the daily view";

        /*return moment(solarService.current.startDate).format("D MMMM YYYY") + (solarService.current.dayInterval === 0 ? "" :
            " to " + moment(solarService.current.endDate).format("D MMMM YYYY"));*/
    };

    this.tabularDate = function(index) {
        return moment(intervalDataResiService.current.startDate).add(index, 'days').format('DD/MM/YYYY');
    };

    this.tabularTime = function(index, interval) {
        var minutes = index * interval;
        return moment(intervalDataResiService.current.startDate).add(minutes, 'minutes').format('HH:mm');
    };

    this.tabularKwh = function (peakValue, offpeakValue){
        return peakValue === null ? offpeakValue : peakValue;
    }

    this.showHelpText = function(title, text) {
        Modals.showAlert(title, text);
    };

    // Start exposing of charts - TODO just expose service?
    this.consumptionChart = function() {
        var singleDay = intervalDataResiService.current.dayInterval === 0;
        return intervalDataResiChartServer.consumptionChart(singleDay);
    };

    // End exposing charts

    this.startDate = function() {
        return intervalDataResiService.current.startDate;
    };

    this.endDate = function() {
        return intervalDataResiService.current.endDate;
    };

    this.goBackStartDate = function() {
        return intervalDataResiService.lastSearched.startDate || intervalDataResiService.current.startDate;
    };

    this.goBackEndDate = function() {
        return intervalDataResiService.lastSearched.endDate || intervalDataResiService.current.endDate;
    };

    this.goBackDevices = function() {
        return intervalDataResiService.lastSearched.meters || intervalDataResiService.current.meters;
    };

    this.printChart = function() {
        if (intervalDataResi.isVisual()) {
            $scope.$broadcast(Events.INTERVAL_PRINT);
        } else {
            window.print();
        }
    };

    intervalDataResiService.landingSearch();
    intervalDataResi.setTabMode();

    this.intervalDataResi = intervalDataResi;
    
});

angular.module('myaccount.route').controller('IntervalDataResiSearchCtrl', function($scope, HTML5_DATE_FORMAT, intervalDataResi, intervalDataResiService, Modals) {
	var self = this;

    this.selectTrigger = Modernizr.borderradius ? 'focus' : 'click'

    this.userSearch = {
        startDate: intervalDataResiService.current.startDate,
        endDate: intervalDataResiService.current.endDate,
        meters: intervalDataResiService.current.meters,
        error: undefined
    };

    this.meterDisplayName = function(meter) {
        return angular.isDefined(meter.customDeviceName) ? meter.customDeviceName + ' - ' + meter.deviceId : meter.deviceId;
    };

    this.meterSelected = function(meter) {
        return _.findIndex(this.userSearch.meters, {deviceId: meter.deviceId}) != -1;
    };
    this.electricityMeters = function() {
        return intervalDataResiService.eDevices || [];
    };
    this.gasMeters = function() {
        return intervalDataResiService.gDevices || [];
    };

    this.displayMeters = function() {
        return this.electricityMeters().length + this.gasMeters().length > 1;
    };

    this.dualMetered = function() {
        return self.electricityMeters().length > 0 && self.gasMeters().length > 0;
    };

    this.lastWeek = function() {
        this.userSearch.startDate = moment(intervalDataResiService.current.startDate).subtract(7, 'days').format(HTML5_DATE_FORMAT);
        this.userSearch.endDate = moment(intervalDataResiService.current.endDate).subtract(7, 'days').format(HTML5_DATE_FORMAT);
        this.display();
    };

    this.lastYear = function() {
        this.userSearch.startDate = moment(intervalDataResiService.current.startDate).subtract(1, 'years').format(HTML5_DATE_FORMAT);
        this.userSearch.endDate = moment(intervalDataResiService.current.endDate).subtract(1, 'years').format(HTML5_DATE_FORMAT);
        this.display();
    };
        
    this.search = function() {

        // Angular Strap and IE8 don't play nicely when a string is passed in
        // so we need to create a temp object for the search. Can be retired with
        // IE8 and self.userSearch passed straight through.
        var searchDto = {
            startDate: moment(self.userSearch.startDate),
            endDate: moment(self.userSearch.endDate)
        };
        var filter = {
            start: {
                max: intervalDataResiService.dateSearchLimit.max
                /*min: solarService.dateSearchLimit.min*/
            },
            end: {
                max: intervalDataResiService.dateSearchLimit.max
              /* min: solarService.dateSearchLimit.min*/
            }
        };

    	var promise = Modals.showDateRange(searchDto, filter);

    	promise.then(function(result) {
            self.userSearch.startDate = searchDto.startDate;
            self.userSearch.endDate = searchDto.endDate;
            intervalDataResiService.dateSearch(self.userSearch.startDate, self.userSearch.endDate);
    	});
    };
    
    this.dateRangeLabel = function() {
        if (!(intervalDataResiService.current.startDate && intervalDataResiService.current.startDate)) { return ""; }

        return moment(intervalDataResiService.current.startDate).format("MMM DD, YYYY") + " - " + moment(intervalDataResiService.current.endDate).format("MMM DD, YYYY");
    };

    this.disableSearch = function() {
        return moment(self.userSearch.startDate).isAfter(moment(self.userSearch.endDate));
    };

    this.display = function() {
       /* if (!angular.isDefined(this.userSearch.meters) || this.userSearch.meters.length == 0) {
        	self.userSearch.error = "Please select a meter.";return;
        } else if (!angular.isDefined(self.userSearch.startDate)) {
        	self.userSearch.error = "Please select a start date.";return;
        } else if (!angular.isDefined(self.userSearch.endDate)) {
        	self.userSearch.error = "Please select an end date.";return;
        }

        self.userSearch.error = undefined;
        solarService.search(self.userSearch.meters, self.userSearch.startDate, self.userSearch.endDate);*/
    };

    this.intervalDataResi = intervalDataResi;
});

