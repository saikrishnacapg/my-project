angular.module('myaccount.directives').directive('syValidateEmail', function ($log, $timeout, ValidationService) {
	return {
		restrict: "A",
		require: 'ngModel',
        scope: {
            model: '=ngPattern',
        },
		link: function (scope, element, attrs, ctrl) {
            var checkEmail = function(){
                if (isValidInput() && !scope.maskEmail) {
                    var promise = ValidationService.validateEmail(element[0].value);
                    var success = function (result) {
                        setValid((_.safeAccess(result, 'status') !== "error"));
                    };
                    var failure = function (reason) {
                        setValid(true);
                    };
                    promise.then(success, failure);
                }
			};

            var setValid = function(valid) {
                if (valid || isValidInput()) {
                    ctrl.syValidateEmail = valid;
                    ctrl.warning = !valid;
                }
            };

            // Workaround, validate regex manually as form validation is done afterwards
            var isValidInput = function(){
                var value = element[0].value;
                var regex = scope.model;
                return value && regex.test(value);
            };

            element.bind('input', function(e){
                setValid(true);
                checkEmail();
            });
        }
	};
});
