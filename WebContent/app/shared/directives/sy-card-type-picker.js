/**
 * get a credit card numbers type and helps display a card type icon next to it!
 */
angular.module('myaccount.directives').directive('syCardTypePicker', function ($log,$compile, Utils) {
	return {
		restrict: "A",
		scope: false,
		link: function (scope, element, attrs, ctrl) {
			scope.showAmex = true;
			scope.showMastercard = true;
			scope.showVisa = true;

			var tpl = '<div class="card-icon-group">' +
                '<img class="card-icon" alt="Visa" src="img/credit-card-visa.png" ng-show="showVisa"></img>' +
                '<img class="card-icon" alt="Mastercard" src="img/credit-card-mastercard.png" ng-show="showMastercard"></img>' +
                '<img class="card-icon" alt="American Express" src="img/credit-card-american-express.png" ng-show="showAmex"></img>	</div>';

			
			element.addClass('card-icon-filter');
			element.append($compile(tpl)(scope));
			var input = element.find('input');

			
			var checkCard = function(e){
				var value = input.val();
				var cardType = value === "undefined" ? null : Utils.getCreditCardType(value);
				if(cardType === null){
                    element.addClass('card-icon-filter');
                    scope.showAmex = true;
                    scope.showMastercard = true;
                    scope.showVisa = true;
                } else {
                    element.removeClass('card-icon-filter');
                    scope.showAmex = cardType === 'amex';
                    scope.showMastercard = cardType === 'mastercard';
                    scope.showVisa = cardType === 'visa';
                }
                scope.$apply();
			};
			
			input.on('keyup', checkCard);
			input.on('blur', checkCard);

		}
	};
});