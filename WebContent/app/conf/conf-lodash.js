var round = function(num) {
    return _.isNumber(num) ? parseFloat(num.toFixed(2)) : num;
};
_.mixin( {'round': round} );

var divide = function(num, divisor) {
    return num / divisor;
};

_.mixin( {'divide': divide} );

var toKilowatts = function(num) {
    return _.isNumber(num) ? num/1000 : num;
};
_.mixin( {'toKilowatts': toKilowatts} );

// E(kWh) = P(W) × t(hr) / 1000
var toKilowattHours = function(kilowatts, hours) {
    return kilowatts * hours;
};
_.mixin( {'toKilowattHours': toKilowattHours} );

var toCo2Kg = function(kilowattHours) {
    return kilowattHours * 0.541548528;
};

_.mixin( {'toCo2Kg': toCo2Kg} );

_.safeAccess = (function(){
    return function (obj, accessStr) {
        // auto-curry here
        if (isUndefined(accessStr)) {
            return access.bind(null, obj);
        }

        var funcArgs = Array.prototype.slice.call(arguments, 2);
        return helper(obj, tokenize(accessStr), null, funcArgs);
    };

    function helper(obj, tokens, ctx, fnArgs) {
        if (tokens.length === 0) {
            return obj;
        }

        var currentToken = tokens[0];

        if (isUndefined(obj) || isNull(obj) ||
            (isTokenFunctionCall(currentToken) && !isFunction(obj))) {
            return undefined;
        }

        if (isTokenFunctionCall(currentToken)) {

            return helper(obj[isArray(fnArgs[0]) ? 'apply' : 'call'](ctx, fnArgs[0]),
                tokens.slice(1),
                // clear context because consecutive fn calls execute in global context
                // e.g. `a.b()()`
                null,
                fnArgs.slice(1));

        } else if (isTokenArrayAccess(currentToken)) {

            return helper(obj[parseInt(currentToken.substr(1), 10)],
                tokens.slice(1),
                // lookahead two tokens for function calls
                isTokenFunctionCall(tokens[1]) ? obj : ctx,
                fnArgs);

        } else {

            return helper(obj[currentToken],
                tokens.slice(1),
                // lookahead two tokens for function calls
                isTokenFunctionCall(tokens[1]) ? obj : ctx,
                fnArgs);

        }
    }

    function isUndefined(a) {
        return a === void 0;
    }

    function isNull(a) {
        return a === null;
    }

    function isArray(a) {
        return Array.isArray(a);
    }

    function isFunction(a) {
        return typeof a === 'function';
    }

    function isTokenFunctionCall(token) {
        return token === '()';
    }

    function isTokenArrayAccess(token) {
        return /^\[\d+\]$/.test(token);
    }

    function tokenize(str) {
        return str.split(/\.|(\(\))|(\[\d+?])/).filter(function(t) { return t; });
    }
})();

_.flattenJSON = function(data) {
    var result = {};
    function recurse (cur, prop) {
        if (Object(cur) !== cur) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
            for(var i=0, l=cur.length; i<l; i++)
                recurse(cur[i], prop + "[" + i + "]");
            if (l == 0)
                result[prop] = [];
        } else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop+"."+p : p);
            }
            if (isEmpty && prop)
                result[prop] = {};
        }
    }
    recurse(data, "");
    return result;
}