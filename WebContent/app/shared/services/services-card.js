angular.module('myaccount.shared.services').service('CardService', function($filter) {

    var current_month = parseInt(moment().format('MM'));
    var current_year = parseInt(moment().format('YY'));

    this.ALL_EXPIRY_MONTHS = _.map(_.range(1, 13),format);
    this.ALL_EXPIRY_YEARS = _.map(_.range(current_year, current_year + 25),format);

    this.CREDIT_CARD_EXPIRY_MONTHS = function(year){
        if (!year  || year > current_year){
            return this.ALL_EXPIRY_MONTHS;
        } else {
            return _.map(_.range(parseInt(current_month) + 1, 13),format);
        }
    };

    this.CREDIT_CARD_EXPIRY_YEARS = function(month) {
        if (!month  || month > current_month){
            return this.ALL_EXPIRY_YEARS;
        } else {
            return _.map(_.range(current_year + 1, current_year + 26),format);
        }
    };


    this.CREDIT_CARD_EXPIRY_MONTHS_INCLUSIVE = function(year){
        if (!year  || year > current_year){
            return this.ALL_EXPIRY_MONTHS;
        } else {
            return _.map(_.range(parseInt(current_month), 13),format);
        }
    };

    this.CREDIT_CARD_EXPIRY_YEARS_INCLUSIVE = function(month) {
        if (!month  || month >= current_month){
            return this.ALL_EXPIRY_YEARS;
        } else {
            return _.map(_.range(current_year + 1, current_year + 26),format);
        }
    };

    this.CREDIT_CARD_EXPIRY_MONTHS_VALIDATE = function(month){
        if (month && ($filter('filter')(this.ALL_EXPIRY_MONTHS, month).length != 0) ){
            return true;
        } else {
            return false;
        }
    };

    this.CREDIT_CARD_EXPIRY_YEARS_VALIDATE = function(month, year) {
        if (month  &&  parseInt(month) < current_month){
            
           if(year  && (($filter('filter')(this.ALL_EXPIRY_YEARS, year)).length == 0 || year == current_year)){
                return false;
            }else {
                return true;
            }
        } else {
            if(!year  || ($filter('filter')(this.ALL_EXPIRY_YEARS, year)).length != 0){
                return true;
            }else{
                return false;
            }
        }
    };

    function format(n){
        return n > 9 ? "" + n: "0" + n;
    }
});