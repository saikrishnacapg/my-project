angular.module('myaccount.directives').directive('syRebsTerms', function () {
    return {
        restrict: 'EA',
        replace: false,
        scope: {
            isRebs: '&',
            model: '='
        },
        templateUrl: 'app/wizards/rebs/sy-rebs-terms.html'
    };
});