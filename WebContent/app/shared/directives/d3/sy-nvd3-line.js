angular.module('myaccount.directives').directive('syNvLineGraph', function () {
    return {
        restrict: 'EA',
        scope: {
            labelX: '=',
            labelY: '@',
            data: '=',
            shrinkWhen: '=',
            ngShow: '='
        },
        templateUrl: 'app/shared/directives/d3/sy-nvd3-line.html',
        controllerAs: 'lineCtrl',
        controller: function($scope, $element, $attrs) {
            var self = this;
            this.data = $scope.data;
            this.api;

            this.isMultiDay = function (){

                var first, last;
                //Sorry about that
                _.each(self.data, function(data){
                    var pt = _.first(data.values);
                    if ((!first && pt && pt.x )|| (first && pt && moment(pt.x).isBefore(first)) )
                        first = moment(pt.x);
                });

                _.each(self.data, function(data){
                    var pt = _.last(data.values);
                    if ((!last && pt && pt.x) || (last && pt && moment(pt.x).isAfter(last)) )
                        last = moment(pt.x);
                });

                return first && last ? last.diff(first, 'days') > 0 : false;
            };

            this.config = {
                deepWatchData: true,
                refreshDataOnly: true
            };

            this.options = {
                chart: {
                    type: 'lineChart',
//                    interpolate: 'monotone',
                    height:  480,
                    x: function(d){ return d ? d.x : undefined; },
                    y: function(d){ return d ? d.y : undefined; },
                    transitionDuration: 1000,
                    useInteractiveGuideline: true,
                    dispatch: {
                        stateChange: function(e){  },
                        changeState: function(e){  },
                        tooltipShow: function(e){  },
                        tooltipHide: function(e){  }
                    },
                    xAxis: {
                        tickFormat: function(d) {
                            if (angular.isDate(d)) { // tooltips
                                return d3.time.format('%a %b %d at %H:%M %p')(new Date(d));
                            }
                            return self.isMultiDay() ? d3.time.format('%b %d')(new Date(d)) : d3.time.format('%H:%M')(new Date(d)); // ticks
                        }
                    },
                    yAxis: {
                        axisLabel: $scope.labelY,
                        axisLabelDistance: 30
                    },
                    callback: function(chart){

                    },
                    showLegend: true
                }
            };

            $scope.$watch("shrinkWhen", function(newValue, oldValue) {
                self.api ? self.api.refresh() : angular.noop();
            });

            $scope.$watch("ngShow", function(newValue, oldValue) {
                if (newValue) {
                    self.api ? self.api.refresh() : angular.noop();
                }
            });
        }
    }
});
