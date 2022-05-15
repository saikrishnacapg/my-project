angular.module('myaccount.directives')
    .directive('syFullHref', function (Resources) {
    return {
        restrict: 'A',
        link: function($scope, elem, attrs) {
            let documentId = attrs.syFullHref;
            Resources.getDocumentLink(documentId).then(function(result) {
                elem.attr('target', '_blank');
                elem.attr('href', result.data);
            })
        }
    };
  }
)
