/**
 * MM 17/02/14: I have modified this so that it will only fail validation if the number is present...
 * checking 'required' didn't work in the case where required was a functiom
 *
 *
 * If it is it checked that the input is a valid number.
 */
angular.module('myaccount.directives').directive('syValidateCardExpiry', function ($log,Utils,CardService,$timeout) {
    return {
        restrict: "A",
        require: 'ngModel',
        link: function (scope, $element, $attrs, ctrl) {

            // on blur event:
            //scope.$watch('autofocusIf', function(shouldFocus) {
//            element.on('input , keyup', function(e) {
//
//                if(element.val().length == element.attr("maxlength")) {
//                    var expiryYearElement = angular.element('#expiryYear');
//                    expiryYearElement[0].focus();
//                    /*$timeout(function () {
//
//                    });*/
//                    /*var next = document.querySelectorAll('#expiryYear'); // document.getElementById('DOBMonth'); //
//                    next.length && next[0].focus();
//                    next[0].select();*/
//                    //return false;
//                }
//            });

            /*element.on('input', function(e) {
             if(element.val().length == element.attr("maxlength")) {
             var DOBDayElement = angular.element('#DOBDay');
             $timeout(function () {
             DOBDayElement[0].focus();
             });
             }
             });

             element.on('input', function(e) {
             if(element.val().length == element.attr("maxlength")) {
             var DOBMonthElement = angular.element('#DOBMonth');
             $timeout(function () {
             DOBMonthElement[0].focus();
             });
             }
             });

             element.on('input', function(e) {
             if(element.val().length == element.attr("maxlength")) {
             var DOBYearElement = angular.element('#DOBYear');
             $timeout(function () {
             DOBYearElement[0].focus();
             });
             }
             });*/



            ctrl.$parsers.push(function(string){

                var parentForm = $element.parent().controller('form');
                if($attrs.name == "expiryMonth" && parentForm.expiryMonth.$viewValue == ''){
                    return ;
                }
                if($attrs.name == "expiryYear" && parentForm.expiryYear.$viewValue == ''){
                    return ;
                }

                if ($attrs.name == "expiryMonth" || $attrs.name == "expiryYear") {

                    var returnType = CardService.CREDIT_CARD_EXPIRY_MONTHS_VALIDATE(parentForm.expiryMonth.$viewValue)
                    var returnTypeYear = CardService.CREDIT_CARD_EXPIRY_YEARS_VALIDATE(parentForm.expiryMonth.$viewValue, parentForm.expiryYear.$viewValue);

                    ctrl.$setValidity('syValidateCardExpiry', (returnType && returnTypeYear));

                    return string;
                }
            });
        }
    };
});