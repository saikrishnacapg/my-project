angular
	.module('myaccount.directives').directive('syBrowser', function syBrowserDirective(bowser){
		return {
			restrict: 'E',
			templateUrl: 'app/shared/directives/sy-browser-directive.html',
			controller: function ($q, $cookies, BrowsersConfig){
				var cookieName = 'synergy.browsercompatibilityalert'
				var self = this;
				self.bowser = bowser;
				self.downloadUrl = '';
				self.browserName = bowser.name;
				self.minVersion = '';
				self.hide = false;
				self.showUnsupported = false;
				self.showIncompatible = false;
				self.IE_browser = false;
				if (bowser.msie) {
					self.hide = false;
					self.IE_browser = true;
				} else {
					self.IE_browser = false;
					self.hide = $cookies.get(cookieName) || false;
				}
				self.closeBanner = function(){
					if (!bowser.msie) {
						self.hide = true;
						$cookies.put(cookieName, true, { expires: moment().add(1, 'months').toDate() });
					} else {
						self.hide = false;
						$cookies.put(cookieName, false, { expires: moment().add(1, 'months').toDate() });
					}
				}
				self.isCompatible = function(){
					if (bowser.msie) {
						self.minVersion = '';
						self.downloadUrl = BrowsersConfig.MSIE.downloadUrl;
					} else if (bowser.chrome) {
						self.minVersion = BrowsersConfig.CHROME.minVersion;
						self.downloadUrl = BrowsersConfig.CHROME.downloadUrl;
					} else if (bowser.safari) {
						self.minVersion = BrowsersConfig.SAFARI.minVersion;
						self.downloadUrl = BrowsersConfig.SAFARI.downloadUrl;
					} else if (bowser.firefox) {
						self.minVersion = BrowsersConfig.FIREFOX.minVersion;
						self.downloadUrl = BrowsersConfig.FIREFOX.downloadUrl;
					}
					return bowser.version >= self.minVersion;
				}

				self.isBrowserIncompatible = function(){
					// Defect #2248 - detect for desktop only
					if (bowser.mobile || bowser.tablet || bowser.msedge){
						return false;
					}
					self.showUnsupported = self.minVersion === '';
					self.showIncompatible = self.minVersion !== '' && !self.isCompatible();
					return !self.isCompatible() || self.minVersion === '';
				}
			},
			controllerAs: 'syBrowserCtrl'
		}
	});
