/**
 * Used on typeahead inputs like address search to ensure a dropdown
 * is selected and it isn't just free text in the input box.
 */
angular.module('myaccount.directives').directive('syIsAddress', function ($log,Utils) {
    return {
        restrict: "A",
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {

            ctrl.$parsers.push(function(element){

                // Dirty workaround hack to prevent the field to be invalidated on an android phone
                // Parsing is triggered twice on android with element being the populated string instead of the object the second time (composition event)
                //code change starts for INC0045412
                if (element == ""){
                    ctrl.$setValidity('syIsObject', true);
                    return element;
                }
                //code change ends for INC0045412
                else if (_.isObject(ctrl.$modelValue) && element == ctrl.$modelValue.label.trim()){
                    ctrl.$setValidity('syIsObject', true);
                    return ctrl.$modelValue;
                } else {
                    ctrl.$setValidity('syIsObject', _.isObject(element));
                    return element;
                }
            });
        }
    };
});