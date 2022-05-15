angular.module('myaccount.route').controller('AmiAcSummaryCtrl', function($scope, AmiInsightService) {
    var self = this;
    self.account = $scope.accountCtrl.currentAccount;
    self.contractAccountNumber = self.account.contractAccountNumber;
    self.isActiveAccount = self.account.active;
    self.isSubstitueData = false;
    self.isUnbilledAmountAvailable = false;
    self.totalUnbilledAmount = "";
    self.highestConsumptionAmount = "";
    self.lowestConsumptionAmount = "";
    self.averageConsumptionAmount = "";
    self.barHeight = {};
    self.fixedHeightValue=16

    AmiInsightService.getUnbilledAmounts(self.contractAccountNumber).then(function (result) {
        self.isUnbilledAmountAvailable = result.isDataAvailable;
        self.showChart = true;
        if (self.isUnbilledAmountAvailable){
            self.totalUnbilledAmount = result.totalAmount;
            self.highestConsumptionAmount = result.highestConsumptionAmount;
            self.lowestConsumptionAmount = result.lowestConsumptionAmount;
            self.averageConsumptionAmount = result.averageConsumptionAmount;
            self.isSubstitueData = result.isSubstitueData;
            if (self.highestConsumptionAmount){
                self.barHeight = calculcateBarHeight();
            }
        }
    });

    self.isActiveAcWithUnbilledAmounts = function() {
        return self.isActiveAccount && self.isUnbilledAmountAvailable && !self.isSubstitueData;
    }

    self.isActiveAcWithSubstituteData = function() {
        return self.isActiveAccount && self.isSubstitueData;
    }

    self.isActiveAcWithNoUnbilledAmounts = function(){
        return self.isActiveAccount && !self.isUnbilledAmountAvailable;
    }

    function convertStrToFloat(amount){
        // reg exp to replace unwanted chars
        var strToFloat = amount.replace(/[^0-9.-]+/g,"");
        // Converting string to float
        return parseFloat(strToFloat);

    }

    function valueInPercentage(value) {
        return value + "%";
    }

    self.removePercentage=function(value) {
        let numb;
        if (value && typeof value === 'string') {
            numb = convertStrToFloat(value.replace("%", ''));
        }
        return numb;
    }

    function getArrayOfUnbilledAmounts(){
        var chartAmounts = [];
        chartAmounts.push(
            convertStrToFloat(self.lowestConsumptionAmount),
            convertStrToFloat(self.averageConsumptionAmount),
            convertStrToFloat(self.highestConsumptionAmount));
        return chartAmounts;
    }

    function calculcateBarHeight(){
        var unBilledAmounts = getArrayOfUnbilledAmounts();
        var highestValue = _.max(unBilledAmounts);
        var low = (
            (convertStrToFloat(self.lowestConsumptionAmount) / highestValue)*100).toFixed(2);
        var avg = (
            (convertStrToFloat(self.averageConsumptionAmount) / highestValue)*100).toFixed(2);
        var high = (
            (convertStrToFloat(self.highestConsumptionAmount) / highestValue)*100).toFixed(2);

        return {
            lowest : valueInPercentage(low),
            average : valueInPercentage(avg),
            highest : valueInPercentage(high)
        };
    }
});
