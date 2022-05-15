angular.module('myaccount.wizard').config([
	'formRegistryProvider',
	'arrangementConstants',
	function (formRegistryProvider, arrangementConstants) {
		formRegistryProvider.registerForm({
			id: 'arrangement-modify',
			title: 'Your payment plan',
			analytics: {
				startFunction: function (state) {
					return false;
				}
			},
			controller: [
				'formArgs',
				'arrangementMaxStartDate',
				'Modals',
				'ArrangementServer',
				'account',
				'Utils',
				'DateUtils',
				'$scope',
				function (formArgs, arrangementMaxStartDate, Modals, ArrangementServer, account, Utils, DateUtils, $scope) {
					var self = this;
					self.account = account;
					self.contractAccountNumber = formArgs.contractAccountNumber;
					self.modelCurrentArrangement = formArgs.modelCurrentArrangement;
					self.modifyPath = formArgs.modifyPath;
					self.paymentNumber = formArgs.paymentNumber;
					self.customerAccountTypePhone = formArgs.customerAccountTypePhone;
					const { maxDate, maxDateWeekly, maxDateFortnightly } = arrangementMaxStartDate;
					self.maxDateSingle = DateUtils.formatPaymentArrangementDate(maxDate);
					self.maxDateWeekly = DateUtils.formatPaymentArrangementDate(maxDateWeekly);
					self.maxDateFortnightly = DateUtils.formatPaymentArrangementDate(maxDateFortnightly);
					self.minCalendarDate = moment().startOf('day').toDate();
					self.maxCalendarDate = self.maxDateSingle;
					self.showStartDateWarning = false;
					self.termsAccepted = false;
					self.instalmentOptions = undefined;
					self.firstInstalmentDate = undefined;
					self.modelArrangement = {
						startDate: '',
						paymentFreq: '',
						selectedInstalment: '',
						instalmentsSchedule: '',
						paymentType:
							self.modifyPath === arrangementConstants.modifyPath.CANCEL_DIRECT_DEBIT
								? arrangementConstants.paymentMethod.MANUAL_PAYMENTS
								: arrangementConstants.paymentMethod.DIRECT_DEBIT,
						paymentDetails:
							self.modifyPath === arrangementConstants.modifyPath.CANCEL_DIRECT_DEBIT
								? undefined
								: self.modelCurrentArrangement.paymentDetails
					};
					self.modelPayment = {
						bankDetails: {},
						ccDetails: {},
						directDebitType: undefined
					};
					self.todayDate = moment().format('DD MMM YYYY');
					self.existingAccount = angular.isDefined(account) && angular.isDefined(account.contractAccountNumber);
					self.totalOwingOnAccount = account.accountBalanceSummary.accountBalance.amount;
					self.paymentFrequencyOptions = Object.values(arrangementConstants.paymentFrequencyOptions);
					self.isSinglePayment = false;
					self.labelDate = 'When do you want the payments to start?';
					self.setPaymentFrequency = function () {
						let selectedFrequency;
						self.isSinglePayment =
							self.modelArrangement.paymentFreq === arrangementConstants.paymentFrequencyOptions.SINGLE_PAYMENT
								? true
								: false;
						self.labelDate = self.isSinglePayment ? 'New payment date' : 'When do you want the payments to start?';
						if (self.modelArrangement.paymentFreq === arrangementConstants.paymentFrequencyOptions.WEEKLY) {
							self.maxCalendarDate = self.maxDateWeekly;
							selectedFrequency = arrangementConstants.analyticsPaymentFrequency.weekly;
						} else if (self.modelArrangement.paymentFreq === arrangementConstants.paymentFrequencyOptions.FORTNIGHTLY) {
							self.maxCalendarDate = self.maxDateFortnightly;
							selectedFrequency = arrangementConstants.analyticsPaymentFrequency.fortnightly;
						} else {
							self.maxCalendarDate = self.maxDateSingle;
							selectedFrequency = arrangementConstants.analyticsPaymentFrequency.single;
						}
						self.modelArrangement.startDate = '';
						if (
							!self.isSinglePayment &&
							!angular.isDefined($scope.$$childHead.$$childHead.modifyArrangementForm.startDate.$modelValue)
						) {
							self.getInstalments();
						} else {
							self.instalmentSelected = false;
						}
						// Attach analytics payment frequency selected
						ArrangementServer.addOptionSelectedToAnalyticsFormModel(
							arrangementConstants.analyticsPaymentFrequency.paymentFrequency,
							selectedFrequency
						);
					};
					self.showStartDate = () => !Utils.isEmptyString(self.modelArrangement.paymentFreq); // Show the start date once the payment frequency is selected
					self.showInstalmentsDropdown = function () {
						const { paymentFreq, startDate } = self.modelArrangement;
						return (
							!self.isSinglePayment &&
							!Utils.isEmptyString(paymentFreq) &&
							(!angular.isDefined($scope.$$childHead.$$childHead.modifyArrangementForm.startDate.$modelValue) ||
								!Utils.isEmptyString(startDate))
						);
					};
					self.setupPaymentDetails = function () {
						if (self.modifyPath === arrangementConstants.modifyPath.UPDATE_PAYMENT_DETAILS) {
							self.firstInstalmentDate = self.modelCurrentArrangement.startDate;
						}
						self.modelArrangement.paymentDetails.payment_method = self.modelPayment.directDebitType.toLowerCase();
						if (self.modelPayment.directDebitType === arrangementConstants.directDebitPaymentType.BANK) {
							delete self.modelPayment.ccDetails;
							const { accountName, bsbNumber, accountNumber } = self.modelPayment.bankDetails;
							self.modelArrangement.paymentDetails = {
								bank_name: accountName,
								bsb_number: bsbNumber,
								bank_account: accountNumber,
								cc_name: undefined,
								cc_num: undefined,
								cc_expiry: undefined,
								payment_method: arrangementConstants.directDebitPaymentType.BANK.toLowerCase()
							};
							self.updatePaymentModel = {
								bankAccountName: accountName,
								bankBSBNumber: bsbNumber,
								bankAccountNumber: accountNumber,
								creditCardType: '',
								creditCardNumber: '',
								creditCardExpiry: '',
								creditCardName: '',
								paymentMethod: arrangementConstants.directDebitPaymentType.BANK.toLowerCase()
							};
						} else if (self.modelPayment.directDebitType === arrangementConstants.directDebitPaymentType.CARD) {
							delete self.modelPayment.bankDetails;
							const { creditCardHolder, cardNumber, expiryMonth, expiryYear } = self.modelPayment.ccDetails;
							self.modelArrangement.paymentDetails = {
								bank_name: undefined,
								bsb_number: undefined,
								bank_account: undefined,
								cc_name: creditCardHolder,
								cc_num: cardNumber,
								cc_expiry: `${expiryMonth}/${expiryYear}`,
								payment_method: arrangementConstants.directDebitPaymentType.CARD.toLowerCase()
							};
							// Validate card
							var cardValidateModel = new FormData();
							cardValidateModel.append('cardHolderName', creditCardHolder);
							cardValidateModel.append('cardNumber', cardNumber);
							cardValidateModel.append('expiryMonth', expiryMonth);
							cardValidateModel.append('expiryYear', expiryYear);
							cardValidateModel.append('crn1', self.contractAccountNumber);
							Utils.promiseThen(
								ArrangementServer.cardValidateGetDVToken(cardValidateModel, expiryMonth, expiryYear),
								function (result) {
									self.modelPayment.ccDetails = result;
								}
							);
							self.updatePaymentModel = {
								bankAccountName: '',
								bankBSBNumber: '',
								bankAccountNumber: '',
								creditCardType: self.modelPayment.ccDetails.cardType,
								creditCardNumber: self.modelArrangement.paymentDetails.cc_num,
								creditCardExpiry: DateUtils.formatCreditCardExpiry(self.modelPayment.ccDetails.expiryDate),
								creditCardName: self.modelPayment.ccDetails.creditCardHolder,
								paymentMethod: arrangementConstants.directDebitPaymentType.CARD.toLowerCase()
							};
						}
					};
					self.showInstalmentOptionsTooltip = function () {
						Modals.showAlert('Instalment Options', `<p> ${$rootScope.messages.MA_H43} </p>`);
					};
					self.showFrequencyTooltip = function () {
						Modals.showAlert('Payment Frequency', `<p> ${$rootScope.messages.MA_H33} </p>`);
					};
					self.confirmArrangement = function () {
						if (self.modelArrangement.paymentFreq === arrangementConstants.paymentFrequencyOptions.SINGLE_PAYMENT) {
							self.modelArrangement.paymentFreq = arrangementConstants.paymentFrequencyOptions.WEEKLY;
						}
						var promises = [];
						var paymentData = {
							directDebit: self.modelPayment,
							contractAccountNumber: self.contractAccountNumber
						};
						if (self.modifyPath === arrangementConstants.modifyPath.MODIFY_P2P) {
							if (self.modelArrangement.paymentType === arrangementConstants.paymentMethod.DIRECT_DEBIT) {
								const {
									creditCardName,
									creditCardNumber,
									creditCardExpiry,
									bankAccountName,
									bankAccountNumber,
									bankBSBNumber
								} = self.updatePaymentModel;
								promises.push(function () {
									return ArrangementServer.modifyPaymentArrangement(
										self.contractAccountNumber,
										'CANCEL',
										self.modelCurrentArrangement.promiseNumber
									);
								});
								promises.push(function () {
									return ArrangementServer.setupDirectDebit(self.contractAccountNumber, paymentData);
								});
								promises.push(function () {
									ArrangementServer.acceptArrangement(self.contractAccountNumber, {
										instalments: self.modelArrangement.instalmentsSchedule,
										startDate: DateUtils.formatPaymentArrangementDate(new Date(self.modelArrangement.startDate)),
										paymentFreq: self.modelArrangement.paymentFreq,
										paymentDetails: {
											cardholder: creditCardName,
											cardnumber: creditCardNumber,
											expirydate: creditCardExpiry,
											bankname: bankAccountName,
											bankaccount: bankAccountNumber,
											bsbnumber: bankBSBNumber
										}
									});
								});
								return Utils.chainPromises(promises);
							} else if (self.modelArrangement.paymentType === arrangementConstants.paymentMethod.MANUAL_PAYMENTS) {
								promises.push(function () {
									return ArrangementServer.modifyPaymentArrangement(
										self.contractAccountNumber,
										'CANCEL',
										self.modelCurrentArrangement.promiseNumber
									);
								});
								promises.push(function () {
									ArrangementServer.acceptArrangement(self.contractAccountNumber, {
										instalments: self.modelArrangement.instalmentsSchedule,
										startDate: DateUtils.formatPaymentArrangementDate(new Date(self.modelArrangement.startDate)),
										paymentFreq: self.modelArrangement.paymentFreq,
										paymentDetails: undefined
									});
								});
								return Utils.chainPromises(promises);
							}
						} else if (self.modifyPath === arrangementConstants.modifyPath.UPDATE_PAYMENT_DETAILS) {
							promises.push(function () {
								return ArrangementServer.setupDirectDebit(self.contractAccountNumber, paymentData);
							});
							promises.push(function () {
								return ArrangementServer.modifyPaymentArrangement(
									self.contractAccountNumber,
									'UPDATE',
									self.modelCurrentArrangement.promiseNumber,
									self.updatePaymentModel
								);
							});
							return Utils.chainPromises(promises);
						} else if (self.modifyPath === arrangementConstants.modifyPath.CANCEL_DIRECT_DEBIT) {
							ArrangementServer.modifyPaymentArrangement(
								self.contractAccountNumber,
								'UPDATE',
								self.modelCurrentArrangement.promiseNumber
							);
						}
					};
					self.instalmentSelected = false;
					self.getInstalments = function (selectedDate) {
						if (!self.showInstalmentsDropdown()) {
							return;
						}
						var arrangement = {
							startDate: DateUtils.formatPaymentArrangementDate(self.modelArrangement.startDate),
							paymentFreq: self.modelArrangement.paymentFreq,
							instalmentNumber: undefined
						};
						ArrangementServer.getArrangementOffer(self.contractAccountNumber, arrangement).then(function (result) {
							self.instalmentOptions = result.data.instalmentDetails.slice(1);
							selectedDate = angular.isDefined(selectedDate)
								? moment(selectedDate)
								: moment(self.modelArrangement.startDate);
							self.firstInstalmentDate = moment(result.data.instalments[0].date);
							self.showStartDateWarning = !DateUtils.isSameDate(selectedDate, self.firstInstalmentDate);
						});
						self.instalmentSelected = false;
						self.modelArrangement.selectedInstalment = '';
					};
					self.getInstalmentsSchedule = function () {
						var arrangement = {
							startDate: DateUtils.formatPaymentArrangementDate(self.modelArrangement.startDate),
							paymentFreq: self.modelArrangement.paymentFreq,
							instalmentNumber: self.modelArrangement.selectedInstalment.instalment
						};
						ArrangementServer.getArrangementOffer(self.contractAccountNumber, arrangement).then(function (result) {
							self.firstInstalmentDate = result.data.instalments[0].date;
							self.modelArrangement.instalmentsSchedule = result.data.instalments;
						});
						self.instalmentSelected = true;
					};
					if (
						self.account.paymentInfo.directDebitInstalmentExists &&
						!angular.equals(self.account.paymentInfo.directDebitInstalmentDetails, {})
					) {
						self.hasDDI = true;
						var paymentFrequency = self.account.paymentInfo.directDebitInstalmentDetails.paymentFreq;
						self.directDebitInstalment = {
							amount: self.account.paymentInfo.directDebitInstalmentDetails.amount,
							frequency:
								paymentFrequency === 'MONTHLY' ? 'month' : paymentFrequency === 'FORTNIGHTLY' ? 'fortnight' : 'week'
						};
					}
					self.copyCurrentArrangementDetails = function () {
						self.modelArrangement.instalmentsSchedule = self.modelCurrentArrangement.instalmentsSchedule;
						self.modelArrangement.paymentFreq = self.modelCurrentArrangement.paymentFreq;
						self.modelArrangement.startDate = self.modelCurrentArrangement.startDate;
					};
					self.getSinglePaymentInstalment = function (selectedDate) {
						if (!Utils.isEmptyString(self.modelArrangement.startDate)) {
							let arrangement = {
								startDate: DateUtils.formatPaymentArrangementDate(self.modelArrangement.startDate),
								paymentFreq: arrangementConstants.paymentFrequencyOptions.WEEKLY,
								instalmentNumber: arrangementConstants.numberOfInstalments.SINGLE_INSTALMENT
							};
							ArrangementServer.getArrangementOffer(self.contractAccountNumber, arrangement).then(function (result) {
								self.firstInstalmentDate = result.data.instalments[0].date;
								self.modelArrangement.instalmentsSchedule = result.data.instalments;
								self.showStartDateWarning = !DateUtils.isSameDate(
									moment(selectedDate),
									moment(self.firstInstalmentDate)
								);
							});
						}
					};
					self.validatePaymentDetails = function () {
						let paymentData = {
							directDebit: self.modelPayment,
							contractAccountNumber: self.contractAccountNumber
						};
						ArrangementServer.validatePaymentDetails(self.contractAccountNumber, paymentData)
							.then(function () {
								self.validatedPaymentDetails = true;
							})
							// Error is handled elsewhere when payment details are invalid.
							// So catch and return to the previous state to allow the customer to re-enter payment details.
							.catch(function () {
								$scope.$parent.wizard.goBack('setup-payment');
							});
					};
				}
			],
			controllerAs: 'modifyArrangementCtrl',
			showProgress: true,
			authenticated: true,
			resolve: {
				arrangementMaxStartDate: [
					'formArgs',
					'ArrangementServer',
					'Utils',
					(formArgs, ArrangementServer, Utils) =>
						formArgs.contractAccountNumber && !Utils.isEmptyString(formArgs.contractAccountNumber)
							? ArrangementServer.getArrangementMaxStartDates(formArgs.contractAccountNumber)
							: undefined
				],
				account: [
					'formArgs',
					'Session',
					'Utils',
					(formArgs, Session, Utils) =>
						formArgs.contractAccountNumber && !Utils.isEmptyString(formArgs.contractAccountNumber)
							? Session.getAccount(formArgs.contractAccountNumber)
							: undefined
				]
			},
			states: [
				{
					skip: [
						'$scope',
						function ($scope) {
							return (
								$scope.modifyArrangementCtrl.modifyPath === arrangementConstants.modifyPath.UPDATE_PAYMENT_DETAILS ||
								$scope.modifyArrangementCtrl.modifyPath === arrangementConstants.modifyPath.CANCEL_DIRECT_DEBIT
							);
						}
					],
					id: 'modify-arrangement',
					title: 'Modify arrangement',
					templateUrl: 'app/wizards/arrangement/arrangement-modify.html',
					nextMsg: 'Next',
					checkpoint: true,
					progress: true,
					backMsg: 'Back',
					controller: [
						'$scope',
						function ($scope) {
							$scope.$watch('modifyArrangementCtrl.modelArrangement.startDate', function (newValue) {
								if (newValue) {
									const { max, min } = $scope.$$childHead.modifyArrangementForm.startDate.$error;
									if (!max && !min) {
										if ($scope.modifyArrangementCtrl.isSinglePayment) {
											$scope.modifyArrangementCtrl.getSinglePaymentInstalment(newValue);
										} else {
											$scope.modifyArrangementCtrl.getInstalments(newValue);
										}
									}
								}
							});
						}
					]
				},
				{
					skip: [
						'$scope',
						$scope =>
							$scope.modifyArrangementCtrl.modifyPath === arrangementConstants.modifyPath.CANCEL_DIRECT_DEBIT ||
							$scope.modifyArrangementCtrl.modelArrangement.paymentType ===
								arrangementConstants.paymentMethod.MANUAL_PAYMENTS
					],
					id: 'setup-payment',
					title: 'Setup payment',
					controller: ['$scope', $scope => delete $scope.modifyArrangementCtrl.validatedPaymentDetails],
					checkpoint: true,
					templateUrl: 'app/wizards/arrangement/arrangement-setup-payment.html',
					next: ['$scope', $scope => $scope.modifyArrangementCtrl.setupPaymentDetails()]
				},
				{
					skip: [
						'$scope',
						function ($scope) {
							if (
								($scope.modifyArrangementCtrl.modelArrangement.paymentType ===
									arrangementConstants.paymentMethod.DIRECT_DEBIT ||
									$scope.modifyArrangementCtrl.modifyPath === arrangementConstants.modifyPath.UPDATE_PAYMENT_DETAILS) &&
								$scope.modifyArrangementCtrl.modelPayment.directDebitType ===
									arrangementConstants.directDebitPaymentType.BANK
							) {
								$scope.modifyArrangementCtrl.validatePaymentDetails();
							} else {
								$scope.modifyArrangementCtrl.validatedPaymentDetails = true;
							}
						}
					],
					id: 'arrangement-confirm',
					title: 'Arrangement confirm',
					checkpoint: true,
					templateUrl: 'app/wizards/arrangement/arrangement-confirm.html',
					nextMsg: 'Confirm',
					disableNext: $scope => !$scope.modifyArrangementCtrl.termsAccepted,
					next: [
						'$scope',
						function ($scope) {
							$scope.wizard.context.navbar.disableNext = true;
							return $scope.modifyArrangementCtrl.confirmArrangement();
						}
					],
					controller: [
						'$scope',
						function ($scope) {
							if (
								$scope.modifyArrangementCtrl.modifyPath === arrangementConstants.modifyPath.UPDATE_PAYMENT_DETAILS ||
								$scope.modifyArrangementCtrl.modifyPath === arrangementConstants.modifyPath.CANCEL_DIRECT_DEBIT
							) {
								$scope.modifyArrangementCtrl.copyCurrentArrangementDetails();
							}
						}
					]
				},
				{
					id: 'arrangement-confirm-success',
					title: 'Arrangement confirm success',
					checkpoint: true,
					completed: true,
					templateUrl: 'app/wizards/arrangement/arrangement-confirmed.html',
					nextMsg: 'Close',
					next: ['Wizards', Wizards => Wizards.close()]
				}
			]
		});
	}
]);
