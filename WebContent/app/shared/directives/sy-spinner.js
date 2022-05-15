angular.module('myaccount.directives').directive('sySpinner', function() {
	
	return {
		restrict: 'C',
		controller: function($scope) {
			this.supportCssAnimations = Modernizr.cssanimations;
		},
		controllerAs: 'spinnerCtrl',
		templateUrl: 'app/shared/directives/sy-spinner.html'
	}
});
