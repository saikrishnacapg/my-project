/**
 * Custom directive wrapping angulartics for input elements in wizards/forms
 */

(function () {
    var category = function (attrs, elem) {
        if ('analyticsCategory' in attrs)
            return attrs.analyticsCategory;

        if (elem.parents().find('[analytics-category]').length)
            return elem.parents().find('[analytics-category]').attr("analytics-category");

        return document.title == 'Synergy My Account – Electricity & Gas - Western Australia' ? "Homepage" : document.title.replace('Synergy - ', '');
    };

    var label = function (attrs, elem) {
        if ('analyticsLabel' in attrs)
            return attrs.analyticsLabel;

        return attrs.id || attrs.title || elem.text();
    };

    var location = function (attrs, elem) {
        if ('analyticsLocation' in attrs) return attrs.analyticsLocation;
        return "body";
    };


    var syAnalyticsClick = function () {
        return {
            restrict: 'E',
            link: function link(scope, element, attrs) {

                // Disable analytics if ignore flag is present or angulartics is used
                if (("noSyAnalytics" in attrs) || ("analyticsOn" in attrs))
                    return;

                element.attr("data-event", "site-interaction");
                element.attr("data-location", location(attrs, element));
                element.attr("data-description", label(attrs, element));
                element.attr("data-type", "link");

                // Apply to all links constructed with sy-doc-href
                if (element.prop("tagName") == 'A') {
                    if (attrs.syDocHref) {
                        var event = attrs.syDocHref ? (attrs.syDocHref.indexOf('external') != -1 ? 'exthyperlink' : 'hyperlink') : 'hyperlink';
                        element.attr("data-type", event);
                    } else if (attrs.analyticsEvent) {
                        element.attr("data-type", attrs.analyticsEvent);
                    } else if (attrs.href && (attrs.href.indexOf("mailto") >= 0 || attrs.href.indexOf("tel") >= 0)) {
                        element.attr("data-type", 'click to call');
                    }
                }
                if (element.prop("tagName") == 'BUTTON') {
                    element.attr("data-type", "button");
                }
            }
        };
    };

    var syAnalyticsChange = function () {
        return {
            restrict: 'E',
            link: function link(scope, element, attrs) {

                // Disable analytics if ignore flag is present or angulartics is used
                if (("noSyAnalytics" in attrs) || ("analyticsOn" in attrs))
                    return;
                element.attr("data-event", "site-interaction");
                element.attr("data-location", "body");
                element.attr("data-description", label(attrs, element));
                element.attr("data-type", "link");
                if ("bsTypeahead" in attrs) {
                    element.attr("data-type", "bsTypeahead");
                } else if (attrs.type == "range") {
                    element.attr("data-type", attrs.type);
                } else {
                    element.on('change', function () {
                        var labelText = label(attrs, element);
                        if (labelText.indexOf('Child account:') == -1) {
                            element.attr("data-type", attrs.type);
                        }

                    });
                }
            }
        };
    };

    var syAnalyticsError = ['$timeout', 'AnalyticsServer', function ($timeout, AnalyticsServer) {
        return {
            scope: false,
            restrict: 'A',
            link: function (scope, element, attrs) {
                // Watch the child elements
                if (attrs.syAnalyticsError) {
                    $timeout(function () {
                        scope.$watch(function () {
                            return AnalyticsServer.flattenChildren(element);
                        }, function (value) {
                            if (value) {
                                AnalyticsServer.handleException(element, attrs.syAnalyticsError);
                            }
                        });
                    }, 0);
                }
            }
        };
    }];

    angular.module('myaccount.directives').directive('input', syAnalyticsChange);
    angular.module('myaccount.directives').directive('select', syAnalyticsChange);
    angular.module('myaccount.directives').directive('textarea', syAnalyticsChange);

    angular.module('myaccount.directives').directive('a', syAnalyticsClick);
    angular.module('myaccount.directives').directive('button', syAnalyticsClick);
    angular.module('myaccount.directives').directive('syAnalyticsError', syAnalyticsError);
})()
