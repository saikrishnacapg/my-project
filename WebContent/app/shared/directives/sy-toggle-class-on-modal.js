/**
 * this is mostly to upadate progress bars on ie as it doesn't like the css syntax with an angular expression in it.
 */
angular.module('myaccount.directives').directive('syToggleClassOnModal', function ($rootScope, Events) {
    return {
        restrict: 'A',
        scope: {
            toggle: '@'
        },
        link: function(scope, element) {
        	$rootScope.$on(Events.SHOW_MODAL_WIZARD, function() {
                element.addClass(scope.toggle);
            });
            $rootScope.$on(Events.HIDE_MODAL_WIZARD, function() {
                element.removeClass(scope.toggle);
            });
            $rootScope.$on('$wizardHide', function() {
                element.removeClass(scope.toggle);
            });
        }
    };
});