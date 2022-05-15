
/**
 * Material Design colors
 */
// Synergy colors
angular.module('myaccount.route').value('MaterialColorRange',["#D14414", "#3095B4", "#EFBD47", "#C1BB00", "#5F3944", "#3f6075", "#3095B4", "#512D44", "#9A8643", "#BAC5C6", "#CD5A13", "#E98300"]);


angular.module('myaccount.route').factory('SeeAndSaveCharts', function (SeeAndSaveData, SeeAndSaveParameters, MaterialColorRange) {

    var graphColorRange = function(streamIds) {
        return _.map(streamIds, function(it) {
            return MaterialColorRange[+it];
        });
    };

    function shadeColor(color, percent) {
        var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
        return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
    };

    var color = function(streamId, shade) {
        return shade ? shadeColor(MaterialColorRange[+streamId], shade) : MaterialColorRange[+streamId];
    };

    var reject_predicate = function (it) {
        return SeeAndSaveParameters.energyStreams().indexOf("" + it.energyStreamIndex) === -1;
    };

    this.color = function(id, shade) {
        return SeeAndSaveCharts.color(id, shade);
    };

    var name = function(id) {
        return SeeAndSaveData.channelName(id);
    };
//
//    var energyStreamIndex = function (id) {
//        return SeeAndSaveData.energyStreamIndex(id);
//    };

    var updateLineData = function (linesData, streamData) {

        var lineGraphData = SeeAndSaveData.extract(streamData)
            .map(function(it, index){
                return {
                    area: false,
                    color: color([index]),
                    key: name(index),
                    energyStreamIndex: index, // used by us to make sure graph doesn't modify
                    seriesIndex: index, // used by graph
                    values: _.map(it, function(val) {
                        return {
                            series: index,
                            x: moment(val.at).toDate(),
                            y: parseFloat(parseFloat(val.value).toFixed(1))
                        }
                    })
                }
            }).value();

        lineGraphData = _.reject(lineGraphData, reject_predicate);

        if (!linesData) {
            linesData = lineGraphData;
        }else{
            _.forEach(lineGraphData, function(n, i) {
                linesData[i].key = n.key;
                linesData[i].values = n.values;
            });
        }

        return linesData;
    };

    var updatePieData = function (pieData, periodUsage){

        var pieGraphData = _.chain(periodUsage)
            .reject(reject_predicate)
            .map(function(it) {
                return {
                    label: name(it.energyStreamIndex),
                    value: _.round(it.kwh),
                    color: color(it.energyStreamIndex),
                    offPeakCost: _.round(it.offPeakCost,2),
                    peakCost:  _.round(it.peakCost,2)
                }
            }).value();

        if (!pieData) {
            pieData = pieGraphData;
        }else{
            _.forEach(pieGraphData, function(n, i) {
                pieData[i].label = n.label;
                pieData[i].value = _.round(n.value);
                pieData[i].offPeakCost = _.round(n.offPeakCost,2);
                pieData[i].peakCost =  _.round(n.peakCost,2);
            });
        }

        return pieData;
    };

    var updateBarData = function(barData, periodUsage) {
        if (SeeAndSaveParameters.isTimeBasedPricing()) {
            var currentPeriodPeakCosts = _.chain(periodUsage)
                .map(function (it) {
                    return {
                        label: name(it.energyStreamIndex),
                        value: it.peakCost,
                        color: color(it.energyStreamIndex)
                    };
                })
                .thru(function (it) {
                    return [
                        {key: 'Cost (On peak)', values: it}
                    ];
                }).value();

            var currentPeriodOffPeakCosts = _.chain(periodUsage)
                .map(function (it) {
                    return {
                        label: name(it.energyStreamIndex),
                        value: it.offPeakCost,
                        color: color(it.energyStreamIndex, 0.2)
                    };
                })
                .thru(function (it) {
                    return [
                        {key: 'Cost (Off peak)', values: it}
                    ];
                }).value();

            barData = currentPeriodPeakCosts.concat(currentPeriodOffPeakCosts);
        } else {
            barData = _.chain(periodUsage)
                .map(function (it) {
                    return {
                        label: name(it.energyStreamIndex),
                        value: it.cost,
                        color: color(it.energyStreamIndex)
                    };
                })
                .thru(function (it) {
                    return [
                        {key: 'Cost', values: it}
                    ];
                }).value();

//            var test =summariseChannelDataPerDayPerDevice()
        }

        return barData;
    };

    return {
        color: color,
        graphColorRange: graphColorRange,
        updateLineData: updateLineData,
        updatePieData: updatePieData,
        updateBarData: updateBarData
    };
});