angular.module('myaccount.route').config(function($stateProvider) {
	$stateProvider.state('reenreqconfirm', {
		url: '/reenreqconfirm?flow',
        templateUrl: "app/routes/reenreqconfirm/reenreqconfirm.html",
        controller: 'ReEnReqConfirmCtrl',
        controllerAs: 'reenreqconfirmCtrl'
    });
});

angular.module('myaccount.route').controller('ReEnReqConfirmCtrl', function(http, $location) {
    var self = this;

    http({
        method: 'GET',
        url: '/reenreqconfirm/submit?guid=' + $location.search()['guid']
    }).then(function(resp) {
        self.isSuccess = resp.success;
    })
});
