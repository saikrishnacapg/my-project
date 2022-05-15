/**
 * Payment method directive
 *
 */
angular.module('myaccount.directives').directive('syCardExpiry', function ($log,$parse,$compile) {
    return {
        restrict: 'E',
        scope: {
            cardModel: '=',
            excludeCurrentMonth: '@?'
        },
        templateUrl: 'app/shared/directives/sy-card-expiry.html',
        controller: ['$scope', 'CardService',function($scope,  CardService){

            this.CREDIT_CARD_EXPIRY_MONTHS = function() {
                if (!$scope.excludeCurrentMonth){
                    return CardService.CREDIT_CARD_EXPIRY_MONTHS($scope.cardModel.expiryYear);
                } else {
                    return CardService.CREDIT_CARD_EXPIRY_MONTHS_INCLUSIVE($scope.cardModel.expiryYear);
                }
            };

            this.CREDIT_CARD_EXPIRY_YEARS = function() {
                if (!$scope.excludeCurrentMonth) {

                    return CardService.CREDIT_CARD_EXPIRY_YEARS($scope.cardModel.expiryMonth);
                } else{
                    return CardService.CREDIT_CARD_EXPIRY_YEARS_INCLUSIVE(this.payData.newCard.expiryMonth);
                }
            };

        }],
        controllerAs: 'cardCtrl'

    };
});