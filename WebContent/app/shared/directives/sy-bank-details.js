/**
 * Payment method directive
 *
 */
angular.module('myaccount.directives').directive('syBankDetails', function ($log, $parse, $compile, Modals) {
    return {
        restrict: 'E',
        scope: {
            bankModel: '='
        },
        templateUrl: 'app/shared/directives/sy-bank-details.html',
        controller: function ($scope){
            if (!$scope.bankModel) {
                $scope.bankModel = {}
            }
            $scope.showBsbInfo = function() {
                Modals.showAlert("BSB", $rootScope.messages.MA_H10, {});
            }
            $scope.showAccountNumberInfo = function() {
                Modals.showAlert("Account number", $rootScope.messages.MA_H11, {});
            }
            $scope.showCardHolderNameInfo = function() {
                Modals.showAlert("Card Holder Name", $rootScope.messages.H12, {});
            }
            $scope.showAccountHolderNameInfo = function() {
                Modals.showAlert("Account Holder Name", $rootScope.messages.H124, {});
            }
        }
    };
});
