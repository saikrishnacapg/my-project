/**
 * Render the synergy contact telephone number
 * 
 * @param accountType, controls whether to show the business or residential account number
 */
angular.module('myaccount.directives').directive('syPhoneNumber', function(ValidationService) {
    return {
        restrict: 'EA',
        replace: true,
        scope: {
            accountType: '@'
        },
        link: function(scope, element, attrs) {
            var contactPhone = ValidationService.getContactPhone(scope.accountType, true);
            var html = Modernizr.touch ? '<a target="_blank" href="tel:' + ValidationService.getContactPhone(scope.accountType, false) + '">' + contactPhone + '</a>' :
                '<span>' + contactPhone + '</span>';
        	element.html(html);
        },
        controllerAs: 'phoneCtrl'
    };
});
