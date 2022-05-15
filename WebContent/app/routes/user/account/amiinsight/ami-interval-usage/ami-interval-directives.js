// TODO Refactor shared methods

angular.module('myaccount.route').directive('amiIntervalConsumptionChart', function($filter, $log, amiIntervalChartServer, DeviceMode, Events) {
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

			var billunbilledData = function (startDate, unbilledStartDate, value, chartData, scope, index, period) {

				var data = {
					unbilledbasePeriod: [],
					billedbasePeriod: [],
					billedbase: "",
					unbilledbase: "",
					billedbase2: "",
					unbilledbase2: "",
					billedbase3: "",
					unbilledbase3: "",
					billedbase4: "",
					unbilledbase4: ""
				}
				if (period==='basePeriod'){
					data.billedbase = value.billedbase === 'Off Peak' ? value.billedbase : "";
					if (startDate >= unbilledStartDate) {
						data.unbilledbasePeriod = chartData[scope.offPeakValues][index];
						data.billedbasePeriod = 0;
						data.unbilledbase = 'Unbilled Off Peak';
					} else {
						data.billedbasePeriod = chartData[scope.offPeakValues][index];
						data.unbilledbasePeriod = 0;
						data.billedbase = 'Off Peak';
					}
				} else if (period==='period2') {
					data.billedbase2 = value.billedbase2 === 'Peak' ? value.billedbase2 : "";
					if (startDate >= unbilledStartDate) {
						data.unbilledbasePeriod = chartData[scope.peakValues][index];
						data.billedbasePeriod = 0;
						data.unbilledbase2 = 'Unbilled Peak';
					} else {
						data.billedbasePeriod = chartData[scope.peakValues][index];
						data.unbilledbasePeriod = 0;
						data.billedbase2 = 'Peak';
					}
				} else if (period==='period3') {
					data.billedbase3 = value.billedbase3 === 'Super OffPeak' ? value.billedbase3 : "";
					if (startDate >= unbilledStartDate) {
						data.unbilledbasePeriod = chartData[scope.weekdayShoulderValues][index];
						data.billedbasePeriod = 0;
						data.unbilledbase3 = 'Unbilled Super OffPeak';
					} else {
						data.billedbasePeriod = chartData[scope.weekdayShoulderValues][index];
						data.unbilledbasePeriod = 0;
						data.billedbase3 = 'Super OffPeak';
					}
				} else if (period==='period4') {
					data.billedbase4 = value.billedbase === 'period4' ? value.billedbase4 : "";
					if (startDate >= unbilledStartDate) {
						data.unbilledbasePeriod = chartData[scope.weekendShoulderValues][index];
						data.billedbasePeriod = 0;
						data.unbilledbase4 = 'Unbilled WeekendShoulder';
					} else {
						data.billedbasePeriod = chartData[scope.weekendShoulderValues][index];
						data.unbilledbasePeriod = 0;
						data.billedbase4 = 'WeekendShoulder';
					}
				}
				return data;
			}

			var chart = new Highcharts.StockChart(scope.chart);

			scope.$watch("dirtyCheck", function (newValue) {
				if (newValue) {
					var chartData = scope.chartData();
					amiIntervalChartServer.modernizeChart(scope.chart);

					var interval = parseInt(scope.dayInterval, 10);

					var clickHandler = function(event) {
						scope.$apply(amiIntervalChartServer.clickNavigator(this.x, interval));
					};

					var start = moment(chartData.startDate).valueOf();

					scope.titleText = scope.chart.yAxis[0].labels.title;

					var tempArr = [];

					if (interval === 0) {
						var y = 0;
						var unbilledbasePeriod=0;
						var billedbasePeriod =0;

						var startDate = moment(chartData.startDate).toDate();
						var endDate = moment(chartData.endDate).toDate();
						var unbilledStartDate = moment(chartData.unbilledStartDate).toDate();
						var value = chartData.retrieveIntervalDetails[0];
						if (chartData.retrieveIntervalDetails[0].basePeriod !== "") {
							chartData.retrieveIntervalDetails[0].billedbase = chartData.retrieveIntervalDetails[0].billedbase === 'Off Peak' ? chartData.retrieveIntervalDetails[0].billedbase : "";
							if (startDate >= unbilledStartDate) {
								unbilledbasePeriod = chartData[scope.offPeakValues];
								billedbasePeriod = 0;
								chartData.retrieveIntervalDetails[0].unbilledbase = 'Unbilled Off Peak';
							} else {
								billedbasePeriod = chartData[scope.offPeakValues];
								unbilledbasePeriod = 0;
								chartData.retrieveIntervalDetails[0].billedbase = 'Off Peak';
							}
							var itemsToAdd = [];
							if (chartData.retrieveIntervalDetails[0].unbilledbase) {
								itemsToAdd = [];
								itemsToAdd.sapName = 'basePeriod';
								itemsToAdd.id = 'offPeakKwhValues';
								itemsToAdd.name = "UNBILLED " + chartData.retrieveIntervalDetails[0].basePeriod;
								itemsToAdd.color = '#374049';
								itemsToAdd.showInLegend = true;
								itemsToAdd.index = 3;
								itemsToAdd.legendIndex = 0;
								scope.chart.series.push(itemsToAdd);
								scope.chart.series[y].data = unbilledbasePeriod;
								y++;
							}
							if (chartData.retrieveIntervalDetails[0].billedbase) {
								itemsToAdd = [];
								itemsToAdd.sapName = 'basePeriod';
								itemsToAdd.id = 'offPeakKwhValues';
								itemsToAdd.name = chartData.retrieveIntervalDetails[0].basePeriod;
								itemsToAdd.color = chartData.retrieveIntervalDetails[0].basePeriod === 'OFF PEAK' || chartData.retrieveIntervalDetails[0].basePeriod === 'STANDARD HOME' ? '#002060' : '#002360';
								itemsToAdd.showInLegend = true;
								itemsToAdd.index = 3;
								itemsToAdd.legendIndex = 0;
								scope.chart.series.push(itemsToAdd);
								scope.chart.series[y].data = billedbasePeriod;
								y++;
							}
						}
						if (chartData.retrieveIntervalDetails[0].period2 !== "") {

							chartData.retrieveIntervalDetails[0].billedbase = chartData.retrieveIntervalDetails[0].billedbase === 'Peak' ? chartData.retrieveIntervalDetails[0].billedbase : "";
							if (startDate >= unbilledStartDate) {
								unbilledbasePeriod = chartData[scope.peakValues];
								billedbasePeriod = 0;
								chartData.retrieveIntervalDetails[0].unbilledbase = 'Unbilled Peak';
							} else {
								billedbasePeriod = chartData[scope.peakValues];
								unbilledbasePeriod = 0;
								chartData.retrieveIntervalDetails[0].billedbase = 'Peak';
							}
							var itemsToAdd = [];
							if (chartData.retrieveIntervalDetails[0].unbilledbase) {
								itemsToAdd = [];
								itemsToAdd.sapName = 'period2';
								itemsToAdd.id = 'peakKwhValues';
								itemsToAdd.name = "UNBILLED " + chartData.retrieveIntervalDetails[0].period2;
								itemsToAdd.color = '#000000';
								itemsToAdd.showInLegend = true;
								itemsToAdd.index = 3;
								itemsToAdd.legendIndex = 0;
								scope.chart.series.push(itemsToAdd);
								scope.chart.series[y].data = unbilledbasePeriod;
								y++;
							}
							if (chartData.retrieveIntervalDetails[0].billedbase) {
								itemsToAdd = [];
								itemsToAdd.sapName = 'period2';
								itemsToAdd.id = 'peakKwhValues';
								itemsToAdd.name = chartData.retrieveIntervalDetails[0].period2;
								itemsToAdd.color = chartData.retrieveIntervalDetails[0].basePeriod === 'PEAK' || chartData.retrieveIntervalDetails[0].basePeriod === 'STANDARD HOME' ? '#58b4ff' : '#58b4ff';
								itemsToAdd.showInLegend = true;
								itemsToAdd.index = 3;
								itemsToAdd.legendIndex = 0;
								scope.chart.series.push(itemsToAdd);
								scope.chart.series[y].data = billedbasePeriod;
								y++;
							}
						}
						if (chartData.retrieveIntervalDetails[0].period3 !== "") {
							chartData.retrieveIntervalDetails[0].billedbase = chartData.retrieveIntervalDetails[0].billedbase === 'Peak' ? chartData.retrieveIntervalDetails[0].billedbase : "";
							if (startDate >= unbilledStartDate) {
								unbilledbasePeriod = chartData[scope.weekdayShoulderValues];
								billedbasePeriod = 0;
								chartData.retrieveIntervalDetails[0].unbilledbase = 'Unbilled Super OffPeak';
							} else {
								billedbasePeriod = chartData[scope.weekdayShoulderValues];
								unbilledbasePeriod = 0;
								chartData.retrieveIntervalDetails[0].billedbase = 'Super OffPeak';
							}
							var itemsToAdd = [];
							if (chartData.retrieveIntervalDetails[0].unbilledbase) {
								itemsToAdd = [];
								itemsToAdd.sapName = 'period3';
								itemsToAdd.id = 'WeekdayShoulder';
								itemsToAdd.name ="UNBILLED "+ chartData.retrieveIntervalDetails[0].period3;
								itemsToAdd.color = '#535d6e';
								itemsToAdd.showInLegend = true;
								itemsToAdd.index = 3;
								itemsToAdd.legendIndex = 0;
								scope.chart.series.push(itemsToAdd);
								scope.chart.series[y].data = unbilledbasePeriod;
								y++;
							}
							if (chartData.retrieveIntervalDetails[0].billedbase) {
								itemsToAdd = [];
								itemsToAdd.sapName = 'period3';
								itemsToAdd.id = 'WeekdayShoulder';
								itemsToAdd.name = chartData.retrieveIntervalDetails[0].period3;
								itemsToAdd.color = chartData.retrieveIntervalDetails[0].period3 ==='SUPER OFFPEAK' ?'#55ae3a' :'#7ACCB2';
								itemsToAdd.showInLegend = true;
								itemsToAdd.index = 3;
								itemsToAdd.legendIndex = 0;
								scope.chart.series.push(itemsToAdd);
								scope.chart.series[y].data = billedbasePeriod;
								y++;
							}
						}
						if (chartData.retrieveIntervalDetails[0].period4 !== "") {
							chartData.retrieveIntervalDetails[0].billedbase = chartData.retrieveIntervalDetails[0].billedbase === 'WeekendShoulder' ? chartData.retrieveIntervalDetails[0].billedbase : "";
							if (startDate >= unbilledStartDate) {
								unbilledbasePeriod = chartData[scope.weekendShoulderValues];
								billedbasePeriod = 0;
								chartData.retrieveIntervalDetails[0].unbilledbase = 'Unbilled WeekendShoulder';
							} else {
								billedbasePeriod = chartData[scope.weekendShoulderValues];
								unbilledbasePeriod = 0;
								chartData.retrieveIntervalDetails[0].billedbase = 'WeekendShoulder';
							}

							var itemsToAdd = [];
							if (chartData.retrieveIntervalDetails[0].unbilledbase) {
								itemsToAdd = [];
								itemsToAdd.sapName = 'period4';
								itemsToAdd.id = 'WeekendShoulder';
								itemsToAdd.name = "UNBILLED " + chartData.retrieveIntervalDetails[0].period4;
								itemsToAdd.color = '#000000';
								itemsToAdd.showInLegend = true;
								itemsToAdd.index = 3;
								itemsToAdd.legendIndex = 0;
								scope.chart.series.push(itemsToAdd);
								scope.chart.series[y].data = unbilledbasePeriod;
								y++;
							}
							if (chartData.retrieveIntervalDetails[0].billedbase) {
								itemsToAdd = [];
								itemsToAdd.sapName = 'period4';
								itemsToAdd.id = 'WeekdayShoulder';
								itemsToAdd.name = chartData.retrieveIntervalDetails[0].period4;
								itemsToAdd.color = '#8FBD8F';
								itemsToAdd.showInLegend = true;
								itemsToAdd.index = 3;
								itemsToAdd.legendIndex = 0;
								scope.chart.series.push(itemsToAdd);
								scope.chart.series[y].data = billedbasePeriod;
								y++;
							}
						}
						if (scope.showGeneration) {
							var itemsToAdd = [];
							itemsToAdd.sapName = 'GenerationData';
							itemsToAdd.id = 'inlcudesGeneration';
							itemsToAdd.type = 'spline';
							itemsToAdd.name = 'SOLAR EXPORT';
							itemsToAdd.color = '#F2BF38';
							itemsToAdd.showInLegend = true;
							itemsToAdd.legendIndex = y;
							scope.chart.series.push(itemsToAdd);
							scope.chart.series[y].data = chartData[scope.generationValues]; // Generation data line on top of bar chart
						}
					} else {
						var x = 0;
						angular.forEach(chartData.retrieveIntervalDetails.reverse(), function (value, key) {
							var itemsTobasePeriod = [];
							var itemsToperiod2 = [];
							var itemsToperiod3 = [];
							var itemsToperiod4 = [];

							var billedbasePeriod = [];
							var unbilledbasePeriod = [];


							var billedbasePeriod2 = [];
							var unbilledbasePeriod2 = [];


							var billedbasePeriod3 = [];
							var unbilledbasePeriod3 = [];


							var billedbasePeriod4 = [];
							var unbilledbasePeriod4 = [];


							var productSwitchStartDate = moment(value.productSwitchStartDate).toDate();
							var productSwitchEndDate = moment(value.productSwitchEndDate).toDate();

							var startDate = moment(chartData.startDate).toDate();
							var endDate = moment(chartData.endDate).toDate();
							var unbilledStartDate = moment(chartData.unbilledStartDate).toDate();
							var i = 0;
							if (unbilledStartDate) {
								while (startDate < endDate) {
									if (productSwitchStartDate <= startDate && productSwitchEndDate >= startDate) {
										if (value.basePeriod) {
											var data = billunbilledData(startDate, unbilledStartDate, value, chartData, scope, i, "basePeriod");
											unbilledbasePeriod[i] = data.unbilledbasePeriod;
											billedbasePeriod[i] = data.billedbasePeriod;
											value.billedbase = data.billedbase;
											value.unbilledbase = data.unbilledbase;
										}
										if (value.period2) {
											var data = billunbilledData(startDate, unbilledStartDate, value, chartData, scope, i, "period2");
											unbilledbasePeriod2[i] = data.unbilledbasePeriod;
											billedbasePeriod2[i] = data.billedbasePeriod;
											value.billedbase2 = data.billedbase2;
											value.unbilledbase2 = data.unbilledbase2;
										}
										if (value.period3) {
											var data = billunbilledData(startDate, unbilledStartDate, value, chartData, scope, i, "period3");
											unbilledbasePeriod3[i] = data.unbilledbasePeriod;
											billedbasePeriod3[i] = data.billedbasePeriod;
											value.billedbase3 = data.billedbase3;
											value.unbilledbase3 = data.unbilledbase3;
										}
										if (value.period4) {
											var data = billunbilledData(startDate, unbilledStartDate, value, chartData, scope, i, "period4");
											unbilledbasePeriod4[i] = data.unbilledbasePeriod;
											billedbasePeriod4[i] = data.billedbasePeriod;
											value.billedbase4 = data.billedbase4;
											value.unbilledbase4 = data.unbilledbase4;
										}
									} else {
										unbilledbasePeriod[i] = 0;
										billedbasePeriod[i] = 0;
										unbilledbasePeriod2[i] = 0;
										billedbasePeriod2[i] = 0;
										unbilledbasePeriod3[i] = 0;
										billedbasePeriod3[i] = 0;
										unbilledbasePeriod4[i] = 0;
										billedbasePeriod4[i] = 0;
									}
									i++;
									startDate = moment(startDate).add(1, 'days').toDate();
								}
							}

							if (value.basePeriod !== "") {
								var itemsToAdd = [];
								if (value.unbilledbase !== "") {
									itemsToAdd = [];
									itemsToAdd.sapName = 'basePeriod';
									itemsToAdd.id = 'offPeakKwhValues';
									itemsToAdd.name = "UNBILLED " + value.basePeriod;
									itemsToAdd.color = '#374049';
									itemsToAdd.showInLegend = true;
									itemsToAdd.index = 0;
									itemsToAdd.legendIndex = 4;
									scope.chart.series.push(itemsToAdd);
									scope.chart.series[x].data = unbilledbasePeriod;
									x++;
								}
								if (value.billedbase !== "") {
									itemsToAdd = [];
									itemsToAdd.sapName = 'basePeriod';
									itemsToAdd.id = 'offPeakKwhValues';
									itemsToAdd.name = value.basePeriod;
									itemsToAdd.color =value.basePeriod==='OFF PEAK'||value.basePeriod==='STANDARD HOME'?'#002060':'#002360';
									itemsToAdd.showInLegend = true;
									itemsToAdd.index = 0;
									itemsToAdd.legendIndex = 0;
									scope.chart.series.push(itemsToAdd);
									scope.chart.series[x].data = billedbasePeriod;
									x++;
								}
							}
							if (value.period2 !== "") {
								var itemsToAdd = [];
								if (value.unbilledbase2 !== "") {
									itemsToAdd = [];
									itemsToAdd.sapName = 'period2';
									itemsToAdd.id = 'peakKwhValues';
									itemsToAdd.name = "UNBILLED " + value.period2 ;
									itemsToAdd.color = '#000000';
									itemsToAdd.showInLegend = true;
									itemsToAdd.index = 1;
									itemsToAdd.legendIndex = 5;
									scope.chart.series.push(itemsToAdd);
									scope.chart.series[x].data = unbilledbasePeriod2;
									x++;
								}
								if (value.billedbase2 !== "") {
									itemsToAdd = [];
									itemsToAdd.sapName = 'period2';
									itemsToAdd.id = 'peakKwhValues';
									itemsToAdd.name = value.period2;
									itemsToAdd.color = value.period2==='PEAK'||value.period2==='EV OFF PEAK'?'#58b4ff':'#58B4FF';
									itemsToAdd.showInLegend = true;
									itemsToAdd.index = 1;
									itemsToAdd.legendIndex = 1;
									scope.chart.series.push(itemsToAdd);
									scope.chart.series[x].data = billedbasePeriod2;
									x++;
								}
							}
							if (value.period3 !== "") {
								var itemsToAdd = [];
								if (value.unbilledbase3 !== "") {
									itemsToAdd = [];
									itemsToAdd.sapName = 'period3';
									itemsToAdd.id = 'WeekdayShoulder';
									itemsToAdd.name = "UNBILLED " + value.period3 ;
									itemsToAdd.color = '#535d6e';
									itemsToAdd.showInLegend = true;
									itemsToAdd.index = 2;
									itemsToAdd.legendIndex = 6;
									scope.chart.series.push(itemsToAdd);
									scope.chart.series[x].data = unbilledbasePeriod3;
									x++;
								}
								if (value.billedbase3 !== "") {
									itemsToAdd = [];
									itemsToAdd.sapName = 'period3';
									itemsToAdd.id = 'WeekdayShoulder';
									itemsToAdd.name =value.period3;
									itemsToAdd.color = value.period3 ==='SUPER OFFPEAK' ?'#55ae3a' :'#7ACCB2';
									itemsToAdd.showInLegend = true;
									itemsToAdd.index = 2;
									itemsToAdd.legendIndex = 2;
									scope.chart.series.push(itemsToAdd);
									scope.chart.series[x].data = billedbasePeriod3;
									x++;
								}
							}
							if (value.period4 !== "") {
								var itemsToAdd = [];
								if (value.unbilledbase4 !== "") {
									itemsToAdd = [];
									itemsToAdd.sapName = 'period4';
									itemsToAdd.id = 'WeekendShoulder';
									itemsToAdd.name = "UNBILLED " + value.period4;
									itemsToAdd.color = '#798ea3';
									itemsToAdd.showInLegend = true;
									itemsToAdd.index = 3;
									itemsToAdd.legendIndex = 7;
									scope.chart.series.push(itemsToAdd);
									scope.chart.series[x].data = unbilledbasePeriod4;
									x++;
								}
								if (value.billedbase4 !== "") {
									itemsToAdd = [];
									itemsToAdd.sapName = 'period4';
									itemsToAdd.id = 'WeekendShoulder';
									itemsToAdd.name = value.period4;
									itemsToAdd.color = '#8FBD8F';
									itemsToAdd.showInLegend = true;
									itemsToAdd.index = 3;
									itemsToAdd.legendIndex = 3;
									scope.chart.series.push(itemsToAdd);
									scope.chart.series[x].data = billedbasePeriod4;
									x++;
								}
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
							itemsToAdd.legendIndex = 8;
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
							index = (this.x - start) / amiIntervalChartServer.ELEC_INTERVAL;
							var pointData_ELEC_INTERVAL = this;
							angular.forEach(pointData_ELEC_INTERVAL.points, function(value, key) {
								if (value.series.userOptions.sapName==="basePeriod" && value.series.name.toLowerCase().indexOf('unbilled')>=0){
									s += '<br/> <span style="color:#374049;">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								} else if (value.series.userOptions.sapName==="basePeriod" && (value.series.name==="OFF PEAK"||value.series.name==="EV OFF PEAK")){
									s += '<br/> <span style="color:#002360;">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								} else if (value.series.userOptions.sapName==="basePeriod" && value.series.name==="PEAK"||value.series.name==="STANDARD HOME"){
									s += '<br/> <span style="color:#58B4FF;">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								} else if (value.series.userOptions.sapName==="basePeriod"){
									s += '<br/> <span style="color:#002360;">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								}

								if (value.series.userOptions.sapName==="period2" && value.series.name.toLowerCase().indexOf('unbilled')>=0){
									s += '<br/> <span style="color:#000000;">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								} else if (value.series.userOptions.sapName==="period2" && (value.series.name==="OFF PEAK"||value.series.name==="EV OFF PEAK")){
									s += '<br/> <span style="color:#002360;">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								} else if (value.series.userOptions.sapName==="period2" && (value.series.name==="PEAK"||value.series.name==="STANDARD HOME")){
									s += '<br/> <span style="color:#58B4FF;">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								} else if (value.series.userOptions.sapName==="period2"){
									s += '<br/> <span style="color:#58B4FF;">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								}

								if (value.series.userOptions.sapName==="period3" && value.series.name.toLowerCase().indexOf('unbilled')>=0){
									s += '<br/> <span style="color:#535d6e">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								} else if (value.series.userOptions.sapName==="period3"){
									s += '<br/> <span style="color:#7ACCB2;">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								}

								if (value.series.userOptions.sapName==="period4" && value.series.name.toLowerCase().indexOf('unbilled')>=0){
									s += '<br/> <span style="color:#798ea3">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								} else if (value.series.userOptions.sapName==="period4"){
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
							index = (this.x - start) / amiIntervalChartServer.DAY_INTERVAL;
							var pointData_DAY_INTERVAL = this;
							angular.forEach(pointData_DAY_INTERVAL.points, function (value, key) {
								if (value.y <= 0){
									return;
								}
								if (value.series.userOptions.sapName==="basePeriod" && value.series.name.toLowerCase().indexOf('unbilled')>=0){
									s += '<br/> <span style="color:#374049">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								} else if (value.series.userOptions.sapName==="basePeriod" && (value.series.name==="OFF PEAK"||value.series.name==="EV OFF PEAK")){
									s += '<br/> <span style="color:#002360;">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								} else if (value.series.userOptions.sapName==="basePeriod" && (value.series.name==="PEAK"||value.series.name==="STANDARD HOME")){
									s += '<br/> <span style="color:#58B4FF;">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								} else if (value.series.userOptions.sapName==="basePeriod"){
									s += '<br/> <span style="color:#002360;">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								}

								if (value.series.userOptions.sapName==="period2" && value.series.name.toLowerCase().indexOf('unbilled')>=0){
									s += '<br/> <span style="color:#000000">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								} else if (value.series.userOptions.sapName==="period2" && (value.series.name==="OFF PEAK"||value.series.name==="EV OFF PEAK")){
									s += '<br/> <span style="color:#002360;">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								} else if (value.series.userOptions.sapName==="period2" && (value.series.name==="PEAK"||value.series.name==="STANDARD HOME")){
									s += '<br/> <span style="color:#58B4FF;">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								} else if (value.series.userOptions.sapName==="period2"){
									s += '<br/> <span style="color:#58B4FF;">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								}


								if (value.series.userOptions.sapName==="period3" && value.series.name.toLowerCase().indexOf('unbilled')>=0){
									s += '<br/> <span style="color:#535d6e">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								} else if (value.series.userOptions.sapName==="period3" && value.series.name==="SUPER OFFPEAK"){
									s += '<br/> <span style="color:#55ae3a">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								} else if (value.series.userOptions.sapName === "period3") {
									s += '<br/> <span style="color:#7ACCB2;">' + value.series.name + ' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								}

								if (value.series.userOptions.sapName==="period4" && value.series.name.toLowerCase().indexOf('unbilled')>=0){
									s += '<br/> <span style="color:#798ea3">'+value.series.name+' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								} else if (value.series.userOptions.sapName === "period4") {
									s += '<br/> <span style="color:#8FBD8F;">' + value.series.name + ' kWh: </span>' + (value.series.name === value.series.userOptions.name ? $filter('number')(value.y, 2) : "N/A");
								}
							});

							s += '<br/> Total kWh: ' + $filter('number')(this.points[0].total, 2);

							if (scope.showGeneration) {
								var data = scope.filterDevices(pointData_DAY_INTERVAL.points, 'SOLAR EXPORT');
								s += '<br/> <span style="color:#F2BF38;"> Solar export kWh: </span>' + $filter('number')(data.y, 2);
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
					amiIntervalChartServer.responsifyChart(chart, DeviceMode.type, scope.titleText);
				}
			}, true);
			scope.$watch("mode", function(newValue){
				if (newValue === "Consumption") {
					amiIntervalChartServer.reflow(chart, scope.chart.chart.renderTo);
				}
			});
			scope.$watch("resize", function(newValue){
				amiIntervalChartServer.reflow(chart, scope.chart.chart.renderTo);
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
				amiIntervalChartServer.responsifyChart(chart, message, scope.titleText);
			});
		}
	};
});

