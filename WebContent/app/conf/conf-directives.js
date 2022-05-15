angular.module('myaccount.conf').config(function($datepickerProvider) {
    angular.extend($datepickerProvider.defaults, {
        modelDateFormat: "dd-MM-yyyy"
    });
});