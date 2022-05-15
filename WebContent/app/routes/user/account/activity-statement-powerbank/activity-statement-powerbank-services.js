angular.module('myaccount.route').service('activityStatementPowerbankService', function ($filter, HTML5_DATE_FORMAT, activityStatementPowerbankHttpServer, Utils, $state) {
    this.getPowerbankBillingPeriods = function (contractAccNumber) {
        let params= {
            contractAccountNumber:contractAccNumber
        }
        let data = activityStatementPowerbankHttpServer.getPowerbankBillingPeriods(params);
        return data;
    }

    this.getPowerbankChargesData = function (contractAccNumber, selectedbillDate) {
        let params= {
            contractAccountNumber:contractAccNumber,
            billDate:selectedbillDate
        }
        let data = activityStatementPowerbankHttpServer.getPowerbankChargesData(params);
        return data;
    }
});

angular.module('myaccount.route').service('activityStatementPowerbankHttpServer', function ($http, $log, $q, HTML5_DATE_FORMAT, Modals, Utils) {

    this.getPowerbankBillingPeriods = function (queryParams) {
        let deferred = $q.defer();
        let promise = $http({
            method: 'GET',
            url: '/ActivityStatementPowerBank/' + queryParams.contractAccountNumber + '/getPowerbankBillingPeriods',
            params: queryParams
        });

        function success (result) {
            let data = result.data;
            deferred.resolve(data);
        }

        function failure (reason) {
            // $http filter should have caught this and displayed an error dialog
            $log.error('Error loading interval data for: ' + queryParams.contractAccountNumber + ', reason: ' + reason);
            deferred.reject(reason);
        }

        promise.then(success, failure);
        return deferred.promise;
    };
    this.getPowerbankChargesData = function (queryParams) {
        let deferred = $q.defer();
        let promise = $http({
            method: 'GET',
            url: '/ActivityStatementPowerBank/' + queryParams.contractAccountNumber + '/getPowerbankChargesData',
            params: queryParams
        });

         function success (result) {
            let data = result.data;
            deferred.resolve(data);
        }

         function failure (reason) {
            // $http filter should have caught this and displayed an error dialog
            $log.error('Error loading interval data for: ' + queryParams.contractAccountNumber + ', reason: ' + reason);
            deferred.reject(reason);
        }

        promise.then(success, failure);
        return deferred.promise;
    };
});