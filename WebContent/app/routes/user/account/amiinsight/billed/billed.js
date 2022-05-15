angular.module('myaccount.route').controller('BilledCtrl', function(AmiInsightService, Utils) {
    var self = this;
    this.billedConsumptionDetails = [];
    this.isMultipleHighConsumptionDays = false;
    this.isMultipleHighConsumptionHrs = false;
    this.isMultipleLowConsumptionDays = false;
    this.isMultipleLowConsumptionHrs = false;
    this.isSubstitueData = true;
    this.hasValidationError = false;
    this.errorMessage = "";

    this.loadBilledInsight = function () {
        var result = AmiInsightService.billedInsight;
        if (result) {
            self.billedConsumptionDetails = result.billedConsumptionDetails;
            self.isMultipleHighConsumptionDays = result.isMultipleHighConsumptionDays;
            self.isMultipleHighConsumptionHrs = result.isMultipleHighConsumptionHrs;
            self.isMultipleLowConsumptionDays = result.isMultipleLowConsumptionDays;
            self.isMultipleLowConsumptionHrs = result.isMultipleLowConsumptionHrs;
            self.isSubstitueData = result.isSubstitueData;
            self.hasValidationError = result.hasValidationError;
            self.errorMessage = Utils.capitalizeCamelCase(result.errorMessage);
        }
    };
    this.isSubstitueDataPresent = function () {
        return self.isSubstitueData;
    };
    this.isMultipleHighConsumption = function () {
        if (self.isSubstitueDataPresent()) {
            return false;
        }
        return self.isMultipleHighConsumptionDays || self.isMultipleHighConsumptionHrs;
    };
    this.isMultipleLowConsumption = function () {
        if (self.isMultipleHighConsumption() || self.isSubstitueDataPresent()) {
            return false;
        }
        return self.isMultipleLowConsumptionDays || self.isMultipleLowConsumptionHrs;
    };

    this.showBilledInsight = function () {
        return !(self.isMultipleHighConsumption() || self.isMultipleLowConsumption() || self.isSubstitueDataPresent());
    };
    this.loadBilledInsight();
})