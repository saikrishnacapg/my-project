angular.module('myaccount.shared.controllers').controller('MsgCntlr', ['$scope', function ($scope) {
//HTTP call to get data from file with valid url
    //var _messages = _.extend({}, $rootScope.messages);
    $scope.findMsgHTML = function(key) {
        return $rootScope.messages[key];
    };
}]);
