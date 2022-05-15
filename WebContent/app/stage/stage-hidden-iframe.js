angular
	.module('myaccount.stage')
	.controller('HiddenIframeCtrl', HiddenIframeCtrl);

HiddenIframeCtrl.$inject = ['$scope', '$element', '$q', 'HiddenIframe'];
function HiddenIframeCtrl($scope, $element, $q, HiddenIframe, promiseTracker) {

	HiddenIframe.registerHiddenIframeCtrl(this);

    var iframeDeferred = undefined;
	
    var iframe = $element.find('iframe');
    var form = $element.find('form');

    iframe.bind('load', function () {
        // TODO perhaps keep some sort of sequence to ensure the iframeDeferred is right
        if (iframeDeferred) {
            // resolve the data
            $scope.$apply(function () {
                iframeDeferred.resolve();
                iframeDeferred = undefined;
            });
        }
        else {
            console.warn('iframe loaded, but no one listening');
        }
    });

    this.postToIframe = function (targetUrl, formData) {
        if (iframeDeferred !== undefined) {
            console.warn('iframe listener canceled before iframe loaded');
            iframeDeferred.reject('cancelled');
        }

        iframeDeferred = $q.defer();

        // populate form data
        form.empty();
        _.each(formData, function (value, key) {
            return form.append(angular.element('<input type="hidden">').attr('name', key).val(value));
        });

        // submit the form
        form[0].action = targetUrl;
        form[0].submit(); // was using $timeout 500

        return iframeDeferred.promise;
    };
}