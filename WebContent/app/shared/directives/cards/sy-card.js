/**
 * Display a templated card. Should make the card implementation independent of the title, content and actions.
 * Should also display a spinner while waiting for certain data.
 */
angular.module('myaccount.directives').directive('syCard', function () {
    return {
        restrict: 'EA',
        scope: {
        	readyWhen: '=',
			cardTitle: '=',
			color: '@',
			fontColor: '@',
			imageSrc: '@',
			icon: '@',
            showHelp: '=',
            helpId: '@'
        }, // isolate scope
        transclude: true,
        replace: true,
        controller: function($scope, $element, $attrs) {
			var self = this;
        	self.contentReady = function() {
        		return $attrs.readyWhen ? $scope.readyWhen : true;
        	};
			
			// Need to explicity define as content comes before reveal is registered.
			self.hasReveal = !_.isUndefined($attrs.reveal);
			
			self.registerReveal = function(element) {
				self.revealContent = element;
			};
			
			self.toggleReveal = function() {
				self.revealContent.css(self.revealed ? {transform: 'translateY(0%)'} : {transform: 'translateY(-100%)'});
				self.revealed = !self.revealed;
			};
			
			self.color = $scope.color;
			self.fontColor = $scope.fontColor;
			self.cardTitle = $scope.cardTitle;
			self.imageSrc = $scope.imageSrc;
			self.icon = $scope.icon;
			self.revealed = false;
			self.showHelp = $scope.showHelp;
			self.helpId = $scope.helpId;

            $scope.$watch('cardTitle', function(newTitle) {
                self.cardTitle = newTitle;
            });
        },
        controllerAs: 'syCardCtrl',
        templateUrl: 'app/shared/directives/cards/sy-card.html'
    };
});