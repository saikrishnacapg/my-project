angular.module('myaccount.route').factory('SeeAndSaveCsv', function (SeeAndSaveData, SeeAndSaveParameters) {

    var load = function(streamData) {
        var header = [['Timestamp'].concat(_.map(SeeAndSaveData.channelNames(SeeAndSaveData.extractIds(streamData)),function(header){
                return header + ' (W)';
            }
        ))];
        var data = SeeAndSaveData.mapToLineData(
            _.reject(streamData, function(it){
                return it.data.tags && it.data.tags.indexOf('temperature') !== -1;
            })
        );
        return header.concat(data);
    };

    var cost = function (usageData){
        if (SeeAndSaveParameters.isPricingAvailable()){
            if (SeeAndSaveParameters.isTimeBasedPricing()){
                var labels = [['', 'Peak usage (kWh)', 'Off-peak usage (kWh)', 'Peak costs ($)', 'Off-peak costs ($)']];
                var data = _.map(usageData, function(device){
                    return [device.name, device.peakKwh, device.offPeakKwh, device.peakCost, device.offPeakCost]
                });
                // rotate
                return _.unzip(labels.concat(data));
            } else {
                var labels = [['', 'Usage (kWh)', 'Costs ($)']];
                var data = _.map(usageData, function(device){
                    return [device.name, device.kwh, device.cost]
                });
                // rotate
                return _.unzip(labels.concat(data));
            }
        } else {
            var labels = [['', 'Usage (kWh)']];
            var data = _.map(usageData, function(device){
                return [device.name, device.kwh]
            });
            // rotate
            return _.unzip(labels.concat(data));
        }
    };

    return {
        load: load,
        cost: cost
    };
});