/**
 * TODO consider moving under history
 */
angular.module('myaccount.route').config(function($stateProvider) {
	$stateProvider.state('user.account.lifestyle', {
		url: 'lifestyle',
        templateUrl: "app/routes/user/account/lifestyle/lifestyle.html",
        controller: "LifestyleCtrl", // note was using accountCtrl!!
        controllerAs: "lifestyleCtrl"
    });
});

angular.module('myaccount.route').controller('LifestyleCtrl', function($scope, LifestyleChartServer, Events, HTML5_DATE_FORMAT, lifestyle, lifestyleService, Modals) {
    var self = this;
	
	this.account = $scope.accountCtrl.currentAccount;
    this.contractAccountNumber = this.account.contractAccountNumber;

    lifestyleService.init(this.contractAccountNumber, this.account.installationDetails.intervalDevices);

    // Scope functions
    this.clickNavigate = function(index){
        if (lifestyleService.current.dayInterval == 0) {
            lifestyleService.dateSearch(this.goBackStartDate(), this.goBackEndDate());
        } else {
            var clickedDate = moment(this.startDate()).add(index, 'days').format(HTML5_DATE_FORMAT);
            lifestyleService.dateSearch(clickedDate, clickedDate);
        }
    };
    
    this.previousInterval = function() {
        lifestyleService.previousInterval();
    };

    this.nextInterval = function() {
        lifestyleService.nextInterval();
    };

    this.displayGraph = function() {
        return lifestyle.dayInterval >= 0 && lifestyle.hasData;
    };

    this.displayLookupErrorMessage = function() {
        return lifestyle.dayInterval >= 0 && !lifestyle.hasData;
    };

    this.chartTitle = function() {
        if (!(lifestyleService.current.startDate && lifestyleService.current.startDate)) {
            return "";
        }

        return lifestyleService.current.dayInterval === 0 ? "Select the graph to return to the selected date range" : "Select the graph to switch to the daily view";

        /* return moment(lifestyleService.current.startDate).format("D MMMM YYYY") + (lifestyleService.current.dayInterval === 0 ? "" :
         " to " + moment(lifestyleService.current.endDate).format("D MMMM YYYY"));*/
    };

    this.tabularDate = function(index) {
        return moment(lifestyleService.current.startDate).add(index, 'days').format('DD/MM/YYYY');
    };

    this.tabularTime = function(index, interval) {
        var minutes = index * interval;
        return moment(lifestyleService.current.startDate).add(minutes, 'minutes').format('HH:mm');
    };

    this.tabularKwh = function (peakValue, offpeakValue){
        return peakValue === null ? offpeakValue : peakValue;
    }

    this.showHelpText = function(title, text) {
        Modals.showAlert(title, text);
    };

    // Start exposing of charts - TODO just expose service?
    this.consumptionChart = function() {
        var singleDay = lifestyleService.current.dayInterval === 0;
        return LifestyleChartServer.consumptionChart(singleDay);
    };

    this.singleDayElecLoadProfileChart = function() {

        return LifestyleChartServer.singleDayElecLoadProfileChart();
    };
    this.dailyElecLoadProfileChart = function() {

        return LifestyleChartServer.dailyElecLoadProfileChart();
    };

    this.powerFactorChart = function() {
        var singleDay = lifestyleService.current.dayInterval === 0;
        return LifestyleChartServer.powerFactorChart(singleDay);
    };

    this.loadFactorChart = function() {
        var singleDay = lifestyleService.current.dayInterval === 0;
        return LifestyleChartServer.loadFactorChart(singleDay);
    };

    this.gasConsumptionChart = function() {
        var singleDay = lifestyleService.current.dayInterval === 0;
        return LifestyleChartServer.gasConsumptionChart(singleDay);
    };

    this.gasLoadProfileChart = function() {
        var singleDay = lifestyleService.current.dayInterval === 0;
        return LifestyleChartServer.gasLoadProfileChart(singleDay);
    };
    // End exposing charts

    this.startDate = function() {
        return lifestyleService.current.startDate;
    };

    this.endDate = function() {
        return lifestyleService.current.endDate;
    };

    this.goBackStartDate = function() {
        return lifestyleService.lastSearched.startDate || lifestyleService.current.startDate;
    };

    this.goBackEndDate = function() {
        return lifestyleService.lastSearched.endDate || lifestyleService.current.endDate;
    };

    this.goBackDevices = function() {
        return lifestyleService.lastSearched.meters || lifestyleService.current.meters;
    };

    this.printChart = function() {
        if (lifestyle.isVisual()) {
            $scope.$broadcast(Events.INTERVAL_PRINT);
        } else {
            window.print();
        }
    };

    lifestyleService.landingSearch();
    lifestyle.setTabMode();

    this.lifestyle = lifestyle;
    
});

angular.module('myaccount.route').controller('LifestyleSearchCtrl', function($scope, HTML5_DATE_FORMAT, lifestyle, lifestyleService, Modals) {
	var self = this;

    this.selectTrigger = Modernizr.borderradius ? 'focus' : 'click'

    this.userSearch = {
        startDate: lifestyleService.current.startDate,
        endDate: lifestyleService.current.endDate,
        meters: lifestyleService.current.meters,
        error: undefined
    };

    this.meterDisplayName = function(meter) {
        return angular.isDefined(meter.customDeviceName) ? meter.customDeviceName + ' - ' + meter.deviceId : meter.deviceId;
    };

    this.meterSelected = function(meter) {
        return _.findIndex(this.userSearch.meters, {deviceId: meter.deviceId}) != -1;
    };
    this.electricityMeters = function() {
        return lifestyleService.eDevices || [];
    };
    this.gasMeters = function() {
        return lifestyleService.gDevices || [];
    };

    this.displayMeters = function() {
        return this.electricityMeters().length + this.gasMeters().length > 1;
    };

    this.dualMetered = function() {
        return self.electricityMeters().length > 0 && self.gasMeters().length > 0;
    };

    this.lastWeek = function() {
        this.userSearch.startDate = moment(lifestyleService.current.startDate).subtract(7, 'days').format(HTML5_DATE_FORMAT);
        this.userSearch.endDate = moment(lifestyleService.current.endDate).subtract(7, 'days').format(HTML5_DATE_FORMAT);
        this.display();
    };

    this.lastYear = function() {
        this.userSearch.startDate = moment(lifestyleService.current.startDate).subtract(1, 'years').format(HTML5_DATE_FORMAT);
        this.userSearch.endDate = moment(lifestyleService.current.endDate).subtract(1, 'years').format(HTML5_DATE_FORMAT);
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
                max: lifestyleService.dateSearchLimit.max
                /*min: lifestyleService.dateSearchLimit.min*/
            },
            end: {
                max: lifestyleService.dateSearchLimit.max
                /*min: lifestyleService.dateSearchLimit.min*/
            }
        };

    	var promise = Modals.showDateRange(searchDto, filter);

    	promise.then(function(result) {
            self.userSearch.startDate = searchDto.startDate;
            self.userSearch.endDate = searchDto.endDate;
            lifestyleService.dateSearch(self.userSearch.startDate, self.userSearch.endDate);
    	});
    };
    
    this.dateRangeLabel = function() {
        if (!(lifestyleService.current.startDate && lifestyleService.current.startDate)) { return ""; }

        return moment(lifestyleService.current.startDate).format("MMM DD, YYYY") + " - " + moment(lifestyleService.current.endDate).format("MMM DD, YYYY");
    };

    this.disableSearch = function() {
        return moment(self.userSearch.startDate).isAfter(moment(self.userSearch.endDate));
    };

    this.display = function() {
        /*if (!angular.isDefined(this.userSearch.meters) || this.userSearch.meters.length == 0) {
        	self.userSearch.error = "Please select a meter.";return;
        } else if (!angular.isDefined(self.userSearch.startDate)) {
        	self.userSearch.error = "Please select a start date.";return;
        } else if (!angular.isDefined(self.userSearch.endDate)) {
        	self.userSearch.error = "Please select an end date.";return;
        }

        self.userSearch.error = undefined;
        lifestyleService.search(self.userSearch.meters, self.userSearch.startDate, self.userSearch.endDate);*/
    };

    this.lifestyle = lifestyle;
});

