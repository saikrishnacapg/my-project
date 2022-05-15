angular.module('myaccount.route').config(function($stateProvider) {

	// resolve the user ... incorporates functionality to check in with the server to see if the session is alive
	var resolveUser = ['$q', '$state', '$stateParams', 'SessionServer', 'Session', 'Router', function($q, $state, $stateParams, SessionServer, Session, Router) {
		if (Session.isLoggedIn()) {
			return $q.when(Session.user);
		} else {
            // try to resume
            return Session.resume().then(
                function () {
                    var _accountList = Session._accountList;
                        if (!$stateParams.direct) {
                        // load _accountList
                         SessionServer.getAccountList().then(function(result) {
                             Session._accountList =  _accountList  = result;
                             Router.CheckandRedirectAccouninfo(_accountList);
                        });
                    }
                    Router.CheckandRedirectAccouninfo(_accountList);
                    return true;
                }).catch( function () {
                    window.location.href = "/my-account.html"
                  });
        }
    }];

    var resolveAccountList = ['$stateParams', '$log', 'Session', 'user', function ($stateParams, $log, Session, user) {
   		return Session.getAccountList();
    }];

	$stateProvider.state('user', {
		abstract: true,
        templateUrl: "app/routes/user/user.html", //
        controller: "UserCtrl",
        controllerAs: "userCtrl",
        resolve: {user: resolveUser, accountList: resolveAccountList} //
    });
});

angular.module('myaccount.route').controller('UserCtrl', function($log, $state, $filter, user, accountList, Session, Router, Wizards, Busy, AccountUtils, AccountBillServer, DeviceMode, MyAccountClient, SynergyLogoutPage) {
    var self = this;
	this.user = user;
	this.accountList = accountList;

	// handy function to tell whether a ContractAccount is assigned
    this.contractAccountAssigned = function() {
        return !_.isEmpty(accountList);
    };

    // business user is there exists a business account
    this.isBusiness = !!_.find(accountList, AccountUtils.isBusiness);
    this.isIAndC = !!_.find(accountList, AccountUtils.isIAndC);

    // routing
    this.gotoHome = Router.goDirectlyToHome;
    this.gotoAccount = Router.gotoAccount;
    // user wizards
    this.openChangePassword = Wizards.openChangePassword;
    this.openLinkAccount = Wizards.openLinkAccount;
    this.openUnlinkAccount = Wizards.openUnlinkAccount;
    this.openEnergyProfile = Wizards.openEnergyProfile;
    this.openManageAuthoriseContacts = Wizards.openManageAuthoriseContacts;
    this.openMyDetails = Wizards.openMyDetails;
    this.openCreditCard = Wizards.openCreditCard;
    this.openPaperless = Wizards.openPaperless;
    this.openPayAccount = function(contractAccountNumber){
        Wizards.openPayAccount(contractAccountNumber);
    };
    this.openPayOptions = function(contractAccountNumber){
        Wizards.openPayOptions(contractAccountNumber);
    };
    this.choosePaymentOptionIds = function (collective, active, contractAccountNumber) {
        if (collective || !active){
            Wizards.openPayAccount(contractAccountNumber);
        } else {
            Wizards.openPayOptions(contractAccountNumber);
        }
    };
    this.latestBillLink = function (contractAccountNumber, latestBill_pdfId) {
        return AccountBillServer.viewBillLink(contractAccountNumber, latestBill_pdfId, "PDF");
    };

    this.userDisplayName = "Logged in as:" + $filter('capitalize')(Session.user.username);


    this.logout = function() {
        if (typeof(insideFrontInterface) !== 'undefined' && insideFrontInterface.currentChatId !== undefined && insideFrontInterface.currentChatId !== "" && Session.isLoggedIn()) {
            var _insideData = {};
            _insideData.user = {};
            _insideData.user.account_number = "";
            _insideData.user.authenticated_status = false;
            _insideData.user.account_list = "";
            _insideGraph.current.visitorData = _insideData.user;
            _insideGraph.current.trackView({"type":"home","name":"Home Page"});
        }
        localStorage.removeItem('businessPartnerDetail');
        localStorage.removeItem('setCurrentUserIdentifier');
        return Busy.doing('logout',Session.logout());
    };
});
