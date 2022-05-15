angular.module('myaccount.wizard').config(['formRegistryProvider', function (formRegistryProvider) {
    formRegistryProvider.registerForm({
        id: 'synergyAssistPlan',
        title: 'Case management program',
        analytics: {
            formName: 'case management program'
        },
        controller: ['formController', 'caseManagementDetails', '$filter', 'SynergyAssistService', SynergyAssistPlanController],
        controllerAs: 'synergyAssistPlanCtrl',
        authenticated: true,
        resolve: {
            caseManagementDetails: ['$q', 'formArgs', 'Utils', 'SynergyAssistService', function ($q, formArgs, Utils, SynergyAssistService) {
                return SynergyAssistService.getCaseManagementDetails(formArgs.contractAccountNumber);
            }]
        },
        states: [
            {
                id: 'synergy-assist-plan',
                title: 'My Synergy Assist plan',
                templateUrl: 'app/wizards/synergyassist/synergy-assist-plan.html',
                nextMsg: 'Pay now',
                next: ['$scope', function ($scope) {
                    return '^paymentOptions'
                }]
            }
        ]
    })
}
]);

function SynergyAssistPlanController(formController, caseManagementDetails, $filter, SynergyAssistService) {
    var self = this;
    this.debtClearedDate = '';
    var p2pDetails = caseManagementDetails.p2pDetails;
    var synergyAssistDetails = caseManagementDetails.synergyAssistDetails;
    this.upcomingPayments = p2pDetails && p2pDetails.hasP2PInstalment ? p2pDetails.p2pInstalments : [];
    this.instalmentFrequency = p2pDetails && p2pDetails.instalmentFrequency ? p2pDetails.instalmentFrequency : "";
    if (synergyAssistDetails && synergyAssistDetails.caseHeader) {
        SynergyAssistService.initCaseDetails(synergyAssistDetails.caseHeader);
    }
    if (synergyAssistDetails && synergyAssistDetails.paymentDetails) {
        SynergyAssistService.initPaymentDetails(synergyAssistDetails.paymentDetails);
    }
    this.caseDetails = SynergyAssistService.caseDetails;
    this.paymentDetails = SynergyAssistService.paymentDetails;

    this.changePaymentPlan = function () {
        formController.addTask('synergyAssistChangePlan', {
            contractAccountNumber: self.contractAccountNumber
        });
    };

    this.getStatusClass=function(status) {
       return SynergyAssistService.getStatusClass(status);
    };
}
