/**
 * display the e-connent information for an account during a deactivation process
 */
angular.module('myaccount.directives').directive('syEconnectDeactivationInfo', function (EconnectService) {
    return {
        restrict: 'A',
        scope: {
            process: '@',
            eConnect: '=?', // optional eConnect setting before deactivation
            account: '=?' // optional account ... will load eConnect setting after deactivation
        },
        link: function($scope, $element, $attrs) {
            if ($scope.eConnect) {
                $scope.wasEconnect = $scope.eConnect.isActive;
            }
            else {
                // need to load
                EconnectService.getEConnectSetting($scope.account, true).then(function(eConnectSetting) {
                    // assume were on eConnect if there are 2 compontents still active
                    $scope.wasEconnect =
                        (eConnectSetting.isRegistered ? 1 : 0) +
                        (eConnectSetting.isPaperless ? 1 : 0) +
                        (eConnectSetting.hasDirectDebit ? 1 : 0) == 2
                });
            }

        },
        templateUrl: 'app/shared/directives/sy-econnect-deactivation-info.html'
    };
});