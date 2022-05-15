/**
 * date directive - insert custom date picker when not in a html5 browser.
 *
 * There is a serious bug in angular with validation and dynamically added form inputs -  https://github.com/angular/angular.js/issues/1404
 * so as this works tempted to just leave it. (applies to the range shim directive as well.)
 */
angular.module('myaccount.directives').directive('syDatePicker', function ($log,$parse) {
    return {
        restrict: 'A',
        requires: 'ngModel',
        scope: {
            name: "@sydpName",
            myDateModel: "=ngModel", // should be a moment
            required: "@sydpRequired",
            min: "@",
            max: "@"
        },
        template: function(tElement, tAttrs){
            // chooses which template to insert into the dom based upon modernizer
            var required = '';
            if(tAttrs.sydpRequired){
                required = ' required ';
            }
            var name = tAttrs.sydpName;

            var validator ="",hidden='';
            if(angular.isDefined(tAttrs.sydpValidator)){
                validator = ' '+tAttrs.sydpValidator+'="" ';
                //used to validate the combined value... can't use type=hidden as angular ignores it
                hidden = '<input class="form-control" type="text" ng-hide="true" name="'+name+'" ng-model="myDateModel" '+validator+required+'  />';
            }
            // can we use html5 only use this for testing!!!!
            /// Modernizr.inputtypes.date = false; // todo just for testing!!!
            //
            if (!Modernizr.inputtypes.date) {
                var fallback = {
                    daySelect: '<div class="col-xs-3"><select class="form-control" id="'+name+'_day" name="'+name+'_day" class="input-small" ng-model="selectDay" ng-options="d for d in days"  '+required+' > <option value="">day</option> </select></div>',
                    monthSelect: '<div class="col-xs-5 inline-input"><select class="form-control" id="'+name+'_month" name="'+name+'_month" class="input-medium" ng-model="selectMonth" ng-options="m.value as m.text for m in months"  '+required+'>  <option value="">-  month  -</option> </select></div>',
                    yearSelect: '<div class="col-xs-4"><select class="form-control" id="'+name+'_year" name="'+name+'_year" class="input-small" ng-model="selectYear" ng-options="y for y in years"  '+required+'>  <option value="">- year -</option> </select></div>'
                };
                var fallBackTpl = '<div class="row">'+fallback.daySelect + fallback.monthSelect + fallback.yearSelect + hidden + '</div>';
                tElement.append(fallBackTpl);

            } else {
                var min ="";
                if(angular.isDefined(tAttrs.min)){
                    min = ' min="'+tAttrs.min+'" ';
                }
                var max ="";
                if(angular.isDefined(tAttrs.max)){
                    max = ' max="'+tAttrs.max+'" ';
                }

                var html5Date = '<input class="form-control" type="date" name="'+name+'" ng-model="myDateModel" '+required+min+max+validator+'  />';
                tElement.append(html5Date);
            }
        },
        link: function (scope, elem, tAttrs, ctrl) {
            // only need this if not html5
            scope.days = ctrl.getDays();
            scope.months = ctrl.getMonths();
            scope.years = ctrl.getYears();
            if (!Modernizr.inputtypes.date) {

                // set the value if we have one
                var existingDate = $parse(tAttrs.ngModel)(scope.$parent);
                if(angular.isDefined(existingDate)){
                    var split = existingDate.split('-');
                    // convert split to number otherwise the select value won't be populated
                    scope.selectYear = Number(split[0]);
                    scope.selectMonth = split[1];
                    scope.selectDay= split[2];
                }

                scope.$watch(function () {
                    return  scope.selectYear + "-" + scope.selectMonth + "-" + scope.selectDay;
                }, function (collection) {
                    // update our model
                    scope.myDateModel = collection;
                });
            }
        },
        controller: ['$scope', '$element', '$attrs', '$transclude', function ($scope, $element, $attrs, $transclude) {
            /**
             * provides functions for getting the day/month/year
             */
            this.getDays = function () {
                var days = [];
                for (var i = 1; i <= 31; i++) {
                    var day = "0" + i;
                    days.push(day.substr(day.length-2));
                }
                return days;
            };

            this.getMonths = function () {
                return [
                    {value: "01", text: 'January'},
                    {value: "02", text: 'February'},
                    {value: "03", text: 'March'},
                    {value: "04", text: 'April'},
                    {value: "05", text: 'May'},
                    {value: "06", text: 'June'},
                    {value: "07", text: 'July'},
                    {value: "08", text: 'August'},
                    {value: "09", text: 'September'},
                    {value: "10", text: 'October'},
                    {value: "11", text: 'November'},
                    {value: "12", text: 'December'}
                ];
            };

            this.getYears = function () {
                var thisYear = moment().add('days',100).get('year');
                var years = [];
                for (var i = thisYear; i >= 1893; i--) {
                    years.push(i);
                }
                return years;
            };
        }]

    };
});