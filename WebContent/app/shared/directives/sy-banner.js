angular.module('myaccount.directives').directive('syBanner', function($timeout) {
    return {
        restrict: 'A',
        transclude: true,
        scope: {
            id: '@'
        },
        link: function(scope, elem, tAttrs, ctrl) {
        },
        controllerAs: 'syBannerCtrl',
        controller: function($scope) {
        },
        templateUrl: 'app/shared/directives/sy-banner.html'
    };
});
