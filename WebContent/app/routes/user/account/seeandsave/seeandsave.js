angular.module('myaccount.route').controller('SeeAndSaveCtrl', function(account, faqs, $interval, $q, $scope, $rootScope, $state, $timeout, DateUtils, Modals, SeeAndSaveData, SeeAndSaveCharts, SeeAndSaveHttpServer, SeeAndSaveParameters, SeeAndSaveCsv, SeeAndSaveAlert, Utils) {
    var self = this;
    self.account = account;
    
    var init = function() {

        initData();

        if (self.isProductActive() && self.isProductConfigured()) {
            initParameters();
            initServer();
            initStreams();
        }

        if(!self.isXivelyCustomer() && !self.isProductConfigured()){
           self.product.underConstruction = true;
        }           
    };

    var initData = function(){
        // product
        self.product = {
            enabled: self.isProductActive(),
            loadingData: true,
            displayData: self.isMobile(),
            graph: self.isMobile() ? 'pie': 'line',
            underConstruction :false
        };


        // Raw data
        self.data = {
            active: undefined,
            summary: undefined,
            streams: undefined,
            streamData: undefined,
            energyStreams: undefined
        };

        // Formatted data
        self.portrait = {
            active: self.isProductConfigured(),
            streams: undefined,
            streamData: undefined,
            load: {},
            snapshot: {},
            usage: {},
            delta: {
                load: {},
                usage: {}
            },
            savings: {
                load: {},
                usage: {}
            },
            average: undefined,
            temperature: {},
            alert: {},
            csv: {}
        };
        $scope.portrait = self.portrait;

        // Charts formatted data
        self.chartsData = {
            line: null,
            pie: null,
            bar: null
        };
        $scope.chartsData = self.chartsData;
    };

    var initParameters = function () {

        // Default refresh interval: every five minutes (and a little bit)
        self.refreshInterval = 1001 * 300;

        // Default date interval: today
        self.startDate = moment().startOf('day');
        self.endDate = moment();

        // User defined alert
        self.alert = self.account.seeAndSaveDetails.alert;
        $scope.alert = self.alert;

        self.faqs = faqs;

        var account = self.account;
        SeeAndSaveParameters.initialise(account.seeAndSaveDetails['feedId'], account.seeAndSaveDetails['keyId'],
            account.seeAndSaveDetails.product.electricityPrice.peak,
            account.seeAndSaveDetails.product.electricityPrice.offPeak,
            account.seeAndSaveDetails.product.electricityPrice.blockPrices,
            account.seeAndSaveDetails.product.electricityPrice.blockThresholds);
    };

    var initServer = function () {
        SeeAndSaveHttpServer.initialise(self.account.seeAndSaveDetails, self.account.contractAccountNumber);
    };

    var initStreams = function() {
        /* These are the base values used in the legend. We get new values to
         feed in to the charts etc when the data changes but the legend always
         references these. */

        SeeAndSaveData.summary().then(function (summary) {
            self.summary = summary.data;
           
            if(self.isUnderConstruction() == true){
                self.product.underConstruction = true;
                return ;
            }

            var unusedStreams = SeeAndSaveHttpServer.unusedStreams();
            var temperatureStreams = SeeAndSaveHttpServer.temperatureStreams();

            self.streamIds = _(self.summary.datastreams)
                .reject(unusedStreams)
                .pluck('id'); // No max value means the stream has never been used.

            self.energyStreamIds = _.chain(self.summary.datastreams)
                .reject(unusedStreams)
                .reject(temperatureStreams)
                .pluck('id');



            SeeAndSaveParameters.energyStreams(self.energyStreamIds);

            self.portrait.streams = angular.copy(self.energyStreamIds);

            self.data.summary = summary.data;
            self.data.streams = self.streamIds;
            self.data.energyStreams = self.energyStreamIds;

            self.data.parentId = _.where(summary.data.datastreams, {parentId: null})[0]["id"];

            initRefresh();

        });


    };



    var initRefresh = function () {
        // Refresh data
        refreshData();
        var refreshDataInterval = $interval(refreshData, self.refreshInterval); // every five minutes (and a little bit)

        //Refresh summary
        updateSummary(self.data.summary);
        var refreshSummaryInterval = $interval(function() {
            self.data.active = undefined;
            var promise = SeeAndSaveData.summary();
            Utils.promiseThen(promise, function(result) {
                updateSummary(result.data);
            });
        }, self.refreshInterval);


        // Stop refreshing on state exit
        $state.get('user.account.seeandsave').onExit = function () {
            if (angular.isDefined(refreshDataInterval)) {
                $interval.cancel(refreshDataInterval);
                refreshDataInterval = undefined;
            }
            if (angular.isDefined(refreshSummaryInterval)) {
                $interval.cancel(refreshSummaryInterval);
                refreshSummaryInterval = undefined;
            }
        };
    };

    var refreshData = function() {
        if (self.viewingPresentData()) {
            self.endDate = moment();
        }
        updateData();
    };

    var updateData = function(background) {

        if (!background)
            self.product.loadingData = true;

        var startDate = self.startDate;
        var endDate = self.endDate;

        var comparisonRange = Math.abs(startDate.diff(endDate, 'days',true)) || 7; // default to last week
        self.previousPeriodStartDate = moment(startDate).subtract(comparisonRange, 'days');
        var comparisonStartDate = self.previousPeriodStartDate;
        self.previousPeriodEndDate = moment(endDate).subtract(comparisonRange, 'days');
        var comparisonEndDate = self.previousPeriodEndDate;

        var promise1 = SeeAndSaveData.dataStreamSummary(self.data.streams, startDate, endDate);
        var promise2 = SeeAndSaveData.dataStreamSummary(self.data.streams, comparisonStartDate, comparisonEndDate);

        var todayStart = moment().startOf('day');
        var todayEnd = moment();

        var promise3 = SeeAndSaveData.dataStreamSummary(self.data.streams, todayStart, todayEnd);

        var yesterdayStart = moment(todayStart).subtract(1, 'days');
        var yesterdayEnd = moment(todayEnd).subtract(1, 'days');

        var promise4 = SeeAndSaveData.dataStreamSummary(self.data.streams, yesterdayStart, yesterdayEnd);

        var promisesList = {current: promise1, previous: promise2, today: promise3 ,yesterday: promise4}

        if (self.alertDefined() && $scope.alert.type == 'week') {
            var weekStart = moment().startOf('isoweek');
            promisesList.week = SeeAndSaveData.dataStreamSummary(self.data.streams, weekStart, todayEnd);
        }

        var promises =  $q.all(promisesList);

        Utils.promiseThen(promises, function(result) {
            var samplingRatePerHour = SeeAndSaveHttpServer.samplingRatePerHour(startDate, endDate);
            self.data.streamData = result;
            self.data.samplingRatePerHour = samplingRatePerHour;


            if (self.portrait.active) {
                var allPoints = _(self.data.streamData.today).pluck('data.datapoints.length').sum();
                self.portrait.active = allPoints > 0;

                var datapointsLengths = _(self.data.streamData.today).pluck('data.datapoints.length');
                self.portrait.partiallyActive = datapointsLengths.contains(0);
            }

            if (self.portrait.active) {
                updateStatistics();
                updateCharts();
                updateDownloadData();
            }

            self.product.loadingData = false;
        });
    };

    var updateDownloadData = function(){
        self.portrait.csv.load =  SeeAndSaveCsv.load(self.data.streamData.current);
        self.portrait.csv.usage =  SeeAndSaveCsv.cost(self.portrait.usageTodayArray);
    };

    var updateStatistics = function () {

        self.portrait.streamData = _.mapValues(self.data.streamData, function(streamData){
            return SeeAndSaveData.clean(streamData);
        });

        // Now
        var pObject = findParentObject(self.portrait.streamData.today)
        self.portrait.load.current = SeeAndSaveData.lastLoad(pObject);

        pObject = findParentObject(self.portrait.streamData.yesterday)
        self.portrait.load.yesterday = SeeAndSaveData.lastLoad(pObject);
        self.portrait.snapshot.current = SeeAndSaveData.lastSnapshot(self.portrait.streamData.current);

        self.portrait.delta.load.yesterday = SeeAndSaveData.deltaPercent(self.portrait.load.current, self.portrait.load.yesterday);
        self.portrait.savings.load.yesterday = SeeAndSaveData.saving(self.portrait.load.current, self.portrait.load.yesterday);

        // Period
        var currentNew = withoutParent (self.portrait.streamData.current)
        self.portrait.usage.current = SeeAndSaveData.summariseUsageData(currentNew, self.portrait.samplingRatePerHour, true);
        
        previousNew = withoutParent(self.portrait.streamData.previous)
        self.portrait.usage.previous = SeeAndSaveData.summariseUsageData(previousNew, self.portrait.samplingRatePerHour);

        updateUsage();

        self.portrait.delta.usage.period = SeeAndSaveData.deltaPercent(self.portrait.usage.current.kwh, self.portrait.usage.previous.kwh);
        self.portrait.savings.usage.period = SeeAndSaveData.saving(self.portrait.usage.current.kwh, self.portrait.usage.previous.kwh);

        self.portrait.comparisonData = self.portrait.usage.current.kwh !== 0 && self.portrait.usage.previous.kwh !== 0;

        // Alert
        if (self.alertDefined())
            updateAlert();

        if (!self.portrait.average)
            initAverage();
    };

    var findParentObject = function (stream){
        return _.find(stream, function(item) {
            return item.data.id == self.data.parentId; 
        })
    }

    var withoutParent = function(stream){
       return _.without(stream, findParentObject(stream))
    }

    var updateUsage = function() {
        self.portrait.usageTodayArray = _.map(self.portrait.streamData.current, function(it) {
            return SeeAndSaveData.summariseUsageData([it], self.data.samplingRatePerHour, false, self.portrait.usage.current.breakPoints);
        });
    };

    var initAverage = function() {
        var endDate = moment().startOf('day').subtract(1, 'day');
        var startDate = moment(endDate).subtract(3,'week');

        var samplingRatePerHour = SeeAndSaveHttpServer.samplingRatePerHour(startDate, endDate);
        var promise = SeeAndSaveData.dataStreamSummary(self.data.streams, startDate, endDate);

        Utils.promiseThen(promise, function(result){
            var streamData = SeeAndSaveData.clean(result);
            var diffInDays =  Math.abs(startDate.diff(endDate, 'days'));

            var streamDataNew = withoutParent(streamData);
            var summary = SeeAndSaveData.summariseUsageData(streamDataNew, samplingRatePerHour);
            self.portrait.average = {};
            self.portrait.average.day = summary.kwh / diffInDays;
            self.portrait.average.week = self.portrait.average.day * 7;
        });
    };

    var updateAlert = function() {
        var usage;
        if ($scope.alert.type == 'day') {
            usage = self.viewingPresentData() ?  self.portrait.usage.current : SeeAndSaveData.summariseUsageData(self.portrait.streamData.today);
        }else {
            usage = SeeAndSaveData.summariseUsageData(self.portrait.streamData.week);
        }
        self.portrait.alert = SeeAndSaveAlert.update($scope.alert, self.portrait.alert, usage);
    };

    var updateCharts = function() {
        self.chartsData.line = SeeAndSaveCharts.updateLineData(self.chartsData.line, self.portrait.streamData.current);
        var updateTodayArrayNew = _.reject(self.portrait.usageTodayArray, {id: self.data.parentId}); 
        self.chartsData.pie = SeeAndSaveCharts.updatePieData(self.chartsData.pie, updateTodayArrayNew);
        if (self.isPricingAvailable())
            self.chartsData.bar = SeeAndSaveCharts.updateBarData(self.chartsData.bar, self.portrait.usageTodayArray);
    };

    var updateSummary = function(summary) {
        self.portrait.active = summary.status === "live";

        var tempStreams = _.chain(summary.datastreams)
            .filter(SeeAndSaveHttpServer.temperatureStreams())

        self.portrait.temperature.value = tempStreams
            .pluck('current_value')
            .reduce().value();

        self.portrait.temperature.label = tempStreams
            .pluck('name')
            .reduce().value();

        self.portrait.lastUpdate = DateUtils.formatDateToTime(summary.updated);
        self.portrait.nextUpdate = DateUtils.formatDateToTime(moment(summary.updated).add(self.refreshInterval, 'ms'));
    };

    this.formatDate = function(date){
        return moment(date).format('DD/MM/YYYY HH:mm');
    }

    this.dateSearch = function() {
        var dateRange = {
            startDate: self.startDate || moment(),
            endDate: self.endDate || moment(),
            helpText: 'Data is available from the date that the See and Save hardware was installed.'
        };

        var promise = Modals.showDateRange(dateRange);
        promise.then(function(result) {
            self.startDate = moment(dateRange.startDate).startOf('day');
            self.endDate = moment(dateRange.endDate).endOf('day');

            if (self.endDate > moment())
                self.endDate = moment();

            refreshData();
        });
    };

    this.viewingPresentData = function() {
        return self.startDate.diff(moment().startOf('day')) == 0;
    };

    // Device names customisation
    this.customise = function() {
        var details = SeeAndSaveHttpServer.nameMappings();
        var promise = Modals.showSeeAndSaveCustomise(details);
        promise.then(function(result) {
            if (result === 'OK') {
                var channels = _.map(details, function (value, id) { return {key: id, name: value} });
                SeeAndSaveHttpServer.updateMeter(account.contractAccountNumber,{channels: channels}).then(function(data){

                    account.seeAndSaveDetails.channels = channels;

                    initServer();
                    updateCharts();
                    updateUsage();
                    updateDownloadData();

                    var confirmPromise = Modals.showConfirmation('Confirmation', 'Thank you, your changes have been saved.');
                    confirmPromise.then(function(){}, function(){});
                });

            }
        });
    };

    this.challenge = function() {

        var details = angular.copy($scope.alert) || { type: 'day'};

        details.dailyAverage = _.round(self.portrait.average.day, 2);
        details.weeklyAverage = _.round(self.portrait.average.week, 2);

        details.value = _.round(details.value, 2);

        var promise = Modals.showSeeAndSaveAlert(details);
        promise.then(function(result) {
            if (result === 'OK') {
                SeeAndSaveHttpServer.updateAlert(account.contractAccountNumber, details).then(function(result) {
                    var typeChanged = !$scope.alert ||  $scope.alert.type != details.type;
                    if (!$scope.alert)
                        $scope.alert = {};
                    angular.extend($scope.alert, details);
                    if (typeChanged){
                        updateData();
                    } else {
                        updateAlert();
                    }
                });
            } else {
                if (self.alertDefined()){
                    var promiseConfirm = Modals.showConfirm("Delete usage goal","Are you sure you want to remove your usage goal?");
                    promiseConfirm.then(function(result){
                        if (result === 'OK') {
                            SeeAndSaveHttpServer.deleteAlert(account.contractAccountNumber).then(function(result) {
                                $scope.alert = undefined;
                            });
                        }
                    });
                }
            }
        });
    };

    this.reset = function() {
        self.startDate = moment().startOf('day');
        refreshData();
    };

    this.isMobile = function() {
        return $rootScope.DeviceMode.type == 'mobile';
    };

    this.alertDefined = function(){
        return _.isObject($scope.alert);
    };

    this.comparisonAvailable = function (){
        return isFinite(self.portrait.delta.usage.period);
    };

    this.isTimeBasedPricing = function() {
        return SeeAndSaveParameters.isTimeBasedPricing();
    }

    this.isPricingAvailable = function() {
        return SeeAndSaveParameters.isPricingAvailable();
    }

    this.isProductActive = function() {
        return self.account.seeAndSaveDetails.product.status == 'active';
    };

    this.isProductConfigured = function (){
        return !_.isEmpty(self.account.seeAndSaveDetails.provider);
    };

    this.isXivelyCustomer = function(){
        return  self.account.seeAndSaveDetails.provider == "xively"
    }

    this.isUnderConstruction = function(){
        var flag = false;
        
        if(self.isXivelyCustomer()){
            flag = false;
        }else if(!self.isProductConfigured()){
            flag = true;
        }else{
            try{
                _.where(self.summary.datastreams, {parentId: null})[0]["id"];
            } catch (e) {
                flag =  true;
            }
        }

        return flag;
    }

    init();
});