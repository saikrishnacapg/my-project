
angular.module('myaccount.directives').directive('syCheckbox', function() {
	
	return {
		restrict: 'C',
		compile: function(element) {
			var parent = element.parent();

			if(Modernizr.borderradius) {
				parent.addClass("checkbox");
				parent.append("<div></div>");
			} else {
				parent.addClass("checkbox-fallback");
			}
		}
	}
});