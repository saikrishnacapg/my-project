angular.module('myaccount.wizard').config(['formRegistryProvider', function(formRegistryProvider) {

    formRegistryProvider.registerForm({
        id: 'directdebit-setup-instalments',
        title: 'Direct Debit',
        analytics: {
            formName: 'direct debit instalments'
        },
        controller: ['$log', 'formArgs', 'formController', 'Busy', 'DirectDebitServer', 'Utils', 'AccountUtils', 'Source',
            function($log, formArgs, formController, Busy, DirectDebitServer, Utils, AccountUtils, Source) {
                var self = this;
                self.account = formArgs.account;
                self.model = {
                    todayDate: moment().format('DD MMM YYYY'),
                    paymentType: formArgs.paymentType,
                    Type: 'New Setup',
                    directDebit: null,
                    instalment: null,
                    sourceId: Source.sourceId
                };
                self.minDate = moment();
                self.maxDate = moment().add(1, 'year');

                self.isResidential = AccountUtils.isResidential(self.account);

                self.showStartDateWarning = false;
                self.showEndDateWarning = false;

                // Disable weekend selection
                self.disabled = function(date, mode) {
                    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
                };

                self.setupInstalment = function() {
                    return Utils.promiseThen(Busy.doing('next', DirectDebitServer.setup(self.account.contractAccountNumber, self.model, false)).then(function(){
                        if (self.model.paymentType === 'SPLIT') {
                            Utils.setGoal("Goal_DDI_Opt_In");
                        } else {
                            Utils.setGoal("Goal_DD_Opt_In");
                        }
                    }), undefined);
                };
            }],
        controllerAs: 'signUpCtrl',
        showProgress: true,
        authenticated: true,
        states: [{
            id: 'setup-instalments',
            checkpoint: true,
            templateUrl: 'app/wizards/directdebit/directdebit-instalments.html',
            controller: ['$scope', 'DateUtils', function($scope, DateUtils){
                 $scope.$watch('signUpCtrl.model.instalment.startDate', function(newValue, oldValue) {
                     if (newValue) {
                         try {
                             var momentDate = moment(newValue);
                             var day = momentDate.day();
                             $scope.signUpCtrl.showStartDateWarning = (day === 6 || day === 0 || DateUtils.isPublicHoliday(momentDate)) ? true : false;
                         } catch (e) {
                             $scope.signUpCtrl.showStartDateWarning = false;
                         }
                     }
                 });

                 $scope.$watch('signUpCtrl.model.instalment.endDate', function(newValue, oldValue) {
                     if (newValue) {
                         try {
                             var momentDate = moment(newValue);
                             var day = momentDate.day();
                             $scope.signUpCtrl.showEndDateWarning = (day === 6 || day === 0 || DateUtils.isPublicHoliday(momentDate)) ? true : false;
                         } catch (e) {
                             $scope.signUpCtrl.showEndDateWarning = false;
                         }
                     }
                 });
             }]
        }, {
            id: 'setup-instalments-payment',
            checkpoint: true,
            templateUrl: 'app/wizards/directdebit/directdebit-setup-payment.html'
        }, {
            id: 'confirm',
            checkpoint: true,
            templateUrl: 'app/wizards/directdebit/directdebit-confirm.html',
            nextMsg: 'Confirm',
            disableNext: function($scope) {
                return !$scope.signUpCtrl.model.termsAccepted;
            },
            next: ['$scope',  function($scope) {
                $scope.wizard.context.navbar.disableNext = true;
                return $scope.signUpCtrl.setupInstalment();
            }]
        }, {
            id: 'success',
            checkpoint: true,
            completed: true,
            templateUrl: 'app/wizards/directdebit/directdebit-success.html',
            nextMsg: ['$scope', function($scope) {
                return $scope.signUpCtrl.nextState ? 'Next' : 'Close';
            }],
            next: ['$scope', 'Wizards', function ($scope, Wizards) {
                if (!$scope.signUpCtrl.nextState) {
                    Wizards.close();
                } else {
                    return $scope.signUpCtrl.nextState;
                }

            }]
        }]
    });
}]);
