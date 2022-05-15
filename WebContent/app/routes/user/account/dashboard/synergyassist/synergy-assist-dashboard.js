angular.module('myaccount.route').config(function ($stateProvider) {
	$stateProvider.state('user.account.dashboard.synergyassist', {
		disableAdobeAnalyticsTracking: true,
		views: {
			'synergyAssistView': {
				templateUrl: 'app/routes/user/account/dashboard/synergyassist/synergy-assist-dashboard.html',
				controller: 'SynergyAssistDashboardCtrl',
				controllerAs: 'synergyAssistDashCtrl'
			}
		},
		resolve: {
			caseManagementDetails: ['$q', 'account', 'Utils', 'SynergyAssistService', function ($q, account, Utils, SynergyAssistService) {
				return SynergyAssistService.getCaseManagementDetails(account.contractAccountNumber);
			}]
		}
	})
});

angular.module('myaccount.route').controller('SynergyAssistDashboardCtrl', function ($scope, $filter, Modals, Wizards, account, caseManagementDetails, SynergyAssistService) {
	var self = this;
	this.currentAccount = account;
	this.isCaseManaged = this.currentAccount && this.currentAccount.productDetails && this.currentAccount.productDetails.isCaseManaged;
	this.isSynergyAssist = this.currentAccount && this.currentAccount.productDetails && this.currentAccount.productDetails.isSynergyAssist;
	var p2pDetails = caseManagementDetails.p2pDetails;
	var synergyAssistDetails = caseManagementDetails.synergyAssistDetails;
	this.upcomingPayments = p2pDetails && p2pDetails.upcomingPayments && p2pDetails.upcomingPayments.length > 0 ? p2pDetails.upcomingPayments : [];
	if (synergyAssistDetails && synergyAssistDetails.caseHeader) {
		SynergyAssistService.initCaseDetails(synergyAssistDetails.caseHeader);
	}
	if (synergyAssistDetails && synergyAssistDetails.paymentDetails) {
		SynergyAssistService.initPaymentDetails(synergyAssistDetails.paymentDetails);
	}

	this.caseDetails = SynergyAssistService.caseDetails;
	this.paymentDetails = SynergyAssistService.paymentDetails;

	function calculatePercentages(amount) {
		var totalAmount = self.paymentDetails.totalBalance && self.paymentDetails.totalBalance > self.paymentDetails.totalPayment ? self.paymentDetails.totalBalance : Number(self.paymentDetails.totalPayment) + Number(self.paymentDetails.totalBalance);
		if (totalAmount) {
			return amount / totalAmount * 100
		}
	}
	// The payment bar.
	this.paymentBarWidth = calculatePercentages(self.paymentDetails.customerPayment)+"%";
	// The Synergy contribution bar.
	this.contributionBarWidth = calculatePercentages(
		self.paymentDetails.customerPayment + self.paymentDetails.synergyContribution
	)+"%";
	// The other credits bar.
	this.otherCreditsBarWidth = calculatePercentages(
		self.paymentDetails.customerPayment + self.paymentDetails.synergyContribution + self.paymentDetails.otherCredit
	)+"%";

	this.showCaseManagerInfo = function () {
		var caseManagerText= self.caseDetails.caseManagerName ? "As a customer on the case management program, your case manager is "+ self.caseDetails.caseManagerName +". " : "";
		var text =
            "<p>" + caseManagerText +
            "If you need any help with your repayment plan or would you like to talk about your account, please call " +
            "<a data-event='site-interaction' data-location='body' data-description='" + self.caseDetails.formattedContactNumber + "' data-type='click to call'" +
            " href='tel:" + self.caseDetails.formattedContactNumber + "'>" + self.caseDetails.contactNumber + " </a>" +
            " between " + self.caseDetails.contactTime + "."
            + "</p>";
		Modals.showAlert('Your case manager', text);
	};

	this.openSynergyAssistPlan = function () {
		Wizards.openSynergyAssistPlan(self.currentAccount.contractAccountNumber);
	};

	this.getStatusClass=function(status) {
		return SynergyAssistService.getStatusClass(status);
	};
	this.showStatus=function(status) {
		var statusClass= SynergyAssistService.getStatusClass(status);
		if (statusClass==="owing" || statusClass==="overdue"){
			return true;
		}
		return false;
	};
})
