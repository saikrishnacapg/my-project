//angular.module('myaccount.route').factory('SeeAndSaveHttpServer', function (http, $http, $q, SeeAndSaveParameters, SeeAndSaveProviders) {
angular.module('myaccount.route').factory('SeeAndSaveHttpServer', function (http, SeeAndSaveParameters, SeeAndSaveProviders) {
    var self = this;
    this.nameMappings ={};
    this.provider = undefined;


    var loadFaqs = function(contractAccountNumber) {
        return http({
            method: 'POST',
            url: '/seeAndSave/' + contractAccountNumber + "/faqs"
        });
    };

    var summary = function() {
        return self.provider.summary();
    };

    var channelData = function(params, id) {
        return self.provider.channelData( params, id);
    };

    var initNameMappings = function(channels) {
        var mappings = {};
        _.chain(channels)
            .each(function(value) {
                mappings[value.key] = value.name || "Device " + value.key;
            }).value();

        return mappings;
    };

    var initialise = function(settings, contractAccountNumber) {
        self.nameMappings = initNameMappings(settings.channels);
        self.provider = SeeAndSaveProviders.resolve(settings.provider);
        self.provider.initialise(self.nameMappings, contractAccountNumber);
    };

    var nameMapping = function(index) {
        return self.provider.nameMapping(index);
    };

    var sortedNameMappings = function(validArray) {
        return self.provider.sortedNameMappings(validArray);
    };

    var updateMeter = function(contractAccountNumber, seeAndSaveDetails) {
        return http({
            method: 'POST',
            url: '/seeAndSave/' + contractAccountNumber + '/updateMeter',
            data: seeAndSaveDetails
        });
    };

    var updateAlert = function(contractAccountNumber, seeAndSaveAlertDetails) {
        return http({
            method: 'POST',
            url: '/seeAndSave/' + contractAccountNumber + '/updateAlert',
            data: seeAndSaveAlertDetails
        });
    };

    var deleteAlert = function(contractAccountNumber, seeAndSaveAlertDetails) {
        return http({
            method: 'POST',
            url: '/seeAndSave/' + contractAccountNumber + '/deleteAlert'
        });
    };

    var unusedStreams =  function () {
        return self.provider.unusedStreams;
    };

    var temperatureStreams =  function () {
        return self.provider.temperatureStreams;
    };

    var graphParams = function(startDate, endDate) {
        return self.provider.graphParams(startDate, endDate);
    };

    var samplingRatePerHour = function(startDate, endDate) {
        return self.provider.samplingRatePerHour(startDate, endDate);

    };

    var streamIndex = function (id) {
        return self.provider.streamIndex(id);
    };

    var nameMappings = function () {
        return angular.copy(self.nameMappings);
    }

    return {
        summary: summary,
        channelData: channelData,
        loadFaqs: loadFaqs,
        initialise: initialise,
        nameMapping: nameMapping,
        nameMappings: nameMappings,
        streamIndex: streamIndex,
        sortedNameMappings: sortedNameMappings,
        updateMeter: updateMeter,
        updateAlert: updateAlert,
        deleteAlert: deleteAlert,
        unusedStreams: unusedStreams,
        temperatureStreams: temperatureStreams,
        graphParams: graphParams,
        samplingRatePerHour: samplingRatePerHour
    };
});