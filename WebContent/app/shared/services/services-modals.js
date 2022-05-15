angular
    .module('myaccount.shared.services')
    .factory('Modals', function ($filter, $q, $sce, $injector, $rootScope, MessagesService, AnalyticsServer) {
        /**
         * Create list of error messages. Also removes the trailing error number in brackets.
         * @param errors
         * @returns {string}
         */
        var buildErrorMsg = function (errors) {
            var templateMessage = getTemplate(errors);
            if (templateMessage) {
                return templateMessage;
            }

            var message = '<div>';
            if (angular.isString(errors)) {
                message += `<span>${ $filter('stripErrorCode')(errors) }</span>`;
            } else if (angular.isArray(errors)) {
                // List the errors
                angular.forEach(errors, function () {
                    message += `<span>${ $filter('stripErrorCode')(errors) }</span>`;
                });
            } else {
                // Fallback
                message += '<span>An error has occurred</span>';
            }

            message += '</div>';
            return message;
        };

        var getTemplate = function (error) {
            return MessagesService.getTemplate(error);
        };
        let getErrorMessage = function(error) {
            return MessagesService.getMessageText(error)
        };
        /**
         * Returns a promise, which will resolve to the selected option in the options list
         */
        var showModalAlert = function (title, message, options, data, ctrl, filter, btnLabels) {
            var isPaperLessErrorFlag = $rootScope.isPaperLessError;
            $rootScope.isPaperLessError = undefined;
            // Create a new scope
            var sc = $rootScope.$new();
            // Return a promise
            var deferred = $q.defer();

            sc.title = title;
            sc.isTemplate = message.endsWith('.html');
            sc.message = sc.isTemplate ? message : $sce.trustAsHtml(message);
            sc.data = data;
            sc.filter = filter;
            sc.ctrl = ctrl;
            sc.isPaperLessErrorMsg = isPaperLessErrorFlag;

            sc.selectOption = function (option) {
                deferred.resolve(option);
            };

            if (angular.isArray(options)) {
                sc.options = options;
            } else if (angular.isString(options)) {
                sc.options = [options];
            } else {
                sc.options = ['OK'];
            }

            sc.btnLabels = btnLabels;

            // Overcome circular dependency problem
            var modal = $injector.get('$modal')({
                scope: sc,
                template: 'app/shared/templates/modal.html',
                prefixEvent: 'modal2',
                show: true,
                backdropAnimation: 'in'
            });

            var promise = deferred.promise;
            promise.finally(function () {
                modal.hide();
            });

            return promise;
        };
        var showModalContactPersonAlert = function (title, message, options, data, ctrl, filter, btnLabels) {
            var isPaperLessErrorFlag = $rootScope.isPaperLessError;
            $rootScope.isPaperLessError = undefined;
            // Create a new scope
            var sc = $rootScope.$new();
            // Return a promise
            var deferred = $q.defer();

            sc.title = title;
            sc.isTemplate = message.endsWith('.html');
            sc.message = sc.isTemplate ? message : $sce.trustAsHtml(message);
            sc.data = data;
            sc.filter = filter;
            sc.ctrl = ctrl;
            sc.isPaperLessErrorMsg = isPaperLessErrorFlag;

            sc.selectOption = function (option) {
                deferred.resolve(option);
            };

            if (angular.isArray(options)) {
                sc.options = options;
            } else if (angular.isString(options)) {
                sc.options = [options];
            } else {
                sc.options = ['OK'];
            }

            sc.btnLabels = btnLabels;

            // Overcome circular dependency problem
            var modal = $injector.get('$modal')({
                scope: sc,
                template: 'app/shared/templates/modal-contact-person.html',
                prefixEvent: 'modal2',
                show: true,
                backdropAnimation: 'in'
            });

            var promise = deferred.promise;
            promise.finally(function () {
                modal.hide();
            });

            return promise;
        };

        /**
         * Promise is rejected unless result=='OK'
         */
        var showModalConfirm = function (title, message, data) {
            var deferred = $q.defer();

            var promise = showModalAlert(title, message, ['Cancel', 'OK'], data);

            var success = function (result) {
                if (result === 'OK') {
                    deferred.resolve(result);
                } else {
                    deferred.reject(result);
                }
            };

            var failure = function (reason) {
                $q.reject(reason);
            };

            promise.then(success, failure);

            return deferred.promise;
        };

        /**
         * Promise is rejected unless result=='OK'
         */
        var showModalDateRange = function (title, message, data, filter) {
            var deferred = $q.defer();

            var ctrl = {
                disableNext: function () {
                    return !data.valid;
                }
            };

            var promise = showModalAlert(title, message, ['Cancel', 'OK'], data, ctrl, filter);

            var success = function (result) {
                if (result === 'OK') {
                    deferred.resolve(result);
                } else {
                    deferred.reject(result);
                }
            };

            var failure = function (reason) {
                $q.reject(reason);
            };

            promise.then(success, failure);

            return deferred.promise;
        };

        /**
         * Promise is rejected unless result=='OK'
         */
        var showModalEmailAddress = function (title, message, data) {
            var deferred = $q.defer();

            var ctrl = {
                disableNext: function () {
                    return data.value === undefined || !data.valid;
                }
            };

            var promise = showModalAlert(title, message, ['Cancel', 'OK'], data, ctrl);

            var success = function (result) {
                if (result === 'OK') {
                    deferred.resolve(data);
                } else {
                    deferred.reject(result);
                }
            };

            var failure = function (reason) {
                $q.reject(reason);
            };

            promise.then(success, failure);

            return deferred.promise;
        };

        /**
         * Promise is rejected unless result=='OK'
         */
        var showModalConfirmation = function (title, template, text) {
            var deferred = $q.defer();

            var promise = showModalAlert(title, template, ['OK'], text);

            var success = function (result) {
                if (result === 'OK') {
                    deferred.resolve();
                } else {
                    deferred.reject(result);
                }
            };

            var failure = function (reason) {
                $q.reject(reason);
            };

            promise.then(success, failure);

            return deferred.promise;
        };

        /**
         * Promise is rejected unless result=='OK'
         */
        var showSeeAndSaveAlert = function (data) {
            var ctrl = {
                disableNext: function () {
                    return data.value === undefined;
                }
            };

            return showModalAlert(
                'Set your usage Goal',
                'app/routes/user/account/seeandsave/templates/sas-alert.html',
                ['Cancel', 'OK'],
                data,
                ctrl,
                null,
                { cancel: data.value ? 'Remove Goal' : 'Cancel', ok: 'Set Goal' }
            );
        };

        var showSeeAndSaveCustomise = function (data) {
            var ctrl = {
                disableNext: function () {
                    return _.reduce(
                        data,
                        function (acc, mapping) {
                            return _.isEmpty(mapping) || acc;
                        },
                        false
                    );
                }
            };

            return showModalAlert(
                'See and Save Customisation',
                'app/routes/user/account/seeandsave/templates/sas-customise.html',
                ['Cancel', 'OK'],
                data,
                ctrl,
                null,
                { cancel: 'Cancel', ok: 'Save' }
            );
        };

        // All functions return a promise
        var Modals = {
            showModalAlert: showModalAlert,
            showErrors: function (errors) {
                AnalyticsServer.handleModalErrors(errors);
                return showModalAlert('Error', buildErrorMsg(errors), 'OK');
            },
            showAlert: function (title, message, data) {
                return showModalAlert(title, message, 'OK', data);
            },
            showConfirm: function (title, message) {
                return showModalConfirm(title, message);
            },
            showOptions: function (title, message, options) {
                return showModalAlert(title, message, options);
            },
            showContactPersonOptions: function (title, message, options) {
                return showModalContactPersonAlert(title, message, options);
            },
            showBillHelp: function (billDetailId) {
                return showModalAlert('Your bill', 'app/shared/templates/modal-billhelp.html', 'OK', {
                    billDetailId: billDetailId
                });
            },
            showDateRange: function (dateRange, filter) {
                return showModalDateRange(
                    'Select date range',
                    'app/shared/templates/modal-daterange.html',
                    dateRange,
                    filter
                );
            },
            showEmailAddress: function (title, data) {
                return showModalEmailAddress(title, 'app/shared/templates/modal-email.html', data);
            },
            showSeeAndSaveCustomise: function (data) {
                return showSeeAndSaveCustomise(data);
            },
            showSeeAndSaveAlert: function (data) {
                return showSeeAndSaveAlert(data);
            },
            showConfirmation: function (title, text) {
                return showModalConfirmation(title, 'app/shared/templates/modal-confirm.html', text);
            },
            showMessage: function(errors){
                let message= `<span>${ getErrorMessage(errors) }</span>`;
                return showModalAlert('Error', message, 'OK');
            }
        };

        return Modals;
    });

/**
 * Special 'Controller' that manages state and validation for a DateRange modal
 */
angular.module('myaccount.shared.services').service('DateRangeController', function () {
    this.defaultHelpText = 'Please select a date range of up to two years.';
    this.cutoffDate = moment('2009 01 01', 'YYYY MM DD');
    this.today = moment().endOf('day');
    this.startDate;
    this.endDate;

    this.pastCutoffDate = function () {
        if (_.isEmpty(this.startDate)) {
            return false;
        }
        return moment(this.startDate).isBefore(this.cutoffDate);
    };

    this.startDateAfterEndDate = function () {
        if (_.isEmpty(this.startDate) || _.isEmpty(this.startDate)) {
            return false;
        }
        return moment(this.startDate).isAfter(this.endDate);
    };

    this.overMaxRange = function () {
        return Math.abs(moment(this.endDate).diff(moment(this.startDate), 'years')) >= 2;
    };

    this.endDateIsInFuture = function () {
        return moment(this.endDate).isAfter(this.today);
    };

    this.disableNext = function () {
        return this.pastCutoffDate() || this.startDateAfterEndDate() || this.overMaxRange() || this.endDateIsInFuture();
    };
});
