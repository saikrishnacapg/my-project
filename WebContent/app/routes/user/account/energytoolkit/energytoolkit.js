angular.module('myaccount.route').config(function($stateProvider) {

    var resolveTips = ['$stateParams','Session','TipServer','account',function($stateParams, Session, TipServer, account) {
        return TipServer.getTips(account.contractAccountNumber);
    }];

    var resolveTipCategories = ['EnergyProfileServer',function(EnergyProfileServer) {
    	return EnergyProfileServer.getAllCategories();
    }];

	$stateProvider.state('user.account.energytoolbox', {
		url: 'toolbox',
        templateUrl: "app/routes/user/account/energytoolkit/energytoolkit.html",
        controller: "EnergyToolboxCtrl", // note was using accountCtrl!!
        controllerAs: "energyCtrl",
        resolve: {tips: resolveTips, categories: resolveTipCategories}
    });
});

angular.module('myaccount.route').controller('EnergyToolboxCtrl', function ($scope, $q, $log, $state, $filter, $timeout, $window, account, tips, categories, Session, Events, Utils, TipServer, Router, Wizards, Busy, Modals) {
	var self = this;

    this.currentAccountNumber = account.contractAccountNumber;
    this.contractAccountType = account.contractAccountType;

    this.tips = tips || [];
    this.filterType = {label: "Show all", value: ""};
    this.filterStatus = {label: "Show all", value: ""};
    this.filterSort = {label: "Most Relevant", value: "score"};
    this.tipStatuses = [{"value":"new","label":"<span class='sy-icon--more'></span> New"},
                        {"value":"doing","label":"<span class='sy-icon--refresh'></span> Doing it"},
                        {"value":"done","label":"<span class='sy-icon--ok_2'></span> Done"},
                        {"value":"todo","label":"<span class='sy-icon--dislikes'></span> To do"}, 
                        {"value":"dismiss","label":"<span class='sy-icon--remove_2'></span> Dismiss"}];

    this.tipCategories = [{"text": "Show all", "click": ""}];

    self.tipCategories.push({"text": 'Show All', "click": "energyCtrl.selectType('Show All', '')"});
    _.forEach(categories.tipCategories, function(category) {
        self.tipCategories.push({"text": category.name, "click": "energyCtrl.selectType('"+category.name+"', '"+category.id+"')"});
    });


    this.maxTips = 20;
    this.showFilter = false;

    this.tipFilter = function(tip, index) {

        // match for dismiss status

        if(self.filterStatus.value == "dismiss" && tip.status == "dismiss") {
            return true;
        }

        if(self.filterStatus.value != "dismiss" && tip.status == "dismiss") {
            return false;
        } 

    	if (self.filterType.value && !_.contains(tip.categories, self.filterType.value)) {
            return false;
    	}

    	if (self.filterStatus.value && tip.status != self.filterStatus.value) {
    		return false;
    	}

    	return true;
    };

    this.toggleFilter = function() {
        this.showFilter = ! this.showFilter;
    };

    this.getMoreTips = function() {
    	this.maxTips += 5;
    };

    this.statusUpdated = function(tip) {
    	var promise = TipServer.updateTipStatus(account.contractAccountNumber, tip.id, tip.status);
    	promise.then(function(result) {
    		tip.popularity = result.popularity;
    	});
    };

    this.selectType = function(label, value) {
        this.filterType = {label: label, value: value};
    };

    this.selectStatus = function(label, value) {
        this.filterStatus = {label: label, value: value};
    };

    this.tipsPdfUrl = function() {
        return TipServer.getDownloadUrl(account.contractAccountNumber);
    };

    this.emailPdf = function() {
        alert('email');
    };

    this.emailPdf = function() {
        var promise = TipServer.emailPdf(account.contractAccountNumber);
        promise.then(function(result) {
        	Modals.showAlert('Success', $rootScope.messages["MA_H7"]+ result.sentTo);
        });
    };
    
    this.showInfo = function() {
		Modals.showAlert('Your Tips', 
	    	'<p>'+$rootScope.messages["MA_H8"]+'</p>' +
	    	'<h3><span class="tip-key__icon sy-icon--parents"></span> Popularity</h3>' +
	    	'<p>'+$rootScope.messages["MA_H20"]+'</p>');
    };

});

angular.module('myaccount.route').factory('TipServer', function ($log, $q, $sce, http, MyAccountServer) {

    var TipServer = {
        updateTipStatus: function(contractAccountNumber, tipId, status) {
            return http({
                method: 'POST',
                url: '/energyProfile/' + contractAccountNumber + '/updateTipStatus.json',
                data: {
                	tipId: tipId,
                	status: status
                }
            });
        },
        getDownloadUrl: function(contractAccountNumber) {
        	return MyAccountServer + '/energyProfile/' + contractAccountNumber + '/downloadPdf.pdf';
        },
        emailPdf: function(contractAccountNumber) {
        	return http({
	            method: 'POST',
	            url: '/energyProfile/' + contractAccountNumber + '/emailPdf.json',
	        });
        },
        getTips: function(contractAccountNumber) {
        	return http({
	            method: 'POST',
	            url: '/energyProfile/' + contractAccountNumber + '/getTips.json',
	        });
        }

    };

    return TipServer;

});
