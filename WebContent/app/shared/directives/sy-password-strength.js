angular.module('myaccount.directives').directive('syPasswordStrength', function ($log) {
    return {
        restrict: 'A',
        scope: {
            password:'=syPasswordStrength'
        },
        templateUrl: "app/shared/directives/sy-password-strength.html",
        link: function (scope, element, attrs, ctrl) {
            scope.progress = 0;
            $log.log('passwordStrengthLink');
            $log.log(attrs.syPasswordStrength);

            /**
             * want to use ngmodel but getting wierd errors..?
             * function(){
                    return ctrl.$modelValue || attrs.syPasswordStrength;
                },
             */
            scope.$watch(
                'password',
                function(newValue, oldValue){
                    if ( newValue !== oldValue ) {
                        // Only increment the counter if the value changed
                        var strength = scorePassword(newValue);
                        var strengthClass = passwordStrengthClass(strength);
                        $log.log('password strength' + strength);
                        $log.log('strength class ' + strengthClass);
                        scope.strengthClass = strengthClass;
                        scope.progress = strength;
                    }
                }
            );

            /**
             *
             * some thing better (than then current synergy website at least!) from here
             *          http://stackoverflow.com/a/11268104/647365
             *
             * which is more in line with this (but this is massive so didnt't want to use it)
             *          https://tech.dropbox.com/2012/04/zxcvbn-realistic-password-strength-estimation/
             * @param pass
             * @returns {*}
             */
            var scorePassword = function (pass) {
                var score = 0;
                if (!pass)
                    return score;

                // award every unique letter until 5 repetitions
                var letters = {};
                for (var i=0; i<pass.length; i++) {
                    letters[pass[i]] = (letters[pass[i]] || 0) + 1;
                    score += 5.0 / letters[pass[i]];
                }

                // bonus points for mixing it up
                var variations = {
                    digits: /\d/.test(pass),
                    lower: /[a-z]/.test(pass),
                    upper: /[A-Z]/.test(pass),
                    nonWords: /\W/.test(pass)
                };

                var variationCount = 0;
                for (var check in variations) {
                    variationCount += (variations[check] === true) ? 1 : 0;
                }
                score += (variationCount - 1) * 10;

                return score;
            };

            /**
             * this is whats on the current synergy website - its shithouse.
             * @param password
             * @returns {number}
             * @constructor
             */
            var synergyCheckPasswordStrength = function(password){
                var score   = 0;
                //if password bigger than 6 give 1 point
                if (password.length > 6) score++;

                //if password has both lower and uppercase characters give 1 point
                if ( ( password.match(/[a-z]/) ) && ( password.match(/[A-Z]/) ) ) score++;

                //if password has at least one number give 1 point
                if (password.match(/\d+/)) score++;

                //if password has at least one special caracther give 1 point
                if ( password.match(/.[!,@,#,$,%,^,&,*,?,_,~,-,(,)]/) ) score++;

                //if password bigger than 12 give another 1 point
                if (password.length > 12) score++;
                return score;
            };

            var passwordStrengthClass = function(strength) {
                var strengthClass = "password-strength--1";

                if(strength < 20) strengthClass = "password-strength--1";

                if(strength >= 20 && strength < 40) strengthClass = "password-strength--2";

                if(strength >= 40 && strength < 60) strengthClass = "password-strength--3";

                if(strength >= 60 && strength < 80) strengthClass = "password-strength--4";

                if(strength >= 80) strengthClass = "password-strength--5";

                return strengthClass;
            };

        }
    };
});