angular.module("myaccount.wizard").config([
	"formRegistryProvider",
	"arrangementConstants",
	function (formRegistryProvider, arrangementConstants) {
		formRegistryProvider.registerForm({
			id: "viewArrangement",
			title: "Your payment arrangement",
			analytics: {
				formName: "view payment arrangement"
			},
			controller: [
				"viewArrangementDetailsModel",
				"account",
				"$filter",
				"formController",
				"isAtRisk",
				"$scope",
				function (viewArrangementDetailsModel, account, $filter, formController, isAtRisk, $scope) {
					this.contractAccountType = account.contractAccountType;
					this.viewArrangementDetails = viewArrangementDetailsModel;
					this.paymentArrangementData = this.viewArrangementDetails.p2p_instalment;
					this.date = $filter("date")(new Date(), "yyyy-MM-dd");
					this.data = [];
					this.paidFlag = false;
					this.trackToChangeCustomer = account.productDetails.isTrackToChange;
					this.duesCheck = false;
					var self = this;
					var flagUpcoming = false;
					angular.forEach(this.paymentArrangementData, function (value) {
						if (value.outstanding_amount > 0) {
							self.duesCheck = true;
							var GivenDate = $filter("date")(new Date(value.payment_date_promised), "yyyy-MM-dd");
							if (GivenDate === self.date) {
								value.status = "Due";
							} else if (GivenDate > self.date) {
								if (!flagUpcoming) {
									value.status = "Upcoming";
									flagUpcoming = true;
								} else {
									value.status = "";
								}
							} else if (GivenDate < self.date) {
								value.status = "Overdue";
							}
						} else {
							self.paidFlag = true;
							value.status = "Paid";
						}
						self.data.push(value);
					});
					this.getCustomerAccountTypePhone = function () {
						self = this;
						self.phoneNumberDisplay = "";
						if (isAtRisk) {
							self.phoneNumberDisplay = arrangementConstants.phoneNumber.SYNERGY_ENGAGE;
						} else {
							if (self.trackToChangeCustomer) {
								if (account.productDetails.isTrackToChange) {
									self.phoneNumberDisplay = arrangementConstants.phoneNumber.TRACK_TO_CHANGE_CUSTOMER_NUMBER;
								}
							} else {
								if (self.contractAccountType === "RESD") {
									self.phoneNumberDisplay = arrangementConstants.phoneNumber.RESIDENTIAL;
								} else {
									self.phoneNumberDisplay = arrangementConstants.phoneNumber.BUSINESS;
								}
							}
						}
						return self.phoneNumberDisplay;
					};
					this.contractAccountNumber = account.contractAccountNumber;
					this.directDebitbalanceList = account.accountBalanceSummary.directDebitbalanceList;
					this.totalOwingOnAccount = account.accountBalanceSummary.accountBalance.amount;
					this.isAtRisk = isAtRisk;
					if (this.isAtRisk) {
						$scope.$parent.wizard.changeTitle("Your payment plan");
					}
					this.isSinglePayment = this.viewArrangementDetails.isSinglePayment;
					this.paymentsLabel = this.isSinglePayment ? "payment" : "payments";
					this.amountsLabel = this.isSinglePayment ? "this amount" : "these amounts";
					this.isPaid = this.viewArrangementDetails.isPaid;
					this.eligibleToAmend = this.viewArrangementDetails.eligibleToAmend;
					if (this.directDebitbalanceList.length > 0) {
						angular.forEach(this.directDebitbalanceList, function (value) {
							if (value.category === arrangementConstants.accountSummaryCategory.IS_ACCOUNT_OVERDUE) {
								self.isOverdue = true;
								self.overdueAmount = value.amount;
							} else if (value.category === arrangementConstants.accountSummaryCategory.IS_NEW_BILL) {
								self.hasNewBill = true;
								self.newBillAmount = value.amount;
								self.newBillDueDate = value.text.substring(4);
							}
						});
					}
					if (this.viewArrangementDetails.hasP2PDirectDebit) {
						this.paymentDetails = this.viewArrangementDetails.p2p_payment_details[0];
						if (this.paymentDetails.payment_method === "card") {
							this.maskedPaymentDetails = this.paymentDetails.cc_num;
							this.isCard = true;
						} else if (this.paymentDetails.payment_method === "bank") {
							this.maskedPaymentDetails = this.paymentDetails.bank_account;
							this.isBank = true;
						}
					} else if (!this.viewArrangementDetails.hasP2PDirectDebit) {
						this.paymentDetails = {
							bank_name: "",
							cc_expiry: "",
							cc_type: "",
							cc_name: "",
							bsb_number: "",
							bank_account: "",
							cc_num: "",
							payment_method: ""
						};
					}
					this.modelCurrentArrangement = {
						promiseNumber: this.viewArrangementDetails.p2p_header.promise,
						paymentType: this.viewArrangementDetails.hasP2PDirectDebit ? "DD" : "MANUAL",
						paymentDetails: this.paymentDetails,
						totalP2PAmount: this.viewArrangementDetails.p2p_header.total_amount_promised,
						totalOwingOnAccount: this.totalOwingOnAccount,
						numberOfInstalments: this.viewArrangementDetails.numberOfInstalments,
						instalmentsSchedule: [],
						hasP2PDirectDebit: this.viewArrangementDetails.hasP2PDirectDebit,
						paymentFreq: this.viewArrangementDetails.instalmentFrequency,
						startDate: this.paymentArrangementData[0].payment_date_promised
					};
					this.engageP2P =
						this.viewArrangementDetails.p2p_header.reason ===
						arrangementConstants.promiseToPayReasonCode.SYNERGY_ENGAGE;
					this.showDropdown =
						this.engageP2P && !this.isPaid && (this.isAtRisk || this.viewArrangementDetails.hasP2PDirectDebit);
					this.modifyArrangement = function (modifyPath) {
						var self = this;
						if (modifyPath === "CANCEL_DD" || modifyPath === "UPDATE_PAYMENT") {
							self.modelCurrentArrangement.instalmentsSchedule = [];
							angular.forEach(self.viewArrangementDetails.p2p_instalment, function (value) {
								if (value.outstanding_amount > 0) {
									self.modelCurrentArrangement.instalmentsSchedule.push({
										date: $filter("date")(new Date(value.payment_date_promised), "yyyy-MM-dd"),
										amount: value.payment_amount_promised
									});
								}
							});
						}
						formController.addTask("arrangement-modify", {
							contractAccountNumber: self.contractAccountNumber,
							modelCurrentArrangement: self.modelCurrentArrangement,
							modifyPath: modifyPath,
							paymentNumber: account.paymentInfo.paymentNumber,
							customerAccountTypePhone: self.phoneNumberDisplay
						});
					};
					this.cancelArrangement = function () {
						var self = this;
						formController.addTask("arrangement-cancel", {
							promiseNumber: self.viewArrangementDetails.p2p_header.promise,
							arrangementTotalOutstandingAmount: self.viewArrangementDetails.p2p_header.total_amount_outstanding,
							hasNewBill: self.hasNewBill,
							isOverdue: self.isOverdue
						});
					};
					this.isPaymentExtension =
						self.viewArrangementDetails.p2p_type === arrangementConstants.promiseToPayTypes.PAYMENT_EXTENSION;
				}
			],
			controllerAs: "viewArrangementCtrl",
			authenticated: true,
			resolve: {
				account: [
					"formArgs",
					"Session",
					function (formArgs, Session) {
						return formArgs.contractAccountNumber ? Session.getAccount(formArgs.contractAccountNumber) : undefined;
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
				],
				isAtRisk: [
					"formArgs",
					"ArrangementServer",
					"Utils",
					function (formArgs, ArrangementServer, Utils) {
						if (!formArgs.contractAccountNumber) {
							return;
						}
						return Utils.promiseThen(ArrangementServer.getAtRiskFlag(formArgs.contractAccountNumber), function (
							result
						) {
							return result.isAtRisk;
						});
					}
				]
			},
			states: [
				{
					skip: ['$scope', function ($scope) {
						return ($scope.viewArrangementCtrl.trackToChangeCustomer && $scope.viewArrangementCtrl.duesCheck);
					}],
					id: "view-arrangement-details",
					title: "View arrangement details",
					templateUrl: "app/wizards/view-arrangement/view-arrangement-method.html",
					nextMsg: "Pay now",
					next: [
						function () {
							return "^paymentOptions";
						}
					]
				},
				{
					id: "view-arrangement-details-new",
					title: "View arrangement details",
					templateUrl: "app/wizards/view-arrangement/view-arrangement-method.html",
					nextMsg: "Make a Payment",
					next: [
						function () {
							return "^makepaymentp2p";
						}
					]
				}
			]
		});
	}
]);

angular.module("myaccount.wizard").factory("ViewArrangementDetailsModel", function () {
	function ViewArrangementDetailsModel(
		p2p_type,
		p2p_header,
		p2p_instalment,
		p2p_payment_details,
		hasP2PInstalment,
		hasP2PDirectDebit,
		numberOfInstalments,
		instalmentFrequency,
		isPaid,
		eligibleToAmend,
		isSinglePayment
	) {
		this.p2p_type = p2p_type;
		this.p2p_header = p2p_header;
		this.p2p_instalment = p2p_instalment;
		this.p2p_payment_details = p2p_payment_details;
		this.hasP2PInstalment = hasP2PInstalment;
		this.hasP2PDirectDebit = hasP2PDirectDebit;
		this.numberOfInstalments = numberOfInstalments;
		this.instalmentFrequency = instalmentFrequency;
		this.isPaid = isPaid;
		this.eligibleToAmend = eligibleToAmend;
		this.isSinglePayment = isSinglePayment;
	}

	ViewArrangementDetailsModel.build = function (viewArrangementData) {
		if (_.isEmpty(viewArrangementData)) {
			return;
		}
		return new ViewArrangementDetailsModel(
			viewArrangementData.p2p_type,
			viewArrangementData.p2p_header,
			viewArrangementData.p2p_instalment,
			viewArrangementData.p2p_payment_details,
			viewArrangementData.hasP2PInstalment,
			viewArrangementData.hasP2PDirectDebit,
			viewArrangementData.numberOfInstalments,
			viewArrangementData.instalmentFrequency,
			viewArrangementData.isPaid,
			viewArrangementData.eligibleToAmend,
			viewArrangementData.isSinglePayment
		);
	};
	return ViewArrangementDetailsModel;
});
