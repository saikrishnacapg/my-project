angular.module('myaccount.directives').directive('syItemQuantity',  function ItemQuantityDirective() {
		
	return {
		restrict: 'A',
		replace: true,
		scope: {
			syItemQuantityValue: "=",
            syMaxlength: '@',
            syPrecision: '@',
            name: '@?'
		},
		link: function(scope, element, attrs, ctrl) {

			// default values
			ctrl.min = 0;
			ctrl.max = 99;
			ctrl.step = 1;
			ctrl.value = 0;


			// override values from attrs
			if(typeof attrs.min != "undefined") {
				ctrl.min = parseFloat(attrs.min);
			} 

			if(typeof attrs.max != "undefined") {
				ctrl.max = parseFloat(attrs.max);
			}
			
			if(typeof attrs.step != "undefined") {
				ctrl.step = parseFloat(attrs.step);
			}

			if(typeof attrs.value != "undefined" && attrs.value != "") {
				ctrl.value = parseFloat(attrs.value);
			}

			if( attrs.value == null ) {
				ctrl.value = 0;
			}

			scope.syItemQuantityValue = ctrl.value;
			
		},
		templateUrl: 'app/shared/directives/sy-item-quantity.html',
		controllerAs: 'quantity',
		controller: function($scope) {
			var min, max, step, value;

			this.change = function() {
                if ($scope.syMaxlength && $scope.syItemQuantityValue && $scope.syItemQuantityValue.toString().length > $scope.syMaxlength) {
                    $scope.syItemQuantityValue = parseFloat($scope.syItemQuantityValue.toString().substring(0, $scope.syMaxlength));
                }

				this.value = $scope.syItemQuantityValue;

				if(this.value > this.max) {
					this.value = this.max;
					$scope.syItemQuantityValue = this.value;
				} else if(this.value < this.min) {
					this.value = this.min;
					$scope.syItemQuantityValue = this.value;
				}
			};

			this.inc = function() {
				if(($scope.syItemQuantityValue + this.step) < this.max) {
					$scope.syItemQuantityValue += this.step;
                    if ($scope.syPrecision) {
                        $scope.syItemQuantityValue = parseFloat($scope.syItemQuantityValue.toPrecision($scope.syPrecision));
                    }
				} else {
                    $scope.syItemQuantityValue = this.max;
                }
			};

			this.dec = function() {
				if(($scope.syItemQuantityValue - this.step) > this.min) {
					$scope.syItemQuantityValue -= this.step;
                    if ($scope.syPrecision) {
                        $scope.syItemQuantityValue = parseFloat($scope.syItemQuantityValue.toPrecision($scope.syPrecision));
                    }
				} else {
                    $scope.syItemQuantityValue = this.min;
                }
			};
		}
	}
});