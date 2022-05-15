angular.module('myaccount.shared.services').service('idleService', function($modal, $rootScope, syIdle, DeviceMode, MyAccountClient, Session, SessionServer, SynergySite, Wizards,$window) {
    var self = this;

    this.destroyWarning = function() {
        if ($rootScope.idleWarning) {
            $rootScope.idleWarning.destroy()
            $rootScope.idleWarning = null;
        }
    };

    this.logout = function() {
        localStorage.removeItem('businessPartnerDetail');
        localStorage.removeItem('setCurrentUserIdentifier');
        return Session.logout();
    };

    this.warn = function() {
        if (!$rootScope.idleWarning) {
            $rootScope.idleWarning = $modal({
                scope: $rootScope,
                template: 'app/shared/views/logout-modal.html',
                show: false,
                backdrop: false
            });

            $rootScope.idleWarning.$promise.then($rootScope.idleWarning.show);
        }
    };

    this.watch = function() {
        self.destroyWarning();
        SessionServer.resume();
        syIdle.watch();
    };

    this.unwatch = function() {
        syIdle.unwatch();
    };

    $window.onbeforeunload = function () {
        if (typeof(insideFrontInterface) != 'undefined' && typeof(_insideGraph) != 'undefined' && insideFrontInterface.currentChatId != undefined && insideFrontInterface.currentChatId != "") {
            var _insideData = {};
            _insideData.user = {};
            _insideData.user.account_number = "";
            _insideData.user.authenticated_status = false;
            _insideData.user.account_list = "";
            _insideGraph.current.visitorData = _insideData.user;
            _insideGraph.current.trackView({"type":"home","name":"Home Page"});
        }
    };

});