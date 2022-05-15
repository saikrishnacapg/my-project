angular.module('myaccount.route').factory('WelcomeServer', function () {
    var welcomes = {
        dashboard: false,
        splash: false
    } ;
    var WelcomeServer = {
        shouldDisplayWelcomeFor: function(type) {
            return welcomes[type];
        },
        rollOutRedCarpetFor: function(type) {
            welcomes[type] = true;
        },
        rollInRedCarpetFor: function(type) {
            welcomes[type] = false;
        }
    };
    return WelcomeServer;
});