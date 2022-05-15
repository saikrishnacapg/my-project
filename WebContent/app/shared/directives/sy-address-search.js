
angular.module('myaccount.directives').directive('syAddressSearch', function(AddressServer, Busy) {

	return {
	      restrict: 'A',
	      replace: false,
          scope: {
	    	  addressType: '@', // premise or postal
	    	  address: '=',
	    	  addressCallback: '&addressSelected',
              addressRequired: '@',
              errorMsg: "@?"
	      },
	      templateUrl: 'app/shared/directives/sy-address-search.html',
	      controller: function($scope, $element, $attrs, $log, $timeout, $rootScope, Events) {

              $scope.options = {
                  trigger: Modernizr.borderradius ? 'focus' : 'click'
              };

              // which query are we doing
	    	  var addressQuery = $scope.addressType == 'premise' ? AddressServer.premiseQuery : AddressServer.postalAddressQuery;

              $scope.addressOptions = [];
	    	  
	    	  $scope.quickSearch = function(str) {
                  return angular.isString(str) ? Busy.doing('searching', addressQuery(str)) : undefined;
	    	  };

              if(!$scope.address) {
                  $scope.address = {
                      selection: undefined
                  }
              }
	    	  
	    	  if ($scope.address && $scope.address.code) {
	    		  $scope.address.selection = angular.copy($scope.address);
	    	  }
	    	  
	    	  $scope.$watch('address.selection', function(newValue, oldValue) {
                  // code change done for contact us form
                  if (!angular.equals(newValue, $scope.address)) {
		    		  // copy properties (done this way to exlcude $$hashkey)]
                      $timeout(function() {
                          $scope.$apply(function () {
                              if (newValue.code != 'NO_MATCHES'){
                                  $scope.address.code = newValue.code;
                                  $scope.address.type = newValue.type;
                                  $scope.address.label = newValue.label;
                                  delete $scope.address.$$hashkey;
                                  $scope.addressCallback(newValue);
                              }

//                              $element.find('input').trigger("change");
                          });
                      });
	    		  }
                  else {
                      $rootScope.$broadcast(Events.DATA_RESET);
                  }
	    	  });
	      }
	    };
});