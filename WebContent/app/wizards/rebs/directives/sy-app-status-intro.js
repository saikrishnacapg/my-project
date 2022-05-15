angular.module('myaccount.wizard').directive('syAppStatusIntro', function () {

    return {
        require: '^syAppStatus',
        restrict: 'C',
        replace: true,
        scope: false,
        transclude: true,
        link: function(scope, element, attrs, ctrl) {
            scope.stepCtrl = ctrl;

            scope.stepCtrl.expand = false;
            scope.stepCtrl.hasIntro = true;
        },
        templateUrl: 'app/wizards/rebs/directives/sy-app-status-intro.html'
    };
});