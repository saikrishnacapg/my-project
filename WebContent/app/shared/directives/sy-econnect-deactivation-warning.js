/**
 * display the e-connent information for an account during a deactivation process
 */
angular.module('myaccount.directives').directive('syEconnectDeactivationWarning', function (EconnectService) {
    return {
        restrict: 'A',
        scope: {
            account: '=',
            process: '@'
        },
        link: function($scope, $element, $attrs) {
        	EconnectService.getEConnectSetting($scope.account).then(function(eConnectSetting) {
        		$scope.eConnect = eConnectSetting;
        	});
        },
        templateUrl: 'app/shared/directives/sy-econnect-deactivation-warning.html'
    };
});