angular.module('myaccount.directives').directive('syAmountFieldValidation', function ($log,$compile, Utils) {
    return {
        restrict: "A",
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {
            //amountlimit is 500 as an config
            //customer total owning amount
            var amountValidate = function (num, totalowningamount,amountlimit) {
                if (parseFloat(totalowningamount) > parseFloat(amountlimit)) {
                    if (parseFloat(num) <= parseFloat(totalowningamount)) {
                        ctrl.$setValidity('syAmountFieldValidation', true);
                        return num;
                    } else {
                        ctrl.$setValidity('syAmountFieldValidation', false);
                        return num;
                    }
                }else {
                    if (parseFloat(num) <= parseFloat(amountlimit)) {
                        ctrl.$setValidity('syAmountFieldValidation', true);
                        return num;
                    } else {
                        ctrl.$setValidity('syAmountFieldValidation', false);
                        return num;
                    }
                }
            };
            element.bind('blur', function () {
                ctrl.$viewValue = amountValidate(ctrl.$viewValue, attrs.totalowningamount, attrs.customeramountlimit);
                element.val(ctrl.$viewValue);
                ctrl.$setViewValue(ctrl.$viewValue);
            });

        }
    };
});