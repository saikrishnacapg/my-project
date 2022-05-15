angular.module('myaccount.route').config(function($stateProvider) {
    $stateProvider.state('user.home', {
        url: '/home?direct',
        templateUrl: "app/routes/user/home/home.html",
        controller: 'HomeCtrl',
        controllerAs: 'homeCtrl'
    });
});

angular.module('myaccount.route').controller('HomeCtrl', function ($scope, $filter, $state, $stateParams, $timeout, accountList, Events, Session, SynergySite, Router, WelcomeServer, Modals) {
    this.searchText = undefined;
    $scope.$parent.userCtrl.userDisplayName = "Logged in as: " + $filter('capitalize')(Session.user.username);
    this.synergySite = SynergySite;
    this.displaySplash = WelcomeServer.shouldDisplayWelcomeFor('splash');

    this.dismissSplash = function() {
        WelcomeServer.rollInRedCarpetFor('splash');
        this.displaySplash = false;
    };

    this.showAccountMessage = function () {
        Modals.showAlert("Can't find your new account?", `${$rootScope.messages.MA_H36}`);
    }

    if ( ! ($stateParams.direct || this.displaySplash ) ) {
        var can = accountList[0].contractAccountNumber;
        Session.getAccount(can).then( function() {
            Router.gotoAccount(accountList[0].contractAccountNumber);
            $timeout(function() {
                self.displayListing = true;
            }, 250);
        });
    }

    $scope.$on(Events.ACCOUNT_LIST_INVALIDATED, function() {
        // Issue with reloading to get the updated account details
        // https://github.com/angular-ui/ui-router/issues/582
        $state.transitionTo($state.current, $stateParams, {
            location: false,
            reload: true,
            inherit: true,
            notify: true
        });
    });
});

