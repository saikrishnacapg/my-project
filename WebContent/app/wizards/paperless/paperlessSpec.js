describe('Paperless billing wizard:', function() {

    var ctrl, wizard, scope;

    beforeEach(module('myaccount'));
    beforeEach(module('formsengine'));
    beforeEach(module('myaccount.wizard'));
    beforeEach(module('myaccount.shared.services'));

    function initialise(injectables) {
        scope = injectables.$rootScope.$new();
        var myDetailsServer = {};
        var paperlessServer = {
            cancelPaperlessBilling: function(){
                return {finally: function(){}}
            },
            setPaperlessBilling: function(){
                return {finally: function(){}}
            }
        };
        wizard = injectables.formRegistry.lookup('paperless');
        ctrl = injectables.$controller('PaperlessController',
            {
                $scope: scope,
                account: injectables.account,
                MyDetailsServer: myDetailsServer,
                PaperlessServer: paperlessServer,
                ClientStorage: injectables.ClientStorage});
        scope.paperlessCtrl = ctrl;
    }

    function injectables($rootScope, $controller, ClientStorage, formRegistry, _account) {
        return {
            $rootScope:$rootScope,
            $controller: $controller,
            account: _account,
            ClientStorage: ClientStorage,
            formRegistry: formRegistry};
    }


    describe('when paperless billing is enabled', function() {
        beforeEach(inject(function($rootScope, $controller, ClientStorage, formRegistry) {
            var _account = {
                paperlessBillSetting: {
                    emailAddress: 'test@test.com',
                    isPaperless: true
                }
            };
            initialise(injectables($rootScope, $controller, ClientStorage, formRegistry, _account));
        }));

        it('paperless billing should be enabled', function() {
            assert.isTrue(ctrl.isPaperless());
        });

        it('paperless billing should be disableable', function() {
            expect(wizard.states[0].nextMsg(scope)).to.equal('Cancel paperless');
            assert.isTrue(wizard.states[0].showNext(scope));
        });
    });

    describe('when paperless billing is disabled', function() {

        describe('and user has no email address', function() {
            beforeEach(inject(function($rootScope, $controller, ClientStorage, formRegistry) {
                var _account = {
                    paperlessBillSetting: {
                        emailAddress: '',
                        isPaperless: false
                    }
                };
                initialise(injectables($rootScope, $controller, ClientStorage, formRegistry, _account));
            }));

            it('paperless billing should be disabled', function() {
                assert.isFalse(ctrl.isPaperless());
            });

            it('paperless billing should not be enableable', function() {
                assert.isFalse(wizard.states[0].showNext(scope));
            });
        });

        describe('and user has a valid email address', function() {
            beforeEach(inject(function($rootScope, $controller, ClientStorage, formRegistry) {
                var _account = {
                    paperlessBillSetting: {
                        emailAddress: 'test@test.com',
                        isPaperless: false
                    }
                };
                initialise(injectables($rootScope, $controller, ClientStorage, formRegistry, _account));
            }));

            it('email address should be set', function(){
                expect(ctrl.emailAddress).to.equal('test@test.com');
            });

            it('paperless billing should be enableable', function() {
                expect(wizard.states[0].nextMsg(scope)).to.equal('Setup paperless');
                assert.isTrue(wizard.states[0].showNext(scope));
            });
        });
    });
});