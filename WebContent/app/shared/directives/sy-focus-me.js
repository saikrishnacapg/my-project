angular.module('myaccount.directives').directive('syFocusMe', function ($timeout) {
    return {
        link: function (scope, element, attrs, model) {
            $timeout(function () {
                element[0].focus();
            });
        }
    };
});