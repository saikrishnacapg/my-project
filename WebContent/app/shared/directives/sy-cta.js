angular.module('myaccount.directives').directive('syCta', function($timeout) {
  return {
    restrict: 'A',
    transclude: true,
    scope: {
      id: '@'
    },
    link: function(scope, elem, tAttrs, ctrl) {
      $timeout(function() {
        ctrl.state = 'active';
      }, 1000);

    },
    controllerAs: 'ctaCtrl',
    controller: function($scope) {
      this.show = true;
      this.state = '';
    },
    templateUrl: 'app/shared/directives/sy-cta.html'
  };
});
