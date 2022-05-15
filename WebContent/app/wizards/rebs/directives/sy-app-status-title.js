angular.module('myaccount.wizard').directive('syAppStatusTitle', function (Modals) {

    return {
        require: '^syAppStatus',
        restrict: 'C',
        scope: false,
        transclude: true,
        link: function(scope, element, attrs, ctrl) {
            scope.statusTitle.progressText = attrs.progressText || 'in progress';
            scope.statusTitle.completedText = attrs.completedText || 'completed';
            scope.stepCtrl = ctrl;
        },
        controllerAs: 'statusTitle',
        controller: function($scope) {
            this.open = function() {
                $scope.stepCtrl.open = ! $scope.stepCtrl.open;
            };
        },
        templateUrl: 'app/wizards/rebs/directives/sy-app-status-title.html'
    };
});