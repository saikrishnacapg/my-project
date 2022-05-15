/**
 * MM 17/02/14: I have modified this so that it will only fail validation if the number is present...
 * checking 'required' didn't work in the case where required was a functiom
 *
 *
 * If it is it checked that the input is a valid number.
 */
angular.module('myaccount.directives').directive('syIsNumberIgnoreSpaces', function ($log,Utils) {
    return {
        restrict: "A",
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {

            ctrl.$parsers.push(function(string){
                if(typeof string !='undefined'){
                    string = string.replace(/[\s]/g, '')
                }


                if((string) && !Utils.isNumber(string)){
                    ctrl.$setValidity('syIsNumberIgnoreSpaces', false);
                    return undefined;
                } else if ( !_.isUndefined (attrs.positive) ) {
                    ctrl.$setValidity('syIsNumberIgnoreSpaces', parseFloat(string) > 0);
                    return string;
                } else {
                    ctrl.$setValidity('syIsNumberIgnoreSpaces', true);
                    return string;
                }
            });
        }
    };
});