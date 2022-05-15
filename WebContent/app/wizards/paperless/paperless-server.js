angular.module('myaccount.wizard').factory('PaperlessServer', ['$log', 'http', function ($log, http) {

    var PaperlessServer = {
        /**
         * turns on paperless billing
         *
         * @param contractAccountNumber
         * @param emailAddress
         * @returns {Promise}
         */
        setPaperlessBilling: function(contractAccountNumber, emailAddress, mobileTelephone, mobileTelephoneCountry, accountsToUpdate) {
            return http({
                method: 'POST',
                //url: '/accountUpdate/' + contractAccountNumber + '/setPaperlessBilling.json',
                url: '/accountUpdate/' + contractAccountNumber + '/setPaperlessBillingWithSMS.json',
                data: {
                    emailAddress: emailAddress,
                    mobileTelephone : mobileTelephone ?  mobileTelephone : null,
                    mobileTelephoneCountry : mobileTelephoneCountry ? mobileTelephoneCountry : null,
                    accountsToUpdate : accountsToUpdate
                }
            });
        },
        /**
         *
         * @param contractAccountNumber
         * @returns {Promise}
         */
        cancelPaperlessBilling: function(contractAccountNumber) {
            return http({
                method: 'POST',
                //url: '/accountUpdate/' + contractAccountNumber + '/cancelPaperlessBilling.json'
                url: '/accountUpdate/' + contractAccountNumber + '/cancelPaperlessSMSBilling.json'
            });
        },
        /**
         *
         * @param contractAccountNumber, cancellationDetail object
         * @returns {Promise}
         */
        submitFeedback: function(contractAccountNumber,cancellationDetail) {
            return http({
                method: 'POST',
                url: '/accountUpdate/' + contractAccountNumber + '/submitPaperlessFeedback.json',
                data: cancellationDetail
            });
        },
        /**
         * Note this method only used for paperless-signup
         * @param contractAccountNumber
         * @returns
         */
        getPaperlessBillSetting: function(contractAccountNumber) {
            return http({
                method: 'POST',
                url: '/account/' + contractAccountNumber + '/getPaperlessBillSetting.json'
            });
        }
    };

    return PaperlessServer;
}]);
