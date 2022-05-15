angular.module('myaccount.route').factory('SeeAndSaveHttpXively', function (http, $http, $q, SeeAndSaveParameters) {
    var self = this;
    var HOUR_SECONDS = 60*60;

    var initialise = function (nameMappings) {
        self.nameMappings = nameMappings;
    };

    // This should be refactored
    var rename = function(object) {
        if (SeeAndSaveParameters.energyStreams().contains(object.id).value()){
            object.energyStreamIndex = SeeAndSaveParameters.energyStreams().indexOf(object.id).value();
            var deviceId = object.energyStreamIndex + 1;
            object.name = self.nameMappings[object.id] || ('Device ' + deviceId );
            if (!self.nameMappings[object.id])
                self.nameMappings[object.id] = object.name;
            return object;
        }
    };

    var summary = function() {
        var deferred = $q.defer();

        $http({
            method: 'JSONP',
            url: 'https://api.xively.com/v2/feeds/' + SeeAndSaveParameters.feedId() + '?callback=JSON_CALLBACK',
            params: SeeAndSaveParameters.defaultParams(),
            httpCodes: ['all']
        }).then(function(result) {
            deferred.resolve(result);
        });

        return deferred.promise;
    };

    var channelData = function(params, id) {
        var deferred = $q.defer();

        $http({
            method: 'JSONP',
            url: 'https://api.xively.com/v2/feeds/' + SeeAndSaveParameters.feedId() + '/datastreams/' + id + '?callback=JSON_CALLBACK',
            params: params,
            httpCodes: ['all']
        }).then(function(result) {
            rename(result.data);

            deferred.resolve(result);
        });

        return deferred.promise;
    };

    var unusedStreams =  function(it){
        return !it['max_value'];
    };

    var temperatureStreams = function(it){
        return _.contains(it.tags, 'temperature');
    };

    var graphParams = function(startDate, endDate) {
        return {
            key: SeeAndSaveParameters.defaultParams().key,
            start: startDate.toJSON(),
            end: endDate.toJSON(),
            interval: interval(startDate, endDate),
            function: "average",
            _: moment().unix(),
            find_previous:false,
            limit: 1000 // get the max number
        };
    };

    var samplingRatePerHour = function(startDate, endDate) {
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
            return 3600;
        } else if(differenceInDays < 90) {
            return 21600;
        } else if(differenceInDays < 180) {
            return 21600;
        } else {
            return 86400;
        }
    };

    var nameMapping = function(energyStreamIndex) {
        return self.nameMappings[SeeAndSaveParameters.energyStreams().value()[energyStreamIndex]];
    };

    var sortedNameMappings = function (validArray){
        return _.chain(self.nameMappings)
            .filter(function(value, key) {
                return validArray.indexOf(key) != -1;
            })
            .sortBy(function(value, key) {
                return key;
            })
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
//        streamIndex: streamIndex,
        sortedNameMappings: sortedNameMappings
    };
});