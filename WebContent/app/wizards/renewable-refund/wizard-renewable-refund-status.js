angular.module('myaccount.wizard').config(['formRegistryProvider', function(formRegistryProvider) {
    formRegistryProvider.registerForm({
        id: 'renewablerefund-status',
        title: 'Automated REBS Payment',
        analytics: {
            formName: 'Automatic REBS signup'
        },
        controller: ['renewableRefundModel', 'formController', 'Busy', 'RebsServer', 'Session', 'Utils',
            function(renewableRefundModel, formController, Busy, RebsServer, Session, Utils) {
                var self = this;
                self.isLoggedIn = Session.isLoggedIn();
                self.model = renewableRefundModel;
                self.isBpay = renewableRefundModel.account.paperlessBillSetting.isBPay;

                this.editRenewableRefund = function() {
                    formController.addTask('renewablerefund-edit');
                };

                self.cancelRenewableRefund = function() {
                    var parentCAN = self.isCollective ? _.safeAccess(renewableRefundModel, 'contractAccountNumber') : undefined;
                    return Utils.promiseThen(Busy.doing('next', RebsServer.submitRefundCancellation(self.model, parentCAN)), undefined);
                };
            }],
        controllerAs: 'rrCtrl',
        showProgress: false,
        authenticated: true,
        resolve: {
            renewableRefundModel: ['$q', 'formArgs', 'RebsServer', 'RenewableRefundModel', 'Session', 'Utils', function($q, formArgs, RebsServer, RenewableRefundModel, Session, Utils) {
                if (!formArgs.contractAccountNumber) { return; }
                var promises = $q.all([RebsServer.show(formArgs.contractAccountNumber), Session.getAccount(formArgs.contractAccountNumber)]);
                return Utils.promiseThen(promises, function(result) {
                    return RenewableRefundModel.build(result[0], result[1]);
                });
            }]
        },
        states:
            [
                {
                    id: 'status',
                    title: 'Status',
                    templateUrl: 'app/wizards/renewable-refund/renewable-refund-status.html',
                    nextMsg: 'Opt out',
                    next: ['$scope', 'Modals', 'Utils', function($scope, Modals, Utils) {
                        // user has clicked cancel
                        var promise = Modals.showConfirm('Automated REBS Payment','Are you sure you would like to opt out from receiving Automated REBS Payments?');
                        return Utils.promiseThen(promise, function() {
                            var promise2 = $scope.rrCtrl.cancelRenewableRefund();
                            return Utils.promiseThen(promise2, 'cancelled');
                        });
                    }],
                     skip: ['$scope', function($scope) {
                        if($scope.rrCtrl.isBpay ){
                            return "bpay";
                        }
                    }],
                },
                {
                    id: 'cancelled',
                    title: 'Success',
                    completed: true,
                    templateUrl: 'app/wizards/renewable-refund/renewable-refund-cancelled.html'
                },
                {
                    id: 'bpay',
                    progress: false,
                    title: 'Automated REBS payment',
                    templateUrl: 'app/wizards/renewable-refund/renewable-bpay-message.html',
                    completed: true
                }
            ]
    });
}]);