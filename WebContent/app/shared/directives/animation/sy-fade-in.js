angular.module('myaccount.directives').directive('syFadeIn', function ($timeout) {
    return {
        restrict: 'A',
        scope: {
            when: '=',
            direction: '@'
        },
        link: function(scope, element, attr) {
            scope.$watch('when', function (value){
                element[value ? 'removeClass' : 'addClass']('off-stage-' + scope.direction);
            });

            $timeout(function() {
                element.addClass('sy-transition');
            }, 5)
        }
    }
});