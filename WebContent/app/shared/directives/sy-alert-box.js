/**
 * this is mostly to upadate progress bars on ie as it doesn't like the css syntax with an angular expression in it.
 */
angular.module('myaccount.directives').directive('syAlertBox', function (Events) {
    return {
        restrict: 'A',
        require: ['syAlertBox','^ngForm'],
        scope: {
            waitForSubmit: '='
        }, 
        transclude: true,
        replace: true,
        controller: function($scope, $element, $attrs) {
        	var self = this;
            this.show = !$scope.waitForSubmit;
        	var parentForm = $element.parent().controller('form');
        	this.field = parentForm[$attrs['syAlertBox']];
        	
            this.hideAlert = function() {
                this.show = false;
            };

        	$scope.$on(Events.FORM_SUBMITTED, function() {
        		self.submitAttempted = true;
                self.show = true;
        	});

            $scope.$on(Events.DATA_RESET, function() {
                self.submitAttempted = false;
            });
        },
        controllerAs: 'syAlertForCtrl',
        templateUrl: 'app/shared/directives/sy-alert-box.html'        
    };
});