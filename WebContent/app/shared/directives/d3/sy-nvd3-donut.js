angular.module('myaccount.directives').directive('syNvDonutGraph', function () {
    return {
        restrict: 'EA',
        scope: {
            labelX: '=',
            labelY: '=',
            data: '=',
            shrinkWhen: '=',
            xAxisTickFormat: '&'
        },
        templateUrl: 'app/shared/directives/d3/sy-nvd3-donut.html',
        controllerAs: 'donutCtrl',
        controller: function($scope, $element, $attrs) {
            var self = this;
            this.data = $scope.data;

            $scope.$watch('data', function(newData) {
                self.data = newData;
            });

            this.config = {
                deepWatchData: false
            };

            this.api;

            var width = 200;
            var height = 300;

            this.options = {
                chart: {
                    type: 'pieChart',
                    height: height,
                    width: width,
                    margin : {
                        top: 10,
                        bottom: 130,
                        left: 0,
                        right: 0
                    },
                    donut: true,
                    transitionDuration: 1000,
                    useInteractiveGuideline: true,
                    showLegend: false,
                    showLabels: false,
                    refreshDataOnly: true,
                    pie:{
                        startAngle: function (d) { return d.startAngle/2 -Math.PI/2 },
                        endAngle: function (d) { return d.endAngle/2 -Math.PI/2 }
                    },
                    labelType: "value",
                    "pieLabelsOutside": false,
                    x: function(d) {
                        return d.label;
                    },
                    y: function(d) {
                        return d.value;
                    },
                    "color": function(d) {
                        return _.safeAccess(d, 'data.color');
                    },
                    tooltipContent: function(label, value, e, graph) {
                        return "<div style='background: white'><h3>" + label + "</h3>" + "<p>" + value + " kWh <p></div>";
                    }
                }
            };
        }
    }
});
