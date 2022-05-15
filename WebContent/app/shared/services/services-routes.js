/**
 * all interface methods return a promise
 */
angular.module('myaccount.shared.services').factory('Router', function($location, $injector, $log, Session) {

	var $state;
	
	function go(state, args) {
		$state = $state || $injector.get('$state'); // overcome circular dependency problem
		return $state.go(state, args);
	}

	var Router = {
			
	    gotoLogin: function() {
            return go('login');
	    },
		
        // This will avoid the controller initialisation logic that sends you
        // to the account if you have only one account on landing from Synergy site login.
	    goDirectlyToHome: function() {
	    	return go('user.home', {direct: true});
	    },
	    	    
	    gotoAccount: function(contractAccountNumber) {
	        var accountIdentifier = Session.accountIdentifierByCAN(contractAccountNumber) || currentAccountIdentifier();
            var args = {accountIdentifier: accountIdentifier};
            var searchParams = $location.search();

            if (searchParams.flow)
                angular.extend(args, {flow: searchParams.flow});

            return go('user.account.dashboard', args);
	    },
	    
	    gotoRegistrationForm: function() {
	    	return go('formview', {flow: 'register'});
	    },
		CheckandRedirectAccouninfo: function(_accountList) {
			var activecount = 0;
			var Inactivecount = 0;
			for (var i = 0; i < _accountList.length; i++) {
				if (!_accountList[i].active) {
					Inactivecount++;
				} else if (_accountList[i].active) {
					activecount++;
				}
			}

			if (activecount === 1) {
				this.gotoAccount(_accountList[0].contractAccountNumber);
			}
			else if ((activecount === 0 && Inactivecount === 0) || (activecount === 0 && Inactivecount > 0) || (activecount > 0 && Inactivecount > 0)) {
				this.goDirectlyToHome();
			}
			else {
				this.goDirectlyToHome();
			}
		}
	};


    return Router;
});