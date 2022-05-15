angular.module('myaccount.directives').directive('syContactDetails', function () {
    return {
        restrict: 'A',
        replace: false,
        scope: {
            contactDetails: '=',
            modifiedFields: '=?',
            addressSuggestions: '=?',
            readOnlyFields: '=?',
            suggestions: '=',
            maskMobile: '@',
            maskEmail: '@',
            addAddress: '&', // For address search
            inlineAddress: '=?' // Use inline address lookup
        },
        templateUrl: 'app/shared/directives/sy-contact-details.html',
        link: function (scope, element, attrs, ctrl) {
            element.on('$destroy', function () {
                ctrl.cleanup();
            });
        },
        controller: /* ngInject */  function ($scope, $attrs, Utils, ValidationService, Regex, Modals, Session) {
            const self = this;
            this.localAreas = ValidationService.getLocalAreaCodes();

            let promise = ValidationService.getInternationalAreaCodes();
            Utils.promiseThen(promise, function (result) {
                result.unshift({ countrycode: '', countryname: '-- Select code --' });
                self.internationalAreas = result;
            });

            this.addAddress = $scope.addAddress;

            this.addressSuggestions = $scope.addressSuggestions || [];
            $scope.modifiedFields = $scope.modifiedFields || {};
            $scope.readOnlyFields = $scope.readOnlyFields || {};
            $scope.invalidEmail = false;
            $scope.parentMandatoryMsg = $attrs.isMandatoryMsg;

            // Evaluate exclude block on the parent scope so that the caller can input an expression
            $scope.exclude = $scope.$parent.$eval($attrs.exclude);
            $scope.parentRequires = $scope.$parent.$eval($attrs.isRequired);

            $scope.isRequired = function () {
                return $scope.parentRequires;
            };

            $scope.isMandatoryMsg = function () {
                return !($scope.parentMandatoryMsg === 'No');
            };

            this.cleanup = function () {
                if (this.emptyLandline()) {
                    this.clearLandline();
                }
                if (this.emptyMobile()) {
                    this.clearMobile();
                }
            };

            this.emptyLandline = function () {
                return (
                    _.isEmpty($scope.contactDetails.telephoneNumber) ||
                    _.isEmpty($scope.contactDetails.telephoneNumberCountry)
                );
            };

            this.emptyMobile = function () {
                const { mobileTelephone, typeOfMobile, mobileTelephoneCountry } = $scope.contactDetails;
                return _.isEmpty(mobileTelephone) || typeOfMobile !== 'LOCAL' && _.isEmpty(mobileTelephoneCountry);
            };

            this.clearLandline = function () {
                $scope.contactDetails.telephoneNumber = '';
                $scope.contactDetails.telephoneNumberCountry = '';
            };

            this.clearMobile = function () {
                $scope.contactDetails.mobileTelephone = '';
                $scope.contactDetails.mobileTelephoneCountry = '';
            };

            this.clearMobileCountry = function () {
                $scope.contactDetails.mobileTelephoneCountry = '';
            };

            this.noPhoneNumbersPresent = function () {
                return this.emptyLandline() && this.emptyMobile();
            };

            this.mobileCountryCodeRequired = function () {
                const { typeOfMobile, mobileTelephone } = $scope.contactDetails
                return (typeOfMobile === '' || typeOfMobile !== 'LOCAL') && !_.isEmpty(mobileTelephone);
            }

            this.areaCodeRequired = function () {
                const { typeOfLandPhone, telephoneNumber } = $scope.contactDetails
                return (typeOfLandPhone !== '' || typeOfLandPhone !== 'OTHER') && !_.isEmpty(telephoneNumber)
            };

            this.handleMobileRadio = function (event) {
                const { value } = event.target;
                const mobileType = $scope.contactDetails.typeOfMobile;

                this.clearMobile();

                if (value === 'LOCAL') {
                    $scope.contactDetails.mobileTelephoneCountry = 'AU';
                }
                // If the same radio is click, then toggle it on/off by setting type of land line.
                if (value === mobileType) {
                    $scope.contactDetails.typeOfMobile = '';
                }
            };

            this.handleLandlineRadio = function (event) {
                const { value } = event.target;
                const landlineType = $scope.contactDetails.typeOfLandPhone;

                this.clearLandline();

                // Don't reset the international drop down, just reset the local area
                if (value === 'LOCAL' || value === 'OTHER') {
                    $scope.contactDetails.telephoneNumberCountry = '08';
                }
                // If the same radio is click, then toggle it on/off by setting type of land line.
                if (value === landlineType) {
                    $scope.contactDetails.typeOfLandPhone = '';
                }
            };

            this.isResidential = function () {
                return Session.isResidential();
            }

            this.getNameType = function () {
                return this.isResidential() ? 'name' : 'organisation name';
            }

            this.getUpdateDetailsLink = function () {
                return this.isResidential() ? 'residential.updateDetailsLink' : 'business.updateDetailsLink';
            }

            this.openDetailsModal = function () {
                Modals.showModalAlert('Update details', 'app/routes/user/account/detail-update.html', [null, 'OK'], null, self,  undefined, { ok: "Close" });
            }

            // TODO Needs to be refactored.
            if (!$scope.exclude.phone) {
                const {
                    telephoneNumber,
                    telephoneNumberCountry,
                    mobileTelephone,
                    mobileTelephoneCountry
                } = $scope.contactDetails;

                const isInternational = !/^(AU)|(^[0-9]+$)|^$/u.test(telephoneNumberCountry);

                const isNonGeographic =
                    telephoneNumber.startsWith('13') ||
                    telephoneNumber.startsWith('18') ||
                    telephoneNumber.startsWith('19');

                if (telephoneNumber && telephoneNumberCountry) {
                    if (isInternational) {
                        $scope.contactDetails.typeOfLandPhone = 'INT';
                    } else if (isNonGeographic) {
                        $scope.contactDetails.typeOfLandPhone = 'OTHER';
                    } else {
                        $scope.contactDetails.typeOfLandPhone = 'LOCAL';
                        const areaCodeLength = 2;
                        const startIndex = 0;

                        if (telephoneNumber.startsWith('0')) {
                            let tempAreaCode = telephoneNumber.substring(startIndex, areaCodeLength);
                            $scope.contactDetails.telephoneNumberCountry = _.includes(
                                _.pluck(self.localAreas, 'id'),
                                tempAreaCode
                            )
                                ? tempAreaCode
                                : 'UNKNOWN';
                            $scope.contactDetails.telephoneNumber = telephoneNumber.substring(areaCodeLength);
                        } else if (!telephoneNumberCountry.startsWith('0')) {
                            // Already parsed
                            $scope.contactDetails.telephoneNumberCountry = 'UNKNOWN';
                        }
                    }
                } else {
                    $scope.contactDetails.typeOfLandPhone = '';
                }

                //Now for mobile
                if (mobileTelephone && mobileTelephoneCountry && mobileTelephoneCountry !== 'AU') {
                    // If the number does not starts with 0, then it's international.
                    $scope.contactDetails.typeOfMobile = 'INT';
                } else if (mobileTelephone && mobileTelephoneCountry === 'AU') {
                    $scope.contactDetails.typeOfMobile = 'LOCAL';
                    $scope.contactDetails.mobileTelephoneCountry = 'AU';
                } else {
                    $scope.contactDetails.typeOfMobile = '';
                    $scope.contactDetails.mobileTelephoneCountry = 'AU';
                }
            }

            $scope.contactNameFields = $scope.contactNameFields || false;

            $scope.updateMobileNumber = function () {
                $scope.maskMobile = false;
                $scope.modifiedFields.mobileTelephone = $scope.contactDetails.mobileTelephone.replace(/[\s]/gu, '');
            };

            $scope.mobilePattern = function () {
                return !$scope.maskMobile ? Regex.MOBILE_NUMBER : Regex.MOBILE_NUMBER_MASKED;
            };

            $scope.mobileIntPattern = function () {
                return !$scope.maskMobile ? Regex.LAND_NUMBER : Regex.MOBILE_NUMBER_MASKED;
            };

            $scope.updateEmail = function () {
                $scope.maskEmail = false;
                $scope.modifiedFields.emailAddress = $scope.contactDetails.emailAddress;
            };

            $scope.emailPattern = function () {
                return !$scope.maskEmail ? Regex.EMAIL_ADDRESS : Regex.EMAIL_ADDRESS_MASKED;
            };

            $scope.isMobileValid = function () {
                $scope.invalidMobile = false;
                if (!$scope.maskMobile && $scope.contactDetails.mobileTelephone) {
                    let promise = ValidationService.validateMobile(
                        $scope.contactDetails.mobileTelephone,
                        $scope.contactDetails.mobileTelephoneCountry
                    );

                    const success = function (result) {
                        $scope.invalidMobile = _.safeAccess(result, 'status') === 'error';
                    };
                    const failure = function () {
                        $scope.invalidMobile = false;
                    };

                    promise.then(success, failure);
                }
            };
            $scope.isREBSFlow = () => {
                const negativeOne = -1;
                return window.location.href.indexOf('des') > negativeOne || Utils.isRebsFlowCheck === true;
            };
        },
        controllerAs: 'contactDetailsCtrl'
    };
});
