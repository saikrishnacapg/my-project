
angular.module('myaccount.wizard')
  .controller('BankpayReceiptOptionsCtrl', BankpayReceiptOptionsCtrl).directive('bankpayReceipt', function () {
    return {
        restrict: 'E',
        scope: {
            payResult: '=',
            emailAddress: '='
        },
        templateUrl: 'app/wizards/payment-bank/bankpay-receipt-directive.html',
        controller: BankpayReceiptOptionsCtrl,
        controllerAs: 'bankpayReceiptCtrl'
    };
});


BankpayReceiptOptionsCtrl.$inject = ['$scope', 'ValidationService', 'OneOffPaymentServer', 'Busy', 'Modals', 'Utils'];
function BankpayReceiptOptionsCtrl($scope, ValidationService, OneOffPaymentServer, Busy, Modals, Utils) {
    var self = this;

    self.showEmail = false;
    self.emailAddress = $scope.emailAddress;
    self.analyticsLabel = $scope.payResult.wasSuccessful ? 'MA bank account payment successful' : 'MA bank account payment declined';

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
            return OneOffPaymentServer.sendResultEmail(emailData).then(function () {
                self.showEmail = false;
                Modals.showAlert('Success', `Your receipt was emailed to ${ emailData.emailAddress}`);
            });
        };

        Busy.doing('next', ValidationService.validateEmail(self.emailAddress).then(success));
    };

    self.pdf = function () {
        Busy.doing('next', OneOffPaymentServer.downloadPdf($scope.payResult)).then(function (pdfData) {
            Utils.openPdf(pdfData, 'Synergy Bill Payment Receipt');
        });
    };

}
