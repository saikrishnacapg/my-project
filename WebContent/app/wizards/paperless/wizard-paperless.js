angular.module('myaccount.wizard').config(['formRegistryProvider', function (formRegistryProvider) {
    formRegistryProvider.registerForm({
	    id: 'paperless-selectaccount',
        title: 'My account notification preferences',
        analytics: {
            formName: 'Manage Paperless'
        },        
        controller: ['$scope','accountList', 'formController', function($scope,accountList, formController) {
            var self = this;
            this.accountList = accountList;
            this.selectAccount = function(contractAccountNumber) {
                // pop on the mydetails-state
               // formController.goForward('paperless');
                formController.addTask('paperless', {'contractAccountNumber': contractAccountNumber});

            }
        }],
        controllerAs: 'myCtrl',
        showProgress: false,
        authenticated: true,
        resolve: {
            accountList: ['Session', function(Session) {
				return Session.getAccountList();
			}]
        },
        states:
            [
                {
                    id: 'select',
                    title: 'Choose an account',
                    templateUrl: 'app/wizards/mydetails/mydetails-selectaccount.html',
                    nextMsg: 'Edit your details',
                    showNext: false
                }
            ]
    });


    formRegistryProvider.registerForm({
		id: 'paperless',
        title: 'My account notification preferences',
        analytics: {
            formName: 'Manage Paperless',
            startFunction: function(state) {
                return state.$$idx === 2 || state.$$idx === 3 || state.$$idx === 4;
            }
        },   
        controller: 'PaperlessController',
        controllerAs: 'paperlessCtrl',
        showProgress: false,
        authenticated: true,
        resolve: {
            account: ['formArgs', 'Session', function (formArgs, Session) {
                return Session.getAccount(formArgs.contractAccountNumber);
            }],
            accountList: ['formArgs','Session', function (formArgs ,Session) {
                return Session.getBPAccountList(formArgs.contractAccountNumber);
            }],
            skipsignup: ['formArgs', function(formArgs){
                return formArgs.skipsignup;
            }],
            internationalAreas: ['Utils', 'ValidationService', function(Utils, ValidationService){
                var promise =  ValidationService.getInternationalAreaCodesWithAU();
                return Utils.promiseThen(promise,function (result) {
                    result.unshift({countrycode: '', countryname: "-- Select code --"});
                    return result;
                });
            }]
        },
        states: [
            {
                id: 'begin',
                skip: ['$scope', function ($scope) {
                    if($scope.paperlessCtrl.isBpay){
                        return 'bpay';
                    }
                    if($scope.paperlessCtrl.skipsignup)
                    {
                        return 'status';
                    }
                    return $scope.paperlessCtrl.isPaperless() ? 'status' : 'signup';
                }]
            },
            {
                id: 'bpay',
                title: 'My account notification preferences',
                templateUrl: 'app/wizards/paperless/paperless-bpay-message.html',
                completed: true
            },
            {
                id: 'signup',
                title: 'Paperless Billing',
                templateUrl: 'app/wizards/paperless/paperless-status.html',
                nextMsg: function () {
                    return 'Confirm & register';
                },
                next: ['$scope', function($scope){
                    $scope.paperlessCtrl.paperlessType = $scope.paperlessCtrl.showSMSMobileNumber ? 'ES' : 'E';
                    return 'multipleaccounts';
                }]
            },
            {
                id: 'status',
                title: 'Paperless Billing',
                templateUrl: 'app/wizards/paperless/paperless-sms-status.html',
                nextMsg: function () {
                    return "Save your preferences";
                }
            },
            {
                id: 'multipleaccounts',
                title: 'Paperless Billing',
                templateUrl: 'app/wizards/paperless/paperless-multipleaccounts.html',
                skip: ['$scope', function ($scope) {
                    var returnVariable;
                    if($scope.paperlessCtrl.isPaperless())
                    {
                        returnVariable = $scope.paperlessCtrl.accountList.length < 1 || $scope.paperlessCtrl.paperlessType == 'P';
                    }
                    else
                    {
                        returnVariable = $scope.paperlessCtrl.accountList.length < 1;
                    }
                    return returnVariable;
                }],
                showNext: false,
                controller: ['$scope', 'formController', 'Busy', function ($scope, formController, Busy) {
                    $scope.setUpdateMultipleAccounts = function (value) {
                        $scope.paperlessCtrl.updateMultipleAccounts = value;
                        formController.goForward('submit');
                    };
                }]
            },
            {
                id: 'submit',
                skip: ['$scope', 'Utils', 'Busy', 'Modals','$rootScope', function ($scope, Utils, Busy, Modals, $rootScope) {
                    if($scope.paperlessCtrl.isPaperless())
                    {
                        var removePaperless = $scope.paperlessCtrl.paperlessType == 'P';
                        var promise;
                        if (removePaperless) {
                            var msg = '<p>Cancel your paperless bill?</p>';
                            if ($scope.paperlessCtrl.isEconnect()) {
                                msg = msg + '<p>Please note that if you cancel Paperless, your account will no longer be eligible for eConnect</p>'
                                if($scope.paperlessCtrl.LifestyleOrSolar) {
                                    msg = '<p><b>Are you sure you want  to say goodbye to your extra rewards?</b></p>'
                                    msg = msg + '<p>Don’t forget, if you choose to opt out of Paperless you’ll no longer receive the extra 1% discount off your electricity charges on the '+ $scope.paperlessCtrl.productName  +'.</p>'
                                }
                            }

                            promise = Modals.showConfirm('My contact preferences', msg);
                        }
                        else {
                            $rootScope.isPaperLessError=true;
                            promise = Busy.doing('global', $scope.paperlessCtrl.setPaperlessBilling()); //$scope.paperlessCtrl.setPaperlessBilling();
                        }

                        return Utils.promiseThen(promise, function () {
                            //return removePaperless ? Utils.promiseThen($scope.paperlessCtrl.cancelPaperless(), 'cancelled') : 'success';
                            if(removePaperless){
                                return Utils.promiseThen($scope.paperlessCtrl.cancelPaperless(), 'cancelled');
                            }
                            else{
                                $rootScope.isPaperLessError=undefined;
                                return 'success';
                            }
                        });
                    }
                    else {
                        //$scope.paperlessCtrl.paperlessType = $scope.paperlessCtrl.showSMSMobileNumber ? 'ES' : 'E';
						var oldPaperless = $scope.paperlessCtrl.oldPaperLessType;
                      if(oldPaperless != $scope.paperlessCtrl.paperlessType){
                        var promise;
                        promise = Busy.doing('global', $scope.paperlessCtrl.setPaperlessBilling());
                        return Utils.promiseThen(promise, function () {
                            return 'success';
                        });

                        }else{
                                return 'success';
                        }
                    }
                }]
            },
            {
                id: 'success',
                title: 'Success',
                completed: true,
                templateUrl: 'app/wizards/paperless/paperless-success.html'
            },
            {
                id: 'cancelled',
                title: 'Success',
                backMsg: 'Close',
                exitOnBack: true,
                nextMsg: 'Submit feedback',
                templateUrl: 'app/wizards/paperless/paperless-cancelled.html',
                next: ['$scope', 'Utils', function ($scope, Utils) {
                    var promise = $scope.paperlessCtrl.submitFeedback();
                    return Utils.promiseThen(promise, function () {
                        return 'feedbacksubmitted';
                    });
                }]
            },
            {
                id: 'feedbacksubmitted',
                completed: true,
                title: 'Success',
                templateUrl: 'app/wizards/paperless/paperless-feedback-submitted.html'
            }
        ]
    });
}]);