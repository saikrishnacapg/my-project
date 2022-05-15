
angular.module('myaccount.route').directive('syApexCharts', [function () {
    return {
        restrict: 'EA',
        template: '<div></div>',
        scope: {
            name: '=',
            id: '@id',
            chart:'=',
            dirtyCheck: '='
        },
        link: function (scope, element, attrs) {
            if (!scope.chart){
                return ;
            }
            var chart = new ApexCharts(element[0].querySelector("div"), scope.chart);
            chart.render();
            scope.$watch('chart', function (newOptions, oldOptions) {
                // newOptions is an updated set of options
                if (angular.isObject(newOptions)) {
                    chart.updateOptions(newOptions);
                }
            });
        }
    };
}]);