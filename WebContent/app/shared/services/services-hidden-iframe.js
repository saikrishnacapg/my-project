angular.module('myaccount.shared.services').factory('HiddenIframe', function() {

	this.hiddenIframeCtrl = undefined;

    var HiddenIframe = {
    	// called by the stage level controller 
    	registerHiddenIframeCtrl: function(hiddenIframeCtrl) {
    		this.hiddenIframeCtrl = hiddenIframeCtrl;
    	},
    	// called by clients, returns a promise
    	postToIframe: function(targetUrl, formData) {
            return this.hiddenIframeCtrl.postToIframe(targetUrl, formData);
        }
    };

    return HiddenIframe;
});
