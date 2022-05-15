
angular.module('myaccount.wizard')
  .controller('PayReceiptOptionsCtrl', PayReceiptOptionsCtrl).directive('payReceipt', function () {
    return {
        restrict: 'E',
        scope: {
            payResult: '=',
            emailAddress: '='
        },
        templateUrl: 'app/wizards/payment/pay-receipt-directive.html',
        controller: PayReceiptOptionsCtrl,
        controllerAs: 'payReceiptCtrl'
    };
});


PayReceiptOptionsCtrl.$inject = ['$scope', 'ValidationService', 'PayServer', 'Busy', 'Modals', 'Utils'];
function PayReceiptOptionsCtrl($scope, ValidationService, PayServer, Busy, Modals, Utils) {
    var self = this;

    self.showEmail = false;
    self.emailAddress = $scope.emailAddress;
    self.analyticsLabel = $scope.payResult.wasSuccessful ? 'MA payment successful' : 'MA payment declined';

    self.email = function () {

        var failure = function () {
            Modals.showAlert('Failure', $rootScope.messages.E618, {});
        };

        var success = function (result) {
            var isValid = _.safeAccess(result, 'status') !== "error";
            if (!isValid) {
                return failure();
            }

            var emailData = _.cloneDeep($scope.payResult);
            emailData.emailAddress = self.emailAddress;
            return PayServer.sendResultEmail(emailData).then(function () {
                self.showEmail = false;
                Modals.showAlert('Success', `Your receipt was emailed to ${ emailData.emailAddress}`);
            });
        };

        Busy.doing('next', ValidationService.validateEmail(self.emailAddress).then(success, failure));
    };

    self.pdf = function () {
        Busy.doing('next', PayServer.downloadPdf($scope.payResult)).then(function (pdfData) {
            Utils.openPdf(pdfData, 'Synergy Bill Payment Receipt');
        });
    };

}
