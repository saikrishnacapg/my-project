// TODO Refactor shared methods

angular.module('myaccount.route').directive('solarConsumptionChart', function($filter, $log, solarChartServer, DeviceMode, Events) {

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
					solarChartServer.modernizeChart(scope.chart);

					var interval = parseInt(scope.dayInterval, 10);

					var clickHandler = function(event) {
						scope.$apply(solarChartServer.clickNavigator(this.x, interval));
					};

					var start = moment(chartData.startDate).valueOf();

					scope.titleText = scope.chart.yAxis[0].labels.title;

					var tempArr = [];

					if (interval===0) {
						if (chartData.retrieveIntervalDetails[0].basePeriod !== "") {
							var itemsToAdd = [];
							itemsToAdd.sapName = 'basePeriod';
							itemsToAdd.id = 'offPeakKwhValues';
							itemsToAdd.name = chartData.retrieveIntervalDetails[0].basePeriod;
							itemsToAdd.color = chartData.retrieveIntervalDetails[0].basePeriod==='PEAK'||chartData.retrieveIntervalDetails[0].basePeriod==='STANDARD HOME'?'#58B4FF':'#002360';
							itemsToAdd.showInLegend = true;
							itemsToAdd.index = 3;
							itemsToAdd.legendIndex = 0;
							scope.chart.series.push(itemsToAdd);
							scope.chart.series[0].data = chartData[scope.offPeakValues];
						}
						if (chartData.retrieveIntervalDetails[0].period2 !== "") {
							var itemsToAdd = [];
							itemsToAdd.sapName = 'period2';
							itemsToAdd.id = 'peakKwhValues';
							itemsToAdd.name = chartData.retrieveIntervalDetails[0].period2;
							itemsToAdd.color = chartData.retrieveIntervalDetails[0].period2==='OFF PEAK'||chartData.retrieveIntervalDetails[0].period2==='EV OFF PEAK'?'#002360':'#58B4FF';
							itemsToAdd.showInLegend = true;
							itemsToAdd.index = 0;
							itemsToAdd.legendIndex = 3;
							scope.chart.series.push(itemsToAdd);
							scope.chart.series[1].data = chartData[scope.peakValues];
						} else {
							var itemsToAdd = [];
							itemsToAdd.sapName = 'period2';
							itemsToAdd.id = 'peakKwhValues';
							itemsToAdd.name = 'Peak Kwh';
							itemsToAdd.color = '#58B4FF';
							itemsToAdd.showInLegend = false;
							itemsToAdd.index = 0;
							itemsToAdd.legendIndex = 3;
							scope.chart.series.push(itemsToAdd);
						}
						if (chartData.retrieveIntervalDetails[0].period3 !== "") {
							var itemsToAdd = [];
							itemsToAdd.sapName = 'period3';
							itemsToAdd.id = 'WeekdayShoulder';
							itemsToAdd.name = chartData.retrieveIntervalDetails[0].period3;
							itemsToAdd.color = '#7ACCB2';
							itemsToAdd.showInLegend = true;
							itemsToAdd.index = 1;
							itemsToAdd.legendIndex = 1;
							scope.chart.series.push(itemsToAdd);
							scope.chart.series[2].data = chartData[scope.weekdayShoulderValues];
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
						}
						if (chartData.retrieveIntervalDetails[0].period4 !== "") {
							var itemsToAdd = [];
							itemsToAdd.sapName = 'period4';
							itemsToAdd.id = 'WeekendShoulder';
							itemsToAdd.name = chartData.retrieveIntervalDetails[0].period4;
							itemsToAdd.color = '#8FBD8F';
							itemsToAdd.showInLegend = true;
							itemsToAdd.index = 2;
							itemsToAdd.legendIndex = 2;
							scope.chart.series.push(itemsToAdd);
							scope.chart.series[3].data = chartData[scope.weekendShoulderValues];
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
						}
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
									itemsTobasePeriod[i] = chartData[scope.offPeakValues][i]
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
								itemsToAdd.color = value.basePeriod==='PEAK'||value.basePeriod==='STANDARD HOME'?'#58B4FF':'#002360';
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
								itemsToAdd.color = value.period2==='OFF PEAK'||value.period2==='EV OFF PEAK'?'#002360':'#58B4FF';
								itemsToAdd.showInLegend = true;
								itemsToAdd.index = 0;
								itemsToAdd.legendIndex = 1;
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
								itemsToAdd.legendIndex = 1;
								scope.chart.series.push(itemsToAdd);
								x++;
							}
							if (value.period3 !== "") {
								var itemsToAdd = [];
								itemsToAdd.sapName = 'period3';
								itemsToAdd.id = 'WeekdayShoulder';
								itemsToAdd.name = value.period3;
								itemsToAdd.color = value.period3 ==='SUPER OFFPEAK' ?'#55ae3a' :'#7ACCB2';
								itemsToAdd.showInLegend = true;
								itemsToAdd.index = 1;
								itemsToAdd.legendIndex = 2;
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
								itemsToAdd.legendIndex = 2;
								scope.chart.series.push(itemsToAdd);
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
								itemsToAdd.legendIndex = 3;
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
								itemsToAdd.legendIndex = 3;
								scope.chart.series.push(itemsToAdd);
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
						var intervaldetails = chartData.retrieveIntervalDetails;//Scope.intervalDetails();
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

					scope.chart.tooltip.formatter = function() {
						var index;

						var s = '';
						if (interval === 0) {
							s += '<b>'+ Highcharts.dateFormat('%A, %b %e, %Y %H:%M', this.x) +'</b>';
							index = (this.x - start) / solarChartServer.ELEC_INTERVAL;
							pointData_ELEC_INTERVAL = this;
							angular.forEach(pointData_ELEC_INTERVAL.points, function(value, key) {
								//Console.log(key + ': ' + value);
								if (value.series.userOptions.sapName==="basePeriod" && (value.series.name==="OFF PEAK"||value.series.name==="EV OFF PEAK")){
									s += '<br/> <span style="color:#002360;">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								} else if (value.series.userOptions.sapName==="basePeriod" && value.series.name==="PEAK"||value.series.name==="STANDARD HOME"){
									s += '<br/> <span style="color:#58B4FF;">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								} else if (value.series.userOptions.sapName==="basePeriod"){
									s += '<br/> <span style="color:#002360;">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								}

								if (value.series.userOptions.sapName==="period2" && (value.series.name==="OFF PEAK"||value.series.name==="EV OFF PEAK")){
									s += '<br/> <span style="color:#002360;">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								} else if (value.series.userOptions.sapName==="period2" && (value.series.name==="PEAK"||value.series.name==="STANDARD HOME")){
									s += '<br/> <span style="color:#58B4FF;">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								} else if (value.series.userOptions.sapName==="period2"){
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
								s += '<br/> <span style="color:#F2BF38;" fill-opacity="1"> Solar export kWh: </span>' + $filter('number')(data.y, 2);
							}
							/*S += '<br/>' + ' <span style="color:#001b36;' + '">Reading Status: </span>' + $filter('capitalize')(chartData.statusCodeHalfHourlyValues[index]);*/
						} else {
							s += '<b>' + Highcharts.dateFormat('%A, %b %e, %Y', this.x) + '</b>';
							index = (this.x - start) / solarChartServer.DAY_INTERVAL;
							var pointData_DAY_INTERVAL = this;
							angular.forEach(pointData_DAY_INTERVAL.points, function (value, key) {
								//Console.log(key + ': ' + value);

								if (value.series.userOptions.sapName==="basePeriod" && (value.series.name==="OFF PEAK"||value.series.name==="EV OFF PEAK")){
									s += '<br/> <span style="color:#002360;">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								} else if (value.series.userOptions.sapName==="basePeriod" && (value.series.name==="PEAK"||value.series.name==="STANDARD HOME")){
									s += '<br/> <span style="color:#58B4FF;">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								} else if (value.series.userOptions.sapName==="basePeriod"){
									s += '<br/> <span style="color:#002360;">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								}
								/* If (value.series.userOptions.sapName == "basePeriod") {
                                    s += '<br/>' + ' <span style="color:#002360;">' + value.series.name + ' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
                                }*/

								if (value.series.userOptions.sapName==="period2" && (value.series.name==="OFF PEAK"||value.series.name==="EV OFF PEAK")){
									s += '<br/> <span style="color:#002360;">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								} else if (value.series.userOptions.sapName==="period2" && (value.series.name==="PEAK"||value.series.name==="STANDARD HOME")){
									s += '<br/> <span style="color:#58B4FF;">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								} else if (value.series.userOptions.sapName==="period2"){
									s += '<br/> <span style="color:#58B4FF;">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								}
								/* If (value.series.userOptions.sapName == "period2") {
                                    s += '<br/>' + ' <span style="color:#58B4FF;">' + value.series.name + ' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
                                }*/


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
								s += '<br/>  <span style="color:#F2BF38;"> Solar export kWh: </span>' + $filter('number')(data.y, 2);
							}
						}

						return s;
					};
					var windowWidth = $(window).width();
					if (windowWidth < 640) {
						scope.chart.legend.verticalAlign = "bottom";
						scope.chart.legend.margin = 10;
						scope.chart.legend.align = "center";
						scope.chart.legend.floating = false;
					}
					chart = new Highcharts.StockChart(scope.chart);
					solarChartServer.responsifyChart(chart, DeviceMode.type, scope.titleText);
				}
			}, true);
			scope.$watch("mode", function(newValue){
				if (newValue === "Consumption") {
					solarChartServer.reflow(chart, scope.chart.chart.renderTo);
				}
			});
			scope.$watch("resize", function(newValue){
				solarChartServer.reflow(chart, scope.chart.chart.renderTo);
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
				solarChartServer.responsifyChart(chart, message, scope.titleText);
			});
		}
	};
});

