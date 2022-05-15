/**
 * can be used to ensure two input fields match use like sy-match="SCOPE-MODEL-TO-MATCH"
 */
angular.module('myaccount.directives').directive('syMatch', function ( $parse, $log) {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            scope.$watch(function() {
                return $parse(attrs.syMatch)(scope) === ctrl.$modelValue;
            }, function(currentValue) {
                ctrl.$setValidity('syMatch', currentValue);
            });
        }
    };
});