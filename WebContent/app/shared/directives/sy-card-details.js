/**
 * Payment method directive
 *
 */
angular.module('myaccount.directives').directive('syCardDetails', function ($log, $parse, $compile, Modals) {
    return {
        restrict: 'E',
        scope: {
            cardModel: '=',
            excludeCurrentMonth: '@?'
        },
        templateUrl: 'app/shared/directives/sy-card-details.html',
        controller: function ($scope){
            if (!$scope.cardModel) {
                $scope.cardModel = {}
            }

            $scope.showCardNumberInfo = function() {
                Modals.showAlert("Card number", $rootScope.messages["MA_H12"], {});
            }
            $scope.showCardHolderNameInfo = function() {
                Modals.showAlert("Card Holder Name", $rootScope.messages["H12"], {});
            }
        }
    };
});
