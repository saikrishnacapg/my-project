angular.module('myaccount.directives').directive('syCardContent', function () {
    return {
        restrict: 'EA',
		require: '^syCard',
        scope: {
        }, // isolate scope
        transclude: true,
        replace: true,
		link: function(scope, element, attrs, controller) {
			scope.loaderSwitch = controller.contentReady;
			scope.fontColor = controller.fontColor;
			scope.cardTitle = function() {
                return controller.cardTitle;
            };
			scope.hasReveal = controller.hasReveal;
			scope.imageSrc = controller.imageSrc;
			scope.toggleReveal = controller.toggleReveal;
            scope.icon = controller.icon;
			scope.showHelpButton = controller.showHelp;
			scope.helpId = controller.helpId;
		},
        templateUrl: 'app/shared/directives/cards/sy-card-content.html'
    };
});