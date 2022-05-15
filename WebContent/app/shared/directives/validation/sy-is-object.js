/**
 * Used on typeahead inputs like address search to ensure a dropdown
 * is selected and it isn't just free text in the input box.
 */
angular.module('myaccount.directives').directive('syIsObject', function ($log,Utils) {
    return {
        restrict: "A",
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {

            ctrl.$parsers.push(function(element){
                ctrl.$setValidity('syIsObject', _.isObject(element));

                return element;
            });
        }
    };
});