/**
 * Link accounts wizard
 */
angular.module('myaccount.wizard').config(['formRegistryProvider', function(formRegistryProvider) {
	formRegistryProvider.registerForm({
		id: 'linkaccount',
		title: 'Add an account',
		analytics: {
            formName: 'Link/Add account',
            startFunction: function(state) {
                return state.$$idx === 2;
            }
        },
		controller: ['$scope',
		    function($scope) {
				this.account = {
			        contractAccountNumber: undefined,
			        contractAccountType: undefined // this is returned after the credentials are matched
			    };
				this.termsAndConditions = 'No';
			}],
	    controllerAs: 'link',
	    states: 
	    	[
				{
				 	subflow: {
				 		id: 'accountauth',
				 		inject: function($scope) {
				 			return {
				 				processId: 'linkaccount',
				 				credentials: $scope.link.account
				 			}
				 		}
				 	}
				},
				{
					id: 'confirm',
                    templateUrl: 'app/wizards/linkedaccounts/linkaccount-confirm.html',
                    next: ['$scope', 'LinkAccountServer', 'Utils', function($scope, LinkAccountServer, Utils) {
			 			var promise = LinkAccountServer.linkAccount($scope.link.account.contractAccountNumber);
	                	return Utils.promiseThen(promise, 'success').then(function(wasSuccessful) {
                            if (wasSuccessful) {
                                Utils.setGoal('Goal_Account_Added');
                            }
                        });
                    }],
                    disableNext: function($scope) {
                        return $scope.link.termsAndConditions === 'No';
                    }
				},
				{
				 	id: 'success',
				 	title: 'Success',
                    completed: true,
                    templateUrl: 'app/wizards/linkedaccounts/linkaccount-success.html'
				}
			]
	});
}]);

angular.module('myaccount.wizard').factory('LinkAccountServer', function ($log, http) {

    var LinkAccountServer = {
        linkAccount: function (contractAccountNumber) {
            return http({
                method: 'POST',
                url: '/user/linkAccount.json',
                data: {contractAccountNumber: contractAccountNumber}
            });
        }
    };

    return LinkAccountServer;
});

