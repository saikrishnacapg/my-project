angular.module('myaccount.directives').directive('syTabs', function(ClientStorage) {
    return {
        restrict: 'EA',
        replace: true,
        scope: {
            tabs: '=tabs',
            activeTab: '='
        },
        templateUrl: "app/shared/directives/sy-tabs.html",
        transclude: true,
        controllerAs: 'tabsCtrl',
        controller: ['$scope', function($scope) {
            var self = this;

            this.tabs = _.map($scope.tabs, function(tab, index) {
                return {
                    "title": tab.title || ("Tab" + index),
                    "icon": tab.icon || "sy-icon--file"
                };
            });

            this.tabIsActive = function(tabTitle) {
                return self.mode === tabTitle;
            };

            this.setTabMode = function(tab) {
                this.mode = _.safeAccess(tab, 'title') || (_.some(this.tabs, {title: ClientStorage.getActiveTab()}) ? ClientStorage.getActiveTab() : this.tabs[0].title);

                $scope.activeTab = this.mode;
                ClientStorage.setActiveTab(this.mode);
            };

            this.setTabMode();
        }]

    };
});