angular.module('myaccount.directives').directive('syFormGroup', function () {

    return {
        restrict: 'A',
        controller: function ($scope) {

        },
        compile: function (element, attrs) {
            var layout = element.attr('data-layout');
            var children = element.children();


            element.addClass("sy-form-group");

            if (layout === "default") {
                element.addClass("sy-form-group--default");
                angular.element(children[0]).wrap("<div class='sy-element-full-width col-sm-12'></div>");
            } else if (layout === "form") {
                element.addClass("sy-form-group--form");
                angular.element(children[0]).wrap("<div class='sy-element-left col-sm-4'></div>");
                angular.element(children[1]).wrap("<div class='sy-element-right col-sm-8'></div>");
            } else if (layout === "split") {
                element.addClass("sy-form-group--split");
                angular.element(children[0]).wrap("<div class='sy-element-left col-sm-6'></div>");
                angular.element(children[1]).wrap("<div class='sy-element-right col-sm-6'></div>");
            } else if (layout === "split3way") {
                element.addClass("sy-form-group--split");
                angular.element(children[0]).wrap("<div class='sy-element-left col-sm-5'></div>");
                angular.element(children[1]).wrap("<div class='sy-element-left col-sm-2'></div>");
                angular.element(children[2]).wrap("<div class='sy-element-right col-sm-5'></div>");
            } else if (layout === "split4way") {
                element.addClass("sy-form-group--split");
                angular.element(children[0]).wrap("<div class='sy-element-left col-sm-4'></div>");
                angular.element(children[1]).wrap("<div class='sy-element-right col-sm-2'></div>");
                angular.element(children[2]).wrap("<div class='sy-element-left col-sm-3'></div>");
                angular.element(children[3]).wrap("<div class='sy-element-right col-sm-3'></div>");
            } else if (layout === "split5way") {
                element.addClass("sy-form-group--split");
                angular.element(children[0]).wrap("<div class='sy-element-left col-sm-2'></div>");
                angular.element(children[1]).wrap("<div class='sy-element-right col-sm-4'></div>");
                angular.element(children[2]).wrap("<div class='sy-element-left col-sm-2'></div>");
                angular.element(children[3]).wrap("<div class='sy-element-right col-sm-2'></div>");
                angular.element(children[4]).wrap("<div class='sy-element-right col-sm-2'></div>");
            } else if (layout === "split__hold") {
                element.addClass("sy-form-group--split");
                angular.element(children[0]).wrap("<div class='sy-element-left col-xs-6'></div>");
                angular.element(children[1]).wrap("<div class='sy-element-right col-xs-6'></div>");
            } else if (layout === "edit") {
                element.addClass("sy-form-group--edit");
                angular.element(children[0]).wrap("<div class='sy-element-left col-sm-9'></div>");
                angular.element(children[1]).wrap("<div class='sy-element-right col-sm-3'></div>");
            } else if (layout === "tooltip") {
                element.addClass("sy-form-group--tooltip");
                angular.element(children[0]).wrap("<div class='sy-element-left col-xs-10'></div>");
                angular.element(children[1]).wrap("<div class='sy-element-right col-xs-2'></div>");
            } else if (layout === "bullet") {
                element.addClass("sy-form-group--bullet");
                angular.element(children[0]).wrap("<div class='sy-element-left col-xs-1'></div>");
                angular.element(children[1]).wrap("<div class='sy-element-right col-xs-11'></div>");
            } else if (layout === "summary") {
                element.addClass("sy-form-group--summary");
                angular.element(children[0]).wrap("<div class='sy-element-left col-xs-2'></div>");
                angular.element(children[1]).wrap("<div class='sy-element-right col-xs-10'></div>");
            } else if (layout === "inline") {
                element.addClass("sy-form-group--inline");
                angular.element(children[0]).css("float", "left");
                angular.element(children[1]).css("float", "left");
            }
        }
    }
});