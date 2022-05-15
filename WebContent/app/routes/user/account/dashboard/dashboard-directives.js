angular.module('myaccount.route').directive('syUsageSummaryChart', function ($log, $filter, $rootScope, $timeout) {

    var DEFAULT_HEIGHT = 220;

    var chartOptions = {
        chart: {
            type: 'column',
            animation: true,
            backgroundColor: null,
            height: DEFAULT_HEIGHT
        },
        title: {
            text: null
        },
        scrollbar: {
            enabled: false
        },
        pane: {
            center: ['50%', '50%'],
            width: '100%'
        },
        xAxis: {
            title: {
                text: null
            },
            labels: {
                enabled: true
            },
            lineColor: '#999'
        },
        yAxis: {
            min: 0,
            title: {
                text: null //'units'
            },
            labels: {
                enabled: false
            },
            lineColor: '#999',
            lineWidth: 0,
            gridLineWidth: 0
        },
        tooltip: {
            pointFormat: "{point.y:,.0f} units",
            headerFormat: '',
            followPointer: true
        },
        plotOptions: {
            series: {
                animation: {
                    duration: 2000
                },
                dataLabels: {
                    enabled: true
                },
                point: {
                    events: {
                        click: null // overridden inside directive link function
                    }
                }
            },
            bar: {
                dataLabels: {
                    align:'left',
                    color: '#333',
                    enabled: true,
                    format: '{series.name}',
                    inside: true,
                    padding: 10,
                    style: {
                        fontSize: 13,
                        fontWeight: 'bold',
                        fontFamily: 'Arial'
                    }
                }
            }
        },
        legend: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        series: [
            {
                color: '#58b4d2',
                name: 'Usage',
                data: []
            }
        ]
    };

    return {
        restrict: 'A',
        replace: true,
        scope: {
            consumptionSummary: '=consumptionSummary',
            id: '@id'
        },
        template: '<div style="height:220px">&nbsp;</div>',
        link: function (scope, element, attrs) {

            chartOptions.chart.renderTo = scope.id;

            function label(item) {
                return item ? item.periodLabel : '';
            }

            function value(item) {
                if (item) {
                    return item.billIsNew ? {y: item.periodTotal, color: "#EFBD46"} : item.periodTotal;
                }
                else {
                    return '';
                }
            }

            chartOptions.xAxis.categories = [label(scope.consumptionSummary.lastYear), label(scope.consumptionSummary.prev), label(scope.consumptionSummary.current)];//, scope.consumptionComparison.suburb.label + ' Average', 'Houses like yours'];
            chartOptions.series[0].data = [value(scope.consumptionSummary.lastYear), value(scope.consumptionSummary.prev), value(scope.consumptionSummary.current)];//, scope.consumptionComparison.suburb.averageDailyUnits*61, scope.consumptionComparison.suburb.averageDailyUnits*61];

            var chart;

            // See answer here for $timeout, seems to work - http://stackoverflow.com/questions/20672724
            $timeout(function() {
                chart = new Highcharts.Chart(chartOptions);
            }, 0);
        }
    };
});

angular.module('myaccount.route').directive('syUsageComparisonChart', function ($log, $filter, $timeout) {

    var HOUSEHOLD_COLOR = '#58b4d2';//'rgb(80,80,255)';
    var SUBURB_COLOR = '#EFBD46';//'rgb(240,200,20)';
    var DEFAULT_HEIGHT = 220;
    var PLOT_RADIUS = '63%';

    var baseChartOptions = {
        chart: {
            type: 'gauge',
            animation: true,
            plotBackgroundColor: null,
            plotBackgroundImage: null,
            plotBorderWidth: 0,
            plotShadow: false,
            height: DEFAULT_HEIGHT
        },
        title: {
            text: null
        },
        pane: {
            center: ['50%', '60%'],
            startAngle: -90,
            endAngle: 90,
            size: '100%',
            background: //null
            {
                backgroundColor:  '#DDD',
                borderWidth: 0,
                innerRadius: PLOT_RADIUS,
                outerRadius: '100%',
                shape: 'arc'
            }
        },

        // the value axis
        yAxis: {
            min: 0,
            tickPosition: 'outside',
            tickColor: '#555',
            lineWidth: 0,
            minorTickWidth: 0,
            minorTickPosition: 'outside',
            minorTickColor: '#555',
            tickWidth: 0,
            tickLength: 8,
            minorTickLength: 8,
            labels: {
                enabled: false,
                distance: 18
            },
            offset: 0,//-28,
            startOnTick: true,
            endOnTick: true,
            plotBands: []
        },
        tooltip: {
            enabled: true,
            followPointer: true
        },
        credits: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        series: [{
            name: 'Usage',
            data: [],
            dataLabels: {
                padding: 5,
                format: 'My average daily usage <strong>{y} units</strong>',
                style: {
                    fontSize: '14px',
                    fontWeight: 'normal',
                    fontFamily: 'Arial',
                    textAlign: 'center'
                },
                y: 8
            },
            tooltip: {
                pointFormat: "My house: {point.y:,.0f} units"
            },
            dial: {
                backgroundColor: '#333',
                baseLength: '0%',
                baseWidth: 6,
                radius: '80%',
                rearLength: '0%',
                topWidth: 1
            }
        },
            {
                name: 'Your suburb',
                visible: false,
                animation: false,
                data: [],
                dial: {
                    backgroundColor: SUBURB_COLOR,
                    borderWidth: 0,
                    baseWidth: 6,
                    baseLength: '100%',
                    radius: '100%',
                    rearLength: '-' + PLOT_RADIUS,
                    topWidth: 6
                },
                dataLabels: {
                    backgroundColor: SUBURB_COLOR,
                    borderWidth: 0,
                    padding: 4,
                    enabled: false,
                    format: '{y} units',
                    x: 0,
                    y: 38,
                    style: { fontFamily: '\'Lato\', sans-serif', lineHeight: '14px', fontSize: '12px', color: '#000'}
                }
            },
            {
                name: 'Similar houses',
                visible: false,
                animation: false,
                data: [],
                dial: {
                    backgroundColor: HOUSEHOLD_COLOR,
                    borderWidth: 0,
                    baseWidth: 6,
                    padding: 5,
                    baseLength: '100%',
                    radius: '100%',
                    rearLength: '-' + PLOT_RADIUS,
                    topWidth: 6
                },
                dataLabels: {
                    backgroundColor: HOUSEHOLD_COLOR,
                    borderWidth: 0,
                    padding: 4,
                    enabled: false,
                    format: 'Similar houses: {y} units',
                    x: 0,
                    y: 68,
                    style: { fontFamily: '\'Lato\', sans-serif', lineHeight: '14px', fontSize: '12px', color: '#000'}
                }
            }
        ],
        plotOptions: {
            gauge: {
                animation: {
                    duration: 2000
                },
                dataLabels: {
                    y: 15,
                    borderWidth: 0,
                    useHTML: true,
                    overflow: "none",
                    padding: 3
                },
                pivot: {
                    backgroundColor: '#333',
                    radius: 6
                }
            }
        }
    };

    return {
        restrict: 'A',
        replace: true,
        scope: {
            consumptionComparison: '=consumptionComparison',
            id: '@id'
        },
        template: '<div style="height:220px">&nbsp;</div>',
        link: function (scope, element, attrs) {

            var chartOptions = angular.copy(baseChartOptions);

            chartOptions.chart.renderTo = scope.id;

            var consumptionComparison = scope.consumptionComparison;

            chartOptions.yAxis.max = _.max(_.filter([consumptionComparison.similarHomes, consumptionComparison.suburb, consumptionComparison.account], function(it) {return it != null;}), 'averageDailyUnits')['averageDailyUnits']*1.1;


            if (consumptionComparison.account) {
                chartOptions.series[0].data.push(consumptionComparison.account.averageDailyUnits);
            }

            if (consumptionComparison.suburb) {
                chartOptions.series[1].visible = chartOptions.series[1].dataLabels.enabled = true;
                chartOptions.series[1].name = consumptionComparison.suburb.label;
                chartOptions.series[1].dataLabels.format = consumptionComparison.suburb.label + ' average {y} units',
                    chartOptions.series[1].data = [consumptionComparison.suburb.averageDailyUnits];
            }

            if (consumptionComparison.similarHomes) {
                chartOptions.series[2].visible = chartOptions.series[2].dataLabels.enabled = true;
                chartOptions.series[2].data = [consumptionComparison.similarHomes.averageDailyUnits];
            }

            var chart;
            // See answer here for $timeout, seems to work - http://stackoverflow.com/questions/20672724
            $timeout(function() {
                chart = new Highcharts.Chart(chartOptions);
            }, 50);
        }
    };
});

angular.module('myaccount.route').directive('syInstalmentProjectionChart', function ($log, $filter, $timeout) {

    var baseChartOptions = {
        chart: {
            type: 'column',
            animation: true
        },
        scrollbar: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        title: {
            text: null
        },
        xAxis: {
            categories: []
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Amount ($)'
            },
            allowDecimals: false,
            lineColor: '#999',
            gridLineColor: '#B4D2DC',
            gridLineDashStyle: 'longdash',
            endOnTick: false
        },
        tooltip: {
            enabled: false
        },
        plotOptions: {
            column: {
                animation: {
                    duration: 1500
                },
                dataLabels: {
                    enabled: true,
                    //color: '#182124',
                    //style: {'font-family': 'Proxima Nova W01'},
                    formatter: function () {
                        return this.y > 0 ? '$' + this.y : '';
                    }
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
                        click: null // overridden inside directive link function
                    }
                }
            }
        },
        legend: {
            enabled: true,
            itemStyle: {
                textDecoration: 'underline'
            }
        },
        series: [{
            name: 'Instalment payments',
            data: [],//[49.9, 71.5, 106.4, 129.2, 144.0, 176.0],
            color: '#58b4d2'
        }, {
            name: 'Bill amount',
            color: '#fdbe57',
            data: []
        }]
    };
    var filterFunction =  function(o){return o.billingCode === "IN"};

    function recursiveDataArrayBuild(array, dataArray){
        var indexOfBI = _.findIndex(array, filterFunction);
        if( indexOfBI < 0)
        {
            return null;
        }
        else
        {
            if(indexOfBI > 0)
            {
                array = _.drop(array, indexOfBI);
            }
            if(array[0] && array[0].billingCode === "IN")
            {
                array = _.drop(array);
            }
            var newIndex = _.findIndex(array, filterFunction) == -1 ? array.length: _.findIndex(array, filterFunction);
            var dataArrayElement = _.reduce(_.pluck(_.slice(array, 0, newIndex), 'amount'), function(sum, n) {
                return sum + n;
            }, 0);
            if(dataArrayElement != 0){
                dataArray.push(dataArrayElement);
            }
            if(_.findIndex(array, filterFunction) != -1)
            {
                recursiveDataArrayBuild(_.slice(array, newIndex), dataArray);
            }
        }
    };

    return {
        restrict: 'A',
        replace: true,
        scope: {
            billHistory: '=billHistory',
            id: '@id'
        },
        template: '<div style="height:300px">&nbsp;</div>',
        link: function (scope, element, attrs) {

            var chartOptions = angular.copy(baseChartOptions);

            chartOptions.chart.renderTo = scope.id;

            var billHistory = _.filter(scope.billHistory, function(o){
                return o.billingCode === "IN" || o.billingCode === "DI";
            });

            /*var billHistory = [
                {
                    "_id": "-1827075660",
                    "amount": 300,
                    "billingCode": "IN",
                    "billingCycle": "Feb / Mar",
                    "contractAccountNumber": "000681593870",
                    "description": "Bill issued (amount owing)",
                    "dueDate": "2015-03-22T16:00:00.000Z",
                    "invoiceId": null,
                    "isBill": true,
                    "isNew": true,
                    "isPayment": false,
                    "openAmount": null,
                    "pdfId": "647d517c4a753fde62c836bd243e2dfc207e654dc1342fd58acdcdcb87b39da8",
                    "postingDate": "2015-03-04T16:00:00.000Z",
                    "supplyPeriod": {
                        "endDate": "2015-03-01T16:00:00.000Z",
                        "key": "20150101_20150302",
                        "numberOfDays": 61,
                        "startDate": "2014-12-31T16:00:00.000Z"
                    }
                },
                {
                    "_id": "-1948587039",
                    "amount": -121,
                    "billingCode": "DI",
                    "billingCycle": "Sep / Oct",
                    "contractAccountNumber": "000681593870",
                    "description": "Direct debit instalment",
                    "dueDate": null,
                    "invoiceId": null,
                    "isBill": false,
                    "isNew": true,
                    "isPayment": false,
                    "openAmount": null,
                    "pdfId": "647d517c4a753fdede3e91cd74d14d63",
                    "postingDate": "2015-10-08T16:00:00.000Z",
                    "supplyPeriod": null
                },
                {
                    "_id": "1014278113",
                    "amount": -121,
                    "billingCode": "PI",
                    "billingCycle": "Aug / Sep",
                    "contractAccountNumber": "000681593870",
                    "description": "Direct debit instalment",
                    "dueDate": null,
                    "invoiceId": null,
                    "isBill": false,
                    "isNew": true,
                    "isPayment": false,
                    "openAmount": null,
                    "pdfId": "647d517c4a753fdede3e91cd74d14d63",
                    "postingDate": "2015-09-29T16:00:00.000Z",
                    "supplyPeriod": null
                },
                {
                    "_id": "-1827075660",
                    "amount": 83.8,
                    "billingCode": "IN",
                    "billingCycle": "Nov / Dec",
                    "contractAccountNumber": "000681593870",
                    "description": "Bill issued (amount owing)",
                    "dueDate": "2015-03-22T16:00:00.000Z",
                    "invoiceId": null,
                    "isBill": true,
                    "isNew": true,
                    "isPayment": false,
                    "openAmount": null,
                    "pdfId": "647d517c4a753fde62c836bd243e2dfc207e654dc1342fd58acdcdcb87b39da8",
                    "postingDate": "2015-03-04T16:00:00.000Z",
                    "supplyPeriod": {
                        "endDate": "2015-03-01T16:00:00.000Z",
                        "key": "20150101_20150302",
                        "numberOfDays": 61,
                        "startDate": "2014-12-31T16:00:00.000Z"
                    }
                },
                {
                    "_id": "1014278113",
                    "amount": -121,
                    "billingCode": "DI",
                    "billingCycle": "Aug / Sep",
                    "contractAccountNumber": "000681593870",
                    "description": "Direct debit instalment",
                    "dueDate": null,
                    "invoiceId": null,
                    "isBill": false,
                    "isNew": true,
                    "isPayment": false,
                    "openAmount": null,
                    "pdfId": "647d517c4a753fdede3e91cd74d14d63",
                    "postingDate": "2015-09-29T16:00:00.000Z",
                    "supplyPeriod": null
                },
                {
                    "_id": "1014278113",
                    "amount": -121,
                    "billingCode": "DI",
                    "billingCycle": "Aug / Sep",
                    "contractAccountNumber": "000681593870",
                    "description": "Direct debit instalment",
                    "dueDate": null,
                    "invoiceId": null,
                    "isBill": false,
                    "isNew": true,
                    "isPayment": false,
                    "openAmount": null,
                    "pdfId": "647d517c4a753fdede3e91cd74d14d63",
                    "postingDate": "2015-09-29T16:00:00.000Z",
                    "supplyPeriod": null
                }
            ];
            billHistory = _.filter(billHistory, function(o){
                return o.billingCode === "IN" || o.billingCode === "DI";
            });*/

            var series0DataArray = [];
            recursiveDataArrayBuild(billHistory, series0DataArray);
            chartOptions.series[0].data = _.map(series0DataArray, function(o){return Math.abs(o);});//series0DataArray;

            chartOptions.series[1].data = _.pluck(_.filter(billHistory, function(o){return o.billingCode === "IN"}), 'amount');
			chartOptions.xAxis.categories = _.pluck(_.filter(billHistory, function(o){return o.billingCode === "IN"}), 'billingCycle');

            var chart;
            // See answer here for $timeout, seems to work - http://stackoverflow.com/questions/20672724
            $timeout(function() {
                chart = new Highcharts.Chart(chartOptions);
            }, 50);
        }
    };
});

