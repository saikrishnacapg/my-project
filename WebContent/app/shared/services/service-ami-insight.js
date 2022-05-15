angular.module('myaccount.route').service('AmiInsightService', function(http) {
    this.unbilledInsight = {};
    this.billedInsight = {};
    this.intervalDeviceIds = [];
    this.latestBillPeriodEndDate = '';
    this.isSingleDayAmiInsight = false;
    this.startDate="";
    this.endDate="";

    var cachedAmiInsightData = {};
    this.loadAmiInsight = function (contractAccountNumber,urlParams) {
        return  http({
            method: 'POST',
            url: '/ami/' + contractAccountNumber + "/getAmiInsight",
            params: urlParams
        });
    };
    var cachedUnbilledAmounts = {};
    this.getUnbilledAmounts = function (contractAccountNumber) {
        var urlParams = {
            contractAccountNumber: contractAccountNumber,
            installation: "",
            fromDate: "",
            toDate: ""
        };
        if (!angular.isDefined(cachedUnbilledAmounts[contractAccountNumber])) {
            cachedUnbilledAmounts = {};
            return cachedUnbilledAmounts[contractAccountNumber] = http({
                method: 'POST',
                url: '/ami/' + contractAccountNumber + "/getUnbilledAmounts",
                params: urlParams
            });
        }
        return cachedUnbilledAmounts[contractAccountNumber];
    };
})