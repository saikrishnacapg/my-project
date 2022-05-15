/**
 * this is mostly to upadate progress bars on ie as it doesn't like the css syntax with an angular expression in it.
 */
angular.module('myaccount.directives').directive('sySubmitButton', function ($rootScope, Events) {
    return {
        restrict: 'A',
        link: function (scope, elm, attr) {
            elm.on('click', function () {
                scope.$apply(function () {
                	$rootScope.$broadcast(Events.FORM_SUBMITTED);
                });
            });
        }
    };
});