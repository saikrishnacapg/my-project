angular.module('myaccount.wizard').config(['formRegistryProvider', function(formRegistryProvider) {
	formRegistryProvider.registerForm({
        id: 'green-status',
        title: 'Green energy',
        analytics: {
            formName: 'green energy manage'
        },
        resolve: {
        	account: ['formArgs','Session', function (formArgs, Session) {
                return Session.getAccount(formArgs.contractAccountNumber);
            }]
        },
        controller: ['account','formController', function(account, formController) {
	            this.account = account;
	            this.hasGreenEnergy = account.productDetails.greenFlag;
	            
	            this.editGreen = function() {
	            	formController.addTask('green-edit');
	            };
	        }],
        controllerAs: 'greenCtrl',
        showProgress: true,
        authenticated: true,
        states: 
            [
                {
                    id: 'status',
                    title: 'Status',
                    progress: false,
                    templateUrl: 'app/wizards/green/green-status.html',
                    nextMsg: 'Cancel Green energy',
                    next: ['$scope', 'Modals', 'GreenServer', 'Utils', function($scope, Modals, GreenServer, Utils) {
                        var promise = Modals.showConfirm('Green energy', 'Cancel your green energy contributions?');
                        return Utils.promiseThen(promise, function() {
        	                var account = $scope.greenCtrl.account;
                        	var promise2 = GreenServer.cancelGreenEnergy(account.contractAccountNumber, account.productDetails.greenDetails.greenProductCode);
                        	return Utils.promiseThen(promise2, 'cancelled');
                        });
                    }]
                },
                {
                    id: 'cancelled',
                    title: 'Success',
                    completed: true,
                    templateUrl: 'app/wizards/green/green-cancelled.html'
                }
            ]
    });

	formRegistryProvider.registerForm({
        id: 'green-edit',
        title: 'Green energy',
        analytics: {
            formName: 'green energy manage'
        },
        resolve: {
        	account: ['formArgs','Session', function (formArgs, Session) {
                return Session.getAccount(formArgs.contractAccountNumber);
            }]
        },
        controller: ['account', function(account) {
            this.account = account;

            this.newGreenEnergy = angular.copy(account.productDetails.greenDetails || {});

            this.selectedProductDisplayName = function() {
                return this.newGreenEnergy.greenProductCode === 'EG' ? 'EasyGreen' : 'NaturalPower';
            };
        }],
        controllerAs: 'greenCtrl',
        showProgress: true,
        authenticated: true,
        states: 
            [
                {
                    id: 'beforebegin',
                    title: 'Before you begin',
                    progress: false,
                    templateUrl: 'app/wizards/green/green-before-you-begin.html',
                    nextMsg: "Start green energy setup"
                },
                {
                	subflow: {
				 		id: 'editgreen',
				 		inject: function($scope) {
				 			return {
				 				greenSimulation: $scope.greenCtrl.account.greenSimulation,
					        	greenEnergy: $scope.greenCtrl.newGreenEnergy,
					            contractAccountType: $scope.greenCtrl.account.contractAccountType
				 			}
				 		}
                	}
                },
                {
                    id: 'confirm',
                    title: 'Confirm details',
                    templateUrl: 'app/wizards/green/green-confirm.html',
                    nextMsg: 'Submit',
                    checkpoint:true,
                    disableNext: function ($scope) {
                        return !($scope.greenCtrl.newGreenEnergy.termsAccepted && $scope.greenCtrl.newGreenEnergy.privacyAccepted);
                    },
                    next: ['$scope', 'GreenServer', 'Utils', function($scope, GreenServer, Utils) {
		                var promise = GreenServer.updateGreenEnergy($scope.greenCtrl.account.contractAccountNumber, $scope.greenCtrl.newGreenEnergy);
                        return Utils.promiseThen(promise, 'success').then(function(wasSuccessful) {
                            if (wasSuccessful) {
                                if ($scope.greenCtrl.newGreenEnergy.greenProductCode == "NP")
                                    Utils.setGoal('Goal_NaturalPower_Opt_In');
                                else
                                    Utils.setGoal('Goal_EasyGreen_Opt_In');
                            }
                        });
                    }]
                },
                {
                    id: 'success',
                    title: 'Success',
                    checkpoint:true,
                    completed: true,
                    templateUrl: 'app/wizards/green/green-success.html'
                }
            ]
    });
}]);

angular.module('myaccount.wizard').factory('GreenServer', function ($http) {

    var GreenServer = {
        cancelGreenEnergy: function (contractAccountNumber, greenProductCode) {
            return $http({
                method: 'POST',
                url: '/accountUpdate/' + contractAccountNumber + '/cancelGreenEnergy.json',
                data: {
                    greenProductCode: greenProductCode
                }
            });
        },

        updateGreenEnergy: function (contractAccountNumber, greenEnergy) {
            return $http({
                method: 'POST',
                url: '/accountUpdate/' + contractAccountNumber + '/updateGreenEnergy.json',
                data: {
                    greenProductCode: greenEnergy.greenProductCode,
                    greenProductPlanAmount: greenEnergy.greenProductPlanAmount
                }
            });
        }
    };

    return GreenServer;
});