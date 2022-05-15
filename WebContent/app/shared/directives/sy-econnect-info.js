/**
 * display the e-connent information for an account
 */
angular.module('myaccount.directives').directive('syEconnectInfo', function ($timeout, EconnectService, Wizards,$window,$location) {
    return {
        restrict: 'A',
        scope: {
            account: '=',
            fetch: '@?',
            showshortfall: '='
        }, 
        link: function($scope, $element, $attrs) {
        	EconnectService.getEConnectSetting($scope.account, !!$scope.fetch).then(function(eConnectSetting) {
        		$scope.eConnect = eConnectSetting;
                $scope.eConnect.showShortfall = $scope.showshortfall && !eConnectSetting.directDebitExists && eConnectSetting.directDebitInstalmentExists;
        		if (eConnectSetting.isPaperless !== true && !$scope.eConnect.showShortfall && !eConnectSetting.isPromoBox) {
        			$scope.nextTaskName = 'Switch to Paperless';
        			$scope.goToNextTask = function() {
        			    Wizards.close();
                        $timeout(function() {
                            Wizards.openPaperless(eConnectSetting.contractAccountNumber);
                        });
                    }
        		}else if(eConnectSetting.isPromoBox == true){
                    $scope.nextTaskName = 'Bill And Payment';
                    $scope.goToNextTask = function() {
                        Wizards.close();
                        $timeout(function() {
                            var accountIdentifier = $location.search()['accountIdentifier'];
                            $window.location.href = "#/account/bills?accountIdentifier=" +accountIdentifier;
                        });
                    }
                }
        		else {
        			$scope.nextTaskName = 'Pay your bill in full via Direct Debit';
        			$scope.goToNextTask = function() {
        			    Wizards.close();
                        $timeout(function() {
							var args = {};
                            args['skipInstalmentOption'] = true;
                            $window.location.href = "/e-connect.html?accountIdentifier=" + $scope.account.accountIdentifier;
                            //Wizards.openDirectDebit(eConnectSetting.contractAccountNumber, args);
                            //Wizards.openDirectDebit(eConnectSetting.contractAccountNumber);
                        });
                    }
        		}

        	});
        },
        templateUrl: 'app/shared/directives/sy-econnect-info.html'
    };
});