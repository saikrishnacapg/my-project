angular.module('myaccount.route').service('PODFCPFlagService', function (Utils, RebsServer) {
    this.isPodFutureCommunitiesPlan = undefined;
    this.fcpEligibleStatusFlag = ["APPLIED", "ELIGIBLE", "ENABLED"];
    let cachedPodFCPFlag = {};
    this.getPodFCPFlag = function (contractAccountNumber) {
        let self = this;
        if (!angular.isDefined(cachedPodFCPFlag[contractAccountNumber])) {
            cachedPodFCPFlag = {};
            return cachedPodFCPFlag[contractAccountNumber] = RebsServer.getPodFCPFlag(contractAccountNumber);
        }
        return cachedPodFCPFlag[contractAccountNumber];
    };

    this.isFCPEligible = function () {
        return this.fcpEligibleStatusFlag.some((status) => status === this.isPodFutureCommunitiesPlan);
    };
})