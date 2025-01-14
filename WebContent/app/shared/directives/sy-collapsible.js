/**
 * collapsible taken from materialize //TODO better
 */
angular.module('myaccount.directives').directive('syCollapsible', ["$timeout", function($timeout){
    return {
        link: function(scope, element, attrs) {
            $timeout(function(){
                element.syCollapsible();
            });
        }
    };
}]);

(function ($) {
    $.fn.syCollapsible = function(options) {
        var defaults = {
            accordion: undefined
        };

        options = $.extend(defaults, options);


        return this.each(function() {

            var $this = $(this);

            var $panel_headers = $(this).find('> li > .collapsible-header');

            var collapsible_type = $this.data("collapsible");

            // Turn off any existing event handlers
            $this.off('click.collapse', '.collapsible-header');
            $panel_headers.off('click.collapse');


            /****************
             Helper Functions
             ****************/

                // Accordion Open
            function accordionOpen(object) {
                $panel_headers = $this.find('> li > .collapsible-header');

                if (object.hasClass('active')) {
                    object.parent().addClass('active');
                }
                else {
                    object.parent().removeClass('active');
                }
                if (object.parent().hasClass('active')){
                    object.children('i').html('keyboard_arrow_down');
                    object.siblings('.collapsible-body').stop(true,false).slideDown({ duration: 350, easing: "easeOutQuart", queue: false, complete: function() {$(this).css('height', '')}});
                }
                else{
                    object.children('i').html('keyboard_arrow_right');
                    object.siblings('.collapsible-body').stop(true,false).slideUp({ duration: 350, easing: "easeOutQuart", queue: false, complete: function() {$(this).css('height', '')}});
                }

                $panel_headers.not(object).removeClass('active').parent().removeClass('active');
                $panel_headers.not(object).parent().children('.collapsible-body').stop(true,false).slideUp(
                    {
                        duration: 350,
                        easing: "easeOutQuart",
                        queue: false,
                        complete:
                            function() {
                                $(this).css('height', '')
                            }
                    });
            }

            // Expandable Open
            function expandableOpen(object) {
                if (object.hasClass('active')) {
                    object.parent().addClass('active');
                }
                else {
                    object.parent().removeClass('active');
                }
                if (object.parent().hasClass('active')){
                    object.children('i').html('keyboard_arrow_down')
                    object.siblings('.collapsible-body').stop(true,false).slideDown({ duration: 350, easing: "easeOutQuart", queue: false, complete: function() {$(this).css('height', '')}});
                }
                else{
                    object.children('i').html('keyboard_arrow_right')
                    object.siblings('.collapsible-body').stop(true,false).slideUp({ duration: 350, easing: "easeOutQuart", queue: false, complete: function() {$(this).css('height', '')}});
                }
            }

            /**
             * Check if object is children of panel header
             * @param  {Object}  object Jquery object
             * @return {Boolean} true if it is children
             */
            function isChildrenOfPanelHeader(object) {
//                var panelHeader = getPanelHeader(object);
//                return panelHeader.length > 0;
                return object.prop("className").indexOf('collapsible-header') == -1;
            }

            /**
             * Get panel header from a children element
             * @param  {Object} object Jquery object
             * @return {Object} panel header object
             */
            function getPanelHeader(object) {

                return object.closest('li > .collapsible-header');
            }

            /*****  End Helper Functions  *****/



            if (options.accordion || collapsible_type == "accordion" || collapsible_type == undefined) { // Handle Accordion
                // Add click handler to only direct collapsible header children
                $panel_headers = $this.find('> li > .collapsible-header');
                $panel_headers.on('click.collapse', function (e) {
                    var element = $(e.target);

                    if (isChildrenOfPanelHeader(element)) {
                        element = element.parent();
                    }

                    element.toggleClass('active');
                    accordionOpen(element);
                });
                // Open first active
                accordionOpen($panel_headers.filter('.active').first());
            }
            else { // Handle Expandables
                $panel_headers.each(function () {
                    // Add click handler to only direct collapsible header children
                    $(this).on('click.collapse', function (e) {
                        var element = $(e.target);
                        if (isChildrenOfPanelHeader(element)) {
                            element = element.parent();
                        }
                        element.toggleClass('active');
                        expandableOpen(element);
                    });
                    // Open any bodies that have the active class
                    if ($(this).hasClass('active')) {
                        expandableOpen($(this));
                    }

                });
            }

        });
    };

    $(document).ready(function(){
        $('.collapsible').collapsible();
    });
}( jQuery ));