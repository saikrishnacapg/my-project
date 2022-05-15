angular.module('myaccount.utils').service('FxmGoals', function (Utils) {
    var self = this;
    this.MyAccountLogInGoal = {
        xBPType: null,
        xCANumber: null,
        xBPName: null,
        xCASupplyAddress: null,
        xCASupplySuburb: null,
        xCAMyAccount: null,
        xCAShippingControl: null,
        xCAPaperlessSms: null,
        xCALastPaymentMethod: null,
        xCARebs: null,
        xCAAutomatedRebs: null,
        xCASellback: null,
        xCALifeSupport: null,
        xCAConcession: null,
        xCABillDue: null,
        xCANextReadDate: null,
        xFirstName: null,
        xLastName: null,
        xEmail: null,
        xLandline: null,
        xMobile: null,
        xBPGuid: null,
        xTitle: null,
        xCAProduct: null,
        xCATariffType: null,
        xCAContractNumber: null,
        xCABillingCycle: null,
        xCAPaymentNumber: null,
        xCADirectDebitExists: null,
        xCADirectDebitInstallmentExists: null,
        xCABpayViewSetup: null,
        xCACurrentBillAmount: null,
        xBPNumber: null,
        xCAIsActive: null
    };

    this.pushLoggedInToMyAccount = function (currentAccount) {

        try {
            self.MyAccountLogInGoal.xBPType = currentAccount.businessPartnerDetails ? currentAccount.businessPartnerDetails.type : null;
            self.MyAccountLogInGoal.xCANumber = currentAccount.contractAccountNumber;
            self.MyAccountLogInGoal.xBPName = currentAccount.businessPartnerDetails ? currentAccount.businessPartnerDetails.type === "Organization" ? currentAccount.businessPartnerDetails.companyName : currentAccount.businessPartnerDetails.firstName + " " + currentAccount.businessPartnerDetails.lastName : null;
            self.MyAccountLogInGoal.xCASupplyAddress = currentAccount.premiseAddress ? currentAccount.premiseAddress.label : null;
            self.MyAccountLogInGoal.xCASupplySuburb = currentAccount.consumptionComparison ? currentAccount.consumptionComparison.suburb.label : null;
            self.MyAccountLogInGoal.xCAMyAccount = "True";
            self.MyAccountLogInGoal.xCAShippingControl = currentAccount.paperlessBillSetting ? currentAccount.paperlessBillSetting.isPaperless : null;
            self.MyAccountLogInGoal.xCAPaperlessSms = currentAccount.paperlessBillSetting ? currentAccount.paperlessBillSetting.isSMSActive : null;
            self.MyAccountLogInGoal.xCALastPaymentMethod = currentAccount.billHistory.records[0] ? currentAccount.billHistory.records.filter(function (el) {
                return el.isPayment === true;
            })[0].billingCode : null;
            self.MyAccountLogInGoal.xCARebs = currentAccount.productDetails ? currentAccount.productDetails.rebs : null;
            self.MyAccountLogInGoal.xCAAutomatedRebs = currentAccount.rebsRefund ? currentAccount.rebsRefund.canRefund : null;
            self.MyAccountLogInGoal.xCASellback = currentAccount.productDetails ? currentAccount.productDetails.sellback : null;
            self.MyAccountLogInGoal.xCALifeSupport = currentAccount.installationDetails ? currentAccount.installationDetails.lifeSupport : null;
            self.MyAccountLogInGoal.xCAConcession = currentAccount.concessionDetails != null ? currentAccount.concessionDetails.cards ? true : false : null;
            self.MyAccountLogInGoal.xCABillDue = currentAccount.paymentInfo ? currentAccount.paymentInfo.lastBillDue : null;
            self.MyAccountLogInGoal.xCANextReadDate = null;
            self.MyAccountLogInGoal.xFirstName = currentAccount.businessPartnerDetails ? currentAccount.businessPartnerDetails.firstName : null;
            self.MyAccountLogInGoal.xLastName = currentAccount.businessPartnerDetails ? currentAccount.businessPartnerDetails.lastName : null;
            self.MyAccountLogInGoal.xEmail = currentAccount.businessPartnerDetails ? currentAccount.businessPartnerDetails.emailAddress : null;
            self.MyAccountLogInGoal.xLandline = currentAccount.businessPartnerDetails ? currentAccount.businessPartnerDetails.telephoneNumber : null;
            self.MyAccountLogInGoal.xMobile = currentAccount.businessPartnerDetails ? currentAccount.businessPartnerDetails.mobileTelephone : null;
            self.MyAccountLogInGoal.xBPGuid = currentAccount.businessPartnerDetails ? currentAccount.businessPartnerDetails.businessPartnerGUID : null;
            self.MyAccountLogInGoal.xTitle = currentAccount.businessPartnerDetails ? currentAccount.businessPartnerDetails.title : null;
            self.MyAccountLogInGoal.xCAProduct = currentAccount.productDetails ? currentAccount.productDetails.energyProductLabel : null;
            self.MyAccountLogInGoal.xCATariffType = currentAccount.productDetails ? currentAccount.productDetails.tariffType : null;
            self.MyAccountLogInGoal.xCAContractNumber = currentAccount.consumptionHistory.records[0] ? currentAccount.consumptionHistory.records[0].contractNumber : null;
            self.MyAccountLogInGoal.xCABillingCycle = currentAccount.paymentInfo ? currentAccount.paymentInfo.billCycle : null;
            self.MyAccountLogInGoal.xCAPaymentNumber = currentAccount.paymentInfo ? currentAccount.paymentInfo.paymentNumber : null;
            self.MyAccountLogInGoal.xCADirectDebitExists = currentAccount.paymentInfo ? currentAccount.paymentInfo.directDebitExists : null;
            self.MyAccountLogInGoal.xCADirectDebitInstallmentExists = currentAccount.paymentInfo ? currentAccount.paymentInfo.directDebitInstalmentExists : null;
            self.MyAccountLogInGoal.xCABpayViewSetup = currentAccount.paperlessBillSetting ? currentAccount.paperlessBillSetting.isBPay : null;
            self.MyAccountLogInGoal.xCACurrentBillAmount = currentAccount.paymentInfo ? currentAccount.paymentInfo.accountBalance : null;
            self.MyAccountLogInGoal.xBPNumber = currentAccount.businessPartnerDetails ? currentAccount.businessPartnerDetails.businessPartner : null;
            self.MyAccountLogInGoal.xCAIsActive = currentAccount.active ? currentAccount.active : false;

            Utils.setGoal('Goal_Log_In_To_Myaccount', self.MyAccountLogInGoal);
        } catch (e) {
            console.log("Error reported in FXM data");
        }
    };
});