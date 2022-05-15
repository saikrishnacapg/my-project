
angular.module('myaccount.shared.services').factory('GreenModelsServer', function (http, $q, $log) {
	
	// calculators
	var models = {};
	models.EG = {
		greenProductCode: 'EG',
        title: 'EasyGreen',
        subTitle: 'Pay what you can afford',
        description: "EasyGreen energy allows you to choose a set dollar amount of renewable energy certificates (RECs) to be purchased on your behalf by Synergy.",
        contributionModifier: function (val) {
            return "$" + val;
        },
        units: {
            contributions: {10: 10, 20: 20, 30: 30, 40: 40, 50: 50, 60: 60, 70: 70, 80: 80},
            contributionsMin: 10,
            contributionsMax: 80,
            contributionsValue: '20',
            avgConsumption: 17.3,
            numBillingDays: 62,
            percentage: '37.16',
            tonnes: '2.18',
            houses: '4.46',
            cars: '0.81'
        }
    };
    // Natural power
	models.NP = {
		greenProductCode: 'NP',
        title: 'NaturalPower',
        subTitle: 'Renewable energy',
        description: "NaturalPower allows you to purchase renewable energy certificates, from nationally accredited GreenPower renewable energy sources, equivalent to an agreed amount based on a percentage of your electricity consumption.",
        contributionModifier: function (val) {
            return val + '%';
        },
        units: {
            contributions: {25: 25, 50: 50, 75: 75, 100: 100},
            contributionsMin: 25,
            contributionsMax: 100,
            contributionsValue: '25',
            avgConsumption: 17.3,
            numBillingDays: 62,
            percentage: '25',
            tonnes: '1.47',
            houses: '3.00',
            cars: '0.54'
        }
    };
    // Natural power
	models.EF = {
		greenProductCode: 'EF',
        title: 'EarthFriendly',
        subTitle: 'Offset your emissions',
        description: "EarthFriendly allows you to choose a percentage of your electricity emissions for which an equivalent amount of greenhouse gas emissions will be offset through greenhouse gas reduction programs.",
        contributionModifier: function (val) {
            return val + '%';
        },
        units: {
            contributions: {25: 25, 50: 50, 75: 75, 100: 100},
            contributionsMin: 25,
            contributionsMax: 100,
            contributionsValue: '25',
            avgConsumption: 17.3,
            numBillingDays: 62,
            percentage: '25',
            tonnes: '1.47',
            houses: '3.00',
            cars: '0.54',
            costPerWeek: '0.16',
            costPerBill: '1.45'
        }
    };
	
	var defaultParamsLoaded = false;
        
    function getModels() {
    	
    	if (defaultParamsLoaded) {
    		var copy = angular.copy(models);
    		return $q.when(copy);
    	}
    	else {
	    	var deferred = $q.defer();
	    	
	    	var promise = http({method: 'POST', url: '/greenEnergy/getGreenDefaultParams.json'});
	    	
	    	var success = function(result) {
	            angular.forEach(result.availableSliders, function(v, k){
	                var sid = v.sliderIdentifier;
	                var contributions = [];
	                angular.forEach(v.sliderValues, function(val){
	                    contributions.push(val);
	                });
	                models[sid].units.contributions = contributions;
	                models[sid].units.contributionsMin =  v.sliderValues[0];
	                models[sid].units.contributionsMax = v.sliderValues[v.sliderValues.length-1];
	                models[sid].units.contributionsValue = v.defaultSliderValue;
	                models[sid].units.avgConsumption = result.defaultAverageUnits;
	                models[sid].units.numBillingDays = result.defaultAverageDays;
	
	//                if(v.isDefaultSlider){
	//                    defaultSlider = sid;
	//                    $scope.setGreenProduct(sid);
	//                }
	            });
	            
	            // return a copy
	            var copy = angular.copy(models);
	            deferred.resolve(copy);
	    	};
    	
	    	var failure = function(reason) {
	    		deferred.reject(reason);
	    	};
    	
	    	promise.then(success, failure);
    	
	    	return deferred.promise;
    	}
    }
    

    var GreenModelsServer = {       
    	// all methods return promises
        getGreenModels: getModels,
        // todo cache me
        getDefaultGreenSimulation: function() {
        	return http({
                method: 'POST',
                url: '/greenEnergy/getDefaultGreenSimulation.json'
            });
        },
        calculateGreenValues: function (greenEnergy, greenSimulation) {
            return http({
                method: 'POST',
                url: '/greenEnergy/calculateGreenValues.json',
                data: {
                	greenProductCode: greenEnergy.greenProductCode,
                	greenProductPlanAmount: greenEnergy.greenProductPlanAmount,
                	averageDailyConsumption: greenSimulation.averageDailyConsumption,
                	noOfDays: greenSimulation.noOfDays
                }
            });
        }
    };

    return GreenModelsServer;
});