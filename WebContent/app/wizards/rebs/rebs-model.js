angular.module('myaccount.wizard').factory('RebsModel', function () {

    /**
     * Constructor
     */
    function RebsModel(rebsData, defaultSupplyAddress, defaultMeter, buyBackSchemeCode) {
        this.contractAccountNumber = rebsData.contractAccountNumber;
        this.supplyAddresses = rebsData.supplyAddressDataList || [];
        this.billDispatchSettings = rebsData.billDispatchSettings;

        //Tariff code starts
        this.tariffType= rebsData.tariffType;
        //Tariff code
        this.internalUser = rebsData.internalUser;
        this.idType = rebsData.businessPartnerDetails.type;
        this.customer = {
            firstName: this.isPerson() ? rebsData.businessPartnerDetails.firstName : undefined,
            lastName: this.isPerson() ? rebsData.businessPartnerDetails.lastName : undefined,
            companyName: !this.isPerson() ? rebsData.businessPartnerDetails.companyName : undefined,
            emailAddress: this.getQueryParameters() ? "" : rebsData ? rebsData.businessPartnerDetails.emailAddress : undefined,
            contactPhoneNumber: rebsData ? rebsData.businessPartnerDetails.mobileTelephone || rebsData.businessPartnerDetails.telephoneNumber : undefined,
            type: this.isPerson() ? "Residential" : undefined
        };
        this.meter = {
            address: defaultSupplyAddress,
            details: defaultMeter,
            underConstruction: undefined
        };
        this.installer = {
            // Use empty string for more accurate comparison. Deleted field value will be reset
            // To empty string rather than undefined and we'll end up with a mismatch.
            emailAddress: "",
            emailAddressConfirm: ""
        };
        this.meterAccess = {
            title: undefined,
            firstName: undefined,
            lastName: undefined,
            contactPhoneNumber: undefined
        };
        this.system = {
            totalGenerationSize: undefined,
            totalInverterCapacity: undefined,
			resIsthisInverternew: false,
			dpvmCompatible:undefined
        };

        this.applicationType = this.isPending() ? undefined : this.isApproved() ? 'change' : 'new';
        this.thirdPartyConsent = undefined;
        this.reconfigurationConsent = undefined;
        this.intervalMeterConcent = undefined;
        this.exchangeConsent = undefined;
        this.exchangeAndReconfigConsent = undefined;
        this.rebsConsent = undefined;
        this.debsConsent = undefined;
        this.nonRebsConsent = undefined;
        this.synergyTermsAccepted = undefined;
        this.gstRelevant = undefined;

        this.personalDetailsExcludeFields = {
            company: this.isPerson(),
            dateOfBirth: true,
            emailAddress: true,
            emailAddressConfirm: true,
            furtherInfo: true,
            mailingAddress: true,
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
        this.installerExcludeFields = {
            company: true,
            dateOfBirth: true,
            mailingAddress: true,
            furtherInfo: true,
            name: true,
            phone: true
        };
        this.meterAccessExcludeFields = {
            company: true,
            dateOfBirth: true,
            emailAddress: true,
            emailAddressConfirm: true,
            furtherInfo: true,
            mailingAddress: true,
            phone: true
        };
        this.buyBackSchemeCode=buyBackSchemeCode;
        this.isPodFutureCommunitiesPlan = undefined;
        this.constAPPLIEDFlag = "APPLIED";
        this.constEligibleFlag = "ELIGIBLE";
        this.constENABLEDFlag = "ENABLED";
		this.dvpmTermsAccepted=false;
		this.dvpmAcceptanceAPI=false;
		this.dvpmAcceptanceLIM=false;
    }

    /**
     * Public method, assigned to prototype
     */
    RebsModel.prototype.recentApproval = function () {
        var approvalDate = _.safeAccess(this.meter.address, 'applicationStatus.applicationApproval');
        if (_.isEmpty(approvalDate)) {
            return false;
        }

        return moment(approvalDate).isAfter(moment().subtract(2, 'weeks'));
    };


    RebsModel.prototype.isPerson = function () {
        return this.idType === 'Person';
    };
    RebsModel.prototype.applicationStatus = function() {
        return _.safeAccess(this.meter.address, 'applicationStatus.applicationStage');
    };
    RebsModel.prototype.isPending = function() {
        return _.safeAccess(this.meter.address, 'hasPendingApplication');
    };
    RebsModel.prototype.isApproved = function() {
        var biDirectionals = _.where(_.safeAccess(this.meter.address, 'masterMeterDataList'), {'biDirectional': true}) ;
        return !_.isEmpty(biDirectionals);
    };
    RebsModel.prototype.showNewApplication = function() {
        return !this.isPending() && !this.isApproved();
    };
    RebsModel.prototype.hasMeters = function() {
        return !_.isEmpty(_.safeAccess(this.meter.address, 'masterMeterDataList'));
    };
    RebsModel.prototype.getApplicationReferenceNumber = function() {
        return _.safeAccess(this.meter.address, 'applicationStatus.applicationReference');
    };

    RebsModel.prototype.validSystemSize = function() {
        return inSystemSizeRange(this.system.totalInverterCapacity) &&
            inSystemSizeRange(this.system.totalGenerationSize);
    };
    RebsModel.prototype.thirdPartyConsentRequired = function() {
        return !_.isEmpty(this.installer.emailAddress);
    };
    RebsModel.prototype.isNewApplication = function() {
        return this.applicationType === 'new';
    };
    RebsModel.prototype.applicationIsForNew = function() {
        return _.safeAccess(this.meter.address, 'applicationStatus.applicationType') !== applicationTypes.ChangeOfSystemSize;
    };

    RebsModel.prototype.exchangeRequired = function() {
        if (this.intervalExchangeRequired()){
            return false;
        }
        return _.safeAccess(this.meter.details, 'debsMeterExchangeRequired');
    };

    RebsModel.prototype.reconfigurationRequired = function() {
        if (this.intervalExchangeRequired() || this.exchangeRequired() ){
            return false;
        }
        return _.safeAccess(this.meter.details, 'debsMeterReConfigRequired');
    };

    RebsModel.prototype.intervalExchangeRequired = function() {
        return _.safeAccess(this.meter.details, 'debsMeterIntervalExchangeRequired');
    };

    RebsModel.prototype.intervalReconfigurationRequired = function() {
        if (this.intervalExchangeRequired() || this.exchangeRequired() || this.reconfigurationRequired()){
            return false;
        }
        return _.safeAccess(this.meter.details, 'debsMeterIntervalReconfigRequired');
    };

    RebsModel.prototype.meterUpgradeRequired = function() {
        if (this.exchangeRequired() || this.reconfigurationRequired() || this.intervalExchangeRequired() || this.intervalReconfigurationRequired()) {
            return true;
        }
        return false;
    };

    RebsModel.prototype.meterFeeApplicable = function() {
        if(this.meterUpgradeRequired())
        {
            if (this.isNewApplication())
                return true;
            else if (this.switchedRebstoDebs() || this.switchedNonDebstoDebs())
                return true;
            else
                return false;
        }
        return false;
    };

    RebsModel.prototype.phase = function() {
        return _.safeAccess(this.meter.details, 'phase');
    };

    RebsModel.prototype.exchangeAndReconfigRequired = function() {
        return _.isEmpty(this.meter.details);
    };

    RebsModel.prototype.pricingAccepted = function() {
        if (this.intervalExchangeRequired() && !this.intervalMeterConcent) {
            return false;
        }
        if (this.exchangeRequired() && !this.exchangeConsent) {
            return false;
        }
        if ((this.reconfigurationRequired() || this.intervalReconfigurationRequired()) && !this.reconfigurationConsent) {
            return false;
        }
        if (this.exchangeAndReconfigRequired() && !this.exchangeAndReconfigConsent) {
            return false;
        }
        return true;
    };
    RebsModel.prototype.meterAccessRequired = function() {
        return _.safeAccess(this.meter.address, 'registeredForLifeSupport');
    };

    RebsModel.prototype.isTempSupply = function() {
        return _.safeAccess(this.meter.details, 'tempSupply');
    };
    RebsModel.prototype.isRebs = function() {
        if (this.customer.type === "Residential" && !( this.tariffType === "EVC" ||this.tariffType === "RES1" || this.tariffType === "A1" || this.tariffType === "SM1" || this.tariffType === "PS1")){
            return false;
        }
        return this.customer.type !== "Business" && this.system.totalInverterCapacity <= InverterSizeValidation.MaxValue ;
    };

    RebsModel.prototype.isDebs = function() {
        if (this.customer.type === "Residential" && !( this.tariffType === "EVC" ||this.tariffType === "RES1" || this.tariffType === "A1" || this.tariffType === "SM1" || this.tariffType === "PS1")){
            return false;
        }
        return this.customer.type !== "Business" && this.system.totalInverterCapacity <= InverterSizeValidation.MaxValue ;
    };

    RebsModel.prototype.isRemainRebs = function() {
        if (this.isRebsEnabled() && !this.isNewApplication() && !this.isSystemCapacityIncreased()) {
            return true;
        }
        return false;
    };

    RebsModel.prototype.isSystemCapacityIncreased = function() {
        if (this.system.totalInverterCapacity > this.meter.address.inverterCapacity) {
            return true;
        }
        return false;
    }

    RebsModel.prototype.termsAccepted = function() {
        var applicationTerms = false;
        if (this.isRebs() || this.isDebs()) {
            applicationTerms= this.isRemainRebs()? this.rebsConsent : this.debsConsent
        } else {
            applicationTerms= this.nonRebsConsent;
        }
        return this.synergyTermsAccepted && applicationTerms;
    };

    RebsModel.prototype.validForRebs = function() {
        return !_.isEmpty(this.meter.address) && !this.isTempSupply();
    };

    RebsModel.prototype.getQueryParameters = function() {
        var url = window.location.href.split('?emailAddress=')
        if (url[1]!==undefined){
            var emailAddress = url[1].split('&')
            emailAddress = emailAddress[0].split('*%2F$').join('@').split('!3D$').join('.')
            return emailAddress
        }
        return false

    };
    RebsModel.prototype.isRebsEnabled = function() {
        return _.safeAccess(this.meter.address, 'installationRebsEnabled');
    };
    RebsModel.prototype.isDebsEnabled = function() {
        return _.safeAccess(this.meter.address, 'installationDebsEnabled');
    };
    RebsModel.prototype.isFitEnabled = function() {
        return _.safeAccess(this.meter.address, 'installationFitEnabled');
    };

    RebsModel.prototype.getDistributedEnergyType = function(){
        var distributedEnergyType;
        if (this.isRebs() || this.isDebs()) {
            distributedEnergyType = this.isRemainRebs()? this.buyBackSchemeCode.REBS : this.buyBackSchemeCode.DEBS;
        } else {
            distributedEnergyType= this.buyBackSchemeCode.NON_REBS_DEBS;
        }
        return distributedEnergyType;
    }

    RebsModel.prototype.switchedRebstoDebs = function() {
        if (this.isRebsEnabled() && this.getDistributedEnergyType() === this.buyBackSchemeCode.DEBS){
            return true;
        }
        return false;
    }
    RebsModel.prototype.switchedNonDebstoDebs = function() {
        if(this.isDebs() && this.meter.address.inverterCapacity > InverterSizeValidation.MaxValue) return true;
        else return false;
    }
    //Changes for get FCP flags
    RebsModel.prototype.isFCPEligibleFlag = function () {
        return this.isPodFutureCommunitiesPlan === this.constEligibleFlag;
    }

    RebsModel.prototype.isFCPEnableFlag = function () {
        return this.isPodFutureCommunitiesPlan === this.constENABLEDFlag;
    }

    RebsModel.prototype.isFCPAppliedFlag = function () {
        return this.isPodFutureCommunitiesPlan === this.constAPPLIEDFlag;
    }
     //End FCP Flag changes

	RebsModel.prototype.setDVPMOptions = function() {
		if(this.isDebs()) {
			this.dvpmAcceptanceAPI = true;
			this.dvpmAcceptanceLIM = false;
		}
		else {
			this.dvpmAcceptanceAPI = false;
			this.dvpmAcceptanceLIM = true;
		}
	}

    /**
     * Private property
     */
    var applicationTypes = { NewConnection: "NC", NewInstallation: "NC", ChangeOfSystemSize: "CS"};
    var customerTypes = ["Residential", "Educational Institution", "Non-profit organisation", "Business"];
    var buyBackSchemeCode = { REBS: 'R', DEBS: 'D', NON_REBS_DEBS: 'N'};
    var InverterSizeValidation = { MinValue:0.5, MaxValue:5};
    /**
     * Private function
     */
    function checkCustomerType(type) {
        return customerTypes.indexOf(type) !== -1;
    }

    function inSystemSizeRange(float) {
        var size = parseFloat(float);
        return size >= 0.5;
    }


    /**
     * Static property
     * Using copy to prevent modifications to private property
     */
    RebsModel.customerTypes = angular.copy(customerTypes);
    RebsModel.applicationTypes = angular.copy(applicationTypes);

    /**
     * Static method, assigned to class
     * Instance ('this') is not available in static context
     */
    RebsModel.build = function (rebsData) {
        if (_.isEmpty(rebsData)) {
            return;
        }

        var defaultSA = rebsData.supplyAddressDataList.length > 1 ? undefined : rebsData.supplyAddressDataList[0];
        var meters = _.safeAccess(defaultSA, 'masterMeterDataList') || [];
        var defaultMeter = meters.length > 1 ? undefined : meters[0];
        return new RebsModel(
            rebsData,
            defaultSA,
            defaultMeter,
            buyBackSchemeCode
        );
    };

    /**
     * Return the constructor function
     */
    return RebsModel;
});
