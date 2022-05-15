angular.module('myaccount.wizard').factory('RenewableRefundModel', function () {

    /**
     * Constructor
     */
    function RenewableRefundModel(rebsData, account, defaultSupplyAddress, defaultMeter, internationalCodes) {
        this.account = account;

        this.defaultSupplyAddress = defaultSupplyAddress;
        this.defaultMeter = defaultMeter;
        this.collective = account.collective;

        this.contractAccountNumber = rebsData.contractAccountNumber;
        this.supplyAddresses = rebsData.supplyAddressDataList || [];
        this.internalUser = rebsData.internalUser;
        this.idType = rebsData.businessPartnerDetails.type;

        this.directDebit = account.paymentInfo.directDebitExists;
        this.paperlessBilling = account.paperlessBillSetting.isPaperless === true;

        this.showSMSMobileNumber = true;
        this.sendSMSMobileNumber = angular.copy(account.paperlessBillSetting.mobileTelephone || account.businessPartnerDetails.mobileTelephone);//undefined;
        this.mobileTelephoneCountry = angular.copy(account.paperlessBillSetting.mobileTelephoneCountry || account.businessPartnerDetails.mobileTelephoneCountry);//'AU';
        this.internationalAreas = internationalCodes;

        this.paperlessBillingUpdated = false;

        this.customer = {
            firstName: this.isPerson() ? rebsData.businessPartnerDetails.firstName : undefined,
            lastName: this.isPerson() ? rebsData.businessPartnerDetails.lastName : undefined,
            companyName: !this.isPerson() ? rebsData.businessPartnerDetails.companyName : undefined,
            emailAddress: rebsData ? rebsData.businessPartnerDetails.emailAddress : undefined,
            contactPhoneNumber: rebsData ? (rebsData.businessPartnerDetails.mobileTelephone || rebsData.businessPartnerDetails.telephoneNumber) : undefined,
            type: this.isPerson() ? "Residential" : undefined
        };

        this.bankDetails = {
            bsbNumber: _.safeAccess(account.rebsRefund, 'bsbNumber') || _.safeAccess(account.paymentInfo, "directDebitDetails.bsbNumber"),
            accountNumber: _.safeAccess(account.rebsRefund, 'accountNumber') || _.safeAccess(account.paymentInfo, 'directDebitDetails.accountNumber'),
            accountName: _.safeAccess(account.rebsRefund, 'accountName') || _.safeAccess(account.paymentInfo, 'directDebitDetails.accountName')
        };

        this.termsAccepted = undefined;

        this.personalDetailsExcludeFields = {
            company: this.isPerson(),
            dateOfBirth: true,
            emailAddress: true,
            emailAddressConfirm: true,
            furtherInfo: true,
            mailingAddress:true,
            name: !this.isPerson(),
            phone: true,
            warning: true
        };
        this.personalDetailsReadOnlyFields = {
            contractAccountNumber: true,
            firstName: true,
            lastName: true,
            companyName: true
        };
    }

    /**
     * Public method, assigned to prototype
     */

    RenewableRefundModel.prototype.isPerson = function () {
        return this.idType === 'Person';
    };
    RenewableRefundModel.prototype.isPending = function() {
        return _.safeAccess(this.meter.address, 'hasPendingApplication');
    };
    RenewableRefundModel.prototype.isApproved = function() {
        var biDirectionals = _.where(_.safeAccess(this.meter.address, 'masterMeterDataList'), {'biDirectional': true}) ;
        return !_.isEmpty(biDirectionals);
    };
    RenewableRefundModel.prototype.isNewApplication = function() {
        return this.applicationType === 'new';
    };
    RenewableRefundModel.prototype.isRebs = function() {
        return this.customer.type !== "Business" &&
            this.system.totalInverterCapacity <= 5;
    };
    RenewableRefundModel.prototype.termsAccepted = function() {
        return this.termsAccepted;
    };
    RenewableRefundModel.prototype.validForRebs = function() {
        return !_.isEmpty(this.meter.address);
    };

    /**
     * Private property
     */
    //var customerTypes = ["Residential", "Educational Institution", "Non-profit organisation", "Business"];

    /**
     * Private function
     */
    function checkCustomerType(type) {
        return customerTypes.indexOf(type) !== -1;
    }

    /**
     * Static property
     * Using copy to prevent modifications to private property
     */
    //RenewableRefundModel.customerTypes = angular.copy(customerTypes);

    /**
     * Static method, assigned to class
     * Instance ('this') is not available in static context
     */
    RenewableRefundModel.build = function (rebsData, account, internationalCodes) {
        if (_.isEmpty(rebsData)) { return; }

        if(!_.isEmpty(internationalCodes)){
            internationalCodes.unshift({countrycode: '', countryname: "-- Select code --"});
        };

        var defaultSA = rebsData.supplyAddressDataList.length > 1 ? undefined : rebsData.supplyAddressDataList[0];
        var meters = _.safeAccess(defaultSA, 'masterMeterDataList') || [];
        var defaultMeter = meters.length > 1 ? undefined : meters[0];
        return new RenewableRefundModel(
            rebsData,
            account,
            defaultSA,
            defaultMeter,
            internationalCodes
        );
    };

    /**
     * Return the constructor function
     */
    return RenewableRefundModel;
});