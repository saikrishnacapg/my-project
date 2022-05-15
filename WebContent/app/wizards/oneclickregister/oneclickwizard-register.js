/* eslint-disable no-undefined */
/* eslint-disable prettier/prettier */
/**
 * Register module (wizard)
 */
angular.module('myaccount.wizard').config(['formRegistryProvider', function(formRegistryProvider) {
	formRegistryProvider.registerForm({
		id: 'oneclickregister',
		title: 'Register for My Account',
		controller: ['$scope', 'AccountAuthServer', 'Utils', 'http', 'Modals', '$location', 'OneClickRegistrationServer', '$state', '$timeout', 'MyAccountClient', 'Session',
			function ($scope, AccountAuthServer, Utils, http, Modals, $location, OneClickRegistrationServer, $state, $timeout, MyAccountClient, Session) {
				var self = this;
				this.billDetailsValue = false;
				this.validToken = true;
				this.webUserId = _.safeAccess(Session, 'user.username');

				this.contract = {
					contractAccountNumber: undefined,
					contractAccountType: 'RESD' // This is returned after the credentials are matched
				};

				this.registerFields = {
					contractAccountNumber: undefined,
					contractAccountType: 'RESD', // This is returned after the credentials are matched
					telephoneNumber: undefined, // I&C only
					mobilePhone: undefined, // I&C only
					firstName: undefined,
					lastName: undefined,
					emailAddress: undefined,
					emailAddressConfirm: undefined,
					username: undefined,
					password: undefined, // RESD, SME only
					newPasswordConfirm: undefined,
					signUpPaperlessBilling: 'no' // RESD, SME only
				};

				this.securityAnswers = {
					mandatoryAccount: {
						webUserId: self.webUserId,
						contractAccountNumber: this.contract.contractAccountNumber,
						contractAccountProtectionPassword: undefined,
						customerName: undefined,
						dateOfBirth: undefined,
						billDetailType: undefined,
						billDetailValue: undefined,
						identificationId: undefined,
						isIdentify: true,
						accountType: undefined
					},
					dateOfBirthDay: undefined,
					dateOfBirthMonth: undefined,
					dateOfBirthYear: undefined,
				};

				// After the account is verified, its properties are copied to these contract
				this.credentialsCheck=[];

				function getBillDetail() {
					var value = $scope.registerCtrl.securityAnswers.mandatoryAccount.billDetailType;
					return _.find($scope.registerCtrl.credentialsCheck.billDetails, function(it) {
						return it.id === value;
					});
				}

				this.showBillDetailHelp = function() {
					var billDetail = getBillDetail();
					Modals.showBillHelp(billDetail.id);
				};
				$scope.showCustomHelp = function(title, message) {
					Modals.showAlert(title, message);
				};

				/**
				 * Note this method only used for paperless-signup
				 * @param contractAccountNumber
				 * @returns
				 */
				this.getBusinessPartnerDetails = function(contractAccountNumber) {
					return http({
						method: 'POST',
						url: `/account/${ contractAccountNumber }/getBusinessPartnerDetails.json`
					});
				};



				this.billDetailDescription = undefined;
				$scope.$watch('registerCtrl.securityAnswers.mandatoryAccount.billDetailType', function(value) {
					if (value) {
						var billDetail = getBillDetail();
						self.billDetailDescription = billDetail ? billDetail.label : undefined;
					} else {
						self.billDetailDescription = undefined;
					}
				});


				var token = $location.search().token;
				var promise = OneClickRegistrationServer.validateToken(token);
				// Removed return
				Utils.promiseThen(promise, function(result) {
						if (result.EVTOKENSTATUS === 'ACTV') {
							self.contract.contractAccountNumber = self.securityAnswers.mandatoryAccount.contractAccountNumber = result.EVCONTRACTACCOUNT;
							self.securityAnswers.customerName = self.securityAnswers.mandatoryAccount.customerName = result.EVBILLNAME;
							self.contract.contractAccountType = result.EVACCTCLASS;
							self.securityAnswers.mandatoryAccount.accountType = result.EVACCTCLASS;
							self.processId = 'signup';

							var promise2 = AccountAuthServer.validateAccountNumber(self.processId, self.contract.contractAccountNumber, self.webUserId);

							return Utils.promiseThen(promise2, function(result) {
								self.credentialsCheck = result;
								if (!_.isEmpty(self.credentialsCheck.billDetails)) {
									self.billDetailsValue =true;
									self.credentialsCheck.billDetails.unshift({id: undefined, label: "-- Please select --"})
								}
							});
						}
						if (result.EVTOKENSTATUS === 'USED') {
							$state.go('user.home');

						} else if (result.EVTOKENSTATUS === 'INVL') {
							self.validToken = false;
						} else {
							$state.go('user.home');
						}


					},
					function() {
						$state.go('user.home');
					});


			}],
		controllerAs: 'registerCtrl',
		showProgress: false,
		states:
			[
				{
					id: 'UserDetails',
					title: 'Account authentication',
					showBack: false,
					nextMsg: 'Register for My Account',
					templateUrl: 'app/wizards/oneclickregister/oneclickregister-user-details.html',
					disableNext: function($scope) {
						return $scope.registerCtrl.registerFields.terms !== 'Yes' || !$scope.registerCtrl.validToken;
					},
					next: ['$scope', 'AccountAuthServer', 'RegisterServer', 'Utils', 'HTML5_DATE_FORMAT', function ($scope, AccountAuthServer, RegisterServer, Utils, HTML5_DATE_FORMAT) {
						if ($scope.registerCtrl.contract.contractAccountNumber) {
							var processId = $scope.registerCtrl.processId;
							var promise="";
							if ($scope.registerCtrl.credentialsCheck.dateOfBirth){
								$scope.registerCtrl.securityAnswers.mandatoryAccount.dateOfBirth = $scope.registerCtrl.dateOfBirthYear + "-" + $scope.registerCtrl.dateOfBirthMonth + "-" + $scope.registerCtrl.dateOfBirthDay;
								$scope.registerCtrl.securityAnswers.mandatoryAccount.identificationId = "DATE_OF_BIRTH";
								promise = AccountAuthServer.getValidateContractAccountForThreePointId( processId, $scope.registerCtrl.contract.contractAccountNumber, $scope.registerCtrl.securityAnswers);
							} else {
								promise = AccountAuthServer.validateAccountCredentials(processId, $scope.registerCtrl.contract.contractAccountNumber, $scope.registerCtrl.securityAnswers);
							}

							return Utils.promiseThen(promise, function (result) {
								// This is our flow result
								var promise2 = $scope.registerCtrl.getBusinessPartnerDetails($scope.registerCtrl.contract.contractAccountNumber);

								return Utils.promiseThen(promise2, function (result) {
									$scope.registerCtrl.registerFields.contractAccountNumber = $scope.registerCtrl.contract.contractAccountNumber
									$scope.registerCtrl.registerFields.firstName = _.isEmpty(result.firstName)?$scope.registerCtrl.registerFields.firstName:result.firstName
									$scope.registerCtrl.registerFields.lastName = _.isEmpty(result.lastName)?$scope.registerCtrl.registerFields.lastName:result.lastName
									$scope.registerCtrl.registerFields.emailAddress = result.emailAddress
									$scope.registerCtrl.registerFields.mobilePhone = result.mobileTelephone
									$scope.registerCtrl.registerFields.telephoneNumber = result.telephoneNumber
									$scope.registerCtrl.registerFields.contractAccountType = $scope.registerCtrl.contract.contractAccountType

									var promise3 = RegisterServer.registerUser($scope.registerCtrl.registerFields);

									return Utils.promiseThen(promise3, function() {
										Utils.setGoal('Goal_REBS_Opt_In_Assisted');
										return 'success';
									});
								});

							});
						}
					}]
				},
				{
					id: 'success',
					completed: true,
					title: 'Success',
					templateUrl: 'app/wizards/oneclickregister/oneclickregister-success.html',
					exit: ['MyAccountPrefix', function(MyAccountPrefix) {
						return `${MyAccountPrefix }home`;
					}],
					nextMsg: 'Proceed to My Account'
				}
			]

	});
}
]);

angular.module('myaccount.wizard').factory('OneClickRegistrationServer', function(http) {

	var OneClickRegistrationServer = {

		validateToken: function (token) {
			return http({
				method: 'POST',
				url: '/oneClick/validateToken.json',
				data: {
					token: token
				}
			});
		}
	}

	return OneClickRegistrationServer;

});
