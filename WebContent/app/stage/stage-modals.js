angular
	.module('myaccount.stage')
	.controller('ModalWizardsCtrl', ModalWizardsCtrl);
			
ModalWizardsCtrl.$inject = ['$scope', '$rootScope', '$location', '$timeout', 'Events'];
function ModalWizardsCtrl($scope, $rootScope, $location,$timeout, Events) {

	$scope.formId = undefined;
	
	$scope.$on(Events.SHOW_MODAL_WIZARD, function(evt, args) {
		// show a wizard
		$scope.formId = args.formId;
		$scope.formArgs = args;

        setTimeout(function() {
            var elements = $(".forFocus").find("*").filter(function () {
                if (/^select|textarea|button|a|input$/i.test(this.tagName)) { //not-null
                    //Optionally, filter the same elements as above
                    if (/input/i.test(this.tagName) && !/^checkbox|radio|text$/i.test(this.type)) {
                        // Not the right input element
                        return false;
                    }
                    return !this.readOnly &&
                        !this.disabled
                        && $(this).parentsUntil('form', 'div').css('display') != "none"
                        ;
                }
                return false;
            });
            elements.eq(0).focus().select();
        },500);

	});
	
	$scope.$on('$wizardHide', function(evt, arg) {
		// unsetting the formId causes the wizard to be removed
		$scope.formId = undefined;
		$scope.formArgs = undefined;
	});
}