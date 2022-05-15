angular.module('myaccount.wizard').constant('BillDetailType', {
	ACCOUNT_NUMBER: {
		page: 1,
		message: 'Account Number'
	},
	NAME_ON_BILL: {
		page: 1,
		message: 'Enter the account name, exactly as it appears on your bill'
	},
	MAILING_ADDRESS: {
		page: 1,
		message: 'Mailing address'
	},
    PAYMENT_NUMBER: {
        page: 1,
        message: 'Payment number'
    },
	SUPPLY_ADDRESS: {
		page: 2,
		message: 'Supply address'
	},
	METER_NUMBER: {
		page: 2,
		message: 'Meter number'
	},
	CONTRACT_ACCOUNT_TARIFF: {
		page: 2,
		message: 'Tariff associated with this account'
	},
	AMOUNT_ON_LAST_BILL: {
		page: 1,
		message: 'Total amount on last bill'
	}

});


angular.module('myaccount.directives').directive('syBillImage', function(BillDetailType) {

	return {
	      restrict: 'A',
	      replace: false, 
	      scope: {
	    	  billDetailType: '@type'
	      },
	      templateUrl: 'app/shared/directives/sy-bill-image.html',
	      controllerAs: 'billImageCtrl',
	      controller: function($scope) {
	    	  var self = this;
	    	  
	    	  $scope.$watch('billDetailType', activateBillImage);
	    	  activateBillImage();
	    	  
	    	  function activateBillImage(id) {
		    	  var typeId = $scope.billDetailType;
		    	  self.type = typeId;
		    	  
		    	  var billDetail = BillDetailType[typeId]; 
		    	  if (billDetail) {
		    		  self.page = billDetail.page;
		    		  self.message = billDetail.message;
		    	  }
		    	  else {
		    		  self.page = 1;
		    		  self.message = 'Sample Bill';
		    	  }
	    	  }
	    	  
	    	  // debugging
	    	  this.BillDetailType = BillDetailType;
	    	  this.activate = function(name) {
	    		  $scope.billDetailType = name;
	    	  };
	      }
	    };
});