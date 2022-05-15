
angular.module('myaccount.route').config(function($stateProvider) {
	$stateProvider.state('user.account.activitystatement', {
		url: 'activitystatement',
		templateUrl: "app/routes/user/account/activitystatement/activity-statement.html",
		controller: "ActivityStatementCtrl",
		controllerAs: "ActivityStatementCtrl"
	});
});

angular.module('myaccount.route').controller('ActivityStatementCtrl', function($scope, ActivityStatementCtrlService, HTML5_DATE_FORMAT, activityStatementService, activityService, bowser, Modals) {
	var self = this;
	this.account = $scope.accountCtrl.currentAccount;
	this.contractAccNumber = this.account.contractAccountNumber;
	this.billPeriods = this.account.consumptionHistory.records;
	var latestBill = _.find(this.billPeriods, {'billIsNew': true});
	this.startDate=moment(latestBill.supplyPeriod.startDate).format(HTML5_DATE_FORMAT);
	this.endDate=moment(latestBill.supplyPeriod.endDate).format(HTML5_DATE_FORMAT);
	this.productCode='SE_RES_T01';
	this.productToCompare='SE_RES_A1';
	this.maxRangeValue = "365";
	this.calenderMinDate=moment('2020-11-19').format(HTML5_DATE_FORMAT);
	self.bowser = bowser;
	self.browserName = bowser.name;
	self.hide = false;
    this.displayOption='percentage';
	this.percentageVaue=true;

	this.filter = {
		end: {
			max:  moment()
		},
		start: {
			min:  this.calenderMinDate
		}
	};
	this.inputDates =activityStatementService.getInputDates(this.startDate, this.endDate);
	activityStatementService.landingActivityStatementSearch(this.contractAccNumber, this.productCode, this.productToCompare, this.inputDates);

	this.searchDisplay = function() {
		this.inputDates =activityStatementService.getInputDates(this.startDate, this.endDate);
		activityStatementService.search(this.contractAccNumber, this.productCode, this.productToCompare, this.inputDates);
	}

	this.valid = function() {
		return !(this.pastCutoffDate() || this.startDateAfterEndDate() || this.overMaxRange() || this.endDateIsInFuture());
	};

	this.pastCutoffDate = function () {
		return ActivityStatementCtrlService.pastCutoffDate(this.startDate);
	};

	this.startDateAfterEndDate = function() {
		return ActivityStatementCtrlService.startDateAfterEndDate(this.startDate, this.endDate);
	};

	this.overMaxRange = function() {
		return ActivityStatementCtrlService.overMaxRange(this.startDate, this.endDate, this.maxRangeValue);
	};

	this.endDateIsInFuture = function() {
		return ActivityStatementCtrlService.endDateIsInFuture(this.endDate);
	};

	this.valid = function() {
		return !(this.pastCutoffDate() || this.startDateAfterEndDate() || this.overMaxRange() || this.endDateIsInFuture());
	};
	self.isCompatible = function() {
		if (bowser.msie) {
			return true;
		} else {
			return false;
		}
	}
	self.closeBanner = function(){
		self.hide = true;
	}
	this.showHelpText = function(title, text) {
		Modals.showAlert(title, text);
	};
	this.ctrlActivityServices=activityService;
});

angular.module('myaccount.route').service('ActivityStatementCtrlService', function () {
	this.cutoffDate = moment("2009 01 01", "YYYY MM DD");
	this.today = moment().endOf('day');

	this.pastCutoffDate = function (date) {
		if (_.isEmpty(date)) {
			return false;
		}
		return moment(date).isBefore(this.cutoffDate);
	};

	this.startDateAfterEndDate = function (startDate, endDate) {
		if (_.isEmpty(startDate) || _.isEmpty(startDate)) {
			return false;
		}

		return moment(startDate).isAfter(endDate);
	};

	this.overMaxRange = function (startDate, endDate, days) {
		return Math.abs(moment(endDate).diff(moment(startDate), 'days')) > days;
	};

	this.checkMoveInDate = function (startDate, endDate, filter) {
		return moment(filter.start.min).isAfter(endDate);
	};

	this.checkMoveOutDate = function (startDate, endDate, filter) {
		return moment(filter.end.max).isBefore(endDate);
	};

	this.endDateIsInFuture = function (date) {
		return moment(date).isAfter(this.today);
	};
});
