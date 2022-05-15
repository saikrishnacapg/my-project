angular.module('myaccount.route').factory('SeeAndSaveData', function ($http, $q, DateUtils, SeeAndSaveHttpServer, SeeAndSaveParameters) {

    var summary = function() {
        return SeeAndSaveHttpServer.summary();
    };

    var channelDataLookup = function(startDate, endDate) {
        return function(id) {
            return SeeAndSaveHttpServer.channelData(SeeAndSaveHttpServer.graphParams(startDate, endDate), id);
        };
    };

    var dataStreamSummary = function(streamIds, startDate, endDate) {
        var promiseList = _.chain(streamIds)
            .map(channelDataLookup(startDate, endDate))
            .value();

        return $q.all(promiseList);
    };

    var extractData = function(streams) {
        return _.chain(streams)
            .pluck('data')
            .pluck('datapoints');
    };

    var extractIds = function(streams) {
        return _.chain(streams)
            .pluck('data')
            .pluck('id');
    };

    var mapToLineData = function(streams) {
        if (_.isEmpty(streams)) return [];

        var biggestStreamIndex = 0;
        var count = 0;
        // Get series containing the maximum of points
        // We sometimes don't get the same amount of datapoints between channels
        _.each(streams, function (value, key) {
            if (value.data.datapoints.length > count){
                count = value.data.datapoints.length;
                biggestStreamIndex = key;
            }
        });

        //Todo refactor using groupBy date
        var lineDataNew = _.map(streams[biggestStreamIndex].data.datapoints, function(it) {return {date: moment(it.at).format('ddd MMM Do YYYY h:mm a')}});
        var channelData = extractData(streams).sortBy('data.id').value();

        var lines = _.range(count);

        _.map(channelData, function(channel, channelIndex) {
            _.each(lines, function(lineDataIndex) {
                lineDataNew[lineDataIndex]["value" + channelIndex] = channel[lineDataIndex] ? channel[lineDataIndex].value : '';
            })
        });

        return _.map(lineDataNew, function(it) {return _.values(it)});
    };

    var lastSnapshotValue = function(stream){
        var last = _.last(stream.data.datapoints);
        return _.round(parseFloat(last ? last.value : 0), 2);
    }
    var lastSnapshot = function(streams) {
        return extractData(streams)
            .sortBy('data.id')
            .map(function(stream) {
                var last = _.last(stream);
                return _.round(parseFloat(last ? last.value : 0), 2);
            }).value();
    };

    var lastLoad = function(streams){
        return lastSnapshotValue(streams)/1000;
    };

    var channelNames = function(streamIds) {
        var sortedNameMappings = SeeAndSaveHttpServer.sortedNameMappings(streamIds);

        return sortedNameMappings;
    };

    var channelName = function(streamId) {
        return SeeAndSaveHttpServer.nameMapping(streamId);
    };

    var prepareChannelData = function (channelData, reject){
        return extractData(channelData)
            .flatten()
            .reject(reject || function(it){ return false; });
    }

    /**
     * Channels like watts take a sample load which reflects the amount per hour.
     * We need to divide the summed value by the sampleRate per hour to get the true usage value.
     *
     */
    var summariseChannelData = function(channelData, samplingRatePerHour, reject) {
        return prepareChannelData(channelData, reject)
            .sum('value')
            .divide(samplingRatePerHour||1);
    };

    var summariseChannelValues = function(channelData, samplingRatePerHour, reject) {
        return _.chain(channelData)
            .reject(reject || function(it){ return false; })
            .sum('value')
            .divide(samplingRatePerHour||1);
    };

    var groupChannelDataPerDay = function (channelData, reject){
        return prepareChannelData(channelData, reject)
            .groupBy(function (it) { return moment(it.at).format('L'); })
    }
    /**
     * Channels like watts take a sample load which reflects the amount per hour.
     * We need to divide the summed value by the sampleRate per hour to get the true usage value.
     *
     */
    var summariseChannelDataPerDay = function(channelData, samplingRatePerHour, reject) {
        return groupChannelDataPerDay(channelData, reject)
            .mapValues(function (it) { return _.chain(it).sum('value').divide(samplingRatePerHour||1)});
    };

    /**
     * Channels like watts take a sample load which reflects the amount per hour.
     * We need to divide the summed value by the sampleRate per hour to get the true usage value.
     *
     */
    var computeBreakPoints = function(dataPoints, samplingRatePerHour, blockIntervals) {
        var usage = 0;
        var allDataPoints = _.sortBy(dataPoints,'at');
        var breakPoints = [];
        _.each(allDataPoints, function(dataPoint){
            usage += (dataPoint.value/1000)/(samplingRatePerHour||1);
            if (usage >= _.head(blockIntervals)){
                breakPoints.push(moment(dataPoint.at));
                blockIntervals = _.tail(blockIntervals);
            }
        });
        return breakPoints;
    };

    /**
     * Compute costs with a block-based pricing
     *
     */
    var computeBlockCosts = function (usage, blocks, prices){

        var compute = function(cost, usage, blockIndex) {
            if (!usage || blockIndex >= blocks.length)
                return cost;
            var blockUsage = Math.min(usage, blocks[blockIndex] - (blocks[blockIndex-1] || 0));
            var blockCost = blockUsage * prices[blockIndex];
            var remainingUsage = Math.max(usage - blockUsage, 0);
            return compute(cost + blockCost ,remainingUsage , ++blockIndex);
        };

        return compute(0, usage, 0);
    };

    var computeUsage = function (channelData, samplingRatePerHour, result, current, breakPoints) {

        result.kwh = summariseChannelData(channelData, samplingRatePerHour).toKilowatts().value();

        if (SeeAndSaveParameters.isPricingAvailable()){
            var pricing = SeeAndSaveParameters.pricing();

            if (SeeAndSaveParameters.isTimeBasedPricing()){
                var peakKilowatts = summariseChannelData(channelData, samplingRatePerHour, function(it) {
                    return !it || !DateUtils.isPeak(it.at);
                } ).toKilowatts();
                var offPeakKilowatts = summariseChannelData(channelData, samplingRatePerHour, function(it) {
                    return !it || DateUtils.isPeak(it.at);
                } ).toKilowatts();
                result.peakKwh = peakKilowatts.value();
                result.offPeakKwh = offPeakKilowatts.value();
                result.kwh = result.peakKwh + result.offPeakKwh;
                result.peakCost = result.peakKwh * pricing.peakCost;
                result.offPeakCost = result.offPeakKwh  * pricing.offPeakCost;
                result.cost = result.peakCost + result.offPeakCost;
            } else {
                var blockIntervals = SeeAndSaveParameters.blockIntervals();
                var blockCosts = SeeAndSaveParameters.pricing().blockCosts;
                if (current) {
                    // We get all the channels here, we can compute the times at which we reach the blocks thresholds
                    var channelDataPerDay = groupChannelDataPerDay(channelData);
                    result.breakPoints = channelDataPerDay.mapValues(function(value){
                        return computeBreakPoints(value, samplingRatePerHour, blockIntervals);
                    }).value();
                }
                if (!breakPoints){
                    // Global usage/cost we don't need breakpoints
                    var usagePerDay = summariseChannelDataPerDay(channelData, samplingRatePerHour).mapValues(function(it) {return it.toKilowatts().value()});
                    var costPerDay = usagePerDay.mapValues(function (it) { return computeBlockCosts(it, blockIntervals, blockCosts)});
                    result.cost = costPerDay.values().sum().value();
                }
                else {
                    // Per device usage/cost we need breakpoints
                    result.cost = 0;
                    var channelDataPerDay = groupChannelDataPerDay(channelData).value();
                    _.each(channelDataPerDay, function (value, day){
                        var blocksBreakPoints = angular.copy(breakPoints[day]);
                        blocksBreakPoints.push(moment());
                        _.each(blocksBreakPoints, function (breakPoint, key){

                            //Reject values outside of current block
                            var reject = function(it){
                                if (key)
                                    return moment(it.at) < blocksBreakPoints[key-1] || moment(it.at) >= breakPoint;
                                else
                                    return moment(it.at) >= breakPoint;
                            };

                            var blockUsage = summariseChannelValues(value, samplingRatePerHour, reject).toKilowatts().value();
                            result.cost += blockUsage * blockCosts[key];
                        });
                    });
                }
            }
        }
        return result;
    }

    var summariseUsageData = function(channelData, samplingRatePerHour, current, breakPoints) {

        if (!samplingRatePerHour && _.first(channelData)){
            var start, end;
            var firstPoint = _.first(_.first(channelData).data.datapoints);
            var lastPoint = _.last(_.first(channelData).data.datapoints);
            if (firstPoint && lastPoint){
                start = moment(firstPoint.at);
                end = moment(lastPoint.at);
            }
            samplingRatePerHour = SeeAndSaveHttpServer.samplingRatePerHour(start, end)
        }

        var result = {};

        result = computeUsage(channelData, samplingRatePerHour, result, current, breakPoints);

        result.energyStreamIndex = _.pluck(channelData, 'data.energyStreamIndex').pop();
        result.name = channelName(_.pluck(channelData, 'data.energyStreamIndex').pop());
        result.id = _.pluck(channelData, 'data.id').pop();
        result.currentLoad = _.pluck(channelData, 'data.current_value').pop();

        var lastPoint = _.last(_.pluck(channelData, 'data.datapoints').pop());

        result.lastLoad = lastPoint ? parseFloat(lastPoint.value) : undefined;
        result.co2Kg = _.chain(result.kwh).toCo2Kg().value();

        return result;
    };

    var deltaPercent = function (current, previous) {
        return _.round(Math.abs(100 - current / previous * 100)) || 0;
    };

    var saving = function (current, previous) {
        return current == previous ? undefined : current < previous;
    };

    var reject_predicate = function (it) {
        return SeeAndSaveParameters.energyStreams().indexOf(it.data.id).value()  === -1;
    };

    var clean = function(streamData) {
        return _.reject(streamData, reject_predicate);
    };

    var streamIndex = function (id) {
        return SeeAndSaveHttpServer.streamIndex(id);
    };

    return {
        extract: extractData,
        extractIds: extractIds,
        clean: clean,
        channelNames: channelNames,
        channelName: channelName,
        streamIndex: streamIndex,
        deltaPercent: deltaPercent,
        saving: saving,
        lastSnapshot: lastSnapshot,
        lastLoad: lastLoad,
        dataStreamSummary: dataStreamSummary,
        mapToLineData: mapToLineData,
        summariseUsageData: summariseUsageData,
        summary: summary
    };
});