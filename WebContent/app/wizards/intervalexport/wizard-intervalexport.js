angular.module('myaccount.wizard').config(['formRegistryProvider', function(formRegistryProvider) {
	formRegistryProvider.registerForm({
        id: 'intervalexport',
        title: 'Export',
        controller: ['$rootScope', 'account', 'intervalData', 'intervalDataService', 'Events','ValidationService','$http',
            function($rootScope, account, intervalData, intervalDataService, Events, ValidationService, $http) {
                var self = this;
	            this.account = account;
	            this.intervalData = intervalData;
                self.invalidEmail = false;
                self.invalidCCEmail = false;
	            this.dataExport = {
	                selection: undefined,
	                details: {
	                    to: this.account.businessPartnerDetails.emailAddress,
	                    cc: undefined,
	                    subject: 'Synergy Interval data - ' + intervalData.mode,
	                    downloadType: undefined,
                        downloadFormat: undefined,
                        contractAccountNumber : this.account.collective == false  ? this.account.contractAccountNumber : intervalDataService.contractAccountNumber,
                        deviceId : this.account.collective == false ? this.account.installationDetails.intervalDevices[0].deviceId : intervalDataService.current.meters[0].deviceId,
                        generationTab : intervalData.showGenerationTab
	                }
	            };
	
	            this.isDownload = function() {
	                return this.dataExport.selection === 'download';
	            };
	
	            this.initiateDownload = function() {
	                if (intervalData.isVisual()) {
	                    $rootScope.$broadcast(Events.INTERVAL_DOWNLOAD, {type: this.dataExport.details.downloadFormat});
	                } else {
	                    intervalDataService.exportDataSet(this.dataExport.details);
	                }
	            };
	
	            this.initiateEmail = function() {
	                if (intervalData.isVisual()) {
	                    $rootScope.$broadcast(Events.INTERVAL_EMAIL, this.dataExport.details);
	                } else {
	                    intervalDataService.emailDataSet(this.dataExport.details);
	                }
	            };

                this.isEmailValid = function() {

                    self.invalidEmail = false;
                    var emailList = _.safeAccess(self.dataExport, 'details.to') ? self.dataExport.details.to.split(',') : [];
                    var log = [];
                    angular.forEach(emailList, function(value, key) {

                        var promise = ValidationService.validateEmail(value);

                        var success = function (result) {
                            self.invalidEmail = _.safeAccess(result, 'data.status') === "error";
                        };

                        var failure = function (reason) {
                           self.invalidEmail = false;
                        };

                        promise.then(success, failure);
                    },log);
                }

                this.isCCEmailValid = function() {

                    self.invalidCCEmail = false;
                    var emailList = _.safeAccess(self.dataExport, 'details.cc') ? self.dataExport.details.cc .split(',') : [];
                    var log = []
                    angular.forEach(emailList, function(value, key) {

                        var promise = ValidationService.validateEmail(value);

                        var success = function (result) {
                            self.invalidCCEmail = _.safeAccess(result, 'data.status') === "error";
                        };

                        var failure = function (reason) {
                            self.invalidCCEmail = false;
                        };

                        promise.then(success, failure);
                    },log);
                }


            }],
        controllerAs: 'exportCtrl',
        showProgress: false,
        authenticated: true,
        resolve: {
        	account: ['formArgs','Session', function (formArgs, Session) {
                return Session.getAccount(formArgs.contractAccountNumber);
            }]
        },
        states: 
            [
                {
                    id: 'start',
                    title: 'Export',
                    templateUrl: 'app/wizards/intervalexport/intervalexport-selection.html',
                    nextMsg: 'Submit'
                },
                {
                    id: 'success',
                    title: 'Success',
                    completed: true,
                    controller: ['$scope', '$timeout', 'Utils', function($scope, $timeout, Utils) {
                        $timeout(function() {
                            if($scope.exportCtrl.isDownload()) {
                                $scope.exportCtrl.initiateDownload();
                            } else {
                                $scope.exportCtrl.initiateEmail();
                            }
                        }, 300);
                    }],
                    templateUrl: 'app/wizards/intervalexport/intervalexport-success.html'
                }
            ]
    });

}]);

angular.module('myaccount.wizard').config(['formRegistryProvider', function(formRegistryProvider) {
    formRegistryProvider.registerForm({
        id: 'Resiintervalexport',
        title: 'Export',
        controller: ['$rootScope', 'account', 'solar', 'solarService', 'Events','ValidationService','$http',
            function($rootScope, account, solar, solarService, Events, ValidationService, $http) {
                var self = this;
                this.account = account;
                this.intervalData = solar;
                self.invalidEmail = false;
                self.invalidCCEmail = false;
                this.dataExport = {
                    selection: undefined,
                    details: {
                        to: this.account.businessPartnerDetails.emailAddress,
                        cc: undefined,
                        subject: 'Synergy Interval data - ' + solar.mode,
                        downloadType: undefined,
                        downloadFormat: undefined,
                        contractAccountNumber : this.account.contractAccountNumber,
                        deviceId : this.account.installationDetails.intervalDevices[0].deviceId,
                        generationTab : solar.showGenerationTab
                    }
                };

                this.isDownload = function() {
                    return this.dataExport.selection === 'download';
                };

                this.initiateDownload = function() {
                    if (solar.isVisual()) {
                        $rootScope.$broadcast(Events.INTERVAL_DOWNLOAD, {type: this.dataExport.details.downloadFormat});
                    } else {
                        solarService.exportDataSet(this.dataExport.details);
                    }
                };

                this.initiateEmail = function() {
                    if (solar.isVisual()) {
                        $rootScope.$broadcast(Events.INTERVAL_EMAIL, this.dataExport.details);
                    } else {
                        solarService.emailDataSet(this.dataExport.details);
                    }
                };

                this.isEmailValid = function() {

                    self.invalidEmail = false;
                    var emailList = _.safeAccess(self.dataExport, 'details.to') ? self.dataExport.details.to.split(',') : [];
                    var log = [];
                    angular.forEach(emailList, function(value, key) {

                        var promise = ValidationService.validateEmail(value);

                        var success = function (result) {
                            self.invalidEmail = _.safeAccess(result, 'data.status') === "error";
                        };

                        var failure = function (reason) {
                            self.invalidEmail = false;
                        };

                        promise.then(success, failure);
                    },log);
                }

                this.isCCEmailValid = function() {

                    self.invalidCCEmail = false;
                    var emailList = _.safeAccess(self.dataExport, 'details.cc') ? self.dataExport.details.cc .split(',') : [];
                    var log = []
                    angular.forEach(emailList, function(value, key) {

                        var promise = ValidationService.validateEmail(value);

                        var success = function (result) {
                            self.invalidCCEmail = _.safeAccess(result, 'data.status') === "error";
                        };

                        var failure = function (reason) {
                            self.invalidCCEmail = false;
                        };

                        promise.then(success, failure);
                    },log);
                }


            }],
        controllerAs: 'exportCtrl',
        showProgress: false,
        authenticated: true,
        resolve: {
            account: ['formArgs','Session', function (formArgs, Session) {
                return Session.getAccount(formArgs.contractAccountNumber);
            }]
        },
        states:
            [
                {
                    id: 'start',
                    title: 'Export',
                    templateUrl: 'app/wizards/intervalexport/intervalexport-selection.html',
                    nextMsg: 'Submit'
                },
                {
                    id: 'success',
                    title: 'Success',
                    completed: true,
                    controller: ['$scope', '$timeout', 'Utils', function($scope, $timeout, Utils) {
                        $timeout(function() {
                            if($scope.exportCtrl.isDownload()) {
                                $scope.exportCtrl.initiateDownload();
                            } else {
                                $scope.exportCtrl.initiateEmail();
                            }
                        }, 300);
                    }],
                    templateUrl: 'app/wizards/intervalexport/intervalexport-success.html'
                }
            ]
    });

}]);


angular.module('myaccount.wizard').config(['formRegistryProvider', function(formRegistryProvider) {
    formRegistryProvider.registerForm({
        id: 'Amiiintervalexport',
        title: 'Export',
        controller: ['$rootScope', 'account', 'amiInterval', 'amiIntervalService', 'Events','ValidationService','$http',
            function($rootScope, account, amiInterval, amiIntervalService, Events, ValidationService, $http) {
                var self = this;
                this.account = account;
                this.intervalData = amiInterval;
                self.invalidEmail = false;
                self.invalidCCEmail = false;
                this.dataExport = {
                    selection: undefined,
                    details: {
                        to: this.account.businessPartnerDetails.emailAddress,
                        cc: undefined,
                        subject: 'Synergy Interval data - ' + amiInterval.mode,
                        downloadType: undefined,
                        downloadFormat: undefined,
                        contractAccountNumber : this.account.contractAccountNumber,
                        deviceId : this.account.installationDetails.intervalDevices[0].deviceId,
                        generationTab : amiInterval.showGenerationTab
                    }
                };

                this.isDownload = function() {
                    return this.dataExport.selection === 'download';
                };

                this.initiateDownload = function() {
                    if (amiInterval.isVisual()) {
                        $rootScope.$broadcast(Events.INTERVAL_DOWNLOAD, {type: this.dataExport.details.downloadFormat});
                    } else {
                        amiIntervalService.exportDataSet(this.dataExport.details);
                    }
                };

                this.initiateEmail = function() {
                    if (amiInterval.isVisual()) {
                        $rootScope.$broadcast(Events.INTERVAL_EMAIL, this.dataExport.details);
                    } else {
                        amiIntervalService.emailDataSet(this.dataExport.details);
                    }
                };

                this.isEmailValid = function() {

                    self.invalidEmail = false;
                    var emailList = _.safeAccess(self.dataExport, 'details.to') ? self.dataExport.details.to.split(',') : [];
                    var log = [];
                    angular.forEach(emailList, function(value, key) {

                        var promise = ValidationService.validateEmail(value);

                        var success = function (result) {
                            self.invalidEmail = _.safeAccess(result, 'data.status') === "error";
                        };

                        var failure = function (reason) {
                            self.invalidEmail = false;
                        };

                        promise.then(success, failure);
                    },log);
                };

                this.isCCEmailValid = function() {

                    self.invalidCCEmail = false;
                    var emailList = _.safeAccess(self.dataExport, 'details.cc') ? self.dataExport.details.cc .split(',') : [];
                    var log = []
                    angular.forEach(emailList, function(value, key) {

                        var promise = ValidationService.validateEmail(value);

                        var success = function (result) {
                            self.invalidCCEmail = _.safeAccess(result, 'data.status') === "error";
                        };

                        var failure = function (reason) {
                            self.invalidCCEmail = false;
                        };

                        promise.then(success, failure);
                    },log);
                };


            }],
        controllerAs: 'exportCtrl',
        showProgress: false,
        authenticated: true,
        resolve: {
            account: ['formArgs','Session', function (formArgs, Session) {
                return Session.getAccount(formArgs.contractAccountNumber);
            }]
        },
        states:
            [
                {
                    id: 'start',
                    title: 'Export',
                    templateUrl: 'app/wizards/intervalexport/intervalexport-selection.html',
                    nextMsg: 'Submit'
                },
                {
                    id: 'success',
                    title: 'Success',
                    completed: true,
                    controller: ['$scope', '$timeout', 'Utils', function($scope, $timeout, Utils) {
                        $timeout(function() {
                            if($scope.exportCtrl.isDownload()) {
                                $scope.exportCtrl.initiateDownload();
                            } else {
                                $scope.exportCtrl.initiateEmail();
                            }
                        }, 300);
                    }],
                    templateUrl: 'app/wizards/intervalexport/intervalexport-success.html'
                }
            ]
    });

}]);
