
angular.module('myaccount.shared.services').factory('Resources', function($log, $q, $sce, $http, $templateCache, MyAccountServer) {

    var getContentLocation = function(id) {
        return $sce.trustAsResourceUrl(MyAccountServer+'/resources/content/' + id);
    };

    var getDocumentLocation = function(id) {
        return MyAccountServer+'/resources/document?' + id;
    };

    var getDocumentLink = function(id) {
        return $http.get(MyAccountServer+'/resources/link?' + id);
    };

    var Resources = {
        getContentLocation: getContentLocation,
        getDocumentLocation: getDocumentLocation,
        getDocumentLink: getDocumentLink
    };
    return Resources;
});