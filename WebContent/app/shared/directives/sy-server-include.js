angular.module('myaccount.directives').directive('syServerInclude', function ($log, $rootScope, Utils, Resources) {
    return {
        restrict: 'A',
        scope: false,
        replace: true,
        template: '<div ng-include="serverUrl">Please wait...</div>',
        link: function ($scope, elem, attrs, ctrls) {
            $scope.serverUrl = Resources.getContentLocation(attrs.syServerInclude);
        }
    };
});