/**
 * Account Authorization (shared flow)
 */
angular.module('myaccount.wizard').config(['formRegistryProvider', function(formRegistryProvider) {
	formRegistryProvider.registerSubflow({
		id: 'accountauth',
		title: 'Account authentication',
		controller: ['$scope', '$log', 'processId', 'credentials', 'Session','ValidationService','$rootScope', function ($scope, $log, processId,credentials, Session,ValidationService,$rootScope) {
            if($rootScope.messages ==  undefined){
                ValidationService.loadErrorMessages().then (function(result){
                    var resultNoHTMLCharCode = result;
                    _.each(resultNoHTMLCharCode, function(value,key) {
                        resultNoHTMLCharCode[key] = value.split('&#44;').join(',');
                    });
                    $rootScope.messages = resultNoHTMLCharCode;
                }, function(error){
                    //If an error happened, handle it here
                });
            }
            $scope.findMsgHTML = function(key) {
                return $rootScope.messages[key];
            }
            this.localAreas = ValidationService.getLocalAreaCodes();
		    this.processId = processId;
			this.credentials = credentials;
            this.webUserId = _.safeAccess(Session, 'user.username');
            this.pointOfIdentification = {
                identificationDetailType:undefined
            };
            this.data={
                identificationId: "FIRSTANDLASTNAME"
            };
            /**
             * Clear this for phone registration or otherwise it will
             * be sent to the server and authenicated.
             */
            this.clearThreePointCheck = function() {
                this.securityAnswers.mandatoryAccount.billDetailValue = undefined;
                this.securityAnswers.mandatoryAccount.billDetailValue = undefined;
            };

            this.securityAnswers = {
                process: undefined,
				mandatoryAccount: {
					webUserId: this.webUserId,
					contractAccountNumber: undefined,
			        contractAccountProtectionPassword: undefined,
			        customerName: undefined,
			        dateOfBirth: undefined,
			        billDetailType: undefined,
			        billDetailValue: undefined,
                    customerFirstName:undefined,
                    customerLastName:undefined,
                    phoneNumber:undefined,
                    mobileTelephone:undefined
				},
                dateOfBirthDay: undefined,
                dateOfBirthMonth: undefined,
                dateOfBirthYear: undefined,
                additionalAccounts: []
			};

            this.addAccount = function() {
                this.securityAnswers.additionalAccounts.push({
                    contractAccountNumber: undefined,
                    customerName: undefined
                });
            };
            this.removeAccount = function(index) {
                this.securityAnswers.additionalAccounts.splice(index, 1);
            };
		}],
		controllerAs: 'accountAuth',
		showProgress: false,
		states:
			[
				{
				 	id: 'accountnumber',
					title: 'Account Number',
					templateUrl: 'app/shared/wizards/accountauth/account-auth-step1.html',
					checkpoint: true,
                    controller: ['$scope','Modals', function($scope, Modals) {
                        $scope.showAccountNumberHelp = function() {
                        	Modals.showBillHelp('ACCOUNT_NUMBER');
                        };
                    }],
                	next: ['$scope', 'AccountAuthServer','Utils','ValidationService','Modals', function($scope, AccountAuthServer, Utils,ValidationService,Modals) {
                		var processId = $scope.accountAuth.processId;

                        var promise = AccountAuthServer.validateAccountNumber(processId, $scope.accountAuth.credentials.contractAccountNumber, $scope.accountAuth.webUserId);

                        return Utils.promiseThen(promise, function(result) {
                        	$scope.accountAuth.securityAnswers.mandatoryAccount.contractAccountNumber = $scope.accountAuth.credentials.contractAccountNumber;                       	
                        	angular.extend($scope.accountAuth.credentials, result);
                            if (!_.isEmpty($scope.accountAuth.credentials.billDetails)) {
                                if ($scope.accountAuth.credentials.billDetails.length == 1){
                                    $scope.accountAuth.securityAnswers.mandatoryAccount.billDetailType = $scope.accountAuth.credentials.billDetails[0].id
                                }
                                else{
                                    $scope.accountAuth.credentials.billDetails.unshift({id: undefined, label: "-- Please select --"})
                                }
                            }
                            if($scope.accountAuth.credentials.contractAccountType == "RESD" && !$scope.accountAuth.credentials.contractAccountProtectionPassword){
                                var accountNumber=  ("000000000000" + $scope.accountAuth.credentials.contractAccountNumber).slice(-12);
                                return  Utils.promiseThen(AccountAuthServer.getAccValidationOptions(accountNumber),function (resultId) {
                                    if (resultId.identificationDetailType.length == 0){
                                        if (typeof(insideFrontInterface) != 'undefined' && typeof(insideFrontInterface.triggerVisitorEvent) !='undefined'){
                                            insideFrontInterface.triggerVisitorEvent("cannotverifyaccountdetails");
                                        }
                                        Modals.showAlert('Error', $scope.findMsgHTML(["MA_H29"]));
                                        return $q.reject('Error');
                                    }else {
                                        $scope.accountAuth.pointOfIdentification = resultId;
                                        var promise = ValidationService.getInternationalAreaCodes();
                                        Utils.promiseThen(promise, function (AreaCodesresult) {
                                            $scope.accountAuth.landlineFinalList = ValidationService.buildSelectElement(AreaCodesresult, $scope.accountAuth.localAreas);
                                            $scope.accountAuth.mobileFinalList = ValidationService.buildSelectElement(AreaCodesresult, null);
                                            $scope.accountAuth.landlineCountryCode = "08";
                                            $scope.accountAuth.mobileTelephoneCountry = "AU";
                                        });
                                    }
                                });
                            }
                        });
                    }]
				},
				{
					id: 'accountcredentials',
					title: 'Account Credentials',
					checkpoint: true,
					completed: false,
					templateUrl: 'app/shared/wizards/accountauth/account-auth-step2.html',
					controller: ['$scope', 'AccountAuthServer','ValidationService','Modals','Utils', function($scope, AccountAuthServer, ValidationService, Modals, Utils) {
						
						function getBillDetail() {
							var value = $scope.accountAuth.securityAnswers.mandatoryAccount.billDetailType;
							return _.find($scope.accountAuth.credentials.billDetails, function(it) {return it.id == value;});
						}

						
						$scope.billDetailDescription = undefined;
						$scope.$watch('accountAuth.securityAnswers.mandatoryAccount.billDetailType', function(value) {
							if (value) {
								var billDetail = getBillDetail();
								$scope.billDetailDescription = billDetail ? billDetail.label : undefined;
							}
							else {
								$scope.billDetailDescription = undefined;
							}
						});
                        $scope.showCustomerNameHelp = function() {
                            Modals.showBillHelp('NAME_ON_BILL');
                        };
                        $scope.showCustomHelp = function(title,message) {
                            Modals.showAlert(title,message);
                        };
                        $scope.showBillDetailHelp = function() {
                        	var billDetail = getBillDetail();
                            Modals.showBillHelp(billDetail.id);
                        };
                        $scope.showContractAccountProtectionPasswordHelp = function() {
                        	Modals.showAlert('Password Protection', $rootScope.messages["MA_H13"] + ValidationService.getContactPhone($scope.accountAuth.credentials.contractAccountType, true));
                        };
                        $scope.showDateOfBirthHelp = function() {
                        	Modals.showAlert('Date of Birth', $rootScope.messages["MA_H14"]);
                        };
					}],
					next: ['$scope','AccountAuthServer','Utils',function($scope, AccountAuthServer, Utils) {
						var processId = $scope.accountAuth.processId;
                        if ($scope.accountAuth.credentials.contractAccountType == "RESD" && !$scope.accountAuth.credentials['contractAccountProtectionPassword']){
                            $scope.accountAuth.securityAnswers.mandatoryAccount.billDetailType = undefined;
                            $scope.accountAuth.securityAnswers.mandatoryAccount.billDetailValue = undefined;
                            $scope.accountAuth.securityAnswers.mandatoryAccount.identificationId = $scope.accountAuth.data.identitySelectorId;
                            $scope.accountAuth.securityAnswers.mandatoryAccount.accountType =  $scope.accountAuth.credentials.contractAccountType;
                            if ($scope.accountAuth.data.identificationId == "FIRSTANDLASTNAME")
                            {
                                $scope.accountAuth.securityAnswers.mandatoryAccount.customerFirstName = $scope.accountAuth.securityAnswers.mandatoryAccount.customerFirstName;
                                $scope.accountAuth.securityAnswers.mandatoryAccount.customerLastName = $scope.accountAuth.securityAnswers.mandatoryAccount.customerLastName;
                                $scope.accountAuth.securityAnswers.mandatoryAccount.customerName = "";
                                $scope.accountAuth.securityAnswers.mandatoryAccount.isIdentify = false;
                                $scope.accountAuth.securityAnswers.mandatoryAccount.customerFirstAndLastName = $scope.accountAuth.securityAnswers.mandatoryAccount.customerFirstName +" "+$scope.accountAuth.securityAnswers.mandatoryAccount.customerLastName;
                            }else{
                                $scope.accountAuth.securityAnswers.mandatoryAccount.customerName = $scope.accountAuth.securityAnswers.mandatoryAccount.customerName;
                                $scope.accountAuth.securityAnswers.mandatoryAccount.customerFirstName = "";
                                $scope.accountAuth.securityAnswers.mandatoryAccount.customerLastName = "";
                                $scope.accountAuth.securityAnswers.mandatoryAccount.customerFirstAndLastName ="";
                                $scope.accountAuth.securityAnswers.mandatoryAccount.isIdentify = true;

                            }

                            if ($scope.accountAuth.data.identitySelectorId == "LANDLINE"){
                                $scope.accountAuth.securityAnswers.mandatoryAccount.phoneNumber = $scope.accountAuth.landlineCountryCode+$scope.accountAuth.landlineTelephoneNumber;
                                $scope.accountAuth.securityAnswers.mandatoryAccount.dateOfBirth = moment().format('YYYY-MM-DD');
                                $scope.accountAuth.securityAnswers.mandatoryAccount.mobileTelephone = "";
                            }
                            else if ($scope.accountAuth.data.identitySelectorId == "MOBILE_NUMBER"){
                                $scope.accountAuth.securityAnswers.mandatoryAccount.mobileTelephone = $scope.accountAuth.mobileTelephoneNumber;
                                $scope.accountAuth.securityAnswers.mandatoryAccount.dateOfBirth = moment().format('YYYY-MM-DD');
                                $scope.accountAuth.securityAnswers.mandatoryAccount.phoneNumber = "";
                            }
                            else if ($scope.accountAuth.data.identitySelectorId == "DATE_OF_BIRTH"){
                                $scope.accountAuth.securityAnswers.mandatoryAccount.dateOfBirth =  $scope.accountAuth.dateOfBirthYear+"-"+$scope.accountAuth.dateOfBirthMonth+"-"+$scope.accountAuth.dateOfBirthDay;
                                $scope.accountAuth.securityAnswers.mandatoryAccount.phoneNumber = "";
                                $scope.accountAuth.securityAnswers.mandatoryAccount.mobileTelephone = "";
                            }
                            return Utils.promiseThen(AccountAuthServer.getValidateContractAccountForThreePointId(processId, $scope.accountAuth.contractAccountNumber, $scope.accountAuth.securityAnswers), undefined);
                        }else{
                            $scope.accountAuth.securityAnswers.mandatoryAccount.accountType = undefined;
                            $scope.accountAuth.securityAnswers.mandatoryAccount.customerFirstName = undefined;
                            $scope.accountAuth.securityAnswers.mandatoryAccount.customerLastName = undefined;
                            $scope.accountAuth.securityAnswers.mandatoryAccount.dateOfBirth = undefined;
                            $scope.accountAuth.securityAnswers.mandatoryAccount.phoneNumber = undefined;
                            $scope.accountAuth.securityAnswers.mandatoryAccount.mobileTelephone = undefined;
                            $scope.accountAuth.securityAnswers.mandatoryAccount.identificationId = undefined;
                            $scope.accountAuth.securityAnswers.mandatoryAccount.customerFirstAndLastName = undefined;
                            $scope.accountAuth.securityAnswers.mandatoryAccount.isIdentify = undefined;
                            return Utils.promiseThen(AccountAuthServer.validateAccountCredentials(processId, $scope.accountAuth.contractAccountNumber, $scope.accountAuth.securityAnswers), undefined);
                        }

                        // Sometimes a string is returned as a response from the server which gets interpreted as a state.
                        // We use promiseThen with undefined to roll to the next default state instead.

                        //return Utils.promiseThen(AccountAuthServer.validateAccountCredentials(processId, $scope.accountAuth.contractAccountNumber, $scope.accountAuth.securityAnswers), undefined);
					}]
				}
			]
	});
}]);

angular.module('myaccount.wizard').factory('AccountAuthServer', function ($log, http) {

    var AccountAuthServer = {
        validateAccountNumber: function (processId, contractAccountNumber, webUserId) {
            return http({
                method: 'POST',
                url: '/accountAuth/validateAccountNumber/',
                data: {
                    processId: processId,
                    contractAccountNumber: contractAccountNumber,
                    webUserId: webUserId
                }
            });
        },
        validateAccountNumberAndHandleEx: function (processId, contractAccountNumber, webUserId) {
            return http({
                method: 'POST',
                url: '/accountAuth/validateAccountNumber/',
                data: {
                    processId: processId,
                    contractAccountNumber: contractAccountNumber,
                    webUserId: webUserId
                },
                httpCodes: 'all'
            });
        },
        validateAccountCredentials: function(processId, contractAccountNumber, accountCredentials) {
        	accountCredentials.contractAccountNumber = contractAccountNumber;
            return http({
                method: 'POST',
                url: '/accountAuth/validateAccountCredentials/' + processId,
                data: accountCredentials
            });
        },
        getValidateContractAccountForThreePointId:function(processId, contractAccountNumber,accountCredentials) {
            accountCredentials.contractAccountNumber = contractAccountNumber;
            return http({
                method: 'POST',
                url: '/ThreePointIdValidation/validateAccountCredentials/' + processId,
                data: {
                    mandatoryAccount: accountCredentials.mandatoryAccount,
                    additionalAccounts: accountCredentials.additionalAccounts
                }
            });
        },
        getAccValidationOptions: function getAccValidationOptions(contractAccountNumber) {
            var params = { contractAccountNumber: contractAccountNumber };
            return http({
                method: 'POST',
                url: '/accountAuth/getAccValidationOptions',
                params: params
            });
        }
        
    };

    return AccountAuthServer;
});




