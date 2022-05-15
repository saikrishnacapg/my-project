"use strict";

var initInjector = angular.injector(["ng"]);
var $http = initInjector.get("$http");
var $q = initInjector.get("$q");
var $rootScope = initInjector.get("$rootScope");

var loadMessagesPromise = $http({
	method: "GET",
	url: "/messages/messages.json",
	withCredentials: true
});

var FXMTrackingPromise = $http({
	method: "GET",
	url: window.AppConfig.urls.server + "/customerValidation/getFXMLGoals.json",
	withCredentials: true,
	httpCodes: ["all"]
});

// Application modules
var modules = [
	"myaccount.conf",
	"myaccount.providers",
	"myaccount.directives",
	"myaccount.route",
	"myaccount.shared.services",
	"myaccount.shared.controllers",
	"myaccount.stage",
	"myaccount.utils",
	"myaccount.wizard"
];

// Mock configuration
if (window.AppConfig.mock) {
	modules.unshift("mock");
}

// External modules
var dependencies = [
	"formsengine",
	"ui.router",
	"ngTouch",
	"ngCookies",
	"ngAnimate",
	"ngFileSaver",
	"ngSanitize",
	"ngTouch",
	"ajoslin.promise-tracker",
	"angulartics",
	"angulartics.google.analytics",
	"mgcrea.ngStrap",
	"LocalStorageModule",
	"angularFileUpload",
	"angularLoad",
	"jlareau.bowser",
	"rzSlider",
  'angularjs-dropdown-multiselect',
	"ui.router.state.events"
];

// Declare app level module which depends on filters, and services
angular.module("myaccount", modules.concat(dependencies));

// The following modules use an anti-pattern I'm calling "shared module name"
// Which requires them to be included in a specific order in the index.html file
// TODO fix this
angular.module("myaccount.shared.services", []);
angular.module("myaccount.providers", []);
angular.module("myaccount.conf", [
	"myaccount.shared.services",
	"myaccount.providers",
	"formsengine",
	"ui.router",
	"mgcrea.ngStrap",
	"LocalStorageModule",
  "angularjs-dropdown-multiselect",
	"ui.router.state.events"
]);
angular.module("myaccount.directives", []);
angular.module("myaccount.shared.controllers", []);
angular.module("myaccount.stage", []);
angular.module("myaccount.utils", []);
angular.module("myaccount.route", []);
angular.module("myaccount.wizard", []);
angular.module("myaccount.templates", []);

$q.all([loadMessagesPromise, FXMTrackingPromise]).then(
	function success(results) {
		// Start up the main application normally
		var resultNoHTMLCharCode = results[0].data;
		var FXMTrackingPromise = results[1].data;
		_.each(resultNoHTMLCharCode, function (value, key) {
			resultNoHTMLCharCode[key] = value.split("&#44;").join(",");
		});
		$rootScope.messages = resultNoHTMLCharCode;
		$rootScope.fxmTrack = FXMTrackingPromise;
	},
	function failure(failureReason) {
		// eslint-disable-next-line no-console
		console.log(failureReason);
	}
);
