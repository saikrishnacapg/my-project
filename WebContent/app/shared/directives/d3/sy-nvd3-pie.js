angular.module('myaccount.directives').directive('syNvPieGraph', function ($timeout) {
    return {
        restrict: 'EA',
        scope: {
            data: '=',
            shrinkWhen: '=',
            ngShow: '='
        },
        templateUrl: 'app/shared/directives/d3/sy-nvd3-pie.html',
        controllerAs: 'pieCtrl',
        controller: function($scope, $element) {
            var self = this;
            this.data = $scope.data;
            this.api;

            this.config = {
                deepWatchData: true,
                refreshDataOnly: true
            };

            this.options = {
                chart: {
                    type: "pieChart",
                    height:  480,
                    "showLabels": true,
                    "labelType": "percent",
                    "pieLabelsOutside": false,
                    "x": function(d) {
                        return d.label;
                    },
                    "y": function(d) {
                        return d.value;
                    },
                    "transitionDuration": 1000,
                    "labelThreshold": 0.01,
                    "showLegend": true,
                    "color": function(d) {
                        return _.safeAccess(d, 'data.color');
                    },
                    tooltipContent: function(label, value, e, graph) {
                        if(_.isUndefined(e.point.peakCost)){
                            return "<div style='background: white'><h3 style='text-align:left'>" + label + "</h3>" + "<p>" + value + " kWh <p></div>";
                        }else{
                            return "<div style='background: white; '><h3 style='text-align:left'> Cost (On peak)</h3><p>$" + e.point.peakCost + " cost for this period <p><h3 style='text-align:left'> Cost (Off peak) </h3> <p>$" + e.point.offPeakCost + " cost for this period <p></div>";    
                        }                     
                    }
                    ,
                    legend: {   
                      dispatch: {   
                        legendClick: function(d, i) {
                            throw "i am not clickable!"; // throwing error to stop further execution
                        }
                      }
                    }
                }
            };
//
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
