angular.module('myaccount.wizard').config(['formRegistryProvider', function(formRegistryProvider) {
    formRegistryProvider.registerForm({
        id: 'feedback',
        title: 'Feedback',
        controller: ['formArgs', '$rootScope', 'account', 'AppVersion',
            function(formArgs, $rootScope, account, AppVersion) {
                this.account = account;
                this.contractAccountNumber = account.contractAccountNumber;
                this.model = {
                    processId: formArgs.processId,
                    followUpRequired: false,
                    appVersion: AppVersion,
                    userAgent: "Browser: " + navigator.browsingSynergyWith() + "; User agent: " + navigator.userAgent
                };
            }],
        controllerAs: 'feedbackCtrl',
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
                    title: 'Feedback',
                    templateUrl: 'app/wizards/feedback/feedback.html',
                    nextMsg: 'Submit',
                    next: ['$scope', 'http', 'Utils', function($scope, http, Utils) {
                        var promise = http({
                            method: 'POST',
                            url: '/feedback/' + $scope.feedbackCtrl.contractAccountNumber + "/submit",
                            params: $scope.feedbackCtrl.model,
                            httpCodes: ['all']
                        });

                        return Utils.promiseThenElse(promise, function() {
                            return 'success';
                        }, function() {
                            return 'error';
                        });
                    }]
                },
                {
                    id: 'success',
                    title: 'Success',
                    completed: true,
                    templateUrl: 'app/wizards/feedback/feedback-success.html'
                },
                {
                    id: 'error',
                    title: 'Error',
                    completed: true,
                    templateUrl: 'app/wizards/feedback/feedback-error.html'
                }
            ]
    });

}]);
