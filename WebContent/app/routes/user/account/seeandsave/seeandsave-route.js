angular.module('myaccount.route').config(function($stateProvider) {

    var resolveFAQs = ['account', 'SeeAndSaveHttpServer', function (account, SeeAndSaveHttpServer) {
        return SeeAndSaveHttpServer.loadFaqs(account.contractAccountNumber);
    }];

    $stateProvider.state('user.account.seeandsave', {
        url: 'seeandsave',
        templateUrl: "app/routes/user/account/seeandsave/seeandsave.html",
        controller: 'SeeAndSaveCtrl',
        controllerAs: 'sasCtrl',
        resolve: {faqs: resolveFAQs}
    });
});
