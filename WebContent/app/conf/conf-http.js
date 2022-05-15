angular.module('myaccount.conf').config(function ($httpProvider) {

    // Enable CORS (Cross-Origin Resource Sharing) for MyAccount/BPoint
    // @see http://better-inter.net/enabling-cors-in-angular-js/
    //Delete $httpProvider.defaults.headers.common['X-Requested-With'];
    // $httpProvider.defaults.useXDomain = true;

    // More CORS
    // @see http://stackoverflow.com/questions/13734686/communication-between-angularjs-and-a-jersey-webservice-which-are-on-a-different/14111039#14111039
    //$httpProvider.defaults.withCredentials = true;
    //$httpProvider.defaults.useXDomain = true;

    // To redirect api calls to grails.
    $httpProvider.interceptors.push('UrlHttpInterceptor');

    $httpProvider.defaults.withCredentials = true;
    // Set the base url for all restangular requests
    //RestangularProvider.setBaseUrl(MyAccountServer);
});

angular.module('myaccount.conf').factory('UrlHttpInterceptor', function ($q, $rootScope, $log, Session, Busy, MyAccountApps, MyAccountServer, Modals, Router, Utils) {
    return {
        request: function (config) {
            if ( // When not html template
              config.url.search(/\.html/) == -1 &&
              // And not accessing a specific url
              config.url.search('http') == -1 &&
              // Not reading local file
              !angular.isDefined(config.local)
            ) {
                // Put the api url onto the front of the request
                config.url = (config.apps ? MyAccountApps : MyAccountServer)+ config.url;

                // Always include a promiseTracker unless it is subtle tasks like non-critical validation.
                // This will enable the default busy indicator for the application (defined in index.html).
                if (!config.maintenance) {
                    var names = Busy.getDoing();
                    config.tracker = names.length ? names : ['global'];
                }
            }

            return $q.when(config);
        },
        response: function(response) {
            if (response.headers('Synergy-Account-Updated')) {
                Session.invalidateAccount(response.headers('Synergy-Account-Updated'));
            }
            if (response.headers('Synergy-Account-List-Updated')) {
                Session.invalidateAccountList();
            }

            return response;
        },
        responseError: function(response) {
            var promise;
            var success;
            var clientWillHandle = false;

            if (response.config &&
              angular.isDefined(response.config.httpCodes)) {
                var httpCodes = angular.isArray(response.config.httpCodes) ? response.config.httpCodes : [response.config.httpCodes];
                clientWillHandle = httpCodes.indexOf(response.status) !== -1 || httpCodes.indexOf('all') !== -1;
            }

            if (clientWillHandle) {
                $log.info(`caller WILL handle ${ response.status}`);
            } else {
                // Caller does not want to know
                $log.info(`caller will NOT handle ${ response.status}`);
                if (response.status == 401){
                    // Need to send them back to the login page
                    Session._invalidate();
                    Router.gotoLogin();
                } else if (response.status == 400){
                    let urlValue = `${response.config.url}`;
                    let errorCode= Utils.CheckURLErrorType(urlValue)
                    if (errorCode) {
                        promise = Modals.showMessage(errorCode);
                    } else {
                        promise = Modals.showErrors(response.data);
                    }
                    // eslint-disable-next-line no-empty-function
                    success = function() {};
                    promise.then(success);
                } else {
                    // 404, 500
                    let urlValue = `${response.config.url}`;
                    let errorCode= Utils.CheckURLErrorType(urlValue)
                    if (errorCode) {
                        promise = Modals.showMessage(errorCode);
                    } else {
                        promise = Modals.showErrors(response.data || 'Server Error');
                    }
                    // eslint-disable-next-line no-empty-function
                    success = function(result) {};
                    promise.then(success);
                }
            }

            // Reject the response
            return $q.reject(response);
        }
    };
});


/**
 * Provide a thin HttpWrapper around the angular $http service, to return the data instead of the parent http object
 */
angular.module('myaccount.conf').provider('http', function HttpWrapper() {
    var $http;

    this.$get = ['$injector', '$q', '$log', function($injector, $q, $log) {

        function http(requestConfig) {
            var deferred = $q.defer();

            $http = $http || $injector.get('$http'); // Overcome circular dependency problem

            var promise = $http(requestConfig);
            var success = function(result) {
                deferred.resolve(result.data); // Resolve the data
            };
            var failure = function(reason){
                $log.log(`http failure: ${ reason}`); // Note that the above HttpInterceptors should process http failure
                deferred.reject(reason);
            };
            promise.then(success, failure);

            return deferred.promise;
        }

        return http;
    }];
});

