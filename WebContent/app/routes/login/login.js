angular.module('myaccount.route').config(function ($stateProvider) {
    $stateProvider.state('login', {
        url: '/login?flow',
        templateProvider: ['isLoggedIn', '$http', '$templateCache', function(isLoggedIn, $http, $templateCache) {
        	// if they are already logged in then show a loading page
        	var url = isLoggedIn ? "app/routes/login/login-loading.html" : "app/routes/login/login.html";
			//var url = "app/routes/login/login-loading.html";
        	return $http.get(url, {cache: $templateCache}).then(function(result) {return result.data;});
        }],
        controller: 'LoginCtrl',
        controllerAs: 'loginCtrl',
        resolve: {
            isLoggedIn: ['Session', function (Session) {
                return Session.resume().then(
                    function () {
                        return true;
                    }, function () {
                        return false;
                    }
                );
            }]
        }
    });
});


angular.module('myaccount.route').controller('LoginCtrl', function ($location, $log, $timeout, Busy, Session, isLoggedIn, Router, Utils, SynergySite) {
    var self = this;
   
    this.synergySite = SynergySite;

    if (Session.isLoggedIn()) {
        // send the user to the home if they are already logged in
    	return handleLoginSuccess();
    }
    
    // -- remainder of logic will never get processed --

    this.loginFailed = false;
    this.externalLoginFailed = Utils.isTruthy($location.search()['login_attempt']);
    this.emptyUsernameOrPassword = false;
    this.username = window.AppConfig.user.username; // TODO move to app.conf module
    this.password = window.AppConfig.user.password; // TODO move to app.conf module

    $timeout(function() {
        self.showComparison = true;
    });
    $timeout(function() {
        self.showSummary = true;
    }, 500);

    this.sampleSummary = {
        current: {
            periodLabel: "Latest bill",
            billIsNew: true,
            periodTotal: 530
        },
        lastYear: {
            periodLabel: "Previous bill",
            billIsNew: false,
            periodTotal: 548
        },
        prev: {
            periodLabel: "Same time last year",
            billIsNew: false,
            periodTotal: 555
        }
    };

    this.loginComparision = {
        account: {
            averageDailyUnits: 17.80,
            label: "Your House"
        },
        similarHomes: {
            averageDailyUnits: 10.4,
            label: "Similar homes"
        },
        suburb: {
            averageDailyUnits: 12.51,
            label: "My suburb"
        }
    };

    $timeout(function() {
        $("[class*=off-stage]").removeClass (function (index, css) {
            return (css.match (/off-stage\S*/g) || []).join(' ');
        });
    }, 5);

    this.login = function () {
        this.externalLoginFailed = false;
        this.emptyUsernameOrPassword = false;
        this.loginFailed = false;
        
        if (!this.username || !this.password) {
            this.emptyUsernameOrPassword = true;
            return;
        }

        return Busy.doing('logon', Session.login(this.username, this.password)).then(handleLoginSuccess, handleLoginFailure);
    };

    function handleLoginSuccess() {
        self.loginFailed = false;

        if (Session.skipHome()) {
            // just got one account ... go straight to it
            return Router.gotoAccount(Session._accountList[0].contractAccountNumber);
        }
        else {
            // show the welcome page
            return Router.goDirectlyToHome();
        }
    }

    function handleLoginFailure(result) {
        self.failedMessage = Utils.isServerError(result.status) ?
            'Sorry, we are currently experiencing technical difficulties. Please try again shortly.' :
            result.data;

        self.loginFailed = true;
    }

});



