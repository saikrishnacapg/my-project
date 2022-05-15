angular.module('myaccount.route').service('intervalData', function($filter, ClientStorage) {
	this.meterTypes = { ELECTRICITY: 'ELEC', GAS: 'GAS' };
	this.chartType = this.meterTypes.ELECTRICITY; // By default
	this.timestamp = moment().unix();
	this.message = "Loading your interval data...";
	this.hasData = false;
	this.dayInterval = -1;
	this.singleDayIntervalData = undefined;
	this.multiDayIntervalData = undefined;
	this.mode = undefined;
	this.downloadType = undefined;
	this.visualFormats = [{name: 'PNG', format: 'image/png'}, {name: 'JPEG', format: 'image/jpeg'}];
	this.dataFormats = [{name: 'CSV', format: 'csv'}, {name: 'Excel', format: 'excel'}];
	this.intervalDetails=undefined;
	this.showGenerationTab =false;
	this.dailyEstimateValue = false;
	this.halfHourlyEstimateValue = false;
	this.intervalDetailsData=function() {
		return this.intervalDetails;
	}
	this.showfooter = false;
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
		var mode = this.mode || ClientStorage.getLastIntervalDataTab();
		return _.find(this.tabs, function(tab) {
			return tab.title === mode;
		});
	};
	this.setTabMode = function(tab) {
		this.mode = tab ? tab.title : ClientStorage.getLastIntervalDataTab() || this.tabs[0].title;
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

	this.update = function(result) {
		this.hasData = angular.isDefined(result);
		this.message = this.hasData ? "Loading your interval data..." : "Interval data is not available for your current selection.";

		this.timestamp = moment().unix();
		this.dayInterval = parseInt(result.numberOfDays);
		this.chartType = result.chartType;

		this.dailyEstimateValue = result.statusCodeDailyValues && result.statusCodeDailyValues.indexOf('*Estimated') !== -1 ? true : false;
		this.halfHourlyEstimateValue = result.statusCodeDailyValues && result.statusCodeHalfHourlyValues.indexOf('*Estimated') !== -1 ? true : false;

		if (this.dayInterval !== 0 && this.chartType === this.meterTypes.ELECTRICITY) {
			this.calcExtraElectricityStats(result);
		}

		this.singleDayIntervalData = this.dayInterval === 0 ? result : null;
		this.multiDayIntervalData = this.dayInterval === 0 ? null : result;
	};


	this.latestData = function() {
		return this.dayInterval === 0 ? this.singleDayIntervalData : this.multiDayIntervalData;
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
			//Generation
			//Var kwhHalfHourlyValuesGeneration = data.kwhHalfHourlyValuesGeneration ? data.kwhHalfHourlyValuesGeneration.slice(intervalNo, intervalNo+48) : [];
			data.includesOutageDailyValues.push(statusCodeHalfHourlyValues.indexOf('Outage') < 0 ? "No" : "Yes");
			data.includesEstimateDailyValues.push(statusCodeHalfHourlyValues.indexOf('Estimate') < 0 ? "No" : "Yes");

			data.minKwDailyValues.push($filter('min')(kwHalfHourlyValues));
			data.averageKwDailyValues.push($filter('avg')(kwHalfHourlyValues));

			data.minKvaDailyValues.push($filter('min')(kvaHalfHourlyValues));
			data.averageKvaDailyValues.push($filter('avg')(kvaHalfHourlyValues));
			data.maxKvaDailyValues.push($filter('max')(kvaHalfHourlyValues));

			data.minPowerFactorDailyValues.push($filter('min')(powerFactorHalfHourlyValues));
			data.maxPowerFactorDailyValues.push($filter('max')(powerFactorHalfHourlyValues));

			// Generation
			//Data.kwhDailyValuesGeneration.push($filter('avg')(kwhHalfHourlyValuesGeneration));
		}
	};
});

angular.module('myaccount.route').service('intervalDataService', function($filter, HTML5_DATE_FORMAT, intervalData, intervalDataHttpServer, IntervalDeviceServer, MyAccountServer, Utils) {
	this.eDevices = [];
	this.gDevices = [];
	this.collectiveChilAccount =[];
	this.intervalGenerationdevices =false;
	this.parentcontractAccountNumber = undefined;
	this.contractAccountNumber = undefined;
	this.showfooter =false;
	this.usageSupplyPeriod = undefined;
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


	this.filterIntervalDevices = function(data) {
		var result = $filter('filter')(data, 'X', function(value) {
			return value === 'X';
		});
		return result;
	};

	this.filterDevices = function(meters, match) {
		var result = $filter('filter')(meters, 'type', function(value) {
			return value === match;
		});

		return result;
	};

	this.initChild =function(accountdetails, usageSupplyPeriod) {
		this.parentcontractAccountNumber = accountdetails.contractAccountNumber;
		this.collectiveChilAccount = this.filterIntervalDevices(accountdetails.collectiveDetails.childAccounts);
		if (usageSupplyPeriod) {
			this.usageSupplyPeriod = usageSupplyPeriod;
		}
	}

	this.init = function(contractAccountNumber, meters, usageSupplyPeriod) {
		intervalData.clear();

		this.contractAccountNumber = contractAccountNumber;

		this.eDevices = this.filterDevices(meters, intervalData.meterTypes.ELECTRICITY);
		this.gDevices = this.filterDevices(meters, intervalData.meterTypes.GAS);
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
			//This.current.meters = output;
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
		if (this.current.meters.length>1){
			let ArrayinstallDeviceFrom =[]
			let mindaterange=undefined;
			angular.forEach(this.current.meters, function(meter) {
				ArrayinstallDeviceFrom.push(moment(meter.installFrom).toDate())
			});
			mindaterange = _.min(ArrayinstallDeviceFrom);//Moment.min(ArrayinstallDeviceFrom.map(d -> moment(d))).toDate();
			this.current.maxLimitDate = moment().toDate() > moment(this.current.meters[0].moveOut).toDate() ? moment(this.current.meters[0].moveOut).toDate() : moment().toDate();
			this.current.minLimitDate = moment(this.current.moveIN).toDate() > mindaterange ? moment(this.current.moveIN).toDate() : mindaterange;
		} else {
			this.current.installDeviceFrom = moment(this.current.meters[0].installFrom).toDate();
			this.current.installDeviceTo = moment(this.current.meters[0].installTo).toDate();
			this.current.maxLimitDate = moment().toDate() > moment(this.current.meters[0].moveOut).toDate() ? moment(this.current.meters[0].moveOut).toDate() : moment().toDate();
			this.current.minLimitDate = moment(this.current.moveIN).toDate() > moment(this.current.installDeviceFrom).toDate() ? moment(this.current.moveIN).toDate() : moment(this.current.installDeviceFrom).toDate();
		}
		this.lastSearched = angular.copy(this.current);
		return this;
	};

	this.nextInterval = function() {
		var interval = this.current.dayInterval || 0;
		var nextStart = moment(this.current.endDate).add(1, 'days').format(HTML5_DATE_FORMAT);
		var nextEnd = moment(this.current.endDate).add(interval + 1, 'days').format(HTML5_DATE_FORMAT);
		this.dateSearch(nextStart, nextEnd);
	};

	this.previousInterval = function() {
		var interval = this.current.dayInterval || 0;
		var previousStart = moment(this.current.startDate).subtract(interval + 1, 'days').format(HTML5_DATE_FORMAT);
		var previousEnd = moment(this.current.startDate).subtract(1, 'days').format(HTML5_DATE_FORMAT);
		this.dateSearch(previousStart, previousEnd);
	};

	this.previousSearch = function() {
		this.dateSearch(this.lastSearched.startDate, this.lastSearched.endDate);
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

	this.getDeviceList = function(contractAccount) {
		var params = {
			contractAccountNumber: this.parentcontractAccountNumber === undefined ? this.contractAccountNumber : this.parentcontractAccountNumber+"/"+contractAccount,
			childContractAccountNumber: contractAccount
		};
		var jsondata = undefined;
		// Var jsondata = JSON.parse('{"DeviceDetails":[{"REGISTER":"001","installFrom":"2012-06-15","moveIn":"2009-08-05","CONT_ACCT":"000950471070","deviceType":"ELEC","INTSIZEID":"30","UOM":"","moveOut":"9999-12-31","POWER_FACTOR":"3.2320000","meterType":"INTERVAL","direction":"C","installationId":"3000128554","customDeviceName":"","deviceId":"000000000348000225","CONTRACT":"0030762679","showGeneration":"false","UNIT_READING":"KWH","installTo":"2013-04-08","CONTRACT_MAX_DEMAND":"0.0000000"},{"REGISTER":"002","installFrom":"2012-06-15","moveIn":"2009-08-05","CONT_ACCT":"000950471070","deviceType":"ELEC","INTSIZEID":"30","UOM":"","moveOut":"9999-12-31","POWER_FACTOR":"3.2320000","meterType":"INTERVAL","direction":"C","installationId":"3000128554","customDeviceName":"","deviceId":"000000000348000225","CONTRACT":"0030762679","showGeneration":"false","UNIT_READING":"KVH","installTo":"2013-04-08","CONTRACT_MAX_DEMAND":"0.0000000"},{"REGISTER":"001","installFrom":"2013-04-09","moveIn":"2009-08-05","CONT_ACCT":"000950471070","deviceType":"ELEC","INTSIZEID":"30","UOM":"","moveOut":"9999-12-31","POWER_FACTOR":"3.2320000","meterType":"INTERVAL","direction":"C","installationId":"3000128554","customDeviceName":"","deviceId":"000000000348000225","CONTRACT":"0030762679","showGeneration":"false","UNIT_READING":"KWH","installTo":"9999-12-31","CONTRACT_MAX_DEMAND":"0.0000000"},{"REGISTER":"002","installFrom":"2013-04-09","moveIn":"2009-08-05","CONT_ACCT":"000950471070","deviceType":"ELEC","INTSIZEID":"30","UOM":"","moveOut":"9999-12-31","POWER_FACTOR":"3.2320000","meterType":"INTERVAL","direction":"C","installationId":"3000128554","customDeviceName":"","deviceId":"000000000348000225","CONTRACT":"0030762679","showGeneration":"false","UNIT_READING":"KVH","installTo":"9999-12-31","CONTRACT_MAX_DEMAND":"0.0000000"},{"REGISTER":"003","installFrom":"2013-04-09","moveIn":"2009-08-05","CONT_ACCT":"000950471070","deviceType":"ELEC","INTSIZEID":"30","UOM":"","moveOut":"9999-12-31","POWER_FACTOR":"3.2320000","meterType":"INTERVAL","direction":"G","installationId":"3000128554","customDeviceName":"","deviceId":"000000000348000225","CONTRACT":"0030762679","showGeneration":"false","UNIT_READING":"KWH","installTo":"9999-12-31","CONTRACT_MAX_DEMAND":"0.0000000"},{"REGISTER":"004","installFrom":"2013-04-09","moveIn":"2009-08-05","CONT_ACCT":"000950471070","deviceType":"ELEC","INTSIZEID":"30","UOM":"","moveOut":"9999-12-31","POWER_FACTOR":"3.2320000","meterType":"INTERVAL","direction":"G","installationId":"3000128554","customDeviceName":"","deviceId":"000000000348000225","CONTRACT":"0030762679","showGeneration":"false","UNIT_READING":"KVH","installTo":"9999-12-31","CONTRACT_MAX_DEMAND":"0.0000000"}]}');
		/*This.init(contractAccount, jsondata.DeviceDetails);
        this.landingSearch();*/

		return intervalDataHttpServer.getintervalDeviceList(params).then(
			function(result){
				return result;
			}, function(error){
				//If an error happened, handle it here
			}
		)
	}

	this.search = function(intervalDevices, startDate, endDate) {
		this.updateSearchHistory(intervalDevices, startDate, endDate);

		// Update end date for SAP
		endDate = moment(endDate).add(1, 'days').format(HTML5_DATE_FORMAT);

		var intervalDeviceIds = [];
		var installationId ;
		var chartType;

		angular.forEach(intervalDevices, function(meter) {
			intervalDeviceIds.push(meter.deviceId);
			chartType = meter.deviceType;// Will only have elec or gas
			installationId=meter.installationId;
		});
		/*        If (this.parentcontractAccountNumber != undefined){}
        parentcontractAccountNumber : this.parentcontractAccountNumber,*/
		var params = {
			contractAccountNumber: this.parentcontractAccountNumber === undefined ? this.contractAccountNumber : this.parentcontractAccountNumber+"/"+this.contractAccountNumber,
			childContractAccountNumber: this.contractAccountNumber,
			intervalDeviceIds: intervalDeviceIds,
			startDate: startDate,
			endDate: endDate,
			installationId: installationId
		};

		var promise = chartType === intervalData.meterTypes.GAS ?
			intervalDataHttpServer.loadGasData(params) :
			intervalDataHttpServer.loadElectricityData(params);

		var success = function(result) {
			intervalData.update(result);
		};
		var failure = function() {
			// TODO indicate failure
		};
		promise.then(success, failure);

		intervalDataHttpServer.intervalDetails(params).then(function(result) {
			intervalData.intervalDetails = result;
		});
	};

	this.updateSearchHistory = function(intervalDevices, startDate, endDate) {
		var interval = moment(endDate).diff(moment(startDate), 'days');
		this.current.moveIN = moment(intervalDevices[0].moveIn).toDate();
		this.current.moveOUT = moment(intervalDevices[0].moveOut).toDate();

		if (intervalDevices.length>=1){
			let ArrayinstallDeviceFrom =[]
			let mindaterange=undefined;
			angular.forEach(intervalDevices, function(meter) {
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
		var urlPath = intervalData.isGas() ? details.downloadType === 'daily' ? "exportDailyGasIntervalData" : "exportHourlyGasIntervalData" :
			details.downloadType === 'daily' ? "exportDailyElecIntervalData" : "exportHalfHourlyElecIntervalData";

		if (!this.contractAccountNumber){
			this.contractAccountNumber = details.contractAccountNumber;
		}
		var contractAccountNumber = this.parentcontractAccountNumber === undefined ? this.contractAccountNumber : this.parentcontractAccountNumber+"/"+this.contractAccountNumber;
		var url = MyAccountServer + '/intervalData/' + contractAccountNumber + '/' + urlPath + '?startDate=' +
            encodeURIComponent(Utils.convertToHTML5Date(this.current.startDate)) + '&endDate=' +
            encodeURIComponent(Utils.convertToHTML5Date(moment(this.current.endDate).add(1, 'days').format(HTML5_DATE_FORMAT))) + '&childContractAccountNumber='+
            this.contractAccountNumber +'&generationTab='+ details.generationTab;

		if (this.current.meters){
			angular.forEach(this.current.meters, function(meter) {
				url += "&intervalDeviceIds=" + meter.deviceId;
			});
		} else {
			url += "&intervalDeviceIds=" + details.deviceId;
		}

		url += "&exportFormat=" + details.downloadFormat;

		return url;
	};

	this.exportDataSet = function(details) {
		var url = this.dataSetUrl(details);

		url += "&exportType=download";

		intervalDataHttpServer.tabularDownload(url);


	};

	this.emailDataSet = function(details) {
		var url = this.dataSetUrl(details);

		url += "&exportType=email";
		url += "&toEmail=" + encodeURIComponent( details.to );
		url += "&ccEmail=" + encodeURIComponent( details.cc );
		url += "&emailSubject=" + encodeURIComponent( details.subject );

		intervalDataHttpServer.sendDataEmail(url);


	};
});

angular.module('myaccount.route').factory('intervalDataHttpServer', function (http, Utils) {

	var intervalDataHttpServer = {


	}
	return UsageRecordsServer;
});
angular.module('myaccount.route').service('intervalDataHttpServer', function($http, $log, $q, HTML5_DATE_FORMAT, Modals, Utils) {
	this.loadElectricityData = function(queryParams) {
		var deferred = $q.defer();

		var interval = moment(queryParams.endDate).diff(moment(queryParams.startDate), 'days');
		var url = interval === 1 ? "getHalfHourlyElecIntervalData" : "getDailyElecIntervalData";
		var urlParams = {
			intervalDeviceIds: queryParams.intervalDeviceIds,
			startDate: Utils.convertToHTML5Date(queryParams.startDate),
			endDate: Utils.convertToHTML5Date(queryParams.endDate),
			childContractAccountNumber: queryParams.childContractAccountNumber
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

	this.getintervalDeviceList=function(queryParams){

		var deferred = $q.defer();

		var urlParams = {
			childContractAccountNumber: queryParams.childContractAccountNumber
		};
		var promise = $http({
			method: 'GET',
			url: '/intervalData/'+queryParams.contractAccountNumber+'/retrieveDevices',
			params: urlParams
		});

		var success = function(result) {
			deferred.resolve(result.data);
		};

		var failure = function(reason) {
			// $http filter should have caught this and displayed an error dialog
			$log.error('Error loading interval details for: ' + queryParams.contractAccountNumber + ', reason: ' + reason);
			deferred.reject(reason);
		};

		promise.then(success, failure);

		return deferred.promise;
	}

	this.intervalDetails=function(queryParams){
		//RetrieveIntervalDetails
		var deferred = $q.defer();


		var urlParams = {
			installationID: queryParams.installationId,
			startDate: Utils.convertToHTML5Date(queryParams.startDate),
			endDate: Utils.convertToHTML5Date(queryParams.endDate),
			childContractAccountNumber: queryParams.childContractAccountNumber
		};
		var promise = $http({
			method: 'GET',
			url: '/intervalData/'+queryParams.contractAccountNumber+'/retrieveIntervalDetails',
			params: urlParams
		});

		var success = function(result) {
			deferred.resolve(result.data);
		};

		var failure = function(reason) {
			// $http filter should have caught this and displayed an error dialog
			$log.error('Error loading interval details for: ' + queryParams.contractAccountNumber + ', reason: ' + reason);
			deferred.reject(reason);
		};

		promise.then(success, failure);

		return deferred.promise;
	}

	this.loadGasData = function(queryParams) {

		var deferred = $q.defer();

		var interval = moment(queryParams.endDate).diff(moment(queryParams.startDate), 'days');
		var url = interval === 1 ? "getHourlyGasIntervalData" : "getDailyGasIntervalData";
		var urlParams = {
			intervalDeviceIds: queryParams.intervalDeviceIds,
			startDate: Utils.convertToHTML5Date(queryParams.startDate),
			endDate: Utils.convertToHTML5Date(queryParams.endDate)
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
			headers: {'Content-Type': undefined}
		});

		document.body.appendChild(el);
		el.submit();
	};
});

