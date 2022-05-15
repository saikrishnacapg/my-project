angular.module('myaccount.wizard').config(['formRegistryProvider', function(formRegistryProvider) {
    formRegistryProvider.registerForm({
        id: 'concession-status',
        title: 'Concessions',
        analytics: {
            formName: 'Concessions'
        },
        controller: ['account', 'Utils', 'formController', 'Session','ConcessionCardsServer', 'formArgs',
            function(account, Utils, formController, Session, ConcessionCardsServer, formArgs) {
                var self = this;
                this.account = account;
                this.isLoggedIn = Session.isLoggedIn();

                this.contract = {}; // Used for passing to registration in unathenticated version

                this.disableEdit = function() {
                    return !this.account.concessionDetails.canEditDependents || !this.currentAccountCards.length;
                };

                this.editDependents = function() {
                    formController.addTask('concession-editdependents');
                };

                this.expireCard = function (cardNumber) {
                    formController.addTask('concession-expirecard', {cardNumber: cardNumber});
                };

                this.reactivateCard = function (cardNumber) {
                    formController.addTask('concession-reactivatecard', {cardNumber: cardNumber});
                };
                this.updateCardName  = function (cardNumber) {
                    formController.addTask('concession-updatecardowner', {cardNumber: cardNumber});
                };

                this.formArgs = formArgs;

                if (this.isLoggedIn) {
                    this.cardsByAccount = _.groupBy(this.account.concessionDetails.cards, function (card) {
                        return card.account
                    })
                    this.currentAccountCards = _.chain(this.cardsByAccount).filter(function (cards, account) {
                        return account == self.account.contractAccountNumber
                    }).flatten().value();
                    this.otherAccountsCards = _.chain(this.cardsByAccount).filter(function (cards, account) {
                        return !(_.isEmpty(account) || account === 'null') && account !== self.account.contractAccountNumber
                    }).flatten().value();
                    this.noAccountCards = _.chain(this.cardsByAccount).filter(function (cards, account) {
                        return _.isEmpty(account) || account === 'null'
                    }).flatten().value()
                }
            }],
        controllerAs: 'ccCtrl',
        showProgress: false,
        authenticated: false,
        resolve: {
            account: ['formArgs','Session', function (formArgs, Session) {
                //     return Session.getAccount(formArgs.contractAccountNumber);
                return formArgs.contractAccountNumber ? Session.getAccount(formArgs.contractAccountNumber) : {};
            }]

        },
        states:
            [
                {
                    id: 'skipaccountauth',
                    skip: ['$scope', function($scope) {
                        return $scope.ccCtrl.isLoggedIn ? 'status' : 'accountauth';
                    }]
                },
                {
                    subflow: {
                        id: 'accountauth',
                        inject: function($scope) {
                            return {
                                processId: 'concessions',
                                credentials: $scope.ccCtrl.contract
                            }
                        },
                        next: ['$scope', 'ConcessionCardsServer', 'Utils', 'Session', function($scope, ConcessionCardsServer, Utils, Session) {
                            if (!$scope.ccCtrl.isLoggedIn) {
                                $scope.ccCtrl.account = {
                                    contractAccountNumber: $scope.ccCtrl.contract.contractAccountNumber.toString().toCAN()

                                };
                                $scope.ccCtrl.formArgs.contractAccountNumber = $scope.ccCtrl.contract.contractAccountNumber.toString().toCAN();
                                $scope.authAccount = $scope.ccCtrl.contract.contractAccountNumber.toString().toCAN();
                                Session.account = $scope.ccCtrl.account;
                                var promise = ConcessionCardsServer.getAccountDetails($scope.ccCtrl.contract.contractAccountNumber.toString().toCAN());
                                Utils.promiseThen(promise, function(result) {
                                    $scope.ccCtrl.account.premiseAddress = result.premise ;
                                });
                                var  promise1 = ConcessionCardsServer.getConcessionDetails($scope.ccCtrl.contract.contractAccountNumber.toString().toCAN());
                                return Utils.promiseThen(promise1, function(result) {

                                    $scope.ccCtrl.account.concessionDetails = result.resp ;
                                    $scope.ccCtrl.formArgs.account = $scope.ccCtrl.account;
                                    $scope.ccCtrl.disableEdit = function() {
                                        return !$scope.ccCtrl.account.concessionDetails.canEditDependents || !$scope.ccCtrl.currentAccountCards.length;
                                    };

                                    $scope.ccCtrl.cardsByAccount = _.groupBy($scope.ccCtrl.account.concessionDetails.cards, function (card) {
                                        return card.account
                                    })
                                    $scope.ccCtrl.currentAccountCards = _.chain($scope.ccCtrl.cardsByAccount).filter(function (cards, account) {
                                        return account == $scope.ccCtrl.account.contractAccountNumber
                                    }).flatten().value();
                                    $scope.ccCtrl.otherAccountsCards = _.chain($scope.ccCtrl.cardsByAccount).filter(function (cards, account) {
                                        return !(_.isEmpty(account) || account === 'null') && account !== $scope.ccCtrl.account.contractAccountNumber
                                    }).flatten().value();
                                    $scope.ccCtrl.noAccountCards = _.chain($scope.ccCtrl.cardsByAccount).filter(function (cards, account) {
                                        return _.isEmpty(account) || account === 'null'
                                    }).flatten().value()
                                    return 'status';
                                });

                            }
                            return true;
                        }]
                    }
                },
                {
                    id: 'status',
                    title: 'Status',
                    templateUrl: 'app/wizards/concessioncards/concessioncards-status.html',
                    nextMsg:'Add Card',
                    next: '^concession-addcard'
                }
            ]
    });

    formRegistryProvider.registerForm({
        id: 'concession-expirecard',
        title: 'Concessions',
        analytics: {
            formName: 'Concessions'
        },
        controller: ['account', 'formArgs', 'ConcessionCardsServer',
            function(account, formArgs, ConcessionCardsServer) {
                var self = this;
                this.account = account;
                this.analyticsFlag = true;
                this.selectedCard = _.find(this.account.concessionDetails.cards, function (card) { return card.cardNumber == formArgs.cardNumber} );

                this.effectiveFrom = moment();

                this.expireCard = function (cardNumber) {
                    return ConcessionCardsServer.expireConcessionCard( this.account.contractAccountNumber, this.selectedCard.cardNumber, this.account.premiseAddress.label);
                };
                this.analyticsSend = function () {
                    if(this.analyticsFlag){
                        this.analyticsFlag = false;
                    }

                    return true;

                };
            }],
        controllerAs: 'ccCtrl',
        showProgress: false,
        authenticated: true,
        resolve: {
            account: ['formArgs','Session', function (formArgs, Session) {
                return Session.isLoggedIn() ? Session.getAccount(formArgs.contractAccountNumber) : formArgs.account;
            }]
        },
        states:
            [
                {
                    id: 'confirm-expire',
                    title: 'Concessions',
                    templateUrl: 'app/wizards/concessioncards/concessioncards-confirm-expire.html',
                    nextMsg:'Confirm',
                    next: ['$scope', 'Utils', function($scope, Utils) {
                        var promise = $scope.ccCtrl.expireCard();
                        vocvirtualurlsurvey('/ma/concession-status/success-expire');
                        return Utils.promiseThen(promise, 'success-expire');
                    }]
                },
                {
                    id: 'success-expire',
                    title: 'Success',
                    completed: true,
                    templateUrl: 'app/wizards/concessioncards/concessioncards-success-expire.html'
                }
            ]
    });

    //reactivate

    formRegistryProvider.registerForm({
        id: 'concession-reactivatecard',
        title: 'Concessions',
        analytics: {
            formName: 'Concessions'
        },
        controller: ['account', 'formArgs', 'ConcessionCardsServer', 'Utils',
            function(account, formArgs, ConcessionCardsServer, Utils) {
                var self = this;
                this.account = account;
                this.selectedCard = _.find(this.account.concessionDetails.cards, function (card) { return card.cardNumber == formArgs.cardNumber; } );
                this.newCard = this.selectedCard;
                this.newCard.termsAccepted = undefined;
                this.newCard.termsAccepted2 = undefined;
                this.analyticsFlag = true;

                this.newConcessionDetails = angular.copy(this.account.concessionDetails);

                this.dependentsList = _.filter(_.range(0, 31), function (n) {return n >= self.newConcessionDetails.noOfDependents} ) ;


                this.allTermsAccepted = function() {
                    return this.newCard.termsAccepted && this.newCard.termsAccepted2;
                };

                this.canEditDependents = function() {
                    return this.newCard.cardTypeHasDependents;
                };

                this.cardDisplayName = function() {
                    return this.newCard.cardIssuer + ' ' +  this.newCard.cardTypeText;
                };


                this.reactivateCard = function () {
                    var promise = ConcessionCardsServer.reactivateConcessionCard(
                        this.account.contractAccountNumber,
                        this.selectedCard.cardNumber,
                        this.newCard.firstName,
                        this.newCard.lastName,
                        this.newConcessionDetails.noOfDependents);
                    return Utils.promiseThen(promise, function(result) {
                        self.effectiveFrom = moment(result.effectiveFrom);
                    });
                };
                this.analyticsSend = function () {
                    if(this.analyticsFlag){
                        this.analyticsFlag = false;
                    }
                    return true;

                };
            }],
        controllerAs: 'ccCtrl',
        showProgress: false,
        authenticated: true,
        resolve: {
            account: ['formArgs','Session', function (formArgs, Session) {
                return Session.isLoggedIn() ? Session.getAccount(formArgs.contractAccountNumber) : formArgs.account;
            }]
        },
        states:
            [
                {
                    id: 'editdependents',
                    title: 'Add dependents?',
                    skip: ['$scope', function($scope) {
                        return !$scope.ccCtrl.canEditDependents();
                    }],
                    checkpoint: true,
                    templateUrl: 'app/wizards/concessioncards/concessioncards-dependents.html'
                },
                {
                    id: 'cardowner',
                    title: 'Card Owner',
                    checkpoint: true,
                    templateUrl: 'app/wizards/concessioncards/concessioncards-add-owner.html'
                },
                {
                    id: 'confirm-reactivate',
                    title: 'Confirm details',
                    checkpoint: true,
                    templateUrl: 'app/wizards/concessioncards/concessioncards-confirm-reactivate.html',
                    disableNext: function($scope) {
                        return !$scope.ccCtrl.allTermsAccepted();
                    },
                    nextMsg: 'Confirm',
                    next: ['$scope', 'Utils', function($scope, Utils) {
                        var promise = $scope.ccCtrl.reactivateCard();
                        vocvirtualurlsurvey('/ma/concession-status/success-reactivate');
                        return Utils.promiseThen(promise, 'success-reactivate');
                    }]
                },
                {
                    id: 'success-reactivate',
                    title: 'Success',
                    completed: true,
                    templateUrl: 'app/wizards/concessioncards/concessioncards-success-reactivate.html'
                }
            ]
    });


    //add owner


    formRegistryProvider.registerForm({
        id: 'concession-updatecardowner',
        title: 'Concessions',
        analytics: {
            formName: 'Concessions'
        },
        controller: ['account', 'formArgs', 'ConcessionCardsServer',
            function(account, formArgs, ConcessionCardsServer) {
                var self = this;
                this.account = account;
                this.selectedCard = _.find(this.account.concessionDetails.cards, function (card) { return card.cardNumber == formArgs.cardNumber} );
                this.newCard = this.selectedCard;
                this.newCard.termsAccepted = undefined;
                this.newCard.termsAccepted2 = undefined;
                this.analyticsFlag = true;
                this.allTermsAccepted = function() {
                    return this.newCard.termsAccepted && this.newCard.termsAccepted2;
                };

                this.cardDisplayName = function() {
                    return this.newCard.cardIssuer + ' ' +  this.newCard.cardTypeText;
                };

                this.updateOwner = function () {
                    return ConcessionCardsServer.updateConcessionCardOwner( this.account.contractAccountNumber, this.selectedCard.cardNumber, this.newCard.firstName, this.newCard.lastName);
                };
                this.analyticsSend = function () {
                    if(this.analyticsFlag){
                        this.analyticsFlag = false;
                    }
                    return true;

                };
            }],
        controllerAs: 'ccCtrl',
        showProgress: false,
        authenticated: true,
        resolve: {
            account: ['formArgs','Session', function (formArgs, Session) {
                return Session.isLoggedIn() ? Session.getAccount(formArgs.contractAccountNumber) : formArgs.account;
            }]
        },
        states:
            [
                {
                    id: 'cardowner',
                    title: 'Card Owner',
                    checkpoint: true,
                    templateUrl: 'app/wizards/concessioncards/concessioncards-add-owner.html'
                },
                {
                    id: 'confirm-reactivate',
                    title: 'Confirm details',
                    checkpoint: true,
                    templateUrl: 'app/wizards/concessioncards/concessioncards-confirm-updateowner.html',
                    disableNext: function($scope) {
                        return !$scope.ccCtrl.allTermsAccepted();
                    },
                    nextMsg: 'Confirm',
                    next: ['$scope', 'Utils', function($scope, Utils) {
                        var promise = $scope.ccCtrl.updateOwner();
                        vocvirtualurlsurvey('/ma/concession-status/success-updateowner');
                        return Utils.promiseThen(promise, 'success-updateowner').then(function(wasSuccessful) {
                            if (wasSuccessful) {
                                Utils.setGoal('Goal_Concession_Card_Added');
                            }
                        });
                    }]
                },
                {
                    id: 'success-updateowner',
                    title: 'Success',
                    completed: true,
                    templateUrl: 'app/wizards/concessioncards/concessioncards-success-updateowner.html'
                }
            ]
    });

    formRegistryProvider.registerForm({
        id: 'concession-addcard',
        title: 'Concessions',
        analytics: {
            formName: 'Concessions'
        },
        controller: ['account', 'concessionCardTypes', 'ConcessionCardsServer', 'Utils',
            function(account, concessionCardTypes, ConcessionCardsServer, Utils) {
                var self = this;
                this.account = account;
                this.concessionCardTypes = concessionCardTypes;
                this.analyticsFlag = true;
                this.newConcessionDetails = angular.copy(this.account.concessionDetails);
                this.dependentsList = _.filter(_.range(0, 31), function (n) {return n >= self.newConcessionDetails.noOfDependents} ) ;

                this.newCard = {
                    cardType: undefined,
                    cardNumber: undefined,
                    firstName: account.concessionDetails.firstName,
                    lastName: account.concessionDetails.lastName,
                    termsAccepted: undefined,
                    termsAccepted2: undefined
                };

                this.allTermsAccepted = function() {
                    return this.newCard.termsAccepted && this.newCard.termsAccepted2;
                };

                this.validateConcessionCard = function() {
                    this.newCard.cardNumber = this.newCard.cardNumber.toUpperCase().replace('CRN','');
                    this.newCard.cardNumber = this.newCard.cardNumber.replace(/[-\s+]/g,'');
                    return ConcessionCardsServer.validateConcessionCard(
                        this.account.contractAccountNumber,
                        this.newCard.cardType,
                        this.newCard.cardNumber);
                };

                this.addConcessionCard = function () {
                    var promise = ConcessionCardsServer.addConcessionCard(
                        this.account.contractAccountNumber,
                        this.newCard.cardType,
                        this.newCard.cardNumber,
                        this.newCard.firstName,
                        this.newCard.lastName,
                        this.canEditDependents() ? this.newConcessionDetails.noOfDependents : undefined);
                    return Utils.promiseThen(promise, function(result) {
                        self.effectiveFrom = moment(result.effectiveFrom);
                    });
                };

                this.cardDisplayName = function() {
                    var cardTypes = _.pluck(this.concessionCardTypes, 'cardTypes');
                    var selectedCard = _.where(_.flatten(cardTypes), {code: this.newCard.cardType});
                    return selectedCard ? selectedCard[0].name : this.newCard.cardType;
                };

                this.canEditDependents = function() {
                    var cardTypes = _.pluck(this.concessionCardTypes, 'cardTypes');
                    var selectedCard = _.findWhere(_.flatten(cardTypes), {code: this.newCard.cardType});
                    return selectedCard.dependents;
                };
                this.analyticsSend = function () {
                    if(this.analyticsFlag){
                        this.analyticsFlag = false;
                    }
                    return true;

                };
            }],
        controllerAs: 'ccCtrl',
        showProgress: true,
        authenticated: true,
        resolve: {
            account: ['formArgs','Session', function (formArgs, Session) {
                console.log(formArgs);
                return Session.isLoggedIn() ? Session.getAccount(formArgs.contractAccountNumber) : formArgs.account;// ? Session.getAccount(formArgs.contractAccountNumber);
            }],
            concessionCardTypes: ['ConcessionCardsServer', function (ConcessionCardsServer) {
                return ConcessionCardsServer.getConcessionCardTypes();
            }]
        },
        states:
            [
                {
                    id: 'beforebegin',
                    title: 'Before you begin',
                    progress: false,
                    templateUrl: 'app/wizards/concessioncards/concessioncards-before-you-begin.html',
                    nextMsg: "Add a concession card"
                },
                {
                    id: 'add',
                    title: 'Add concession card',
                    checkpoint: true,
                    templateUrl: 'app/wizards/concessioncards/concessioncards-add.html',
                    next: ['$scope', 'Utils', function($scope, Utils) {
                        var promise = $scope.ccCtrl.validateConcessionCard();
                        return Utils.promiseThen(promise, 'cardowner');
                    }]
                },
                {
                    id: 'cardowner',
                    title: 'Card Owner',
                    checkpoint: true,
                    templateUrl: 'app/wizards/concessioncards/concessioncards-add-owner.html',
                    next: ['$scope', 'Utils', function($scope, Utils) {
                        return $scope.ccCtrl.canEditDependents() ? 'editdependents' : 'confirm' ;
                    }]
                },
                {
                    id: 'editdependents',
                    title: 'Add dependents?',
                    checkpoint: true,
                    templateUrl: 'app/wizards/concessioncards/concessioncards-dependents.html'
                },
                {
                    id: 'confirm',
                    title: 'Confirm details',
                    checkpoint: true,
                    templateUrl: 'app/wizards/concessioncards/concessioncards-confirm.html',
                    disableNext: function($scope) {
                        return !$scope.ccCtrl.allTermsAccepted();
                    },
                    nextMsg: 'Confirm',
                    next: ['$scope', 'Utils', function($scope, Utils) {
                        var promise = $scope.ccCtrl.addConcessionCard();
                        vocvirtualurlsurvey('/ma/concession-status/success');
                        return Utils.promiseThen(promise, 'success').then(function(wasSuccessful) {
                            if (wasSuccessful) {
                                Utils.setGoal('Goal_Concession_Card_Added');
                            }
                        });
                    }]
                },
                {
                    id: 'success',
                    title: 'Success',
                    completed: true,
                    templateUrl: 'app/wizards/concessioncards/concessioncards-success.html'
                }
            ]
    });

    formRegistryProvider.registerForm({
        id: 'concession-editdependents',
        title: 'Concessions',
        analytics: {
            formName: 'Concessions'
        },
        controller: ['account', 'ConcessionCardsServer', 'Utils',
            function(account, ConcessionCardsServer, Utils) {
                var self = this;
                this.account = account;
                this.analyticsFlag = true;
                this.newConcessionDetails = angular.copy(this.account.concessionDetails);
                this.dependentsList = _.filter(_.range(0, 31), function (n) {return n >= self.newConcessionDetails.noOfDependents} ) ;


                this.updateDependents = function() {
                    var promise = ConcessionCardsServer.updateNumberOfDependents(this.account.contractAccountNumber, this.newConcessionDetails.noOfDependents);
                    return Utils.promiseThen(promise, function(result) {
                        Utils.setGoal('Goal_Update_Concession_Card');
                        self.effectiveFrom = moment(result.effectiveFrom);
                    });
                };
                this.analyticsSend = function () {
                    if(this.analyticsFlag){
                        this.analyticsFlag = false;
                    }
                    return true;

                };
            }],
        controllerAs: 'ccCtrl',
        showProgress: true,
        authenticated: true,
        resolve: {
            account: ['formArgs','Session', function (formArgs, Session) {
                return Session.isLoggedIn() ? Session.getAccount(formArgs.contractAccountNumber) : formArgs.account;
            }]
        },
        states:
            [
                {
                    id: 'dependents',
                    title: 'Update dependents',
                    checkpoint: true,
                    templateUrl: 'app/wizards/concessioncards/concessioncards-dependents.html',
                    disableNext: function($scope) {
                        return angular.equals($scope.ccCtrl.newConcessionDetails, $scope.ccCtrl.account.concessionDetails)
                    }
                },
                {
                    id: 'confirm-edit',
                    title: 'Confirm details',
                    checkpoint: true,
                    templateUrl: 'app/wizards/concessioncards/concessioncards-dependents-confirm.html',
                    nextMsg: 'Submit',
                    next: ['$scope', 'Utils', function($scope, Utils) {
                        var promise = $scope.ccCtrl.updateDependents();
                        vocvirtualurlsurvey('/ma/concession-status/edited');
                        return Utils.promiseThen(promise, 'edited');
                    }]
                },
                {
                    id: 'edited',
                    title: 'Success',
                    completed: true,
                    templateUrl: 'app/wizards/concessioncards/concessioncards-edited.html'
                }
            ]
    });
}]);