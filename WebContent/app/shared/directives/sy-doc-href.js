angular.module('myaccount.directives').directive('syDocHref', function ($log, $rootScope, Resources, SynergyDomain, SynergySite, SynergySiteParams) {
    function adaptToEnvironment(location) {
        if (window.location.host === SynergyDomain || _.isEmpty(location)) {
            return location;
        }
        
        if (/\/$/.test(SynergySite)) {
        	SynergySite = SynergySite.slice(0, -1); // slice off the trailing /
        }
        var location
        var originAndAnchor = location.split('#');
        var protocolAndDomain = originAndAnchor[0].split('://');
        if(protocolAndDomain[1].search(SynergyDomain) >= 0){
            location = protocolAndDomain[1].replace(SynergyDomain, SynergySite) + SynergySiteParams;
        }else{
            var protocolAndDomainMore = protocolAndDomain[1].split('/');
            location =  protocolAndDomain[1].replace(protocolAndDomainMore[0], SynergySite) + SynergySiteParams;
        }
        location = originAndAnchor[1] ? location + "#" + originAndAnchor[1] : location;        
        return location;
    }

    return {
        restrict: 'A',
        scope: false,
        replace: false,
        link: function ($scope, elem, attrs) {
            var resourceId = attrs.syDocHref;


            Resources.getDocumentLink(resourceId).then(function(result) {
                var location = adaptToEnvironment(result.data);

                // always load resources in a separate window
                elem.attr('target', '_blank');
                elem.attr('href', location);
            })
        }
    };
});