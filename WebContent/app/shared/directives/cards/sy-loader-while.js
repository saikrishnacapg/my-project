/**
 * Display a material loader while we are waiting for the value to be populated.
 */
angular.module('myaccount.directives').directive('syLoaderWhile', function () {
    return {
        restrict: 'EA',
        scope: {
        	switch: '&',
			size: '@',
			color: '@'
        }, // isolate scope
        controller: function($scope, $element, $attrs) {
        	this.displayLoader = function() {
        		return !$scope.switch();
        	};
			this.color = $scope.color;
			this.size = $scope.size;
            this.absoluteCenter = _.isUndefined($attrs.absoluteCenter) ? '' : 'sy-absolute-center';
        },
        controllerAs: 'syLoaderWhileCtrl',
        templateUrl: 'app/shared/directives/cards/sy-loader-while.html'
    };
});