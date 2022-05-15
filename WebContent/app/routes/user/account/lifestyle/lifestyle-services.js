angular.module('myaccount.route').service('lifestyle', function($filter, ClientStorage) {
    this.meterTypes = { ELECTRICITY: 'ELEC', GAS: 'GAS' };
    this.chartType = this.meterTypes.ELECTRICITY; // by default
    this.timestamp = moment().unix();
    this.message = "Loading your interval data...";
    this.hasData = false;
    this.hasValue=false;
    this.dayInterval = -1;
    this.singleDayIntervalData = undefined;
    this.multiDayIntervalData = undefined;
    this.mode = undefined;
    this.downloadType = undefined;
    this.visualFormats = [{name: 'PNG', format: 'image/png'}, {name: 'JPEG', format: 'image/jpeg'}];
    this.dataFormats = [{name: 'CSV', format: 'csv'}, {name: 'Excel', format: 'excel'}];

    this.tabs = [
        { title: "Consumption", icon: "sy-icon--charts", visibility: ['ELEC', 'GAS'], visual: true},
        { title: "Load Profile", icon: "sy-icon--stats", visibility: ['ELEC', 'GAS'], visual: true},
        { title: "Power Factor", icon: "sy-icon--power", visibility:  ['ELEC'], visual: true},
        { title: "Load Factor", icon: "sy-icon--refresh", visibility:  ['ELEC'], visual: true},
        { title: "Tabular", icon: "sy-icon--justify", visibility: ['ELEC', 'GAS'], visual: false}
    ];

    this.showTab = function(tab) {
        return tab.visibility.indexOf(this.chartType) >= 0;
    };

    this.tabIsActive = function(tab) {
        return this.mode === tab.title;
    };

    this.getActiveTab = function() {
        var mode = this.mode;
        return _.find(this.tabs, function(tab) {
            return tab.title === mode;
        });
    };
    this.setTabMode = function(tab) {
        this.mode = tab ? tab.title : ClientStorage.getLastIntervalDataTab() || this.tabs[0].title;
        ClientStorage.setLastIntervalDataTab(this.mode);
    };

    this.isElectricity = function() {
        return this.chartType == this.meterTypes.ELECTRICITY;
    };

    this.isGas = function() {
        return this.chartType == this.meterTypes.GAS;
    };

    this.clear = function() {
        this.singleDayIntervalData = undefined;
        this.multiDayIntervalData = undefined;
        this.hasData = false;
    };

    this.update = function(result) {
        this.hasData = angular.isDefined(result);
        this.message = this.hasData ? "Loading your interval data..." : "Interval data is not available for your current selection.";

        this.timestamp = moment().unix();
        this.dayInterval = parseInt(result.numberOfDays);
        this.chartType = result.chartType;

        if (this.dayInterval != 0 && this.chartType == this.meterTypes.ELECTRICITY) {
            this.calcExtraElectricityStats(result);
        }

        this.singleDayIntervalData = this.dayInterval == 0 ? result : null;
        this.multiDayIntervalData = this.dayInterval == 0 ? null : result;
    };


    this.latestData = function() {
        var data = this.dayInterval == 0 ? this.singleDayIntervalData : this.multiDayIntervalData;
        this.hasValue = data.hasValue;
        return data;
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
        data.totalKwhDailyValues = [];
        data.includesOutageDailyValues = [];
        data.includesEstimateDailyValues = [];
        data.minKwDailyValues = [];
        data.averageKwDailyValues = [];
        data.minKvaDailyValues = [];
        data.maxKvaDailyValues = [];
        data.averageKvaDailyValues = [];
        data.minPowerFactorDailyValues = [];
        data.maxPowerFactorDailyValues = [];

        for (var i=0;i<data.numberOfDays;i++) {
            var totalKwh = data.saturdayKwhDailyValues[i] + data.otherdayKwhDailyValues[i];
            data.totalKwhDailyValues.push(totalKwh);

            var intervalNo = i*48;
            var kwHalfHourlyValues = data.kwHalfHourlyValues ? data.kwHalfHourlyValues.slice(intervalNo, intervalNo+48) : [];
            var kvaHalfHourlyValues = data.kvaHalfHourlyValues ? data.kvaHalfHourlyValues.slice(intervalNo, intervalNo+48) : [];
            var powerFactorHalfHourlyValues = data.powerFactorHalfHourlyValues ? data.powerFactorHalfHourlyValues.slice(intervalNo, intervalNo+48) : [];
            var statusCodeHalfHourlyValues = data.statusCodeHalfHourlyValues ? data.statusCodeHalfHourlyValues.slice(intervalNo, intervalNo+48) : [];


            data.includesOutageDailyValues.push(statusCodeHalfHourlyValues.indexOf('Outage') < 0 ? "No" : "Yes");
            data.includesEstimateDailyValues.push(statusCodeHalfHourlyValues.indexOf('Estimate') < 0 ? "No" : "Yes");

            data.minKwDailyValues.push($filter('min')(kwHalfHourlyValues));
            data.averageKwDailyValues.push($filter('avg')(kwHalfHourlyValues));

            data.minKvaDailyValues.push($filter('min')(kvaHalfHourlyValues));
            data.averageKvaDailyValues.push($filter('avg')(kvaHalfHourlyValues));
            data.maxKvaDailyValues.push($filter('max')(kvaHalfHourlyValues));

            data.minPowerFactorDailyValues.push($filter('min')(powerFactorHalfHourlyValues));
            data.maxPowerFactorDailyValues.push($filter('max')(powerFactorHalfHourlyValues));
        }
    };
});

angular.module('myaccount.route').service('lifestyleService', function($filter, HTML5_DATE_FORMAT, lifestyle, lifestyleHttpServer, IntervalDeviceServer, MyAccountServer, Utils) {
    this.eDevices = [];
    this.gDevices = [];

    this.contractAccountNumber = undefined;

    this.current = {
        meters: undefined,
        startDate: undefined, // these are strings
        endDate: undefined, // these are strings
        dayInterval: undefined
    };

    this.lastSearched = {
        meters: undefined,
        startDate: undefined, // these are strings
        endDate: undefined, // these are strings
        dayInterval: undefined
    };

    this.filterDevices = function(meters, match) {
        var result = $filter('filter')(meters, 'type', function(value) {
            return value === match;
        });

        return result;
    };

    this.init = function(contractAccountNumber, meters) {
        lifestyle.clear();

        this.contractAccountNumber = contractAccountNumber;
        this.eDevices = this.filterDevices(meters, lifestyle.meterTypes.ELECTRICITY);
        this.gDevices = this.filterDevices(meters, lifestyle.meterTypes.GAS);

        this.current.meters = this.eDevices.length ? [this.eDevices[0]] : [this.gDevices[0]];
        this.current.startDate = moment().subtract(1, 'week').day(1).startOf('day').format(HTML5_DATE_FORMAT);
        this.current.endDate = moment().subtract(1, 'week').day(7).startOf('day').format(HTML5_DATE_FORMAT);
        this.current.dayInterval = moment(this.current.endDate).diff(moment(this.current.startDate), 'days');

        this.lastSearched = angular.copy(this.current);

        return this;
    };
    this.dateSearchLimit = {
            max: moment().toDate(),
            min: moment('2016-12-20').toDate()
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
    };

    this.landingSearch = function() {
        this.search(this.current.meters, this.current.startDate, this.current.endDate);
    };

    this.dateSearch = function(startDate, endDate) {
        this.search(this.current.meters, startDate, endDate);
    };

    this.search = function(intervalDevices, startDate, endDate) {
        this.updateSearchHistory(intervalDevices, startDate, endDate);

        // Update end date for SAP
        endDate = moment(endDate).add(1, 'days').format(HTML5_DATE_FORMAT);

        var intervalDeviceIds = [];
        var chartType;

        angular.forEach(intervalDevices, function(meter) {
            intervalDeviceIds.push(meter.deviceId);
            chartType = meter.deviceType;   // will only have elec or gas
        });

        var params = {
            contractAccountNumber: this.contractAccountNumber,
            intervalDeviceIds: intervalDeviceIds,
            startDate: startDate,
            endDate: endDate
        };

        var promise = chartType == lifestyle.meterTypes.GAS ?
            lifestyleHttpServer.loadElectricityData(params):
            lifestyleHttpServer.loadElectricityData(params);

        var success =  function(result) {
            lifestyle.update(result);
        };
        var failure = function() {
            // TODO indicate failure
        };

        promise.then(success, failure);
    };

    this.updateSearchHistory = function(intervalDevices, startDate, endDate) {
        var interval = moment(endDate).diff(moment(startDate), 'days');
        this.lastSearched = angular.copy(this.current);
        this.current = {
            dataReturned: true,
            meters: intervalDevices,
            startDate: startDate,
            endDate: endDate,
            dayInterval: interval
        };
    };

    this.chartData = function() {
        return this.current.dayInterval === 0 ? this.singleDayIntervalData : this.multiDayIntervalData;
    };

    this.dataSetUrl = function(details) {
        var urlPath = lifestyle.isGas() ? (details.downloadType === 'daily' ? "exportDailyGasIntervalData" : "exportHourlyGasIntervalData") :
            (details.downloadType === 'daily' ? "exportDailyElecIntervalData" : "exportHalfHourlyElecIntervalData");

        var url = MyAccountServer + '/intervalData/' + this.contractAccountNumber + '/' + urlPath + '?startDate=' +
            encodeURIComponent(Utils.convertToHTML5Date(this.current.startDate)) + '&endDate=' +
            encodeURIComponent(Utils.convertToHTML5Date(moment(this.current.endDate).add(1, 'days').format(HTML5_DATE_FORMAT)));

        angular.forEach(this.current.meters, function(meter) {
            url += ("&intervalDeviceIds=" + meter.deviceId);
        });

        url += "&exportFormat=" + details.downloadFormat;

        return url;
    };

    this.exportDataSet = function(details) {
        var url = this.dataSetUrl(details);

        url += "&exportType=download";

        lifestyleHttpServer.tabularDownload(url);

        return;
    };

    this.emailDataSet = function(details) {
        var url = this.dataSetUrl(details);

        url += "&exportType=email";
        url += "&toEmail=" + encodeURIComponent( details.to );
        url += "&ccEmail=" + encodeURIComponent( details.cc );
        url += "&emailSubject=" + encodeURIComponent( details.subject );

        lifestyleHttpServer.sendDataEmail(url);

        return;
    };
});

angular.module('myaccount.route').service('lifestyleHttpServer', function($http, $log, $q, HTML5_DATE_FORMAT, Modals, Utils) {
    this.loadElectricityData = function(queryParams) {
        var deferred = $q.defer();

        var interval = moment(queryParams.endDate).diff(moment(queryParams.startDate), 'days');
        var url = interval == 1 ? "getHalfHourlyLifestyleIntervalData" : "getDailyLifestyleIntervalData";

        var urlParams = {
            intervalDeviceIds: queryParams.intervalDeviceIds,
            startDate: Utils.convertToHTML5Date(queryParams.startDate),
            endDate: Utils.convertToHTML5Date(queryParams.endDate)
        };

        var promise = $http({
            method: 'GET',
            url: '/intervalData/'+queryParams.contractAccountNumber+'/'+url,
            params: urlParams
        });

        var success = function(result) {
            var data = result.data;
            data.startDate = moment(data.startDate).format(HTML5_DATE_FORMAT);
            data.timestamp = moment().valueOf();

            deferred.resolve(data);
        };

        var failure = function(reason) {
            // $http filter should have caught this and displayed an error dialog
            $log.error('Error loading interval data for: ' + queryParams.contractAccountNumber + ', reason: ' + reason);
            deferred.reject(reason);
        };

        promise.then(success, failure);

        return deferred.promise;
    };



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

    this.tabularDownload = function(url) {
        /*
           HighCharts approach of programatically creating and submitting a form.
           This is a workaround as files cannot be directly through ajax for current
           browser support (there is a download attribute but IE does not support it).
        */
        var el = document.createElement('form');
        angular.extend(el, {
            method: 'post',
            action: url,
            target: '_blank',
            enctype: 'multipart/form-data'
        });

        document.body.appendChild(el);
        el.submit();
    };
});

