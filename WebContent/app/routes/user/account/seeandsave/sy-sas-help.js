angular.module('myaccount.directives').directive('sySasHelp',['Modals',  function (Modals) {
    return {
        restrict: 'A',
        scope: {
            data: '='
        },
        link: function(scope, element, attrs) {
            element.on('click', function() {
                var helpText, title, data = {};
                switch(attrs.sySasHelp) {
                    case 'status':
                        title = "Current status";
                        helpText = $rootScope.messages["MA_H21"];break;
                    case 'usage':
                        title = "Usage";
                        helpText = $rootScope.messages["MA_H23"];break;
                    case 'comparison':
                        title = "Comparison";
                        helpText = $rootScope.messages["MA_H24"];break;
                    case 'legendKey':
                        title = "Energy monitor - filter";
                        helpText = $rootScope.messages["MA_H9"];break;
                    case 'legendValue':
                        title = "Energy monitor - data";
                        helpText = $rootScope.messages["MA_H25"];break;
                    case 'saveTips':
                        title = 'Tips to achieve your goal';
                        helpText = "app/routes/user/account/seeandsave/templates/save-tips.html"; break;
                    default:
                        title = "See and save";
                        helpText = "No help text provided yet.";
                }
                Modals.showAlert(title, helpText, scope.data);
            });
        }
    };
}]);