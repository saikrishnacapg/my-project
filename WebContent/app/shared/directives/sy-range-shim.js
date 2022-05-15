/**
 * shim to use html5 range if available or dropdown if not.
 * NOTE: This has been hardcoded to work for green energy. If this input is used anywhere else, probably an idea to duplicate and green energy specific one :)
 */
angular.module('myaccount.directives').directive('syRangeShim', function () {
    return {
        restrict: 'A',
        requires: 'ngModel',
        scope: {
            name: "@syrsName",
            // binds our local model to the passin one.
            myModel: "=ngModel",
            min: "@min",
            max: "@max",
            step: "@step",
            fallback: "=syrsFallback",
            required: "@syrsRequired"
        },
        template: function(tElement, tAttrs){
            if (Modernizr.inputtypes.range) {
                return '<div class="sy-range"><div class="sy-range__min">{{fallbackCtrl.min}}</div><div class="sy-range__max">{{fallbackCtrl.max}}</div>' +
                    '<input type="range" min="{{fallbackCtrl.min}}" max="{{fallbackCtrl.max}}" step="{{fallbackCtrl.step}}" ng-model="myModel" id="'+tAttrs.name+'" ng-required="fallbackCtrl.required" /></div>';
            } else {
                return '<select ng-model="myModel" ng-options="currOption for currOption in fallbackCtrl.fallback" id="{{name}}" name="{{name}}" class="form-control" ng-required="fallbackCtrl.required"></select> ';
            }
        },
        controller: function($scope) {
            this.fallback = _.values($scope.fallback);
            this.name = $scope.name;
            this.required = $scope.required;
            this.min = $scope.min;
            this.max = $scope.max;
            this.step = $scope.step;
        },
        controllerAs: 'fallbackCtrl'
    };
});