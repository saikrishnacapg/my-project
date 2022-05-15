angular.module('myaccount.wizard').factory('ConcessionCardsServer', function($log, http) {

    var ConcessionCardsServer = {
        getConcessionCardTypes: function() {
            return http({
                method: 'GET',
                url: '/resources/concessionCardTypes.json'
            });
        },

        /**
         * validateConcessionCard
         */
        validateConcessionCard: function(contractAccountNumber, cardType, cardNumber) {
            return http({
                method: 'POST',
                url: '/concession/' + contractAccountNumber + '/validateConcessionCard.json',
                data: {
                    cardType: cardType,
                    cardNumber: cardNumber
                }
            });
        },

        /**
         * Add a concession card
         */
        addConcessionCard: function(contractAccountNumber, cardType, cardNumber, firstName, lastName, noOfDependents) {

            var data = {
                cardType: cardType,
                cardNumber: cardNumber,
                firstName: firstName,
                lastName: lastName
            };

            if (noOfDependents)
                data.noOfDependents = noOfDependents;

            return http({
                method: 'POST',
                url: '/concession/' + contractAccountNumber + '/addConcessionCard.json',
                data: data
            });
        },

        /**
         * Add a concession card
         */
        updateNumberOfDependents: function(contractAccountNumber, noOfDependents) {
            return http({
                method: 'POST',
                url: '/concession/' + contractAccountNumber + '/updateNumberOfDependents.json',
                data: {
                    noOfDependents: noOfDependents
                }
            });
        },

        /**
         * Expire a concession card
         */
        expireConcessionCard: function(contractAccountNumber, cardNumber, supplyAddress) {
            var data = {
                cardNumber: cardNumber,
                supplyAddress: supplyAddress
            };
            return http({
                method: 'POST',
                url: '/concession/' + contractAccountNumber + '/expireConcessionCard.json',
                data: data
            });
        },

        /**
         * Reactivate a concession card
         */
        reactivateConcessionCard: function(contractAccountNumber, cardNumber, firstName, lastName, noOfDependents) {

            var data = {
                cardNumber: cardNumber,
                firstName: firstName,
                lastName: lastName
            };

            if (noOfDependents)
                data.noOfDependents = noOfDependents;

            return http({
                method: 'POST',
                url: '/concession/' + contractAccountNumber + '/reactivateConcessionCard.json',
                data: data
            });
        },

        /**
         * Update owner of a concession card
         */
        updateConcessionCardOwner: function(contractAccountNumber, cardNumber, firstName, lastName) {

            var data = {
                cardNumber: cardNumber,
                firstName: firstName,
                lastName: lastName
            };

            return http({
                method: 'POST',
                url: '/concession/' + contractAccountNumber + '/updateConcessionCardOwner.json',
                data: data
            });
        },
        /**
         * Get list of a concession card
         */
        getConcessionDetails: function(contractAccountNumber) {
            var data = {
                contractAccountNumber: contractAccountNumber
            };

            return http({
                method: 'POST',
                url: '/concession/' + contractAccountNumber + '/getConcessionDetails.json',
                data: data
            });
        },
        getAccountDetails: function(contractAccountNumber) {
            return http({
                method: 'POST',
                url: '/moving/' + contractAccountNumber + '/getAccountDetails.json'
            });
        }

    };

    return ConcessionCardsServer;

});