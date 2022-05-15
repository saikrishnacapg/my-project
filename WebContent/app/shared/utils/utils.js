/* Utils Module */
angular
	.module('myaccount.utils')
	.factory('Utils', function ($log, $q, $sce, HTML5_DATE_FORMAT, Regex, SYNERGY_DATE_FORMAT, FileSaver, $timeout, customerTypeConstant) {
		this.activeTabI = '';
		this.isRebsFlowCheck = false;
		var adjustDate = function (startDate, numberOfMonths) {
			var result = moment(startDate);
			result.month(result.month() + numberOfMonths);
			return result;
		};

		function DateRange(startDate, rangeInMonths) {
			this.startDate = startDate;
			this.endDate = adjustDate(startDate, rangeInMonths);
			this.range = rangeInMonths;
		}

		var capitalize = function (input) {
			var ignoreList = ['WA', 'ACT', 'NSW', 'NT', 'SA', 'TAS', 'QLD', 'VIC'];
			if (!input || !angular.isString(input)) {
				return input;
			}
			var result = '';
			angular.forEach(input.split(' '), function (word) {
				if (ignoreList.indexOf(word) >= 0) {
					result += word + ' ';
				} else {
					result +=
						word.toLowerCase().replace(/\b[a-z]/g, function (letter) {
							return letter.toUpperCase();
						}) + ' ';
				}
			});

			return result.substring(0, result.length - 1);
		};

		var capitalizeCamelCase = function (string) {
			if (!string) {
				return '';
			}
			string = string.toString();
			return string.charAt(0).toUpperCase() + string.slice(1);
		};

		var promiseThenElse = function (promise, successCallback, failureCallback) {
			var func = angular.isFunction(successCallback)
				? successCallback
				: function () {
						return successCallback;
				  };
			return promise.then(
				func,
				failureCallback ||
					function (reason) {
						return $q.reject(reason);
					}
			);
		};

		var flattenJson = function (json, element, prepend) {
			var pancake = element || {};
			angular.forEach(
				json,
				function (val, key) {
					if (angular.isObject(val)) {
						flattenJson(val, pancake, key);
					} else {
						var property = !angular.isDefined(prepend) ? key : prepend + capitalizeCamelCase(key);
						pancake[property] = val;
					}
				},
				this
			);
			return pancake;
		};

		var utils = {
			/**
			 * Recursive utility method to get us the closest weekday in the past or future. If the
			 * initial search turns up a weekend, we will keep stepping back or forward a
			 * day until we hit a weekday.
			 *
			 * i.e. Utility.getWeekday('add', 3, 'months')
			 *
			 *  If this was executed on Thursday 11/4 it would return Thursday, 11/7
			 *  If this was executed on a Saturday 13/4 it would return Monday, 15/7
			 *
			 *  Utility.getWeekday('subtract', 3, 'months')
			 *
			 *  If this was executed on a Thursday 11/4 it would return Thursday, 11/01
			 *  If this was executed on a Saturday 13/4 it would return Friday, 12/01
			 *
			 * @param operator 'add ' or 'subtract': dictates whether we want a weekday in future or in the past
			 * @param value the number of units of time we want to go in the past / future to get a weekday
			 * @param unitOfTime the units of time to use with the value. 'days', 'week', 'month', 'year'....
			 * @param anchorDate if we would like to offset our search from a date. This is also used recursively to
			 * step back /forward a day for the case where the first search lands on a weekend.
			 * @returns {*}
			 */
			getWeekday: function (operator, value, unitOfTime, anchorDate) {
				var day = (anchorDate || moment())[operator](value, unitOfTime);

				return this.isWeekday(day) ? day : this.getWeekday(operator, operator === 'add' ? 1 : -1, 'days', day);
			},
			/**
			 * Self descriptive.
			 * @param moment
			 * @returns {boolean}
			 */
			isWeekday: function (moment) {
				return moment.day() > 0 && moment.day() <= 5;
			},

			// Returns false if the object is partially filled with values. Handy for forms.
			allOrNone: function (object) {
				var populated = [];
				var empty = [];
				// Next enable code starts
				var mobileObject = ['mobileTelephone', 'mobileTelephoneCountry', 'telephoneNumber', 'telephoneNumberCountry'];
				// Next enable code ends
				angular.forEach(object, function (value, key) {
					if (!_.isEmpty(value)) {
						populated.push(key);
					} else {
						// Next enable code starts
						var count = 0;
						var i = 0;
						for (; i <= mobileObject.length; i++) {
							if (key === mobileObject[i]) {
								count = count + 1;
							}
						}
						if (count === 0) {
							// Next enable code ends
							empty.push(key);
						}
					}
				});

				return populated.length === 0 || empty.length === 0;
			},
			// Assign the result of a promise to the specified scope
			assignUrl: function (scope, param, promise) {
				var success = function (result) {
					scope[param] = $sce.trustAsResourceUrl(result);
				};
				var failure = function (reason) {
					$log.error("failed to assign param " + param + " into scope");
				};
				promise.then(success, failure);
			},
			// Response transform to coerce into an array
			asQueryString: function (query) {
				var query_string = {};
				var vars = query.split('&');

				for (var i = 0; i < vars.length; i++) {
					var pair = vars[i].split('=');

					if (typeof query_string[pair[0]] === 'undefined') {
						query_string[pair[0]] = pair[1];
					} else if (typeof query_string[pair[0]] === 'string') {
						query_string[pair[0]] = [query_string[pair[0]], pair[1]];
					} else {
						query_string[pair[0]].push(pair[1]);
					}
				}
				return query_string;
			},
			asArray: function (obj) {
				if (obj === undefined) {
					return [];
				} else if (angular.isArray(obj)) {
					return obj;
				} else {
					return [obj];
				}
			},
			arrayUnique: function (array, isEqualFn) {
				var a = array.concat();
				for (var i = 0; i < a.length; ++i) {
					for (var j = i + 1; j < a.length; ++j) {
						if (isEqualFn(a[i], a[j])) {
							a.splice(j--, 1);
						}
					}
				}

				return a;
			},
			capitalize: capitalize,
			capitalizeCamelCase: capitalizeCamelCase,
			createDateRange: function (referenceDate, rangeInMonths) {
				if (rangeInMonths < 0) {
					return new DateRange(adjustDate(referenceDate, rangeInMonths), Math.abs(rangeInMonths));
				} else {
					return new DateRange(referenceDate, rangeInMonths);
				}
			},
			adjustDate: adjustDate,
			/**
			 * Recursively search an object for the specific keys and
			 * convert the iso8601 string to a Javascript date object.
			 *
			 * if keys are supplied will only convert properties with those names
			 * otherwise it will convert any string that matches the ISO 8601 standard
			 *
			 * @param object
			 * @param keys Array of property names, or RegExp
			 */
			convertStringsToDateByKeys: function (object, searchKeys) {
				// Slone the object
				var sourceObject = angular.copy(object, sourceObject);
				// Sheck to see if its a plain string
				if (angular.isString(sourceObject)) {
					return utils.convertISO8601ToDate(sourceObject);
				}

				// TODO move to top level
				var isMatchingKey = function (key) {
					var isMatching =
						!angular.isDefined(searchKeys) || // No search keys
						(angular.isArray(searchKeys) && searchKeys.indexOf(key) !== -1) || // SearchKeys is anarray containing key
						(searchKeys instanceof RegExp && key.match(searchKeys)); // SearchKeys is a RegExp matching key
					return isMatching;
				};

				// Search the object for iso8601 strings or by key if provided
				angular.forEach(sourceObject, function (value, key) {
					// If we have some keys
					if (angular.isObject(value)) {
						// Recurse down
						sourceObject[key] = utils.convertStringsToDateByKeys(value, searchKeys);
					} else if (angular.isArray(value)) {
						sourceObject[key] = utils.convertStringsToDateByKeys(value, searchKeys);
					} else if (angular.isString(value) && (!angular.isString(key) || isMatchingKey(key))) {
						// Found a matching key with a string value
						sourceObject[key] = utils.convertISO8601ToDate(value);
					}
				});
				return sourceObject;
			},
			/**
			 * Check a string conforms to the ISO 8601 standard and converts it to a date object
			 * @param dateSting
			 * @returns {Date}
			 */
			convertISO8601ToDate: function (dateSting) {
				if (Regex.DATEISO8601.exec(dateSting) !== null) {
					return moment(dateSting).toDate();
				} else {
					return dateSting;
				}
			},
			flattenJson: flattenJson,
			formatHTML5Date: function (date) {
				var parsedMoment = moment(date, HTML5_DATE_FORMAT);
				return parsedMoment.isValid() ? parsedMoment.format(SYNERGY_DATE_FORMAT) : date;
			},
			// Hardcoded determination of whether a date is considered peak in the SWIS
			isPeakElectricityInterval: function (date) {
				var day = date.getDay();
				var hourOfDay = date.getHours();
				var isWeekend = day === 0 || day === 6;
				var isPeak = hourOfDay >= 8 && hourOfDay <= 21;
				return !isWeekend || isPeak;
			},
			calcPowerFactor: function (kw, kva) {
				return kva !== null && kva !== 0 && kw !== null ? kw / kva : 0;
			},
			sum: function (arr) {
				var agg = 0;
				for (var i in arr) {
					if (typeof arr[i] === 'number') {
						agg += arr[i];
					}
				}
				return agg;
			},
			min: function (arr) {
				var min = null;
				var indexOfMin = 0;
				for (var i in arr) {
					if (typeof arr[i] === 'number' && (min === null || arr[i] < min)) {
						min = arr[i];
						indexOfMin = i;
					}
				}
				return { value: min, index: indexOfMin };
			},
			max: function (arr) {
				var max = null;
				var indexOfMax = 0;
				for (var i in arr) {
					if (typeof arr[i] === 'number' && (max === null || arr[i] > max)) {
						max = arr[i];
						indexOfMax = i;
					}
				}
				return { value: max, index: indexOfMax };
			},
			avg: function (arr) {
				var agg = 0;
				var count = 0;
				for (var i in arr) {
					if (typeof arr[i] === 'number') {
						agg += arr[i];
						count++;
					}
				}
				return count === 0 ? 0 : agg / count;
			},
			or: function (arr) {
				for (var i in arr) {
					if (arr[i]) {
						return true;
					}
				}
				return false;
			},
			contains: function (arr, value) {
				for (var i in arr) {
					if (arr[i] === value) {
						return true;
					}
				}
				return false;
			},
			getDay: function (startTime, interval, intervalLength) {
				return new Date(startTime.getTime() + intervalLength * interval);
			},
			getCreditCardType: function (ccNumber) {
				// Regex taken from prod synergy site (before angular)
				// Todo - use better algorithms?
				if (/^5[1-5]/.test(ccNumber)) {
					return 'mastercard';
				} else if (/^4/.test(ccNumber)) {
					return 'visa';
				} else if (/^3[47]/.test(ccNumber)) {
					return 'amex';
				}
				return null;
			},
			differenceBetweenMonths: function monthDiff(d1, d2) {
				var year1 = d1.getFullYear();
				var year2 = d2.getFullYear();
				var month1 = d1.getMonth();
				var month2 = d2.getMonth();
				if (month1 === 0) {
					// Have to take into account
					month1++;
					month2++;
				}

				var months = (year2 - year1) * 12 + (month2 - (month1 - 1));
				$log.log('number of months: ' + months);
				return months;
			},
			isNumber: function (n) {
				return !isNaN(parseFloat(n)) && isFinite(n);
			},
			isTruthy: function (bool) {
				return !_.isEmpty(bool) && (bool === 'true' || bool === true);
			},
			encodeURI: function (obj) {
				var url = '';
				for (var x in obj) {
					url += x + '=' + encodeURIComponent(obj[x]) + '&';
				}
				$log.log(url);
				return url;
			},
			/**
			 * Round the http code to the 100 value.
			 * i.e. httpCodeRange(499) === 400
			 * httpCodeRange(501) === 500
			 */
			httpCodeRange: function (httpCode) {
				var httpCodeNum = Number(httpCode);
				httpCodeNum /= Math.pow(10, 2);
				return Math.floor(httpCodeNum) * 100;
			},
			isServerError: function (httpCode) {
				return this.httpCodeRange(httpCode) === 500;
			},
			/**
			 * Used for the case where the date wasn't updated in the date picker.
			 * In this case we may have a moment / date in the variable rather than
			 * an HTML5 formatted date so we want to update it.
			 * @param date
			 * @returns {*}
			 */
			convertToHTML5Date: function (date) {
				return _.isString(date) ? date : moment(date).format(HTML5_DATE_FORMAT);
			},
			sanitiseContactDetails: function (contactDetails) {
				if (_.isEmpty(contactDetails.telephoneNumber) || _.isEmpty(contactDetails.telephoneNumberCountry)) {
					contactDetails.telephoneNumber = undefined;
					contactDetails.telephoneNumberCountry = undefined;
				}
				if (
					_.isEmpty(contactDetails.mobileTelephone) ||
					(contactDetails.typeOfMobile !== 'LOCAL' && _.isEmpty(contactDetails.mobileTelephoneCountry))
				) {
					contactDetails.mobileTelephone = undefined;
					contactDetails.mobileTelephoneCountry = undefined;
				}
			},
			promiseThen: promiseThenElse,
			promiseThenElse: promiseThenElse,
			reopenWizard: function (contractAccountNumber, fnWizard, fnWizardOpen) {
				$timeout(function () {
					return fnWizard();
				}).then(function () {
					$timeout(function () {
						return fnWizardOpen(contractAccountNumber);
					});
				});
			},
			chainPromises: function (promises) {
				return _.reduce(
					promises,
					function (result, promise) {
						return result ? result.then(promise) : promise();
					},
					undefined
				);
			},
			openPdf: function (pdfData, prefix) {
				var file = new Blob([pdfData], { type: 'application/pdf' });
				var filename = prefix + moment().format('_YYYYMMDDHHmm') + '.pdf';
				FileSaver.saveAs(file, filename);
			},
			setGoal: function (code, data) {
				return this.getFXMTrack('Goals', code, data);
			},
			setEvent: function (code, data) {
				return this.getFXMTrack('Events', code, data);
			},
			getFXMTrack: function (key, code, data) {
				if ($rootScope.fxmTrack && $rootScope.fxmTrack[key]) {
					if (typeof SCBeacon !== 'undefined' && $rootScope.fxmTrack[key][code] !== undefined && data) {
						SCBeacon.trackGoal($rootScope.fxmTrack[key][code], data);
					}
				}
				return true;
			},
			isEmptyString: function (string) {
				return string.length === 0 || string === '';
			},
			optionDevice : function(devices){
				var output = [], l = devices.length, i;

				for (i = 0; i < l; i++) {
					devices[i].id = devices[i].deviceId;
					devices[i].label =devices[i].customDeviceName!= "" ? devices[i].customDeviceName : devices[i].deviceId;
					output.push(devices[i]);
				}
				return output;
			},
			checkCustomerType: function(contractAccountType, customerType) {
				if ((contractAccountType === customerTypeConstant.ContractCustomertypeResi && customerType === customerTypeConstant.BusinessPartnerTypePerson) || (contractAccountType === customerTypeConstant.ContractCustomertypeSme && customerType === customerTypeConstant.BusinessPartnerTypeOrg)|| (contractAccountType === customerTypeConstant.BusinessPartnerTypeIANDC && customerType === customerTypeConstant.BusinessPartnerTypeOrg)){
					return  true;
				} else {
					return false;
				}
			},
			CheckURLErrorType:function(urlString) {
				if (urlString.indexOf("payment/downloadPdf")>-1 || urlString.indexOf("oneOffPayment/downloadPdf")>-1) {
					return  'E625';
				} else if ( urlString.indexOf("payment/notifyPaymentResultByEmail")>-1 || urlString.indexOf("oneOffPayment/notifyPaymentResultByEmail")>-1) {
					return  'E618';
				} else {
					return '';
				}
			},
			createCookie: function (name = "Cookie", value = '', expiresInDays = 60) {
				const millisecondsInDay = 1000 * 60 * 60 * 24;
				const expiryDate = new Date(Date.now() + (expiresInDays * millisecondsInDay)).toUTCString();
				const valueStr = (typeof value === 'object' ? angular.toJson(value) : value);

				let cookie = name + '-' + valueStr + '=';
				cookie += valueStr + ';';
				cookie += !value.session ? 'expires=' + expiryDate + ';' : '';
				cookie += value.secure ? 'secure;' : '';

				document.cookie = cookie;
			},
			doesCookieExist: function (name, value = '') {
				const cookieIdentifier = name + '-' + (typeof value === 'object' ? angular.toJson(value) : value) + '=';
				return document.cookie.split(';').some((item) => item.trim().startsWith(cookieIdentifier));
			}
		};

		return utils;
	});
