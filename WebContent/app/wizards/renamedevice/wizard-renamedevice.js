angular.module('myaccount.wizard').config(['formRegistryProvider', function(formRegistryProvider) {
	formRegistryProvider.registerForm({
        id: 'renamedevice',
        title: 'Rename your device',
        controller: ['$scope', 'account', 'Busy', 'IntervalDeviceServer',
            function($scope, account, Busy, IntervalDeviceServer) {
	            var self = this;
	
	            this.contractAccountNumber = account.contractAccountNumber;
	            this.intervalDevices = angular.copy(account.installationDetails.intervalDevices);
	
	            this.intervalDeviceResponse = {
	                message: undefined,
	                error: undefined
	            };
	
	            this.deviceCustomisation = {
	                contractAccountNumber: this.contractAccountNumber,
	                intervalDevice: undefined,
	                customName: undefined
	            };
	
	            this.updateDevice = function() {
	                var promise = Busy.doing('next', IntervalDeviceServer.update(this.deviceCustomisation));
	
	                var success = function () {
	                    self.intervalDeviceResponse.message = "<p>Your device name has been updated</p>";
	                    self.intervalDeviceResponse.error = false;
	                };
	
	                var failure = function () {
	                    self.intervalDeviceResponse.message = "<p>Sorry, we were unable to update your device. Please try again later when the issue should be resolved or contact Synergy if the problem persists.</p>";
                        self.intervalDeviceResponse.error = true;
	                };
	
	                promise.then(success, failure);
	
	                return promise;
	            };
	
	            this.updateDeviceDisplayNames = function() {
	                angular.forEach(this.intervalDevices, function(device) {
	                    device.displayLabel = device.customDeviceName ? device.customDeviceName + " - " + device.deviceId : device.deviceId;
	                });
	            };
	
	            this.updateDeviceDisplayNames();
	        }],
        controllerAs: 'redCtrl',
        resolve: {
        	account: ['formArgs','Session', function (formArgs, Session) {
                return Session.getAccount(formArgs.contractAccountNumber);
            }]
        },
        showProgress: false,
        authenticated: true,
        states: 
            [
                {
                    id: 'edit',
                    title: 'Rename your device',
                    templateUrl: 'app/wizards/renamedevice/renamedevice-edit.html',
                    nextMsg: 'Update name',
                    next: ['$scope', 'Utils', function($scope, Utils) {
                        var promise = $scope.redCtrl.updateDevice();
                        return Utils.promiseThen(promise, 'edit');
                    }]
                }
            ]
    });

}]);

angular.module('myaccount.wizard').factory('IntervalDeviceServer', function($http, $q) {

    var IntervalDeviceServer = {
        /**
         * @returns {*}
         */
        update: function (req) {
            var deferred = $q.defer();

            var deviceRequest = {
                intervalDeviceId: req.intervalDevice.deviceId,
                customName: req.customName
            };

            var promise = $http({
                method: 'POST',
                url: '/accountUpdate/' + req.contractAccountNumber + '/setIntervalDeviceName.json',
                data: deviceRequest,
                httpCodes: [200, 400]
            });

            var success = function (result) {
                deferred.resolve(result);
            };

            var failure = function (reason) {
                deferred.reject(reason);
            };

            promise.then(success, failure);

            return deferred.promise;
        },
        listDevices: function(contractAccountNumber) {
            var deferred = $q.defer();

            var promise = $http({
                method: 'GET',
                url: '/account/' + contractAccountNumber + '/listIntervalDevices',
                httpCodes: [200, 400]
            });

            var success = function (result) {
                deferred.resolve(result);
            };

            var failure = function (reason) {
                deferred.reject(reason);
            };

            promise.then(success, failure);

            return deferred.promise;
        }
    };
    return IntervalDeviceServer;
});