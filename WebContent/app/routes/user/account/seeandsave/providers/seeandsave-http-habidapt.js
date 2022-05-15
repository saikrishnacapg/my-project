angular.module('myaccount.route').factory('SeeAndSaveHttpHabidapt', function (http, $http, $q, SeeAndSaveParameters) {
    var self = this;
    var HOUR_SECONDS = 60*60;


    var initialise = function(nameMappings, contractAccountNumber) {
        self.nameMappings = nameMappings;
        self.contractAccountNumber = contractAccountNumber;
    };

    var mapName = function (device){
        if (!unusedStreams(device)){
            rename(device);
        }
    };

    var keyIndex = function (key) {
        return _.keys(self.nameMappings).indexOf(""+key);
    };

    var rename = function (device) {
        if (self.nameMappings[device.id])
            device.name = self.nameMappings[device.id];
        else
            self.nameMappings[device.id] = device.name;

        device.energyStreamIndex = keyIndex(device.id);
    };

    var summary = function() {

        var deferred = $q.defer();

        var success = function(result){
            var wrapper = {};
            wrapper.data = {};
            wrapper.data.status = 'live';
            wrapper.data.datastreams = result.data;
            angular.forEach(wrapper.data.datastreams, mapName);
            deferred.resolve(wrapper);
        };

        var failure = function () {
            var wrapper = {};
            wrapper.data = {};
            wrapper.data.status = 'failure';
            deferred.resolve(wrapper);
        };

        $http({
            method: 'GET',
            url: '/seeAndSave/' + self.contractAccountNumber + '/summary.json',
            httpCodes: ['all']
        }).then(success, failure);
        return deferred.promise;

    };

    var channelData = function(params, id) {
        var deferred = $q.defer();

        params.meterId = id;

        var success = function(result){
            var wrapper = {};
            var data = result.data['202']; //Power, milliwatts
            wrapper.data = {};
            wrapper.data.id = id;
            rename(wrapper.data);
            wrapper.data.datapoints = _.map(data, function (it) {
                return {
                    at: moment.unix(it.timestamp).toDate(),
                    value: Math.max(it.value/1000,0)
                };
            });
            deferred.resolve(wrapper);
        };

        var failure = function () {
            var wrapper = {};
            wrapper.data = {};
            wrapper.data.id = id;
            wrapper.data.datapoints = [];
            deferred.resolve(wrapper);
        };

        $http({
            method: 'GET',
            url: '/seeAndSave/' + self.contractAccountNumber + '/channelData.json',
            params: params,
            httpCodes: ['all']
        }).then(success,failure);

        return deferred.promise;
    };

    var unusedStreams = function(it){
        return !(it.meterable && !it.generator && !it.virtual);
    };

    var temperatureStreams = function(it){
        return false;
    };

    var graphParams = function(startDate, endDate) {
        return {
            start: startDate.unix(),
            end: endDate.unix(),
            interval: interval(startDate, endDate)
        };
    };

    var samplingRatePerHour = function(startDate, endDate) {
        if (!startDate || !endDate)
            return 12;

        var intervalSeconds = interval(startDate, endDate);
        return HOUR_SECONDS/intervalSeconds;
    };

    var interval = function(startDate, endDate) {
        var differenceInDays = Math.abs(startDate.diff(endDate, 'days'));

        if (differenceInDays < 5) {
            return 300;
        } else if(differenceInDays < 14) {
            return 900;
        } else if(differenceInDays < 31) {
            return 7200;
        } else if(differenceInDays < 90) {
            return 14400;
        } else if(differenceInDays < 180) {
            return 14400;
        } else {
            return 86400;
        }
    };

    var nameMapping = function(index) {
        return self.nameMappings[_.keys(self.nameMappings)[index]];
    };

    var streamIndex = function (id) {
        return keyIndex(id);
    };

    var sortedNameMappings = function (validArray){
        return _.chain(self.nameMappings)
            .values().value();
    };

    return {
        initialise: initialise,
        summary: summary,
        channelData: channelData,
        unusedStreams: unusedStreams,
        temperatureStreams: temperatureStreams,
        graphParams: graphParams,
        samplingRatePerHour: samplingRatePerHour,
        nameMapping: nameMapping,
        sortedNameMappings: sortedNameMappings
    };
});