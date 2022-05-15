// TODO Refactor shared methods

angular.module('myaccount.route').directive('lifestyleConsumptionChart', function($filter, $log, LifestyleChartServer, DeviceMode, Events) {

    return {
        restrict: 'C',
        replace: true,
        scope: {
            chartData: '&',
            dirtyCheck: '=',
            chart: '=',
            saturdayValues: '@',
            otherdayValues: '@',
            goBackStartDate: '&',
            goBackEndDate: '&',
            goBackDevices: '&',
            dayInterval: '=',
            contractAccountNumber: '=',
            mode: '='

        },
        template: '<div id="container" style="margin: 0 auto">please wait</div>',
        link: function (scope) {
            if (!scope.chart) {return;}

            var chart = new Highcharts.StockChart(scope.chart);

            scope.$watch("dirtyCheck", function (newValue) {
                if (newValue) {
                    var chartData = scope.chartData();
                    LifestyleChartServer.modernizeChart(scope.chart);

                    var interval =  parseInt(scope.dayInterval,10);

                    var clickHandler = function(event) {
                        scope.$apply(LifestyleChartServer.clickNavigator(this.x, interval));
                    };

                    var start = moment(chartData.startDate).valueOf();

                    scope.titleText = scope.chart.yAxis[0].labels.title;

                    scope.chart.series[0].data = chartData[scope.otherdayValues];
                    scope.chart.series[1].data = chartData[scope.saturdayValues];
if(interval === 0) {
    var dt = moment(chartData.startDate, "YYYY-MM-DD HH:mm:ss");
    var day=dt.format('dddd');
    scope.chart.navigator.series.data = day === 'Saturday' ? chartData[scope.saturdayValues] : chartData[scope.otherdayValues];
}
  else{
    scope.chart.navigator.series.data = chartData.totalKwhDailyValues;
}

                    scope.chart.plotOptions.series.point.events.click = clickHandler;
                    scope.anchor=clickHandler;
                    scope.chart.plotOptions.series.pointStart = start;
                    scope.chart.tooltip.formatter = function() {
                        var index;

                        var s = '';

                        if (interval === 0) {
                            s += '<b>'+ Highcharts.dateFormat('%A, %b %e, %Y %H:%M', this.x) +'</b>';
                            index = (this.x - start) / LifestyleChartServer.ELEC_INTERVAL;
                           /* s += '<br/>' + ' <span style="color:' + scope.chart.series[0].color + '">Off Peak kWh: </span>' + (this.points[0].series.name === "Off Peak kWh" ? $filter('number')(this.points[0].y, 2) : "N/A");
                            s += '<br/>' + ' <span style="color:' + scope.chart.series[1].color + '">Peak kWh: </span>' + (this.points[0].series.name === "Peak kWh" ? $filter('number')(this.points[0].y, 2) : "N/A");*/
                            s += '<br/>' + 'Total kWh: ' + $filter('number')(this.points[0].total, 2);
                            s += '<br/>' + ' <span style="color:#001b36;' + '">Reading Status: </span>' + $filter('capitalize')(chartData.statusCodeHalfHourlyValues[index]);
                        } else {
                            s += '<b>'+ Highcharts.dateFormat('%A, %b %e, %Y', this.x) +'</b>';
                            index = (this.x - start) / LifestyleChartServer.DAY_INTERVAL;
                           /* s += '<br/>' + ' <span style="color:' + scope.chart.series[0].color + '">Off Peak kWh: </span>' + $filter('number')(this.points[0].y, 2);
                            s += '<br/>' + ' <span style="color:' + scope.chart.series[1].color + '">Peak kWh: </span>' + $filter('number')(this.points[1].y, 2);*/
                            s += '<br/>' + 'Total kWh: ' + $filter('number')(this.points[0].total, 2);

                            s += '<br/>' + ' <span style="color:' + scope.chart.series[2].color + '">Includes Outage: </span>' + chartData.includesOutageDailyValues[index];
                            s += '<br/>' + ' <span style="color:' + scope.chart.series[3].color + '">Includes Estimate: </span>' + chartData.includesEstimateDailyValues[index];
                        }

                        return s;
                    };

                    chart = new Highcharts.StockChart(scope.chart);
                    LifestyleChartServer.responsifyChart(chart, DeviceMode.type, scope.titleText);
                }
            }, true);
            scope.$watch("mode", function(newValue){
                if (newValue === "Consumption") {
                    LifestyleChartServer.reflow(chart, scope.chart.chart.renderTo);
                }
            });
            scope.$watch("resize", function(newValue){
                LifestyleChartServer.reflow(chart, scope.chart.chart.renderTo);
            });
            scope.$on(Events.INTERVAL_DOWNLOAD, function(event, message){
                chart.exportChart({
                    type: message.type
                });
            });
            scope.$on(Events.INTERVAL_PRINT, function(event, message){
                chart.print();
            });
            scope.$on(Events.INTERVAL_EMAIL, function(event, message){
                chart.emailChart( message,
                    { type: message.downloadFormat });
            });
            scope.$on(Events.DEVICE_CHANGE, function(event, message){
                LifestyleChartServer.responsifyChart(chart, message, scope.titleText);
            });
        }
    };
});
