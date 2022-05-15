angular.module('myaccount.route').config(function ($stateProvider) {
	// Resolve a child account from the childAccountIdentifier route parameter
	let resolveChildAccount = [
		'$stateParams',
		'$q',
		'$log',
		'Session',
		'user',
		'account',
		function ($stateParams, $q, $log, Session, user, account) {
			if ($stateParams.childAccountIdentifier) {
				return _.find(account.collectiveDetails.childAccounts, function (it) {
					return (it.accountIdentifier === $stateParams.childAccountIdentifier && (!$stateParams.contractIdentifier || $stateParams.contractIdentifier === it.contractIdentifier)
					);
				});
			}
		}
	];

	// Fetch consumption data
	let resolveConsumptionData = [
		'$stateParams',
		'$q',
		'$log',
		'Session',
		'UsageCustomSearch',
		'UsageRecordsServer',
		'user',
		'account',
		'childAccount',
		function ($stateParams, $q, $log, Session, UsageCustomSearch, UsageRecordsServer, user, account, childAccount) {
			if (UsageCustomSearch.active) {
				// Do the custom search
				let promise = UsageRecordsServer.getConsumptionHistory(account, childAccount, UsageCustomSearch);
				return promise.then(function (result) {
					return UsageRecordsServer.appendanyTimeUsage(result);
				});
			}
			// Perform a default search
			if (account.collective && childAccount) {
				// Return the child account data over the default consumptionHistory
				let promise = UsageRecordsServer.getConsumptionHistory(account, childAccount, account.consumptionHistory.supplyPeriod);
				return promise.then(result => UsageRecordsServer.appendanyTimeUsage(result));
			}
			// Return a copy of the default consumptionHistory
			return angular.copy(UsageRecordsServer.appendanyTimeUsage(account.consumptionHistory));
		}
	];

	$stateProvider.state('user.account.usage', {
		url: 'usage/?childAccountIdentifier&contractIdentifier',
		templateUrl: 'app/routes/user/account/usage/usage.html',
		controller: 'UsageCtrl',
		controllerAs: 'usageCtrl',
		resolve: { childAccount: resolveChildAccount, consumptionData: resolveConsumptionData }
	});
});

/**
 * Following search is maintained as a constant
 */
angular.module('myaccount.route').value('UsageCustomSearch', {
	active: false, // Becomes true when the user clicks the search button
	startDate: undefined,
	endDate: undefined
});

angular
	.module('myaccount.route')
	.controller('UsageCtrl', function (
		$scope,
		$state,
		Utils,
		account,
		childAccount,
		consumptionData,
		UsageCustomSearch,
		UsageRecordsServer,
		AccountUtils,
		Modals,
		UsageCtrlService,
		MyAccountServer
	) {
		let self = this;
		let increment = 6;

		function usageContains(records, usageType) {
			return _.any(records, record => _.isNumber(record[usageType]));
		}

		function usageContainsZero(records, usageType) {
			let validatedvalue = false;
			let countvalidatedvalue = 0;
			if (usageType === 'periodTotal') {
				angular.forEach(records, function (value, index) {
				    let bandsTotal = value.offPeakUsage + value.weekEndShoulder + value.peakUsage + value.weekDayShoulder + value.superPeak + value.standardHome + value.evOffPeak + value.midDaySaver;
					if (_.isNumber(value[usageType])) {
						if (value.offPeakUsage === 0 && value.weekEndShoulder === 0 && value.peakUsage === 0 && value.weekDayShoulder === 0 && value.superPeak === 0 && value.standardHome === 0 && value.evOffPeak === 0 && value.midDaySaver === 0) {
							countvalidatedvalue++;
							validatedvalue = true;
						} else if (bandsTotal !== value.periodTotal) {
							return validatedvalue;
						}
					}
				});
			} else {
				angular.forEach(records, function (value, index) {
					if (_.isNumber(value[usageType])) {
						if (value[usageType] > 0) {
							validatedvalue = true;
						}
					}
				});
				if (countvalidatedvalue === records.length && countvalidatedvalue > 0) {
					validatedvalue = true;
				} else if (countvalidatedvalue !== records.length && countvalidatedvalue > 0) {
					validatedvalue = false;
				}
				return validatedvalue;
			}
			return validatedvalue;
		}
		function updateUsageTypes(records) {
			self.hasRenExport = usageContains(records, 'solarExportKwh');
			self.hasOffPeakUsage = usageContainsZero(records, 'offPeakUsage');
			self.hasWeekEndShoulder = usageContainsZero(records, 'weekEndShoulder');
			self.hasPeakUsage = usageContainsZero(records, 'peakUsage');
			self.hasWeekDayShoulder = usageContainsZero(records, 'weekDayShoulder');
			self.hasRenConsumption = false;
			self.hasSuperPeak = usageContainsZero(records, 'superPeak');
			self.hasStandardHome = usageContainsZero(records, 'standardHome');
			self.hasEVOffPeak = usageContainsZero(records, 'evOffPeak');
			self.hasMidDaySaver = usageContainsZero(records, 'midDaySaver');
			self.hasPeriodTotal = usageContainsZero(records, 'periodTotal');
			self.hasOffsetBatteryUnits = usageContainsZero(records, 'offsetBatteryUnits');
		}
		this.account = account;
		this.childAccount = childAccount;
		this.consumptionData = consumptionData;
		updateUsageTypes(self.consumptionData.records);
		this.mode = $scope.accountCtrl.isAmiCustomer()
			? 'ami-interval'
			: Utils.activeTabI === 'interval'
				? 'interval'
				: 'consumption';
		this.premiseDetails = account.premiseDetails;
		this.maxRangeValue = '730';
		_.each(account.collectiveDetails.childAccounts, function (child) {
			child.label = `${child.contractAccountNumber} / ${child.contract} - ${child.premiseAddress.label}`;
		});

		// Initialise the UsageSearch to the same values as the default consumptionData
		UsageCustomSearch.startDate = moment(self.consumptionData.supplyPeriod.startDate).toDate();
		UsageCustomSearch.endDate = moment(self.consumptionData.supplyPeriod.endDate).toDate();

		this.startDate = moment(self.consumptionData.supplyPeriod.startDate).toDate();
		this.endDate = moment(self.consumptionData.supplyPeriod.endDate).toDate();

		UsageCtrlService.startDate = this.startDate;
		UsageCtrlService.endDate = this.endDate;

		this.pastCutoffDate = function () {
            return UsageCtrlService.pastCutoffDate(this.startDate);
        };

        this.startDateAfterEndDate = function() {
            return UsageCtrlService.startDateAfterEndDate(this.startDate, this.endDate);
        };

        this.overMaxRange = function() {
            return UsageCtrlService.overMaxRange(this.startDate, this.endDate, this.maxRangeValue);
        };

        this.endDateIsInFuture = function() {
            return UsageCtrlService.endDateIsInFuture(this.startDate);
        };

		this.valid = function () {
			return !(this.pastCutoffDate() || this.startDateAfterEndDate() || this.overMaxRange() || this.endDateIsInFuture());
		};

		this.cutoffDateReached = function () {
			return !moment(self.consumptionData.supplyPeriod.startDate).isAfter(AccountUtils.usageCutoff);
		};

		this.fetchPreviousRecords = function () {
			let endDate = moment(self.consumptionData.supplyPeriod.startDate).subtract(1, 'days').endOf('day');
			let startDate = moment(endDate).subtract(increment, 'months').startOf('day');

			let supplyPeriod = { startDate: startDate.toDate(), endDate: endDate.toDate() };

			let promise = UsageRecordsServer.getConsumptionHistory(account, childAccount, supplyPeriod);
			promise.then(function (result) {
				self.consumptionData.supplyPeriod.startDate = result.supplyPeriod.startDate;
				self.consumptionData.records = self.consumptionData.records.concat(result.records);
				UsageRecordsServer.appendanyTimeUsage(self.consumptionData);
				self.consumptionData.timestamp = result.timestamp;
			});
		};
		this.search = function () {
			let promise = Modals.showDateRange(UsageCustomSearch);
			promise.then(function (result) {
				UsageCustomSearch.active = true;
				let promise2 = UsageRecordsServer.getConsumptionHistory(account, childAccount, UsageCustomSearch);
				promise2.then(function (result) {
					self.consumptionData = result;
					UsageRecordsServer.appendanyTimeUsage(self.consumptionData);
				});
			});
		};

		this.searchDisplay = function () {
			UsageCustomSearch.active = true;
			UsageCustomSearch.startDate = moment(this.startDate).toDate();
			UsageCustomSearch.endDate = moment(this.endDate).toDate();
			UsageCtrlService.startDate = this.startDate;
			UsageCtrlService.endDate = this.endDate;
			let promise2 = UsageRecordsServer.getConsumptionHistory(account, childAccount, UsageCustomSearch);
			promise2.then(function (result) {
				self.consumptionData = UsageRecordsServer.appendanyTimeUsage(result);
				updateUsageTypes(self.consumptionData.records);
			});
		};

		this.selectChildAccount = function () {
			$state.go('user.account.usage', {
				childAccountIdentifier: self.childAccount.accountIdentifier,
				contractIdentifier: self.childAccount.contractIdentifier
			});
		};

		this.reset = function () {
			UsageCustomSearch.active = false;
			$state.reload();
		};

		this.eligibleIntervalDataCustomers = function () {
			return AccountUtils.isResidential(account) && !_.isEmpty(account.installationDetails.intervalDevices);
		};

		this.eligibleAmiIntervalDataCustomers = function () {
			return $scope.accountCtrl.isAmiCustomer();
		};

		this.printUsageSummary = function () {
			this.eventTracking('print');
			window.print();
		};

		this.exportConsumptionHistoryToCSV = function () {
			this.eventTracking('csv');
			UsageRecordsServer.exportConsumptionHistory(account.contractAccountNumber, this.startDate, this.endDate, 'download', 'csv');
		};

		this.exportConsumptionHistoryToPDF = function () {
			this.eventTracking('pdf');
			UsageRecordsServer.exportConsumptionHistory(account.contractAccountNumber, this.startDate, this.endDate, 'download', 'pdf');
		};

		this.eventTracking = function (attrs) {
			let category1,
				title,
				label1 = {};
			switch (attrs) {
			case 'pdf':
				title = 'Export PDF';
				category1 = 'Link click';
				label1 = 'MA – Consumption History';
				break;
			case 'csv':
				title = 'Export CSV';
				category1 = 'Link click';
				label1 = 'MA – Consumption History';
				break;
			case 'print':
				title = 'Print';
				category1 = 'Link click';
				label1 = 'MA – Consumption History';
				break;
			}
		};
		this.setDataMode = function (mode, buttonClass) {
			$('.btn-chart').removeClass('activeButton');
			$(`.${buttonClass}`).addClass('activeButton');
			self.mode = mode;
		};
	});

angular.module('myaccount.route').service('UsageCtrlService', function () {
	const cutoffDate = moment('2009 01 01', 'YYYY MM DD');
	const today = moment().endOf('day');

	this.pastCutoffDate = (date) => {
		return _.isEmpty(date) ? false : moment(date).isBefore(cutoffDate);
	};

	this.startDateAfterEndDate = (startDate, endDate) => {
		return _.isEmpty(startDate) || _.isEmpty(endDate) ? false : moment(startDate).isAfter(endDate);
	};

	this.overMaxRange = (startDate, endDate, days) => {
		return Math.abs(moment(endDate).diff(moment(startDate), 'days')) > days;
	};

	this.checkMoveInDate = (startDate, endDate, filter) => {
		return moment(filter.start.min).isAfter(startDate);
	};

	this.checkMoveOutDate = (startDate, endDate, filter) => {
		return moment(filter.end.max).isBefore(endDate);
	};

	this.endDateIsInFuture = date => {
		return moment(date).isAfter(today);
	};
});

angular.module('myaccount.route').factory('UsageRecordsServer', function (http, Utils, MyAccountServer) {
	let UsageRecordsServer = {
		getConsumptionHistory: function (account, childAccount, supplyPeriod) {
			return childAccount
				? UsageRecordsServer.getChildConsumptionHistory(
					account.contractAccountNumber,
					childAccount.contractAccountNumber,
					supplyPeriod.startDate,
					supplyPeriod.endDate,
					childAccount.contract
				  )
				: UsageRecordsServer.getAccountConsumptionHistory(
					account.contractAccountNumber,
					supplyPeriod.startDate,
					supplyPeriod.endDate
				  );
		},
		getAccountConsumptionHistory: function (contractAccountNumber, startDate, endDate) {
			return http({
				method: 'POST',
				url: `/accountRecords/${contractAccountNumber}/getConsumptionHistory`,
				params: {
					startDate: Utils.convertToHTML5Date(startDate),
					endDate: Utils.convertToHTML5Date(endDate)
				}
			});
		},
		getChildConsumptionHistory: function (
			parentContractAccountNumber,
			childContractAccountNumber,
			startDate,
			endDate,
			contract
		) {
			return http({
				method: 'POST',
				url: `/accountRecords/${parentContractAccountNumber}/${childContractAccountNumber}/getConsumptionHistory`,
				params: {
					contract: contract,
					startDate: Utils.convertToHTML5Date(startDate),
					endDate: Utils.convertToHTML5Date(endDate)
				}
			});
		},
		exportConsumptionHistory: function (contractAccountNumber, startDate, endDate, exportType, exportFormat) {
			let el = document.createElement('form');
			angular.extend(el, {
				method: 'post',
				action: `${MyAccountServer}/accountRecords/${contractAccountNumber}/exportConsumptionHistory?startDate=${Utils.convertToHTML5Date(startDate)}&endDate=${Utils.convertToHTML5Date(endDate)}&exportType=${exportType}&exportFormat=${exportFormat}`,
				target: '_blank',
				headers: { 'Content-Type': undefined },
				params: {
					startDate: Utils.convertToHTML5Date(startDate),
					endDate: Utils.convertToHTML5Date(endDate),
					exportType: exportType,
					exportFormat: exportFormat
				}
			});
			document.body.appendChild(el);
			el.submit();
		},
		emailUsageSummary: function (contractAccountNumber, startDate, endDate, exportType, exportFormat, emailId) {
			return http({
				method: 'POST',
				url: `/accountRecords/${contractAccountNumber}/exportConsumptionHistory`,
				params: {
					startDate: Utils.convertToHTML5Date(startDate),
					endDate: Utils.convertToHTML5Date(endDate),
					exportType: exportType,
					exportFormat: exportFormat,
					emailId: emailId
				}
			});
		},

		appendanyTimeUsage: function (consumptionData) {
			if (consumptionData.records !== undefined) {
				if (consumptionData.records.length > 0) {
					angular.forEach(consumptionData.records, function (value, index) {
						let bandsTotal = value.offPeakUsage + value.weekEndShoulder + value.peakUsage + value.weekDayShoulder + value.superPeak + value.standardHome + value.evOffPeak + value.midDaySaver;
						if (_.isNumber(value.periodTotal)) {
							if (value.offPeakUsage === 0 && value.weekEndShoulder === 0 && value.peakUsage === 0 && value.weekDayShoulder === 0 && value.superPeak === 0 && value.standardHome === 0 && value.evOffPeak === 0 && value.midDaySaver === 0) {
								value.anyTimeUsage = value.periodTotal;
							} else if (bandsTotal !== value.periodTotal) {
								let totalusage_val = value.periodTotal - bandsTotal;
								value.anyTimeUsage = totalusage_val > 0 ? totalusage_val : 0;
							} else {
								value.anyTimeUsage = 0;
							}
						}
					});
				}
			}
			return consumptionData;
		}
	};
	return UsageRecordsServer;
});
