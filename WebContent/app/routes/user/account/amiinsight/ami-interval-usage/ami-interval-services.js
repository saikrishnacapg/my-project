angular.module('myaccount.route').service('amiInterval', function($filter, ClientStorage) {
	this.meterTypes = { ELECTRICITY: 'ELEC', GAS: 'GAS' };
	this.chartType = this.meterTypes.ELECTRICITY; // By default
	this.timestamp = moment().unix();
	this.message = "Loading your interval data...";
	this.hasData = false;
	this.hasValue=false;
	this.dayInterval = -1;
	this.singleDayIntervalData = undefined;
	this.multiDayIntervalData = undefined;
	this.mode = undefined;
	this.downloadType = undefined;
	this.visualFormats = [{name: 'PNG', format: 'image/png'}, {name: 'JPEG', format: 'image/jpeg'}];
	this.dataFormats = [{name: 'CSV', format: 'csv'}, {name: 'Excel', format: 'excel'}];
	this.showGenerationTab =false;
	this.dailyEstimateValue = false;
	this.halfHourlyEstimateValue = false;
	this.unAvailableDataFlag=undefined;
	this.minDate=undefined;
	this.tabs = [
		{ title: "Consumption", icon: "sy-icon--charts", visibility: ['ELEC', 'GAS'], visual: true},
		{ title: "Load Profile", icon: "sy-icon--stats", visibility: ['ELEC', 'GAS'], visual: true},
		{ title: "Power Factor", icon: "sy-icon--power", visibility: ['ELEC'], visual: true},
		{ title: "Load Factor", icon: "sy-icon--refresh", visibility: ['ELEC'], visual: true},
		{ title: "Tabular", icon: "sy-icon--justify", visibility: ['ELEC', 'GAS'], visual: false}
	];

	this.showTab = function(tab) {
		return tab.visibility.indexOf(this.chartType) >= 0;
	};

	this.tabIsActive = function(tab) {
		return this.mode === tab.title;
	};

	this.getActiveTab = function() {
		var mode = this.mode;
		return _.find(this.tabs, function(tab) {
			return tab.title === mode;
		});
	};
	this.setTabMode = function(tab) {
		this.mode = tab ? tab.title : ClientStorage.getLastIntervalDataTab() || this.tabs[0].title;
		if (this.mode === "Consumption") {
			$(".sy-icon-tabular--charts").removeClass("activeButton");
			$(".sy-icon-stats-bar--charts").addClass("activeButton");
		} else if (this.mode === "Tabular") {
			$(".sy-icon-stats-bar--charts").removeClass("activeButton");
			$(".sy-icon-tabular--charts").addClass("activeButton");
		}
		ClientStorage.setLastIntervalDataTab(this.mode);
	};

	this.isElectricity = function() {
		return this.chartType === this.meterTypes.ELECTRICITY;
	};

	this.isGas = function() {
		return this.chartType === this.meterTypes.GAS;
	};

	this.clear = function() {
		this.singleDayIntervalData = undefined;
		this.multiDayIntervalData = undefined;
		this.hasData = false;
	};

	this.billunbilledDailyData = function (startDate, unbilledStartDate, value, responseData, index) {

		var data = {
			unbilledbasePeriod: [],
			billedbasePeriod: [],
			billedbase: "",
			unbilledbase: ""
		};


		data.billedbase = value.billedbase === 'Usage already billed' ? value.billedbase : "";
		if (startDate >= unbilledStartDate) {
			data.unbilledbasePeriod = responseData.offpeakKwhDailyValues[index];
			data.billedbasePeriod = 0;
			data.unbilledbase = 'Usage not yet billed';
		} else {
			data.billedbasePeriod = responseData.offpeakKwhDailyValues[index];
			data.unbilledbasePeriod = 0;
			data.billedbase = 'Usage already billed';
		}

		return data;
	};
	this.billunbilledHalfHourlyData = function (startDate, unbilledStartDate, value, responseData, index) {

		var data = {
			unbilledbasePeriod: [],
			billedbasePeriod: [],
			billedbase: "",
			unbilledbase: ""
		};


		data.billedbase = value.billedbase === 'Usage already billed' ? value.billedbase : "";
		if (startDate >= unbilledStartDate) {
			data.unbilledbasePeriod = responseData.offpeakKwhHalfHourlyValues;
			data.billedbasePeriod = 0;
			data.unbilledbase = 'Usage not yet billed';
		} else {
			data.billedbasePeriod = responseData.offpeakKwhHalfHourlyValues;
			data.unbilledbasePeriod = 0;
			data.billedbase = 'Usage already billed';
		}

		return data;
	};
	this.tabularDataUpdated=[];
	this.productData=[];
	// eslint-disable-next-line complexity
	this.update = function(result) {
		this.hasData = angular.isDefined(result);
		this.message = this.hasData ? "Loading your interval data..." : "Interval data is not available for your current selection.";

		this.timestamp = moment().unix();
		this.dayInterval = parseInt(result.numberOfDays);
		this.chartType = result.chartType;

		var i = 0;
		var data = 'undefined';
		var response = 'undefined';
		var unbilledbasePeriod = {unbilledbasePeriod: []};
		var billedbasePeriod = {billedbasePeriod: []};

		var startDate = 'undefined';
		var endDate = 'undefined';
		var unbilledStartDate = 'undefined';
		var retrieveIntervalDetails = 'undefined';
		retrieveIntervalDetails = result.retrieveIntervalDetails[0];
		if (this.dayInterval > 0){
			response = result;

			startDate = moment(response.startDate).toDate();
			endDate = moment(response.endDate).toDate();
			unbilledStartDate = moment(response.unbilledStartDate).toDate();
			if (response) {
				i = 0;
				unbilledbasePeriod = {unbilledbasePeriod: []};
				billedbasePeriod = {billedbasePeriod: []};

				startDate = moment(response.startDate).toDate();
				endDate = moment(response.endDate).toDate();
				unbilledStartDate = moment(response.unbilledStartDate).toDate();
				angular.extend(response, unbilledbasePeriod);
				angular.extend(response, billedbasePeriod);

				if (retrieveIntervalDetails != undefined) {
					if (!retrieveIntervalDetails.period2 && !retrieveIntervalDetails.period3 && !retrieveIntervalDetails.period4) {
						while (startDate < endDate) {
							if (unbilledStartDate) {
								data = this.billunbilledDailyData(startDate, unbilledStartDate, retrieveIntervalDetails, response, i);
								response.unbilledbasePeriod.push(data.unbilledbasePeriod);
								response.billedbasePeriod.push(data.billedbasePeriod);
								response.retrieveIntervalDetails[0].billedbase = data.billedbase;
								response.retrieveIntervalDetails[0].unbilledbase = data.unbilledbase;
							}
							i++;
							startDate = moment(startDate).add(1, 'days').toDate();
						}
					}
				}
			}

			this.dailyEstimateValue = response.statusCodeDailyValues.indexOf('*Estimated') !== -1 ? true : false;

			if (this.dayInterval !== 0 && this.chartType === this.meterTypes.ELECTRICITY) {
				this.calcExtraElectricityStats(result);
			}

			if (this.mode === "Consumption") {
				$(".sy-icon-tabular--charts").removeClass("activeButton");
				$(".sy-icon-stats-bar--charts").addClass("activeButton");
			} else if (this.mode === "Tabular") {
				$(".sy-icon-stats-bar--charts").removeClass("activeButton");
				$(".sy-icon-tabular--charts").addClass("activeButton");
			}
			this.singleDayIntervalData = this.dayInterval === 0 ? response : null;
			this.multiDayIntervalData = this.dayInterval === 0 ? null : response;

		} else {
			response = result;
			if (response){

				i = 0;
				unbilledbasePeriod = {unbilledbasePeriod: []};
				billedbasePeriod = {billedbasePeriod: []};
				startDate = moment(response.startDate).toDate();
				endDate = moment(response.endDate).toDate();
				unbilledStartDate = moment(response.unbilledStartDate).toDate();

				angular.extend(response, unbilledbasePeriod);
				angular.extend(response, billedbasePeriod);
				if (retrieveIntervalDetails != undefined) {
					if (!retrieveIntervalDetails.period2 && !retrieveIntervalDetails.period3 && !retrieveIntervalDetails.period4) {
						while (startDate < endDate) {
							if (unbilledStartDate) {
								data = this.billunbilledHalfHourlyData(startDate, unbilledStartDate, retrieveIntervalDetails, response, i);
								response.unbilledbasePeriod.push(data.unbilledbasePeriod);
								response.billedbasePeriod.push(data.billedbasePeriod);
								response.retrieveIntervalDetails[0].billedbase = data.billedbase;
								response.retrieveIntervalDetails[0].unbilledbase = data.unbilledbase;
							}
							i++;
							startDate = moment(startDate).add(1, 'days').toDate();
						}
					}
				}
			}
			this.halfHourlyEstimateValue = response.statusCodeHalfHourlyValues.indexOf('*Estimated') !== -1 ? true : false;
			if (this.dayInterval !== 0 && this.chartType === this.meterTypes.ELECTRICITY) {
				this.calcExtraElectricityStats(result);
			}

			if (this.mode === "Consumption") {
				$(".sy-icon-tabular--charts").removeClass("activeButton");
				$(".sy-icon-stats-bar--charts").addClass("activeButton");
			} else if (this.mode === "Tabular") {
				$(".sy-icon-stats-bar--charts").removeClass("activeButton");
				$(".sy-icon-tabular--charts").addClass("activeButton");
			}
			this.singleDayIntervalData = this.dayInterval === 0 ? response : null;
			this.multiDayIntervalData = this.dayInterval === 0 ? null : response;
		}
		this.productData=this.retrieveIntervalDetailsData();
		this.tabularDataUpdated=this.tabularData();
	};



	this.latestData = function() {
		var data = this.dayInterval === 0 ? this.singleDayIntervalData : this.multiDayIntervalData;
		this.hasValue = data.hasValue;
		return data;
	};
	this.retrieveIntervalDetailsData = function() {
		var data = this.dayInterval === 0 ? this.singleDayIntervalData : this.multiDayIntervalData;
		var products = data.retrieveIntervalDetails.reverse();
		var updatedData={};
		var i=0;
		angular.forEach(products, function (value, key) {
			var key="key"+i;
			updatedData[key]=value;
			i++;
		});
		return updatedData;
		//   return Object.keys(updatedData);
	};
	this.tabularData=function () {
		let table = {
			basePeriod: '0',
			period2: '0',
			period3: '0',
			period4: '0'
		};
		if (this.dayInterval === 0) {
			return table;
		}
		var data = this.dayInterval === 0 ? this.singleDayIntervalData : this.multiDayIntervalData;
		var products= this.productData;
		var finalArray=[];
		var i = 0;
		angular.forEach(products, function (value, key) {
			var tableData=[];
			var productSwitchStartDate = moment(value.productSwitchStartDate).toDate();
			var productSwitchEndDate = moment(value.productSwitchEndDate).toDate();
			var startDate = moment(data.startDate).toDate();
			var endDate = moment(data.endDate).toDate();
			while (startDate < endDate) {
				var itemToAdd=angular.copy(table);
				if (productSwitchStartDate <= startDate && productSwitchEndDate >= startDate) {
					itemToAdd.date=startDate;
					itemToAdd.basePeriod=data.offpeakKwhDailyValues[i];
					itemToAdd.period2=data.peakKwhDailyValues[i];
					itemToAdd.period3=data.weekdayShoulderKwhDailyValues[i];
					itemToAdd.period4=data.weekendShoulderKwhDailyValues[i];
					itemToAdd.billingStatus="billed";
					i++;
				}
				tableData.push(itemToAdd);
				startDate = moment(startDate).add(1, 'days').toDate();
			}
			finalArray.push(tableData);
		});
		return finalArray;
	};

	this.popover = function() {
		return {
			"title": "Title",
			"content": "Hello Popover<br />This is a multiline message!"
		};
	};

	this.isVisual = function() {
		var activeTab = this.getActiveTab();
		return activeTab ? activeTab.visual : true;
	};

	this.calcExtraElectricityStats = function(data) {

		// Calculate some daily stats
		data.totalKwhDailyValues = [];
		data.includesOutageDailyValues = [];
		data.includesEstimateDailyValues = [];
		data.minKwDailyValues = [];
		data.averageKwDailyValues = [];
		data.minKvaDailyValues = [];
		data.maxKvaDailyValues = [];
		data.averageKvaDailyValues = [];
		data.minPowerFactorDailyValues = [];
		data.maxPowerFactorDailyValues = [];

		//Generation
		//Data.kwhDailyValuesGeneration = [];


		for (var i=0;i<data.numberOfDays;i++) {
			var totalKwh = data.peakKwhDailyValues[i] + data.offpeakKwhDailyValues[i];
			data.totalKwhDailyValues.push(totalKwh);

			var intervalNo = i*48;
			var kwHalfHourlyValues = data.kwHalfHourlyValues ? data.kwHalfHourlyValues.slice(intervalNo, intervalNo+48) : [];
			var kvaHalfHourlyValues = data.kvaHalfHourlyValues ? data.kvaHalfHourlyValues.slice(intervalNo, intervalNo+48) : [];
			var powerFactorHalfHourlyValues = data.powerFactorHalfHourlyValues ? data.powerFactorHalfHourlyValues.slice(intervalNo, intervalNo+48) : [];
			var statusCodeHalfHourlyValues = data.statusCodeHalfHourlyValues ? data.statusCodeHalfHourlyValues.slice(intervalNo, intervalNo+48) : [];

			data.includesOutageDailyValues.push(statusCodeHalfHourlyValues.indexOf('Outage') < 0 ? "No" : "Yes");
			data.includesEstimateDailyValues.push(statusCodeHalfHourlyValues.indexOf('Estimate') < 0 ? "No" : "Yes");

			data.minKwDailyValues.push($filter('min')(kwHalfHourlyValues));
			data.averageKwDailyValues.push($filter('avg')(kwHalfHourlyValues));

			data.minKvaDailyValues.push($filter('min')(kvaHalfHourlyValues));
			data.averageKvaDailyValues.push($filter('avg')(kvaHalfHourlyValues));
			data.maxKvaDailyValues.push($filter('max')(kvaHalfHourlyValues));

			data.minPowerFactorDailyValues.push($filter('min')(powerFactorHalfHourlyValues));
			data.maxPowerFactorDailyValues.push($filter('max')(powerFactorHalfHourlyValues));

			// If(this.showGeneration()){
			//     //Generation
			//     Var kwhHalfHourlyValuesGeneration = data.kwhHalfHourlyValuesGeneration ? data.kwhHalfHourlyValuesGeneration.slice(intervalNo, intervalNo+48) : [];
			//     Data.kwhDailyValuesGeneration.push($filter('avg')(kwhHalfHourlyValuesGeneration));
			// }
		}
	};
});

angular.module('myaccount.route').service('amiIntervalService', function($filter, HTML5_DATE_FORMAT, amiInterval, amiIntervalHttpServer, IntervalDeviceServer, MyAccountServer, Utils, $state, AmiInsightService) {
	this.eDevices = [];
	this.gDevices = [];
	this.contractAccountNumber = undefined;
	this.nextFlag=false;
	this.previousFlag=false;
	this.current = {
		meters: undefined,
		startDate: undefined, // These are strings
		endDate: undefined, // These are strings
		dayInterval: undefined,
		moveIN: undefined,
		moveOUT: undefined,
		maxLimitDate: undefined
	};

	this.lastSearched = {
		meters: undefined,
		startDate: undefined, // These are strings
		endDate: undefined, // These are strings
		dayInterval: undefined,
		moveIN: undefined,
		moveOUT: undefined,
		maxLimitDate: undefined
	};

	this.filterDevices = function(meters, match) {
		var result = $filter('filter')(meters, 'type', function(value) {
			return value === match;
		});

		return result;
	};

	this.init = function(contractAccountNumber, meters, usageSupplyPeriod, latestBillPeriodEndDate) {
		amiInterval.clear();

		this.contractAccountNumber = contractAccountNumber;
		this.eDevices = this.filterDevices(meters, amiInterval.meterTypes.ELECTRICITY);
		this.gDevices = this.filterDevices(meters, amiInterval.meterTypes.GAS);
		if (this.eDevices) {
			var flags = [], output = [], l = this.eDevices.length, i;
			for (i = 0; i < l; i++) {
				if (flags[this.eDevices[i].deviceId]) {
					continue;
				}
				flags[this.eDevices[i].deviceId] = true;
				output.push(this.eDevices[i]);
			}
			this.eDevices = output;
			this.eDevices =  Utils.optionDevice(this.eDevices) // for option drop down
		}
		if (this.gDevices) {
			this.gDevices =  Utils.optionDevice(this.gDevices)
		}
		this.current.meters = this.eDevices.length ? output : [this.gDevices[0]];
		if (usageSupplyPeriod !== undefined) {
			this.current.startDate = moment(usageSupplyPeriod.endDate).subtract(7, 'days').format(HTML5_DATE_FORMAT);
			this.current.endDate = moment(usageSupplyPeriod.endDate).format(HTML5_DATE_FORMAT);
			this.current.dayInterval = moment(this.current.endDate).diff(moment(this.current.startDate), 'days');
		} else {
			this.current.startDate = moment().subtract(1, 'week').day(1).startOf('day').format(HTML5_DATE_FORMAT);
			this.current.endDate = moment().subtract(1, 'week').day(7).startOf('day').format(HTML5_DATE_FORMAT);
			this.current.dayInterval = moment(this.current.endDate).diff(moment(this.current.startDate), 'days');
		}

		this.current.moveIN = moment(this.current.meters[0].moveIn).toDate();
		this.current.moveOUT = moment(this.current.meters[0].moveOut).toDate();

		/* This.current.installDeviceFrom = moment(this.current.meters[0].installFrom).toDate();
        this.current.installDeviceTo = moment(this.current.meters[0].installTo).toDate();
        this.current.maxLimitDate = moment().toDate()> moment(this.current.meters[0].moveOut).toDate() ? moment(this.current.meters[0].moveOut).toDate() : moment().toDate();
        this.current.minLimitDate = moment(this.current.moveIN).toDate()> moment(this.current.installDeviceFrom).toDate() ? moment(this.current.moveIN).toDate() : moment(this.current.installDeviceFrom).toDate();*/

		if (this.current.meters.length>1){
			let ArrayinstallDeviceFrom =[];
			let mindaterange=undefined;
			angular.forEach(this.current.meters, function(meter) {
				ArrayinstallDeviceFrom.push(moment(meter.installFrom).toDate())
			});
			mindaterange = _.min(ArrayinstallDeviceFrom);
			this.current.maxLimitDate = moment().toDate() > moment(this.current.meters[0].moveOut).toDate() ? moment(this.current.meters[0].moveOut).toDate() : moment().toDate();
			this.current.minLimitDate = moment(this.current.moveIN).toDate() > mindaterange ? moment(this.current.moveIN).toDate() : mindaterange;
		} else {
			this.current.installDeviceFrom = moment(this.current.meters[0].installFrom).toDate();
			this.current.installDeviceTo = moment(this.current.meters[0].installTo).toDate();
			this.current.maxLimitDate = moment().toDate() > moment(this.current.meters[0].moveOut).toDate() ? moment(this.current.meters[0].moveOut).toDate() : moment().toDate();
			this.current.minLimitDate = moment(this.current.moveIN).toDate() > moment(this.current.installDeviceFrom).toDate() ? moment(this.current.moveIN).toDate() : moment(this.current.installDeviceFrom).toDate();
		}
		this.lastSearched = angular.copy(this.current);
		this.latestBillPeriodEndDate = latestBillPeriodEndDate;
		AmiInsightService.latestBillPeriodEndDate = latestBillPeriodEndDate;
		return this;
	};

	this.dateSearchLimit = {
		max: moment().toDate()/*,
        min: moment('2016-12-20').toDate()*/
	};

	this.nextInterval = function() {
		this.nextFlag=true;
		var interval = this.current.dayInterval || 0;
		var nextStart = moment(this.current.endDate).add(1, 'days').format(HTML5_DATE_FORMAT);
		var nextEnd = moment(this.current.endDate).add(interval + 1, 'days').format(HTML5_DATE_FORMAT);
		if (moment(this.lastSearched.minLimitDate).isAfter(nextStart)) {
			amiInterval.unAvailableDataFlag=true;
			amiInterval.minDate=moment(this.lastSearched.minLimitDate).format(HTML5_DATE_FORMAT);
		} else {
			amiInterval.unAvailableDataFlag=false;
		}
		this.dateSearch(nextStart, nextEnd);
	};

	this.previousInterval = function() {
		this.previousFlag=true;
		var interval = this.current.dayInterval || 0;
		var previousStart = moment(this.current.startDate).subtract(interval + 1, 'days').format(HTML5_DATE_FORMAT);
		var previousEnd = moment(this.current.startDate).subtract(1, 'days').format(HTML5_DATE_FORMAT);
		if (moment(this.lastSearched.minLimitDate).isAfter(previousStart)) {
			amiInterval.unAvailableDataFlag=true;
			amiInterval.minDate=moment(this.lastSearched.minLimitDate).format(HTML5_DATE_FORMAT);
		} else {
			amiInterval.unAvailableDataFlag=false;
		}
		this.dateSearch(previousStart, previousEnd);
	};

	this.previousSearch = function() {
		var interval = moment(this.lastSearched.endDate).diff(moment(this.lastSearched.startDate), 'days');
		if (interval===0) {
			var startDate = moment(this.current.startDate).subtract(3, 'days').format(HTML5_DATE_FORMAT);
			var endDate = moment(this.current.startDate).add(3, 'days').format(HTML5_DATE_FORMAT);
			this.dateSearch(startDate, endDate);
		} else {
			this.dateSearch(this.lastSearched.startDate, this.lastSearched.endDate);
		}
	};

	this.dailyViewPreviousSearch = function() {
		var interval = moment(this.lastSearched.endDate).diff(moment(this.lastSearched.startDate), 'days');
		if (interval===0) {
			var startDate = moment(this.current.startDate).subtract(3, 'days').format(HTML5_DATE_FORMAT);
			var endDate = moment(this.current.startDate).add(3, 'days').format(HTML5_DATE_FORMAT);
			this.dateSearch(startDate, endDate);
		} else {
			this.dateSearch(this.lastSearched.startDate, this.lastSearched.endDate);
		}
	};

	this.landingSearch = function() {
		this.search(this.current.meters, this.current.startDate, this.current.endDate);
	};

	this.dateSearch = function(startDate, endDate) {
		this.search(this.current.meters, startDate, endDate);
	};

	this.search = function(intervalDevices, startDate, endDate) {

		if (!this.nextFlag && !this.previousFlag) {
			amiInterval.unAvailableDataFlag = false;
		}
		this.nextFlag =false;
		this.previousFlag=false;

		this.updateSearchHistory(intervalDevices, startDate, endDate);

		// Assigning the date to AMIServices Dates

		AmiInsightService.startDate = startDate;
		AmiInsightService.endDate = endDate;


		// Update end date for SAP
		endDate = moment(endDate).add(1, 'days').format(HTML5_DATE_FORMAT);

		var intervalDeviceIds = [];
		var chartType;

		angular.forEach(intervalDevices, function(meter) {
			intervalDeviceIds.push(meter.deviceId);
			chartType = meter.deviceType; // Will only have elec or gas
		});

		var params = {
			contractAccountNumber: this.contractAccountNumber,
			intervalDeviceIds: intervalDeviceIds,
			startDate: startDate,
			endDate: endDate,
			latestBillPeriodEndDate: this.latestBillPeriodEndDate
		};

		var promise = amiIntervalHttpServer.loadElectricityData(params) ;


		var success = function(result) {
			amiInterval.update(result);
			//If($scope.accountCtrl.isAmiCustomer()){
			$state.go('user.account.usage.amiinsight', {}, {reload: "user.account.usage.amiinsight"});
			//}
		};
		var failure = function() {
			// TODO indicate failure
		};

		promise.then(success, failure);
	};

	this.updateSearchHistory = function(intervalDevices, startDate, endDate) {
		var interval = moment(endDate).diff(moment(startDate), 'days');
		this.current.moveIN = moment(intervalDevices[0].moveIn).toDate();
		this.current.moveOUT = moment(intervalDevices[0].moveOut).toDate();
		this.current.maxLimitDate = moment().toDate()> moment(this.current.moveOUT).toDate() ? moment(this.current.moveOUT).toDate() : moment().toDate();
		this.current.installDeviceFrom = moment(this.current.meters[0].installFrom).toDate();
		this.current.installDeviceTo = moment(this.current.meters[0].installTo).toDate();
		this.current.minLimitDate = moment(this.current.moveIN).toDate()> moment(this.current.installDeviceFrom).toDate() ? moment(this.current.moveIN).toDate() : moment(this.current.installDeviceFrom).toDate();

		if (intervalDevices.length>1){
			let ArrayinstallDeviceFrom =[];
			let mindaterange=undefined;
			angular.forEach(intervalDevices, function(meter) {
				ArrayinstallDeviceFrom.push(moment(meter.installFrom).toDate());
			});
			mindaterange = _.min(ArrayinstallDeviceFrom)
			this.current.maxLimitDate = moment().toDate() > moment(this.current.meters[0].moveOut).toDate() ? moment(this.current.meters[0].moveOut).toDate() : moment().toDate();
			this.current.minLimitDate = moment(this.current.moveIN).toDate() > mindaterange ? moment(this.current.moveIN).toDate() : mindaterange;
		} else {
			this.current.installDeviceFrom = moment(this.current.meters[0].installFrom).toDate();
			this.current.installDeviceTo = moment(this.current.meters[0].installTo).toDate();
			this.current.maxLimitDate = moment().toDate() > moment(this.current.meters[0].moveOut).toDate() ? moment(this.current.meters[0].moveOut).toDate() : moment().toDate();
			this.current.minLimitDate = moment(this.current.moveIN).toDate() > moment(this.current.installDeviceFrom).toDate() ? moment(this.current.moveIN).toDate() : moment(this.current.installDeviceFrom).toDate();
		}

		this.lastSearched = angular.copy(this.current);
		this.current = {
			dataReturned: true,
			meters: intervalDevices,
			startDate: startDate,
			endDate: endDate,
			dayInterval: interval
		};
	};

	this.chartData = function() {
		return this.current.dayInterval === 0 ? this.singleDayIntervalData : this.multiDayIntervalData;
	};

	this.dataSetUrl = function(details) {
		var urlPath = amiInterval.isGas() ? details.downloadType === 'daily' ? "exportDailyGasIntervalData" : "exportHourlyGasIntervalData" :
			details.downloadType === 'daily' ? "exportAmiDailyElecIntervalRESIData" : "exportHalfHourlyElecAMIIntervalRESIData";

		var url = MyAccountServer + '/intervalData/' + this.contractAccountNumber + '/' + urlPath + '?startDate=' +
			encodeURIComponent(Utils.convertToHTML5Date(this.current.startDate)) + '&endDate=' +
			encodeURIComponent(Utils.convertToHTML5Date(moment(this.current.endDate).add(1, 'days').format(HTML5_DATE_FORMAT))) + '&unbilledStartDate=' +
			encodeURIComponent(Utils.convertToHTML5Date(moment(this.latestBillPeriodEndDate).add(1, 'days'))) +'&generationTab='+
			details.generationTab;

		angular.forEach(this.current.meters, function(meter) {
			url += "&intervalDeviceIds=" + meter.deviceId;
		});

		url += "&exportFormat=" + details.downloadFormat;

		return url;
	};

	this.exportDataSet = function(details) {
		var url = this.dataSetUrl(details);

		url += "&exportType=download";

		amiIntervalHttpServer.tabularDownload(url);


	};

	this.emailDataSet = function(details) {
		var url = this.dataSetUrl(details);
		url += "&exportType=email";
		url += "&toEmail=" + encodeURIComponent( details.to );
		if (details.cc){
			url += "&ccEmail=" + encodeURIComponent( details.cc );
		}
		url += "&emailSubject=" + encodeURIComponent( details.subject );

		amiIntervalHttpServer.sendDataEmail(url);


	};
});

angular.module('myaccount.route').service('amiIntervalHttpServer', function($http, $log, $q, HTML5_DATE_FORMAT, Modals, Utils) {
	this.loadElectricityData = function(queryParams) {
		var deferred = $q.defer();

		var interval = moment(queryParams.endDate).diff(moment(queryParams.startDate), 'days');
		var url = interval === 1 ? "getHalfHourlyElecIntervalData" : "getDailyElecIntervalData";
		var urlParams = {
			intervalDeviceIds: queryParams.intervalDeviceIds,
			startDate: Utils.convertToHTML5Date(queryParams.startDate),
			endDate: Utils.convertToHTML5Date(queryParams.endDate),
			unbilledStartDate: queryParams.latestBillPeriodEndDate ? Utils.convertToHTML5Date(moment(queryParams.latestBillPeriodEndDate).add(1, 'days')) : null
		};
		var promise = $http({
			method: 'GET',
			url: '/intervalData/'+queryParams.contractAccountNumber+'/'+url,
			params: urlParams
		});

		var success = function(result) {
			var data = result.data;
			data.startDate = moment(data.startDate).format(HTML5_DATE_FORMAT);
			data.timestamp = moment().valueOf();

			deferred.resolve(data);
		};

		var failure = function(reason) {
			// $http filter should have caught this and displayed an error dialog
			$log.error('Error loading interval data for: ' + queryParams.contractAccountNumber + ', reason: ' + reason);
			deferred.reject(reason);
		};

		promise.then(success, failure);

		return deferred.promise;
	};

	this.sendChartEmail = function(options) {

		var deferred = $q.defer();

		var xsrf = $.param(options);

		var promise = $http({
			method: "POST",
			url: "/chart/mail",
			apps: true,
			headers: {"Content-type": "application/x-www-form-urlencoded; charset=utf-8"},
			data: xsrf
		});

		var success = function(result) {
			$log.info('Interval data email successfully sent');
			deferred.resolve(result);
		};

		var failure = function(reason) {
			$log.error('Error sending interval data email, reason: ' + reason);
			deferred.reject(reason);
		};

		promise.then(success, failure);

		return promise;
	};

	this.sendDataEmail = function(url) {
		$http({
			method: "POST",
			url: url
		}).error(function() {
			Modals.showAlert("Error", "We're sorry, an issue occurred in processing your email and it could not be sent.");
		});
	};

	this.tabularDownload = function(url) {
		/*
           HighCharts approach of programatically creating and submitting a form.
           This is a workaround as files cannot be directly through ajax for current
           browser support (there is a download attribute but IE does not support it).
        */
		var el = document.createElement('form');
		angular.extend(el, {
			method: 'post',
			action: url,
			target: '_blank',
			enctype: 'multipart/form-data'
		});

		document.body.appendChild(el);
		el.submit();
	};
});

