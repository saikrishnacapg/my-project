/*
 * Use these these dependency for Jest unit test.
 * So we will remove that dependency when we make the build for local and servers.
 * */

//RemoveIf(removeDevCode)
  var moment = require('moment');
//EndRemoveIf(removeDevCode)


angular.module('myaccount.utils').factory('AccountUtils', function (Session) {
    var BUSINESS = 'BUS',
        RESIDENTIAL = 'RESD',
        SMALL_TO_MEDIUM = 'SME',
        INDUSTRY_AND_CORPS = 'I&C',
        RESI_CONTACT_NUMBER = '13 13 53',
        BUSINESS_CONTACT_NUMBER = '13 13 54';
    // Values coming from PI
    var PI_RESIDENTIAL = '1';
    var USAGE_CUTOFF = moment('2009-09-01Z', 'YYYY-MM-DDZ');

    return {
        isDefined: function (account) {
            return (
                !_.isEmpty(account) && angular.isDefined(account) && angular.isDefined(account.contractAccountNumber)
            );
        },
        getAccountContactDetails: function (account) {
            if (!this.isDefined(account)) {
                return undefined;
            }
            return {
                firstName: account.businessPartnerDetails.firstName, //Session.user.firstName,
                lastName: account.businessPartnerDetails.lastName, //Session.user.lastName,
                companyName: account.businessPartnerDetails.companyName,
                emailAddress: account.businessPartnerDetails.emailAddress,
                telephoneNumberCountry: account.businessPartnerDetails.telephoneNumberCountry,
                telephoneNumber: account.businessPartnerDetails.telephoneNumber,
                mobileTelephoneCountry: account.businessPartnerDetails.mobileTelephoneCountry,
                mobileTelephone: account.businessPartnerDetails.mobileTelephone,
                mailingAddress: account.businessPartnerDetails.mailingAddress
            };
        },
        getContactNumber: function (account) {
            return this.isDefined(account)?
            (this.isResidential(account) ? RESI_CONTACT_NUMBER : BUSINESS_CONTACT_NUMBER) :
            RESI_CONTACT_NUMBER;
        },
        /**
         * A wrapper method that divides customers into business and residential/
         * SME and I&C are mapped to BUS.
         *
         * This is needed for front-end interfaces which only cater for these options.
         *
         * @param account
         * @returns {*}
         */
        simpleCustomerType: function (account) {
            if (!angular.isDefined(account)) {
                return undefined;
            }
            return account.contractAccountType === RESIDENTIAL ? RESIDENTIAL : BUSINESS;
        },
        isBusiness: function (account) {
            if (!angular.isDefined(account)) {
                return undefined;
            } else if (angular.isString(account)) {
                return account === SMALL_TO_MEDIUM || account === INDUSTRY_AND_CORPS || account === BUSINESS;
            }
            return (
                account.contractAccountType === SMALL_TO_MEDIUM || account.contractAccountType === INDUSTRY_AND_CORPS
            );
        },
        isIAndC: function (account) {
            if (!angular.isDefined(account)) {
                return undefined;
            } else if (angular.isString(account)) {
                return account === INDUSTRY_AND_CORPS;
            }
            return account.contractAccountType === INDUSTRY_AND_CORPS;
        },
        isResidential: function (account) {
            if (!angular.isDefined(account)) {
                return undefined;
            } else if (angular.isString(account)) {
                return account === RESIDENTIAL || account == PI_RESIDENTIAL;
            }
            return account.contractAccountType === RESIDENTIAL;
        },
        simpleBusinessName: function () {
            return BUSINESS;
        },
        residential: function () {
            return RESIDENTIAL;
        },
        encode: function (input) {
            return btoa(input);
        },
        decode: function (input) {
            return atob(input);
        },
        usageCutoff: USAGE_CUTOFF
    };
});
