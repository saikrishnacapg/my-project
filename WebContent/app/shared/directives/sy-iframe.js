// ng-app
angular.module('myaccount.directives').directive('syIframe', function($sce, $log, $timeout) {

    return {
      restrict: 'EA',
      scope: {
        framesrc: '=',
        formData: '=',
        height: '@',
        width: '@',
        scrolling: '@',
        onload: '&' // caution onload handler should use $scope.$apply as this callback will be executed outside of angular's digest
      },
      template: '<iframe name="synergy-iframe" class="frame" height="{{height}}" width="{{width}}" frameborder="0" border="0" marginwidth="0" marginheight="0" scrolling="{{scrolling}}"></iframe>',
      link : function(scope, element, attrs) {
    	  scope.trustSrc = function(src) {
    		  return $sce.trustAsResourceUrl(src);
    	  };

          var form = angular.element('<form></form>')
                        .attr('action', scope.framesrc)
                        .attr('method', 'post')
                        .attr('target', 'synergy-iframe')
                        .attr('enctype', 'multipart/form-data')
                        .css('visibility', 'hidden')
                        .css('height', '0px');

          angular.forEach(scope.formData, function(value, key) {
              form.append(angular.element('<input type="text" />')
                            .attr('name', key)
                            .val(value));
          });

          element.append(form);

          $timeout(function() {
              form[0].submit();
          }, 500);

          element.find('iframe').bind('load', function (event) {
          	$log.info('iframe load completed!!');
          	scope.onload();
          });
      }
    };
});