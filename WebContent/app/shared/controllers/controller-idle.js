angular.module('myaccount.shared.controllers').controller('IdleWarningCtrl', function(idleService) {
    this.logout = idleService.logout;
    this.resume = idleService.watch;
});