angular.module('myaccount.wizard').factory('RebsPricingModel', function () {

    function RebsPricingModel(meterReconfigurationPriceInDollars, meterExchangePhase1PriceInDollars,
                         meterExchangePhase3PriceInDollars, rebsApplicationFeeInDollars, meterIntervalPriceInDollars) {
        this.meterReconfigurationPriceInDollars = meterReconfigurationPriceInDollars;
        this.meterExchangePhase1PriceInDollars = meterExchangePhase1PriceInDollars;
        this.meterExchangePhase3PriceInDollars = meterExchangePhase3PriceInDollars;
        this.rebsApplicationFeeInDollars = rebsApplicationFeeInDollars;
        this.meterIntervalPriceInDollars = meterIntervalPriceInDollars;
    }

    RebsPricingModel.build = function(pricing) {
        return new RebsPricingModel(
            pricing.meterReconfigurationPriceInDollars,
            pricing.meterExchangePhase1PriceInDollars,
            pricing.meterExchangePhase3PriceInDollars,
            pricing.rebsApplicationFeeInDollars,
            pricing.meterIntervalPriceInDollars
        );
    };

    return RebsPricingModel;
});