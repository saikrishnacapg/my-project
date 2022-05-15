angular.module('myaccount.wizard').controller('PaperlessController', ['$scope', '$state', '$timeout', 'account', 'Busy', 'MyDetailsServer', 'PaperlessCancellationReasons', 'PaperlessServer', 'Wizards', 'accountList', 'skipsignup', 'internationalAreas','Utils',
    function($scope, $state, $timeout, account, Busy, MyDetailsServer, PaperlessCancellationReasons, PaperlessServer, Wizards, accountList, skipsignup, internationalAreas,Utils) {
        var self = this;
        this.account = account;
        this.accountList = accountList;
        this.rebsAutoRefundActive = !_.isEmpty(account.rebsRefund.bsbNumber);
        this.emailAddress = angular.copy(this.account.paperlessBillSetting.emailAddress || this.account.businessPartnerDetails.emailAddress);
        this.isBpay = this.account.paperlessBillSetting.isBPay;

        this.skipsignup = skipsignup;

        this.showSMSMobileNumber = true;
        this.paperlessType = undefined;
		  this.oldPaperLessType = undefined;
        if(this.account.paperlessBillSetting.isPaperless)
        {
            this.paperlessType = this.account.paperlessBillSetting.isSMSActive? 'ES':'E';
			this.oldPaperLessType = this.paperlessType;
        }
        else
        {
            this.paperlessType = 'P';
			this.oldPaperLessType = this.paperlessType;
        }
        this.LifestyleOrSolar=undefined;
        this.productName=undefined;
        if(this.account.productDetails && this.account.productDetails.energyProductLabel) {
            if (this.account.productDetails.tariffType==='SLR' || this.account.productDetails.tariffType==='LFS') {
                this.LifestyleOrSolar = true;
                this.productName = this.account.productDetails.energyProductLabel;
            }
        }

        this.sendSMSMobileNumber = angular.copy(this.account.paperlessBillSetting.mobileTelephone || this.account.businessPartnerDetails.mobileTelephone);//;//undefined;
        this.mobileTelephoneCountry = angular.copy(this.account.paperlessBillSetting.mobileTelephoneCountry || this.account.businessPartnerDetails.mobileTelephoneCountry);//'AU';
        this.internationalAreas = internationalAreas;
        this.termsAccepted = undefined;
        this.updateMultipleAccounts = false;

        this.reasons = angular.copy(PaperlessCancellationReasons);

        this.cancellationDetail = {
            reasons: undefined,
            customerComment: undefined,
            contact: undefined,
            contactDetail: angular.copy(this.emailAddress),
            contactName: this.account.businessPartnerDetails.firstName + " " + this.account.businessPartnerDetails.lastName + " " + this.account.businessPartnerDetails.companyName
        };

        this.cancellationReasonRequired = function() {
            return _.chain(this.reasons)
                    .flatten()
                    .find(function(reason) {
                        return reason.checked && reason.needMoreInfo;
                    })
                    .value();
        };

        this.cancellationReasons = function() {
            return _.chain(this.reasons)
                    .flatten()
                    .filter(function(reason){
                        return reason.checked;
                    })
                    .pluck('name').value();
        };

        this.isPaperless = function() {
            return this.account.paperlessBillSetting.isPaperless === true;
        };

        this.isEconnect = function() {
            return this.account.paymentInfo.directDebitExists === true;
        };

        this.cancelPaperless = function() {
            return Busy.doing('next', PaperlessServer.cancelPaperlessBilling(this.account.contractAccountNumber, this.cancellationDetail)).then(function(wasSuccessful) {
                if (wasSuccessful) {
                    Utils.setGoal('Goal_Paperless_Opt_Out');
                }
            });;
        };

        this.submitFeedback = function() {
            this.cancellationDetail.reasons = this.cancellationReasons();
            return Busy.doing('next', PaperlessServer.submitFeedback(this.account.contractAccountNumber, this.cancellationDetail));
        };

        this.setPaperlessBilling = function() {
            var accountsToUpdate = null;
            if(this.updateMultipleAccounts)
            {
                //may be at this stage, you would want to take this array and _.collect or _.map it to array of Objects{vkont:<<canumber>>}
                accountsToUpdate = _.map(this.accountList, 'contractAccountNumber');
            }
            if(this.paperlessType == 'ES') {
                return Busy.doing('next', PaperlessServer.setPaperlessBilling(this.account.contractAccountNumber, this.emailAddress, this.sendSMSMobileNumber, this.mobileTelephoneCountry, accountsToUpdate)).then(function(){
                    if(this.sendSMSMobileNumber)
                        Utils.setGoal('Goal_SMS_Opt_In');
                    if(this.emailAddress)
                        Utils.setGoal('Goal_Paperless_Opt_In');
                });
            }
            else
            {
                return Busy.doing('next', PaperlessServer.setPaperlessBilling(this.account.contractAccountNumber, this.emailAddress, null, null, accountsToUpdate)).then(function(){
                    if(this.sendSMSMobileNumber)
                        Utils.setGoal('Goal_SMS_Opt_In');
                    if(this.emailAddress)
                        Utils.setGoal('Goal_Paperless_Opt_In');
                });
            }
        };

        function accountLink(fnWizard) {
            return function() {
                fnWizard(self.account.contractAccountNumber);
            };
        }
        this.updateDetails = function() {
            Wizards.close();
            $timeout(accountLink(Wizards.openMyDetailsEdit));
        };

        this.goMyAccount = function() {
            $state.go('user.home');
        };

        this.renewableRefundActive = function() {
            return !_.isEmpty(this.account.rebsRefund.bsbNumber);
        };

    }
]);

angular.module('myaccount.wizard').value('PaperlessCancellationReasons', [
    { id: 1, name:'Fear of forgetting to pay', needMoreInfo: false, checked: false},
    { id: 2, name:'Security concern', needMoreInfo: false, checked: false},
    { id: 3, name:'Privacy concern', needMoreInfo: false, checked: false},
    { id: 4, name:'Record keeping purposes', needMoreInfo: false, checked: false},
    { id: 5, name:'Serves no benefit to me', needMoreInfo: false, checked: false},
    { id: 6, name:'Lack of internet access', needMoreInfo: false, checked: false},
    { id: 7, name:'Others', needMoreInfo: true, checked: false}
]);