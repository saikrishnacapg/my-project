angular.module('myaccount.wizard').config(['formRegistryProvider', function(formRegistryProvider) {
	formRegistryProvider.registerForm({
		id: 'unlinkaccount',
		title: 'Remove an account',
        progress: false,
		resolve: {
			accountList: ['Session', function(Session) {return Session.getAccountList();}]
		},
		analytics: {
            formName: 'Unlink/Remove account'
        },

		controller: ['$scope', '$log', '$filter','accountList','formArgs','SessionServer',
		    function($scope, $log,$filter, accountList,formArgs,SessionServer) {
                this.accountList = $filter('filter')(accountList, { contractAccountNumber:formArgs.contractAccountNumber});//accountList;
                var self=this;
                this.account = this.accountList[0];
                this.termsAccepted = undefined;
                this.LifestyleOrSolar=undefined;
                this.productName=undefined;
                this.eConnect=undefined;
                SessionServer.getAccountDetails(self.account.contractAccountNumber).then(function (accountDetail) {
                    var accountDetails = accountDetail;
                    if (accountDetails.productDetails && accountDetails.productDetails.energyProductLabel) {
                        if (accountDetails.productDetails.tariffType === 'SLR' || accountDetails.productDetails.tariffType === 'LFS') {
                            self.LifestyleOrSolar = true;
                            self.productName = accountDetails.productDetails.energyProductLabel;
                            self.eConnect = accountDetails.paperlessBillSetting.isPaperless && accountDetails.paymentInfo.directDebitExists ? true : false;
                        }
                    }
                });
		    }],
	    controllerAs: 'unlink',
	    states: 
		    [
                /*{
                     id: 'select',
                    title: 'Select Account',
                    templateUrl: 'app/wizards/linkedaccounts/unlinkaccount-list.html',
                    disableNext: function($scope) {
                        return !angular.isDefined($scope.unlink.account);
                    },
                    next: ['$scope','SessionServer', function($scope,SessionServer) {
                        var self=this;
                        SessionServer.getAccountDetails($scope.unlink.account.contractAccountNumber).then(function(accountDetails){
                            self.accountDetails=accountDetails;
                            if(self.accountDetails.productDetails && self.accountDetails.productDetails.energyProductLabel) {
                                if (self.accountDetails.productDetails.tariffType==='SLR' || self.accountDetails.productDetails.tariffType==='LFS') {
                                    $scope.unlink.LifestyleOrSolar = true;
                                    $scope.unlink.productName = self.accountDetails.productDetails.energyProductLabel;
                                    $scope.unlink.eConnect = this.accountDetails.paperlessBillSetting.isPaperless && this.accountDetails.paymentInfo.directDebitExists ? true : false;
                                }
                            }
                        });
                        return 'confirm';
                    }]

                },*/
				{
				 	id: 'confirm',
					title: 'Confirm',
                    templateUrl: 'app/wizards/linkedaccounts/unlinkaccount-confirm.html',
        	        nextMsg: 'Unlink account',
                    disableNext: function ($scope) {
                        return !$scope.unlink.termsAccepted;
                    },
      	    	  	next: ['$scope', 'UnLinkAccountServer', 'EconnectService','Utils', function($scope, UnLinkAccountServer, EconnectService, Utils) {
						// need to load the account details, as they are required to determine whether the account was on eConnect in the next step
						var promise = EconnectService.getEConnectSetting($scope.unlink.account).then(function(eConnectSetting) {
							$scope.unlink.eConnect = eConnectSetting;
						});

      	    		  return promise.then(function() {
						  return Utils.promiseThen(UnLinkAccountServer.unlinkAccount($scope.unlink.account.contractAccountNumber, 'success').then(function(wasSuccessful) {
                              if (wasSuccessful) {
                                  Utils.setGoal('Goal_Account_Removed');
                              }
                          }))
					  });
					}]
      	    	},
      	        {
				 	id: 'success',
					title: 'Success',
                    completed: true,
					templateUrl: 'app/wizards/linkedaccounts/unlinkaccount-success.html'
      	        }
	    	]
	});
}]);
		
angular.module('myaccount.wizard').factory('UnLinkAccountServer', function ($log, http) {

    var UnLinkAccountServer = {
        unlinkAccount: function (contractAccountNumber) {
            return http({
                method: 'POST',
                url: '/user/unlinkAccount.json',
                data: {
                    contractAccountNumber: contractAccountNumber
                }
            });
        }
    };

    return UnLinkAccountServer;
});