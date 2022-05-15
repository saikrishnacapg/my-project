angular.module('myaccount.wizard').config(['formRegistryProvider', function(formRegistryProvider) {
	formRegistryProvider.registerSubflow({
        id: 'editgreen',
        title: 'Green energy',
        resolve: {
            greenModels: ['GreenModelsServer', 'Utils', function (GreenModelsServer, Utils) {
                var promise = GreenModelsServer.getGreenModels();
                return Utils.promiseThen(promise, function(result) {
                	var greenModels = angular.copy(result);
    	            delete greenModels.EF; // Earth Friendly has been removed as an offering for new customers.

                	return greenModels;
                });
            }]
        },
        controller: ['contractAccountType', 'greenModels', 'greenSimulation', 'greenEnergy', function(contractAccountType, greenModels, greenSimulation, greenEnergy) {

            var self = this;
            self.greenModels = greenModels;
            self.greenSimulation = greenSimulation || {
                averageDailyConsumption: 17.3,
                noOfDays: 62
            };

            self.newGreenEnergy = greenEnergy;
            self.newGreenEnergy.greenProductCode = this.newGreenEnergy.greenProductCode || (contractAccountType == 'SME' ? 'NP' : 'EG');
            self.newGreenEnergy.greenProductPlanAmount = this.newGreenEnergy.greenProductPlanAmount || 0;
            
			// Earth Friendly has been removed as an offering for new customers.
			if (self.newGreenEnergy.greenProductCode === 'EF') {
                self.newGreenEnergy.greenProductCode = undefined;
		    }
            if(contractAccountType == 'SME') {
                //Easy Green not available for SME
                delete this.greenModels.EG;

                if (self.newGreenEnergy.greenProductCode === 'EG') {
                    self.newGreenEnergy.greenProductCode = undefined;
                }
            }
            self.newGreenEnergy.termsAccepted = undefined;
        }],
        controllerAs: 'greenflowCtrl',
        states: 
        	[
                {
                    id: 'choose',
                    title: 'Choose your plan',
                    checkpoint: true,
                    templateUrl: 'app/shared/wizards/green/green-options.html',
                    skip: ['$scope', function($scope) {
                        return $scope.skipGreenOptions;
                    }]
                },
                {
                    id: 'edit',
                    title: 'Select your contribution',
                    checkpoint: true,
                    templateUrl: 'app/shared/wizards/green/green-worksheet.html',
                    controllerAs: 'editgreenCtrl',
                    controller: ['$scope', '$anchorScroll', '$log', '$timeout', 'GreenModelsServer', 'Busy', function($scope, $anchorScroll, $log, $timeout, GreenModelsServer, Busy) {
                    	var self = this;
                    	
                    	var newGreenEnergy = $scope.greenflowCtrl.newGreenEnergy;
                    	var greenSimulation = $scope.greenflowCtrl.greenSimulation;
                    	                    	
                    	// place the selected model on our scope
                    	self.model = $scope.greenflowCtrl.greenModels[newGreenEnergy.greenProductCode];
          	    	  
                        // initialise the greenProductPlanAmount to ensure it matches one of the slider values
                        if (angular.isArray(self.model.units.contributions) && $scope.greenflowCtrl.newGreenEnergy.greenProductPlanAmount == 0) {
                            // take the minimum
                            $scope.greenflowCtrl.newGreenEnergy.greenProductPlanAmount = self.model.units.contributions[0];
                        }

                        self.editableUsage = false;
                        self.editableAlert = false;

                        self.letMeEdit = function() {
                            self.editableUsage = true;
                            $timeout(function() {
                                self.editableAlert = true;
                            }, 100)
                        };

                        // recalculate
                        this.recalculate = function () {

                            var promise = Busy.doing('calculateGreenValues', GreenModelsServer.calculateGreenValues(newGreenEnergy, greenSimulation));
                            var success = function (result) {
                                if (result.greenProductCode == newGreenEnergy.greenProductCode &&
                                    result.greenProductPlanAmount == newGreenEnergy.greenProductPlanAmount) {
                                    // got matching result ... update our greenCalculation
                                    self.greenCalculation = result;
                                }
                            };

                            promise.then(success);
                        };

                        $scope.$watchCollection('[greenflowCtrl.newGreenEnergy.greenProductPlanAmount, greenflowCtrl.greenSimulation.noOfDays, greenflowCtrl.greenSimulation.averageDailyConsumption]', self.recalculate);
                    }],
                    disableNext: function($scope) {
                        var planAmount = $scope.greenflowCtrl.newGreenEnergy.greenProductPlanAmount;
                        return !(angular.isDefined(planAmount) && parseInt(planAmount) > 0);
                    }
                }
            ]
    });

}]);

