/**
 * Payment method directive
 *
 */
angular.module('myaccount.directives').directive('syCardDdiDetails', function ($log, $parse, $compile, Modals) {
    return {
        restrict: 'E',
        scope: {
            cardModel: '=',
            excludeCurrentMonth: '@?'
        },
        templateUrl: 'app/shared/directives/sy-card-ddi-details.html',
        controller: function ($scope){
            $scope.testMethod=1;
            if (!$scope.cardModel) {
                $scope.cardModel = {}
                $scope.cardModel.newCardSelected=true;
            } else {
                $scope.cardModel.newCardSelected = false;
            }

            $scope.showCardNumberInfo = function() {
                Modals.showAlert("Card number", $rootScope.messages["MA_H12"], {});
            }

            $scope.showCardHolderNameInfo = function() {
                Modals.showAlert("Card Holder Name", $rootScope.messages["H12"], {});
            }

            $scope.setTestMethod = function(value) {
                $scope.cardModel.newCardSelected = value;
                $scope.testMethod = (value === true) ? '2' : '1';
            }

        }
    };
});
