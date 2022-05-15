angular.module('myaccount.route').config(function($stateProvider) {
	$stateProvider.state('passwordreset', {
		url: '/passwordreset/:token',
        templateUrl: "app/routes/passwordreset/passwordreset.html",
        controller: 'PasswordResetCtrl'
    });
});

angular.module('myaccount.route').controller('PasswordResetCtrl', function($scope, $log, $stateParams, Session, Busy, Router, Modals, PasswordResetServer) {
	
	// validate the token
	var token = $stateParams.token;
	var promise = PasswordResetServer.validatePasswordResetToken(token);
	var success = function() {
		$scope.validToken = true;
	};
	var failure = function() {
		$scope.validToken = false;
	};
	promise.then(success,failure);
	
    $scope.resetPasswordUsingToken = function(){
        var promise = PasswordResetServer.resetPasswordUsingToken(token, $scope.data.newPassword);
        var success = function(result){
            $log.log('resetPasswordUsingToken success');
            Session._start(result);
            Modals.showAlert('Success', $rootScope.messages["MA_H4"]);
        };
        var success2 = function(result) {
            // send them to the home page!
            Router.gotoLogin();
        };
        promise.then(success).then(success2);
    };
});

angular.module('myaccount.route').factory('PasswordResetServer', function(http) {

    var PasswordResetServer = {

        validatePasswordResetToken: function(token) {
            var promise = http({
                method: 'POST',
                url: '/forgottenCredentials/validatePasswordResetToken.json',
                data: {token: token}
            });

            return promise;
        },
        resetPasswordUsingToken: function(token, password) {
            var promise = http({
                method: 'POST',
                url: '/forgottenCredentials/resetPasswordUsingToken.json',
                data: {token: token, password: password}
            });

            return promise;
        }
    };

    return PasswordResetServer;
});