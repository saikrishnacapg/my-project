angular.module('myaccount.conf').config(function(syIdleProvider) {
    // in seconds
	syIdleProvider.idleDuration(60*18);
	syIdleProvider.idleWarnDuration(60*2);
});


/**
 * Idle config and run code were separated into two files so that we
 * could exclude this run code when running E2E tests. The background interval
 * seems to mess with "this.ptor.waitForAngular()" function used throughout
 * Protractor tests.
 *
 * @type {*|module}
 *
 */
angular.module('myaccount.conf').run(function($rootScope, Events, idleService) {
    // start watching when the app runs
    $rootScope.$on(Events.LOGIN_STATUS, function(event, loggedIn) {
        if (loggedIn) {
            idleService.watch();
        } else {
            idleService.unwatch();
        }
    });

    $rootScope.$on('$idleEnd', function(e) {
        idleService.logout();
    });
    $rootScope.$on('$idleWarn', function(e) {
        // Uncomment for auto-logout warning.
        idleService.warn();
    });
});



