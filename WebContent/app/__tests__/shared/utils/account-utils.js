const ValidationServiceMock =require('../../mocks/ValidationServiceMock');
describe('Account utilities', function () {
    beforeEach(angular.mock.module('myaccount.conf'));
    beforeEach(angular.mock.module('myaccount.route'));
    beforeEach(angular.mock.module('myaccount.shared.services'));
    beforeEach(angular.mock.module('myaccount.utils'));
    beforeEach(angular.mock.module('ngFileSaver'));

    beforeEach(
        angular.mock.module(function($provide) {
            $provide.factory("ValidationService", function() {
                return ValidationServiceMock;
            });
        }));
    let session, utils, smeAccount, resAccount, iCAccount;

    beforeEach(
        angular.mock.inject(function (AccountUtils, Session) {
            session = Session;
            utils = AccountUtils;
            iCAccount = { contractAccountType: 'I&C' };
            smeAccount = { contractAccountType: 'SME' };
            resAccount = { contractAccountType: 'RESD' };
        })
    );

    describe('for a SME account', function () {
        it('should return true for isBusiness', function () {
            expect(utils.isBusiness(smeAccount)).toEqual(true);
        });

        it('should return false for isResidential', function () {
            expect(utils.isResidential(smeAccount)).toEqual(false);
        });

        it('should return false for isIAndC', function () {
            expect(utils.isIAndC(smeAccount)).toEqual(false);
        });
    });

    describe('for an I&C account', function () {
        it('should return true for isBusiness on an I&C account', function () {
            expect(utils.isBusiness(iCAccount)).toEqual(true);
        });

        it('should return false for isResidential on an I&C account', function () {
            expect(utils.isResidential(iCAccount)).toEqual(false);
        });

        it('should return true for isIAndC', function () {
            expect(utils.isIAndC(iCAccount)).toEqual(true);
        });
    });

    describe('for a residential account', function () {
        it('should return false for isBusiness', function () {
            expect(utils.isBusiness(resAccount)).toEqual(false);
        });

        it('should return true for isResidential', function () {
            expect(utils.isResidential(resAccount)).toEqual(true);
        });

        it('should return false for isIAndC', function () {
            expect(utils.isIAndC(resAccount)).toEqual(false);
        });
    });
});
