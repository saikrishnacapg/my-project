/**
 * Extracted this out to a separate file to keep the see and save code lean.
 * All these will end up being re-factored into a cleaner factory implementation for the official release.
 */
angular.module('myaccount.route').factory('SeeAndSaveProviders', function (SeeAndSaveHttpXively, SeeAndSaveHttpHabidapt) {

    var self = this;
    self.providers = {
        xively: SeeAndSaveHttpXively,
        habidapt: SeeAndSaveHttpHabidapt
    }

    var resolve = function(provider){
        return self.providers[provider];
    }

    return {
        resolve: resolve
    };
});