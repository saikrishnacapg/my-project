angular.module('myaccount.directives').directive('syAutotabTo', function ($compile) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {
            scope.$watch(attrs.ngModel, function() {
                if (ctrl.$valid) {
                    document.getElementById(attrs.syAutotabTo).focus();
                }
            });            
        }
    };
});