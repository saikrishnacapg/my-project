'use strict';

// dependencies
var gulp				= require('gulp'),
	pkg				    = require('./package.json'),
	es					= require('event-stream'),
	os					= require('os'),
	del 	            = require('del'),
	removeCode = require('gulp-remove-code'),
	gulpLoadPlugins = require('gulp-load-plugins'), // Load plugins
	$ = gulpLoadPlugins({lazy: false}),
	babel = require('gulp-babel'),
	mainNPMFiles = require('npmfiles'), // Load NPM files for loading
	CacheBuster = require('gulp-cachebust'),
	templateCache = require('gulp-angular-templatecache'),
	bump = require('gulp-bump');


var cachebust = new CacheBuster();

function dir(prefix, globs) {
	return globs.pipe($.rename(function(path) {
		path.dirname = prefix + '/' + path.dirname;
	}));
}

var LIB_ORDER = ['env.js',
	'lib.min.js', // minified only
	'**/jquery.js',
	'**/angular.js',
	'lib/node/lodash-compat/index.js',
	'**/moment.js',
	'**/highstock.src.js',
	'**/d3.js'];

//------------------------------------------------------
// update the timestamp of a file, used on the html pages to help glassfish cache them
//------------------------------------------------------
function touch(data, cb) {
	data.stat.mtime = new Date(); // update the timestamp to now
	cb(null, data);
}

// Clean dist folder
function cleandist() {
	return del(["dist/**"]);
}


//------------------------------------------------------
// Compile function
// performs an in memory compilation of all sources (optionally minified)
//------------------------------------------------------
function compile(envConfig, minified) {
	var app_css = dir('css', gulp.src(['less/app.less','less/icons.less','less/page.less']).pipe($.less()));
	var material_css = dir('css', gulp.src(['sass/material.scss']).pipe($.sass()));
	var nvd3_css = dir('css', gulp.src(['node_modules/angular-nvd3/lib/nv.d3.css']));
	var app_src = dir('app', gulp.src(['WebContent/app/**/*.js', '!./WebContent/app/__tests__/**/*.js', '!./WebContent/app/**/*Spec.js'])
		              .pipe(removeCode({ removeDevCode: true }))
									.pipe(babel({presets: [['@babel/preset-env']]})).on('error', console.error)
									.pipe(cachebust.resources()))

	var tpls = dir('app', gulp.src('WebContent/app/**/*.html'));
	// Prepare the new modules from node directories (including napa node modules loaded)
	// Napa modules loaded are hardcoded because it's not listed in the package dependencies for npmfiles
	var napaNodeModuleLibLocations = [
		'node_modules/highstock-release/modules/exporting.src.js',
		'node_modules/highstock-release/highstock.src.js',
		'node_modules/highstock-release/highcharts-more.src.js',
		'node_modules/angular-bowser/src/angular-bowser.js'
	];
	var newNodeModuleLibDirs = [...mainNPMFiles(), ...napaNodeModuleLibLocations].map(function(filePath){ return 'lib/node' + filePath.split('node_modules').pop(); });
	// For the stupid gulp-inject for the JavaScript files, we need to block out the node module file paths
	var nodeModuleStartFilePathsForInjectIgnore = [...mainNPMFiles(), ...napaNodeModuleLibLocations].map(function(filePath){
		filePath = filePath.substr(filePath.indexOf('node_modules'));
		return filePath.substr(0, filePath.lastIndexOf('/'));
	});
	// Now because of the way the stupid gulp-inject built their ignore path function, we need to drop the angular filter to the back
	// We then need to make sure moment comes after moment-range
	var angularPathToMoveToTheEnd = nodeModuleStartFilePathsForInjectIgnore.shift();
	nodeModuleStartFilePathsForInjectIgnore.push(angularPathToMoveToTheEnd);
	nodeModuleStartFilePathsForInjectIgnore = nodeModuleStartFilePathsForInjectIgnore.filter(function(value) { return value !== 'node_modules/moment'; });
	nodeModuleStartFilePathsForInjectIgnore.push('node_modules/moment');
	// This actually prepares the file path module names correctly for building dist
	var nodeModuleLibs = gulp.src([...mainNPMFiles(), ...napaNodeModuleLibLocations]).pipe($.rename(function(path){
		path.dirname = newNodeModuleLibDirs[0].substr(0, newNodeModuleLibDirs[0].lastIndexOf('/'));
		newNodeModuleLibDirs.shift();
	}));
	var shims = dir('lib/shim', es.merge(gulp.src('WebContent/lib/shim/**/*.js'))); //
	var formsEngine = dir('lib/ext', gulp.src('FormsEngine/src/**/*.js')); //

	var fonts = dir('font', gulp.src('WebContent/font/**/*'));
	var images = dir('img', gulp.src('WebContent/img/**'));

	// create the environment file
	var env = gulp.src('build-tpls/env.js.tpl', {cwdbase: true})
		.pipe($.template(envConfig))
		.pipe($.rename('env.js'));

	var app_js;
	if (minified) {
		// Minify css
		app_css = app_css.pipe($.cssmin());
		material_css = material_css; // issues with minification here, need to invesitage - .pipe($.cssmin());
		nvd3_css = nvd3_css.pipe($.cssmin());

		// minify our libs
		nodeModuleLibs = nodeModuleLibs.pipe($.order(LIB_ORDER)).pipe($.concat('lib.min.js')).pipe($.terser({mangle:true}).on('error', console.error));

		// conjoin the html templates into a
		//var tplCache = tpls.pipe($.angularTemplatecache({module: 'myaccount'})).pipe($.concat('tpls.js'));
		var tplCache = tpls.pipe(templateCache({
			module: 'myaccount',
			transformUrl: function (url){return url.replace(/\\/, '');
			}
		})).pipe($.concat('tpls.js'));
		// apply ngmin to app js and ugligy
		app_src = app_src.pipe(cachebust.resources()).pipe($.ngmin()).pipe($.terser({mangle:true}).on('error', console.error));

		// merge templates into app_src and minify
		app_src = es.merge(app_src,formsEngine,tplCache).pipe($.concat('app.min.js'));

		// merge all
		app_js = es.merge(app_src,nodeModuleLibs,env).pipe($.rev());
	}
	else {
		app_js = es.merge(app_src,nodeModuleLibs,formsEngine,env).pipe($.order(LIB_ORDER));
	}
	var index_html = gulp.src('./build-tpls/index.html.tpl')
		.pipe($.inject(app_js, {
			addRootSlash: false,
			ignorePath: ['dist', 'WebContent/app/', 'WebContent/lib/node', 'FormsEngine/src', ...nodeModuleStartFilePathsForInjectIgnore]
		}))
		.pipe($.inject(app_css, {addRootSlash: false, ignorePath: ['/less/']}))
		.pipe($.inject(material_css, {addRootSlash: false, ignorePath: ['/sass/']}))
		.pipe($.inject(nvd3_css, {addRootSlash: false}))
		.pipe(es.map(touch))
		.pipe($.rename('index.html'));

	var logout_html = gulp.src('./build-tpls/logout.html.tpl')
		.pipe($.template(envConfig))
		.pipe($.inject(app_css, {addRootSlash: false, ignorePath: ['/less/']}))
		.pipe(es.map(touch))
		.pipe($.rename('logout.html'));

	var all_html = es.merge(index_html, logout_html);
	if (!minified) {
		all_html = es.merge(all_html, tpls);
	}
	// return all processed files
	return es.merge(all_html, app_js, shims, fonts, images, app_css, material_css, nvd3_css);
}

function build() {
	var envConfig =
		{
			version: pkg.version,
			synergysite: synergyPublicWebsiteUrl + '()',
			clienturl: "' + 'https://'+window.location.host+'" + "/myaccount",
			serverurl: "' + 'https://'+window.location.host+'",
			username: 'undefined',
			password: 'undefined'
		};
	return (
		compile(envConfig, true)
			.pipe($.zip('myaccount.zip'))
			.pipe(gulp.dest('dist'))
	)
};

//------------------------------------------------------
// tasks
//------------------------------------------------------

gulp.task('clean', function() {
	return gulp.src('dist/**', {read: false}).pipe($.clean({force: true}));
});

gulp.task('stats', function() {
	gulp.src('WebContent/app/**/*.js').pipe($.sloc());

	// stats for synergy-apps
	//gulp.src('../synergy-apps/src/java/**/*.java').pipe($.filter('!**/wsclient/**/*.java')).pipe($.sloc());
	//gulp.src(['../synergy-apps/grails-app/**/*.groovy','../synergy-apps/src/groovy/**/*.groovy']).pipe($.rename(function(path) {path.extname = '.java';})).pipe($.sloc());

	// stats for synergy-web
	//gulp.src('../synergy-web/src/main/java/**/*.java').pipe($.filter('!**/wsclient/**/*.java')).pipe($.sloc());
	//gulp.src('../synergy-web/src/main/webapp/scripts/*.js').pipe($.filter(['!**/jquery*.js','!**/highstock*.js'])).pipe($.sloc());

});


//Define the key for versioning off
gulp.task('bump', function bumpPackageVersion (done){
	//commented because this doesn't work gulp 4. not required any more now
	/*gulp.src('./package.json')
		.pipe(bump({key: "version", type: 'patch'}))
		.pipe(gulp.dest('./'));*/
	done();
});

// eek!
var synergyPublicWebsiteUrl = require('node-stringify')(function() {
	if (/quality/.test(window.location.host)) {
		return 'https://quality2.synergy.net.au/';
	}
	else if (/staging/.test(window.location.host)) {
		return 'https://staging.synergy.net.au/';
	}
	else {
		return 'https://www.synergy.net.au/';
	}
}).replace(/\s+/g, ' ');


gulp.task('devbuild', function compileDevBuild (done) {

	var hostname = 'localhost'
	var devhost1 = "127.0.0.1";
	var envConfig =
		{
			version: pkg.version,
			synergysite: '\'http://'+ hostname + ':8282/\'',
//        synergysite: '\'https://quality.synergy.net.au/\'',
		clienturl: 'http://' + hostname + ':8181',
		serverurl: 'http://' + hostname + ':8080',
		username: "'" + pkg.devSettings.username + "'",
		password: "'" + pkg.devSettings.password + "'"
	};

	console.log("build started at " + new Date());

	compile(envConfig, false).pipe(gulp.dest('dist'));

	console.log("build finished at " + new Date());
	done();
});


gulp.task('serverbuild',gulp.series('bump', function compileServerBuild (done) {

	var envConfig =
		{
			version: pkg.version,
			synergysite: synergyPublicWebsiteUrl + '()',
			clienturl: "' + 'https://'+window.location.host+'" + "/myaccount",
			serverurl: "' + 'https://'+window.location.host+'",
			username: 'undefined',
			password: 'undefined'
		};
	compile(envConfig, true)
		.pipe($.zip('myaccount.zip'))
		.pipe(gulp.dest('dist'));
	done();
}));

gulp.task('devminify', function compileMinify(done) {

	var envConfig =
		{
			version: pkg.version,
			clienturl: 'http://' + hostname + ':8181',
			serverurl: 'http://' + hostname + ':8080',
			username: "'" + pkg.devSettings.username + "'",
			password: "'" + pkg.devSettings.password + "'"
		};

	compile(envConfig, true)
		.pipe(gulp.dest('dist'));
	done();
});

gulp.task('devwatch', gulp.series('devbuild', function(done) {
	gulp.watch('FormsEngine/**', gulp.series('devbuild'));
	gulp.watch(['WebContent/**', '!WebContent/app/**/*Spec.js'], gulp.series('devbuild'));
	gulp.watch('build-tpls/**', gulp.series('devbuild'));
	gulp.watch('less/**', gulp.series('devbuild'));
	gulp.watch('sass/**', gulp.series('devbuild'));
	done();
}));

gulp.task('connect', function(done) {
	$.connect.server({
		root: 'dist',
		port: 8181,
		livereload: true
	});
	done();
});

gulp.task('devconnect', gulp.series('devwatch', function(done) {
	$.connect.server({
		root: 'dist',
		port: 8181,
		livereload: true
	});
	done();
}));

//--------------------------------------------------------------------------------
// gulp 4 alternative tasks - cleandist and cleanbuild(alternative for serverbuild)
//--------------------------------------------------------------------------------
var cleanbuild = gulp.series(cleandist, gulp.parallel('bump', build));

exports.cleandist = cleandist;
exports.cleanbuild = cleanbuild;
