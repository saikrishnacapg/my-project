/**
 * MM 17/02/14: I have modified this so that it will only fail validation if the number is present...
 * checking 'required' didn't work in the case where required was a functiom
 *
 *
 * If it is it checked that the input is a valid number.
 */
angular.module('myaccount.directives').directive('syValidateDateofbirth', function ($log, Utils, CardService, $timeout) {
    return {
        restrict: "AC",
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {
            Date.prototype.yyyymmdd = function() {
                var mm = this.getMonth() + 1; // getMonth() is zero-based
                var dd = this.getDate();

                return [this.getFullYear(),
                    (mm>9 ? '-' : '-0') + mm,
                    (dd>9 ? '-' : '-0') + dd
                ].join('');
            };

            let  isDate = function(ExpiryDate) {
                var objDate,  // date object initialized from the ExpiryDate string
                  mSeconds, // ExpiryDate in milliseconds
                  day,      // day
                  month,    // month
                  year;     // year
                // date length should be 10 characters (no more no less)
                if (ExpiryDate.length !== 10) {
                    return false;
                }
                // third and sixth character should be '/'
                if (ExpiryDate.substring(2, 3) !== '/' || ExpiryDate.substring(5, 6) !== '/') {
                    return false;
                }
                // extract month, day and year from the ExpiryDate (expected format is mm/dd/yyyy)
                // subtraction will cast variables to integer implicitly (needed
                // for !== comparing)
                month = ExpiryDate.substring(0, 2) - 1; // because months in JS start from 0
                day = ExpiryDate.substring(3, 5) - 0;
                year = ExpiryDate.substring(6, 10) - 0;


                // test year range
                if (year < 1000 || year > 3000) {
                    return false;
                }
                // convert ExpiryDate to milliseconds
                mSeconds = (new Date(year, month, day)).getTime();
                // initialize Date() object from calculated milliseconds
                objDate = new Date();
                objDate.setTime(mSeconds);
                // compare input date and parts from Date() object
                // if difference exists then date isn't valid
                if (objDate.getFullYear() !== year ||
                  objDate.getMonth() !== month ||
                  objDate.getDate() !== day) {
                    return false;
                }
                return true;
            }

            let  formatString = function(format) {
                var pieces = format.split('-'),
                  year   = parseInt(pieces[0]),
                  month  = parseInt(pieces[1]),
                  day    = parseInt(pieces[2]),
                  date   = new Date(year, month - 1, day);

                return date;
            };

            let  dayDiff = function(fromdate, todate){
                var date2 = new Date(formatString(fromdate));
                var date1 = new Date(formatString(todate));
                var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)/365);
                //diffDays = Math.ceil(diffDays/365);
                return diffDays;
            };

            element.on('input', function(e) {
                if (element.val().length == element.attr("maxlength")) {
                    var DOBDayElement = angular.element('#DOBDay');
                    var DOBMonthElement = angular.element('#DOBMonth');
                    var DOBYearElement = angular.element('#DOBYear');
                    ctrl.$error.age = false;
                    ctrl.$error.dateValid = false;
                    if (DOBDayElement && DOBMonthElement && DOBYearElement){
                        var date = new Date();
                        date = date.yyyymmdd();
                        var DOB = DOBYearElement[0].value +"-"+DOBMonthElement[0].value +"-"+DOBDayElement[0].value;
                        if (isDate(DOBMonthElement[0].value +"/"+DOBDayElement[0].value+"/"+ DOBYearElement[0].value)) {
                            ctrl.$setValidity('syValidateDateofbirth', true);
                        } else {
                            ctrl.$setValidity('syValidateDateofbirth', false);
                            ctrl.$error.dateValid = true;
                            return false;
                        }

                        if (date>DOB) {
                            var diffDays1 = dayDiff(date, DOB);
                            ctrl.$setValidity('syValidateDateofbirth', true)
                            if (diffDays1 <= 16){
                                ctrl.$setValidity('syValidateDateofbirth', false)
                                ctrl.$error.age = true;
                                //alert("You must be 16 years of age to use this service.");
                            } else {
                                ctrl.$setValidity('syValidateDateofbirth', true)
                            }

                        } else {
                            ctrl.$setValidity('syValidateDateofbirth', false)
                            ctrl.$error.age = true;
                        }
                    }
                }
            });
        }
    };
});


angular.module('myaccount.directives').directive('syAutoMove', function ($log, Utils, CardService, $timeout) {
    function getCaretPosition(elem) {
        // Internet Explorer Caret Position
        if (document.selection && document.selection.createRange) {
            var range = document.selection.createRange();
            var bookmark = range.getBookmark();
            return bookmark.charCodeAt(2) - 2;
        }

        // Firefox Caret Position
        return elem.setSelectionRange && elem.selectionStart;
    }

    return {
        restrict:'A',
        link: function (scope, element, attrs, model) {
            var tabindex = parseInt(attrs.tabindex);
            var maxlength = parseInt(attrs.maxlength);
            element.on('input', function (e) {
                var val = element.val(),
                  cp,
                  code = e.which || e.keyCode;
                if (val.length === maxlength ) {
                    if (e.target.id == "DOBDay"){
                        var next = document.querySelectorAll('#DOBMonth');
                        next.length && next[0].focus();
                        return false;
                    }
                    if (e.target.id == "DOBMonth") {
                        var next = document.querySelectorAll('#DOBYear');
                        next.length && next[0].focus();
                        //next[0].select();
                        return false;
                    }
                }
                cp = getCaretPosition(this);
            });
        }
    };
});

angular.module('myaccount.directives').directive('syCheckDateofbirth', function ($log, Utils, CardService, $timeout) {
    return {
        restrict: "AC",
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {
            Date.prototype.yyyymmdd = function() {
                var mm = this.getMonth() + 1; // getMonth() is zero-based
                var dd = this.getDate();

                return [this.getFullYear(),
                    (mm>9 ? '-' : '-0') + mm,
                    (dd>9 ? '-' : '-0') + dd
                ].join('');
            };

            let  isDate = function(ExpiryDate) {
                var objDate,  // date object initialized from the ExpiryDate string
                  mSeconds, // ExpiryDate in milliseconds
                  day,      // day
                  month,    // month
                  year;     // year
                // date length should be 10 characters (no more no less)
                if (ExpiryDate.length !== 10) {
                    return false;
                }
                // third and sixth character should be '/'
                if (ExpiryDate.substring(2, 3) !== '/' || ExpiryDate.substring(5, 6) !== '/') {
                    return false;
                }
                // extract month, day and year from the ExpiryDate (expected format is mm/dd/yyyy)
                // subtraction will cast variables to integer implicitly (needed
                // for !== comparing)
                month = ExpiryDate.substring(0, 2) - 1; // because months in JS start from 0
                day = ExpiryDate.substring(3, 5) - 0;
                year = ExpiryDate.substring(6, 10) - 0;


                // test year range
                if (year < 1000 || year > 3000) {
                    return false;
                }
                // convert ExpiryDate to milliseconds
                mSeconds = (new Date(year, month, day)).getTime();
                // initialize Date() object from calculated milliseconds
                objDate = new Date();
                objDate.setTime(mSeconds);
                // compare input date and parts from Date() object
                // if difference exists then date isn't valid
                if (objDate.getFullYear() !== year ||
                  objDate.getMonth() !== month ||
                  objDate.getDate() !== day) {
                    return false;
                }
                return true;
            }

            let formatString = function(format) {
                var pieces = format.split('-'),
                  year   = parseInt(pieces[0]),
                  month  = parseInt(pieces[1]),
                  day    = parseInt(pieces[2]),
                  date   = new Date(year, month - 1, day);

                return date;
            };

            let dayDiff = function(fromdate, todate){
                var date2 = new Date(formatString(fromdate));
                var date1 = new Date(formatString(todate));
                var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)/365);
                return diffDays;
            };

            element.bind('custom', function($scope){
                ctrl.$setValidity('syValidateDateofbirth', true);
                ctrl.$error.dateValid = false;
            })

            element.bind('blur', function($scope){
                if (element.val().length == element.attr("maxlength")) {
                    var DOBDayElement = angular.element('#DOBDay');
                    var DOBMonthElement = angular.element('#DOBMonth');
                    var DOBYearElement = angular.element('#DOBYear');
                    ctrl.$error.dateValid = false;
                    if (DOBDayElement[0].value != "" && DOBMonthElement[0].value != "" && DOBYearElement[0].value != "") {
                        var date = new Date();
                        date = date.yyyymmdd();
                        var DOB = DOBYearElement[0].value +"-"+DOBMonthElement[0].value +"-"+DOBDayElement[0].value;
                        if (isDate(DOBMonthElement[0].value +"/"+DOBDayElement[0].value+"/"+ DOBYearElement[0].value)) {
                            if (DOBMonthElement[0].value && DOBDayElement[0].value && DOBYearElement[0].value) {
                                DOBDayElement.trigger("custom");
                                DOBMonthElement.trigger("custom");
                                DOBYearElement.trigger("custom");
                            }
                        } else {
                            ctrl.$setValidity('syValidateDateofbirth', false);
                            ctrl.$error.dateValid = true;
                            return false;
                        }
                    }
                }
            })
        }
    };
});