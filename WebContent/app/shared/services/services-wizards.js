/**
 * Event constants for inter-application communication are stored here
 */
angular
	.module("myaccount.shared.services")
	.factory("Wizards", function ($timeout, $location, $rootScope, Router, Session, DeviceMode, Events, Utils) {
		const NINE_DIGIT_ACCOUNT_NUMBER = 9;

		function getActiveAccountNumber() {
			// @see account.js
			// ... the accountIdentifier is a search parameter for this state (a bit hacky this)
			var accountIdentifier = $location.search()["accountIdentifier"];
			return Session.contractAccountNumberByIdentifier(accountIdentifier);
		}

		var open = function (formId, contractAccountNumber, args) {
			args = args || {};
			args.formId = formId;
			args.contractAccountNumber = contractAccountNumber || getActiveAccountNumber();

			$rootScope.$broadcast(Events.SHOW_MODAL_WIZARD, args);
		};

		var Wizards = {
			close() {
				$rootScope.$broadcast(Events.HIDE_MODAL_WIZARD); // Underlying value is used in Forms Engine. Don't inject into FormsEngine to minimize dependencies.
			},
			openOneClickRegister() {
				open("oneclickregister");
			},
			openChangePassword() {
				open("changeinpassword");
			},
			openLinkAccount() {
				open("linkaccount");
			},
			openRenewableEnergyApplication() {
				Utils.isRebsFlowCheck = true;
				open("des");
			},
			openRenewableRefundApplication(contractAccountNumber) {
				Utils.isRebsFlowCheck = true;
				var promise = Session.getAccount(contractAccountNumber);
				Utils.promiseThen(promise, function (result) {
					var renewableRefundActive = !_.isEmpty(result.rebsRefund.bsbNumber);
					var destination = renewableRefundActive ? "renewablerefund-status" : "renewablerefund";
					open(destination, contractAccountNumber);
				});
			},
			openPayAccount(contractAccountNumber) {
				open("payment", contractAccountNumber);
			},
			openCreditCard(contractAccountNumber, args) {
				contractAccountNumber = contractAccountNumber || getActiveAccountNumber();
				var destination = angular.isDefined(contractAccountNumber) ? "creditcard" : "creditcard-selectaccount";
				open(destination, contractAccountNumber, args);
			},
			openDirectDebit(contractAccountNumber, args) {
				args = args || {};
				var contractAccountNumber = contractAccountNumber
					? contractAccountNumber.length === NINE_DIGIT_ACCOUNT_NUMBER
						? `000${contractAccountNumber}`
						: contractAccountNumber
					: contractAccountNumber;
				var promise = Session.getAccount(contractAccountNumber);
				Utils.promiseThen(promise, function (result) {
					var hasDirectDebit = false;
					if (angular.isObject(result.paymentInfo)) {
						const { directDebitExists, directDebitInstalmentExists, directDebitP2PExists } = result.paymentInfo;
						hasDirectDebit = directDebitExists || directDebitInstalmentExists || directDebitP2PExists;
					}
					var destination = hasDirectDebit
						? args.skipInstalmentOption
							? "directdebit-setup-payment"
							: "directdebit-status"
						: "directdebit-setup";
					open(destination, contractAccountNumber, args);
				});
			},
			openPaperless(contractAccountNumber, args) {
				var contractAccountNumber = contractAccountNumber
					? contractAccountNumber.length === NINE_DIGIT_ACCOUNT_NUMBER
						? `000${contractAccountNumber}`
						: contractAccountNumber
					: contractAccountNumber;
				contractAccountNumber = contractAccountNumber || getActiveAccountNumber();
				var destination = angular.isDefined(contractAccountNumber) ? "paperless" : "paperless-selectaccount";
				open(destination, contractAccountNumber, args);
			},
			openManageAuthoriseContacts(contractAccountNumber) {
				contractAccountNumber = contractAccountNumber || getActiveAccountNumber();
				var destination = angular.isDefined(contractAccountNumber)
					? "authorise-contacts"
					: "mydetails-authorise-contacts-selectaccount";
				open(destination, contractAccountNumber);
			},
			openMyDetails(contractAccountNumber) {
				contractAccountNumber = contractAccountNumber || getActiveAccountNumber();
				var destination = angular.isDefined(contractAccountNumber) ? "mydetails-status" : "mydetails-selectaccount";
				open(destination, contractAccountNumber);
			},
			openMyDetailsEdit(contractAccountNumber, args) {
				contractAccountNumber = contractAccountNumber || getActiveAccountNumber();
				open("mydetails-edit", contractAccountNumber, args);
			},
			openConcessionCards(contractAccountNumber) {
				var promise = Session.getAccount(contractAccountNumber);
				Utils.promiseThen(promise, function (result) {
					var hasCards = angular.isDefined(result.concessionDetails) && result.concessionDetails.cards.length > 0;
					var destination = hasCards ? "concession-status" : "concession-addcard";
					open(destination, contractAccountNumber);
				});
			},
			openFeedback(contractAccountNumber) {
				// Change to pass through paraeterized processId for multiple feedback channels to different queues.
				open("feedback", contractAccountNumber, { processId: "seeandsave.pilot" });
			},
			openIntervalExport(contractAccountNumber) {
				open("intervalexport", contractAccountNumber);
			},
			openRESIIntervalExport(contractAccountNumber) {
				open("Resiintervalexport", contractAccountNumber);
			},
			openUnlinkAccount(contractAccountNumber) {
				open("unlinkaccount", contractAccountNumber);
			},
			openGreenEnergy(contractAccountNumber) {
				var promise = Session.getAccount(contractAccountNumber);
				Utils.promiseThen(promise, function (result) {
					var destination = result.productDetails.greenFlag ? "green-status" : "green-edit";
					open(destination, contractAccountNumber);
				});
			},
			openRenameDevice(contractAccountNumber) {
				open("renamedevice", contractAccountNumber);
			},
			openEnergyProfile(contractAccountNumber) {
				open("energyprofile", contractAccountNumber);
			},
			openBillHistoryExport(contractAccountNumber) {
				open("billhistoryexport", contractAccountNumber);
			},
			openUsageSummaryExport(contractAccountNumber) {
				open("usagesummaryexport", contractAccountNumber);
			},
			openViewArrangement(contractAccountNumber) {
				open("viewArrangement", contractAccountNumber);
			},
			openPayOptions(contractAccountNumber) {
				open("paymentOptions", contractAccountNumber);
			},
			openAMIIntervalExport(contractAccountNumber) {
				open("Amiiintervalexport", contractAccountNumber);
			},
			openSynergyAssistPlan(contractAccountNumber) {
				open("synergyAssistPlan", contractAccountNumber);
			}
		};

		return Wizards;
	});
