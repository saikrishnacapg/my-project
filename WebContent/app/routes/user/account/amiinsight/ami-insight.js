angular.module('myaccount.route').config(function($stateProvider) {

    var resolveInitiateAmiInsightDataLoad = ['$stateParams', '$q', 'account', 'Utils', 'AmiInsightService','HTML5_DATE_FORMAT', function ($stateParams, $q, account, Utils, AmiInsightService, HTML5_DATE_FORMAT) {

        var fromDate = moment(AmiInsightService.startDate).format(HTML5_DATE_FORMAT);
        var toDate = moment(AmiInsightService.endDate).format(HTML5_DATE_FORMAT);
        var dateDiffernece = moment(toDate).diff(moment(fromDate), 'days');
        AmiInsightService.dateDiffernece = dateDiffernece;
        var urlParams = {
            contractAccountNumber: account.contractAccountNumber,
            fromDate: fromDate,
            toDate: toDate,
            lastBilledDate: AmiInsightService.latestBillPeriodEndDate,
            dateRangeView: dateDiffernece == 0 ? true : false
        };
        return Utils.promiseThen(AmiInsightService.loadAmiInsight(account.contractAccountNumber, urlParams), function (result) {
            return result;
        });
    }];


    $stateProvider.state('user.account.usage.amiinsight', {
        views: {
            'amiInsight': {
                templateUrl: "app/routes/user/account/amiinsight/ami-insight.html",
                controller: "AmiInsightController",
                controllerAs: "amiCtrl",

            }
        },
       resolve: {
            initiateAmiInsightDataLoad: resolveInitiateAmiInsightDataLoad
      }
    });

});

angular.module('myaccount.route').
 controller('AmiInsightController',['$scope', 'AmiInsightService', 'HTML5_DATE_FORMAT', 'UsageCtrlService','initiateAmiInsightDataLoad','$rootScope',
    function($scope, AmiInsightService, HTML5_DATE_FORMAT, UsageCtrlService,initiateAmiInsightDataLoad,$rootScope) {
    var self = this;
    self.billedDataAvailable = false;
    self.unbilledDataAvailable = false;
    self.amiDataLoaded = false;

    this.checkDataAvailability = function () {
        if (AmiInsightService.unbilledInsight && !AmiInsightService.unbilledInsight.hasValidationError) {
            self.unbilledDataAvailable = true;
        }
        if (AmiInsightService.billedInsight && !AmiInsightService.billedInsight.hasValidationError) {
            self.billedDataAvailable = true;
        }
    };

    if (initiateAmiInsightDataLoad) {
        AmiInsightService.unbilledInsight = initiateAmiInsightDataLoad.unbilledInsight;
        AmiInsightService.billedInsight = initiateAmiInsightDataLoad.billedInsight;
        self.amiDataLoaded = true;
        $rootScope.dailyUsageCost = initiateAmiInsightDataLoad.amount;
        self.checkDataAvailability();
        self.isSingleDayAmiInsight = AmiInsightService.dateDiffernece == 0 ? true : false;
    }
}]);