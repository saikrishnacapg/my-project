/**
 * event constants for inter-application communication are stored here
 * TODO should we break this down into sections?
 */
angular.module('myaccount.conf').constant('Events', {
	LOGIN_STATUS: 'login_status',  //LoginStatus
    DEVICE_CHANGE: 'device_change', // The client area of the device has changed,
	ACCOUNT_LIST_INVALIDATED: 'account_list_invalidated', // account list is no longer valid (eg account linked/unlinked)
	ACCOUNT_INVALIDATED: 'account_invalidated', // account is no longer valid (eg account was updated),
	HISTORY_UPDATED: 'history_updated', // account history was updated (eg account was updated),
    INTERVAL_DOWNLOAD: 'interval_download', // chart should initiate a download
    INTERVAL_PRINT: 'interval_print', // chart should initiate a download
    INTERVAL_EMAIL: 'interval_email', // chart should initiate a download
    FORM_SUBMITTED: 'form_submitted', // a form was submitted
    DATA_RESET: 'data_reset', // data was reset
    SHOW_MODAL_WIZARD: 'show_modal_wizard', // request to show a modal wizard
    HIDE_MODAL_WIZARD: 'hide_modal_wizard' // request to terminate a modal wizard
}).constant('customerTypeConstant', {
    ContractCustomertypeSme:'SME',
    ContractCustomertypeResi:'RESD',
    BusinessPartnerTypePerson:'Person',
    BusinessPartnerTypeOrg:'Organization',
    BusinessPartnerTypeIANDC:'I&C'
});

angular.module('myaccount.conf').constant('BrowsersConfig', {
    MSIE: {
        minVersion: 11,
        downloadUrl: 'http://www.microsoft.com/en-au/download/internet-explorer.aspx'
    },
    CHROME: {
        minVersion: 65,
        downloadUrl: 'http://www.google.com/chrome'
    },
    SAFARI: {
            minVersion: 10,
            downloadUrl: 'http://support.apple.com/en_AU/downloads/safari'
        },
    FIREFOX:{
        minVersion: 55,
        downloadUrl: 'http://www.mozilla.org/en-US/firefox/new'
    }
});

angular.module('myaccount.wizard').constant('Source', {sourceId: "MyAccount"});
