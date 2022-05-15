/**
 * Loops through checking to see if the browser autofills the field and
 * manually populates the model if it does.
 *
 * Stops checking after 10 attempts.
 */
angular.module('myaccount.directives').directive('syAutoFocus', function ($timeout) {

    return {
        restrict: 'A',
        link: function (scope, elem, attrs, ctrl) {
            if(attrs.syAutoFocus != "false" || attrs.syAutoFocus == "sy-auto-focus") {
                setTimeout(function () {
                    var elements = elem.find("*").filter(function () {
                        if (/^select|textarea|button|a|input$/i.test(this.tagName)) { //not-null
                            //Optionally, filter the same elements as above
                            if (/input/i.test(this.tagName) && !/^checkbox|radio|text$/i.test(this.type)) {
                                // Not the right input element
                                return false;
                            }
                            return !this.readOnly &&
                                !this.disabled
                                && $(this).parentsUntil('form', 'div').css('display') != "none";
                        }
                        return false;
                    });
                    elements.eq(0).focus().select();
                }, 500);
            }
        }
    };
});