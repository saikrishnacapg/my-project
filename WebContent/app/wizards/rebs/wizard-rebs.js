angular.module('myaccount.wizard').controller('RebsApplicationStatusCtrl', function ($scope) {
    this.selection = 'status';
    this.supplyAddress;

    this.openContactUs = function () {
        $scope.rebsCtrl.openContactUs();
    };
});

angular.module('myaccount.wizard').config([
    'formRegistryProvider',
    function (formRegistryProvider) {
        formRegistryProvider.registerForm({
            id: 'des',
            title: 'Distributed energy systems',
            analytics: {
                formName: 'Manage DES',
                startFunction: function (state) {
                    return state.$$idx === 11;
                }
            },
            /**
             *  PLEASE READ BEFORE DEVELOPING
             *  activeAccount should be used to deal with edge cases before the 'status' step like collectives and multiple
             *  supply addresses and only for logged in users.
             *
             *  From there on we are working with the rebs model and pricing in the initialised controller.
             *  This allows us to provide a clean solution for both authenticated and unauthenticated users.
             *
             */
            controller: [
                'activeAccount',
                'rebsPricingModel',
                'rebsModel',
                'formController',
                'AccountUtils',
                'Busy',
                'RebsServer',
                'Session',
                'Utils',
                'ValidationService',
                '$window',
                function (
                    activeAccount,
                    rebsPricingModel,
                    rebsModel,
                    formController,
                    AccountUtils,
                    Busy,
                    RebsServer,
                    Session,
                    Utils,
                    ValidationService,
                    $window
                ) {
                    var self = this;
                    this.isLoggedIn = Session.isLoggedIn();
                    this.pricingModel = rebsPricingModel; // Both of these can be initialised later if coming through pre-steps
                    this.model = rebsModel;
                    this.isCollective = activeAccount && activeAccount.collective;
                    this.invalidEmail = false;
                    this.hasMARegistration = true;
                    this.analyticsFlag = true;
                    this.contract = {}; // Used for passing to registration in unathenticated version
                    this.activeAccountType = this.isLoggedIn === true ? activeAccount.contractAccountType : '';
                    this.allowApplication = function () {
                        return !this.model.isPending() && !_.isEmpty(this.model.meter.address) && !this.model.isTempSupply();
                    };

                    this.contactNumber = function () {
                        return self.model.customer.type === 'Residential' ? '13 13 53' : '1300 859 333';
                    };

                    this.applicationFormLink = function () {
                        var parentCAN = this.isCollective
                            ? _.safeAccess(activeAccount, 'accountDetails.contractAccountNumber')
                            : undefined;
                        return RebsServer.applicationFormLink(
                            this.model.getApplicationReferenceNumber(),
                            this.model.contractAccountNumber,
                            parentCAN
                        );
                    };

                    // Dummy view functions
                    this.multipleSupplyAddresses = function () {
                        return self.model.supplyAddresses.length > 1;
                    };

                    this.displayConstructionError = function () {
                        if (!self.model.meter.address) {
                            return false;
                        }
                        return (
                            !_.isEmpty(_.safeAccess(self.model.meter, 'address.masterMeterDataList')) &&
                            !self.model.meter.underConstruction
                        );
                    };

                    this.exchangePrice = function () {
                        var phase = self.model.meter.details.phase === 2 ? 3 : self.model.meter.details.phase;
                        return self.pricingModel[`meterExchangePhase${ phase.toString() }PriceInDollars`];
                    };

                    this.submitRebsApplication = function () {
                        var parentCAN = self.isCollective
                            ? _.safeAccess(activeAccount, 'accountDetails.contractAccountNumber')
                            : undefined;
                        return Busy.doing('global', RebsServer.submit(self.model, parentCAN)).then(function () {
                            // Need to do the Code in the is section
                            if (self.model.isDebs() && self.model.isNewApplication()) {
                                Utils.setGoal('Goal_Solar_Connection_Submitted');
                                Utils.setGoal('Goal_REBS_Opt_In');
                            }
                            if (self.model.isDebs() && !self.model.isNewApplication()) {
                                Utils.setGoal('Goal_REBS_Opt_In');
                            }
                        });
                    };

                    this.openContactUs = function () {
                        formController.addTask('contactus');
                    };

                    this.getRegistrationDetails = function () {
                        return {
                            telephoneNumber: self.model.customer.contactPhoneNumber,
                            mobilePhone: self.model.customer.contactPhoneNumber,
                            firstName: self.model.customer.firstName,
                            lastName: self.model.customer.lastName,
                            emailAddress: self.model.customer.emailAddress,
                            emailAddressConfirm: self.model.customer.emailAddress
                        };
                    };

                    self.isEmailValid = function () {
                        self.invalidEmail = false;
                        if (self.model.customer.emailAddress) {
                            var promise = ValidationService.validateEmail(self.model.customer.emailAddress);

                            var success = function (result) {
                                self.invalidEmail = _.safeAccess(result, 'data.status') === 'error';
                            };
                            var failure = function (reason) {
                                self.invalidEmail = false;
                            };

                            promise.then(success, failure);
                        }
                    };
                    this.analyticsSend = function () {
                        if (this.analyticsFlag) {
                            this.analyticsFlag = false;
                        }

                        return true;
                    };
                    this.activeAccoutClassType = function () {
                        return this.activeAccountType;
                    };
                }
            ],
            controllerAs: 'rebsCtrl',
            showProgress: true,
            authenticated: false,
            exit: function (completed) {
                if (completed) {
                    vocvirtualurlsurvey('/ma/rebs/success');
                }
            },
            resolve: {
                activeAccount: [
                    'formArgs',
                    'Session',
                    function (formArgs, Session) {
                        return formArgs.contractAccountNumber ? Session.getAccount(formArgs.contractAccountNumber) : undefined;
                    }
                ],
                rebsPricingModel: [
                    'formArgs',
                    'RebsServer',
                    'RebsPricingModel',
                    'Utils',
                    function (formArgs, RebsServer, RebsPricingModel, Utils) {
                        if (!formArgs.contractAccountNumber) {
                            return;
                        }

                        return Utils.promiseThen(RebsServer.pricing(formArgs.contractAccountNumber), function (result) {
                            return RebsPricingModel.build(result);
                        });
                    }
                ],
                rebsModel: [
                    'formArgs',
                    'RebsServer',
                    'RebsModel',
                    'Utils',
                    function (formArgs, RebsServer, RebsModel, Utils) {
                        if (!formArgs.contractAccountNumber) {
                            return;
                        }

                        return Utils.promiseThen(RebsServer.show(formArgs.contractAccountNumber), function (result) {
                            return RebsModel.build(result);
                        });
                    }
                ]
            },
            states: [
                {
                    skip: [
                        '$scope',
                        function ($scope) {
                            return $scope.rebsCtrl.isLoggedIn;
                        }
                    ],
                    id: 'beforeyoubegin',
                    title: 'Before you begin',
                    progress: false,
                    templateUrl: 'app/wizards/rebs/status/_intro-copy.html'
                },
                {
                    id: 'skipaccountauth',
                    skip: [
                        '$scope',
                        function ($scope) {
                            return $scope.rebsCtrl.isLoggedIn ? 'collective' : 'accountauth';
                        }
                    ]
                },
                {
                    subflow: {
                        id: 'accountauth',
                        inject: function ($scope) {
                            return {
                                processId: 'des',
                                credentials: $scope.rebsCtrl.contract
                            };
                        },
                        next: [
                            '$scope',
                            '$q',
                            'AccountAuthServer',
                            'RebsModel',
                            'RebsPricingModel',
                            'RebsServer',
                            'Utils',
                            'Modals',
                            function ($scope, $q, AccountAuthServer, RebsModel, RebsPricingModel, RebsServer, Utils, Modals) {
                                if (!$scope.rebsCtrl.isLoggedIn) {
                                    var can = $scope.rebsCtrl.contract.contractAccountNumber.toString().toCAN();
                                    let contractAccountType = $scope.rebsCtrl.contract.contractAccountType;
                                    var promise = AccountAuthServer.validateAccountNumberAndHandleEx('register', can);

                                    promise.then(function (validateIsWebUser) {
                                        var isWebUser = validateIsWebUser.isWebUser;
                                        isWebUser ? $scope.rebsCtrl.hasMARegistered = true : $scope.rebsCtrl.hasMARegistered = false;
                                        isWebUser
                                            ? $scope.rebsCtrl.hasMARegistration = true
                                            : $scope.rebsCtrl.hasMARegistration = false;
                                    });
                                    var promise2 = Utils.promiseThen(
                                        promise,
                                        function () {
                                            if (!$scope.rebsCtrl.hasMARegistration) {
                                                $scope.rebsCtrl.hasMARegistration = false;
                                            }
                                        },
                                        function () {
                                            $scope.rebsCtrl.hasMARegistration = true;
                                        }
                                    );

                                    var promises = $q.all([promise2, RebsServer.show(can), RebsServer.pricing(can)]);

                                    return Utils.promiseThen(promises, function (results) {
                                        $scope.rebsCtrl.model = RebsModel.build(results[1]);
                                        let customerType = $scope.rebsCtrl.model.idType;
                                        $scope.rebsCtrl.pricingModel = RebsPricingModel.build(results[2]);
                                        if (Utils.checkCustomerType(contractAccountType, customerType)) {
                                            return true;
                                        }
                                        let changeIvHelp = `<p>${ $rootScope.messages.E609 }</p>`;
                                        Modals.showErrors(changeIvHelp);
                                        return $q.reject();

                                    });
                                }
                                return true;
                            }
                        ]
                    }
                },
                {
                    id: 'collective',
                    skip: [
                        '$scope',
                        function ($scope) {
                            return !$scope.rebsCtrl.isCollective;
                        }
                    ],
                    title: 'Select account',
                    progress: false,
                    templateUrl: 'app/wizards/rebs/rebs-collective.html',
                    controller: [
                        'formArgs',
                        'RebsServer',
                        'Utils',
                        function (formArgs, RebsServer, Utils) {
                            var self = this;

                            var parentCan = formArgs.contractAccountNumber;
                            var webUserId = _.safeAccess(Session, 'user.username');

                            Utils.promiseThen(RebsServer.activeAccounts(parentCan, webUserId), function (result) {
                                self.childAccounts = _.safeAccess(result, 'accounts') || [];
                            });
                        }
                    ],
                    controllerAs: 'stepCtrl',
                    next: [
                        '$scope',
                        'formArgs',
                        'RebsServer',
                        'RebsPricingModel',
                        'Utils',
                        function ($scope, formArgs, RebsServer, RebsPricingModel, Utils) {
                            var parentCan = formArgs.contractAccountNumber;

                            var can = $scope.rebsCtrl.selectedChildAccount.toString().toCAN(); // Just set in view
                            var promises = $q.all([RebsServer.show(can, parentCan), RebsServer.pricing(can, parentCan)]);

                            return Utils.promiseThen(promises, function (results) {
                                $scope.rebsCtrl.model = RebsModel.build(results[0]);
                                $scope.rebsCtrl.pricingModel = RebsPricingModel.build(results[1]);
                            });
                        }
                    ]
                },
                {
                    skip: [
                        '$scope',
                        'Utils',
                        'PODFCPFlagService',
                        function ($scope, Utils, PODFCPFlagService) {
                            return Utils.promiseThen(PODFCPFlagService.getPodFCPFlag($scope.rebsCtrl.model.contractAccountNumber), function (result) {
                                $scope.rebsCtrl.model.isPodFutureCommunitiesPlan = result;
                                PODFCPFlagService.isPodFutureCommunitiesPlan = result;
                                return PODFCPFlagService.isFCPEligible() && $scope.rebsCtrl.model.customer.type === 'Residential' ? "fcpEligible" : "chooseaddress";
                            });
                        }
                    ],
                    id: 'checkDEREnabled'
                },
                {
                    id: 'chooseaddress',
                    skip: [
                        '$scope',
                        function ($scope) {
                            return !$scope.rebsCtrl.multipleSupplyAddresses();
                        }
                    ],
                    title: 'Choose your supply address',
                    progress: false,
                    templateUrl: 'app/wizards/rebs/rebs-choose-address.html',
                    next: [
                        '$scope',
                        function ($scope) {
                            var supplyAddress = $scope.rebsCtrl.selectedSupplyAddress;

                            var meters = _.safeAccess(supplyAddress, 'masterMeterDataList') || [];
                            var defaultMeter = meters.length > 1 ? undefined : meters[0];
                            $scope.rebsCtrl.model.meter.address = supplyAddress;
                            $scope.rebsCtrl.model.meter.details = defaultMeter;
                        }
                    ]
                },
                {
                    id: 'pendingStatus',
                    skip: [
                        '$scope',
                        function ($scope) {
                            return $scope.rebsCtrl.isLoggedIn || !$scope.rebsCtrl.model.isPending();
                        }
                    ],
                    title: 'Status',
                    templateUrl: 'app/wizards/rebs/status/_pending-ma-promo.html',
                    resolve: function () {
                        vocvirtualurlsurvey('/ma/rebs/success');
                    },
                    completed: true,
                    showBack: false,
                    nextMsg: function ($scope) {
                        return $scope.rebsCtrl.hasMARegistration ? 'Login to My Account' : 'Register for My Account';
                    },
                    next: [
                        '$scope',
                        'Router',
                        function ($scope) {
                            return $scope.rebsCtrl.hasMARegistration ? window.location.href = '/my-account.html' : 'status';
                        }
                    ]
                },
                /**
                 * Usual Start state for applications within My Account unless they are collectives or have multiple
                 * supply addresses. Previous states are authentication outside of MA and promotion of MA there too.
                 */
                {
                    skip: [
                        '$scope',
                        function ($scope) {
                            // Skip to registration for pending apps accessed outside MA. Existing MA will be sent to login.
                            return !$scope.rebsCtrl.isLoggedIn && $scope.rebsCtrl.model.isPending();
                        }
                    ],
                    id: 'status',
                    title: 'Status',
                    progress: false,
                    templateUrl: 'app/wizards/rebs/rebs-status.html',
                    nextMsg: function ($scope) {
                        return !$scope.rebsCtrl.allowApplication()
                            ? 'Close'
                            : $scope.rebsCtrl.model.isNewApplication()
                                ? 'New application'
                                : 'Apply to change system details';
                    },
                    showNext: function ($scope) {
                        return $scope.rebsCtrl.allowApplication();
                    },
                    next: [
                        '$scope',
                        'Utils',
                        'Modals',
                        function ($scope, Utils, Modals) {
                            if ($scope.rebsCtrl.isLoggedIn) {
                                let contractAccountType = $scope.rebsCtrl.activeAccoutClassType();
                                let customerType = $scope.rebsCtrl.model.idType;
                                if (Utils.checkCustomerType(contractAccountType, customerType)) {
                                    return $scope.rebsCtrl.allowApplication() ? 'personal' : {};
                                }
                                let changeIvHelp = `<p>${ $rootScope.messages.E609 }</p>`;
                                Modals.showErrors(changeIvHelp);
                                return $q.reject();

                            }
                            return $scope.rebsCtrl.allowApplication() ? 'personal' : {};

                        }
                    ]
                },
                {
                    skip: [
                        '$scope',
                        function ($scope) {
                            // Skip to registration for pending apps accessed outside MA. Existing MA will be sent to login.
                            return !$scope.rebsCtrl.isLoggedIn && $scope.rebsCtrl.model.isPending();
                        }
                    ],
                    id: 'personal',
                    title: 'Personal details',
                    checkpoint: true,
                    templateUrl: 'app/wizards/rebs/rebs-personal.html'
                },
                {
                    skip: [
                        '$scope',
                        function ($scope) {
                            // Skip to registration for pending apps accessed outside MA. Existing MA will be sent to login.
                            return !$scope.rebsCtrl.isLoggedIn && $scope.rebsCtrl.model.isPending();
                        }
                    ],
                    id: 'supplyaddress',
                    title: 'Supply details',
                    checkpoint: true,
                    templateUrl: 'app/wizards/rebs/rebs-supplyaddress.html',
                    disableNext: function ($scope) {
                        var meter = $scope.rebsCtrl.model.meter;
                        return !(meter.address && (meter.details || meter.underConstruction));
                    }
                },
                {
                    skip: [
                        '$scope',
                        function ($scope) {
                            // Skip to registration for pending apps accessed outside MA. Existing MA will be sent to login.
                            return !$scope.rebsCtrl.isLoggedIn && $scope.rebsCtrl.model.isPending();
                        }
                    ],
                    id: 'installer',
                    title: 'Installer details',
                    checkpoint: true,
                    templateUrl: 'app/wizards/rebs/rebs-installer.html',
                    controller: [
                        '$scope',
                        'Utils',
                        function ($scope, Utils) {
                            $scope.allOrNone = Utils.allOrNone;
                        }
                    ],
                    disableNext: function ($scope) {
                        return !$scope.allOrNone($scope.rebsCtrl.model.installer);
                    },
                    next: [
                        '$scope',
                        function ($scope) {
                            if ($scope.rebsCtrl.model.isNewApplication()) {
                                return 'meteraccess';
                            }
                            return 'systemsize';
                        }
                    ]
                },
                {
                    skip: [
                        '$scope',
                        function ($scope) {
                            // Skip to registration for pending apps accessed outside MA. Existing MA will be sent to login.
                            return !$scope.rebsCtrl.isLoggedIn && $scope.rebsCtrl.model.isPending();
                        }
                    ],
                    id: 'meteraccess',
                    title: 'Meter access',
                    checkpoint: true,
                    templateUrl: 'app/wizards/rebs/rebs-meteraccess.html',
                    controller: [
                        '$scope',
                        'Utils',
                        function ($scope, Utils) {
                            $scope.allOrNone = Utils.allOrNone;
                        }
                    ],
                    disableNext: function ($scope) {
                        return !$scope.allOrNone($scope.rebsCtrl.model.meterAccess);
                    }
                },
                {
                    skip: [
                        '$scope',
                        function ($scope) {
                            // Skip to registration for pending apps accessed outside MA. Existing MA will be sent to login.
                            return !$scope.rebsCtrl.isLoggedIn && $scope.rebsCtrl.model.isPending();
                        }
                    ],
                    id: 'systemsize',
                    title: 'System details',
                    checkpoint: true,
                    templateUrl: 'app/wizards/rebs/rebs-systemsize.html',
                    controller: [
                        '$scope',
                        'Modals',
                        'DeviceMode',
                        function ($scope, Modals, DeviceMode) {
                            var newGenHelp = `<p>${ $rootScope.messages.MA_H16 }</p>`;
                            var changeGenHelp = `<p>${ $rootScope.messages.MA_H17 }</p>`;

                            $scope.generationHelp = function () {
                                if ($scope.rebsCtrl.model.isNewApplication()) {
                                    Modals.showAlert('Total generation size', newGenHelp);
                                } else {
                                    Modals.showAlert('Total generation size', changeGenHelp);
                                }
                            };

                            var newInvHelp = `<p>${ $rootScope.messages.MA_H18 }</p>`;
                            var changeIvHelp = `<p>${ $rootScope.messages.MA_H19 }</p>`;
                            $scope.inverterHelp = function () {
                                if ($scope.rebsCtrl.model.isNewApplication()) {
                                    Modals.showAlert('Total inverter capacity', newInvHelp);
                                } else {
                                    Modals.showAlert('Total inverter capacity', changeIvHelp);
                                }
                            };
                        }
                    ],
                    disableNext: function ($scope) {
                        return false;
                    },
                    next: [
                        '$scope',
                        function ($scope) {
                            $scope.rebsCtrl.model.setDVPMOptions()
                            return 'dvpmOption';
                        }
                    ]
                },
                {
                    skip: [
                        '$scope',
                        function ($scope) {
                            // Skip to registration for pending apps accessed outside MA. Existing MA will be sent to login.
                            return !$scope.rebsCtrl.isLoggedIn && $scope.rebsCtrl.model.isPending();
                        }
                    ],
                    id: 'dvpmOption',
                    title: 'Synergy API compatibility requirements.',
                    checkpoint: true,
                    templateUrl: 'app/wizards/rebs/rebs-solar-dpvm-option.html',
                    disableNext: function ($scope) {
                        return !$scope.rebsCtrl.model.dvpmTermsAccepted;
                    },
                    next: [
                        '$scope',
                        function ($scope) {
                            if ($scope.rebsCtrl.model.meterFeeApplicable()) {
                                return 'pricing';
                            } else if ($scope.rebsCtrl.model.thirdPartyConsentRequired()) {
                                return 'thirdparty';
                            }
                            return 'terms';
                        }
                    ]
                },
                {
                    skip: [
                        '$scope',
                        function ($scope) {
                            // Skip to registration for pending apps accessed outside MA. Existing MA will be sent to login.
                            return !$scope.rebsCtrl.isLoggedIn && $scope.rebsCtrl.model.isPending();
                        }
                    ],
                    id: 'pricing',
                    title: 'Meter reconfiguration acceptance',
                    checkpoint: true,
                    templateUrl: 'app/wizards/rebs/rebs-pricing.html',
                    disableNext: function ($scope) {
                        return !$scope.rebsCtrl.model.pricingAccepted();
                    },
                    next: [
                        '$scope',
                        function ($scope) {
                            if ($scope.rebsCtrl.model.thirdPartyConsentRequired()) {
                                return 'thirdparty';
                            }
                            return 'terms';

                        }
                    ]
                },
                {
                    skip: [
                        '$scope',
                        function ($scope) {
                            // Skip to registration for pending apps accessed outside MA. Existing MA will be sent to login.
                            return !$scope.rebsCtrl.isLoggedIn && $scope.rebsCtrl.model.isPending();
                        }
                    ],
                    id: 'thirdparty',
                    title: 'Third party consent',
                    checkpoint: true,
                    templateUrl: 'app/wizards/rebs/rebs-thirdparty.html',
                    disableNext: function ($scope) {
                        return !$scope.rebsCtrl.model.thirdPartyConsent;
                    }
                },
                {
                    skip: [
                        '$scope',
                        function ($scope) {
                            // Skip to registration for pending apps accessed outside MA. Existing MA will be sent to login.
                            return !$scope.rebsCtrl.isLoggedIn && $scope.rebsCtrl.model.isPending();
                        }
                    ],
                    id: 'terms',
                    title: 'Terms and conditions',
                    checkpoint: true,
                    templateUrl: 'app/wizards/rebs/rebs-terms.html',
                    nextMsg: 'Submit application',
                    disableNext: function ($scope) {
                        return !$scope.rebsCtrl.model.termsAccepted();
                    },
                    next: [
                        '$scope',
                        function ($scope) {
                            vocvirtualurlsurvey('/ma/rebs/success');
                            return $scope.rebsCtrl.submitRebsApplication;
                        }
                    ]
                },
                {
                    skip: [
                        '$scope',
                        function ($scope) {
                            // Skip to registration for pending apps accessed outside MA. Existing MA will be sent to login.
                            return !$scope.rebsCtrl.isLoggedIn && $scope.rebsCtrl.model.isPending();
                        }
                    ],
                    id: 'success',
                    title: 'Success',
                    checkpoint: true,
                    completed: true,
                    resolve: function () {
                        vocvirtualurlsurvey('/ma/rebs/success');
                    },
                    templateUrl: 'app/wizards/rebs/rebs-success.html',
                    nextMsg: function ($scope) {
                        return $scope.rebsCtrl.isLoggedIn
                            ? 'Close'
                            : $scope.rebsCtrl.hasMARegistration
                                ? 'Login to My Account'
                                : 'Register for My Account';
                    },
                    next: [
                        '$scope',
                        'Router',
                        'Wizards',
                        function ($scope, Router, Wizards) {
                            if (!$scope.rebsCtrl.isLoggedIn) {
                                if ($scope.rebsCtrl.hasMARegistration) {
                                    Router.gotoLogin();
                                } else {
                                    return 'registerUser';
                                }
                            } else {
                                Wizards.close();
                            }
                        }
                    ]
                },
                {
                    subflow: {
                        id: 'registerUser',
                        inject: function ($scope) {
                            return {
                                contract: $scope.rebsCtrl.contract,
                                customerDetails: $scope.rebsCtrl.getRegistrationDetails(),
                                billDispatchSettings: $scope.rebsCtrl.model.billDispatchSettings
                            };
                        },
                        next: [
                            '$scope',
                            function ($scope) {
                                return 'registrationSuccess';
                            }
                        ]
                    }
                },
                {
                    id: 'registrationSuccess',
                    resolve: function () {
                        vocvirtualurlsurvey('/ma/rebs/success');
                    },
                    completed: true,
                    title: 'Success',
                    templateUrl: 'app/wizards/rebs/rebsregister-success.html',
                    exit: [
                        'MyAccountPrefix',
                        function (MyAccountPrefix) {
                            return `${MyAccountPrefix }home`;
                        }
                    ],
                    nextMsg: 'Proceed to My Account'
                },
                {
                    id: 'fcpEligible',
                    completed: true,
                    progress: false,
                    title: 'FCP eligible',
                    templateUrl: 'app/wizards/rebs/rebs-not-eligible-for-fcp-message.html',
                    checkpoint: true
                }
            ]
        });
    }
]);

angular.module('myaccount.wizard').factory('RebsServer', function ($window, http, Modals, MyAccountServer) {
    function convert(model) {
        // Preferably revert to Utils.flattenJson than manually doing this.
        return {
            type: model.applicationType,
            idType: model.idType,
            contractAccountNumber: model.contractAccountNumber,

            // Customer info
            customerType: model.customer.type,
            customerFirstName: model.customer.firstName,
            customerLastName: model.customer.lastName,
            customerCompanyName: model.customer.companyName,
            customerEmailAddress: model.customer.emailAddress,
            customerContactPhoneNumber: model.customer.contactPhoneNumber,

            // Meter info
            meterAddress: model.meter.address.supplyAddress,
            meterNumber: model.meter.details.masterMeterNumber,
            meterUnderConstruction: model.meter.underConstruction,

            // Installer details
            installerEmailAddress: model.installer.emailAddress,
            installerEmailAddressConfirm: model.installer.emailAddressConfirm,

            // Meter access
            meterAccessTitle: model.meterAccess.title,
            meterAccessFirstName: model.meterAccess.firstName,
            meterAccessLastName: model.meterAccess.lastName,
            meterAccessContactPhoneNumber: model.meterAccess.contactPhoneNumber,

            // Solar system details
            systemTotalGenerationSize: model.system.totalGenerationSize,
            systemTotalInverterCapacity: model.system.totalInverterCapacity,
            resIsthisInverternew: model.system.resIsthisInverternew,

            thirdPartyConsent: model.thirdPartyConsent,
            reconfigurationConsent: model.reconfigurationConsent,
            intervalMeterConcent: model.intervalMeterConcent,
            exchangeConsent: model.exchangeConsent,
            exchangeAndReconfigConsent: model.exchangeAndReconfigConsent,
            rebsConsent: model.rebsConsent,
            debsConsent: model.debsConsent,
            nonRebsConsent: model.nonRebsConsent,
            //Code starts here
            gstRelevant: model.gstRelevant,
            getQueryParameters: model.getQueryParameters(),
            buyBackSchemeApplication: model.getDistributedEnergyType(),
            meterUpgradeRequired: model.meterFeeApplicable(),
            //Code ends here
            //dvpm options
            dpvmCompatible:model.system.dpvmCompatible,
            dvpmTermsAccepted:model.dvpmTermsAccepted,
            dvpmAcceptanceAPI:model.dvpmAcceptanceAPI,
            dvpmAcceptanceLIM:model.dvpmAcceptanceLIM
        };
    }

    function getUrlQuery(contractAccountNumber, parentContractAccountNumber) {
        return !_.isEmpty(parentContractAccountNumber)
            ? `${parentContractAccountNumber }/${ contractAccountNumber}`
            : contractAccountNumber;
    }

    var activeAccounts = function (contractAccountNumber, webUserId) {
        return http({
            method: 'POST',
            url: `/des/${ contractAccountNumber }/activeAccounts`,
            data: {
                webUserId: webUserId
            }
        });
    };

    var applicationFormLink = function (applicationReference, contractAccountNumber, parentContractAccountNumber) {
        var urlQuery = getUrlQuery(contractAccountNumber, parentContractAccountNumber);

        return (
            `${MyAccountServer }/des/${ urlQuery }/applicationFormDownload?applicationReference=${ applicationReference}`
        );
    };

    var pricing = function (contractAccountNumber, parentContractAccountNumber) {
        var urlQuery = getUrlQuery(contractAccountNumber, parentContractAccountNumber);
        return http({
            method: 'POST',
            url: `/des/${ urlQuery }/pricing`
        });
    };

    var show = function (contractAccountNumber, parentContractAccountNumber) {
        var urlQuery = getUrlQuery(contractAccountNumber, parentContractAccountNumber);
        return http({
            method: 'POST',
            url: `/des/${ urlQuery }/show`
        });
    };

    var submit = function (model, parentContractAccountNumber) {
        var urlQuery = getUrlQuery(model.contractAccountNumber, parentContractAccountNumber);
        var form = convert(model);
        return http({
            method: 'POST',
            url: `/des/${ urlQuery }/submit`,
            data: form
        });
    };

    var submitRefundApplication = function (model, parentContractAccountNumber) {
        var urlQuery = getUrlQuery(model.contractAccountNumber, parentContractAccountNumber);

        return http({
            method: 'POST',
            url: `/des/${ urlQuery }/submitRefundApplication`,
            data: {
                bsbNumber: model.bankDetails.bsbNumber,
                accountNumber: model.bankDetails.accountNumber,
                accountName: model.bankDetails.accountName
            }
        });
    };

    var submitRefundCancellation = function (model, parentContractAccountNumber) {
        var urlQuery = getUrlQuery(model.contractAccountNumber, parentContractAccountNumber);

        return http({
            method: 'POST',
            url: `/des/${ urlQuery }/submitRefundCancellation`,
            data: {}
        });
    };

    let getPodFCPFlag = function (contractAccountNumber, parentContractAccountNumber) {
        let urlQuery = getUrlQuery(contractAccountNumber, parentContractAccountNumber);
        return http({
            method: 'GET',
            url: `/des/${urlQuery}/getPodFCPFlag`
        });
    };

    var RebsServer = {
        activeAccounts: activeAccounts,
        applicationFormLink: applicationFormLink,
        pricing: pricing,
        show: show,
        submit: submit,
        submitRefundApplication: submitRefundApplication,
        submitRefundCancellation: submitRefundCancellation,
        getPodFCPFlag: getPodFCPFlag
    };

    return RebsServer;
});