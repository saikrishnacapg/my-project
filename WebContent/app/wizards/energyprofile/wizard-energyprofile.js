angular.module('myaccount.wizard').config(['formRegistryProvider', function(formRegistryProvider) {
    formRegistryProvider.registerForm({
        id: 'energyprofile',
        title: 'Your Household',
        analytics: {
            formName: 'Household profile',
            startFunction: function(state) {
                return state.$$idx === 3 || state.$$idx === 1;
            }
        },
        controller: ['account','categories','houseProfile','$state', function (account, categories, houseProfile,$state) {
        	this.account = account;
            this.appliances = categories.appliances;
            this.houseTypes = categories.houseTypes;
        	this.houseProfile = houseProfile;

            // default houseType to house
            if(!this.houseProfile.houseType) {
                this.houseProfile.houseType = "house";
            }
            this.gotoET=function () {
                $state.go('user.account.energytoolbox');
            }
        }],
        controllerAs: 'energyprofileCtrl',
        showProgress: true,
        authenticated: true,
        exit: function(completed){
            if (completed)
                window.usabilla_live('trigger', 'manual trigger');
        },
        resolve: {
            account: ['formArgs','Session', function (formArgs, Session) {
                return Session.getAccount(formArgs.contractAccountNumber);
            }],
            categories: ['EnergyProfileServer', function (EnergyProfileServer) {
                return EnergyProfileServer.getAllCategories();
            }],
            houseProfile: ['EnergyProfileServer', 'formArgs', function (EnergyProfileServer, formArgs) {
                return EnergyProfileServer.getHouseProfile(formArgs.contractAccountNumber);
            }]
        },
        states:  [
                {
                    skip: ['$scope', function($scope) {
                        return $scope.energyprofileCtrl.account.feaDetails.hasEnergyProfile || $scope.energyprofileCtrl.account.feaDetails.isFirstTimeMigratingUser;
                    }],
                    id: 'no_engage',
                    title: 'Welcome to your household profile',
                    templateUrl: 'app/wizards/energyprofile/energyprofile-no-engage.html',
                    checkpoint: false,
                    progress: false,
                    nextMsg: 'Setup my household profile',
                    next: function() {
                        return 'myhouse';
                    }
                },
                {
                    skip: ['$scope', function($scope) {
                        return $scope.energyprofileCtrl.account.feaDetails.hasEnergyProfile;
                    }],
                    id: 'fea_user',
                    title: 'Confirm my details',
                    templateUrl: 'app/wizards/energyprofile/energyprofile-fea-user.html',
                    checkpoint: false,
                    nextMsg: 'Confirm my household profile'
                },
                {
                    id: 'myhouse',
                    title: 'Your Household',
                    checkpoint: true,
                    templateUrl: 'app/wizards/energyprofile/energyprofile-house.html',
                    // nextMsg: 'Save & check appliances',
                    controller: ['$scope', 'EnergyProfileServer', 'Wizards', 'Utils', function($scope, EnergyProfileServer, Wizards, Utils) {
                    	$scope.saveAndClose = function() {
                        	var promise = EnergyProfileServer.updateHouseProfile($scope.energyprofileCtrl.account.contractAccountNumber, $scope.energyprofileCtrl.houseProfile);
                        	Utils.promiseThen(promise, function() {
                            	Wizards.close();
                                window.usabilla_live('trigger', 'manual trigger');
                            }).then(function(wasSuccessful) {
                                if (wasSuccessful) {
                                    Utils.setGoal('Goal_Household_Profile_Set');
                                }
                            });;
                    	};
                    }],
                    disableNext: ['$scope', function($scope) {
                        return !angular.isDefined($scope.energyprofileCtrl.houseProfile.houseType);
                    }],
                    nextMsg: 'Edit Appliances',
                    next: ['$scope', 'EnergyProfileServer', 'Utils', function ($scope, EnergyProfileServer, Utils) {
                    	var promise = EnergyProfileServer.updateHouseProfile($scope.energyprofileCtrl.account.contractAccountNumber, $scope.energyprofileCtrl.houseProfile);
                    	return Utils.promiseThen(promise, 'myappliances').then(function(wasSuccessful) {
                            if (wasSuccessful) {
                                Utils.setGoal('Goal_Household_Profile_Set');
                            }
                        });;
                    }]
                },
                {
                    id: 'myappliances',
                    title: 'My Appliances',
                    checkpoint: true,
                    templateUrl: 'app/wizards/energyprofile/energyprofile-appliances.html',
                    next: ['$scope', 'EnergyProfileServer', 'Utils', function ($scope, EnergyProfileServer, Utils) {
                        var promise = EnergyProfileServer.updateHouseProfile($scope.energyprofileCtrl.account.contractAccountNumber, $scope.energyprofileCtrl.houseProfile);
                        return Utils.promiseThen(promise, 'success').then(function(wasSuccessful) {
                            if (wasSuccessful) {
                                Utils.setGoal('Goal_Household_Profile_Set');
                            }
                        });;
                    }],
                    nextMsg: 'Save & Next'
                },
                {
                    id: 'success',
                    title: 'Success',
                    checkpoint: true,
                    completed: true,
                    templateUrl: 'app/wizards/energyprofile/energyprofile-updated.html',
                    next: ['$scope', function ($scope) {
                        window.usabilla_live('trigger', 'manual trigger');
                        $scope.energyprofileCtrl.gotoET();
                    }],
                    nextMsg: function() {
                        return 'View my energy saving tips';
                    }
                  /*  nextMsg: function() {
                        return 'View my energy saving tips';
                    },
                    /!*next: {
                        $route: 'user.account.energytoolbox' // goto the energytoolbox
                    },*!/
                    exit: function($state) {
                        window.usabilla_live('trigger', 'manual trigger');
                        $state.go('user.account.energytoolbox');
                    }*/
                }
            ]        
    });

}]);



angular.module('myaccount.wizard').factory('EnergyProfileServer', function ($log, $q, $sce, http) {

    var EnergyProfileServer = {
    	getAllCategories: function(){
            return http({
                method: 'POST',
                url: '/energyProfile/getAllCategories.json'
            });
        },
        getHouseProfile: function(contractAccountNumber) {
            return http({
                method: 'POST',
                url: '/energyProfile/' + contractAccountNumber + '/getHouseProfile.json',
            });
        },
        updateHouseProfile: function(contractAccountNumber, profile) {
            return http({
                method: 'POST',
                url: '/energyProfile/' + contractAccountNumber + '/updateHouseProfile.json',
                data: profile
            });
        }
    };

    return EnergyProfileServer;

});



angular.module('myaccount.directives').directive('syAppliance', function() {
    return {
        restrict: 'A',
        scope: {
            appliance: '=',
            houseProfile: '='
        },
        controllerAs: 'applianceCtrl',
        controller: function($scope, MyAccountApps) {
            var self = this;
            this.appliance = $scope.appliance;
            this.houseProfile = $scope.houseProfile;

            this.imagesDir = MyAccountApps + '/images/appliances';
            
            this.incr = function() {
                self.houseProfile.appliances[self.appliance.name] = self.houseProfile.appliances[self.appliance.name] ? self.houseProfile.appliances[self.appliance.name]+1 : 1;
            };
        },
        templateUrl: 'app/wizards/energyprofile/energyprofile-appliance.html'
    };
});
