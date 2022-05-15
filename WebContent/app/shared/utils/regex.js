angular.module('myaccount.utils').constant('Regex', {

    /**
     * regex to match the currency amounts
     *
     */
    CURRENCY: /^\$?(([0-9]{1,3}(,)?([0-9]{3}(,)?)*)[0-9]{3}|[0-9]{1,3})(\.[0-9]{2})?$/,
    PAYMENT_CURRENCY: /^\$?([0-9]{1,7})(\.[0-9]{0,2})?$/,
    CARD_NUMBER: /[0-9]{15,16}/,
    BSB_NUMBER: /[0-9]{6,6}/,
    CSV_NUMBER: /[0-9]{3,4}/,
    //EMAIL_ADDRESS: /^[_a-zA-Z0-9-\+]+(\.{1}[_a-zA-Z0-9-\+]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,3})$/,
    EMAIL_ADDRESS: /^[_a-zA-Z0-9-\+]+(\.{1}[_a-zA-Z0-9-\+]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,63})$/,
    EMAIL_ADDRESS_MASKED: /.*/,
    //EMAIL_ADDRESS:/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|”(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*”)@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
    MANDATORY_NUMBER: /^[0-9]+$/,
    NUMBER: /[0-9]/,
    TWO_DIGIT_NUMBER: /[0-9]{2}/,
    PAYMENT_NUMBER: /^\d{10}$/,
    USERNAME: /^[a-zA-Z0-9]{6,16}$/,
    MASTERCARD:/^5[1-5]/,
    VISA: /^4/,
    AMEX: /^3[47]/,
    ALPHA_NUMERIC: /^[a-zA-Z0-9 ]*$/,
    NAME: /^[a-zA-Z-' ]*$/,
    TELEPHONE_NUMBER: /^[0-9]*$/,
    LAND_NUMBER: /^(?!0)[0-9]*$/,
    OTHER_NUMBER: /^(13|18|19)[0-9]*$/,
    MOBILE_NUMBER: /^[04|05]{2}[0-9]*$/,
   // MONTH:/^[1][0-2]|[0][1-9]$/,
    MONTH:/^(0[1-9]|1[012])$/,  // accepts only 2 digits for month
    YEAR:/^([0-9]{2})$/,
    DOBDAY:/^(0[1-9]|[12]\d|3[01])$/,
    DOBMONTH:/^(?:(0[1-9]|1[012]))$/,
    DOBYEAR:/^((19|20)[0-9]{2})$/,
    DATEOFBIRTH:/^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))$/,
    MOBILE_NUMBER_MASKED: /.*/,
    DEFAULT_DECIMAL: /^([0-9]|[1-8][0-9]|9[0-9]|1[0-4][0-9]|150)?(\.\d{1,2})?$/,
    DEFAULT_DECIMAL_REBS: /^([0-9]|[1-9][0-9]{0,2}|1000)?(\.\d{1,2})?$/,
    STRING_IN_SQUARE_BRACKETS: /^\[(.)*\]$/,
    /**
     * Very simple comma separated email validator. There is no set regex for email so I am doing the least
     * validation possible to ensure all emails can be added.
     *
     * (one or more characters that are not @) then an @ (then one or more that are not @) then a . (then one or more that are not @)
     *
     * Then optionally a comma and the above regex one or more times
     */
    EMAIL_COMMA_SEPARATED: /^(([^@])+(@)([^@])+(\.)([^,@])+)(,(([^,@])+(@)([^@])+(\.)([^@])+))*$/,
    /**
     * DateISO8601Regexp - http://www.pelagodesign.com/blog/2009/05/20/iso-8601-date-validation-that-doesnt-suck/
     * @type {RegExp}
     */
    DATEISO8601: /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/,
    JSONDATE: /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d+)Z$/,
    TRIM_WHITESPACE: /(^\s*)|(\s*$)/g,
    FILTER_SPACES: /[\s]/g,
    FILTER_UNDERSCORE: /^-/g,
    FILTER_DOLLAR: /^[$]/g,
    FILTER_ERRORCODE: / \(.*?\)/,
    FILTER_TITLE_CASE:/\w\S*/g,
    FILTER_ACCOUNT_NUMBER: /^0+/,
    FILTER_STRING: /[^0-9.-]+/g
});