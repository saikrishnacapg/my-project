var RegisterUserCtrl = ['$log', 'contract', 'customerDetails', 'billDispatchSettings', function ($log, contract, customerDetails, billDispatchSettings) {

    this.contract = contract;
    this.billDispatchSettings = billDispatchSettings;
    this.isBpay = function (){
        if(this.billDispatchSettings && this.billDispatchSettings.isBPay){
            return true;
        }
        return false;
    }

    this.isPhoneRegistration = function() {
        return this.contract.process === 'PHONE';
    };
    this.isLargeBusiness = function() {
        return this.registerFields.contractAccountType === 'I&C';
    };

    this.registerFields = {
        contractAccountNumber: contract.contractAccountNumber,
        contractAccountType: contract.contractAccountType, // this is returned after the credentials are matched
        telephoneNumber: customerDetails ? customerDetails.telephoneNumber : undefined, // I&C only
        mobilePhone: customerDetails ? customerDetails.mobilePhone : undefined, // I&C only
        firstName: customerDetails ? customerDetails.firstName : undefined,
        lastName: customerDetails ? customerDetails.lastName : undefined,
        emailAddress: customerDetails ? customerDetails.emailAddress : undefined,
        emailAddressConfirm: customerDetails ? customerDetails.emailAddressConfirm : undefined,
        username: undefined,
        password: undefined, // RESD, SME only
        signUpPaperlessBilling: 'no', // RESD, SME only
        linkOtherAccounts: undefined, // I&C phone registration only.
        linkContactNumber: undefined
    };
}];

angular.module('myaccount.wizard').config(['formRegistryProvider', function(formRegistryProvider) {
	formRegistryProvider.registerSubflow({
		id: 'registerUser',
		title: 'Register',
		controller: RegisterUserCtrl,
		controllerAs: 'registerUserCtrl',
		states:
			[
			    {
			    	id: 'userdetails',
			    	checkpoint: true,
                    title: 'User Details',
                    templateUrl: 'app/shared/wizards/register/user-details.html',
                    nextMsg: 'Register',
                    disableNext: function($scope) {
                        return $scope.registerUserCtrl.registerFields.terms !== 'Yes';
                    },
                    next: ['$scope', 'Utils','RegisterServer', function($scope, Utils, RegisterServer) {
                        var promise = $scope.registerUserCtrl.isPhoneRegistration() ? RegisterServer.requestManualRegistration($scope.registerUserCtrl.registerFields) : RegisterServer.registerUser($scope.registerUserCtrl.registerFields);
                        return Utils.promiseThen(promise, undefined);
                    }]
				}
			]
	});
}]);

angular.module('myaccount.wizard').factory('RegisterServer', ['$log', 'http', function ($log, http) {

    var RegisterServer = {
        registerUser: function (registerFields) {
            return http({
                method: 'POST',
                url: '/registration/registerUser',
                data: {
                    userType: registerFields.contractAccountType,
                    contractAccountNumber: registerFields.contractAccountNumber,
                    firstName: registerFields.firstName,
                    lastName: registerFields.lastName,
                    userId: registerFields.username,
                    password: registerFields.password,
                    emailAddress: registerFields.emailAddress,
                    telephoneNumber: registerFields.telephoneNumber,
                    mobileTelephone: registerFields.mobileTelephone,
                    signUpPaperlessBilling:registerFields.signUpPaperlessBilling,
                    linkOtherAccounts: registerFields.linkOtherAccounts,
                    linkContactNumber: registerFields.linkContactNumber
                }
            });
        },
        requestManualRegistration: function(registerFields) {
            return http({
                method: 'POST',
                url: '/registration/registerIC',
                data: {
                    contractAccountNumber: registerFields.contractAccountNumber,
                    additionalAccounts: registerFields.additionalAccounts,
                    firstName: registerFields.firstName,
                    lastName: registerFields.lastName,
                    userId: registerFields.username,
                    emailAddress: registerFields.emailAddress,
                    terms: false,
                    linkOtherAccounts: registerFields.linkOtherAccounts,
                    linkContactNumber: registerFields.linkContactNumber
                }
            });
        }
    };

    return RegisterServer;
}]);
