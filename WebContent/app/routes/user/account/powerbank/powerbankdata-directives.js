// TODO Refactor shared methods

angular.module('myaccount.route').directive('powerbankConsumptionChart', function($filter, $log, powerbankChartServer, DeviceMode, Events) {

    return {
        restrict: 'C',
        replace: true,
        scope: {
             everyday_off_peak: '@',
             everyday_Peak: '@',
             weekday_shoulders: '@',
             weekend_shoulders: '@',
             rebs_payment: '@',
             battery_consumptio: '@',
             VALUE_DAY: '@',
            chartData: '&',
            dirtyCheck: '=',
            chart: '=',
            goBackStartDate: '&',
            goBackEndDate: '&',
            dayInterval: '=',
            contractAccountNumber: '=',
            mode: '=',
            powerbankDetails: '&'
        },
        template: '<div id="container" style="margin: 0 auto">please wait</div>',
        link: function (scope) {
            if (!scope.chart) {return;}

            var chart = new Highcharts.StockChart(scope.chart);

            scope.$watch("dirtyCheck", function (newValue) {
                if (newValue) {
                    var chartData = scope.chartData();
                    powerbankChartServer.modernizeChart(scope.chart);

                    var interval =  parseInt(scope.dayInterval,10);

                    var clickHandler = function(event) {
                        scope.$apply(powerbankChartServer.clickNavigator(this.x, interval));
                    };

                    var start = moment(chartData.startDate).valueOf();
                    if(scope.chart.chart.type=="pie"){}else{
                    scope.titleText = scope.chart.yAxis[0].labels.title;}
                    if(scope.chart.chart.type=="pie"){
                    scope.chart.series[0].data[0].y = chartData["everyday_Peak"][0];
                    scope.chart.series[0].data[1].y = chartData["everyday_off_peak"][0];
                    scope.chart.series[0].data[2].y = chartData["weekday_shoulders"][0];
                    scope.chart.series[0].data[3].y = chartData["weekend_shoulders"][0];
                    scope.chart.series[0].data[4].y = chartData["battery_consumption"][0];
                    scope.chart.series[0].data[5].y = chartData["rebs_payment"][0];
                    }
                    else {

                        scope.chart.series[0].data = chartData["everyday_Peak"];
                        scope.chart.series[1].data = chartData["everyday_off_peak"];
                        scope.chart.series[2].data = chartData["weekday_shoulders"];
                        scope.chart.series[3].data = chartData["weekend_shoulders"];
                        scope.chart.series[4].data = chartData["battery_consumption"];
                        scope.chart.series[5].data = chartData["rebs_payment"];
                    }

                    scope.chart.plotOptions.series.point.events.click = clickHandler;
                    scope.anchor=clickHandler;
                    scope.chart.plotOptions.series.pointStart = start;
                    if(scope.chart.chart.type=="pie"){}else {
                        scope.chart.tooltip.formatter = function () {
                            var index;

                            var s = '';



                            s += '<b>' + Highcharts.dateFormat('%A, %b %e, %Y', this.x) + '</b>';

                            for(var i=0;i<this.points.length;i++) {
                                if(this.points[i].series.name=="Sellback") {
                                    s += '<br/>' + ' <span style="color:' + this.points[i].series.color + '">'+this.points[i].series.name +': </span>' + $filter('number')(this.points[i].y, 2);
                                }
                                else{
                                s += '<br/>' + ' <span style="color:' + this.points[i].series.color + '">'+this.points[i].series.name +' kWh: </span>' + $filter('number')(this.points[i].y, 2);}
                            }

                            return s;
                        };
                    }
                    chart = new Highcharts.StockChart(scope.chart);
                    powerbankChartServer.responsifyChart(chart, DeviceMode.type, scope.titleText);
                }
            }, true);
            scope.$watch("mode", function(newValue){
                if (newValue === "Consumption") {
                    powerbankChartServer.reflow(chart, scope.chart.chart.renderTo);
                }
            });
            scope.$watch("resize", function(newValue){
                powerbankChartServer.reflow(chart, scope.chart.chart.renderTo);
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
                powerbankChartServer.responsifyChart(chart, message, scope.titleText);
            });
        }
    };
});


