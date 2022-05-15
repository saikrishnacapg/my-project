angular.module('myaccount.route').config(function ($stateProvider) {
    // Resolve an account from the contractAccountNumber route parameter
    var resolveAccount = [
        '$stateParams',
        '$q',
        '$log',
        'Session',
        'user',
        function ($stateParams, $q, $log, Session, user) {
            var contractAccountNumber = Session.contractAccountNumberByIdentifier($stateParams.accountIdentifier);
            if (angular.isDefined(contractAccountNumber)) {
                return Session.getAccount(contractAccountNumber);
            }
            // Reject straight off
            return $q.reject('contractAccountNumber empty');
        }
    ];

    var resolveAccountList = [
        '$stateParams',
        '$log',
        'Session',
        'user',
        function ($stateParams, $log, Session, user) {
            return Session.getAccountList();
        }
    ];

    $stateProvider.state('user.account', {
        abstract: true,
        url: '/account/?accountIdentifier&flow',
        templateUrl: 'app/routes/user/account/account.html', //
        controller: 'AccountCtrl',
        controllerAs: 'accountCtrl',
        resolve: { account: resolveAccount } //
    });
});

angular
    .module('myaccount.route')
    .controller('AccountCtrl', function (
        $document,
        $scope,
        $state,
        $stateParams,
        $timeout,
        $window,
        account,
        accountList,
        Events,
        Utils,
        Session,
        Router,
        Wizards,
        DeviceMode,
        $location,
        $filter,
        AccountBillServer,
        Modals,
        Resources,
        AccountAuthServer,
        FxmGoals,
        PODFCPFlagService,
        AccountUtils
    ) {
        $window.scrollTo(0, 0);
        localStorage.removeItem('businessPartnerDetail');
        localStorage.setItem('businessPartnerDetail', JSON.stringify(account.businessPartnerDetails));
        localStorage.removeItem('setCurrentUserIdentifier');
        localStorage.setItem('setCurrentUserIdentifier', JSON.stringify(account.accountIdentifier));
        if (account.businessPartnerDetails.companyName !== '') {
            $scope.$parent.userCtrl.userDisplayName =
                'Welcome ' + $filter('capitalize')(account.businessPartnerDetails.companyName);
        } else {
            $scope.$parent.userCtrl.userDisplayName =
                'Welcome ' +
                $filter('capitalize')(account.businessPartnerDetails.firstName) +
                ' ' +
                $filter('capitalize')(account.businessPartnerDetails.lastName);
        }

        $document[0].cookie =
            'NPWS.MyAccount=' +
            account.contractAccountType +
            ';expires=' +
            moment().add(2, 'years').toDate() +
            ';domain=.synergy.net.au;path=/';

        var self = this;
        this.accountList = accountList;
        this.currentAccount = account;
        //FCP changes to hide link for FCp flag customers//
        this.hideLinksForFCPFlag = function () {
            Utils.promiseThen(PODFCPFlagService.getPodFCPFlag(this.currentAccount.contractAccountNumber), function (result) {
                PODFCPFlagService.isPodFutureCommunitiesPlan = result;
                self.isPodFCPFlag = PODFCPFlagService.isFCPEligible() && self.isResidential;
            });
        };
        this.hideLinksForFCPFlag();
        //End FCP changes to hide link for FCp flag customers//

        FxmGoals.pushLoggedInToMyAccount(this.currentAccount);
        this.displaySolarFlagEvent = true;
        this.fetchSolarXsellBannerValue = function (name) {
            var gCookieVal = document.cookie.split('; ');
            for (var i = 0; i < gCookieVal.length; i++) {
                // A name/value pair (a crumb) is separated by an equal sign
                var gCrumb = gCookieVal[i].split('=');
                if (name === gCrumb[0]) {
                    var value = '';
                    try {
                        value = angular.fromJson(gCrumb[1]);
                    } catch (e) {
                        value = unescape(gCrumb[1]);
                    }
                    return value;
                }
            }
            // A cookie with the requested name does not exist
            return null;
        };
        this.saveSolarXsellBanner = function (name, values) {
            if (arguments.length === 1) {
                return fetchValue(name);
            }
            var cookie = name + '=';
            var expires = 60;
            cookie += typeof values === 'object' ? angular.toJson(values) + ';' : values + ';';
            var date = new Date();
            date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1000);
            expires = date.toGMTString();
            cookie += !values.session ? 'expires=' + expires + ';' : '';
            // Cookie += 'domain=.synergy.net.au;'//(values.path) ? 'path=' + values.path + ';' : '';
            cookie += values.secure ? 'secure;' : '';
            document.cookie = cookie;
        };
        this.SolarXsellBanner = false;
        this.BusinessSolarXsellBanner = false;
        this.BusinessSolarXbannerNotify = false;
        this.pendingRenewable = this.currentAccount.installationDetails.pendingRebsApplication;
        this.hasRenewableEnergy = this.currentAccount.installationDetails.bidirectionalMeter;
        this.trigggersolarbannerEvent = function () {
            if (
                this.isResidential &&
                this.currentAccount.productDetails.energyProductLabel !== 'Home Business Plan (K1) Tariff' &&
                this.SolarXsellBanner &&
                this.SolarXbannerNotify &&
                !this.collectionsStrategyFlag() &&
                !this.isHardship &&
                this.currentAccount.active &&
                !(this.hasRenewableEnergy && !this.pendingRenewable) &&
                !this.isSolar() &&
                this.displaySolarFlagEvent
            ) {
                self.displaySolarFlagEvent = false;
            }

            if (
                (!this.isResidential ||
                    (this.isResidential &&
                        this.currentAccount.productDetails.energyProductLabel === 'Home Business Plan (K1) Tariff')) &&
                this.BusinessSolarXsellBanner &&
                this.BusinessSolarXbannerNotify &&
                !this.collectionsStrategyFlag() &&
                !this.isHardship &&
                this.currentAccount.active &&
                !(this.hasRenewableEnergy && !this.pendingRenewable) &&
                !this.isSolar() &&
                this.displaySolarFlagEvent
            ) {
                self.displaySolarFlagEvent = false;
            }
            return true;
        };
        this.collectionsStrategyFlag = function () {
            var collectionsStrategy = this.currentAccount.accountBalanceSummary.directDebitbalanceList
                ? this.currentAccount.accountBalanceSummary.directDebitbalanceList
                : false;
            if (!_.isEmpty(collectionsStrategy) && !_.isEmpty(_.where(collectionsStrategy, { text: 'Overdue' }))) {
                return true;
            }
            return false;
        };

        this.SolarXsellBannerNoThanks = this.fetchSolarXsellBannerValue(
            'SolarXsellBannerNoThanks' + self.currentAccount.contractAccountNumber
        );
        //This.SynergyShowSolarXsellBanner= this.fetchSolarXsellBannerValue(self.currentAccount.contractAccountNumber);
        if (this.SolarXsellBannerNoThanks !== null) {
            if (this.SolarXsellBannerNoThanks.search(self.currentAccount.contractAccountNumber) > -1) {
                this.SolarXsellBanner = false;
            }
        } else {
            if (
                this.currentAccount.contractAccountType !== 'RESD' ||
                (this.currentAccount.contractAccountType === 'RESD' &&
                    this.currentAccount.productDetails.energyProductLabel === 'Home Business Plan (K1) Tariff')
            ) {
                this.BusinessSolarXsellBanner = true;
            } else if (this.currentAccount.contractAccountType === 'RESD') {
                this.SolarXsellBanner = true;
            }
        }

        this.getAccountListWebChat = function () {
            var accountListWebChat = [];
            angular.forEach(
                accountList,
                function (value, key) {
                    this.push('\n' + key + ':' + value.contractAccountNumber);
                },
                accountListWebChat
            );
            return accountListWebChat;
        };
        this.getAccountWebChat = function () {
            return account.contractAccountNumber;
        };
        this.currentAccountNumber = account.contractAccountNumber;
        this.contractAccountType = this.currentAccount.contractAccountType;
        this.tabs = {
            dashboard: 'Account',
            usage: 'Usage',
            amiinsight: 'Usage',
            bills: 'Bills',
            interval: 'Interval Data',
            energytoolbox: 'Energy Tool',
            seeandsave: 'See and Save',
            lifestyle: 'Lifstyle Plan',
            solar: 'Solar plan',
            activitystatement: 'Activity statement',
            activitystatementpowerbank: 'Activity statement'
        };
        this.activeTab = undefined;
        this.intervalDataTabResi = [
            {
                tariffType: 'EVC',
                tariffName: 'Synergy EV Home Plan',
                basePeriodLabel: 'Off Peak',
                basePeriodColor: '',
                period2Label: 'Peak',
                period2Color: '',
                period3Label: '',
                period3Color: '',
                period4Label: '',
                period4Color: ''
            }
        ];

        // Mobile menu
        this.isVisible = false;
        this.isTouch = true;

        this.isResidential = this.contractAccountType === 'RESD';
        this.isSME = this.contractAccountType === 'SME';
        this.meterType = this.currentAccount.meterType;
        this.allowedEnergyToolkit = this.isResidential;
        this.partOfSeeAndSave =
            _.isObject(this.currentAccount.seeAndSaveDetails) &&
            _.isObject(this.currentAccount.seeAndSaveDetails.product) &&
            _.contains(['active', 'expired'], this.currentAccount.seeAndSaveDetails.product.status);

        this.isSellbackProduct = _.safeAccess(this.currentAccount, 'productDetails.sellback');

        this.onlineSupportLink = () => self.isResidential ? 'residential.supportlink' : 'business.supportlink';

        this.getActiveTab = function () {
            var localName = $state.current.name.substring('user.account'.length + 1);

            if (localName.indexOf('.') > 0) {
                localName = localName.substring(localName.indexOf('.') + 1);
            }

            return this.tabs[localName];
        };

        this.directDebitButton =
            this.currentAccount.paymentInfo.directDebitExists || this.currentAccount.paymentInfo.directDebitInstalmentExists;
        this.intervalDataResiInfo = function (tariifType) {
            var result = $filter('filter')(this.intervalDataTabResi, {
                tariffType: tariifType ? tariifType : this.currentAccount.productDetails.tariffType
            })[0];
            return result;
        };
        this.showResiIntervalDataTab = function () {
            var result = this.intervalDataResiInfo();
            return result ? true : false;
        };

        this.showEVHomePlanPromo = function () {
            return this.showResiIntervalDataTab();
        };

        /* “Solar customers” = Solar Tariff Trialists (Promo box 1) */
        this.showSolarTarrifTrialPromo = function () {
            return this.isSolar() && this.hasGenerationDevice();
        };

        /*
              Non-Solar customers with generation data are customers who have solar panels, but weren’t on the Solar Tariff trial.
              (Promo Box 2)
      */
        this.showGenerationNoSolarTarrif = function () {
            return !this.isSolar() && this.hasGenerationDevice() && this.isResidential;
        };

        /* Promo box 3 For Non Solar residential customers who have interval generation data but
              do not have a generation product (e.g. REBS, FiT), the My Account promo box shows a message informing customers that they can now view
              their interval consumption data. */
        this.showOnlyIntervalData = function () {
            return (
                !this.isSolar() &&
                !this.hasGenerationDevice() &&
                this.isResidential &&
                !_.isEmpty(this.currentAccount.installationDetails.intervalDevices)
            );
        };

        /*#4 For business customers who have  interval generation data and have a generation product (e.g. REBS, Sellback), the My Account promo box
      shows a message informing customers that they can now view their interval generation data. */
        this.businessCustomersWithGeneration = function () {
            //Return !_.isEmpty(this.currentAccount.installationDetails.intervalDevices); // Changed condition as need to show interval data for Lifestyle/Solar residential customers in different tab
            return !this.isResidential && !_.isEmpty(this.currentAccount.installationDetails.intervalDevices);
        };

        this.hasGenerationDevice = function () {
            var devices = this.currentAccount.installationDetails.intervalDevices;

            /* ** Direction G = Generation , C=Consuption */
            if (!_.isEmpty(devices) && !_.isEmpty(_.where(devices, { direction: 'G' }))) {
                return true;
            }

            return false;
        };

        this.showPromoForGeneration = function () {
            var devices = this.currentAccount.installationDetails.intervalDevices;
            if (!_.isEmpty(devices) && !_.isEmpty(_.where(devices, { direction: 'G', showGeneration: true }))) {
                return true;
            }

            return false;
        };

        this.gotoEVHomePlanTab = function () {
            $state.go('user.account.evhomeplan');
        };
        this.openAccountSelector = function () {
            Router.goDirectlyToHome();
        };

        this.showTab = function (tab) {
            if (self.tabIsActive(tab)) {
                return true;
            }
            return !self.singleTabMode;
        };

        this.showInactiveAccountInfo = function () {
            Modals.showAlert('Inactive Account', '<p>' + $rootScope.messages.MA_H28 + '</p>');
        };

        function updateDeviceType() {
            self.singleTabMode = DeviceMode.type === 'mobile';
        }

        this.hasIntervalDevices = function () {
            // Changed condition as need to show interval data for Lifestyle/Solar residential customers in different tab
            return !this.isResidential && !_.isEmpty(this.currentAccount.installationDetails.intervalDevices);
        };

        /**
         * Non Ami Daily Interval Meter:
         * Meter Type = isInterval
         * Used to identify current daily read interval meters (not on Ami)
         */
        this.hasNonAmiDailyIntervalMeter = function () {
            var meterType = this.meterType;
            if (meterType) {
                var isNonAmiInterval = meterType.isInterval && !meterType.isAmi;
                return isNonAmiInterval;
            }
        };

        this.hasAmiIntervalMeter = function () {
            var meterType = this.meterType;
            if (meterType) {
                var isAmiInterval = meterType.isAmi && meterType.isInterval;
                return isAmiInterval;
            }
        };

        /**
         * Resi Ami Cutomer definition:
         * Meter Type - isAmi + isInterval
         * CA Type - Residential
         * Used to isolate MyAc experience for Resi Ami customers from generic Ami customer
         * */
        this.isResiAmiCustomer = function () {
            var meterTypeIsAmiInterval = this.hasAmiIntervalMeter();
            var caIsResi = this.isResidential;
            var resiAmiCustomer = false;
            if (caIsResi && meterTypeIsAmiInterval) {
                resiAmiCustomer = true;
                return resiAmiCustomer;
            }
            return resiAmiCustomer;
        };

        /**
         * Ami Cutomer definition:
         * Meter Type - isAmi + isInterval
         * CA Type - Residential or SME
         *  */
        this.isAmiCustomer = function () {
            var meterTypeIsAmiInterval = this.hasAmiIntervalMeter();
            var caIsResiOrSME = AccountUtils.isResidential(this.currentAccount); //&& !_.isEmpty(account.installationDetails.intervalDevices) //(this.isResidential); //  || this.isSME
            var amiCustomer = false;
            if (caIsResiOrSME && meterTypeIsAmiInterval) {
                amiCustomer = true;
                return amiCustomer;
            }
            return amiCustomer;
        };

        this.isSolar = function () {
            return this.currentAccount.productDetails.tariffType === 'SLR';
        };
        this.isMidDaySaver = function () {
            return this.currentAccount.productDetails.tariffType === 'RES2';
        };
        this.isLifestyle = function () {
            return this.currentAccount.productDetails.tariffType === 'LFS';
        };
        this.getStateName = function () {
            return $state.current.name;
        };

        this.isCollective = function () {
            return this.currentAccount.collectiveDetails.collectiveAccount;
        };

        //Tariff Type is same for all PB products i.e. 'BSP', therefore additional check is made on ProductName for PB3 only

        this.isPowerBank3 = () => {
            return (
                this.currentAccount.productDetails.tariffType === 'BSP' &&
                (this.currentAccount.productDetails.energyProductLabel === 'PowerBank Saver Plan (6 kWh)' ||
                    this.currentAccount.productDetails.energyProductLabel === 'PowerBank Saver Plan (8 kWh)')
            );
        };

        this.RequestacallForSolar_x_My_Account = function () {
            var redirectURl = ''; //$window.location.host;
            Resources.getDocumentLink('synergy.site').then(function (result) {
                var host = result.data; //AdaptToEnvironment(result.data);
                // Always load resources in a separate window
                var contactno = self.currentAccount.businessPartnerDetails.mobileTelephone
                    ? self.currentAccount.businessPartnerDetails.mobileTelephone
                    : self.currentAccount.businessPartnerDetails.telephoneNumber;
                var premiseAddress_URL = '';
                var suburb_URL = '';
                var postcode_URL = '';
                if (self.currentAccount.premiseAddress !== undefined) {
                    premiseAddress_URL = self.currentAccount.premiseAddress.label;
                    var splitaddress_forURL = self.currentAccount.premiseAddress.label.trim().split(',')[1];
                    for (var i = 0; i < splitaddress_forURL.trim().split(' ').length - 2; i++) {
                        suburb_URL += splitaddress_forURL.trim().split(' ')[i] + ' ';
                    }

                    postcode_URL = splitaddress_forURL.trim().split(' ')[splitaddress_forURL.trim().split(' ').length - 1];
                }
                if (
                    !self.isResidential ||
                    (this.isResidential &&
                        this.currentAccount.productDetails.energyProductLabel === 'Home Business Plan (K1) Tariff')
                ) {
                    //Host +
                    redirectURl =
                        host +
                        '/Sites/commercialsolarmyaccount?utm_id=nat067053382011014&firstname=' +
                        self.currentAccount.businessPartnerDetails.firstName +
                        '&lastname=' +
                        self.currentAccount.businessPartnerDetails.lastName +
                        '&bsname=' +
                        self.currentAccount.businessPartnerDetails.companyName +
                        '&email=' +
                        self.currentAccount.businessPartnerDetails.emailAddress;
                } else {
                    redirectURl =
                        host +
                        '/Sites/solarmyaccount?utm_id=nat067025281010014008&firstname=' +
                        self.currentAccount.businessPartnerDetails.firstName +
                        '&lastname=' +
                        self.currentAccount.businessPartnerDetails.lastName +
                        '&email=' +
                        self.currentAccount.businessPartnerDetails.emailAddress +
                        '&mailingaddress=' +
                        premiseAddress_URL +
                        '&suburb=' +
                        suburb_URL +
                        '&postcode=' +
                        postcode_URL +
                        '&state=WA';
                }
                $window.open(redirectURl, '_blank');
            });

            // Return this.currentAccount.collectiveDetails.collectiveAccount;
        };

        this.ShowBusinesssolarXBanner = function () {
            if (
                (!this.isResidential ||
                    (this.isResidential &&
                        this.currentAccount.productDetails.energyProductLabel === 'Home Business Plan (K1) Tariff')) &&
                this.BusinessSolarXsellBanner &&
                this.BusinessSolarXbannerNotify &&
                !this.collectionsStrategyFlag() &&
                !this.isHardship &&
                this.currentAccount.active &&
                !this.hasRenewableEnergy &&
                !this.pendingRenewable &&
                !this.isSolar()
            ) {
                return true;
            }

            return false;
        };

        this.ShowResidentialsolarXBanner = function () {
            if (
                this.isResidential &&
                this.currentAccount.productDetails.energyProductLabel !== 'Home Business Plan (K1) Tariff' &&
                this.SolarXsellBanner &&
                this.SolarXbannerNotify &&
                !this.collectionsStrategyFlag() &&
                !this.isHardship &&
                this.currentAccount.active &&
                !this.hasRenewableEnergy &&
                !this.pendingRenewable &&
                !this.isSolar()
            ) {
                return true;
            }

            return false;
        };

        this.hidesolarXBanner = function () {
            self.saveSolarXsellBanner(
                'SolarXsellBannerNoThanks' + self.currentAccount.contractAccountNumber,
                self.currentAccount.contractAccountNumber
            );

            if (this.isResidential) {
                return (self.SolarXsellBanner = false);
            } else if (!this.isResidential) {
                return (self.BusinessSolarXsellBanner = false);
            }
        };
        this.filterIntervalDevices = function (data) {
            var result = false;
            angular.forEach(data, function (value, key) {
                if (value.isIntervalDevices === 'X') {
                    result = true;
                    return result;
                }
            });
            return result;
        };
        this.isIntervalDevices = function () {
            if (this.currentAccount.collectiveDetails.collectiveAccount) {
                return this.filterIntervalDevices(this.currentAccount.collectiveDetails.childAccounts);
            }
        };

        this.IsT2cCustomer = function () {
            return this.currentAccount.productDetails.isTrackToChange;
        };

        this.isCaseManagedCustomer = function () {
            return this.currentAccount.productDetails.isCaseManaged;
        };

        this.childAccounts = this.isCollective() ? this.currentAccount.collectiveDetails.childAccounts : undefined;

        $scope.$on(Events.ACCOUNT_INVALIDATED, function () {
            // Issue with reloading to get the updated account details
            // https://github.com/angular-ui/ui-router/issues/582
            $state.transitionTo($state.current, $stateParams, {
                location: false,
                reload: true,
                inherit: true,
                notify: true
            });
        });
        $scope.$on(Events.DEVICE_CHANGE, updateDeviceType);
        updateDeviceType();

        this.gotoBills = function () {
            $state.go('user.account.bills');
        };
        this.gotoUsage = function () {
            $state.go('user.account.usage');
        };
        this.gotoTrial = function () {
            if (this.isSolar()) {
                $state.go('user.account.solar');
            } else if (this.isLifestyle()) {
                $state.go('user.account.lifestyle');
            }
        };
        this.gotoIntervalData = function () {
            if (this.isResidential) {
                if (this.isAmiCustomer()) {
                    this.gotoUsage();
                } else {
                    Utils.activeTabI = 'interval';
                    $state.go('user.account.usage', { flow: 'interval' });
                }
            } else {
                $state.go('user.account.intervaldata');
            }
        };
        this.getMyAccountNotification = function () {
            AccountBillServer.getMyAccountNotification(self.currentAccount.contractAccountNumber).then(function (result) {
                if (result.Notify === true) {
                    self.Notify = result.Notify;
                    self.NotifyMessage = result.messages;
                } else {
                    self.Notify = false;
                    self.NotifyMessage = '';
                }
            });
        };
        this.getSolarXbannerShowHideFlag = function () {
            AccountBillServer.getSolarXbannerShowHideFlag(self.currentAccount.contractAccountNumber).then(function (result) {
                if (result.ShowHide && _.contains(result.messages, 'Show Solar X banner')) {
                    self.SolarXbannerNotify = result.ShowHide;
                    self.SolarXbannerMessage = 'Show Solar X banner';
                } else {
                    self.SolarXbannerNotify = false;
                    self.SolarXbannerMessage = '';
                }

                if (
                    result.ShowHide &&
                    _.contains(result.messages, 'Business Show Solar X banner') &&
                    self.currentAccount.productDetails.energyProductLabel === 'Home Business Plan (K1) Tariff'
                ) {
                    self.BusinessSolarXbannerNotify = result.ShowHide;
                    self.BusinessSolarXbannerMessage = 'Business Show Solar X banner';
                } else if (result.ShowHide && _.contains(result.messages, 'Business Show Solar X banner')) {
                    self.BusinessSolarXbannerNotify = result.ShowHide;
                    self.BusinessSolarXbannerMessage = 'Business Show Solar X banner';
                } else {
                    self.BusinessSolarXbannerNotify = false;
                    self.BusinessSolarXbannerMessage = '';
                }
            });
        };
        this.getSolarXbannerShowHideFlag();
        this.getMyAccountNotification();

        this.getBannerFlag = function () {
            AccountBillServer.getBannerAccountInfo(self.currentAccount.contractAccountNumber).then(function (result) {
                self.isHardship = result.EV_ACCOUNT_CLASS === 'HARD' ? true : false;

                if (result.EV_BANNER_TYPE && result.EV_BANNER_TYPE !== '') {
                    self.showEAPBanner = true;
                    self.bannerCode = result.EV_BANNER_TYPE;
                    self.bannerDate = result.EV_BANNER_TEXT;
                }
                self.isAtRisk = result.EV_AT_RISK;
                self.promiseToPayType = self.isAtRisk ? "plan" : "arrangement";
            });
        };
        this.getRecontractingBannerFlag = function () {
            // Ensure that only business customers that are a part of the current recontracting campaign see the recontracting banner
            if (self.isResidential) {
                return;
            }

            AccountBillServer.getRecontractingBannerInfo(self.currentAccount.contractAccountNumber).then(function (result) {
                // Ensure that the recontracting banner is displayed only when data is successfully returned
                if (!result || angular.equals(result, {})) {
                    return;
                }

                const contractExpiryDate = moment(result.OfferValidTo).startOf('day');
                const currentDate = moment().startOf('day');
                const daysUntilContractExpiry = contractExpiryDate.diff(currentDate, 'days');
                self.promoCode = result.PromoCode;

                if (daysUntilContractExpiry <= 90 && daysUntilContractExpiry >= 0) {
                    self.showRecontractingBanner = true;
                }
            });
        }

        this.getUnbilledBannerFlag = function () {
            if (!account.active) {
                return;
            }
            if (angular.isArray(account.billHistory.records)) {
                let postingDates = _.pluck(
                    _.filter(account.billHistory.records, function (o) {
                        return o.billingCode === 'IN';
                    }),
                    'postingDate'
                );
                if (angular.isArray(postingDates) && postingDates.length >= 0) {
                    let lastInvoicedDate = moment(postingDates[0]).startOf('day');
                    let currentDate = moment().startOf('day');
                    let daysUntilBilledDate = currentDate.diff(lastInvoicedDate, 'days');
                    if (daysUntilBilledDate >= 180) {
                        self.showUnBilledBannerSec = !self.bannerClosed;
                    } else if (daysUntilBilledDate >= 80) {
                        self.showUnBilledBannerFirst = !self.bannerClosed;
                    } else {
                        self.showUnBilledBannerFirst=false;
                        self.showUnBilledBannerSec=false;
                    }
                }
              let count=0;
              angular.forEach(postingDates, function(postingDates) {
                  let currentDate = moment().startOf('day');
                  let daysUntilLastBillDate = currentDate.diff(postingDates, 'days');
                  if (daysUntilLastBillDate < 30){
                      count += 1;
                  }
              });
              if (count > 1){
                  self.showDuplicateBillBanner=true;
              } else {
                  self.showDuplicateBillBanner=false;
              }
            }
        };

        this.redirectToSite = function () {
            Resources.getDocumentLink('synergy.newenergydeal').then(function (result) {
                var redirectURl = result.data;
                if (!redirectURl) {
                    return;
                }
                redirectURl = `${redirectURl}?promocode=${self.promoCode}`;
                $window.open(redirectURl, '_blank');
            });
        };

        this.redirectToPWS= function (documentName) {
            Resources.getDocumentLink(documentName).then(function (result) {
                var redirectURl = result.data;
                if (!redirectURl) {
                    return;
                }
                $window.open(redirectURl, '_blank');
            });
        };

        this.paymentArrangementUrl = function () {
            return self.isAtRisk
                ? `/synergy-engage.html?paymentNumber=${account.paymentInfo.paymentNumber}`
                : "/payment-arrangement.html";
        };
        this.getBannerFlag();
        this.getRecontractingBannerFlag();
        this.getUnbilledBannerFlag();

        this.createCookie = function(name = "Cookie", value = self.currentAccount.contractAccountNumber, expiresInDays = 60) {
            const millisecondsInDay = 1000 * 60 * 60 * 24;
            const expiryDate = new Date(Date.now() + (expiresInDays * millisecondsInDay)).toUTCString();

            const valueStr = (typeof value === 'object' ? angular.toJson(value) : value);

            let cookie = name + '-' + valueStr + '=';
            cookie += valueStr + ';';
            cookie += !value.session ? 'expires=' + expiryDate + ';' : '';
            cookie += value.secure ? 'secure;' : '';

            document.cookie = cookie;
        };

        this.doesCookieExist = function(name, value = self.currentAccount.contractAccountNumber) {
            const cookieIdentifier = name + '-' + (typeof value === 'object' ? angular.toJson(value) : value) + '=';

            return document.cookie.split(';').some((item) => item.trim().startsWith(cookieIdentifier));
        };

      this.updateDetailsCookieExist = this.doesCookieExist("update-details-cookie", self.currentAccount.contractAccountNumber)

      this.hideUpdateDetailsBanner = function () {
        if (this.updateDetailsCookieExist) {
            return;
        }
        // This banner is to be hidden for at least 6 months (~180 days) via a cookie.
        this.createCookie("update-details-cookie", self.currentAccount.contractAccountNumber, 180)
        this.updateDetailsCookieExist = true;
      }

      this.getUpdateDetailMessage = function () {
        const mobileNumber = AccountUtils.getAccountContactDetails(account).mobileTelephone;
        const accountHasMobileNumber = mobileNumber !== undefined && mobileNumber !== '';
        return accountHasMobileNumber ? $rootScope.messages.I79 : $rootScope.messages.I80;
      }

      this.goToUpdateScreen = function () {
        Wizards.openMyDetailsEdit();
      }

        // Wizards
        function accountLink(fnWizard) {
            return function () {
                fnWizard(self.currentAccount.contractAccountNumber);
            };
        }
        this.openConcessionCards = accountLink(Wizards.openConcessionCards);
        this.openDirectDebit = accountLink(Wizards.openDirectDebit);
        this.signUpDirectDebit = function () {
            $window.location.href = `/direct-debit.html?accountIdentifier=${this.currentAccount.accountIdentifier}`;
        };
        this.openGreenEnergy = accountLink(Wizards.openGreenEnergy);
        this.openFeedback = accountLink(Wizards.openFeedback);
        this.openIntervalExport = accountLink(Wizards.openIntervalExport);
        this.openRESIIntervalExport = accountLink(Wizards.openRESIIntervalExport);
        this.openBillHistoryExport = accountLink(Wizards.openBillHistoryExport);
        this.openLatePayments = accountLink(Wizards.openLatePayments);
        this.openMoveHouse = accountLink(Wizards.openMoveHouse);
        this.openMyDetails = accountLink(Wizards.openMyDetails);
        this.openPaperless = accountLink(Wizards.openPaperless);
        this.openPayAccount = accountLink(Wizards.openPayAccount);
        this.openCreditCard = accountLink(Wizards.openCreditCard);
        this.openRenameDevice = accountLink(Wizards.openRenameDevice);
        this.openEnergyProfile = accountLink(Wizards.openEnergyProfile);
        this.openRenewableEnergyApplication = accountLink(Wizards.openRenewableEnergyApplication);
        this.openRenewableRefundApplication = accountLink(Wizards.openRenewableRefundApplication);
        this.openUsageSummaryExport = accountLink(Wizards.openUsageSummaryExport);
        this.openViewArrangement = accountLink(Wizards.openViewArrangement);
        this.openPayOptions = accountLink(Wizards.openPayOptions);

        this.openAMIIntervalExport = accountLink(Wizards.openAMIIntervalExport);

        this.choosePaymentOptionIds = function () {
            if (this.currentAccount.collective || !this.currentAccount.active) {
                this.openPayAccount();
            } else {
                this.openPayOptions();
            }
        };
        if (this.currentAccount.collective || !this.currentAccount.active) {
            this.paymentLabel = 'Pay by card';
        } else {
            this.paymentLabel = 'Pay now';
        }
        // Open wizard referenced in URL
        var searchParams = $location.search();
        switch (searchParams.flow) {
            case 'directdebit':
                $timeout(this.openDirectDebit);
                break;
            case 'paperless':
                $timeout(this.openPaperless);
                break;
            case 'moving':
                $timeout(this.openMoveHouse);
                break;
            case 'greenenergy':
                $timeout(this.openGreenEnergy);
                break;
        }
        // Clear search params
        $location.search('flow', null);
        setTimeout(function () {
            $scope.$watch(
                angular.bind(this, function (insideFrontInterface) {
                    return this.insideFrontInterface;
                }),
                function (newVal, oldVal) {
                    if (
                        typeof insideFrontInterface !== 'undefined' &&
                        insideFrontInterface.currentChatId !== undefined &&
                        insideFrontInterface.currentChatId !== '' &&
                        Session.isLoggedIn()
                    ) {
                        var _insideData = {};
                        _insideData.user = {};
                        _insideData.user.account_number = self.getAccountWebChat();
                        _insideData.user.authenticated_status = true;
                        if (self.getAccountListWebChat().length >= 20) {
                            var accountListWebChatF = [];
                            for (i = 0; i < 20; i++) {
                                accountListWebChatF.push(self.getAccountListWebChat()[i]);
                            }
                            _insideData.user.account_list = accountListWebChatF;
                        } else {
                            _insideData.user.account_list = self.getAccountListWebChat();
                        }
                        _insideGraph.current.visitorData = _insideData.user;
                        if (
                            typeof _insideCurView !== 'undefined' &&
                            _insideCurView !== null &&
                            typeof _insideCurView.name !== 'undefined' &&
                            _insideCurView.name !== null &&
                            _insideCurView.name.length > 0
                        ) {
                            _insideGraph.current.trackView(_insideCurView);
                        } else {
                            _insideGraph.current.trackView({ type: 'home', name: 'Home Page' });
                        }
                    }
                },
                true
            );
        }, 1000);
    });
