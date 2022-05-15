angular.module('myaccount.directives').directive('syCardReveal', function () {
    return {
        restrict: 'EA',
		require: '^syCard',
        scope: {
        }, // isolate scope
        transclude: true,
        replace: true,
		link: function(scope, element, attrs, controller) {
			scope.color = controller.color;
			scope.fontColor = controller.fontColor;
			scope.cardTitle = controller.cardTitle;
			scope.toggleReveal = controller.toggleReveal;	
			
			controller.revealContent = element;		
			controller.registerReveal(element);
		},
        templateUrl: 'app/shared/directives/cards/sy-card-reveal.html'
    };
});