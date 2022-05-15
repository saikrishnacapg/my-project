angular.module('myaccount.route').service('activityService', function ($filter, ClientStorage, midDaySaverChartServer, HTML5_DATE_FORMAT ) {
    this.diffAmount = undefined;
    let i = 0;
    let j = 0;
    this.showPilot = true;
    this.graph2StartAndEndDatesFormat = undefined;
    this.graph3StartAndEndDatesFormat = undefined;
    this.chartOptionsMidDaySaverCurrentYearPercentageComparison = midDaySaverChartServer.percentageGraphOptions();
    this.chartOptionsMidDaySaverCurrentYearDataValueComparison = midDaySaverChartServer.defaultDataValueGraphOptions();
    this.chartOptionsMidDaySaverPreviousYearPercentageComparison = midDaySaverChartServer.percentageGraphOptions();
    this.chartOptionsMidDaySaverPreviousDataValueYearComparison = midDaySaverChartServer.defaultDataValueGraphOptions();
    this.a1Tariff = undefined;
    this.midDaySaver = undefined;
    this.DiffMidDaySaverAndA1 = undefined;
    this.showGreenText=undefined;
    this.showRedText=undefined
    this.showBlackText=undefined;
    this.showNovGreenText = undefined;
    this.showNovRedText =undefined;
    this.showNovBlackText =undefined;
    this.noData = undefined;
    this.sopValue=0.08;
    this.pValue=0.55;
    this.opValue=0.20;
    this.updateGraph1Data = function (result) {
        let i = 0;
        this.responseGraph1 = result;
        this.a1Tariff = undefined;
        this.midDaySaver = undefined;
        this.showGreenText=undefined;
        this.showRedText=undefined
        this.showBlackText=undefined
        this.DiffMidDaySaverAndA1 = undefined;
        this.noData = undefined;
        if (result.errorMessage === "" && result.simResult !== null && result.simResult.length > 1) {
            for (i = 0; i < this.responseGraph1.simResult.length; i++) {
                if (this.responseGraph1.simResult[i].rateCategoryText === 'Midday Saver' || this.responseGraph1.simResult[i].rateCategory === 'SE_RES_T01') {
                    this.midDaySaver = Math.round(this.responseGraph1.simResult[i].grossAmount);
                } else {
                    this.a1Tariff = Math.round(this.responseGraph1.simResult[i].grossAmount);
                }
            }
        }
        if (this.a1Tariff===undefined && this.midDaySaver===undefined) {
            this.noData = true;
        } else {
            this.DiffMidDaySaverAndA1 = this.a1Tariff - this.midDaySaver;
            if (this.DiffMidDaySaverAndA1 > 0) {
                this.showGreenText = true;
            } else if (this.DiffMidDaySaverAndA1 < 0) {
                this.showRedText = true;
            } else {
                this.showBlackText = true;
            }
        }
    }
    this.updateGraphDataYearly = function (resultGraph2, resultGraph3, inputDates) {
        this.responseGraph2 = resultGraph2;
        this.responseGraph3 = resultGraph3;
        this.chartOptionsMidDaySaverCurrentYearPercentageComparison = midDaySaverChartServer.percentageGraphOptions();
        this.chartOptionsMidDaySaverCurrentYearDataValueComparison = midDaySaverChartServer.defaultDataValueGraphOptions();
        this.chartOptionsMidDaySaverPreviousYearPercentageComparison = midDaySaverChartServer.percentageGraphOptions();
        this.chartOptionsMidDaySaverPreviousDataValueYearComparison = midDaySaverChartServer.defaultDataValueGraphOptions();
        this.isValidGraph2 = false;
        this.isValidGraph3 = false;
        let graph2data = []
        let graph3data = []
        let graph2dataPercentage = []
        let graph3dataPercentage = []
        this.graph2datafromDate= moment(inputDates.yearlyComparisonGraph2FromDate).format(HTML5_DATE_FORMAT);
        this.graph2datatoDate=   moment(inputDates.yearlyComparisonGraph2EndDate).format(HTML5_DATE_FORMAT);
        this.dayDifferencegraph2data=Math.abs(moment(this.graph2datafromDate).diff(moment(this.graph2datatoDate), 'days'))
        this.dayDifferencegraph2data=this.dayDifferencegraph2data+1;
        this.graph3datafromDate= moment(inputDates.yearlyComparisonGraph3FromDate).format(HTML5_DATE_FORMAT);
        this.graph3datatoDate=      moment(inputDates.yearlyComparisonGraph3EndDate).format(HTML5_DATE_FORMAT)
        this.dayDifferencegraph3data= Math.abs(moment(this.graph3datafromDate).diff(moment(this.graph3datatoDate), 'days'))
        this.dayDifferencegraph3data=this.dayDifferencegraph3data+1;

        if (this.responseGraph2.errorMessage === "" && this.responseGraph2.simResult !== null && this.responseGraph2.simResult.length > 1) {
            this.isValidGraph2 = true;
        }
        if (this.responseGraph3.errorMessage === "" && this.responseGraph3.simResult !== null && this.responseGraph3.simResult.length > 1) {
            this.isValidGraph3 = true;
        }
        let i = 0, j = 0;
        if (this.isValidGraph2) {
            for (j = 0; j < this.responseGraph2.simResult.length; j++) {
                if (this.responseGraph2.simResult[j].rateCategoryText === 'Midday Saver' || this.responseGraph2.simResult[j].rateCategory === 'SE_RES_T01') {
                    graph2data.push(this.responseGraph2.simResult[j].sopkDailyAvg*this.sopValue*this.dayDifferencegraph2data);
                    graph2data.push(this.responseGraph2.simResult[j].peakDailyAvg*this.pValue*this.dayDifferencegraph2data);
                    graph2data.push(this.responseGraph2.simResult[j].offPeakDailyAvg*this.opValue*this.dayDifferencegraph2data);
                    graph2dataPercentage.push(this.responseGraph2.simResult[j].sopkDailyAvg);
                    graph2dataPercentage.push(this.responseGraph2.simResult[j].peakDailyAvg);
                    graph2dataPercentage.push(this.responseGraph2.simResult[j].offPeakDailyAvg);
                }
            }
        }
        if (this.isValidGraph3) {
            for (j = 0; j < this.responseGraph3.simResult.length; j++) {
                if (this.responseGraph3.simResult[j].rateCategoryText === 'Midday Saver' || this.responseGraph3.simResult[j].rateCategory === 'SE_RES_T01') {
                    graph3data.push(this.responseGraph3.simResult[j].sopkDailyAvg*this.sopValue*this.dayDifferencegraph3data);
                    graph3data.push(this.responseGraph3.simResult[j].peakDailyAvg*this.pValue*this.dayDifferencegraph3data);
                    graph3data.push(this.responseGraph3.simResult[j].offPeakDailyAvg*this.opValue*this.dayDifferencegraph3data);
                    graph3dataPercentage.push(this.responseGraph3.simResult[j].sopkDailyAvg);
                    graph3dataPercentage.push(this.responseGraph3.simResult[j].peakDailyAvg);
                    graph3dataPercentage.push(this.responseGraph3.simResult[j].offPeakDailyAvg);
                }
            }
        }

        if (!this.isValidGraph2 ) {
            this.chartOptionsMidDaySaverCurrentYearPercentageComparison.noData.text = 'No data for this period of time.';
            this.chartOptionsMidDaySaverCurrentYearPercentageComparison.legend.show=false;
            this.chartOptionsMidDaySaverCurrentYearDataValueComparison.noData.text = 'No data for this period of time.';
            this.chartOptionsMidDaySaverCurrentYearDataValueComparison.legend.show=false;
        } else {
            for (i = 0; i < 3; i++) {
                this.chartOptionsMidDaySaverCurrentYearPercentageComparison.series[i] = parseFloat($filter('number')(graph2dataPercentage[i], '2'));
                this.chartOptionsMidDaySaverCurrentYearDataValueComparison.series[i] = Math.round(graph2data[i]);
            }
        }

        if (!this.isValidGraph3) {
            this.chartOptionsMidDaySaverPreviousYearPercentageComparison.noData.text = 'No data for this period of time.';
            this.chartOptionsMidDaySaverPreviousYearPercentageComparison.legend.show=false;
            this.chartOptionsMidDaySaverPreviousDataValueYearComparison.noData.text = 'No data for this period of time.';
            this.chartOptionsMidDaySaverPreviousDataValueYearComparison.legend.show=false;
        } else {
            for (i = 0; i < 3; i++) {
                this.chartOptionsMidDaySaverPreviousYearPercentageComparison.series[i] = parseFloat($filter('number')(graph3dataPercentage[i], '2'));
                this.chartOptionsMidDaySaverPreviousDataValueYearComparison.series[i] = Math.round(graph3data[i]);
            }
        }
        this.graphResultDates(resultGraph2.fromDate, resultGraph2.toDate, resultGraph3.fromDate, resultGraph3.toDate) ;
    }
    this.updateGraph4Data = function (result) {
        this.noDataFoundGraph6 = false;
        this.a1GrossAmount = undefined;
        this.midDaygrossAmount = undefined;
        this.responseGraph6 = result;
        let j = 0;
        if (result.errorMessage === "" && result.simResult !== null && result.simResult.length > 1) {
            for (j = 0; j < this.responseGraph6.simResult.length; j++) {
                if (result.simResult[j].rateCategoryText === 'Midday Saver' || result.simResult[j].rateCategory === 'SE_RES_T01') {
                    this.midDaygrossAmount = result.simResult[j].grossAmount;
                } else {
                    this.a1GrossAmount = result.simResult[j].grossAmount;
                }
            }
            this.diffAmount = Math.round(this.a1GrossAmount - this.midDaygrossAmount);
        } else {
            this.noDataFoundGraph6 = true
        }
        if (this.diffAmount > 0) {
            this.showNovGreenText = true;
        } else if (this.diffAmount < 0) {
            this.showNovRedText = true;
        } else {
            this.showNovBlackText = true;
        }

    }
    this.graphResultDates=function (startDate, endDate, secondGraphStartDate, secondGraphEndDate) {
        let graph3StartDate = secondGraphStartDate;
        let graph3EndDate = secondGraphEndDate;
        let yearlyComparisonGraph2StartDateMonth = 1 + moment(startDate, HTML5_DATE_FORMAT).month()
        let yearlyComparisonGraph2StartDateMonthName = moment(yearlyComparisonGraph2StartDateMonth, 'MM').format('MMM');
        let yearlyComparisonGraph2EndDateMonth = 1 + moment(endDate, HTML5_DATE_FORMAT).month()
        let yearlyComparisonGraph2EndDateMonthName = moment(yearlyComparisonGraph2EndDateMonth, 'MM').format('MMM');
        this.yearlyComparisonGraph2FromDateFormat =moment(startDate).date()  + ' ' +  yearlyComparisonGraph2StartDateMonthName  + ' ' + moment(startDate).format("YYYY");
        this.yearlyComparisonGraph2EndDateFormat = moment(endDate).date() + ' ' + yearlyComparisonGraph2EndDateMonthName  + ' ' + moment(endDate).format("YYYY");
        this.yearlyComparisonGraph2StartAndEndDates = this.yearlyComparisonGraph2FromDateFormat + ' - ' + this.yearlyComparisonGraph2EndDateFormat;
        let yearlyComparisonGraph3StartDateMonth = 1 + moment(graph3StartDate, HTML5_DATE_FORMAT).month()
        let yearlyComparisonGraph3StartDateMonthName = moment(yearlyComparisonGraph3StartDateMonth, 'MM').format('MMM');
        let yearlyComparisonGraph3EndDateMonth = 1 + moment(graph3EndDate, HTML5_DATE_FORMAT).month()
        let yearlyComparisonGraph3EndDateMonthName = moment(yearlyComparisonGraph3EndDateMonth, 'MM').format('MMM');
        this.yearlyComparisonGraph3FromDateFormat = moment(graph3StartDate).date()+ ' ' + yearlyComparisonGraph3StartDateMonthName  + ' ' + moment(graph3StartDate).format("YYYY");
        this.yearlyComparisonGraph3EndDateFormat =  moment(graph3EndDate).date()+ ' ' + yearlyComparisonGraph3EndDateMonthName + ' ' + moment(graph3EndDate).format("YYYY");
        this.yearlyComparisonGraph3StartAndEndDates = this.yearlyComparisonGraph3FromDateFormat + ' - ' + this.yearlyComparisonGraph3EndDateFormat;
        this.graph2StartAndEndDatesFormat = this.yearlyComparisonGraph2StartAndEndDates;
        this.graph3StartAndEndDatesFormat = this.yearlyComparisonGraph3StartAndEndDates;
        if (startDate === "0000-00-00"|| endDate === "0000-00-00") {
            this.graph2StartAndEndDatesFormat = "";
        }
        if (secondGraphStartDate === "0000-00-00"|| secondGraphEndDate === "0000-00-00") {
            this.graph3StartAndEndDatesFormat = "";
        }
    }
});


angular.module('myaccount.route').service('activityStatementService', function ($filter, HTML5_DATE_FORMAT, activityStatementHttpServer, Utils, $state, activityService) {
    this.landingActivityStatementSearch = function (contractAccNumber, productCode, productToCompare, inputDates) {
        this.search(contractAccNumber, productCode, productToCompare, inputDates);
    };
    this.search = function (contractAccNumber, productCode, productToCompare, inputDates) {
        var self = this;
        let paramsGraph1Call = {
            contractAccNumber: contractAccNumber,
            fromDate: inputDates.comparisonGraph1FromDate,
            toDate: inputDates.comparisonGraph2ToDate,
            currentProduct: productCode,
            productToCompare: productToCompare
        };
        let paramsGraph2Call = {
            contractAccNumber: contractAccNumber,
            fromDate: inputDates.yearlyComparisonGraph2FromDate,
            toDate: inputDates.yearlyComparisonGraph2EndDate,
            currentProduct: productCode,
            productToCompare: productToCompare
        };
        let paramsGraph3Call = {
            contractAccNumber: contractAccNumber,
            fromDate: inputDates.yearlyComparisonGraph3FromDate,
            toDate: inputDates.yearlyComparisonGraph3EndDate,
            currentProduct: productCode,
            productToCompare: productToCompare
        };
        let paramsGraph4Call = {
            contractAccNumber: contractAccNumber,
            fromDate: inputDates.trialFromDate,
            toDate: inputDates.trialEndDate,
            currentProduct: productCode,
            productToCompare: productToCompare
        };
        activityStatementHttpServer.loadActivityStatementData(paramsGraph1Call).then(
            function (result) {
                activityService.updateGraph1Data(result);
            });
        activityStatementHttpServer.loadActivityStatementData(paramsGraph2Call).then(
            function (resultGraph2) {
                activityStatementHttpServer.loadActivityStatementData(paramsGraph3Call).then(
                    function (resultGraph3) {
                        activityService.updateGraphDataYearly(resultGraph2, resultGraph3, inputDates);
                    });
            });
        activityStatementHttpServer.loadActivityStatementData(paramsGraph4Call).then(
            function (result) {
                activityService.updateGraph4Data(result);
            });
    };
    this.getInputDates = function (startDate, endDate) {
        let graph3StartDate = undefined;
        let graph3EndDate = undefined;
        this.trialFromDate = '11/20/2020';
        this.trialEndDate = moment().format(HTML5_DATE_FORMAT);
        graph3StartDate = moment(startDate).subtract(1, 'year').format(HTML5_DATE_FORMAT);
        graph3EndDate = moment(endDate).subtract(1, 'year').format(HTML5_DATE_FORMAT);
        this.inputDates = {
            comparisonGraph1FromDate: startDate,
            comparisonGraph2ToDate: endDate,
            yearlyComparisonGraph2FromDate: startDate,
            yearlyComparisonGraph2EndDate: endDate,
            yearlyComparisonGraph3FromDate: graph3StartDate,
            yearlyComparisonGraph3EndDate: graph3EndDate,
            trialFromDate: moment(this.trialFromDate).format(HTML5_DATE_FORMAT),
            trialEndDate: this.trialEndDate,
        }
        return this.inputDates;
    }
});


angular.module('myaccount.route').service('activityStatementHttpServer', function ($http, $log, $q, HTML5_DATE_FORMAT, Modals, Utils) {
    this.loadActivityStatementData = function (queryParams) {
        var deferred = $q.defer();
        var promise = $http({
            method: 'GET',
            url: '/ActivityStatement/' + queryParams.contractAccNumber + '/getActivityStatement',
            params: queryParams
        });

        var success = function (result) {
            var data = result.data;
            data.startDate = moment(data.startDate).format(HTML5_DATE_FORMAT);
            data.timestamp = moment().valueOf();

            deferred.resolve(data);
        };

        var failure = function (reason) {
            // $http filter should have caught this and displayed an error dialog
            $log.error('Error loading interval data for: ' + queryParams.contractAccountNumber + ', reason: ' + reason);
            deferred.reject(reason);
        };

        promise.then(success, failure);

        return deferred.promise;
    };
});

angular.module('myaccount.route').service('midDaySaverChartServer', function ($log, $q, HTML5_DATE_FORMAT) {

    this.defaultDataValueGraphOptions = function () {
        return this.yearlyDataValueGraphOptions = {
            series: [],
            labels: ["Super Off Peak", "Peak", "Off Peak"],
            chart: {
                width: 400,
                height:320,
                type: 'donut',
                size: '40%',
            },
            plotOptions: {
                pie: {
                    startAngle: 0,
                    endAngle: 360,
                donut: {
                    size: '40%',
                },
            }
            },
            fill: {
                opacity: 1,
                colors: ['#2a6c56', '#c21c09', '#002060'],
            },
            noData: {
                text: undefined,
                align: 'center',
                verticalAlign: 'middle',
                offsetX: 0,
                offsetY: 0,
                style: {
                    color: '#c21c09',
                    fontSize: '16px',
                    fontFamily: 'Proxima Nova Soft W03", Futura, "Trebuchet MS", Helvetica, Arial, Verdana, sans-serif'
                }
            },
            colors:['#2a6c56', '#c21c09', '#002060'],
            legend: {
                onItemClick: {
                    toggleDataSeries: false
                },
                onItemHover: {
                    highlightDataSeries: false
                },
                position: 'bottom',
                horizontalAlign: 'left',
                offsetX: 40,
                show:true,
                markers: {
                    width: 12,
                    height: 12,
                    strokeWidth: 0,
                    strokeColor: '#fff',
                    fillColors:['#2a6c56', '#c21c09', '#002060'],
                    radius: 12,
                    customHTML: undefined,
                    onClick: undefined,
                    offsetX: 0,
                    offsetY: 0
                },
            },
            dataLabels: {
                enabled: true,
                formatter: function (val, opts) {
                    /* Format labels here */
                    return  "$" + opts.w.config.series[opts.seriesIndex];
                },
                style: {
                    fillColors: ['#FFFFFF', '#FFFFFF'],
                    fontSize: '30px',
                }
            },
            title: {
                text: ''
            },
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: {
                        width: 200
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }]
        };
    };
    this.percentageGraphOptions = function () {
        return this.yearlyPercentageGraphOptions = {
            series: [],
            labels: ["Super Off Peak", "Peak", "Off Peak"],
            chart: {
                width: 400,
                height:320,
                type: 'donut',
                size: '40%',
            },
            plotOptions: {
                pie: {
                    startAngle: 0,
                    endAngle: 360,
                    donut: {
                        size: '40%',
                    },
                }
            },
            fill: {
                opacity: 1,
                colors: ['#2a6c56', '#c21c09', '#002060'],
            },
            noData: {
                text: undefined,
                align: 'center',
                verticalAlign: 'middle',
                offsetX: 0,
                offsetY: 0,
                style: {
                    color: '#c21c09',
                    fontSize: '16px',
                    fontFamily: 'Proxima Nova Soft W03", Futura, "Trebuchet MS", Helvetica, Arial, Verdana, sans-serif'
                }
            },
            colors:['#2a6c56', '#c21c09', '#002060'],
            tooltip: {
                enabled: false,
            },
            legend: {
                onItemClick: {
                    toggleDataSeries: false
                },
                onItemHover: {
                    highlightDataSeries: false
                },
                position: 'bottom',
                horizontalAlign: 'left',
                offsetX: 40,
                show:true,
                markers: {
                    width: 12,
                    height: 12,
                    strokeWidth: 0,
                    strokeColor: '#fff',
                    fillColors:['#2a6c56', '#c21c09', '#002060'],
                    radius: 12,
                    customHTML: undefined,
                    onClick: undefined,
                    offsetX: 0,
                    offsetY: 0
                },
            },
            dataLabels: {
                style: {
                    fillColors: ['#FFFFFF', '#FFFFFF'],
                    fontSize: '30px',
                    fontWeight: 'bold',
                },
                formatter: function (val) {
                    return Math.round(val) + "%"
                },
            },
            title: {
                text: ''
            },
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: {
                        width: 200
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }]
        };
    }
});