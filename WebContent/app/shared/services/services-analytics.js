angular.module('myaccount.shared.services').constant('AnalyticsConstant', {
	t2c: 'track to change',
	amiResidential: 'ami resi customer',
	amiBusiness: 'ami bus customer',
	synergyEngage: 'synergy engage',
	caseManagement: 'case management'
});

angular
	.module('myaccount.shared.services')
	.factory('AnalyticsServer', function (
		AdobeUserModel,
		AdobePageModel,
		AdobeProductModel,
		AdobeFormModel,
		$rootScope
	) {
		var AnalyticsServer = {
			pushAndUpdateData: function (data) {
				if (digitalData && angular.isFunction(digitalData.pushAndUpdate)) {
					var copiedData = angular.copy(data); // Copy data to remove reference of the object
					digitalData.pushAndUpdate(copiedData);
				}
			},
			trackPageLoad: function (pageData) {
				var data = {
					event: 'page-loaded',
					page: pageData,
					user: AdobeUserModel
				};
				this.pushAndUpdateData(data);
			},

			trackFormNavigation: function (formData) {
				var data = {
					event: 'form-navigate',
					form: formData,
					product: ''
				};
				if (AdobeProductModel && AdobeProductModel.name) {
					data.product = AdobeProductModel;
				}
				this.pushAndUpdateData(data);
			},
			trackFormInteraction: function (formData) {
				var data = {
					event: 'form-interact',
					form: formData,
					product: ''
				};
				if (AdobeProductModel && AdobeProductModel.name) {
					data.product = AdobeProductModel;
				}
				this.pushAndUpdateData(data);
			},
			flattenChildren: function (element) {
				var result = undefined;
				var childrenList = element.find('p:visible');
				if (childrenList.length > 0) {
					var children = [];
					for (var i = 0; i < childrenList.length; i++) {
						var child = childrenList[i];
						children.push(child.innerText.trim());
					}
					result = children.join();
				}
				return result;
			},
			handleException: function (element, location) {
				var childrenList = element.find('p:visible');
				if (childrenList.length > 0) {
					for (var i = 0; i < childrenList.length; i++) {
						var child = childrenList[i];
					}
				}
			},
			handleModalErrors: function (errors) {
				var adobeFormModel = angular.copy($rootScope.adobeFormModel || new AdobeFormModel());
				adobeFormModel.error = 'server - ' + errors;
				adobeFormModel.stage = 'incomplete';
				this.trackFormNavigation(adobeFormModel);
			},
			forceFormComplete: function (formData) {
				var adobeFormModel = angular.copy($rootScope.adobeFormModel || new AdobeFormModel());
				adobeFormModel.step = Number(adobeFormModel.step) + 1;
				adobeFormModel.stage = 'complete';
				adobeFormModel.stepName = 'complete';
				this.trackFormNavigation(adobeFormModel);
			},
			// Add or replace optionSelected to the analytics form model object
			addFormOptionSelection: function (optionSelectedKey, optionSelectedValue) {
				if ($rootScope.adobeFormModel && $rootScope.adobeFormModel.optionSelection) {
					let optionSelection = $rootScope.adobeFormModel.optionSelection;
					if (optionSelectedKey && optionSelectedValue && angular.isObject(optionSelection)) {
						Object.entries(optionSelection).forEach(([key]) => {
							if (key === optionSelectedKey) {
								optionSelection[optionSelectedKey.valueOf()] = optionSelectedValue;
								return;
							}
						});
						angular.extend(optionSelection, {
							[optionSelectedKey.valueOf()]: optionSelectedValue
						});
					}
				}
			}
		};

		return AnalyticsServer;
	})
	.factory('AdobePageModel', function () {
		function AdobePageModel() {
			this.destinationUrl = '';
			this.pageName = '';
			this.pageName = '';
			this.abort = '';
			this.platform = '';
			this.environment = '';
			this.virtualUrl = '';
		}
		return AdobePageModel;
	})
	.factory('AdobeFormModel', function () {
		function AdobeFormModel() {
			this.name = '';
			this.stage = '';
			this.step = '';
			this.stepName = '';
			this.type = 'self serve';
			this.category = '';
			this.subCategory = '';
			this.error = '';
			this.lastFieldInteractedId = '';
			this.lastFieldInteractedName = '';
			this.optionSelection = {};
		}
		return AdobeFormModel;
	})
	.factory('AdobeProductModel', function () {
		return {
			name: '',
			id: ''
		};
	})
	.factory('AdobeUserModel', function () {
		return {
			userIdHashed: '',
			authState: '',
			userType: '',
			businessPortalNumber: '',
			businessPortalAccessCode: '',
			userSubType: []
		};
	});
