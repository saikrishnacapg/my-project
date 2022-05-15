// @see http://stackoverflow.com/questions/19224028/add-directives-from-directive-in-angularjs
angular.module('myaccount.directives').directive('syPattern', function($compile, Regex) {
	return {
	      restrict: 'A',
	      replace: false,
	      terminal: true, //this setting is important, see explanation below
	      priority: 1000, //this setting is important, see explanation below
	      compile: function compile(element, attrs) {
		    element.attr('sy-pattern-pattern', attrs.syPattern);
	        element.attr('ng-pattern', attrs.syPattern);
		    element.removeAttr("sy-pattern"); //remove the attribute to avoid indefinite loop
	        return {
	          post: function postLink(scope, iElement, iAttrs, controller) {
	            $compile(iElement)(scope);
	          }
	        };
	      }
	    };
});

angular.module('myaccount.directives').directive('syPatternPattern', function($compile, Regex) {
	return {
		restrict: 'A',
		replace: false,
		priority: 1000, //this setting is important, see explanation below
		link: function (scope, element, attrs) {
			scope[attrs.syPatternPattern] = escapeRegExp(Regex[attrs.syPatternPattern]);
		}
	};

	function escapeRegExp(regex) {
		return regex;
	}
});