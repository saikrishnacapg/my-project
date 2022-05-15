/**
 * BANK: bsb 062039 a/c 123456789
 * CARD: 5123456789012346 expiry 05/17
 */
angular.module("myaccount.wizard").config([
	"formRegistryProvider",
	function (formRegistryProvider) {
		formRegistryProvider.registerForm({
			id: "directdebit-status",
			title: "Direct Debit",
			controller: [
				"$scope",
				"account",
				"formController",
				"Modals",
				"p2pdetails",
				"viewArrangementDetailsModel",
				function ($scope, account, formController, Modals, p2pdetails, viewArrangementDetailsModel) {
					var self = this;
					self.account = account;
					self.model = {};
					self.activeP2PSetting = p2pdetails;
					self.setupPayment = function (paymentType) {
						// FULL or SPLIT
						formController.addTask("directdebit-setup-payment", {
							paymentType: paymentType,
							account: self.account,
							hidePaymentPlan: paymentType === "SPLIT" ? true : false
						});
					};

					self.setupInstalments = function () {
						formController.addTask("directdebit-setup-instalments", {
							paymentType: "SPLIT",
							account: self.account
						});
					};

					self.updateInstalments = function () {
						formController.addTask("directdebit-update-instalments", {
							paymentType: "SPLIT",
							account: self.account,
							instalment: angular.copy(self.account.paymentInfo.directDebitInstalmentDetails)
						});
					};

					self.updateCardExpiry = function (paymentType) {
						// FULL or SPLIT
						formController.addTask("directdebit-update-card-expiry", {
							account: self.account,
							paymentType: paymentType,
							directDebit: self.account.paymentInfo.directDebitDetails,
							instalment: self.account.paymentInfo.directDebitInstalmentDetails
						});
					};

					self.cancelDirectDebit = function (type) {
						formController.addTask("directdebit-cancel", { type: type });
					};

					self.rebsRefundEnabled = !_.isEmpty(self.account.rebsRefund.bsbNumber);

					$scope.showCancelInfo = function () {
						Modals.showAlert("Instalment Cancellation", $rootScope.messages.MA_H26, {});
					};
					self.directDebitP2PExists = account.paymentInfo.directDebitP2PExists;
					if (self.directDebitP2PExists) {
						self.promiseToPayDetails = {
							instalmentFrequency: viewArrangementDetailsModel.instalmentFrequency,
							numberOfInstalments: viewArrangementDetailsModel.numberOfInstalments,
							startDate: viewArrangementDetailsModel.p2p_instalment[0].payment_date_promised,
							endDate: viewArrangementDetailsModel.p2p_header.last_due_date,
							paymentDetails: viewArrangementDetailsModel.p2p_payment_details[0],
							extensionAmount: viewArrangementDetailsModel.p2p_instalment[0].payment_amount_promised,
							isSinglePayment: viewArrangementDetailsModel.isSinglePayment
						};
					}
					self.openViewArrangement = function () {
						formController.addTask("viewArrangement");
					};
				}
			],
			controllerAs: "signUpCtrl",
			showProgress: false,
			authenticated: true,
			resolve: {
				account: [
					"formArgs",
					"Session",
					function (formArgs, Session) {
						return Session.getAccount(formArgs.contractAccountNumber);
					}
				],
				p2pdetails: [
					"formArgs",
					"Session",
					"DirectDebitServer",
					"Utils",
					function (formArgs, Session, DirectDebitServer, Utils) {
						if (!formArgs.contractAccountNumber) {
							return;
						}
						return Utils.promiseThen(DirectDebitServer.getActiveP2PSetting(formArgs.contractAccountNumber), function (
							result
						) {
							return result === "DD_P2P_Active" ? true : false;
						});
					}
				],
				viewArrangementDetailsModel: [
					"formArgs",
					"AccountBillServer",
					"ViewArrangementDetailsModel",
					"Utils",
					function (formArgs, AccountBillServer, ViewArrangementDetailsModel, Utils) {
						if (!formArgs.contractAccountNumber) {
							return;
						}
						return Utils.promiseThen(
							AccountBillServer.getPaymentArrangementDetails(formArgs.contractAccountNumber),
							function (result) {
								return ViewArrangementDetailsModel.build(result);
							}
						);
					}
				]
			},
			states: [
				{
					id: "status",
					title: "Status",
					templateUrl: "app/wizards/directdebit/directdebit-status.html",
					showNext: false
				}
			]
		});

		formRegistryProvider.registerForm({
			id: "directdebit-cancel",
			title: "Direct Debit",
			analytics: {
				formName: function (formArgs) {
					return formArgs.type === "due" ? "Manage Direct Debit cancel bill" : "Manage Direct Debit update instalments";
				},
				subFormId: function (formArgs) {
					return formArgs.type === "due" ? "bill" : "instalments";
				},
				completedFunction: function (state) {
					return state.$$idx === 2;
				}
			},
			controller: [
				"$log",
				"account",
				"formArgs",
				"Busy",
				"DirectDebitServer",
				"Utils",
				function ($log, account, formArgs, Busy, DirectDebitServer, Utils) {
					var self = this;
					this.account = account;
					this.model = {};

					this.feedback = {
						privacy: { label: "Security / Privacy concern" },
						bankFees: { label: "Overdrawn/late payment fees from your bank" },
						ccFees: { label: "Credit card transaction fees" },
						visibility: { label: "Lack of control and visibility on my payments" },
						reconcile: { label: "Unable to reconcile instalment payments and balance on bill" },
						other: { label: "Other (please specify)" }
					};

					this.cancelLabel = formArgs.type === "due" ? "what's owing when my bill is due" : "instalment payments";
					this.contactEmail = angular.copy(
						account.paperlessBillSetting.emailAddress
							? account.paperlessBillSetting.emailAddress
							: account.businessPartnerDetails.emailAddress
					);
					this.instalmentPaymentValue = this.cancelLabel === "instalment payments" ? false : true;
					this.cancelDirectDebit = function () {
						return DirectDebitServer.cancel(self.account.contractAccountNumber, formArgs.type).then(function () {
							if (formArgs.type === "instalment") {
								Utils.setGoal("Goal_DDI_Opt_Out");
							}
							if (formArgs.type === "due") {
								Utils.setGoal("Goal_DD_Opt_Out");
							}
						}); //TODO add cancel type;
					};

					this.submitFeedback = function () {
						var cancellationDetail = {
							reasons: self.cancellationReasons(),
							customerComment: self.feedback.other.reason,
							contact: self.contactMe,
							contactDetail: self.contactEmail,
							contactName:
								self.account.businessPartnerDetails.firstName +
								" " +
								self.account.businessPartnerDetails.lastName +
								" " +
								self.account.businessPartnerDetails.companyName
						};
						return DirectDebitServer.submitFeedback(this.account.contractAccountNumber, cancellationDetail);
					};

					this.cancellationReasons = function () {
						return _.chain(this.feedback)
							.filter(function (reason) {
								return reason.checked;
							})
							.pluck("label")
							.value();
					};
					this.LifestyleOrSolar = undefined;
					this.productName = undefined;
					this.eConnect = undefined;
					if (this.account.productDetails && this.account.productDetails.energyProductLabel) {
						if (this.account.productDetails.tariffType === "SLR" || this.account.productDetails.tariffType === "LFS") {
							this.LifestyleOrSolar = true;
							this.productName = this.account.productDetails.energyProductLabel;
							this.eConnect =
								this.account.paperlessBillSetting.isPaperless && this.account.paymentInfo.directDebitExists
									? true
									: false;
						}
					}
				}
			],
			controllerAs: "cancelCtrl",
			showProgress: true,
			authenticated: true,
			resolve: {
				account: [
					"formArgs",
					"Session",
					function (formArgs, Session) {
						return Session.getAccount(formArgs.contractAccountNumber);
					}
				]
			},
			states: [
				{
					id: "confirm-cancel",
					title: "Direct Debit",
					templateUrl: "app/wizards/directdebit/directdebit-confirm-cancel.html",
					nextMsg: "Confirm",
					checkpoint: true,
					progress: true,
					next: [
						"$scope",
						"Utils",
						function ($scope, Utils) {
							return Utils.promiseThen($scope.cancelCtrl.cancelDirectDebit(), function () {
								return "success-cancel";
							});
						}
					],
					exitOnBack: true,
					backMsg: "Close"
				},
				{
					id: "success-cancel",
					title: "Success",
					progress: true,
					templateUrl: "app/wizards/directdebit/directdebit-cancelled.html",
					nextMsg: "Submit feedback",
					next: [
						"$scope",
						"Utils",
						function ($scope, Utils) {
							return Utils.promiseThen($scope.cancelCtrl.submitFeedback(), function () {
								return "success-feedback";
							});
						}
					],
					exitOnBack: true,
					backMsg: "Close"
				},
				{
					id: "success-feedback",
					title: "Success",
					checkpoint: true,
					progress: true,
					completed: true,
					templateUrl: "app/wizards/directdebit/directdebit-feedback-success.html"
				}
			]
		});

		formRegistryProvider.registerForm({
			id: "directdebit-setup",
			title: "Direct Debit",
			analytics: {
				formName: "Direct Debit signup MA",
				startFunction: function (state) {
					return state.$$idx === 3;
				}
			},
			controller: [
				"$log",
				"account",
				"AccountUtils",
				"formArgs",
				function DirectDebitWizardCtrl($log, account, AccountUtils, formArgs) {
					this.account = account;
					this.model = {};
					this.isResidential = AccountUtils.isResidential(account);
					this.skipInstalmentOption = formArgs.skipInstalmentOption ? formArgs.skipInstalmentOption : false;

					this.directDebitWithInstalment = function () {
						return angular.isObject(self.account.paymentInfo) && self.account.paymentInfo.directDebitExists === true;
					};
				}
			],
			controllerAs: "signUpCtrl",
			showProgress: true,
			authenticated: true,
			resolve: {
				account: [
					"formArgs",
					"Session",
					function (formArgs, Session) {
						return Session.getAccount(formArgs.contractAccountNumber);
					}
				]
			},
			states: [
				{
					skip: [
						"$scope",
						function ($scope) {
							return $scope.signUpCtrl.account.paymentInfo.multipleFlag === false || $scope.signUpCtrl.active === true;
						}
					],
					id: "directdebit-disabled",
					progress: false,
					completed: true,
					templateUrl: "app/wizards/directdebit/directdebit-disabled.html"
				},
				{
					subflow: {
						id: "adddirectdebit",
						inject: function ($scope) {
							if ($scope.signUpCtrl.skipInstalmentOption) {
								return {
									account: $scope.signUpCtrl.account,
									model: $scope.signUpCtrl.model,
									nextState: "skipInstalmentOption",
									useButtonSelector: false,
									silentUpdate: false
								};
							} else {
								return {
									account: $scope.signUpCtrl.account,
									model: $scope.signUpCtrl.model,
									nextState: undefined,
									useButtonSelector: true,
									silentUpdate: false
								};
							}
						}
					}
				}
			]
		});
	}
]);
