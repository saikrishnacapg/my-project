angular.module('myaccount.route').service('powerbankData', function($filter,HTML5_DATE_FORMAT, ClientStorage) {
    //this.meterTypes = { ELECTRICITY: 'ELEC', GAS: 'GAS' };
    //this.chartType = this.meterTypes.ELECTRICITY; // by default
    this.timestamp = moment().unix();
    this.message = "Loading your interval data...";
    this.hasData = false;
    this.dayInterval = -1;
    //this.singleDayIntervalData = undefined;
    this.multiDayIntervalData = undefined;
    this.mode = undefined;
    this.downloadType = undefined;
    this.visualFormats = [{name: 'PNG', format: 'image/png'}, {name: 'JPEG', format: 'image/jpeg'}];
    this.dataFormats = [{name: 'CSV', format: 'csv'}, {name: 'Excel', format: 'excel'}];
    this.powerbankDetails=undefined;
    this.showGenerationTab =false;
    this.powerbankDetailsData=function() {
        return  this.powerbankDetails;
    }
    this.showfooter = false;




    this.clear = function() {
       // this.singleDayIntervalData = undefined;
        this.multiDayIntervalData = undefined;
        this.hasData = false;
    };

    this.update = function(result) {
       // if(result)
        this.hasData = angular.isDefined(result);
        this.message = this.hasData ? "Loading your interval data..." : "Interval data is not available for your current selection.";
//this.startDate
        this.startDate =moment(result.startDate).format(HTML5_DATE_FORMAT); //moment(usageSupplyPeriod.endDate).subtract(7,'days').format(HTML5_DATE_FORMAT);
        this.endDate = moment(result.endDate).format(HTML5_DATE_FORMAT);
        this.timestamp = moment().unix();
        this.dayInterval = moment(this.endDate).diff(moment(this.startDate), 'days');// parseInt(result.numberOfDays);
        //this.chartType = result.chartType;

           // this.calcExtraElectricityStats(result);

       // this.singleDayIntervalData = this.dayInterval == 0 ? result : null;
        this.multiDayIntervalData =  result;
    };


    this.latestData = function() {
        return this.multiDayIntervalData;
    };

    this.popover = function() {
        return {
            "title": "Title",
            "content": "Hello Popover<br />This is a multiline message!"
        };
    };

    this.isVisual = function() {
        var activeTab = this.getActiveTab();
        return activeTab ? activeTab.visual : true;
    };

    this.calcExtraElectricityStats = function(data) {
        // calculate some daily stats
        data.everyday_off_peak = [];
        data.everyday_Peak = [];
        data.weekday_shoulders = [];
        data.weekend_shoulders = [];
        data.rebs_payment = [];
        data.battery_consumption = [];
        data.VALUE_DAY = [];
        /*data.averageKvaDailyValues = [];
        data.minPowerFactorDailyValues = [];
        data.maxPowerFactorDailyValues = [];*/

        //generation
        //data.kwhDailyValuesGeneration = [];

       // for (var i=0;i<data.length;i++) {
            
            data.everyday_off_peak.push(data.everyday_off_peak);
            data.everyday_Peak.push(data[i]["everyday_Peak"]);

            data.weekday_shoulders.push(data[i]["weekday_shoulders"]);
            data.VALUE_DAY.push(data[i]["VALUE_DAY"]);

            data.weekend_shoulders.push(data[i]["weekend_shoulders"]);
            data.rebs_payment.push(data[i]["rebs_payment"]);
            data.battery_consumption.push(data[i]["battery_consumption"]);

        //}
    };
});

angular.module('myaccount.route').service('powerbankDataService', function($filter, HTML5_DATE_FORMAT, powerbankData, powerbankDataHttpServer, MyAccountServer, Utils) {
   /* this.eDevices = [];
    this.gDevices = [];*/
  //  this.collectiveChilAccount =[];
   // this.intervalGenerationdevices =false;
   // this.parentcontractAccountNumber  = undefined;
    this.contractAccountNumber = undefined;
    this.showfooter =false;
    this.usageSupplyPeriod = undefined;
    this.current = {
        startDate: undefined, // these are strings
        endDate: undefined, // these are strings
        dayInterval: undefined,
    };

    this.lastSearched = {
        startDate: undefined, // these are strings
        endDate: undefined, // these are strings
        dayInterval: undefined,
    };


    this.init = function(contractAccountNumber) {
        powerbankData.clear();
        this.contractAccountNumber = contractAccountNumber;
        this.current.startDate = moment().subtract(1, 'week').day(1).startOf('day').format(HTML5_DATE_FORMAT);
        this.current.endDate = moment().subtract(1, 'week').day(7).startOf('day').format(HTML5_DATE_FORMAT);
        this.current.dayInterval = moment(this.current.endDate).diff(moment(this.current.startDate), 'days');
        this.lastSearched = angular.copy(this.current);
        return this;
    };

    this.nextInterval = function() {
        var interval = this.current.dayInterval || 0;
        var nextStart = moment(this.current.endDate).add(1, 'days').format(HTML5_DATE_FORMAT);
        var nextEnd = moment(this.current.endDate).add(interval + 1, 'days').format(HTML5_DATE_FORMAT);
        this.dateSearch(nextStart, nextEnd);
    };

    this.previousInterval = function() {
        var interval = this.current.dayInterval || 0;
        var previousStart = moment(this.current.startDate).subtract(interval + 1, 'days').format(HTML5_DATE_FORMAT);
        var previousEnd = moment(this.current.startDate).subtract(1, 'days').format(HTML5_DATE_FORMAT);
        this.dateSearch(previousStart, previousEnd);
    };

    this.previousSearch = function() {
        var interval = moment(this.lastSearched.endDate).diff(moment(this.lastSearched.startDate), 'days');
        if(interval===1||interval===0)
        {
            var startDate = moment(this.current.startDate).subtract(3, 'days').format(HTML5_DATE_FORMAT);
            var endDate = moment(this.current.startDate).add(3, 'days').format(HTML5_DATE_FORMAT);
            this.dateSearch(startDate, endDate);
        }
        else
        {
            this.dateSearch(this.lastSearched.startDate, this.lastSearched.endDate);
        }
    };

   /* this.dailyViewPreviousSearch = function() {
        var interval = moment(this.lastSearched.endDate).diff(moment(this.lastSearched.startDate), 'days');
        if(interval===0)
        {
            var startDate = moment(this.current.startDate).subtract(3, 'days').format(HTML5_DATE_FORMAT);
            var endDate = moment(this.current.startDate).add(3, 'days').format(HTML5_DATE_FORMAT);
            this.dateSearch(startDate, endDate);
        }
        else
        {
            this.dateSearch(this.lastSearched.startDate, this.lastSearched.endDate);
        }
    };*/

    this.landingSearch = function() {
        this.search(this.current.startDate, this.current.endDate);
    };

    this.dateSearch = function(startDate, endDate) {
        this.search(startDate, endDate);
    };



    this.search = function(startDate, endDate) {
        this.updateSearchHistory(startDate, endDate);
        // Update end date for SAP//add(1, 'days').
        // Defect 306 below line comment
       // endDate = moment(endDate).add(1, 'days').format(HTML5_DATE_FORMAT);

        var params = {
            contractAccountNumber: this.contractAccountNumber,
            startDate: startDate,
            endDate: endDate,
        };
        var promise = powerbankDataHttpServer.getBatteryValuesData(params);

        var success =  function(result) {
            powerbankData.update(result);
            powerbankData.powerbankDetails = result;
        };
        var failure = function() {
            // TODO indicate failure
        };
        promise.then(success, failure);

    };

    this.updateSearchHistory = function(startDate, endDate) {
        var interval = moment(endDate).diff(moment(startDate), 'days');
        this.lastSearched = angular.copy(this.current);
        this.current = {
            dataReturned: true,
            startDate: startDate,
            endDate: endDate,
            dayInterval: interval
        };
    };

    this.chartData = function() {
        return this.current.dayInterval === 0 ? this.singleDayIntervalData : this.multiDayIntervalData;
    };

    this.dateSearchLimit = {
        max: moment().toDate(),
        min: moment('2016-12-20').toDate()
    };
});

angular.module('myaccount.route').service('powerbankDataHttpServer', function($http, $log, $q, HTML5_DATE_FORMAT, Modals, Utils) {

    this.getBatteryValuesData=function(queryParams){

        var deferred = $q.defer();
        var urlParams = {
            startDate: Utils.convertToHTML5Date(queryParams.startDate),
            endDate: Utils.convertToHTML5Date(queryParams.endDate),
            ContractAccountNumber : queryParams.contractAccountNumber
        };
        var promise = $http({
            method: 'GET',
            url: '/PowerBank/'+queryParams.contractAccountNumber+'/getBatteryValuesData',
            params: urlParams
        });

        var success = function(result) {
            deferred.resolve(result.data);
        };

        var failure = function(reason) {
            // $http filter should have caught this and displayed an error dialog
            $log.error('Error loading interval details for: ' + queryParams.contractAccountNumber + ', reason: ' + reason);
            deferred.reject(reason);
        };

        promise.then(success, failure);

        return deferred.promise;
    }



    this.sendChartEmail = function(options) {

        var deferred = $q.defer();

        var xsrf = $.param(options);

        var promise = $http({
            method: "POST",
            url: "/chart/mail",
            apps: true,
            headers: {"Content-type": "application/x-www-form-urlencoded; charset=utf-8"},
            data: xsrf
        });

        var success = function(result) {
            $log.info('Interval data email successfully sent');
            deferred.resolve(result);
        };

        var failure = function(reason) {
            $log.error('Error sending interval data email, reason: ' + reason);
            deferred.reject(reason);
        };

        promise.then(success, failure);

        return promise;
    };

    this.sendDataEmail = function(url) {
        $http({
            method: "POST",
            url: url
        }).error(function() {
            Modals.showAlert("Error", "We're sorry, an issue occurred in processing your email and it could not be sent.");
        });
    };


});

