/**
 * Session object
 *
 * All user/businessPartner/account information is here
 *
 * methods to get accounts will return a promise, this is to handle the fact that account data changes and may need to be reloaded
 */

angular
	.module("myaccount.shared.services")
	.factory("Session", function (
		$log,
		$q,
		$location,
		$timeout,
		$rootScope,
		ClientStorage,
		SessionServer,
		WelcomeServer,
		Events,
		Utils,
		SynergyLogoutPage,
		AnalyticsConstant
	) {
		var session = {
			user: undefined,
			businessPartners: [],
			_accountList: undefined, // Note that if account is unlinked it remains in this session until the user does a logout
			_accountDetails: {}, // Keyed on caNumber, each value may hold the http promise or the actual account object
			userSubType: ["n/a"],
			currentContractAccountNumber: undefined,
			accountIdentifierByCAN: function (can) {
				var account = session.findAccountByCAN(can);
				return !_.isEmpty(account) ? account[0].accountIdentifier : undefined;
			},
			contractAccountNumberByIdentifier: function (id) {
				var account = session.findAccountByIdentifier(id);
				return !_.isEmpty(account) ? account[0].contractAccountNumber : undefined;
			},
			skipHome: function () {
				var activecount = 0;
				var Inactivecount = 0;
				for (var i = 0; i < session._accountList.length; i++) {
					if (!session._accountList[i].active) {
						Inactivecount++;
					} else if (session._accountList[i].active) {
						activecount++;
					}
				}
				if (activecount === 1) {
					return true;
				} else if (
					(activecount === 0 && Inactivecount === 0) ||
					(activecount === 0 && Inactivecount > 0) ||
					(activecount > 0 && Inactivecount > 0)
				) {
					return false;
				}
				return true;
				// Return /*session._accountList && */session._accountList.length === 1;
			},
			findAccountByIdentifier: function (id) {
				return _.where(session._accountList, { accountIdentifier: id });
			},
			findAccountByCAN: function (can) {
				return _.where(session._accountList, { contractAccountNumber: can });
			},
			isLoggedIn: function () {
				return angular.isObject(session.user); //
			},
			resume: function () {
				var promise = SessionServer.resume(); // We will handle 401
				return Utils.promiseThen(promise, function (result) {
					// Special red-carpet logic for first time users
					if (result.newRegistration) {
						WelcomeServer.rollOutRedCarpetFor("dashboard");
						if (result.customerType === "I&C") {
							WelcomeServer.rollOutRedCarpetFor("splash");
						}
					}

					session._start(result);
				});
			},
			login: function (username, password) {
				var promise = SessionServer.login(username, password);

				var success = function (result) {
					session._start(result);
				};

				var failure = function (reason) {
					$log.info("Session.login failure" + reason);
					session._invalidate();
					return $q.reject(reason);
				};

				return promise.then(success, failure);
			},
			logout: function () {
				// TODO determine what course of action to take if the server can't be contacted
				var promise = SessionServer.logout();
				var success = function (result) {
					$log.info("logout success" + result);

					return $q.when(result);
				};
				var failure = function (reason) {
					$log.info("logout failed: " + reason);
				};
				promise.finally(function () {
					session._invalidate();
					window.location = SynergyLogoutPage;
				});

				return promise.then(success, failure);
			},
			// Returns a promise
			getAccountList: function (optionalContractAccountType) {
				if (!session.isLoggedIn()) {
					// Empty account list if we are not logged in
					return $q.when([]);
				}

				var promise;
				if (angular.isDefined(session._accountList)) {
					// Already got _accountList
					promise = $q.when(session._accountList);
				} else {
					// Load _accountList
					promise = Utils.promiseThen(SessionServer.getAccountList(), function (result) {
						session._accountList = result;
						return session._accountList;
					});
				}

				// Lastly do the filtering
				return Utils.promiseThen(promise, function (result) {
					return optionalContractAccountType
						? _.filter(result, function (account) {
								return account.contractAccountType === optionalContractAccountType;
						  })
						: result;
				});
			},
			//Returns a promise
			getBPAccountList: function (contractAccountNumber) {
				//Var promise;
				//Promise = Utils.promiseThen(SessionServer.getBPAccountList(), function(result){
				// Return result;
				//});
				return $q.when(SessionServer.getBPAccountList(contractAccountNumber));
			},
			// Returns a promise
			getAccount: function (contractAccountNumber) {
				session.currentContractAccountNumber = contractAccountNumber;
				if (!session.isLoggedIn()) {
					return $q.reject("Not Logged In");
				} else if (!angular.isDefined(session._accountDetails[contractAccountNumber])) {
					// Setup a new promise
					session._accountDetails[contractAccountNumber] = SessionServer.getAccountDetails(contractAccountNumber);

					var success = function (result) {
						// Replace the promise with the resolved object
						session.addUserSubType(result);
						session._accountDetails[contractAccountNumber] = result;
					};

					var failure = function (reason) {
						// Unset the account
						session.invalidateAccount(contractAccountNumber);
					};

					session._accountDetails[contractAccountNumber].then(success, failure);
				}
				return $q.when(session._accountDetails[contractAccountNumber]);
			},
			// Returns a promise
			getCollectiveAccountDetails: function (parentContractAccountNumber, childContractAccountNumber) {
				if (!session.isLoggedIn()) {
					return $q.reject("Not Logged In");
				} else if (!angular.isDefined(session._accountDetails[childContractAccountNumber])) {
					// Setup a new promise
					session._accountDetails[contractAccountNumber] = SessionServer.getCollectiveAccountDetails(
						parentContractAccountNumber,
						childContractAccountNumber
					);

					var success = function (result) {
						// Replace the promise with the resolved object
						session._accountDetails[childContractAccountNumber] = result;
					};

					var failure = function (reason) {
						// Unset the account
						session.invalidateAccount(childContractAccountNumber);
					};

					session._accountDetails[childContractAccountNumber].then(success, failure);
				}
				return $q.when(session._accountDetails[childContractAccountNumber]);
			},
			invalidateAccount: function (contractAccountNumber) {
				// Remove the account (note may be a promise)
				delete session._accountDetails[contractAccountNumber];
				$timeout(function () {
					$rootScope.$broadcast(Events.ACCOUNT_INVALIDATED, contractAccountNumber);
				}, 250);
			},
			invalidateAccountList: function () {
				// Remove the account list (note may be a promise)
				session._accountList = undefined;

				$rootScope.$broadcast(Events.ACCOUNT_LIST_INVALIDATED, []);
			},
			/**
			 * Checks if the current user is residential
			 * // TODO there are more customer type than resd which are residential so need to update this list
			 *
			 * @returns {boolean}
			 */
			isResidential: function () {
				var customerTypes = ["RESD", "RESIDENTIAL"];
				if (customerTypes.indexOf(session.user.customerType) !== -1) {
					return true;
				}
				return false;
			},
			_start: function (userData) {
				session.user = userData.user;
				session._accountList = userData.accountList;
				session._accountDetails = {};
				session.businessPartners = userData.businessPartners;
				$rootScope.$broadcast(Events.LOGIN_STATUS, true);
			},
			/**
			 * Invalidates the session
			 */
			_invalidate: function () {
				session.user = undefined;
				session.businessPartners = [];
				session._accountList = undefined;
				session._accountDetails = {};

				// Broadcast the login status change
				$rootScope.$broadcast(Events.LOGIN_STATUS, false);
			},
			addUserSubType: function (result) {
				angular.extend(result, { userSubType: ["n/a"] });
				session.addTracktoChangeSubType(result);
				session.addAMISubType(result);
				session.addSynergyEngageSubType(result);
				session.addCaseManagementSubType(result);
			},
			pushSubType: function (value, result) {
				if (value && result.userSubType && result.userSubType.indexOf(value) < 0) {
					var position = result.userSubType.indexOf("n/a");
					if (~position) {
						result.userSubType.splice(position, 1);
					}
					result.userSubType.push(value);
				}
			},
			addTracktoChangeSubType: function (result) {
				if (result.productDetails && result.productDetails.isTrackToChange) {
					session.pushSubType(AnalyticsConstant.t2c, result);
				}
			},
			addAMISubType: function (result) {
				if (result.meterType && result.meterType.isAmi && result.meterType.isInterval) {
					if (session.isResidential()) {
						session.pushSubType(AnalyticsConstant.amiResidential, result);
					} else {
						session.pushSubType(AnalyticsConstant.amiBusiness, result);
					}
				}
			},
			addSynergyEngageSubType: function (result) {
				if (result.productDetails && result.productDetails.isSynergyEngage) {
					session.pushSubType(AnalyticsConstant.synergyEngage, result);
				}
			},
			addCaseManagementSubType: function (result) {
				if (result.productDetails && result.productDetails.isCaseManaged) {
					session.pushSubType(AnalyticsConstant.caseManagement, result);
				}
			}
		};
		return session;
	});

angular.module("myaccount.shared.services").factory("SessionServer", function ($injector, $log, $q, Utils, http) {
	var SessionServer = {
		login: function (username, password) {
			return http({
				method: "POST",
				url: "/session/login.json",
				data: { username: username, password: password },
				httpCodes: ["all"]
			});
		},
		logout: function () {
			return http({
				method: "POST",
				url: "/session/logout.json",
				httpCodes: ["all"]
			});
		},
		resume: function () {
			return http({
				method: "POST",
				url: "/session/resume.json",
				httpCodes: ["all"]
			});
		},
		getAccountList: function () {
			return http({
				method: "POST",
				url: "/account/index.json",
				httpCodes: ["all"]
			});
		},
		getBPAccountList: function (contractAccountNumber) {
			return http({
				method: "POST",
				url: "/account/" + contractAccountNumber + "/indexBPAccounts.json"
				//HttpCodes: ['all']
			});
		},
		getAccountDetails: function (contractAccountNumber) {
			var deferred = $q.defer();
			var promise = http({
				method: "POST",
				url: "/account/" + contractAccountNumber + "/show.json"
			});

			var success = function (result) {
				var converted = Utils.convertStringsToDateByKeys(result, /\w+Date/);
				deferred.resolve(converted);
			};

			var failure = function (reason) {
				deferred.reject(reason);
			};

			promise.then(success, failure);
			return deferred.promise;
		},
		getCollectiveAccountDetails: function (parentContractAccountNumber, childContractAccountNumber) {
			var deferred = $q.defer();
			var promise = http({
				method: "POST",
				url: "/account/" + parentContractAccountNumber + "/" + childContractAccountNumber + "/showChild.json"
			});

			var success = function (result) {
				var converted = Utils.convertStringsToDateByKeys(result, /\w+Date/);
				deferred.resolve(converted);
			};

			var failure = function (reason) {
				deferred.reject(reason);
			};

			promise.then(success, failure);
			return deferred.promise;
		}
	};

	return SessionServer;
});
