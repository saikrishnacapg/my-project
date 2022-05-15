/**
 * MM 17/02/14: I have modified this so that it will only fail validation if the number is present...
 * checking 'required' didn't work in the case where required was a functiom
 *
 *
 * If it is it checked that the input is a valid number.
 */
angular.module('myaccount.directives').directive('syIsNumber', function ($log,Utils) {
    return {
        restrict: "A",
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {

            /*ctrl.$parsers.push(function(string){
                string = string.replace(/[$]/g, '');
                if((string) && !Utils.isNumber(string)){
                    ctrl.$setValidity('syIsNumber', false);
                    return string;
                } else if ( !_.isUndefined (attrs.positive) ) {
                    ctrl.$setValidity('syIsNumber', parseFloat(string) > 0);
                    return string;
                } else {
                    ctrl.$setValidity('syIsNumber', true);
                    return string;
                }
            });*/

            ctrl.$parsers.push(function (string) {
                if (attrs.name == "expiryMonth") {
                    var returnType = CardService.CREDIT_CARD_EXPIRY_MONTHS_VALIDATE(string)
                    if (returnType == false) {
                        ctrl.$setValidity('syValidateCardExpiry', false)
                        return undefined;
                    } else {
                        ctrl.$setValidity('syValidateCardExpiry', true)
                        return string;
                    }
                }
                //element.context.form.expiryMonth[1].value,
                if (attrs.name == "expiryYear") {
                    var returnType

                    returnType = CardService.CREDIT_CARD_EXPIRY_YEARS_VALIDATE(angular.element('#expiryMonth')[0].value, string);
                    if (returnType == false) {
                        ctrl.$setValidity('syValidateCardExpiry', false)
                        return undefined;
                    } else {
                        ctrl.$setValidity('syValidateCardExpiry', true)
                        return string;
                    }

                }

                if ( attrs.name != "expiryMonth" || attrs.name != "expiryYear") {
                    string = string.replace(/[$]/g, '');
                    if((string) && !Utils.isNumber(string)){
                        ctrl.$setValidity('syIsNumber', false);
                        return string;
                    } else if ( !_.isUndefined (attrs.positive) ) {
                        ctrl.$setValidity('syIsNumber', parseFloat(string) > 0);
                        return string;
                    } else {
                        ctrl.$setValidity('syIsNumber', true);
                        return string;
                    }
                }

            });
        }
    };
});