angular.module('myaccount.directives').directive('syCardAction', function () {
    return {
        restrict: 'EA',
		requires:['syCard'],
        scope: {}, // isolate scope
        transclude: true,
        replace: true,
        templateUrl: 'app/shared/directives/cards/sy-card-action.html'
    };
});