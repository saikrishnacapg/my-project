angular.module('myaccount.wizard').config(['formRegistryProvider', function(formRegistryProvider) {
	formRegistryProvider.registerForm({
        id: 'changeinpassword',
        title: 'Change password',
        analytics: {
            formName: "change password"
        },
        controller: ['$scope', 'Busy', 'ChangePasswordServer',
            function ($scope, Busy, ChangePasswordServer) {
	            this.password = {
	                oldPassword: undefined,
	                newPassword: undefined,
	                newPasswordConfirm: undefined
	            };
	
	            this.changePassword = function() {
	                return Busy.doing('next', ChangePasswordServer.changePassword(this.password.oldPassword, this.password.newPassword));
	            };
	        }],
        controllerAs: 'cpCtrl',
        showProgress: false,
        authenticated: true,
        states: 
            [
                {
                    id: 'edit',
                    title: 'Change password',
                    templateUrl: 'app/wizards/changeinpassword/changepassword-edit.html',
                    nextMsg: 'Submit',
                    next: ['$scope', 'Utils', function($scope, Utils) {
                        var promise = $scope.cpCtrl.changePassword();
                        return Utils.promiseThen(promise, 'success');
                    }]
                },
                {
                    id: 'success',
                    title: 'Success',
                    completed: true,
                    templateUrl: 'app/wizards/changeinpassword/changepassword-success.html'
                }
            ]
    });

}]);

angular.module('myaccount.wizard').factory('ChangePasswordServer', function ($http) {

    var ChangePasswordServer = {

        changePassword: function (oldPassword, newPassword) {
            return  $http({
                method: 'POST',
                url: '/user/changePassword.json',
                data: {
                    oldPassword: oldPassword,
                    newPassword: newPassword
                }
            });
        }
    };

    return ChangePasswordServer;
});
