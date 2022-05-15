
// setup a value for our DeviceMode
angular.module('myaccount.shared.services').value('DeviceMode', {
    type:'handheld',
    android: /Android/i.test(navigator.userAgent)
});


// register with enquire
// IMPORTANT: must match media queries of css
angular.module('myaccount.shared.services').run(['DeviceMode','$log', '$rootScope', function(DeviceMode, $log, $rootScope) {
    $rootScope.DeviceMode = DeviceMode;

    // Should be using Events.DEVICE_CHANGE variable instead of 'device_change' but Events isn't initialised yet.
	enquire.register("(max-width: 767px)", {
		match : function() {
            $log.info('mobile');
            var currentType = DeviceMode.type;
            var newType = 'mobile';
            DeviceMode.type = newType;
            if (currentType !== 'handheld') {
                $rootScope.$broadcast('device_change', newType);
            }
        }
	});
	enquire.register("(min-width: 768px) and (max-width: 1199px)", {
		match : function() {
            $log.info('tablet');
            var currentType = DeviceMode.type;
            var newType = 'tablet';
            DeviceMode.type = 'tablet';
            if (currentType !== 'handheld') {
                $rootScope.$broadcast('device_change', 'tablet');
            }
        }
	});
	enquire.register("(min-width: 1200px)", {
		match : function() {
            $log.info('desktop');
            var currentType = DeviceMode.type;
            var newType = 'desktop';
            DeviceMode.type = newType;
            if (currentType !== 'handheld') {
                $rootScope.$broadcast('device_change', newType);
            }
        }
	});
}]);