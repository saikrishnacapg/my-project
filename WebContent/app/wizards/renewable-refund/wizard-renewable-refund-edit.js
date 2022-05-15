angular.module('myaccount.wizard').config(['formRegistryProvider', function(formRegistryProvider) {
    formRegistryProvider.registerForm({
        id: 'renewablerefund-edit',
        title: 'Automated REBS Payment',
        analytics: {
            formName: 'Automatic REBS signup'
        },
        controller: ['renewableRefundModel', 'Busy', 'Session', 'RebsServer', 'Utils',
            function(renewableRefundModel, Busy, Session, RebsServer, Utils) {
                var self = this;
                self.isLoggedIn = Session.isLoggedIn();
                self.model = renewableRefundModel;
                self.isBpay = renewableRefundModel.account.paperlessBillSetting.isBPay;
                
                self.submitApplication = function() {
                    var parentCAN = self.isCollective ? _.safeAccess(renewableRefundModel, 'contractAccountNumber') : undefined;
                    return Utils.promiseThen(Busy.doing('next', RebsServer.submitRefundApplication(self.model, parentCAN)), undefined);
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
                    id: 'refundbankdetails',
                    title: 'Bank details',
                    checkpoint: true,
                    progress: false,
                    templateUrl: 'app/wizards/renewable-refund/renewable-refund-bankdetails.html',
                    skip: ['$scope', function($scope) {
                        if($scope.rrCtrl.isBpay ){
                            return "bpay";
                        }
                    }],
                },
                {
                    id: 'refundconfirm',
                    title: 'Confirmation',
                    checkpoint: true,
                    templateUrl: 'app/wizards/renewable-refund/renewable-refund-confirm.html',
                    nextMsg: 'Confirm',
                    disableNext: function($scope) {
                        return !$scope.rrCtrl.model.refundTermsAccepted;
                    },
                    next: ['$scope', function($scope) {
                        return $scope.rrCtrl.submitApplication;
                    }]
                },
                {
                    id: 'refundsuccess',
                    title: 'Success',
                    checkpoint: true,
                    completed: true,
                    templateUrl: 'app/wizards/renewable-refund/renewable-refund-update-success.html'
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