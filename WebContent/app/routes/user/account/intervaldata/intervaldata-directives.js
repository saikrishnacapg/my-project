// TODO Refactor shared methods

angular.module('myaccount.route').directive('intervalDataConsumptionChart', function($filter, $log, ChartServer, DeviceMode, Events) {

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
			intervalDetails: '&',
			generationValues: '@',
			showGeneration: '=',
			weekdayShoulderValues: '@',
			weekendShoulderValues: '@'
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
					ChartServer.modernizeChart(scope.chart);

					var interval = parseInt(scope.dayInterval, 10);

					var clickHandler = function (event) {
						scope.$apply(ChartServer.clickNavigator(this.x, interval));
					};

					var start = moment(chartData.startDate).valueOf();

					scope.titleText = scope.chart.yAxis[0].labels.title;

					var tempArr = [];

					if (interval===0) {
						if (chartData.retrieveIntervalDetails[0].basePeriod !== "") {
							//  $filter('filter')(scope.chart.series, {id: 'offPeakKwhValues'})[0].data = chartData[scope.offPeakValues];
							var itemsToAdd = [];
							itemsToAdd.sapName = 'basePeriod',
							itemsToAdd.id = 'offPeakKwhValues',
							itemsToAdd.name = chartData.retrieveIntervalDetails[0].basePeriod
							itemsToAdd.color = '#002360',
							itemsToAdd.showInLegend = true,
							itemsToAdd.index = 3,
							itemsToAdd.legendIndex = 0
							scope.chart.series.push(itemsToAdd)
							scope.chart.series[0].data = chartData[scope.offPeakValues];
						}
						if (chartData.retrieveIntervalDetails[0].period2 !== "") {
							//$filter('filter')(scope.chart.series, {id: 'peakKwhValues'})[0].data = chartData[scope.peakValues];
							var itemsToAdd = [];
							itemsToAdd.sapName = 'period2',
							itemsToAdd.id = 'peakKwhValues',
							itemsToAdd.name = chartData.retrieveIntervalDetails[0].period2,
							itemsToAdd.color = '#58B4FF',
							itemsToAdd.showInLegend = true,
							itemsToAdd.index = 0,
							itemsToAdd.legendIndex = 3
							scope.chart.series.push(itemsToAdd)
							scope.chart.series[1].data = chartData[scope.peakValues];
						} else {
							var itemsToAdd = [];
							itemsToAdd.sapName = 'period2',
							itemsToAdd.id = 'peakKwhValues',
							itemsToAdd.name = 'Peak kWh',
							itemsToAdd.color = '#58B4FF',
							itemsToAdd.showInLegend = false,
							itemsToAdd.index = 0,
							itemsToAdd.legendIndex = 3
							scope.chart.series.push(itemsToAdd)
							//Scope.chart.series[1].data = chartData[scope.peakValues];
						}

						if (chartData.retrieveIntervalDetails[0].period3 !== "") {
							//  $filter('filter')(scope.chart.series, {id: 'WeekdayShoulder'})[0].data = chartData[scope.weekdayShoulderValues];
							var itemsToAdd = [];
							itemsToAdd.sapName = 'period3',
							itemsToAdd.id = 'WeekdayShoulder',
							itemsToAdd.name = chartData.retrieveIntervalDetails[0].period3,
							itemsToAdd.color = '#7ACCB2',
							itemsToAdd.showInLegend = true,
							itemsToAdd.index = 1,
							itemsToAdd.legendIndex = 1
							scope.chart.series.push(itemsToAdd)
							scope.chart.series[2].data = chartData[scope.weekdayShoulderValues];
						} else {
							var itemsToAdd = [];
							itemsToAdd.sapName = 'period3',
							itemsToAdd.id = 'WeekdayShoulder',
							itemsToAdd.name = 'WeekdayShoulder',
							itemsToAdd.color = '#7ACCB2',
							itemsToAdd.showInLegend = false,
							itemsToAdd.index = 1,
							itemsToAdd.legendIndex = 1
							scope.chart.series.push(itemsToAdd)
							//Scope.chart.series[2].data = chartData[scope.weekdayShoulderValues];
						}
						if (chartData.retrieveIntervalDetails[0].period4 !== "") {
							//  $filter('filter')(scope.chart.series, {id: 'WeekendShoulder'})[0].data = chartData[scope.weekendShoulderValues];
							var itemsToAdd = [];
							itemsToAdd.sapName = 'period4',
							itemsToAdd.id = 'WeekendShoulder',
							itemsToAdd.name = chartData.retrieveIntervalDetails[0].period4,
							itemsToAdd.color = '#8FBD8F',
							itemsToAdd.showInLegend = true,
							itemsToAdd.index = 2,
							itemsToAdd.legendIndex = 2
							scope.chart.series.push(itemsToAdd)
							scope.chart.series[3].data = chartData[scope.weekendShoulderValues];
						} else {
							var itemsToAdd = [];
							itemsToAdd.sapName = 'period4',
							itemsToAdd.id = 'WeekendShoulder',
							itemsToAdd.name = 'WeekendShoulder',
							itemsToAdd.color = '#8FBD8F',
							itemsToAdd.showInLegend = false,
							itemsToAdd.index = 2,
							itemsToAdd.legendIndex = 2
							scope.chart.series.push(itemsToAdd)
							//Scope.chart.series[3].data = chartData[scope.weekendShoulderValues];
						}
						if (scope.showGeneration) {
							var itemsToAdd = [];
							itemsToAdd.sapName = 'GenerationData',
							itemsToAdd.id = 'inlcudesGeneration',
							itemsToAdd.type = 'spline',
							itemsToAdd.name = 'SOLAR EXPORT',
							itemsToAdd.color = '#F2BF38',
							itemsToAdd.showInLegend = true,
							itemsToAdd.legendIndex = 4
							scope.chart.series.push(itemsToAdd)
							scope.chart.series[scope.chart.series.length - 1].data = chartData[scope.generationValues]; // Generation data line on top of bar chart
						}
					} else {
						var x = 0;
						angular.forEach(chartData.retrieveIntervalDetails.reverse(), function (value, key) {
							var itemsTobasePeriod = [];
							var itemsToperiod2 = [];
							var itemsToperiod3 = [];
							var itemsToperiod4 = [];

							var productSwitchStartDate = moment(value.productSwitchStartDate).toDate();
							var productSwitchEndDate = moment(value.productSwitchEndDate).toDate();

							var startDate = moment(chartData.startDate).toDate();
							var endDate = moment(chartData.endDate).toDate();

							var i = 0;
							while (startDate < endDate) {
								//Console.log("start date:" + startDate);
								if (productSwitchStartDate <= startDate && productSwitchEndDate >= startDate) {
									//Console.log("total count:" + i + 1);
									itemsTobasePeriod[i] = chartData[scope.offPeakValues] !== undefined ? chartData[scope.offPeakValues][i] : 0;
									itemsToperiod2[i] = chartData[scope.peakValues] !== undefined ? chartData[scope.peakValues][i] : 0;
									itemsToperiod3[i] = chartData[scope.weekdayShoulderValues] !== undefined ? chartData[scope.weekdayShoulderValues][i] : 0;
									itemsToperiod4[i] = chartData[scope.weekendShoulderValues] !== undefined ? chartData[scope.weekendShoulderValues][i] : 0;
								} else {
									//Console.log("total count:" + i);
									itemsTobasePeriod[i] = 0;
									itemsToperiod2[i] = 0;
									itemsToperiod3[i] = 0;
									itemsToperiod4[i] = 0;
								}
								i++;
								startDate = moment(startDate).add(1, 'days').toDate();
							}

							if (value.basePeriod !== "") {
								var itemsToAdd = [];
								itemsToAdd.sapName = 'basePeriod';
								itemsToAdd.id = 'offPeakKwhValues';
								itemsToAdd.name = value.basePeriod;
								itemsToAdd.color = '#002360';
								itemsToAdd.showInLegend = true;
								itemsToAdd.index = 3;
								itemsToAdd.legendIndex = 0;
								scope.chart.series.push(itemsToAdd);
								scope.chart.series[x].data = itemsTobasePeriod;
								x++;
							}

							if (value.period2 !== "") {
								var itemsToAdd = [];
								itemsToAdd.sapName = 'period2';
								itemsToAdd.id = 'peakKwhValues';
								itemsToAdd.name = value.period2;
								itemsToAdd.color = '#58B4FF';
								itemsToAdd.showInLegend = true;
								itemsToAdd.index = 0;
								itemsToAdd.legendIndex = 3;
								scope.chart.series.push(itemsToAdd);
								scope.chart.series[x].data = itemsToperiod2;
								x++;
							} else {
								var itemsToAdd = [];
								itemsToAdd.sapName = 'period2';
								itemsToAdd.id = 'peakKwhValues';
								itemsToAdd.name = 'Peak kWh';
								itemsToAdd.color = '#58B4FF';
								itemsToAdd.showInLegend = false;
								itemsToAdd.index = 0;
								itemsToAdd.legendIndex = 3;
								scope.chart.series.push(itemsToAdd);
								//Scope.chart.series[x].data = itemsToperiod2;
								x++;

							}
							if (value.period3 !== "") {
								var itemsToAdd = [];
								itemsToAdd.sapName = 'period3';
								itemsToAdd.id = 'WeekdayShoulder';
								itemsToAdd.name = value.period3;
								itemsToAdd.color = '#7ACCB2';
								itemsToAdd.showInLegend = true;
								itemsToAdd.index = 1;
								itemsToAdd.legendIndex = 1;
								scope.chart.series.push(itemsToAdd);
								scope.chart.series[x].data = itemsToperiod3;
								x++;
							} else {
								var itemsToAdd = [];
								itemsToAdd.sapName = 'period3';
								itemsToAdd.id = 'WeekdayShoulder';
								itemsToAdd.name = 'WeekdayShoulder';
								itemsToAdd.color = '#7ACCB2';
								itemsToAdd.showInLegend = false;
								itemsToAdd.index = 1;
								itemsToAdd.legendIndex = 1;
								scope.chart.series.push(itemsToAdd);
								//Scope.chart.series[x].data = itemsToperiod3;
								x++;

							}
							if (value.period4 !== "") {
								var itemsToAdd = [];
								itemsToAdd.sapName = 'period4';
								itemsToAdd.id = 'WeekendShoulder';
								itemsToAdd.name = value.period4;
								itemsToAdd.color = '#8FBD8F';
								itemsToAdd.showInLegend = true;
								itemsToAdd.index = 2;
								itemsToAdd.legendIndex = 2;
								scope.chart.series.push(itemsToAdd);
								scope.chart.series[x].data = itemsToperiod4;
								x++;
							} else {
								var itemsToAdd = [];
								itemsToAdd.sapName = 'period4';
								itemsToAdd.id = 'WeekendShoulder';
								itemsToAdd.name = 'WeekendShoulder';
								itemsToAdd.color = '#8FBD8F';
								itemsToAdd.showInLegend = false;
								itemsToAdd.index = 2;
								itemsToAdd.legendIndex = 2;
								scope.chart.series.push(itemsToAdd);
								//Scope.chart.series[x].data = itemsToperiod4;
								x++;
							}

						});
						if (scope.showGeneration) {
							var itemsToAdd = [];
							itemsToAdd.sapName = 'GenerationData';
							itemsToAdd.id = 'inlcudesGeneration';
							itemsToAdd.type = 'spline';
							itemsToAdd.name = 'SOLAR EXPORT';
							itemsToAdd.color = '#F2BF38';
							itemsToAdd.showInLegend = true;
							itemsToAdd.legendIndex = 4;
							scope.chart.series.push(itemsToAdd);
							scope.chart.series[scope.chart.series.length - 1].data = chartData[scope.generationValues]; // Generation data line on top of bar chart
						}
					}

					scope.chart.SeriesData =scope.chart.series;


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

					scope.filterDevices = function(data, match) {
						var result
						angular.forEach(data, function(value, key){
							if (value.series.name === match) {
								result = value;
								return result;
							}
						});
						return result;
					};

					scope.chart.tooltip.formatter = function () {
						var index;
						var s = '';
						if (interval === 0) {
							s += '<b>' + Highcharts.dateFormat('%A, %b %e, %Y %H:%M', this.x) + '</b>';
							index = (this.x - start) / ChartServer.ELEC_INTERVAL;
							pointData_ELEC_INTERVAL = this;
							angular.forEach(pointData_ELEC_INTERVAL.points, function(value, key) {
								//Console.log(key + ': ' + value);
								if (value.series.userOptions.sapName==="basePeriod"){
									s += '<br/> <span style="color:#002360;">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								}
								if (value.series.userOptions.sapName==="period2"){
									s += '<br/> <span style="color:#58B4FF;">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								}
								if (value.series.userOptions.sapName==="period3"){
									s += '<br/> <span style="color:#7ACCB2;">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								}
								if (value.series.userOptions.sapName==="period4"){
									s += '<br/> <span style="color:#8FBD8F;">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								}
							});
							if (scope.showGeneration){
								var data = scope.filterDevices(pointData_ELEC_INTERVAL.points, 'SOLAR EXPORT')
								s += '<br/> <span style="color:#F2BF38;"> Solar export kWh: </span>' + $filter('number')(data.y, 2);
							}
							s += '<br/> <span style="color:#001b36;' + '">Reading Status: </span>' + $filter('capitalize')(chartData.statusCodeHalfHourlyValues[index]);

						} else {
							var a=0;
							s += '<b>' + Highcharts.dateFormat('%A, %b %e, %Y', this.x) + '</b>';
							index = (this.x - start) / ChartServer.DAY_INTERVAL;
							let pointData_DAY_INTERVAL = this;
							angular.forEach(pointData_DAY_INTERVAL.points, function (value, key) {
								//Console.log(key + ': ' + value);
								if (value.series.userOptions.sapName === "basePeriod") {
									s += '<br/> <span style="color:#002360;">' + value.series.name + ' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								}
								if (value.series.userOptions.sapName === "period2") {
									s += '<br/> <span style="color:#58B4FF;">' + value.series.name + ' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								}
								if (value.series.userOptions.sapName === "period3") {
									s += '<br/> <span style="color:#7ACCB2;">' + value.series.name + ' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								}
								if (value.series.userOptions.sapName === "period4") {
									s += '<br/> <span style="color:#8FBD8F;">' + value.series.name + ' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								}
							});
							s += '<br/> Total kWh: ' + $filter('number')(this.points[0].total, 2);

							if (scope.showGeneration) {
								var data = scope.filterDevices(pointData_DAY_INTERVAL.points, 'SOLAR EXPORT')
								s += '<br/> <span style="color:#F2BF38;"> Solar export kWh: </span>' + $filter('number')(data.y, 2);
							}
						}
						return s;
					};

					chart = new Highcharts.StockChart(scope.chart);
					ChartServer.responsifyChart(chart, DeviceMode.type, scope.titleText);
				}
			}, true);
			scope.$watch("mode", function (newValue) {
				if (newValue === "Consumption") {
					ChartServer.reflow(chart, scope.chart.chart.renderTo);
				}
			});
			scope.$watch("resize", function (newValue) {
				ChartServer.reflow(chart, scope.chart.chart.renderTo);
			});
			scope.$on(Events.INTERVAL_DOWNLOAD, function (event, message) {
				chart.exportChart({
					type: message.type
				});
			});
			scope.$on(Events.INTERVAL_PRINT, function (event, message) {
				chart.print();
			});
			scope.$on(Events.INTERVAL_EMAIL, function (event, message) {
				chart.emailChart(message,
					{ type: message.downloadFormat });
			});
			scope.$on(Events.DEVICE_CHANGE, function (event, message) {
				ChartServer.responsifyChart(chart, message, scope.titleText);
			});
		}
	};
});

angular.module('myaccount.route').directive('intervalDataGasConsumptionChart', function($filter, $log, ChartServer, DeviceMode, Events) {
	return {
		restrict: 'C',
		replace: true,
		scope: {
			chartData: '&',
			dirtyCheck: '=',
			chart: '=chart',
			chartValues: '@',
			goBackStartDate: '&',
			goBackEndDate: '&',
			goBackDevices: '&',
			dayInterval: '=',
			contractAccountNumber: '=',
			mode: '='
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

					ChartServer.modernizeChart(scope.chart);

					var interval = parseInt(scope.dayInterval, 10);

					var clickHandler = function(event) {
						scope.$apply(ChartServer.clickNavigator(this.x, interval));
					};

					var start = moment(chartData.startDate).valueOf();

					scope.titleText = scope.chart.yAxis[0].labels.title;

					scope.chart.series[0].data = chartData[scope.chartValues];
					scope.chart.plotOptions.series.point.events.click = clickHandler;
					scope.chart.plotOptions.series.pointStart = start;



					scope.chart.tooltip.formatter = function() {
						var s = '';
						var index = (this.x - start) / (interval === 0 ? ChartServer.GAS_INTERVAL : ChartServer.DAY_INTERVAL);
						if (interval === 0) {
							s += '<b>'+ Highcharts.dateFormat('%A, %b %e, %Y %H:%M', this.x) +'</b>';
							s += '<br/> <span style="color:' + scope.chart.series[0].color + '">GJ: </span>' + $filter('number')(this.points[0].y, 3);
							s += '<br/> <span style="color:' + scope.chart.series[0].color + '">GJ (Cumulative): </span>' + $filter('number')(chartData.cumulativeGjHourlyValues[index], 3);
							s += '<br/> <span style="color:' + scope.chart.series[0].color + '">Gas Reading Status: </span>' + $filter('capitalize')(chartData.readingTypeHourlyValues[index]);
						} else {
							s += '<b>'+ Highcharts.dateFormat('%A, %b %e, %Y', this.x) +'</b>';
							s += '<br/> <span style="color:' + scope.chart.series[0].color + '">GJ: </span>' + $filter('number')(this.points[0].y, 3);
							s += '<br/> <span style="color:limegreen;">HHV: </span>' + $filter('number')(chartData.hhvDailyValues[index], 3);
							s += '<br/> <span style="color:midnightblue;">Peak GJ: </span>' + $filter('number')(chartData.peakGjDailyValues[index], 3);
							s += '<br/> <span style="color:#001b36;">Load Factor: </span>' + $filter('number')(chartData.loadFactorDailyValues[index], 3);
							s += '<br/> <span style="color:#001b36;">Gas Reading Status: </span>' + $filter('capitalize')(chartData.readingTypeDailyValues[index]);
						}

						return s;
					};

					chart = new Highcharts.StockChart(scope.chart);
					ChartServer.responsifyChart(chart, DeviceMode.type, scope.titleText);
				}
			}, true);
			scope.$watch("mode", function(newValue){
				if (newValue === "Consumption") {
					ChartServer.reflow(chart, scope.chart.chart.renderTo);
				}
			});
			scope.$watch("resize", function(newValue){
				ChartServer.reflow(chart, scope.chart.chart.renderTo);
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
				ChartServer.responsifyChart(chart, message, scope.titleText);
			});
		}
	};
});

angular.module('myaccount.route').directive('dailyElecLoadProfileChart', function($filter, $log, ChartServer, DeviceMode, Events) {
	return {
		restrict: 'C',
		replace: true,
		scope: {
			chartData: '&',
			dirtyCheck: '=dirtyCheck',
			chart: '=chart',
			goBackStartDate: '&',
			goBackEndDate: '&',
			goBackDevices: '&',
			dayInterval: '=',
			contractAccountNumber: '=',
			mode: '='
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

					ChartServer.modernizeChart(scope.chart);

					var interval = parseInt(scope.dayInterval, 10);

					var clickHandler = function(event) {
						scope.$apply(ChartServer.clickNavigator(this.x, interval));
					};

					var start = moment(chartData.startDate).valueOf();

					var initialSelection = chartData.contractKwLimit ? 'KW' : 'KVAr';

					scope.titleText = scope.chart.yAxis[0].labels.title;

					var ohlcData = initialSelection === 'KW' ?
						ChartServer.ohlcList(start, interval, chartData.minKwDailyValues, chartData.maxKwDailyValues) :
						ChartServer.ohlcList(start, interval, chartData.minKvaDailyValues, chartData.maxKvaDailyValues);


					scope.chart.series[0].data = chartData.averageKvaDailyValues;
					scope.chart.series[0].visible = initialSelection === 'KVAr';
					scope.chart.series[1].data = chartData.averageKwDailyValues;
					scope.chart.series[1].visible = initialSelection === 'KW';
					scope.chart.series[2].data = ohlcData;
					scope.chart.series[2].name = initialSelection + ' Range';
					scope.chart.series[2].color = initialSelection === 'KW' ? scope.chart.series[1].color : scope.chart.series[0].color;

					scope.chart.plotOptions.series.point.events.click = clickHandler;
					scope.chart.plotOptions.spline.pointStart = start;
					scope.chart.plotOptions.series.pointStart = start;

					scope.chart.yAxis[0].plotLines = [{
						value: chartData[initialSelection === 'KW' ? 'contractKwLimit' : 'contractKvaLimit'],
						color: "#AA4643",
						dashStyle: 'shortdash',
						width: 2,
						label: {text: initialSelection + ' Limit'}
					}];




					scope.chart.tooltip.formatter = function() {

						var index = (this.x - start) / ChartServer.DAY_INTERVAL;
						var s = '<b>'+ Highcharts.dateFormat('%A, %b %e, %Y', this.x) +'</b>';

						s += '<br/> <span style="color:' + scope.chart.series[0].color + '">Min kVAr: </span>' + $filter('number')(chartData.minKvaDailyValues[index], 3);
						s += '<br/> <span style="color:' + scope.chart.series[0].color + '">Max kVAr: </span>' + $filter('number')(chartData.maxKvaDailyValues[index], 3);
						s += '<br/> <span style="color:' + scope.chart.series[0].color + '">Avg kVAr: </span>' + $filter('number')(chartData.averageKvaDailyValues[index], 3);
						s += '<br/> <span style="color:' + scope.chart.series[1].color + '">Max kW: </span>' + $filter('number')(chartData.maxKwDailyValues[index], 3);
						s += '<br/> <span style="color:' + scope.chart.series[1].color + '">Avg kW: </span>' + $filter('number')(chartData.averageKwDailyValues[index], 3);


						return s;
					};


					chart = new Highcharts.StockChart(scope.chart);
					ChartServer.responsifyChart(chart, DeviceMode.type, scope.titleText);
				}
			}, true);
			scope.$watch("mode", function(newValue){
				if (newValue === "Load Profile") {
					ChartServer.reflow(chart, scope.chart.chart.renderTo);
				}
			});
			scope.$watch("resize", function(newValue){
				ChartServer.reflow(chart, scope.chart.chart.renderTo);
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
				ChartServer.responsifyChart(chart, message, scope.titleText);
			});
		}
	};
});

angular.module('myaccount.route').directive('singleDayElecLoadProfileChart', function($filter, $log, ChartServer, DeviceMode, Events) {
	return {
		restrict: 'C',
		replace: true,
		scope: {
			chartData: '&',
			dirtyCheck: '=dirtyCheck',
			chart: '=chart',
			kvaValues: '@',
			kwValues: '@',
			powerFactorValues: '@',
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

					ChartServer.modernizeChart(scope.chart);

					var interval = parseInt(scope.dayInterval, 10);

					var clickHandler = function(event) {
						scope.$apply(ChartServer.clickNavigator(this.x, interval));
					};

					var start = moment(chartData.startDate).valueOf();
					var initialSelection = chartData.contractKwLimit ? 'KW' : 'KVAr';

					scope.titleText = scope.chart.yAxis[0].labels.title;

					scope.chart.series[0].data = chartData[scope.kvaValues];
					scope.chart.series[0].visible = initialSelection === 'KVAr';
					scope.chart.series[1].data = chartData[scope.kwValues];
					scope.chart.series[1].visible = initialSelection === 'KW';
					scope.chart.series[2].data = chartData[scope.powerFactorValues];
					scope.chart.plotOptions.series.point.events.click = clickHandler;
					scope.chart.plotOptions.series.pointStart = start;

					scope.chart.yAxis[0].plotLines = [{
						value: chartData[initialSelection === 'KW' ? 'contractKwLimit' : 'contractKvaLimit'],
						color: "#AA4643",
						dashStyle: 'shortdash',
						width: 2,
						label: {text: initialSelection + ' Limit'}
					}];

					if (interval === 0) {
						var date = chartData.startDate;
						var intervaldetails = scope.intervalDetails();
						var startD = new Date(chartData.startDate);
						var timezone = startD.getTimezoneOffset() / 60;
						var period2Hours = intervaldetails[0].period2Hours;
						var period2Start = Number(period2Hours.split('-')[0].substring(0, 2));
						var period2End = Number(period2Hours.split('-')[1].substring(0, 2));
						var fromTime = Date.UTC(startD.getFullYear(), startD.getMonth(), startD.getDate(), period2Start + timezone, 0, 0);
						var toTime = Date.UTC(startD.getFullYear(), startD.getMonth(), startD.getDate(), period2End + timezone, 0, 0);

						scope.chart.xAxis[0].plotBands = [
							{
								from: fromTime,
								to: toTime,
								color: '#cef5f5',
								label: {
									align: 'left',
									text: 'Peak period',
									style: {
										color: '#0099cc'
									}
								}
							}
						]
					}

					scope.chart.tooltip.formatter = function() {

						var index = (this.x - start) / ChartServer.ELEC_INTERVAL;
						var s = '<b>'+ Highcharts.dateFormat('%A, %b %e, %Y %H:%M', this.x) +'</b>';

						s += '<br/> <span style="color:' + scope.chart.series[1].color + '">KW: </span>' + $filter('number')(chartData[scope.kwValues][index], 3);
						s += '<br/> <span style="color:' + scope.chart.series[0].color + '">KVAr: </span>' + $filter('number')(chartData[scope.kvaValues][index], 3);
						s += '<br/> <span style="color:' + scope.chart.series[2].color + '">Power Factor: </span>' + $filter('number')(chartData[scope.powerFactorValues][index], 3);
						s += '<br/> <span style="color:#001b36;' + '">Reading Status: </span>' + $filter('capitalize')(chartData.statusCodeHalfHourlyValues[index]);


						return s;
					};

					chart = new Highcharts.StockChart(scope.chart);
					ChartServer.responsifyChart(chart, DeviceMode.type, scope.titleText);
				}
			}, true);
			scope.$watch("mode", function(newValue){
				if (newValue === "Load Profile") {
					ChartServer.reflow(chart, scope.chart.chart.renderTo);
				}
			});
			scope.$watch("resize", function(newValue){
				ChartServer.reflow(chart, scope.chart.chart.renderTo);
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
				ChartServer.responsifyChart(chart, message, scope.titleText);
			});
		}
	};
});

angular.module('myaccount.route').directive('loadProfileChart', function($filter, $log, ChartServer, DeviceMode, Events) {
	return {
		restrict: 'C',
		replace: true,
		scope: {
			chartData: '&',
			dirtyCheck: '=dirtyCheck',
			chart: '=chart',
			chartValues: '@',
			goBackStartDate: '&',
			goBackEndDate: '&',
			goBackDevices: '&',
			dayInterval: '=',
			contractAccountNumber: '=',
			mode: '='
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

					ChartServer.modernizeChart(scope.chart);

					var interval = parseInt(scope.dayInterval, 10);

					var clickHandler = function(event) {
						scope.$apply(ChartServer.clickNavigator(this.x, interval));
					};

					var start = moment(chartData.startDate).valueOf();

					scope.titleText = scope.chart.yAxis[0].labels.title;

					scope.chart.series[0].data = chartData[scope.chartValues];
					scope.chart.plotOptions.series.point.events.click = clickHandler;
					scope.chart.plotOptions.series.pointStart = start;

					scope.chart.tooltip.formatter = function() {
						var s = '';
						var index = (this.x - start) / (interval === 0 ? ChartServer.GAS_INTERVAL : ChartServer.DAY_INTERVAL);
						if (interval === 0) {
							s += '<b>'+ Highcharts.dateFormat('%A, %b %e, %Y %H:%M', this.x) +'</b>';
							s += '<br/> <span style="color:' + scope.chart.series[0].color + '">GJ: </span>' + $filter('number')(this.points[0].y, 3);
							s += '<br/> <span style="color:' + scope.chart.series[0].color + '">GJ (Cumulative): </span>' + $filter('number')(chartData.cumulativeGjHourlyValues[index], 3);
							s += '<br/><span style="color:' + scope.chart.series[0].color + '">Gas Reading Status: </span>' + $filter('capitalize')(chartData.readingTypeHourlyValues[index]);
						} else {
							s += '<b>'+ Highcharts.dateFormat('%A, %b %e, %Y', this.x) +'</b>';
							s += '<br/> <span style="color:' + scope.chart.series[0].color + '">GJ: </span>' + $filter('number')(this.points[0].y, 3);
							s += '<br/> <span style="color:#001b36;">Gas Reading Code: </span>' + $filter('capitalize')(chartData.readingTypeDailyValues[index]);
						}

						return s;
					};

					chart = new Highcharts.StockChart(scope.chart);
					ChartServer.responsifyChart(chart, DeviceMode.type, scope.titleText);
				}
			}, true);
			scope.$watch("mode", function(newValue){
				if (newValue === "Load Profile") {
					ChartServer.reflow(chart, scope.chart.chart.renderTo);
				}
			});
			scope.$watch("resize", function(newValue){
				ChartServer.reflow(chart, scope.chart.chart.renderTo);
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
				ChartServer.responsifyChart(chart, message, scope.titleText);
			});
		}
	};
});

angular.module('myaccount.route').directive('powerFactorChart', function($filter, $log, ChartServer, DeviceMode, Events) {
	return {
		restrict: 'C',
		replace: true,
		scope: {
			chartData: '&',
			dirtyCheck: '=dirtyCheck',
			chart: '=chart',
			chartValues: '@',
			goBackStartDate: '&',
			goBackEndDate: '&',
			goBackDevices: '&',
			dayInterval: '=',
			contractAccountNumber: '=',
			mode: '='
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

					ChartServer.modernizeChart(scope.chart);

					var interval = parseInt(scope.dayInterval, 10);

					var clickHandler = function(event) {
						scope.$apply(ChartServer.clickNavigator(this.x, interval));
					};

					var start = moment(chartData.startDate).valueOf();
					scope.titleText = scope.chart.yAxis[0].labels.title;

					scope.chart.series[0].data = chartData[scope.chartValues];
					scope.chart.plotOptions.series.point.events.click = clickHandler;
					scope.chart.plotOptions.series.pointStart = start;

					if (interval > 0) {
						var ohlcData = ChartServer.ohlcList(start, interval, chartData.minPowerFactorDailyValues, chartData.maxPowerFactorDailyValues);
						scope.chart.series[1].data = ohlcData;
					}

					if (chartData.contractPowerFactorLimit) {
						scope.chart.yAxis[0].plotLines = [{
							value: chartData.contractPowerFactorLimit,
							color: '#AA4643',
							dashStyle: 'shortdash',
							width: 2,
							label: {text: 'PF Limit'}
						}];
					}

					scope.chart.tooltip.formatter = function() {
						var index;

						var s = '';

						if (interval === 0) {
							s += '<b>'+ Highcharts.dateFormat('%A, %b %e, %Y %H:%M', this.x) +'</b>';
							index = (this.x - start) / ChartServer.ELEC_INTERVAL;
							s += '<br/> <span style="color:lightblue">KW: </span>' + $filter('number')(chartData.kwHalfHourlyValues[index], 3);
							s += '<br/> <span style="color:limegreen">KVAr: </span>' + $filter('number')(chartData.kvaHalfHourlyValues[index], 3);
							s += '<br/> <span style="color:' + scope.chart.series[0].color + '">Power Factor: </span>' + $filter('number')(chartData.powerFactorHalfHourlyValues[index], 3);
							s += '<br/> <span style="color:#001b36;">Reading Status: </span>' + $filter('capitalize')(chartData.statusCodeHalfHourlyValues[index]);
						} else {
							s += '<b>'+ Highcharts.dateFormat('%A, %b %e, %Y', this.x) +'</b>';
							index = (this.x - start) / ChartServer.DAY_INTERVAL;
							s += '<br/> <span style="color:magenta;">PF Min: </span>' + $filter('number')(chartData.minPowerFactorDailyValues[index], 3);
							s += '<br/> <span style="color:magenta;">PF Max: </span>' + $filter('number')(chartData.maxPowerFactorDailyValues[index], 3);
							s += '<br/> <span style="color:magenta;">PF Average: </span>' + $filter('number')(chartData.averagePowerFactorDailyValues[index], 3);
							s += '<br/> <span style="color:magenta;">PF @ Max kWh: </span>' + $filter('number')(chartData.powerFactorAtMaxKwDailyValues[index], 3);
							s += '<br/> <span style="color:lightgreen;">Max kW: </span>' + $filter('number')(chartData.maxKwDailyValues[index], 3);
						}

						return s;
					};

					chart = new Highcharts.StockChart(scope.chart);
					ChartServer.responsifyChart(chart, DeviceMode.type, scope.titleText);
				}
			}, true);
			scope.$watch("mode", function(newValue){
				if (newValue === "Power Factor") {
					ChartServer.reflow(chart, scope.chart.chart.renderTo);
				}
			});
			scope.$watch("resize", function(newValue){
				ChartServer.reflow(chart, scope.chart.chart.renderTo);
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
				ChartServer.responsifyChart(chart, message, scope.titleText);
			});
		}
	};
});

angular.module('myaccount.route').directive('loadFactorChart', function($log, ChartServer, DeviceMode, Events) {
	return {
		restrict: 'C',
		replace: true,
		scope: {
			chartData: '&',
			dirtyCheck: '=dirtyCheck',
			chart: '=chart',
			chartValues: '@',
			goBackStartDate: '&',
			goBackEndDate: '&',
			goBackDevices: '&',
			dayInterval: '=',
			contractAccountNumber: '=',
			mode: '='
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

					ChartServer.modernizeChart(scope.chart);

					var interval = parseInt(scope.dayInterval, 10);

					var clickHandler = function(event) {
						scope.$apply(ChartServer.clickNavigator(this.x, interval));
					};

					var start = moment(chartData.startDate).valueOf();

					scope.titleText = scope.chart.yAxis[0].labels.title;

					scope.chart.series[0].data = chartData[scope.chartValues];
					scope.chart.plotOptions.series.point.events.click = clickHandler;
					scope.chart.plotOptions.series.pointStart = start;

					chart = new Highcharts.StockChart(scope.chart);
					ChartServer.responsifyChart(chart, DeviceMode.type, scope.titleText);
				}
			}, true);
			scope.$watch("mode", function(newValue){
				if (newValue === "Load Factor") {
					ChartServer.reflow(chart, scope.chart.chart.renderTo);
				}
			});
			scope.$watch("resize", function(newValue){
				ChartServer.reflow(chart, scope.chart.chart.renderTo);
			});
			scope.$on(Events.INTERVAL_DOWNLOAD, function(event, message){
				chart.emailChart( message,
					{ type: message.downloadFormat });
			});
			scope.$on(Events.INTERVAL_PRINT, function(event, message){
				chart.print();
			});
			scope.$on(Events.INTERVAL_EMAIL, function(event, message){
				chart.emailChart( message,
					{ type: message.downloadFormat });
			});
			scope.$on(Events.DEVICE_CHANGE, function(event, device){
				ChartServer.responsifyChart(chart, device, scope.titleText);
			});
		}
	};
});