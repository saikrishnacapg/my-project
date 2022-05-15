angular.module('myaccount.directives').directive('syYesNo', function () {
    return {
        restrict: 'EA',
        replace: true,
        scope: {
            consent: '='
        },
        templateUrl: 'app/shared/directives/sy-yes-no.html'
    };
});