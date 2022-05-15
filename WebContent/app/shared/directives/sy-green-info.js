angular.module('myaccount.directives').directive('syGreenInfo', function () {

    return {
        restrict: 'A',
        replace: false,
        scope: {
            greenEnergy: '=syGreenInfo'
        },
        template: function (tElement, tAttrs) {
            if (angular.isDefined(tAttrs['syLabelOnly'])) {
                // label only
                return '<h2>Product</h2><p ng-bind="greenProductName()">';
            }
            else if (angular.isDefined(tAttrs['syContributionOnly'])) {
                // plan amount only
                return '<span class="green-amount" ng-bind="greenProductPlanAmount()"></span> <span ng-if="displayPerBillText()">per bill (including GST)</span>';
            }
            else if (angular.isDefined(tAttrs['syInline'])) {
            	return '<span ng-bind="greenProductName()"></span>: <span class="green-amount" ng-bind="greenProductPlanAmount()"></span> <span ng-if="displayPerBillText()">per bill (including GST)</span>';
            }
            else {
                // full label
                return '<h2>Product</h2><p ng-bind="greenProductName()"></p> <h2>Contribution</h2><p>{{greenProductPlanAmount()}} <span ng-if="displayPerBillText()">per bill (including GST)</span></p>';
            }

        },
        controller: function ($scope) {

            $scope.greenProductPlanAmount = function () {
                var result = '';
                if (angular.isDefined($scope.greenEnergy) && $scope.greenEnergy != null) {
                    switch($scope.greenEnergy.greenProductCode) {
                        case 'EG':
                            result = '$' + $scope.greenEnergy.greenProductPlanAmount;break;
                        default:
                            result = $scope.greenEnergy.greenProductPlanAmount + '%';
                    }
                }
                return result;
            };

            $scope.greenProductName = function () {
                var result;
                if (angular.isDefined($scope.greenEnergy) && $scope.greenEnergy != null) {
                    switch($scope.greenEnergy.greenProductCode) {
                        case 'EG':
                            result = 'EasyGreen';break;
                        case 'EF':
                            result = 'Earth Friendly';break;
                        case 'NP':
                            result = 'NaturalPower';break;
                        default:
                            result = '';
                    }
                }
                return result;
            };

            $scope.displayPerBillText = function () {
                return $scope.greenEnergy && $scope.greenEnergy.greenProductCode === 'EG';
            };
        }
    };
});


	
