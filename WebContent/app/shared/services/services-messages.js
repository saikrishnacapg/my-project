angular.module('myaccount.shared.services').service('MessagesService', function(ValidationService) {

    var self = this;

    // Message to template mapping. TODO: retrieve them from fragments so the can be customized by business
    this.MESSAGES_TEMPLATES = {
        'EXTENSION_ACCOUNT_NOT_ELIGIBLE': 'app/wizards/latepayment/latepayment-non-eligible.html',
        'EXTENSION_ACCOUNT_MANAGED': 'app/wizards/latepayment/latepayment-non-eligible.html',
        'EXTENSION_ACCOUNT_NO_OUTSTANDING_AMOUNT': 'app/wizards/latepayment/latepayment-no-outstanding-amount.html',
        'EXTENSION_ACCOUNT_ON_DD': 'app/wizards/latepayment/latepayment-account-on-direct-debit.html'
    };
    self.message =undefined;

        ValidationService.loadErrorMessages().then(function(result) {
            var resultNoHTMLCharCode = result;
            _.each(resultNoHTMLCharCode, function(value, key) {
                resultNoHTMLCharCode[key] = value.split('&#44;').join(',');
            });
            self.message = resultNoHTMLCharCode;
        })

    this.getTemplate = function (msg) {
        return self.MESSAGES_TEMPLATES[msg];
    };
    self.getMessageText = function(messgesID) {
        return self.message[messgesID];
    };

});
