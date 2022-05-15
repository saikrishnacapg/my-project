/**
 * TODO consider moving under history
 */
angular.module('myaccount.route').config(function($stateProvider) {
	$stateProvider.state('user.account.powerbank', {
		url: 'powerbank',
        templateUrl: "app/routes/user/account/powerbank/powerbankdata.html",
        controller: "PowerbankDataCtrl", // note was using accountCtrl!!
        controllerAs: "powerbankDataCtrl"
    });
});

angular.module('myaccount.route').controller('PowerbankDataCtrl', function($scope, powerbankChartServer, Events, HTML5_DATE_FORMAT, powerbankData, powerbankDataService, Modals) {
    var self = this;

    this.account = $scope.accountCtrl.currentAccount;
    this.contractAccountNumber = this.account.consumptionSummary.current? this.account.consumptionSummary.current.contractNumber:this.account.contractAccountNumber;
    this.supplyPeriod = this.account.consumptionHistory.supplyPeriod;
    if (this.account.collective) {
        powerbankData.showfooter = false;
        powerbankDataService.initChild(this.account,this.supplyPeriod);
    } else {
        powerbankData.showfooter = true;
        powerbankDataService.init(this.contractAccountNumber);
    }
    powerbankData.productName=this.account.productDetails.energyProductLabel;
    this.clickNavigate = function (index) {
        if (powerbankDataService.current.dayInterval == 0) {

            powerbankDataService.dateSearch(this.goBackStartDate(), this.goBackEndDate());
        } else {
            var clickedDate = moment(this.startDate()).add(index, 'days').format(HTML5_DATE_FORMAT);
            powerbankDataService.dateSearch(clickedDate, clickedDate);
        }
    };

    this.previousInterval = function () {
        powerbankDataService.previousInterval();
    };

    this.nextInterval = function () {
        powerbankDataService.nextInterval();
    };

    this.displayGraph = function () {
        return powerbankData.dayInterval >= 0 && powerbankData.hasData;
    };

    this.displayLookupErrorMessage = function () {
        return powerbankData.dayInterval >= 0 && !powerbankData.hasData;
    };

    this.chartTitle = function () {
        if (!(powerbankDataService.current.startDate && powerbankDataService.current.startDate)) {
            return "";
        }

        return moment(powerbankDataService.current.startDate).format("D MMMM YYYY") + (powerbankDataService.current.dayInterval === 0 ? "" :
            " to " + moment(powerbankDataService.current.endDate).format("D MMMM YYYY"));
    };



    // Start exposing of charts - TODO just expose service?
    this.consumptionChart = function () {
        var singleDay = powerbankDataService.current.dayInterval === 0;
        return powerbankChartServer.consumptionChart(singleDay);
    };


    // End exposing charts

    this.startDate = function () {
        return powerbankDataService.current.startDate;
    };

    this.endDate = function () {
        return powerbankDataService.current.endDate;
    };

    this.goBackStartDate = function () {
        return powerbankDataService.lastSearched.startDate || powerbankDataService.current.startDate;
    };

    this.goBackEndDate = function () {
        return powerbankDataService.lastSearched.endDate || powerbankDataService.current.endDate;
    };



    this.printChart = function () {
       /* if (powerbankData.isVisual()) {
            $scope.$broadcast(Events.INTERVAL_PRINT);
        } else {*/
            window.print();
       // }
    };



    if (!this.account.collective) {
        powerbankDataService.landingSearch();
    }

    this.powerbankData = powerbankData;


});

angular.module('myaccount.route').controller('PowerbankSearchCtrl', function($scope, HTML5_DATE_FORMAT, powerbankData, powerbankDataService, Modals) {
	var self = this;

    //this.showfooter =false;

    this.selectTrigger = Modernizr.borderradius ? 'focus' : 'click'

    this.userSearch = {
        startDate: powerbankDataService.current.startDate,
        endDate: powerbankDataService.current.endDate,
        error: undefined
    };




    this.lastWeek = function() {
        this.userSearch.startDate = moment(powerbankDataService.current.startDate).subtract(7, 'days').format(HTML5_DATE_FORMAT);
        this.userSearch.endDate = moment(powerbankDataService.current.endDate).subtract(7, 'days').format(HTML5_DATE_FORMAT);
        this.display();
    };

    this.lastYear = function() {
        if(moment(powerbankDataService.current.startDate).subtract(1, 'years').format(HTML5_DATE_FORMAT) > moment(powerbankDataService.lastSearched.minLimitDate).format(HTML5_DATE_FORMAT)) {
            this.userSearch.startDate = moment(powerbankDataService.current.startDate).subtract(1, 'years').format(HTML5_DATE_FORMAT);
            this.userSearch.endDate = moment(powerbankDataService.current.endDate).subtract(1, 'years').format(HTML5_DATE_FORMAT);
            this.display();
        }else{
            Modals.showConfirmation("Interval Data","Sorry, you cannot view the same period last year as this account was not active in that period. Please select a different date range.");
        }

    };

    this.search = function() {
        var searchDto = {
            startDate: moment(self.userSearch.startDate),
            endDate: moment(self.userSearch.endDate)
        };
        var filter = {
            start: {
                max: powerbankDataService.lastSearched.max,
               min: powerbankDataService.dateSearchLimit.min
            },
            end: {
                max: powerbankDataService.lastSearched.max,
                min: powerbankDataService.dateSearchLimit.min
            }
        };

    	var promise =  Modals.showDateRange(searchDto, filter);//Modals.showDateRange(searchDto, filter);

    	promise.then(function(result) {
            self.userSearch.startDate = searchDto.startDate;
            self.userSearch.endDate = searchDto.endDate;
            powerbankDataService.dateSearch(self.userSearch.startDate, self.userSearch.endDate);
    	});
    };
    
    this.dateRangeLabel = function() {
        if (!(powerbankDataService.current.startDate && powerbankDataService.current.startDate)) { return ""; }

        return moment(powerbankDataService.current.startDate).format("MMM DD, YYYY") + " - " + moment(powerbankDataService.current.endDate).format("MMM DD, YYYY");
    };

    this.disableSearch = function() {
        return moment(self.userSearch.startDate).isAfter(moment(self.userSearch.endDate));
    };

    this.display = function() {
        if (!angular.isDefined(self.userSearch.startDate)) {
        	self.userSearch.error = "Please select a start date.";return;
        } else if (!angular.isDefined(self.userSearch.endDate)) {
        	self.userSearch.error = "Please select an end date.";return;
        }

        self.userSearch.error = undefined;
        powerbankDataService.search(self.userSearch.startDate, self.userSearch.endDate);
    };

    this.powerbankData = powerbankData;
});

