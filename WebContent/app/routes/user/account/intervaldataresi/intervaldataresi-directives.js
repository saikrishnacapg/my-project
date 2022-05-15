// TODO Refactor shared methods

angular.module('myaccount.route').directive('intervalDataResiConsumptionChart', function($filter, $log, intervalDataResiChartServer, DeviceMode, Events) {

	return {
		restrict: 'C',
		replace: true,
		scope: {
			chartData: '&',
			dirtyCheck: '=',
			chart: '=',
			peakValues: '@',
			offPeakValues: '@',
			goBackStartDate: '&',
			goBackEndDate: '&',
			goBackDevices: '&',
			dayInterval: '=',
			contractAccountNumber: '=',
			mode: '=',
			intervalDetails: '&'
		},
		template: '<div id="container" style="margin: 0 auto">please wait</div>',
		link: function (scope) {
			if (!scope.chart) {
				return;
			}

			var chart = new Highcharts.StockChart(scope.chart);

			scope.$watch("dirtyCheck", function (newValue) {
				if (newValue) {
					var chartData = scope.chartData();
					intervalDataResiChartServer.modernizeChart(scope.chart);

					var interval = parseInt(scope.dayInterval, 10);

					var clickHandler = function(event) {
						scope.$apply(intervalDataResiChartServer.clickNavigator(this.x, interval));
					};

					var start = moment(chartData.startDate).valueOf();

					scope.titleText = scope.chart.yAxis[0].labels.title;

					scope.chart.series[0].data = chartData[scope.offPeakValues];
					scope.chart.series[1].data = chartData[scope.peakValues];
					if (interval===0) {
						scope.chart.navigator.series.data = chartData.kwHalfHourlyValues;
					} else {
						scope.chart.navigator.series.data = chartData.totalKwhDailyValues;
					}

					scope.chart.plotOptions.series.point.events.click = clickHandler;

					scope.chart.plotOptions.series.pointStart = start;
					if (interval !== 0) {
						var plotLines = scope.chart.xAxis.plotLines;
						var intervaldetails = scope.intervalDetails();
						angular.forEach(intervaldetails, function (intervaldetail, index) {
							var startD = new Date(intervaldetail.productSwitchStartDate);
							startD.setTime( startD.getTime() - 86400000 );
							var startDate = Date.UTC(startD.getFullYear(), startD.getMonth(), startD.getDate(), 4, 0, 0);
							var plotlinearray1 = JSON.parse(JSON.stringify(plotLines[1]));
							plotlinearray1.value = startDate;
							plotlinearray1.label.text = intervaldetail.productCode;
							plotLines.push(plotlinearray1);
							var endD = new Date(intervaldetail.productSwitchEndDate);
							var endDate = Date.UTC(endD.getFullYear(), endD.getMonth(), endD.getDate(), 4, 0, 0);
							var plotlinearray0 = JSON.parse(JSON.stringify(plotLines[0]));
							plotlinearray0.value = endDate;
							plotlinearray0.label.text = intervaldetail.productCode;
							plotLines.push(plotlinearray0);
						});
					}
					scope.chart.xAxis[0].plotLines = plotLines;
					scope.chart.tooltip.formatter = function() {
						var index;

						var s = '';

						if (interval === 0) {
							s += '<b>'+ Highcharts.dateFormat('%A, %b %e, %Y %H:%M', this.x) +'</b>';
							index = (this.x - start) / intervalDataResiChartServer.ELEC_INTERVAL;
							s += '<br/> <span style="color:' + scope.chart.series[0].color + '">Standard home: </span>' + (this.points[0].series.name === "Standard home" ? $filter('number')(this.points[0].y, 2) : "N/A");
							s += '<br/> <span style="color:' + scope.chart.series[1].color + '">EV off peak: </span>' + (this.points[0].series.name === "EV off peak" ? $filter('number')(this.points[0].y, 2) : "N/A");
							s += '<br/> <span style="color:#001b36;">Reading Status: </span>' + $filter('capitalize')(chartData.statusCodeHalfHourlyValues[index]);
						} else {
							s += '<b>'+ Highcharts.dateFormat('%A, %b %e, %Y', this.x) +'</b>';
							index = (this.x - start) / intervalDataResiChartServer.DAY_INTERVAL;
							s += '<br/> <span style="color:' + scope.chart.series[0].color + '">Standard home: </span>' + $filter('number')(this.points[0].y, 2);
							s += '<br/> <span style="color:' + scope.chart.series[1].color + '">EV off peak: </span>' + $filter('number')(this.points[1].y, 2);
							s += '<br/>Total kWh: ' + $filter('number')(this.points[0].total, 2);

							s += '<br/> <span style="color:' + scope.chart.series[2].color + '">Includes Outage: </span>' + chartData.includesOutageDailyValues[index];
							s += '<br/> <span style="color:' + scope.chart.series[3].color + '">Includes Estimate: </span>' + chartData.includesEstimateDailyValues[index];
						}
						return s;
					};
					chart = new Highcharts.StockChart(scope.chart);
					intervalDataResiChartServer.responsifyChart(chart, DeviceMode.type, scope.titleText);
				}
			}, true);
			scope.$watch("mode", function(newValue){
				if (newValue === "Consumption") {
					intervalDataResiChartServer.reflow(chart, scope.chart.chart.renderTo);
				}
			});
			scope.$watch("resize", function(newValue){
				intervalDataResiChartServer.reflow(chart, scope.chart.chart.renderTo);
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
				intervalDataResiChartServer.responsifyChart(chart, message, scope.titleText);
			});
		}
	};
});

