angular.module('myaccount.wizard').config(['formRegistryProvider', function(formRegistryProvider) {
    /**
     * Selectaccount for mydetails
     */
    formRegistryProvider.registerForm({
        id: 'mydetails-selectaccount',
        title: 'My details',
        controller: ['accountList', 'formController', function(accountList, formController) {
            var self = this;
            this.accountList = accountList;
            this.selectAccount = function(contractAccountNumber) {
                // Pop on the mydetails-state
                formController.addTask('mydetails-status', {'contractAccountNumber': contractAccountNumber});
            }
        }],
        controllerAs: 'myCtrl',
        showProgress: false,
        authenticated: true,
        resolve: {
            accountList: ['Session', function(Session) {return Session.getAccountList();}]
        },
        states:
            [
                {
                    id: 'select',
                    title: 'Choose an account',
                    templateUrl: 'app/wizards/mydetails/mydetails-selectaccount.html',
                    nextMsg: 'Edit your details',
                    showNext: false
                }
            ]
    });
    /**
     * Mydetails-status
     */
    formRegistryProvider.registerForm({
        id: 'mydetails-status',
        title: 'My details',
        controller: ['account', 'AccountUtils', 'Busy', 'Modals', 'MyDetailsServer', 'Session', 'StoredCardServer','ValidationService','Utils','$filter',
            function(account, AccountUtils, Busy, Modals, MyDetailsServer, Session, StoredCardServer, ValidationService,Utils,$filter) {
                var self = this;
                var areas;
                this.account = account;
                this.displayContactDetails = AccountUtils.getAccountContactDetails(account);

                var promise = ValidationService.getInternationalAreaCodes();
                Utils.promiseThen(promise,function (result) {
                    self.areas = result

                    if(!_.isEmpty(self.displayContactDetails.telephoneNumberCountry) && self.displayContactDetails.telephoneNumberCountry != 'AU') {
                        var countryTelephone = $filter('filter')(result, function (d) {return d.countrycode === self.displayContactDetails.telephoneNumberCountry;})[0].countryname;
                        self.displayContactDetails.telephoneNumber = countryTelephone + ' ' + self.displayContactDetails.telephoneNumber
                    }

                    if(!_.isEmpty(self.displayContactDetails.mobileTelephoneCountry) && self.displayContactDetails.mobileTelephoneCountry != 'AU') {
                        var countryMobile = $filter('filter')(result, function (d) {return d.countrycode === self.displayContactDetails.mobileTelephoneCountry;})[0].countryname;
                        self.displayContactDetails.mobileTelephone = countryMobile + ' ' + self.displayContactDetails.mobileTelephone
                    }
                });
            }],
        controllerAs: 'myCtrl',
        showProgress: false,
        authenticated: true,
        resolve: {
            account: ['formArgs', 'Session', function (formArgs, Session) {
                return Session.getAccount(formArgs.contractAccountNumber);
            }]
        },
        states:
            [
                {
                    id: 'status',
                    title: 'My details',
                    templateUrl: 'app/wizards/mydetails/mydetails-status.html',
                    nextMsg: 'Edit your details',
                    next: '^mydetails-edit'
                }
            ]
    });

    /**
     * Mydetails-edit
     */
    formRegistryProvider.registerForm({
        id: 'mydetails-edit',
        title: 'My details',
        analytics: {
            formName: 'My details'
        },
        controller: ['formArgs', 'account', 'AccountUtils', 'Busy', 'Modals', 'MyDetailsServer', 'Session', 'StoredCardServer', 'accountList', 'Utils',
            function(formArgs, account, AccountUtils, Busy, Modals, MyDetailsServer, Session, StoredCardServer, accountList, Utils) {
                var self = this;
                this.initialised = false;
                this.account = account;
                this.accountList = accountList;
                this.updateMultipleAccounts = false;
                Utils.isRebsFlowCheck = false;
                this.updateContactDetails = function() {
                    var accountsToUpdate = null;
                    if (this.updateMultipleAccounts) {
                        // May be at this stage, you would want to take this array and _.collect or _.map it to array of Objects{vkont:<<canumber>>}
                        accountsToUpdate = _.map(this.accountList, 'contractAccountNumber');
                    }
                    return Busy.doing('next', MyDetailsServer.updateContactDetails(this.account.contractAccountNumber, angular.copy(this.newContactDetails), accountsToUpdate)).then(function(wasSuccessful) {
                        const accountNumber = account.contractAccountNumber;
                        const hasUpdateCookie = Utils.doesCookieExist('update-details-cookie', accountNumber)
                        if (!hasUpdateCookie) {
                            Utils.createCookie('update-details-cookie', accountNumber, 180)
                        }

                        if (wasSuccessful) {
                            Utils.setGoal('Goal_Update_Contact_Details');
                        }
                    });
                };

                this.newContactDetails = AccountUtils.getAccountContactDetails(this.account);
                this.newContactDetails.termsAndConditions = 'No';
                this.displayContactDetails = angular.copy(this.newContactDetails); // Avoid overwrite when back is clicked on edit
                this.newStoredCards = angular.copy(this.account.paymentInfo.storedCards);
                this.exclusionFields = {company: true, emailAddressConfirm: true, dateOfBirth: true, furtherInfo: true};

                this.mydetailsReadOnlyFields = {firstName:false, lastName: false, companyName: false};
                this.firstNameCheck=true;
                this.lastNameCheck=true;
                this.companyNameCheck=true;

                if (this.newContactDetails.firstName === undefined || this.newContactDetails.firstName ==="" ){
                    this.firstNameCheck =false;
                    this.lastNameCheck=false;
                }
                if (this.newContactDetails.lastName === undefined || this.newContactDetails.lastName ==="" ){
                    this.lastNameCheck=false;
                    this.firstNameCheck =false;
                }
                if (this.newContactDetails.companyName === undefined || this.newContactDetails.companyName ==="" ){
                    this.companyNameCheck=false;
                    this.companyNameCheck =false;
                }

                this.mydetailsReadOnlyFields = {firstName: this.firstNameCheck, lastName: this.lastNameCheck, companyName: this.companyNameCheck};
                this.suggestions = [];

                // Add the premise address
                if (this.newContactDetails.mailingAddress) {
                    this.suggestions.push(this.newContactDetails.mailingAddress);
                }

                if (!_.isEmpty(formArgs)) {
                    angular.forEach(formArgs, function(value, key) {
                        if (self.newContactDetails.hasOwnProperty(key)) {
                            self.newContactDetails[key] = value;
                        }
                    });
                }

                this.requestStoredCardDeletion = function(index) {
                    var card = this.newStoredCards[index];
                    var promise = Modals.showConfirm('Delete Stored Card', 'Are you sure you wish to delete card '+card.maskedCreditCardNumber+' ?');
                    promise.then(function() {
                        return StoredCardServer.deleteStoredCreditCardDetails(self.account.contractAccountNumber, card.maskedCreditCardNumber, card.cardType, card.dvToken);
                    }).then( function() {
                        self.newStoredCards.splice(index, 1);
                    }).then( function() {
                        Modals.showAlert("Card deleted", "Your card has been deleted.");
                    });
                };
            }],
        controllerAs: 'myCtrl',
        showProgress: true,
        authenticated: true,
        resolve: {
            account: ['formArgs', 'Session', function (formArgs, Session) {
                return Session.getAccount(formArgs.contractAccountNumber);
            }],
            accountList: ['formArgs', 'Session', function (formArgs, Session) {
                return Session.getBPAccountList(formArgs.contractAccountNumber);
            }]
        },
        states:
            [
                {
                    id: 'edit',
                    title: 'Edit your details',
                    templateUrl: 'app/wizards/mydetails/mydetails-edit.html',
                    controller: ['$scope', 'formController', function($scope, formController) {
                        $scope.suggestions = [];
                        $scope.addAddress = function() {
                            // Must not reference $scope inside onResult function!
                            var myCtrl = $scope.myCtrl;
                            formController.addTask('addresslookup', {addressType: 'paf'}, function(result) {
                                myCtrl.suggestions.push(result);
                                myCtrl.newContactDetails.mailingAddress = result;
                            });
                        };
                    }],
                    nextMsg: "Save details",
                    disableNext: function ($scope) {
                        return $scope.myCtrl.newContactDetails.termsAndConditions === 'No';
                    },
                    checkpoint: true
                },
                {
                    id: 'multipleaccounts',
                    title: 'Edit your details',
                    templateUrl: 'app/wizards/mydetails/mydetails-multipleaccounts.html',
                    skip: ['$scope', function ($scope) {
                        return $scope.myCtrl.accountList.length < 1;
                    }],
                    showNext: false,
                    controller: ['$scope', 'formController', 'Utils', function ($scope, formController, Utils) {
                        $scope.setUpdateMultipleAccounts = function (value) {
                            const accountNumber = $scope.myCtrl.account.contractAccountNumber;
                            const hasUpdateCookie = Utils.doesCookieExist('update-details-cookie', accountNumber)
                            if (!hasUpdateCookie) {
                                Utils.createCookie('update-details-cookie', accountNumber, 180)
                            }

                            $scope.myCtrl.updateMultipleAccounts = value;
                            formController.goForward('submitStep');
                        };
                    }]
                },
                {
                    id: 'submitStep',
                    skip: ['$scope', 'Utils', 'Busy', 'Modals', function ($scope, Utils, Busy) {
                        var promise = Busy.doing('global', $scope.myCtrl.updateContactDetails());
                        return Utils.promiseThen(promise, function () {
                            return 'success';
                        });
                    }]
                },
                {
                    id: 'success',
                    title: 'Success',
                    checkpoint: true,
                    completed: true,
                    templateUrl: 'app/wizards/mydetails/mydetails-success.html'
                }
            ]
    });
}]);

angular.module('myaccount.wizard').factory('MyDetailsServer', function (http, Utils) {
    var MyDetailsServer = {
        updateContactDetails: function (contractAccountNumber, contactDetails, accountsToUpdate) {
            // Element scope on sy-contact-details hasnt been destroyed so we need to manually sanitise them.
            Utils.sanitiseContactDetails(contactDetails);
            return http({
                method: 'POST',
                url: '/accountUpdate/' + contractAccountNumber + '/updateContactDetails.json',
                data: {
                    firstName: contactDetails.firstName,
                    lastName: contactDetails.lastName,
                    emailAddress: contactDetails.emailAddress,
                    telephoneNumberCountry: contactDetails.telephoneNumberCountry,
                    telephoneNumber: contactDetails.telephoneNumber ? contactDetails.telephoneNumber.replace(/[\s]/g, '') :"",
                    mobileTelephoneCountry: contactDetails.mobileTelephoneCountry,
                    mobileTelephone: contactDetails.mobileTelephone,
                    mailingAddress: contactDetails.mailingAddress,
                    accountsToUpdate: accountsToUpdate
                }
            });
        }
    };

    return MyDetailsServer;
});

angular.module('myaccount.wizard').factory('StoredCardServer', function (http) {
    var StoredCardServer = {
        deleteStoredCreditCardDetails: function(contractAccountNumber, maskedCreditCardNumber, cardType, dvToken){
            return http({
                method: 'POST',
                url: '/accountUpdate/' + contractAccountNumber + '/deleteStoredCreditCardDetails',
                data: {
                    dvToken: dvToken,
                    cardType: cardType,
                    maskedCreditCardNumber: maskedCreditCardNumber
                }
            });
        }
    };

    return StoredCardServer;
});