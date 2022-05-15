angular.module('myaccount.route').directive('syConsumptionChart', function ($log, DeviceMode, $filter) {
	let chartOptions = {
		chart: {
			type: 'column',
			animation: true
		},
		title: {
			text: null
		},
		scrollbar: {
			enabled: false
		},
		xAxis: {
			type: 'datetime',
			title: {
				text: null
			},
			min: 0,
			reversed: true,
			labels: {
				format: '{value:%b %Y}'
			}
		},
		yAxis: {
			title: {
				text: 'Units *'
			},
			allowDecimals: false,
			min: 0,
			lineColor: '#999',
			gridLineColor: '#B4D2DC',
			gridLineDashStyle: 'longdash',
			endOnTick: false
		},
		tooltip: {
			shared: false,
			headerFormat: '<b>{point.key:%b %Y}</b><br />'
		},
		plotOptions: {
			column: {
				stacking: 'normal',
				animation: {
					duration: 1500
				}
			},
			series: {
				allowPointSelect: true,
				cursor: 'pointer',
				animation: {
					duration: 1500
				},
				point: {
					events: {
						click: null
					}
				}
			}
		},
		legend: {
			enabled: true,
			itemStyle: {
				textDecoration: ''
			}
		},
		credits: {
			enabled: false
		},
		exporting: {
			enabled: false
		},
		series: [
			{
				name: 'Peak',
				color: '#58B4FF',
				stack: 'consumption',
				data: []
			},
			{
				name: 'Off Peak',
				color: '#002060',
				stack: 'consumption',
				data: []
			},
			{
				name: 'Super Peak',
				color: '#7ACCB2',
				stack: 'consumption',
				data: []
			},
			{
				name: 'Weekday shoulder',
				color: '#7ACCB2',
				stack: 'consumption',
				data: []
			},
			{
				name: 'Weekend shoulder',
				color: '#8FBD8F',
				stack: 'consumption',
				data: []
			},
			{
				name: 'EV Off Peak',
				color: '#002060',
				stack: 'consumption',
				data: []
			},
			{
				name: 'Standard Home',
				color: '#58B4FF',
				stack: 'consumption',
				data: []
			},
			{
				name: 'Anytime ',
				type: 'column',
				color: '#002060',
				stack: 'consumption',
				data: []
			},
			{
				name: 'Estimated renewable energy consumed',
				type: 'column',
				color: '#ccc',
				stack: 'consumption',
				data: [],
				showInLegend: false
			},
			{
				name: 'Renewable energy exported to grid',
				type: 'column',
				color: '#f2bf38',
				stack: 'solar',
				data: []
			},
			{
				name: 'Mid Day Saver',
				color: '#7ACCB2',
				stack: 'consumption',
				data: []
			},
			{
				name: 'Battery',
				color: '#55AE3A',
				stack: 'battery',
				data: []
			}
		]
	};

	return {
		restrict: 'A',
		replace: true,
		scope: {
			id: '@',
			consumptionData: '=',
			hasRenExport: '=',
			hasRenConsumption: '=',
			hasOffPeakUsage: '=',
			hasWeekEndShoulder: '=',
			hasPeakUsage: '=',
			hasWeekDayShoulder: '=',
			hasSuperPeak: '=',
			hasStandardHome: '=',
			hasEVOffPeak: '=',
			hasPeriodTotal: '=',
			hasMidDaySaver: '=',
			hasOffsetBatteryUnits: '=',
			clickHandler: '='
		},
		template: '<div>Please wait...</div>',
		link: function (scope, element, attrs, ctrl) {
			let self = scope;
			function clickHandler(event) {
				scope.$apply(scope.clickHandler(event.point.x));
			}

			function refillChart() {
				self.chart.xAxis[0].setCategories(
				    _.map(scope.consumptionData.records, (it) => moment(it.supplyPeriod.endDate).toDate())
			    );
				if (scope.hasPeakUsage) {
					self.chart.series[0].setData(_.map(scope.consumptionData.records, 'peakUsage'));
				}
				if (scope.hasOffPeakUsage) {
					self.chart.series[1].setData(_.map(scope.consumptionData.records, 'offPeakUsage'));
				}
				if (scope.hasSuperPeak) {
					self.chart.series[2].setData(_.map(scope.consumptionData.records, 'superPeak'));
				}
				if (scope.hasWeekDayShoulder) {
					self.chart.series[3].setData(_.map(scope.consumptionData.records, 'weekDayShoulder'));
				}
				if (scope.hasWeekEndShoulder) {
					self.chart.series[4].setData(_.map(scope.consumptionData.records, 'weekEndShoulder'));
				}
				if (scope.hasEVOffPeak) {
					self.chart.series[5].setData(_.map(scope.consumptionData.records, 'evOffPeak'));
				}
				if (scope.hasStandardHome) {
					self.chart.series[6].setData(_.map(scope.consumptionData.records, 'standardHome'));
				}
				if (scope.hasPeriodTotal) {
					self.chart.series[7].setData(_.map(scope.consumptionData.records, 'anyTimeUsage'));
				}
				if (scope.hasRenConsumption) {
					// Include renewable consumption
					self.chart.series[8].setData(_.map(scope.consumptionData.records, 'solarEstimatedConsumptionKwh'));
				}
				if (scope.hasRenExport) {
					// Include renewable export
					self.chart.series[9].setData(_.map(scope.consumptionData.records, 'solarExportKwh'));
				}
				if (scope.hasMidDaySaver) {
					self.chart.series[10].setData(_.map(scope.consumptionData.records, 'midDaySaver'));
				}
				if (scope.hasOffsetBatteryUnits) {
					self.chart.series[11].setData(_.map(scope.consumptionData.records, 'offsetBatteryUnits'));
				}
			}

			function updateChart() {
				refillChart();
				self.chart.redraw();
			}

			function rebuildChart() {
				if (self.chart) {
					self.chart.destroy();
				}
				chartOptions.chart.type = DeviceMode.type === 'tablet' || DeviceMode.type === 'desktop' ? 'column' : 'bar';
				chartOptions.chart.renderTo = scope.id;
				if (scope.clickHandler) {
					chartOptions.plotOptions.series.point.events.click = clickHandler;
				}
				chartOptions.series[0].showInLegend = scope.hasPeakUsage;
				chartOptions.series[1].showInLegend = scope.hasOffPeakUsage;
				chartOptions.series[2].showInLegend = scope.hasSuperPeak;
				chartOptions.series[3].showInLegend = scope.hasWeekDayShoulder;
				chartOptions.series[4].showInLegend = scope.hasWeekEndShoulder;
				chartOptions.series[5].showInLegend = scope.hasEVOffPeak;
				chartOptions.series[6].showInLegend = scope.hasStandardHome;
				chartOptions.series[7].showInLegend = scope.hasPeriodTotal;
				chartOptions.series[8].showInLegend = scope.hasRenConsumption;
				chartOptions.series[9].showInLegend = scope.hasRenExport;
				chartOptions.series[10].showInLegend = scope.hasMidDaySaver;
				chartOptions.series[11].showInLegend = scope.hasOffsetBatteryUnits;
				self.chart = new Highcharts.Chart(chartOptions);
				self.chart.options.tooltip.formatter = function () {
					let s = '';
					let totalusage_graphshow = 0.0;
					let seriesLabelInfo = this.point.series.name;
					let renewableEnergyText = 'Renewable energy exported to grid';
					let batteryText = 'Battery';
					s += `<b>${Highcharts.dateFormat('%b %Y', this.x)}</b>`;
					if (this.point.series.name === renewableEnergyText) {
						seriesLabelInfo = 'Renewable export';
					} else if (this.point.series.name === batteryText) {
						seriesLabelInfo = 'Total battery offset';
					}
					s += `<br/> <span style="color:${this.point.series.color}">${seriesLabelInfo}: </span>${$filter('number')(
						this.point.y,
						2
					)}`;
					for (let i = 0; i < scope.consumptionData.records.length; i++) {
						let supplyPeriodendDate_graph = moment(scope.consumptionData.records[i].supplyPeriod.endDate).toDate();
						if (angular.isDate(this.x)) {
							if (supplyPeriodendDate_graph.getTime() === this.x.getTime()) {
								totalusage_graphshow = scope.consumptionData.records[i].periodTotal;
							}
						}
					}
					if (this.point.series.name !== renewableEnergyText && this.point.series.name !== batteryText) {
						s += `<br/> <span style="color:black">Total: </span>${$filter('number')(totalusage_graphshow, 2)}`;
					}
					return s;
				};
				refillChart();
			}

			scope.$watch('rebs', rebuildChart, false);
			scope.$watch(
				'consumptionData.timestamp',
				function (newValue, oldValue) {
					// Only update the chart if the timestamp has changed! (otherwise the initial load will trigger)
					if (newValue !== oldValue) {
						rebuildChart();
						updateChart();
					}
				},
				false
			);
		}
	};
});

angular.module('myaccount.route').directive('syCostChart', function ($log, DeviceMode) {
	let chartOptions = {
		chart: {
			type: 'column',
			animation: true
		},
		title: {
			text: null
		},
		scrollbar: {
			enabled: false
		},
		xAxis: {
			type: 'datetime',
			title: {
				text: null
			},
			min: 0,
			reversed: true,
			labels: {
				format: '{value:%b %Y}'
			}
		},
		yAxis: {
			title: {
				text: 'Amount $'
			},
			allowDecimals: false,
			gridLineWidth: 0,
			endOnTick: false
		},
		tooltip: {
			shared: true,
			headerFormat: '<b>{point.key:%b %Y}</b><br />',
			valueDecimals: 2
		},
		plotOptions: {
			column: {
				stacking: 'normal',
				animation: {
					duration: 1500
				}
			},
			series: {
				allowPointSelect: true,
				cursor: 'pointer',
				animation: {
					duration: 1500
				},
				point: {
					events: {
						click: null
					}
				}
			}
		},
		legend: {
			enabled: true
		},
		credits: {
			enabled: false
		},
		exporting: {
			enabled: false
		},
		series: [
			{
				name: 'Amount',
				color: '#EFBD46',
				data: [],
				tooltip: {
					valuePrefix: '$'
				}
			}
		]
	};

	return {
		restrict: 'A',
		replace: true,
		scope: {
			id: '@',
			consumptionData: '=',
			clickHandler: '='
		},
		template: '<div>Please wait...</div>',
		link: function (scope, element, attrs, ctrl) {
			let self = scope;

			function clickHandler(event) {
				scope.$apply(scope.clickHandler(event.point.x));
			}

			function refillChart() {
				self.chart.xAxis[0].setCategories(
					_.map(scope.consumptionData.records, (it) => moment(it.supplyPeriod.endDate).toDate())
				);
				self.chart.series[0].setData(_.map(scope.consumptionData.records, 'charges'));
			}

			function updateChart() {
				refillChart();
				self.chart.redraw();
			}

			function rebuildChart() {
				if (self.chart) {
					self.chart.destroy();
				}
				chartOptions.chart.type = DeviceMode.type === 'tablet' || DeviceMode.type === 'desktop' ? 'column' : 'bar';
				chartOptions.chart.renderTo = scope.id;
				if (scope.clickHandler) {
					chartOptions.plotOptions.series.point.events.click = clickHandler;
				}
				self.chart = new Highcharts.Chart(chartOptions);
				refillChart();
			}

			rebuildChart();
			scope.$watch(
				'consumptionData.timestamp',
				function (newValue, oldValue) {
					if (newValue !== oldValue) {
						updateChart();
					}
				},
				false
			);
		}
	};
});

angular.module('myaccount.route').directive('syUsageTab', function ($rootScope, AnalyticsServer) {
	return {
		restrict: 'A',
		link: function (scope, element, attrs, ctrl) {
			let adobePageModel = angular.copy($rootScope.adobePageModel);
			let virtualUrl = adobePageModel ? adobePageModel.virtualUrl : '';
			element.on('click', function () {
				if (virtualUrl) {
					adobePageModel.virtualUrl = `${virtualUrl}/${attrs.syUsageTab}`;
					AnalyticsServer.trackPageLoad(adobePageModel);
				}
			});
		}
	};
});