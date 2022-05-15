
angular.module('myaccount.directives').directive('syRadio', function() {
	
	return {
		restrict: 'C',
		controller: function() {
		
		},
		compile: function(element) {
			var parent = element.parent();

            parent.addClass("radio");

			if(Modernizr.borderradius) {
				parent.addClass("radio-synergy");
				parent.append("<div></div>");
			}
		}
	}
});