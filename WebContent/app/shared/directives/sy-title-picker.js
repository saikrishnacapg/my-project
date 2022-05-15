angular.module('myaccount.directives').directive('syTitlePicker', function() {
    return {
        restrict: 'EA',
        replace: true,
        scope: {
            title: '=title',
            isRequired: '@?'
        },
        templateUrl: "app/shared/directives/sy-title-picker.html",
        controller: ['$scope', function($scope) {

            this.title = $scope.title;
            this.isRequired = $scope.$eval($scope.isRequired);

            this.titleUpdated = function() {
                $scope.title = this.title;
            };

            this.titles = [
                {
                    label: '- Title -',
                    value: undefined
                },
                {
                    label: 'Mr',
                    value: 'Mr'
                },
                {
                    label: 'Mrs',
                    value: 'Mrs'
                },
                {
                    label: 'Ms',
                    value: 'Ms'
                },
                {
                    label: 'Miss',
                    value: 'Miss'
                },
                {
                    label: 'Dr',
                    value: 'Dr'
                },
                {
                    label: 'No title',
                    value: 'No title'
                }
            ];
        }],
        controllerAs: 'titleCtrl'
    };
});