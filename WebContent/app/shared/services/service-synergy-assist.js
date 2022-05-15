angular.module('myaccount.shared.services').service('SynergyAssistService', function ($filter, http, $q, Utils) {
    var p2pDetails = [];
    var saDetails = [];
    this.getCaseManagementDetails = function (contractAccountNumber) {
        var promise1 = this.getPromiseToPayDetails(contractAccountNumber);
        var promise2 = this.getSynergyAssistDetails(contractAccountNumber);
        var promisesList = {p2pDetails: promise1, synergyAssistDetails: promise2};
        var promises = $q.all(promisesList);
        return Utils.promiseThen(promises, function (result) {
            return result;
        });
    }

    this.getPromiseToPayDetails = function (contractAccountNumber) {
        if (!angular.isDefined(p2pDetails[contractAccountNumber])) {
            p2pDetails = [];
            p2pDetails[contractAccountNumber] = http({
                method: 'POST',
                url: '/synergyAssist/' + contractAccountNumber + "/getPromiseToPayDetails"
            });
        }
        return p2pDetails[contractAccountNumber];
    }

    this.getSynergyAssistDetails = function (contractAccountNumber) {
        if (!angular.isDefined(saDetails[contractAccountNumber])) {
            saDetails = [];
            saDetails[contractAccountNumber] = http({
                method: 'POST',
                url: '/synergyAssist/' + contractAccountNumber + "/getSynergyAssistDetails"
            });
        }
        return saDetails[contractAccountNumber];
    }

    this.formatContactNumber = function (phone) {
        // Phone is a string with spaces in between, this regex to remove all white spaces in a string.
        return phone.replace(/\s/g, '')
    };
    this.caseDetails = [];
    this.initCaseDetails = function (details) {
        var contactNumber = details.contactNumber ? details.contactNumber : "1800 749 180";
        this.caseDetails = {
            caseManagerName: details.firstName,
            contactNumber: contactNumber,
            formattedContactNumber: this.formatContactNumber(contactNumber),
            planStartDate: details.planStartDate,
            nextReviewDate: details.nextReviewDate,
            contactTime: details.contactTime
        }
    }
    this.paymentDetails = [];
    this.initPaymentDetails = function (details) {
        this.paymentDetails = {
            totalBalance: details.totalBalance,
            customerPayment: Math.abs(details.customerPayment),
            synergyContribution: Math.abs(details.synergyContribution),
            otherCredit: Math.abs(details.otherCredit),
            totalPayment: Math.abs(details.customerPayment) + Math.abs(details.synergyContribution)+ Math.abs(details.otherCredit)
        }
    }
    this.getStatusClass=function(status) {
        if (status) {
            var updatedStatus = status.toLowerCase();
            if (updatedStatus.indexOf("owing") >= 0) {
                updatedStatus = "owing"
            }
            return updatedStatus;
        }
    };

});