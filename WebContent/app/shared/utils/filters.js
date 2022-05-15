
/*
 * Use these these dependency for Jest unit test.
 * So we will remove that dependency when we make the build for local and servers.
 * */

//RemoveIf(removeDevCode)
var _ = require('lodash-compat');
//EndRemoveIf(removeDevCode)



/**
 * Format a synergy contact account number
 * 1) remove leading zeroes
 * 2) add in a single leading zero if the string length == 8 (!)
 */
angular.module('myaccount.utils').filter('syContractAccountNumber', function (Regex) {
    return function (input) {
        if (_.isString(input)) {
            input = input.replace(Regex.FILTER_ACCOUNT_NUMBER, '');
            if (input.length == 8) {
                input = '0' + input;
            }
        }

        return input;
    };
});

/**
 * convert an array of records into a single record with array field!
 *
 * eg: [{time: 0, value:2},{time: 1, value:3},{time: 2, value:8}] => {time:[0,1,2],value:[2,3,8]}
 *
 */
angular.module('myaccount.utils').filter('columnar', function () {
    return function (input, rowName, columnName) {
        var fields = [rowName, columnName];
        var result = {};

        angular.forEach(fields, function (field) {
            result[field] = [];

            if (angular.isArray(input)) {
                angular.forEach(input, function (record) {
                    result[field].push(record[field]);
                });
            }
        });

        return result;
    };
});

angular.module('myaccount.utils').filter('synergyCardTypeFilter', function () {
    return function (input) {
        var out = "";
        if (input == '0002') {
            out = 'VISA';
        } else if (input == '0003') {
            out = 'MC';
        } else {
            out = 'AMEX';
        }
        return out;
    };
});

/**
 * Masks a 16 digit card number to pci standards (show first 6 and last 3 numbers of a card)
 */
angular.module('myaccount.utils').filter('syMaskCard', function () {
    return function (input) {
        if (angular.isDefined(input)) {
            var out;
            var p1 = input.substr(0, 6);
            var p2 = input.substr(input.length - 3);
            out = p1 + '*******' + p2;
            return out;
        }
        return input;
    };
});

/**
 * Turns a positive or negative number (with or without '$' symbol) into credit or debit with dollar symbol prefix
 *
 * //todo user symobol from locale?
 */
angular.module('myaccount.utils').filter('syCreditDebit', function(Regex) {
    return function (input) {
        var number = input;
        if (angular.isDefined(number)) {
            var out;
            if (!angular.isNumber(number)) {
                number = number.replace(Regex.FILTER_DOLLAR,'');
            }
            if (number < 0) {
                number = number.replace(Regex.FILTER_UNDERSCORE,'');
                out = '$' + number + " credit";
            } else if (number > 0) {
                number = number.replace(Regex.FILTER_UNDERSCORE,'');
                out = '$' + number;
            } else {
                out = '$' + number;
            }
            return out;
        }
        return input;
    };
});
angular.module('myaccount.utils').filter('concatAddress', function () {
    return function (input) {
        var out = '';
        if (angular.isObject(input)) {
            //out = input.type
            if (input.houseNumber) {
                out += input.houseNumber;
            }
            if (input.locationNumber) {
                out += ',' + input.locationNumber;
            }
            if (input.lotNumber) {
                out += ',' + input.lotNumber;
            }
            if (input.unitNumber) {
                out += ',' + input.unitNumber;
            }
            if (input.streetName) {
                out += ',' + input.streetName;
            }
            if (input.suburb) {
                out += "," + input.suburb;
            }
            if (input.postcode) {
                out += ',' + input.postcode;
            }
            if (input.state) {
                out += ',' + input.state;
            }
        }
        return out;
    };
});

angular.module('myaccount.utils').filter('min', function () {
    return function (input) {
        var out;
        if (input) {
            for (var i in input) {
                if (input[i] < out || out === undefined || out === null) {
                    out = input[i];
                }
            }
        }
        return out;
    };
});

angular.module('myaccount.utils').filter('max', function () {
    return function (input) {
        var out;
        if (input) {
            for (var i in input) {
                if (input[i] > out || out === undefined || out === null) {
                    out = input[i];
                }
            }
        }
        return out;
    };
});

angular.module('myaccount.utils').filter('avg', function () {
    return function (input) {
        var out = 0;
        if (input) {
            var sum = 0;
            var size = input.length;
            for (var i in input) {
                sum += input[i];
            }
            out = sum / size;
        }
        return out;
    };
});

/**
 * Filter for assigning date values to date input.
 * If we are setting the value based on a moment we
 * format it to a string that the input accepts.
 */
angular.module('myaccount.utils')
    .filter('momentDefault', function() {
        return function(input) {
            var out;
            if (typeof input === "string" || input instanceof String) {
                out = input;
            } else {
                out = input.format("YYYY-MM-DD");
            }
            return out;
        };
    }
);

/**
 * Filter for converting zeroes to blanks.
 */
angular.module('myaccount.utils')
    .filter('noZeroes', function() {
        return function(input) {
            return (input === 0 || input === "0") ? "" : input;
        };
    }
);

/**
 * Filter for capitalization of a string.
 * Also includes an ignore list for states so
 * that we don't capitalize them.
 *
 * e.g.
 * input = "GOOD MORNING WA"
 * output = "Good Morning WA"
 */
angular.module('myaccount.utils')
    .filter('capitalize', function(Utils) {
        return Utils.capitalize;
    }
);

/**
 * Filter for capitalization of a string
 *
 * e.g.
 * input = "HELLO"
 * output = "Hello"
 */
angular.module('myaccount.utils')
    .filter('stripErrorCode', function(Regex) {
        return function(input) {
            if (!input || !angular.isString(input)) {
                return input;
            }
            var result = "";
            result = input.replace(Regex.FILTER_ERRORCODE,'');
            return result;
        };
    }
);

/**
 * Finds all elements in the array where the
 * property matches the supplied value.
 *
 * eg. var employees = [{name: 'Brian', category: 'Nerd'},
 *                  {name: 'Bill Gates', category: 'Nerd'},
 *                  {name: 'Daryl Strawberry', category: 'Ringer'}];
 *
 * $filter('findByValue')(employees, 'category', 'nerd');
 *
 * would return
 * [{name: 'Brian', category: 'Nerd'}, {name: 'Bill Gates', category: 'Nerd'}]
 */
angular.module('myaccount.utils').filter('findByValue', function() {
    return function(array, property, value) {
        var result = [];
        var i=0, len=array.length;
        for (; i<len; i++) {
            if (array[i][property] === value) {
                result.push(array[i]);
            }
        }
        return result;
    }
});

angular.module('myaccount.utils').filter('numberFixedLen', function () {
    return function (n, len) {
        var num = parseInt(n, 10);
        len = parseInt(len, 10);
        if (isNaN(num) || isNaN(len)) {
            return n;
        }
        num = ''+num;
        while (num.length < len) {
            num = '0'+num;
        }
        return num;
    };
});

angular.module('myaccount.utils').filter('month', function() {
    return function(month) {
        return (month < 10 ? '0' : '') + month
    };
});

/**
 * Filter for displaying absolute values.
 */
angular.module('myaccount.utils').filter('abs', function() {
    return function(input) {
        return Math.abs(input);
    };
});

/**
 * Filter for displaying absolute values.
 */
angular.module('myaccount.utils').filter('round', function() {
    return function(input) {
        return _.round(input, 2);
    };
});

/**
 * Filter to title case string, ie HELLO to Hello.
 */
angular.module('myaccount.utils').filter('titleCase', function(Regex) {
    return function(input) {
        input = input || '';
        return input.replace(Regex.FILTER_TITLE_CASE, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    };
});

/**
 * Filter to masking for Bank account number
 *
 **/

angular.module('myaccount.utils').filter('syBankAccountMask', function() {
    return function(input) {
        if(angular.isDefined(input)){
            var out;
            var p1 = input.substr(0,2);
            var p2 = input.substr(input.length - 3);
            out = p1+"***"+p2;
            return out;
        }else{
            return input;
        }
    };
});



/**
 * Filter to masking for Bank account number
 *
 **/

angular.module('myaccount.utils').filter('syBankBSPMask', function() {
    return function(input) {
        if(angular.isDefined(input)){
            var out;
            var p1 = input.substr(0,2);
            var p2 = input.substr(input.length - 2);
            out = p1+"**"+p2;
            return out;
        }else{
            return input;
        }
    };
});
