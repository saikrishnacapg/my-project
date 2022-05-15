angular.module('myaccount.route').controller('DashboardWelcomeCtrl', function($scope, WelcomeServer, Router, Wizards) {
    var currentAccount = $scope.accountCtrl.currentAccount;
    var accountType = currentAccount.contractAccountType,
        hasPaperless = currentAccount.paperlessBillSetting.isPaperless,
        hasDirectDebit = currentAccount.paymentInfo.directDebitExists;

    var suggestions =  [
        {
            action: function() {
                $scope.accountCtrl.openEnergyProfile();
            },
            description: "Complete your household profile",
            contractAccountType: {"RESD": 1}
        },
        {
            action: function() {
                Wizards.openPaperless(currentAccount.contractAccountNumber);
            },
            description: "Go paperless",
            contractAccountType: {"RESD": 2, "SME": 2, "I&C": 3},
            excludeOnPaperless: true
        },
        {
            action: function() {
                Wizards.openDirectDebit(currentAccount.contractAccountNumber);
            },
            description: "Set up Direct Debit",
            contractAccountType: {"RESD": 3, "SME": 3, "I&C": 4},
            excludeOnDirectDebit: true
        },
        {
            action: function() {
                $scope.accountCtrl.gotoUsage();
            },
            description: "Track your usage data",
            contractAccountType: {"RESD": 4, "SME": 4, "I&C": 2}
        },
        {
            action: function() {
                $scope.accountCtrl.gotoBills();
            },
            description: "View your billing history",
            contractAccountType: {"RESD": 5, "SME": 5, "I&C": 1}
        }];

    this.showSuggestions = WelcomeServer.shouldDisplayWelcomeFor('dashboard');
    this.suggestionList = _.chain(suggestions)
                            .filter(function(it) {
                                return !_.isUndefined(it.contractAccountType[accountType]);
                            })
                            .sortBy(function(it) {
                                return it.contractAccountType[accountType];
                            })
                            .reject({excludeOnPaperless: hasPaperless})
                            .reject({excludeOnDirectDebit: hasDirectDebit})
                            .take(3).value();
});
