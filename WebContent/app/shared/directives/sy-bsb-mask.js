angular.module('myaccount.directives').directive('syBsbMask', function(Regex) {
    return {
        require: '?ngModel',
        link: function (scope, elem, attrs, ctrl) {
            if (!ctrl) return;

            function formatAsBsb(value) {
                return value.length >= 3 ?
                        value.substr(0,3) + "-" + value.substr(3) :
                        value;
            }

            ctrl.$parsers.unshift(function () {
                return elem[0].value.replace(/-/g,"").substr(0,6);
            });

            ctrl.$formatters.unshift(function (value) {
                return value ? formatAsBsb(value.toString()) : value;
            });

            scope.$watch(attrs.ngModel, function(value) {
                if (!value) {return;}
                ctrl.$setValidity('pattern', Regex.BSB_NUMBER.test(value));
                elem.val('');
                ctrl.$render();
                ctrl.$setViewValue(formatAsBsb(value.toString()));
                ctrl.$render();
            });
        }
    };
});