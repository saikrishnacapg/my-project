angular.module('myaccount.shared.services').service('ValidationService', function(http, Regex, $q) {

    this.getContactPhone = function(accountType, padded) {
        if (accountType === 'RESD') {
            return padded ? '13 13 53' : '131353';
        } else {
            return padded ? '13 13 54' :'131354';
        }
    };
    this.getLocalAreaCodes = function() {
        return [
            {id: '', name: "-- Select code --"},
            {id:"02", name : "02 (NSW, ACT)"},
            {id:"03", name : "03 (VIC,TAS)"},
            {id:"07", name : "07 (QLD)"},
            {id:"08", name : "08 (SA,NT,WA)"}
        ];
    };

    this.AUSSIE_INTL_CODE = {countrycode: 'AU', countryname: 'Australia (+61)'};
    this.AUSSIE_AREA_CODES = [
        {id: "08", name: "08 (SA,NT,WA)"},
        {id: "02", name: "02 (NSW, ACT)"},
        {id: "03", name: "03 (VIC,TAS)"},
        {id: "07", name: "07 (QLD)"}
    ];

    this.buildSelectElement = function(internationalAreaCodes, localAreaCodes) {
        var jsonArr = [];
        if (localAreaCodes) {
            _.collect(localAreaCodes, function (areaCode) {
                if (areaCode.id != '') {
                    jsonArr.push({
                        Code: areaCode.id,
                        Name: areaCode.name,
                        Label: 'State'
                    });
                }
            });
        }
        if (internationalAreaCodes) {
            if (localAreaCodes == null) {
                internationalAreaCodes.unshift({countrycode: 'AU', countryname: "Australia (+61)"});
            }
            _.collect(internationalAreaCodes, function (intlCode) {
                if (intlCode.countrycode != '') {
                    jsonArr.push({
                        Code: intlCode.countrycode,
                        Name: intlCode.countryname,
                        Label: 'Country'
                    });
                }
            });
        }
        return jsonArr;
    };
    this.getInternationalTelephoneCodes = function(includeAussie,internationalAreaCodes) {
        var result = _.clone(internationalAreaCodes);
        if (includeAussie) {
            result.unshift(this.AUSSIE_INTL_CODE);
        }
        return result;
    },

    this.getLocalTelephoneCodes = function() {
        return this.AUSSIE_AREA_CODES;
    }
    this.isLocalTelephoneNumber = function(number) {
        return _.isString(number) && number.length >= 2 && !!_.find(this.AUSSIE_AREA_CODES, {id: number.substr(0, 2)});
    };

    this.telephoneNumberDisplay = function(internationalAreaCodes, contactDetails) {
        var countryCode = contactDetails.telephoneNumberCountry;
        var telNumber = contactDetails.telephoneNumber;
        var internationalCode = _.find(internationalAreaCodes, {countrycode: countryCode});
        return _.isEmpty(internationalCode) ? (Regex.MANDATORY_NUMBER.test(countryCode) ? countryCode + telNumber : telNumber) :
            "+ " + internationalCode.countrynumber + " " + telNumber;
    };
    this.mobileNumberDisplay = function(internationalAreaCodes, contactDetails) {
        var internationalCode = _.find(internationalAreaCodes, {countrycode: contactDetails.mobileTelephoneCountry});
        return _.isEmpty(internationalCode) ?  contactDetails.mobileTelephone : "+ " + internationalCode.countrynumber + " " + contactDetails.mobileTelephone;
    };
    this.getInternationalAreaCodes = function() {
        return http({
            method: 'POST',
            url: '/customerValidation/getCountryCodes.json',
            httpCodes: [ 400, 404, 500]
        });
    };
    this.getInternationalAreaCodesWithAU = function() {
        return http({
            method: 'POST',
            url: '/customerValidation/getCountryCodesWithAU.json',
            httpCodes: [ 400, 404, 500]
        });
    };
    this.validateEmail = function(emailAddress) {
        return http({
            method: 'POST',
            url: '/customerValidation/validateEmail.json',
            data: {
                emailAddress: emailAddress
            },
            httpCodes: [ 400, 404, 500],
            maintenance: true
        });
    };
    this.validateMobile = function(number, country) {
        return http({
            method: 'POST',
            url: '/customerValidation/validateMobile.json',
            data: {
                mobileNumber: number,
                countryCode: country
            },
            httpCodes: [ 400, 404,500],
            maintenance: true
        });
    };
    this.loadErrorMessages = function() {
        var deferred = $q.defer();
        var promise = $http({
            method: 'GET',
            url: '/messages/messages.json',
            httpCodes: [ 400, 404,500],
            withCredentials: true
        });
        var success = function(result) {
            deferred.resolve(result.data);
        };
        var failure = function(reason) {
            // $http filter should have caught this and displayed an error dialog
            $log.error('Error loading Error Messages reason : ' + reason);
            deferred.reject(reason);
        };
        promise.then(success, failure);
        return deferred.promise;
    };
});


/**
 * special 'Controller' that manages state and validation for a DateRange modal
 */
angular.module('myaccount.shared.services').service('DateRangeService', function() {
    this.cutoffDate = moment("2009 01 01", "YYYY MM DD");
    this.today = moment().endOf('day');

    this.pastCutoffDate = function(date) {
        if (_.isEmpty(date)) {
            return false;
        }
        return moment(date).isBefore(this.cutoffDate);
    };

    this.startDateAfterEndDate = function(startDate, endDate) {
        if (_.isEmpty(startDate) || _.isEmpty(startDate)) {
            return false;
        }
        return moment(startDate).isAfter(endDate);
    };

    this.overMaxRange = function(startDate, endDate, days) {
        return Math.abs(moment(endDate).diff(moment(startDate), 'days')) > days;
    };
    this.checkMoveInDate = function(startDate, endDate, filter) {
       return moment(filter.start.min).isAfter(startDate);
    };
    this.checkMoveOutDate = function(startDate, endDate, filter) {
        return moment(filter.end.max).isBefore(endDate);
    };
    this.endDateIsInFuture = function(date) {
        return moment(date).isAfter(this.today);
    };
})