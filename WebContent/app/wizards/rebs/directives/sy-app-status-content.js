angular.module('myaccount.wizard').directive('syAppStatusContent', function () {

    return {
    	require: '^syAppStatus',
        restrict: 'C',
        scope: false,
        transclude: true,
        link: function(scope, element, attrs, ctrl) {
            scope.stepCtrl = ctrl;
        },
        controllerAs: 'statusContent',
        controller: function($scope) {
            this.contentShowMore = function() {
                $scope.stepCtrl.expand = true;
            };

            this.contentShowLess = function() {
                $scope.stepCtrl.expand = false;
            }
        },
        templateUrl: 'app/wizards/rebs/directives/sy-app-status-content.html'
    };
});