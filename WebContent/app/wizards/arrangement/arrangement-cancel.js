angular.module("myaccount.wizard").config([
	"formRegistryProvider",
	function (formRegistryProvider) {
		formRegistryProvider.registerForm({
			id: "arrangement-cancel",
			title: "Your payment arrangement",
			analytics: {
				startFunction: state => false
			},
			controller: [
				"account",
				"formArgs",
				"ArrangementServer",
				"AccountUtils",
				function (account, formArgs, ArrangementServer, AccountUtils) {
					var self = this;
					self.account = account;
					self.promiseNumber = formArgs.promiseNumber;
					self.arrangementTotalOutstandingAmount = formArgs.arrangementTotalOutstandingAmount;
					self.totalOwingOnAccount = this.account.accountBalanceSummary.accountBalance.amount;
					self.hasNewBill = formArgs.hasNewBill;
					self.isOverdue = formArgs.isOverdue;
					self.termsAccepted = false;
					self.helpAndAdviceUrl = () =>
						AccountUtils.isResidential(account) ? "faq.payments.residential" : "faq.payments.business";
					self.cancelArrangement = function () {
						ArrangementServer.cancelPaymentArrangement(
							self.account.contractAccountNumber,
							"CANCEL",
							self.promiseNumber
						);
					};
				}
			],
			controllerAs: "cancelArrangementCtrl",
			showProgress: true,
			authenticated: true,
			resolve: {
				account: ["formArgs", "Session", (formArgs, Session) => Session.getAccount(formArgs.contractAccountNumber)]
			},
			states: [
				{
					id: "arrangement-confirm-cancel",
					title: "Arrangement confirm cancel",
					templateUrl: "app/wizards/arrangement/arrangement-cancel.html",
					nextMsg: "Confirm",
					checkpoint: true,
					progress: true,
					disableNext: $scope => !$scope.cancelArrangementCtrl.termsAccepted,
					next: [
						"$scope",
						function ($scope) {
							$scope.wizard.context.navbar.disableNext = true;
							$scope.cancelArrangementCtrl.cancelArrangement();
							return "arrangement-confirm-cancel-success";
						}
					],
					backMsg: "Back"
				},
				{
					id: "arrangement-confirm-cancel-success",
					title: "Arrangement confirm cancel success",
					templateUrl: "app/wizards/arrangement/arrangement-cancelled.html",
					nextMsg: "Close",
					checkpoint: true,
					completed: true,
					next: ["Wizards", Wizards => Wizards.close()]
				}
			]
		});
	}
]);
