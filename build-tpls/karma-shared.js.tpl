var shared = function(config) {
    config.set({
        basePath: '../',
        frameworks: ['jasmine'],
        reporters: ['dots','progress'],
        browsers: ['Chrome'],//,'PhantomJS','Firefox'],
        //browsers: ['PhantomJS'],
        autoWatch: true,

        // these are default values anyway
        singleRun: false,
        colors: true
    });
};


shared.files = [
    <%
    var appFiles = grunt.config('appFiles');
    var libs = grunt.config('externalLibs');
    var prefix = grunt.config('pkg');

    for(var i = 0, len = libs.min.length; i < len; i++) {
    print("'"+ libs.min[i] + "',\n");
}
for(var i = 0, len = appFiles.length; i < len; i++) {
    print("'"+ appFiles[i] + "',\n");
    }
%>
];

module.exports = shared;
