angular.module("myaccount.route").constant("promiseToPayCodes", {
    category: {
        SINGLE_INSTALMENT: "01"
    },
    reason: {
        SYNERGY_ENGAGE: "11"
    }
});

angular.module("myaccount.route").config(function ($stateProvider) {
    $stateProvider.state("user.account.dashboard", {
        url: "dashboard",
        templateUrl: "app/routes/user/account/dashboard/dashboard.html"
    });
});

angular
    .module("myaccount.route")
    .controller("DashboardBalanceCtrl", function (
        $scope,
        AccountBillServer,
        Modals,
        $filter,
        promiseToPayCodes,
        $state,
        Utils
    ) {
        this.currentAccount = $scope.accountCtrl.currentAccount;
        this.contractAccountNumber = this.currentAccount.contractAccountNumber;
        this.paymentInfo = this.currentAccount.paymentInfo;
        this.getLatestBill = function () {
            var latest = _.where(this.currentAccount.billHistory.records, { isBill: true, isNew: true });
            // Hack for dev data
            if (angular.isArray(latest)) {
                var sorted = _.sortBy(latest, "postingDate");
                latest = sorted[sorted.length - 1];
            }

            return latest;
        };

        this.caseManagedCustomer = $scope.accountCtrl.isCaseManagedCustomer();
        this.latestBill = this.getLatestBill();
        this.isPayable = this.currentAccount.paymentInfo.accountBalance > 0;
        this.accountBalanceSummary = this.currentAccount.accountBalanceSummary;
        var ab = this.accountBalanceSummary.accountBalance;
        this.paymentArrangments =
            ab.amount !== "$0.00" && this.accountBalanceSummary.additionalText.indexOf("Payment Arrangement included") >= 0;
        this.currentDate = $filter("date")(new Date(), "yyyy-MM-dd");
        this.latestBillLink = function () {
            return AccountBillServer.billLink(this.contractAccountNumber, this.latestBill, "PDF");
        };
        var self = this;
        this.nextScheduleMeterReading = function () {
            AccountBillServer.getNextScheduleMeterReading(this.contractAccountNumber).then(function (result) {
                if (!Utils.isEmptyString(result.estimatedBillDate)) {
                    if (result.meterReading === "Next Scheduled Meter Reading") {
                        self.ShowFinalMeterReading = false;
                        self.showMeterReading = true;
                        self.ScheduleMeterReading = result.estimatedBillDate;
                    } else if (result.meterReading === "Final Meter Reading") {
                        self.ShowFinalMeterReading = true;
                        self.showMeterReading = false;
                        self.ScheduleMeterReading = result.estimatedBillDate;
                    } else {
                        self.ShowFinalMeterReading = false;
                        self.showMeterReading = false;
                        self.ScheduleMeterReading = "";
                    }
                } else {
                    self.showMeterReading = false;
                    self.ShowFinalMeterReading = false;
                    self.ScheduleMeterReading = "";
                }
            });
        };
        self.promiseToPayType = "arrangement";
        self.arrangementButtonText = "arrangement";
        self.instalmentLabel = "instalment";
        self.isSynergyEngage = false;
        self.hasOpenEngageP2P = false;
        this.getPaymentArrangementPromisedDetails = function () {
            if (this.caseManagedCustomer) {
                return;
            }
            AccountBillServer.getPaymentArrangementDetails(this.contractAccountNumber).then(function (result) {
                const { hasP2PInstalment, p2p_type, p2p_header, isSinglePayment } = result;
                self.showViewArrangementbtn = hasP2PInstalment && p2p_type === "payarr";
                if (p2p_header.reason === promiseToPayCodes.reason.SYNERGY_ENGAGE && Utils.isEmptyString(p2p_header.status)) {
                    self.showViewArrangementbtn = true;
                    self.hasOpenEngageP2P = true;
                }
                self.withdrawnP2P = self.showViewArrangementbtn && !Utils.isEmptyString(p2p_header.status);
                self.showViewArrangementDetails = self.showViewArrangementbtn ? p2p_header : undefined;
                if (
                    angular.isDefined(self.showViewArrangementDetails) &&
                    self.showViewArrangementDetails.reason === promiseToPayCodes.reason.SYNERGY_ENGAGE
                ) {
                    self.promiseToPayType = "plan";
                    self.arrangementButtonText = "payment plan";
                    self.instalmentLabel = "payment";
                    self.isSynergyEngage = true;
                }
                self.isSinglePayment = isSinglePayment;
            });
        };
        this.nextScheduleMeterReading();
        this.getPaymentArrangementPromisedDetails();
        this.showAccountSummaryInfo = function () {
            Modals.showAlert("Account Summary", `<p>${$rootScope.messages.MA_H6}</p>`);
        };
        this.showNextScheduledDateInfo = function () {
            Modals.showAlert("Next scheduled billing date", `<p>${$rootScope.messages.MA_H34}</p>`);
        }
        this.showNextScheduledReadinginfo = function () {
            Modals.showAlert("Next scheduled meter reading", `<p>${$rootScope.messages.MA_H35}</p>`);
        }
        this.t2cCustomer = $scope.accountCtrl.IsT2cCustomer();
        if (this.t2cCustomer) {
            $state.go("user.account.dashboard.t2c");
        }
        if ($scope.accountCtrl.isCaseManagedCustomer()) {
            $state.go("user.account.dashboard.synergyassist");
        }
    });

angular.module("myaccount.route").controller("DashboardUsageCtrl", function ($scope, Modals) {
    var currentAccount = $scope.accountCtrl.currentAccount;

    // Need a way to get this value
    this.isResidential = $scope.accountCtrl.isResidential;
    this.noSummary = _.every(currentAccount.consumptionSummary, it => it === null);

    this.noConsumptionComparison = _.every(currentAccount.consumptionComparison, it => it === null);
    this.premiseDetails = $scope.accountCtrl.currentAccount.premiseDetails;

    this.showUsageHistoryInfo = function () {
        var text = `<p>${$rootScope.messages.MA_H5}</p>
                <div class='sy-alert--info'>
                <span class='pull-left sy-icon--circle_info'></span>`;

        if (this.premiseDetails.selfRead === null) {
            text += `<strong>Visit the <a href='http://www.westernpower.com.au/metering.html' target='_blank'>Western Power website</a> to find out how to read your meter.</strong></div>`;
        } else {
            text += `<strong>Did you know you can conveniently submit your readings online via the <a href="http://www.westernpower.com.au/metering-self-read-meters.html" target="_blank">Western Power website</a>?</strong></div>`;
        }

        Modals.showAlert("Usage History", text);
    };
    this.amiEnergyToolTip = function () {
        Modals.showAlert("Energy Usage", `<p>${$rootScope.messages.MA_H32}</p>`);
    };
    this.showUsageComparisonInfo = function () {
        Modals.showAlert("Usage Comparison", `<p>${$rootScope.messages.MA_H5}</p><p>${$rootScope.messages.MA_H27}</p>`);
    };
});

angular.module("myaccount.route").controller("DashboardOptionsCtrl", function ($scope, Wizards) {
    this.currentAccount = $scope.accountCtrl.currentAccount;
    this.contractAccountType = this.currentAccount.contractAccountType;
    this.isCollective = $scope.accountCtrl.isCollective();

    this.isResidential = $scope.accountCtrl.isResidential;

    this.allowedGreen = ["RESD", "SME"].indexOf(this.contractAccountType) !== -1 && !this.isCollective;
    this.allowedConcessions = this.isResidential && !this.isCollective;
    this.allowedMoveHouse = this.isResidential || !this.isCollective;

    this.concessions =
        this.allowedConcessions &&
        angular.isDefined(this.currentAccount.concessionDetails.cards) &&
        this.currentAccount.concessionDetails.cards.length > 0;
    this.directDebit =
        this.currentAccount.paymentInfo.directDebitExists || this.currentAccount.paymentInfo.directDebitInstalmentExists;
    this.directDebitP2PExists = this.currentAccount.paymentInfo.directDebitP2PExists;
    this.greenEnergy = this.allowedGreen && this.currentAccount.productDetails.greenFlag;
    this.noOfConcessions = this.allowedConcessions ? this.currentAccount.concessionDetails.cards.length : 0;
    this.paperlessBilling = this.currentAccount.paperlessBillSetting.isPaperless === true;
    this.isBpay = this.currentAccount.paperlessBillSetting.isBPay;
    this.pendingRenewable = this.currentAccount.installationDetails.pendingRebsApplication;
    this.canRenewEnergy = this.currentAccount.installationDetails.canRenewEnergy;
    this.hasRenewableEnergy = this.currentAccount.installationDetails.bidirectionalMeter;
    this.canRefundEnergy = this.currentAccount.rebsRefund.canRefund;
    this.RebsEnabled = this.currentAccount.installationDetails.installationRebsEnabled;
    this.renewableRefundActive = function () {
        return !_.isEmpty(this.currentAccount.rebsRefund.bsbNumber);
    };
    this.onlineSupportLink = function () {
        return this.isResidential ? 'residential.supportlink' : 'business.supportlink';
    };
    this.getConcessionCardTextLabel = function () {
        const cards = this.currentAccount.concessionDetails.cards;
        return cards.every(card => card.active === false) ? 'Expired' : 'Modify';
    };
    this.openMyDetailsEdit = Wizards.openMyDetailsEdit;
});
