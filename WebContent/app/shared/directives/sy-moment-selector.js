/**
0 * This directive is more like a shim, choosing between the HTML5 <input type=date> and falling back to bootstraps datepicker-popup
 *
 * The underlying datatype is expected to be a moment. Thankfully, a Date can be constructed from a moment, meaning that the bootstrap
 * date picker pretty much just plugs straight in.
 *
 * Last year Alex Wilcox wrote the following ... I'm note sure if its still relevent.
 * "There is a serious bug in angular with validation and dynamically added form inputs -  https://github.com/angular/angular.js/issues/1404
 * so as this works tempted to just leave it. (applies to the range shim directive as well.)"
 *
 * @require moment.js, Modernizr
 * @see http://angular-ui.github.io/bootstrap/
 * @see http://stackoverflow.com/questions/14474555/how-to-format-a-date-using-ng-model for example of link magic
 */
angular.module('myaccount.directives').constant('DATE_INPUT_REGEX', /^\d{2}(\/)\d{2}(\/)\d{4}$/); // "dd/mm/yyyy" for inputs
angular.module('myaccount.directives').service('DateParseService', function(HTML5_DATE_FORMAT, SYNERGY_DATE_FORMAT) {
    this.parseToMoment = function(date) {
        if (date._isAMomentObject) {
            return date;
        } else if (_.isDate(date)){
            return moment(date);
        } else if (/[0-9]{1,4}-[0-9]{1,2}-[0-9]{1,2}/.test(date)){
            return moment(date, HTML5_DATE_FORMAT)
        } else if (/[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{1,4}/.test(date)) {
            return moment(date, SYNERGY_DATE_FORMAT)
        } else {
            return null;
        }
    };
});

angular.module('myaccount.directives').directive('syMomentSelector', function (HTML5_DATE_FORMAT, DateService) {
    return {
        restrict: 'A',
        require: ['?datepicker'],
        replace: true,
        scope: {
            min: '=?',
            max: '=?',
            syModel: "=",
            past: '@?',
            excludeWeekends: '=?',
            excludeHolidays: '=?',
            placeholder: '@?'
        },
        template: function (tElement, tAttrs) {
            var trigger = Modernizr.borderradius ? 'focus' : 'click'
            var avoidNative = tAttrs.avoidNative === 'true' || tAttrs.avoidNative === 'TRUE';

            if (tAttrs.excludeHolidays) {
                // Compile a string of public holiday dates that the supporting code expects in the disabled-dates attribute.
                // Important: setting statically in template doesn't work as it is dynamically watched on change.
                tAttrs.disabledDates = "[" + _.map(DateService.PUBLIC_HOLIDAYS, function (e) {
                    return "{start: " + e.date.startOf('day').valueOf() + ", end: " + e.date.endOf('day').valueOf() + "}";
                }) + "]";
            }

            // angularjs migrates attributes across from the parent element
            if (!avoidNative && Modernizr.inputtypes.date) {
                // use html5 date (
                return tAttrs.past !== 'true' ? '<input  ng-model="syModel"  type="date" sy-moment-selector-html5>' : '<input  ng-model="syModel"  type="date" max="' + moment().format(HTML5_DATE_FORMAT) + '"' + 'sy-moment-selector-html5>';
            } else {
                // use input with bootstrap date popup (which takes care of binding to javascript Date object)
                return '<input type="text" ng-model="syModel" data-date-format="dd/MM/yyyy" date-type="date" data-autoclose="1"  data-icon-left="sy-icon--chevron-left" data-icon-right="sy-icon--chevron-right" ' +
                  'sy-moment-selector-bootstrap data-autoclose="1" bs-datepicker trigger="' + trigger + '" min-date="{{min}}" max-date="{{max}}" exclude-weekends disabled-dates ' + (_.isEmpty(tAttrs.placeholder) ? 'placeholder="dd/mm/yyyy"' : '') + '>';
            }
        }
    }
});

/**
 * Html5 date selector
 */
angular.module('myaccount.directives').directive('syMomentSelectorHtml5', function ($log, $parse, Utils, HTML5_DATE_FORMAT, DateParseService, DateUtils) {
    return {
        restrict: 'A',
        require: 'ngModel',
        replace: true,
        link: function(scope, elm, attrs, ctrl) {
            var ngModelCtrl = ctrl;
            var defaultSynergyVal = moment().subtract(1, 'day').subtract(16, 'years'); // 16 years of age

            // TODO min/max should come through as moments?
            var minMoment = scope.min ? moment(scope.min) : undefined;
            var maxMoment = scope.max ? moment(scope.max) : (attrs.defaultSynergyMax === 'true' ? defaultSynergyVal : undefined);
            var excludeWeekends = scope.excludeWeekends;
            var excludeHolidays = scope.excludeHolidays;

            // check where
            scope.validateModelValue = function(modelValue) {
                var mv = moment(modelValue);
                ngModelCtrl.$setValidity('min', (!minMoment || (!mv.isValid()) || (mv >= minMoment)));
                ngModelCtrl.$setValidity('max', (!maxMoment || (!mv.isValid()) || (mv <= maxMoment)));
                ngModelCtrl.$setValidity('excludeWeekends', excludeWeekends ? Utils.isWeekday(mv) : true);
                ngModelCtrl.$setValidity('excludeHolidays', excludeHolidays ? !DateUtils.isPublicHoliday(mv) : true);
            };

            ngModelCtrl.$formatters.unshift(function (modelValue) {
                if (!modelValue) {
                    return "";
                }

                scope.validateModelValue(modelValue);
                // format modelValue (which should already be a moment) into the HTML5 date format
                // Not anymore. The HTML5 format is displayed on the Android browser. We want the format below instead.
                return DateParseService.parseToMoment(modelValue).format(HTML5_DATE_FORMAT);
            });

            ngModelCtrl.$parsers.unshift(function (viewValue) {

                if (!viewValue ) {
                    return undefined;
                } else {
                    var modelValue = DateParseService.parseToMoment(viewValue).format(HTML5_DATE_FORMAT);
                    scope.validateModelValue(modelValue);
                    return modelValue;
                }
            });
        }
    };
});

/**
 * Bootstrap date selector
 * TODO pass the min/max attributes to the bootstrap directive
 */
angular.module('myaccount.directives').directive('syMomentSelectorBootstrap', function ($log, $parse, HTML5_DATE_FORMAT, DateParseService, Utils, DateUtils, DateService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        replace: true,

        link: function(scope, elm, attrs, ctrl) {
            var ngModelCtrl = ctrl;
            var defaultSynergyVal = moment().subtract(1, 'day').subtract(16, 'years'); // 16 years of age

            // TODO min/max should come through as moments?
            var minMoment = scope.min ? moment(scope.min) : undefined;
            var maxMoment = scope.max ? moment(scope.max) : (attrs.defaultSynergyMax === 'true' ? defaultSynergyVal : undefined);
            var excludeWeekends = scope.excludeWeekends;
            var excludeHolidays = scope.excludeHolidays;

            function setAllValidators(bool) {
                ngModelCtrl.$setValidity('min', bool);
                ngModelCtrl.$setValidity('max', bool);
                ngModelCtrl.$setValidity('regex', bool);
                ngModelCtrl.$setValidity('excludeWeekends', bool);
                ngModelCtrl.$setValidity('excludeHolidays', bool);
            }

            // Trigger change event for analytics
            scope.$watch('syModel', function(newValue, oldValue){
                if (newValue !== oldValue){
                    elm.trigger("change");
                }

            });

            // check where
            scope.validateModelValue = function(modelValue) {
                var mv = DateParseService.parseToMoment(modelValue);
                ngModelCtrl.$setValidity('min', (!minMoment || (!mv.isValid()) || (mv >= minMoment)));
                ngModelCtrl.$setValidity('max', (!maxMoment || (!mv.isValid()) || (mv <= maxMoment)));
                ngModelCtrl.$setValidity('regex', true);
                ngModelCtrl.$setValidity('excludeWeekends', excludeWeekends ? Utils.isWeekday(mv) : true);
                ngModelCtrl.$setValidity('excludeHolidays', excludeHolidays ? !DateUtils.isPublicHoliday(mv) : true);
            };

            scope.$watch('min', function(newValue, oldValue) {
                if (newValue !== oldValue) {
                    attrs.startDate =  moment(newValue, HTML5_DATE_FORMAT).toDate();
                }
                scope.startDate =  moment(newValue, HTML5_DATE_FORMAT).toDate();
            });

            // this picker operates on the ngModel as well, so we must carefully unshift/push to convert things to moments
            ngModelCtrl.$formatters.unshift(function (modelValue) {
                if (!modelValue){
                    return "";
                }
                // format modelValue (which should already be a moment) into a Date which bootstrap expects
                scope.validateModelValue(modelValue);
                return DateParseService.parseToMoment(modelValue).format(HTML5_DATE_FORMAT);
            });

            // note we push the parser as this will make it the last parsed to run
            ngModelCtrl.$parsers.push(function (viewValue) {
                if (_.isUndefined(viewValue)) {
                    return undefined;
                }

                var emptyInput = !viewValue && !elm.val();

                if (emptyInput) {
                    setAllValidators(true);
                    return;
                }

                //Check if user bypassed excluded dates with keyboard input
                var tempMoment;
                if (DateParseService.parseToMoment(viewValue).format("DD/MM/YYYY") !== elm.val()) {
                    tempMoment = DateParseService.parseToMoment(elm.val());
                }


                if (tempMoment && tempMoment.isValid() && (tempMoment > maxMoment || tempMoment < minMoment)){
                    scope.validateModelValue(tempMoment.format(HTML5_DATE_FORMAT));
                    scope.syModel = tempMoment;
                    ngModelCtrl.$setValidity('date', true);
                    return;
                }

                var moment = DateParseService.parseToMoment(viewValue);
                var modelValue;
                if (moment && moment.isValid()){
                    modelValue = moment.format(HTML5_DATE_FORMAT);
                    scope.validateModelValue(modelValue);
                }

                return modelValue;
            });
        }
    };
});