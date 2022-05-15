/** Directives and services for responding to idle users in AngularJS
 *
 * This has been taken from ng-idle (https://github.com/HackedByChinese/ng-idle.git)
 * and stripped down and modified to work on iOS devices where timeouts are paused in
 * Mobile Safari while the browser is in the background.
 *
 * To counter this we take a time snapshot of when the session will expire and on a digest (i.e.
 * when the user again interacts with the device) we check if this time has passed first.
 * If it has we cancel the timeouts and broadcast the $idleEnd function.
 *
 * As we don't use the keepAlive functionality I have removed this also to cut down on size.
 *
 * @author Brian Foody (Mike Grabski <me@mikegrabski.com> original author of ng-idle)
 * @version v0.3.1
 * @link
 * @license MIT
 */
angular.module('myaccount.providers').provider('syIdle', function() {

    var options = {
        idleDuration: 20 * 60, // in seconds (default is 20min)
        idleWarnDuration: 30, // in seconds (default is 20min)
        autoResume: true, // lets events automatically resume (unsets idle state)
        events: 'mousemove keydown DOMMouseScroll mousewheel mousedown touchstart'
    };

    this.activeOn = function (events) {
        options.events = events;
    };

    this.idleDuration = function (seconds) {
        if (seconds <= 0) throw new Error("idleDuration must be a value in seconds, greater than 0.");

        options.idleDuration = seconds;
    };

    this.idleWarnDuration = function (seconds) {
        if (seconds <= 0) throw new Error("idleDuration must be a value in seconds, greater than 0.");

        options.idleWarnDuration = seconds;
    };

    this.autoResume = function (value) {
        options.autoResume = value === true;
    };

    this.$get = ['$timeout', '$log', '$rootScope', '$document', function ($timeout, $log, $rootScope, $document) {
        var state = {idle: null, running: false, idleCutOffMoment: null};

        function idleEnd() {
            $rootScope.$broadcast('$idleEnd');
        }
        function idleWarn() {
            $rootScope.$broadcast('$idleWarn');
        }

        var svc = {
            _options: function () {
                return options;
            },
            running: function () {
                return state.running;
            },
            watch: function () {
                $timeout.cancel(state.idle);
                $timeout.cancel(state.idleWarn);

                state.idleCutOffMoment = moment().add(options.idleDuration, 'seconds');
                state.idleWarnMoment = moment().add(options.idleDuration - options.idleWarnDuration, 'seconds');

                state.running = true;

                state.idle = $timeout(idleEnd, options.idleDuration * 1000);
                state.idleWarn = $timeout(idleWarn, (options.idleDuration - options.idleWarnDuration) * 1000);
            },
            unwatch: function () {
                $timeout.cancel(state.idle);

                state.running = false;
            }
        };

        var interrupt = function () {
            if (state.running && state.idleCutOffMoment.isBefore(moment())) {
                svc.unwatch();
                $rootScope.$broadcast('$idleEnd');
            } else if (state.running && state.idleWarnMoment.isBefore(moment())) {
                $rootScope.$broadcast('$idleWarn');
            } else if (state.running && options.autoResume) {
                svc.watch();
            }
        };

        $document.find('body').on(options.events, interrupt);

        return svc;
    }];
});