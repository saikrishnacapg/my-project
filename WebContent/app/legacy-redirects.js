/**
 * Created by m063158 on 19/10/2015.
 *
 * Special redirection logic to accomodate rules for existing MyAccount forms that are identified by their hash
 * ... these redirections can't be processed on the server, but we can do them here
 */

// IE hack for window.location.origin
if (!window.location.origin) {
    window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
}
 
var HASH_REDIRECTIONS = {
    '#/forms/business-signup': '/moving.html',
    '#/forms/changepassword': '/my-account.html',
    '#/forms/concession-status': true,
    '#/forms/contactus': 'https://www.synergy.net.au/contact',
    '#/forms/forgotcredentials': '/my-account.html',
    '#/forms/latepayment': '/payment-extension.html',
    '#/forms/moving': '/moving.html',
    '#/forms/oneclickregister': true,
    '#/forms/paperless-signup': '/paperless.html',
    '#/forms/pay': '/pay-my-bill.html',
    '#/forms/rebs': '#/forms/des',
    '#/forms/des': true,
    '#/forms/register': '/my-account-registration.html',
    '#/forms/residential-signup': '/moving.html',
    '#/terms-and-conditions': true
};
var match = HASH_REDIRECTIONS[document.location.hash.split('?')[0]];
if (match) {
    if (typeof match === 'string') {
        if (match.charAt(0) === '/') {
            match = window.location.origin + match;
        }

        // goto the newPath
        document.location.href = match;
    }
    else {
        // goto myaccount
        document.location.href = window.location.origin + '/myaccount/' + document.location.hash;
    }
}

