/**
 * Bit of a crazy directive.
 * In order to display the name when back button is clicked we need to hide the actual file input (as they don't rebind)
 * and display what looks like a file input. When this is clicked we click thje actual file input through JS and then use the name
 * of this file to bind to the controller and display on screen.
 *
 * This code has an issue in that the name of the required input can't be dynamic so it's always syFile.
 * It means we can't have separate error messages for more than one file input per section due to sy-alert-box searching by name.
 */
angular.module('myaccount.directives').directive('syFile', function($timeout) {
    return {
        restrict: 'A',
        templateUrl: 'app/shared/directives/sy-file.html',
        replace: true,
        scope: {
            uploader: '=',
            file: '='
        },
        link: function(scope, element, attr, ctrl) {

            // click the label instead to avoid IE9 submission issues
            // http://stackoverflow.com/questions/10667856/form-submit-ie-access-denied-same-domain

            $timeout(function() {
                if (ctrl.hasFileAPI) {
                    var displayButton = angular.element(element.find('#html5-control'));
                    var hiddenFileButtonLabel = angular.element(element.find('#html5-label'));
                    var hiddenFile = angular.element(element.find('#syFileHTML5'));
                    displayButton.bind('click', function() {
                        hiddenFileButtonLabel.click();
                    });

                    hiddenFile.bind('change', function() {
                        ctrl.changed();
                    });
                } else {
                    var file = angular.element(element.find('#syFileManual'));
                    file.bind('change', function() {
                        ctrl.changed();
                    });
                }
            });
        },
        controller: function($scope) {
            this.hasFileAPI = _.isFunction(window.FileReader);
            this.uploader = $scope.uploader;
            this.changed = false;
            this.file = this.uploader.queue.length > 0 ? this.uploader.queue[0] : null;

            this.changed = function() {
                this.changed = true;
                this.file = this.uploader.queue[0];
            };
            this.fileName = function() {
                return _.safeAccess(this.uploader.queue[0], 'file.name');
            };
        },
        controllerAs: 'fileCtrl'
    }
});
