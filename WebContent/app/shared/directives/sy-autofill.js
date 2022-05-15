/**
 * Loops through checking to see if the browser autofills the field and
 * manually populates the model if it does.
 *
 * Stops checking after 10 attempts.
 */
angular.module('myaccount.directives').directive('syAutofill', function ($timeout) {

    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {}, // Need to isolate scope or timeout's will conflict
        link: function (scope, elem, attrs, ctrl) {
            var count = 20; // 5 seconds
            var timedCheck = undefined;

            scope.check = function(){
                var val = elem[0].value;
                if(val && ctrl.$viewValue !== val){
                    ctrl.$setViewValue(val);
                    return;
                }

                if (count <= 0) {
                    return;
                } else {
                    count--;
                    timedCheck = $timeout(scope.check, 250);
                }
            };
            scope.check();

            scope.$on('$destroy', function(){
                if (timedCheck) {
                    $timeout.cancel(timedCheck);
                }
            });

            return;
        }
    };
});