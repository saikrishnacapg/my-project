/**
 * Payment method directive
 *
 */
angular.module('myaccount.directives').directive('syInputTrim','Regex', function (Regex) {
    return {
        restrict: 'A',
        scope: true,
        require: '?ngModel',
        link: function (scope, $elem, attr, ctrl) {
            ///Start ngModel $scope, $element, attrs, ctrl
            if (!ctrl) return;

            var filterSpaces = function (str) {
                return str.replace(Regex.FILTER_SPACES, '');
            }
            ctrl.$parsers.unshift(function (viewValue) {

                var elem = $elem[0],
                    pos = elem.selectionStart,
                    value = '';

                if (pos !== viewValue.length) {
                    var valueInit = filterSpaces(viewValue.substring(0, elem.selectionStart));
                    pos = valueInit.length;
                }
                //I launch the regular expression,
                // maybe you prefer parse the rest
                // of the substring and concat.
                value = filterSpaces(viewValue);
                $elem.val(value);
                elem.setSelectionRange(pos, pos);
                //ctrl.$setViewValue(value);
                return value;
            });

            ctrl.$render = function () {
                if (ctrl.$viewValue) {
                    ctrl.$setViewValue(filterSpaces(ctrl.$viewValue));
                }
            };
            /// Ends
        }
    };
})
    .directive('syInputZeroPrefix', ['Regex',function (Regex) {
        return {
            scope: true,
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, $elem, attrs, ctrl) {
                ///Start ngModel $scope, $element, attrs, ctrl
                var zeroPad = function (num, places) {
                    /*if ($('select[name="mobilePrefix"]').val() === "+61") {*/
                        if (num.toString().length < 10 && num.toString().indexOf("0") !== 0 && num.toString().trim() != "" && (num.toString().charAt(0) === "4" || num.toString().charAt(0) === "5")) {
                            num = "0" + num.replace(Regex.FILTER_SPACES, '');
                            return num;
                        }
                        return num.replace(Regex.FILTER_SPACES, '');
                    /*}*/
                }

                $elem.bind('blur', function () {
                    ctrl.$viewValue = ctrl.$viewValue ? zeroPad(ctrl.$viewValue, 10) : ctrl.$viewValue;
                    $elem.val(ctrl.$viewValue);
                    ctrl.$setViewValue(ctrl.$viewValue);
                });
                /// Ends
            }
        };
    }])

    .directive('sySelectInputZeroPrefix', ['Regex',function (Regex) {
        return {
            scope: true,
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, $elem, attrs, ctrl ) {
                ///Start ngModel $scope, $element, attrs, ctrl
                var zeroPad = function (num, places) {
                    if ($('#mobileTelephoneCountry :selected').text().indexOf("+61") != -1) {
                        if (num.toString().length < 10 && num.toString().indexOf("0") != 0 && num.toString().trim() != "" && (num.toString().charAt(0) === "4" || num.toString().charAt(0) === "5")) {
                            num = "0" + num.replace(Regex.FILTER_SPACES, '');
                            return num;
                        }
                        return num.replace(Regex.FILTER_SPACES, '');
                    }
                    return num.replace(Regex.FILTER_SPACES, '');
                }

                $elem.bind('blur', function () {
                    ctrl.$viewValue = zeroPad(ctrl.$viewValue, 10);
                    $elem.val(ctrl.$viewValue);
                    ctrl.$setViewValue(ctrl.$viewValue);
                });
                /// Ends
            }
        };
    }])


    .directive('syRemoveSpace', ['Regex',function (Regex) {
        return {
            scope: true,
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, $elem, attrs, ctrl) {
                ///Start ngModel $scope, $element, attrs, ctrl
                var filterSpaces = function (str) {
                    if (str != undefined){
                        str= str.replace(Regex.FILTER_SPACES, '');
                    }
                    return str;
                }

                $elem.bind('blur', function () {
                    ctrl.$viewValue = filterSpaces(ctrl.$viewValue);
                    $elem.val(ctrl.$viewValue);
                    ctrl.$setViewValue(ctrl.$viewValue);
                });
                /// Ends
            }
        };
    }])

    .directive("landlinevalidateNo", ['$q','Regex', function ($q,Regex) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attr, ctrl ) {

                var filterSpaces = function (str) {
                    if (str != undefined){
                        str= str.replace(Regex.FILTER_SPACES, '');
                    }
                    return str;
                }

                ctrl.$parsers.push(function(viewValue){
                    viewValue = filterSpaces(viewValue);
                    element.val(viewValue);
                    if (/^([0-9])[ \d ]*$/.test(viewValue)) {
                        ctrl.$setValidity('pattern', false);
                        return viewValue;
                    }
                    else {
                        ctrl.$setValidity('pattern', true);
                        return viewValue;
                    }

                });

            }
        }
    }])

    .directive("mobilevalidateNo", ['$q','Regex', function ($q,Regex) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attr, ctrl) {

                var filterSpaces = function (str) {
                    if (str != undefined){
                        str= str.replace(Regex.FILTER_SPACES, '');
                    }
                    return str;
                }

                ctrl.$parsers.push(function(viewValue){
                    viewValue = filterSpaces(viewValue);
                    element.val(viewValue);
                    if ($('#typeOfMobileLocal').val() === 'LOCAL') {
                        if (/^(04|05)[\d]{8}$/.test(viewValue)) {
                            ctrl.$setValidity('pattern', false);
                            return viewValue;
                        }
                        else {
                            ctrl.$setValidity('pattern', true);
                            return viewValue;
                        }
                    }
                    else if ($('#mobileTelephoneCountry :selected').text().indexOf("+61") != -1){

                        if (/^(04|05)[\d]{8}$/.test(viewValue)) {
                            ctrl.$setValidity('pattern', true);
                            return viewValue;
                        }
                        else {
                            ctrl.$setValidity('pattern', false);
                            return viewValue;
                        }
                    }
                    else {
                        if (/^[ \d ]*$/.test(viewValue)) {
                            ctrl.$setValidity('pattern', true);
                            return viewValue;
                        }
                        else {
                            ctrl.$setValidity('pattern', false);
                            return viewValue;
                        }
                    }
                });
            }
        }
    }])

    .directive("customvalidateNo", ['$q','Regex', function ($q,Regex) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attr, ctrl ) {

                var filterSpaces = function (str) {
                    if (str != undefined){
                        str= str.replace(Regex.FILTER_SPACES, '');
                    }
                    return str;
                }

                ctrl.$parsers.push(function(viewValue){
                    if(viewValue) {
                        viewValue = filterSpaces(viewValue);
                        element.val(viewValue);
                        if ($('#landline :selected').val().indexOf("08") != -1 || $('#landline :selected').val().indexOf("02") != -1 || $('#landline :selected').val().indexOf("03") != -1 ||
                            $('#landline :selected').val().indexOf("07") != -1) {
                            if (!(/^[0-9]{8}$/.test(viewValue))) {
                                ctrl.$setValidity('pattern', false);
                                return viewValue;
                            } else {
                                ctrl.$setValidity('pattern', true);
                                return viewValue;
                            }
                        }else{
                            if (!(/^([0-9])[ \d ]*$/.test(viewValue))) {
                                ctrl.$setValidity('pattern', false);
                                return viewValue;
                            }
                            else {
                                ctrl.$setValidity('pattern', true);
                                return viewValue;
                            }
                        }
                    }
                });

                element.bind('blur', function () {
                    ctrl.$viewValue = filterSpaces(ctrl.$viewValue);
                    element.val(ctrl.$viewValue);
                    ctrl.$setViewValue(ctrl.$viewValue);
                    if(ctrl.$viewValue == ""){
                        ctrl.$setValidity('pattern', true);
                        return ctrl.$viewValue;
                    }
                });
           }
        }
    }])



    .directive("phonevalidateNo", ['$q','Regex', function ($q,Regex) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attr, ctrl ) {

                var filterSpaces = function (str) {
                    if (str != undefined){
                        str= str.replace(Regex.FILTER_SPACES, '');
                    }
                    return str;
                }

                ctrl.$parsers.push(function(viewValue){
                    viewValue = filterSpaces(viewValue);
                    element.val(viewValue);
                    if (/^(04|05)[\d]{8}$/.test(viewValue)) {
                        ctrl.$setValidity('pattern', true);
                        return viewValue;
                    }
                    else {
                        ctrl.$setValidity('pattern', false);
                        return viewValue;
                    }
                });
            }
        }
    }]);

