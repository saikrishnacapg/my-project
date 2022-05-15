/**
 * this is mostly to upadate progress bars on ie as it doesn't like the css syntax with an angular expression in it.
 */
angular.module('myaccount.directives').directive('syProgressBar', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            scope.$watch('progress', function(newValue, oldValue){
                if ( newValue !== oldValue ) {
                    // Only increment the counter if the value changed
                    // todo pass the model to update bar with
                  element.css('width', scope.progress+'%');
                }
            });
        }
    };
});