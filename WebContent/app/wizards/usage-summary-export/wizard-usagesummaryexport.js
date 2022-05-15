angular.module('myaccount.wizard').config(['formRegistryProvider', function(formRegistryProvider) {
	formRegistryProvider.registerForm({
        id: 'usagesummaryexport',
        title: 'Send my consumption history to ...',
        controller: ['$rootScope', 'account','AccountUtils', 'UsageRecordsServer', 'ValidationService', 'UsageCtrlService','$http','$scope',
            function($rootScope, account, AccountUtils, UsageRecordsServer, ValidationService, UsageCtrlService, $http, $scope) {
                var self = this;
	            this.account = account;
                self.invalidEmail = false;
                this.displayContactDetails = AccountUtils.getAccountContactDetails(account);
                self.emailId =this.displayContactDetails.emailAddress;
                this.exportFormats = [{name: 'PDF', format: 'pdf'}, {name: 'CSV', format: 'csv'} ];
                this.dataExport = {

                    details: {
                        to: this.account.businessPartnerDetails.emailAddress,
                        // cc: undefined,
                        subject: 'Consumption History',
                        exportType: 'email',
                        exportFormat: undefined
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

                 this.initiateEmail = function() {
                     // getting start and end dates from usageCtrl via UsageCtrlService
                     UsageRecordsServer.emailUsageSummary(account.contractAccountNumber,  UsageCtrlService.startDate, UsageCtrlService.endDate, self.dataExport.details.exportType, self.dataExport.details.exportFormat,self.emailId);

                 };

            }],
        controllerAs: 'usageexportCtrl',
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
                    title: 'start',
                    templateUrl: 'app/wizards/usage-summary-export/usage-summary-export-email.html',
                    nextMsg: 'Submit'
                },
                {
                    id: 'success',
                    title: 'Success!',
                    completed: true,
                    controller: ['$scope', '$timeout', 'Utils', function($scope, $timeout) {
                        $timeout(function() {
                            $scope.usageexportCtrl.initiateEmail();
                            // $scope.wizard.context.title="Success!";
                        }, 300);
                    }],
                    templateUrl: 'app/wizards/usage-summary-export/usage-summary-export-success.html'
                }
            ]
    });

}]);
