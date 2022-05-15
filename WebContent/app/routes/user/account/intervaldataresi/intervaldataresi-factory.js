angular.module('myaccount.route').factory('intervalDataResiChartServer', function ($log, $q, HTML5_DATE_FORMAT, intervalDataResiService, intervalDataResiHttpServer) {

	/**
     * Submit the SVG representation of the chart to the server along with the email options.
     * If you are having issues with this copy the code from the exportChart methid in
     * exporting.src.js in highcharts and add in the emailOptions parameter and
     * additional parameters specified below.
     */
	Highcharts.extend(Highcharts.Chart.prototype, {
		emailChart: function (emailOptions, options, chartOptions) {
			options = options || {};

			var chart = this,
				chartExportingOptions = chart.options.exporting,
				svg = chart.getSVG(Highcharts.merge(
					{ chart: { borderRadius: 0 } },
					chartExportingOptions,
					chartOptions,
					{
						exporting: {
							sourceWidth: options.sourceWidth || chartExportingOptions.sourceWidth, // Docs: option and parameter in exportChart()
							sourceHeight: options.sourceHeight || chartExportingOptions.sourceHeight // Docs
						}
					}
				));

			// Merge the options
			options = Highcharts.merge(chart.options.exporting, options);

			var promise = intervalDataResiHttpServer.sendChartEmail({
				filename: options.filename || 'chart',
				type: options.type,
				width: options.width || 0, // IE8 fails to post undefined correctly, so use 0
				scale: options.scale || 2,
				svg: svg,
				toEmail: emailOptions.to, // Added by Synergy
				ccEmail: emailOptions.cc,
				emailSubject: emailOptions.subject,
				downloadType: emailOptions.downloadType // Hourly or daily
			});

			promise.then(function () {
				$log.info("Chart information sent to server");
			});
		}
	});


	var DAY_INTERVAL = 24 * 60 * 60 * 1000, // 1 day
		ELEC_INTERVAL = 30 * 60 * 1000, // 30 minutes
		GAS_INTERVAL = 60 * 60 * 1000; // 1 hour

	// Default chart
	var defaultChart = {
		chart: {
			type: 'column',
			animation: true,
			zoomType: 'xy',
			resetZoomButton: {
				position: {
					align: 'left',
					x: 30
				},
				theme: {
					fill: 'white',
					stroke: 'silver',
					states: {
						hover: {
							fill: '#002C5A',
							style: {
								color: 'white'
							}
						}
					}
				}
			},
			marginTop: 50
		},
		credits: {
			enabled: false
		},
		title: {
			text: ''
		},
		xAxis: {
			type: 'date',
			labels: {
				format: "",
				title: ""
			}
		},
		yAxis: {
			min: 0,
			title: {text: 'Units', margin: 1},
			labels: {align: 'right', x: -2, title: ""},
			lineWidth: 2
		},
		rangeSelector: {
			enabled: false
		},
		scrollbar: {
			enabled: false
		},
		navigator: {
			enabled: true,
			yAxis: { min: 0},
			series: {
				type: 'line'
			}
		},
		legend: {
			enabled: true,
			align: 'left',
			verticalAlign: 'top',
			floating: true,
			x: 40
		},
		plotOptions: {
			column: {
				cursor: 'pointer',
				dataGrouping: {
					enabled: false
				},
				stacking: 'normal',
				pointPadding: -0.05
			},
			series: {
				animation: {
					duration: 700
				},
				lineWidth: 2,
				hover: {
					enabled: true,
					lineWidth: 4
				},
				marker: {
					enabled: false
				},
				point: {
					events: {}
				}
			}
		},
		tooltip: {
			enabled: true,
			valueDecimals: 3,
			style: {fontSize: '8pt'}
		},
		exporting: {
			enabled: false
		}
	};

	var consumptionChartDetails = angular.copy(defaultChart);

	function updateLabels(chart, yAxisTitle, singleDayGraph) {
		if (yAxisTitle && angular.isArray(chart.yAxis)) {
			chart.yAxis[0].title.text = yAxisTitle;
		} else if (yAxisTitle) {
			chart.yAxis.title.text = yAxisTitle;
		}

		if (angular.isArray(chart.yAxis)) {
			chart.xAxis[0].labels.format = singleDayGraph ? '{value:%H:%M}' : '{value:%e %b}';
		} else {
			chart.xAxis.labels.format = singleDayGraph ? '{value:%H:%M}' : '{value:%e %b}';
		}
	}

	// Electricity Charts
	function consumptionChart(singleDayGraph) {
		updateLabels(consumptionChartDetails, 'kWh', singleDayGraph);

		consumptionChartDetails.chart.renderTo = 'intervalDataResiconsumptionChart';
		consumptionChartDetails.plotOptions.series.pointInterval = singleDayGraph ? ELEC_INTERVAL : DAY_INTERVAL;
		consumptionChartDetails.xAxis.plotLines= [
			{
				color: '#000000', // Color value
				dashStyle: 'solid', // Style of the plot line. Default to solid
				value: Date.UTC(1900, 2, 1, 0, 0, 0), // Value of where the line will appear
				width: 2, // Width of the line
				zIndex: 99999,
				label: {
					text: '',
					align: 'right',
					verticalAlign: 'top',
					y: 15,
					x: -10,
					rotation: 360,
					style: {
						color: '#000000'
					}
				}
			},
			{
				color: '#000000', //  Color value
				dashStyle: 'solid', // Style of the plot line. Default to solid
				value: Date.UTC(1900, 2, 1, 0, 0, 0), // Value of where the line will appear
				width: 2, // Width of the line
				zIndex: 99999,
				label: {
					text: '',
					align: 'left',
					verticalAlign: 'top',
					y: 15,
					x: 10,
					rotation: 360,
					style: {
						color: '#000000'
					}
				}
			}
		];
		consumptionChartDetails.series = [
			{
				id: 'offPeakKwhValues',
				name: 'Standard home',
				color: '#006AA8'
			},
			{
				id: 'peakKwhValues',
				name: 'EV off peak',
				color: '#95DBB6'

			},
			{
				id: 'includesOutage',
				name: 'Includes Outage',
				color: '#182860',
				visible: false,
				showInLegend: false
			},
			{
				id: 'includesEstimate',
				name: 'Includes Estimate',
				color: '#182860',
				visible: false,
				showInLegend: false
			}
		];

		return consumptionChartDetails;
	}



	function clickNavigator(selectedValue, dayInterval) {
		return function (e) {
			if (parseInt(dayInterval, 10) === 0) {
				intervalDataResiService.previousSearch();
			} else {
				var clickedDate = moment(selectedValue).format(HTML5_DATE_FORMAT);
				intervalDataResiService.dateSearch(clickedDate, clickedDate);
			}
		};
	}

	function responsifyChart(chart, device, title) {
		/*If (device === 'mobile') {
         chart.yAxis[0].update({
         */
		/*Labels: { enabled: false },*/
		/*
         Title: { text: null }
         }, true);
         } else {
         chart.yAxis[0].update({
         */
		/*Labels: { enabled: true },*/
		/*
         Title: { text: title }
         }, true);
         }*/
	}

	/**
     * This method will trigger a manual reflow (resize) of the chart
     * for times like when a chart is hidden behind a tab. At the end
     * we re-initialise auto-resize by setting the hasUserSize to false
     * @param chart
     * @param idSelector
     */
	function reflow(chart, idSelector) {
		var element = angular.element("#" + idSelector);
		var width = element.width(),
			height = element.height();

		// TODO Getting this error - Cannot use 'in' operator to search for 'opacity' in undefined - need to fix!
		chart.setSize(width, height, true);
		chart.hasUserSize = false;
	}

	function ohlcList(startTime, numberOfDays, minSeries, maxSeries) {
		var ohlc = [];

		if (!minSeries || !maxSeries) {
			return ohlc;
		}

		for (var i = 0; i < numberOfDays; i++) {
			ohlc[i] = [startTime.valueOf() + i * DAY_INTERVAL, null, maxSeries[i], minSeries[i], null];
		}

		return ohlc;

	}

	function modernizeChart(chartDetails) {
		if (Modernizr.touch) {
			// Add in any mobile related logic here.
			// I.e. chartDetails.scrollbar.enabled = false;
		}
	}

	var intervalDataResiChartServer = {
		consumptionChart: consumptionChart,
		clickNavigator: clickNavigator,
		responsifyChart: responsifyChart,
		reflow: reflow,
		ohlcList: ohlcList,
		modernizeChart: modernizeChart,
		DAY_INTERVAL: DAY_INTERVAL,
		ELEC_INTERVAL: ELEC_INTERVAL,
		GAS_INTERVAL: GAS_INTERVAL
	};

	return intervalDataResiChartServer;
});