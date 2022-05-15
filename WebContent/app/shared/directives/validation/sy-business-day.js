/**
 * Directive to validate that the modelValue (assumed to be a moment) is a business day
 */
angular.module('myaccount.directives').directive('syBusinessDay', function ($log,Utils) {

    return {
        restrict: "A",
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {
            var validate = function(model){
                if(angular.isDefined(model)){
                    var inputMoment = moment(model); // moment constructor should tolerate string, Date or moment
                    // is a weekend
                	var isWeekend = inputMoment.day() == 6 || inputMoment.day() === 0;
                    ctrl.$setValidity('syBusinessDay', !isWeekend);
                    return model; // do not modify the model
                }
            };
            // validation needs to be done on both if input may not come from the user which is the case with our html5 shims
            ctrl.$parsers.push(validate);
            ctrl.$formatters.push(validate);

        }
    };
});