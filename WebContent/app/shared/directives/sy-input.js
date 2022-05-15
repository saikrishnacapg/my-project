(function() {
    var blurFocusDirective = function () {
        return {
            restrict: 'E',
            require: '?^ngModel',
            link: function (scope, elm, attr, ctrl) {
                if (!ctrl) {
                    return;
                }

                elm.on('focus', function () {
                    elm.addClass('has-focus');
                    scope.$emit('$fieldFocused', attr);
                    scope.$evalAsync(function () {
                        ctrl.hasFocus = true;
                    });
                });

                elm.on('blur', function () {
                    elm.removeClass('has-focus');
                    elm.addClass('has-visited');

                    scope.$evalAsync(function () {
                        ctrl.hasFocus = false;
                        ctrl.hasVisited = true;
                    });
                });

                var parentForm = elm.closest('form');
                if (parentForm) {
                    parentForm.on('submit', function () {
                        elm.addClass('has-visited');

                        scope.$evalAsync(function () {
                            ctrl.hasFocus = false;
                            // ctrl.hasVisited = true;
                        });
                    });
                }
            }
        };
    };

    angular.module('myaccount.directives').directive('input', blurFocusDirective);
    angular.module('myaccount.directives').directive('select', blurFocusDirective);
    angular.module('myaccount.directives').directive('textarea', blurFocusDirective);
})();