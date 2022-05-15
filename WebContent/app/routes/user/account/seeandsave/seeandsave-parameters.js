/**
 * Extracted this out to a separate file to keep the see and save code lean.
 * All these will end up being re-factored into a cleaner factory implementation for the official release.
 */
angular.module('myaccount.route').factory('SeeAndSaveParameters', function () {
    var xivelyKey = "";
    var xivelyFeed = "";
    var synergyPeakCost = 0;
    var synergyOffPeakCost = 0;
    var HOUR_SECONDS = 60*60;

    var synergyBlockCosts = [];
    var synergyBlockThresholds = [];

    var initialise = function(feed, key, peakCost, offPeakCost, blockCosts, blockThresholds) {
        xivelyFeed = feed;
        xivelyKey = key;
        synergyPeakCost = peakCost;
        synergyOffPeakCost = offPeakCost;
        synergyBlockThresholds = blockThresholds;
        synergyBlockCosts = blockCosts;
    };

    var defaultParams = function() {
        return {
            key:xivelyKey
        };
    };

    var feedId = function() {
        return xivelyFeed;
    };

    var energyStreams = function (streams) {
        if (streams)
            self.energyStreams = streams;

        return self.energyStreams;
    }


    var samplingRatePerHour = function(startDate, endDate) {
        var intervalSeconds = interval(startDate, endDate);
        return HOUR_SECONDS/intervalSeconds;
    };

//    var graphParams = function(startDate, endDate) {
//        return {
//            key: xivelyKey,
//            start: startDate.toJSON(),
//            end: endDate.toJSON(),
//            interval: interval(startDate, endDate),
//            function: "average",
//            _: moment().unix(),
//            find_previous:false,
//            limit: 1000 // get the max number
//        };
//    };

    var pricing = function() {
        return {
            peakCost: synergyPeakCost,
            offPeakCost: synergyOffPeakCost,
            blockCosts: synergyBlockCosts
        };
    };

    var blockIntervals = function() {
        return angular.copy(synergyBlockThresholds);
    }

    var isTimeBasedPricing = function () {
        return synergyPeakCost != synergyOffPeakCost;
    };

    var isPricingAvailable = function () {
        return (synergyPeakCost && synergyOffPeakCost) || !_.isEmpty(synergyBlockCosts);
    };

    var key = function () {

    }

    return {
        initialise: initialise,
        samplingRatePerHour: samplingRatePerHour,
        feedId: feedId,
        key: xivelyKey,
        defaultParams: defaultParams,
        pricing: pricing,
        isTimeBasedPricing: isTimeBasedPricing,
        isPricingAvailable: isPricingAvailable,
        blockIntervals: blockIntervals,
        energyStreams: energyStreams
    };
});