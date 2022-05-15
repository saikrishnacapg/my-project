angular.module('myaccount.wizard').config(['formRegistryProvider', function(formRegistryProvider) {
	formRegistryProvider.registerForm({
		id: 'addresslookup',
		title: 'Address Lookup',
		controller: ['$scope', '$log', 'formArgs', function ($scope, $log, formArgs) {
			this.addressType = formArgs.addressType;
			this.address = undefined; //address ? _.clone(address) : {};
			this.matchedAddress = undefined;
            this.options = {
                trigger: Modernizr.borderradius ? 'focus' : 'click'
            };
		}],
		controllerAs: 'addressLookupCtrl',
		showProgress: false,
		states: 
			[
			    {
			    	id: 'addresssearch',
			    	completed: false,
					templateUrl: 'app/wizards/addresslookup/address-search.html',
					controller: ['$scope','AddressServer','Busy', '$timeout', function($scope, AddressServer, Busy, $timeout) {
					  
						// which query are we doing
						var query = $scope.addressLookupCtrl.addressType == 'premise' ? AddressServer.premiseQuery : AddressServer.postalAddressQuery;

						$scope.quickSearch = function(str) {
							return angular.isString(str) ? Busy.doing('searching', query(str)) : undefined;
						};

						$scope.$watch('addressLookupCtrl.address', function(newValue, oldValue) {
							if (angular.isObject(newValue) && !angular.equals(newValue, $scope.address)) {
								 // copy properties (done this way to exlcude $$hashkey)
                                // This happens outside of angular land, so wrap it in a timeout
                                // with an implied apply and blammo, we're in action.
                                $timeout(function() {
                                    $scope.$apply(function () {
                                        if (newValue.code != 'NO_MATCHES'){
                                            $scope.addressLookupCtrl.matchedAddress = {code: newValue.code, type: newValue.type, label: newValue.label};
                                        }
                                    });
                                });
							} else {
								$scope.addressLookupCtrl.matchedAddress = undefined;
							}
						});
			    	}],
                    disableNext : function($scope) {
                        return !_.isObject($scope.addressLookupCtrl.matchedAddress) || _.isEmpty($scope.addressLookupCtrl.matchedAddress.code);
                    },
                    next: ['$scope', function ($scope) {
						return $scope.addressLookupCtrl.matchedAddress;
	          		}],
					nextMsg: 'Use Address'
				}
			]
	});
}]);



