angular.module('myaccount.route').controller('SeeAndSaveCustomiseCtrl', function($scope, SeeAndSaveParameters, SeeAndSaveHttpServer) {
    var self = this;
    this.streams = _.range(1,11);
    this.energyStreams = SeeAndSaveParameters.energyStreams().value();
//    this.nameMappings = SeeAndSaveHttpServer.nameMappings();

    this.isStreamActive = function(id) {
        return id < self.energyStreams.length;
    };

    this.streamId = function (id) {
        return self.energyStreams[id];
    } ;

});