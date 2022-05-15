/**
 * Created by 306301 on 22/05/2017.
 */
angular.module('myaccount.directives').directive('syMoveFocus', function () {

    function getCaretPosition(element) {
        // Internet Explorer Caret Position
        if (document.selection && document.selection.createRange) {
            var range = document.selection.createRange();
            var bookmark = range.getBookmark();
            return bookmark.charCodeAt(2) - 2;
        }

        // Firefox Caret Position
        return element.setSelectionRange && element.selectionStart;
    }

    return {
        restrict:'A',
        link: function (scope, element, attrs, model) {
            var tabindex = parseInt(attrs.tabindex);
            var maxlength = parseInt(attrs.maxlength);
            element.on('input', function (e) {
                var val = element.val(),
                    cp,
                    code = e.which || e.keyCode;

                if (val.length === maxlength /*&& [8, 37, 38, 39, 40, 46].indexOf(code) === -1*/) {
                    if (e.target.id == "expiryMonth"){
                        var next = document.querySelectorAll('#expiryYear');
                        next.length && next[0].focus();
                        //next[0].select();
                        return false;
                    }
                }


                cp = getCaretPosition(this);
/*                if ((cp === 0 && code === 46) || (cp === 1 && code === 8)) {

                    if (e.target.id == "expiryMonth"){
                        var prev = document.querySelectorAll('#expiryMonth');
                        e.preventDefault();
                        //element.val(val.substring(1));
                        //prev.length && prev[0].focus();                       
                        
                        return false;
                    }
                    if (e.target.id == "expiryYear"){
                        var prev = document.querySelectorAll('#expiryMonth');
                        e.preventDefault();
                        //element.val(val.substring(1))
                        //prev.length && prev[0].focus();
                        return false;

                    }
                }*/
            });
        }
    };
});