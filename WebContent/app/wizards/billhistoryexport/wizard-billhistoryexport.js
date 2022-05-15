angular.module('myaccount.wizard').config(['formRegistryProvider', function(formRegistryProvider) {
	formRegistryProvider.registerForm({
        id: 'billhistoryexport',
        title: 'Send my billing history to ...',
        controller: ['$rootScope', 'account','AccountUtils', 'BillRecordsServer', 'ValidationService','$http','$scope','BillsCtrlService',
            function($rootScope, account, AccountUtils, BillRecordsServer, ValidationService, $http, $scope,BillsCtrlService) {
                var self = this;
	            this.account = account;
                self.invalidEmail = false;
                self.invalidCCEmail = false;
                this.displayContactDetails = AccountUtils.getAccountContactDetails(account);
                self.emailId =this.displayContactDetails.emailAddress;
                $scope.wizard.context.emailBillPopUp = true;
                this.dataExport = {

                    details: {
                        to: this.account.businessPartnerDetails.emailAddress,
                        cc: undefined,
                        subject: 'Synergy Bill data',
                        downloadType: undefined,
                        downloadFormat: undefined
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
                     this.billData = account.billHistory;
                     this.dateRange = angular.copy(this.billData.supplyPeriod);
                     BillRecordsServer.emailBillHistory(account.contractAccountNumber, BillsCtrlService.startDate, BillsCtrlService.endDate, 'email', 'csv',this.emailId);
                 };

            }],
        controllerAs: 'billexportCtrl',
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
                    templateUrl: 'app/wizards/billhistoryexport/billhistoryexport-email.html',
                    nextMsg: 'Submit'
                },
                {
                    id: 'success',
                    title: 'Success!',
                    completed: true,
                    controller: ['$scope', '$timeout', 'Utils', function($scope, $timeout, Utils) {
                        $timeout(function() {
                            $scope.billexportCtrl.initiateEmail();
                            $scope.wizard.context.title="Success!";
                        }, 300);
                    }],
                    templateUrl: 'app/wizards/billhistoryexport/billhistoryexport-success.html'
                }
            ]
    });

}]);
