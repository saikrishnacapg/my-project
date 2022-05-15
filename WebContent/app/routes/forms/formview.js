angular.module('myaccount.route').config(function($stateProvider) {
    $stateProvider.state('formview', {
        url: '/forms/:flow',
        templateUrl: "app/routes/forms/formview.html",
        controller: "FormViewCtrl",
        controllerAs: "formViewCtrl",
        reloadOnSearch: false // because we use the :flow parameter we don't want to reload our controller when the page changes
    });

    $stateProvider.state('formviewlegacyurl', {
        url: '/wizard/:flow',
        templateUrl: "app/routes/forms/formview.html",
        controller: "FormViewCtrl",
        controllerAs: "formViewCtrl",
        reloadOnSearch: false // because we use the :flow parameter we don't want to reload our controller when the page changes
    });
});

angular.module('myaccount.route').controller('FormViewCtrl', function($scope, $location, $state, $stateParams, $timeout, DeviceMode, MyAccountClient, SynergySite) {

    var flow = $stateParams['flow'];

    $scope.flow = flow;

    this.viewParams = {
        contentSite: SynergySite,
        myAccount: MyAccountClient,
        myAccountLogon: MyAccountClient + '#/?flow=' + $scope.flow
    };

    var returnTo = document.referrer || SynergySite;

	$scope.$on('$wizardHide', function(event, arg) {
		if (arg.navigationRequired) {
			$timeout(function() {
				window.location = returnTo;
			});
		}
	});
});