angular.module('myaccount.wizard').config(['formRegistryProvider', function(formRegistryProvider) {

    /**
     * selectaccount for mydetails
     */
    formRegistryProvider.registerForm({
        id: 'mydetails-authorise-contacts-selectaccount',
        title: 'My details',
        controller: ['accountList', 'formController', function(accountList, formController) {
            var self = this;
            this.accountList = accountList;
            this.selectAccount = function(contractAccountNumber) {
                // pop on the mydetails-state
                formController.addTask('authorise-contacts', {'contractAccountNumber': contractAccountNumber});
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
                    templateUrl: 'app/wizards/manageAuthoriseContactsdetails/mydetails-selectaccount.html',
                    nextMsg: 'Edit your details',
                    showNext: false
                }
            ]
    });

	formRegistryProvider.registerForm({
        id: 'authorise-contacts',
        title: 'Manage authorised contacts',
        analytics: {
            formName: 'My details'
        },
        controller: ['formArgs','account', 'AccountUtils', 'Busy', 'Modals', 'MyDetailsServer', 'Session', 'UpdateAuthoriseContactDetailsServer', 'accountList','Utils','formController','ValidationService','$scope',
            function(formArgs, account, AccountUtils, Busy, Modals, MyDetailsServer, Session, UpdateAuthoriseContactDetailsServer, accountList,Utils,formController,ValidationService,$scope) {
                var self = this;
                this.account = account;
                this.accountList = accountList;
                this.businessPartnerDetails = account.businessPartnerDetails;
                this.contactDetails = account.businessPartnerDetails.contacts;
                self.tooltipShow  = undefined;

                this.tooltipHide = function () {
                    self.tooltipShow = false;
                };

                var promise = ValidationService.getInternationalAreaCodes();
                Utils.promiseThen(promise, function (AreaCodesresult) {
                    var self = this;
                    self.landlineFinalList = ValidationService.buildSelectElement(AreaCodesresult, ValidationService.AUSSIE_AREA_CODES);
                    self.mobileFinalList = ValidationService.buildSelectElement(AreaCodesresult, null);
                    self.landlineCountryCode = "08";
                    self.mobileTelephoneCountry = "AU";
                });

                this.addContactDetails = function(index) {
                    formController.addTask('add-contact-details',{
                        landlineFinalList: landlineFinalList,
                        mobileFinalList: mobileFinalList,
                        landlineCountryCode : landlineCountryCode,
                        mobileTelephoneCountry : mobileTelephoneCountry,
                        task:"add"
                    });
                };

                this.deleteContactDetails = function(index) {
                    var self = this;
                    var card = self.businessPartnerDetails.contacts[index];
                    var deferred = $q.defer();
                    var promise = Modals.showOptions('Authorise contact - Remove contact', 'Are you sure you wish to remove '+card.firstName+' '+card.lastName+' ?', ['Cancel','OK']);

                    var success = function(result) {
                        if (result == 'OK') {
                            var businessPartnerDetails = self.businessPartnerDetails;
                            _.each(businessPartnerDetails.contacts, function (c,i) {
                                if(i==index) {
                                    businessPartnerDetails.contacts[i].changeIndicator = 'D';
                                }
                            });
                            return UpdateAuthoriseContactDetailsServer.UpdateAuthoriseContactDetails(self.account.contractAccountNumber, businessPartnerDetails).then(function (wasSuccessful) {
                                if (wasSuccessful) {
                                    self.businessPartnerDetails.contacts.splice(index, 1);
                                    Modals.showAlert("Authorise contact - Remove contact", "Your contact has been successfully deleted. <br/> ", "savCardDelete");
                                }
                            });
                            deferred.resolve(result);
                        }
                        else {
                            self.contactDetails[index].isPrimaryContact=false;
                            deferred.reject(result);
                        }
                    };
                    var failure = function(reason) {
                        $q.reject(reason);
                    };
                    promise.then(success, failure);
                    return deferred.promise;
                };

                this.updateContactDetails = function(index) {
                    var card = this.businessPartnerDetails.contacts[index];

                    formController.addTask('add-contact-details', {
                        Updateaddcontactdetails: card,
                        landlineFinalList: landlineFinalList,
                        mobileFinalList: mobileFinalList,
                        landlineCountryCode : landlineCountryCode,
                        mobileTelephoneCountry : mobileTelephoneCountry,
                        task:"update"
                    });
                };

                this.checkedPrimaryConatct=function(index){
                    var self = this;
                    var deferred = $q.defer();
                    var promise = Modals.showContactPersonOptions('Updating primary contact', 'I nominate this person to be the primary contact for this account. They will be contacted by Western power for outage notifications only.', ['Cancel','OK']);

                    var success = function(result) {
                        if (result == 'OK') {
                            var businessPartnerDetails = self.businessPartnerDetails;
                            _.each(businessPartnerDetails.contacts, function (c,i) {
                                if(i==index) {
                                    businessPartnerDetails.contacts[i].isPrimaryContact = true;
                                    businessPartnerDetails.contacts[i].changeIndicator = 'U';
                                }else{
                                    businessPartnerDetails.contacts[i].isPrimaryContact = false;
                                }
                            });
                            return UpdateAuthoriseContactDetailsServer.UpdateAuthoriseContactDetails(self.account.contractAccountNumber, businessPartnerDetails).then(function (wasSuccessful) {
                                if (wasSuccessful) {
                                    Modals.showAlert("Updating primary contact", "Your primary contact has been successfully updated. <br/> ", "savCardDelete");
                                }
                            });
                            deferred.resolve(result);
                        }
                        else {
                            self.contactDetails[index].isPrimaryContact=false;
                            deferred.reject(result);
                        }
                    };
                    var failure = function(reason) {
                        $q.reject(reason);
                    };
                    promise.then(success, failure);
                    return deferred.promise;
                };
            }],
        controllerAs: 'myCtrl',
        showProgress: true,
        authenticated: true,
        resolve: {
        	account: ['formArgs','Session', function (formArgs, Session) {
                return Session.getAccount(formArgs.contractAccountNumber);
            }],
            accountList: ['formArgs','Session', function (formArgs ,Session) {
                return Session.getBPAccountList(formArgs.contractAccountNumber);
            }]
        },
        states: 
            [
                {
                    id: 'edit',
                    title: 'Edit your details',
                    templateUrl: 'app/wizards/manageAuthoriseContactsdetails/manage-Contactsdetails.html',
                    showNext: false,
                    checkpoint:true,
                    backMsg: 'Close',
                    back: 'exit'
                }
            ]
    });

    formRegistryProvider.registerForm({
        id: 'add-contact-details',
        title: 'Manage authorised contacts',
        analytics: {
            formName: 'My details'
        },
        controller: ['formArgs','account', 'AccountUtils', 'Busy', 'Modals', 'UpdateAuthoriseContactDetailsServer', 'Session',  'accountList','ValidationService', 'Regex','Utils','$scope','formController',
            function(formArgs, account, AccountUtils, Busy, Modals, UpdateAuthoriseContactDetailsServer, Session, accountList,ValidationService, Regex,Utils,$scope,formController) {
                var self = this;
                this.account = account;
                this.accountList = accountList;
                this.businessPartnerDetails = account.businessPartnerDetails;
                this.contacts = account.businessPartnerDetails.contacts;
                this.isPrimaryContact = undefined;

                this.localAreas = ValidationService.getLocalAreaCodes();
                this.phonenumber={
                    c:undefined,
                    n:undefined
                }
                this.termsAndConditions = false;
                var promise = ValidationService.getInternationalAreaCodes();
                Utils.promiseThen(promise,function (result) {
                    self.internationalAreas = result;
                });
                if (formArgs.task == "add") {
                    this.contact = {};
                    this.contact = {
                        telephoneNumber: {
                            areaCode: undefined,
                            number: undefined
                        },
                        telephoneNumberCountry: {
                            Code: formArgs.landlineCountryCode,
                            number: undefined
                        },
                        mobileTelephone: {
                            areaCode: undefined,
                            number: undefined
                        },
                        mobileTelephoneCountry: {
                            Code: formArgs.mobileTelephoneCountry,
                            number: undefined
                        },
                        changeIndicator: 'I'
                    };
                } else {
                    this.getPhoneValue = function (Number) {
                        if (Number) {
                            if (!(Number.areaCode = "AU")) {
                                this.phonenumber.c = Number.areaCode;
                                this.phonenumber.n = Number.number
                            } else {
                                this.phonenumber.c = Number.number.substr(0, 2);
                                this.phonenumber.n = Number.number.substr(2);
                            }
                        }
                    };
                    this.getPhoneValue(formArgs.Updateaddcontactdetails.telephoneNumber);

                    this.contact = {
                        title: formArgs.Updateaddcontactdetails.title,
                        firstName: formArgs.Updateaddcontactdetails.firstName,
                        lastName: formArgs.Updateaddcontactdetails.lastName,
                        dateOfBirth: formArgs.Updateaddcontactdetails.dateOfBirth,
                        dateOfBirthYear : moment(formArgs.Updateaddcontactdetails.dateOfBirth,'YYYY-MM-DD').year(),
                        dateOfBirthMonth : (moment(formArgs.Updateaddcontactdetails.dateOfBirth,'YYYY-MM-DD').month()+1).toString().length > 1 ? (moment(formArgs.Updateaddcontactdetails.dateOfBirth,'YYYY-MM-DD').month()+1) : '0'+(moment(formArgs.Updateaddcontactdetails.dateOfBirth,'YYYY-MM-DD').month()+1),
                        dateOfBirthDay : moment(formArgs.Updateaddcontactdetails.dateOfBirth,'YYYY-MM-DD').date(),
                        telephoneNumberCountry: {
                            Code: formArgs.Updateaddcontactdetails.telephoneNumber ? this.phonenumber.c : formArgs.landlineCountryCode,
                            number: formArgs.Updateaddcontactdetails.telephoneNumber ? this.phonenumber.n : undefined
                        },
                        telephoneNumber: {
                            areaCode: formArgs.Updateaddcontactdetails.telephoneNumber ? this.phonenumber.c : formArgs.landlineCountryCode,
                            number: formArgs.Updateaddcontactdetails.telephoneNumber ? this.phonenumber.n : undefined
                        },
                        mobileTelephoneCountry: {
                            Code: formArgs.Updateaddcontactdetails.mobileTelephone ? formArgs.Updateaddcontactdetails.mobileTelephone.areaCode : formArgs.mobileTelephoneCountry,
                            number: formArgs.Updateaddcontactdetails.mobileTelephone ? formArgs.Updateaddcontactdetails.mobileTelephone.number : undefined
                        },
                        mobileTelephone: {
                            areaCode: formArgs.Updateaddcontactdetails.mobileTelephone ? formArgs.Updateaddcontactdetails.mobileTelephone.areaCode : formArgs.mobileTelephoneCountry,
                            number: formArgs.Updateaddcontactdetails.mobileTelephone ? formArgs.Updateaddcontactdetails.mobileTelephone.number : undefined
                        },
                        emailAddress: formArgs.Updateaddcontactdetails.emailAddress,
                        //isPrimaryContact: !!isPrimaryContact,
                        changeIndicator:'U',
                        $$hashKey: formArgs.Updateaddcontactdetails.$$hashKey,
                        isPrimaryContact: formArgs.Updateaddcontactdetails.isPrimaryContact,
                        id:formArgs.Updateaddcontactdetails.id
                    };
                }
                if(formArgs.landlineFinalList && formArgs.mobileFinalList){
                    this.landlineFinalList = formArgs.landlineFinalList;
                    this.mobileFinalList = formArgs.mobileFinalList;
                }else {
                    var promise = ValidationService.getInternationalAreaCodes();
                    Utils.promiseThen(promise, function (AreaCodesresult) {
                       landlineFinalList = ValidationService.buildSelectElement(AreaCodesresult, ValidationService.AUSSIE_AREA_CODES);
                       mobileFinalList = ValidationService.buildSelectElement(AreaCodesresult, null);
                       landlineCountryCode = "08";
                       mobileTelephoneCountry = "AU";
                    });
                }



                this.updateAuthoriseContactDetails = function() {
                    if(this.contact.telephoneNumberCountry.number){
                        this.contact.telephoneNumber =  this.checktelephoneNumber(this.contact)

                    }
                    if(this.contact.mobileTelephoneCountry.number){
                        this.contact.mobileTelephone.areaCode   = this.contact.mobileTelephoneCountry.Code;
                        this.contact.mobileTelephone.number   = this.contact.mobileTelephoneCountry.number;
                    }
                    this.updateContact(this.contact);

                    return Busy.doing('next', UpdateAuthoriseContactDetailsServer.UpdateAuthoriseContactDetails(this.account.contractAccountNumber, self.businessPartnerDetails)).then(function(wasSuccessful) {
                        if (wasSuccessful) {

                        }
                    });
                };

                this.checktelephoneNumber =function(value){
                    if (_.isObject(value.telephoneNumberCountry) && ValidationService.isLocalTelephoneNumber(value.telephoneNumberCountry.Code)) {
                        var val;
                        if(value.telephoneNumberCountry.number){
                            val =  {areaCode: 'AU', number: value.telephoneNumberCountry.Code + '' + value.telephoneNumberCountry.number.replace(Regex.FILTER_SPACES, '')};
                        }else{
                            val={areaCode: value.telephoneNumberCountry.Code , number: ''};
                        }
                        return val;
                    }
                    else {
                        return  value;//{c: value.c, n: filterSpaces(value.n)};
                    }
                };

                this.updateContact = function(contact){

                    var indexOfContact = _.findIndex(this.businessPartnerDetails.contacts, {id: contact.id});
                    // set the change indicator (unless already set)
                    contact.changeIndicator = contact.changeIndicator || (indexOfContact == -1 ? 'I' : 'U');

                    if (contact.isPrimaryContact) {
                        // this is the primary contact, need to make sure no other contact is the primary contact
                        if (indexOfContact != -1) {
                            this.businessPartnerDetails.contacts[indexOfContact] = contact;
                        }
                        else {
                            this.businessPartnerDetails.contacts.push(contact)
                        }
                    }
                    else {
                        // replace or add the contact (if existing or not)
                        if (indexOfContact != -1) {
                            this.businessPartnerDetails.contacts[indexOfContact] = contact;
                        }
                        else {
                            this.businessPartnerDetails.contacts.push(contact)
                        }
                    }
                };

                $scope.parentRequires = true;

                $scope.isRequired = function() {
                    return $scope.parentRequires;
                };
                $scope.partentform = function(){
                    formController.addTask('authorise-contacts');
                };


                $scope.isMandatoryMsg = function(){
                    return !($scope.parentMandatoryMsg == "No");
                };

                this.cleanup = function() {
                    if (this.emptyLandline()) {
                        this.clearLandline();
                    }
                    if (this.emptyMobile()) {
                        this.clearMobile();
                    }
                };

                this.isMobileValid = function() {

                    $scope.invalidMobile = false;
                    if(this.contact.mobileTelephoneCountry.Code == 'AU') {
                        if (this.contact.mobileTelephoneCountry.number) {
                            var promise = ValidationService.validateMobile(this.contact.mobileTelephoneCountry.number, this.contact.mobileTelephoneCountry.Code);

                            var success = function (result) {
                                $scope.invalidMobile = (_.safeAccess(result, 'status') === "error");
                            };
                            var failure = function (reason) {
                                $scope.invalidMobile = false;
                            };
                            promise.then(success, failure);
                        }
                    }
                };

                this.emptyLandline = function() {
                    return _.isEmpty($scope.newContactDetailsCtrl.contact.telephoneNumberCountry.number);
                };

                this.emptyMobile = function() {
                    return _.isEmpty($scope.newContactDetailsCtrl.contact.mobileTelephoneCountry.number);
                };

                this.clearLandline = function() {
                    //$scope.newContactDetailsCtrl.contact.telephoneNumberCountry.code = "";
                    $scope.newContactDetailsCtrl.contact.telephoneNumberCountry.number = "";
                };

                this.clearMobile = function() {
                    //$scope.newContactDetailsCtrl.contact.mobileTelephoneCountry.code = "";
                    $scope.newContactDetailsCtrl.contact.mobileTelephoneCountry.number = "";
                };

                this.clearMobileCountry = function() {
                   // $scope.contactDetails.mobileTelephoneCountry = "";
                };

                this.noPhoneNumbersPresent = function () {
                    return this.emptyLandline() && this.emptyMobile();
                };
            }],
        controllerAs: 'newContactDetailsCtrl',
        showProgress: true,
        authenticated: true,
        resolve: {
            account: ['formArgs','Session', function (formArgs, Session) {
                return Session.getAccount(formArgs.contractAccountNumber);
            }],
            accountList: ['formArgs','Session', function (formArgs ,Session) {
                return Session.getBPAccountList(formArgs.contractAccountNumber);
            }]
        },
        states:
            [
                {
                    id: 'add-new-contact',
                    title: 'Edit your details',
                    templateUrl: 'app/wizards/manageAuthoriseContactsdetails/add-new-contact.html',
                    controller: ['$scope','Regex', function($scope,Regex) {

                        $scope.emailPattern = function(){
                           return Regex['EMAIL_ADDRESS'];
                        };
                    }],
                    nextMsg: "Save details",
                    disableNext: function($scope) {
                        return $scope.newContactDetailsCtrl.termsAndConditions === false;
                    },
                    checkpoint:true,
                    next: ['$scope', 'Utils',function ($scope, Utils) {
                        var self = this;
                        $scope.newContactDetailsCtrl.contact.dateOfBirth = moment($scope.newContactDetailsCtrl.contact.dateOfBirthYear+"-"+$scope.newContactDetailsCtrl.contact.dateOfBirthMonth+"-"+$scope.newContactDetailsCtrl.contact.dateOfBirthDay,'YYYY-MM-DD');
                        var promise = $scope.newContactDetailsCtrl.updateAuthoriseContactDetails();
                        return Utils.promiseThen(promise, function (result) {
                            return 'success';
                        });
                    }]
                },
                {
                    id: 'success',
                    title: 'Success',
                    checkpoint:true,
                    skip: ['$scope', function($scope) {
                            return $scope.partentform();;
                    }],
                    showNext: false,
                    completed: true,
                    templateUrl: 'app/wizards/manageAuthoriseContactsdetails/myContactDetails-success.html'
                }
            ]
    });
}]);

angular.module('myaccount.wizard').factory('UpdateAuthoriseContactDetailsServer', function ($log, $q, $sce, http, Utils) {
    var UpdateAuthoriseContactDetailsServer = {
        UpdateAuthoriseContactDetails: function (contractAccountNumber,businessPartnerDetails) {
                    // element scope on sy-contact-details hasnt been destroyed so we need to manually sanitise them.
            return http({
                method: 'POST',
                url: '/accountUpdate/' + contractAccountNumber + '/updateAuthorisedContactDetails',
                data: {
                    businessPartner: businessPartnerDetails
                }
            });
        }
    };
    return UpdateAuthoriseContactDetailsServer;
});