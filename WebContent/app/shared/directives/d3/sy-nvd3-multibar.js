angular.module('myaccount.directives').directive('syNvMultibarGraph', function ($timeout) {
    return {
        restrict: 'EA',
        scope: {
            labelX: '=',
            labelY: '@',
            data: '=',
            shrinkWhen: '=',
            ngShow: '=',
            showControls: '='
        },
        templateUrl: 'app/shared/directives/d3/sy-nvd3-multibar.html',
        controllerAs: 'barCtrl',
        controller: function($scope, $element, $attrs) {
            var self = this;
            this.data = $scope.data;
            this.api;

            this.config = {
                deepWatchData: true,
                refreshDataOnly: true
            };

            this.options = {
                chart: {
                    type: 'multiBarChart',
                    height: 480,
                    showControls: $scope.showControls,
                    clipEdge: false,
                    x: function(d){ return d.label; },
                    y: function(d){ return d.value; },
                    transitionDuration: 0,
                    useInteractiveGuideline: true,
                    dispatch: {
                        stateChange: function(e){  },
                        changeState: function(e){  },
                        tooltipShow: function(e){  },
                        tooltipHide: function(e){  }
                    },
                    color: function(d) {
                        return _.safeAccess(d, 'data.color');
                    },
                    xAxis: {
                        "axisLabel": "",
                        "tickFormat": function(d) {
                            return d;
                        }
                    },
                    yAxis: {
                        "axisLabel": $scope.labelY,
                        "axisLabelDistance": 30
                    },
                    callback: function(chart){

                    },
                    tooltipContent: function(label, value, e, graph) {
                        return "<div style='background: white'><h3>" + label + "</h3>" + "<p>$" + e + " cost for this period<p></div>";
                    },
                    showLegend: false
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
