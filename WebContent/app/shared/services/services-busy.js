angular.module('myaccount.shared.services').factory('Busy', function($log) {
	
	var busyItems = {};
	
	function moreBusy(name) {
		busyItems[name] = angular.isDefined(busyItems[name]) ? busyItems[name]+1 : 1;
	}
	
	function lessBusy(name) {
		if (!angular.isDefined(busyItems[name])) {
			$log.warn('Unexpected call to lessBusy with empty busyItems: ' + name + '=' + busyItems[name]);
		}
		else if (busyItems[name] == 1) {
			delete busyItems[name];
		}
		else {
			busyItems[name] = busyItems[name] - 1;
		}
	}
	
    var Busy = {

        doing: function(name, promise) {
            moreBusy(name);
            promise['finally'](function() {
                lessBusy(name);
            });
            return promise; // for fluent interface
        },
        getDoing: function() {
            return _.keys(busyItems);
        },
        isDoing: function(name) {
            return !!busyItems[name];
        }
    };
    
    return Busy;
});