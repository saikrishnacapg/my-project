angular.module('myaccount.wizard').config(['formRegistryProvider', function(formRegistryProvider) {
    formRegistryProvider.registerSubflow({
        id: 'adddirectdebit',
        title: 'Direct Debit',
        controller: ['$q', '$log', 'account', 'model', 'nextState', 'useButtonSelector', 'silentUpdate', 'AccountUtils', 'Busy', 'CardService', 'DirectDebitServer', 'Utils', 'HiddenIframe',
            function($q, $log, account, model, nextState, useButtonSelector, silentUpdate, AccountUtils, Busy, CardService, DirectDebitServer, Utils, HiddenIframe) {
                var self = this;
                self.useButtonSelector = useButtonSelector;
                self.nextState = nextState;
                self.account = account;
                self.model = ('refundbankdetails' === self.nextState) ? {directDebitType: 'BANK', directDebit: {bankDetails: model}} : model;
                self.showShortfall = false;
                self.model.paymentType = ('refundbankdetails' === self.nextState || 'skipInstalmentOption' === self.nextState) ? 'FULL' : undefined;
                //self.model.paymentType = ('refundbankdetails' === self.nextState) ? 'FULL' : undefined;
                self.showStartDateWarning = false;
                self.showEndDateWarning = false;

                self.directDebitExists = function() {
                    return angular.isObject(self.account.paymentInfo) && self.account.paymentInfo.directDebitExists == true;
                };

                self.directDebitWithInstalment = function() {
                    return self.model.paymentType == 'SPLIT';
                };

                self.contactNumber = function () {
                    return AccountUtils.getContactNumber(self.account);
                };

                self.setup = function() {
                    return Utils.promiseThen(Busy.doing('next', DirectDebitServer.setup(self.account.contractAccountNumber, self.model, silentUpdate)), undefined).then(function () {
                        if (self.model.paymentType === 'SPLIT') {
                            Utils.setGoal("Goal_DDI_Opt_In");
                        }else{
                            Utils.setGoal("Goal_DD_Opt_In");
                        }
                    });
                };

                self.setupShortFall = function () {
                    switch (self.model.instalment.shortfall) {
                        case 'managed':
                            delete self.model.directDebit;
                            self.showShortfall = false;
                            break;
                        case 'bank':
                            delete self.model.directDebit.ccDetails;
                            self.model.directDebit['directDebitType'] = 'BANK';
                            self.showShortfall = true;
                            break;
                        case 'card':
                            delete self.model.directDebit.bankDetails;
                            self.model.directDebit['directDebitType'] = 'CARD';
                            self.showShortfall = true;
                            break;
                        case 'nominated':
                            self.model['directDebit'] = {};
                            self.model.directDebit.directDebitType = self.model.instalment.directDebitType;
                            if ('BANK' === self.model.directDebit.directDebitType)
                                self.model.directDebit['bankDetails'] = self.model.instalment.bankDetails;
                            else
                                self.model.directDebit['ccDetails'] = self.model.instalment.ccDetails;
                            self.showShortfall = true;
                            break;
                    }
                };

                self.minDate = moment();
                self.maxDate = moment().add(1,'year');
            }],
        controllerAs: 'signUpCtrl',
        showProgress: true,
        states:
            [
                {
                    id: 'setup',
                    title: 'Direct Debit',
                    checkpoint: true,
                    templateUrl: 'app/wizards/directdebit/directdebit-setup.html',
                    controller: ['$scope', 'DateUtils', function($scope, DateUtils){
                         $scope.$watch('signUpCtrl.model.instalment.startDate', function(newValue, oldValue){
                             if (!!newValue)
                             {
                                 try {
                                     var momentDate = moment(newValue);
                                     var day = momentDate.day();
                                     $scope.signUpCtrl.showStartDateWarning = (day == 6 || day == 0 || DateUtils.isPublicHoliday(momentDate))? true : false;
                                 }
                                 catch(e){ $scope.signUpCtrl.showStartDateWarning = false; }
                             }
                        });

                         $scope.$watch('signUpCtrl.model.instalment.endDate', function(newValue, oldValue){
                             if (!!newValue)
                             {
                                 try {
                                     var momentDate = moment(newValue);
                                     var day = momentDate.day();
                                     $scope.signUpCtrl.showEndDateWarning = (day == 6 || day == 0 || DateUtils.isPublicHoliday(momentDate))? true : false;
                                 }
                                 catch(e){ $scope.signUpCtrl.showEndDateWarning = false; }
                             }
                         });
                     }]
                },
                {
                    skip: ['$scope', function($scope) {
                        return $scope.signUpCtrl.directDebitExists() || !$scope.signUpCtrl.directDebitWithInstalment();
                    }],
                    id: 'instalments-details',
                    title: 'Direct Debit Instalment Setup',
                    checkpoint : true,
                    templateUrl: 'app/wizards/directdebit/directdebit-setup-instalments.html',
                    next: ['$scope',  function($scope) {
                        $scope.signUpCtrl.setupShortFall();
                    }]
                },
                {
                    skip: ['$scope', function($scope) {
                        return $scope.signUpCtrl.directDebitExists();
                    }],
                    id: 'confirm',
                    title: 'Confirmation',
                    checkpoint: true,
                    templateUrl: 'app/wizards/directdebit/directdebit-confirm.html',
                    nextMsg: 'Confirm',
                    disableNext: function ($scope) {
                        return !$scope.signUpCtrl.model.termsAccepted;
                    },
                    next: ['$scope', 'Utils', 'Busy',  function($scope, Utils, Busy) {
                        $scope.wizard.context.navbar.disableNext = true;
                        return Busy.doing('next', $scope.signUpCtrl.setup());
                    }]
                },
                {
                    id: 'success',
                    title: 'Success',
                    checkpoint: true,
                    completed: ('refundbankdetails' === self.nextState) ? false : true,
                    templateUrl: 'app/wizards/directdebit/directdebit-success.html',
                    nextMsg: ['$scope', function($scope) {
                        return $scope.signUpCtrl.nextState === 'refundbankdetails' ? 'Next' : 'Close';
                    }],
                    next: ['$scope', 'Wizards', function ($scope, Wizards) {
                        if ($scope.signUpCtrl.nextState !== 'refundbankdetails') {
                            Wizards.close();
                        } else {
                            return $scope.signUpCtrl.nextState;
                        }

                    }]
                }
            ]
    });

}]);

