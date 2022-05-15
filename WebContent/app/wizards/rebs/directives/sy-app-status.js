
angular.module('myaccount.wizard').directive('syAppStatus', function () {

    return {
        restrict: 'C',
        scope: {
            currentStep: "=",
            step: "=step"
        },
        transclude: true,
        link: function(scope, element, attrs, ctrl) {
            var currentStep = parseInt(scope.currentStep);
            var step = parseInt(scope.step);

            ctrl.completed = currentStep > step;
            ctrl.inProgress = currentStep === step;
            ctrl.waiting = currentStep < step;

            ctrl.open = currentStep === step || (step < currentStep && attrs.isFinal === 'true');

            ctrl.status = ctrl.inProgress ? 'step--in-progress' : (
                ctrl.completed ? 'step--completed' : 'step--not-started'
            );

            ctrl.expand = true;
            ctrl.hasIntro = false;
        },
        templateUrl: 'app/wizards/rebs/directives/sy-app-status.html',
        controllerAs: 'stepCtrl',
        controller: function ($scope) {
            var expand = true;
            var hasIntro = false;
            var status = $scope.status;

            var open = $scope.open;

            var completed = $scope.completed;
            var inProgress = $scope.inProgress;
            var waiting = $scope.waiting;
        }
    };
});

