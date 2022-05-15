const ValidationServiceMock =require('../../mocks/ValidationServiceMock');
describe('My Account utils', function () {
    let localUtils, localCustomerTypeConstant;
    beforeEach(function () {
        angular.mock.module('myaccount.utils');
        angular.mock.module('ngFileSaver');
        angular.mock.module('myaccount.conf');
        angular.mock.module('myaccount.route');
          angular.mock.module(function($provide) {
              $provide.factory("ValidationService", function() {
                  return ValidationServiceMock;
              });
          });
        angular.mock.inject(function (Utils, customerTypeConstant) {
            localUtils = Utils;
            localCustomerTypeConstant = customerTypeConstant;
        });
    });

    describe('Utils module', function () {
        it('can capitalize a string', function () {
            let result = localUtils.capitalize('lower');
            expect(result).toBe('Lower');
        });
        it('can sum value', function () {
            const arrayValue = [1, 2, 4];
            expect(localUtils.sum(arrayValue)).toBe(7);
        });

        it('can min value', function () {
            const arrayValue = [1, 2, 4];
            expect(localUtils.min(arrayValue)).valueOf(1);
        });
        it('can max value', function () {
            const arrayValue = [1, 2, 4];
            expect(localUtils.max(arrayValue)).valueOf(4);
        });
        it('can contains value', function () {
            const arrayValue = [1, 2, 4];
            expect(localUtils.contains(arrayValue, 4)).toBeTruthy();
        });
        it('can checkCustomerType is Organization', function () {
            expect(localUtils.checkCustomerType('SME', 'Organization')).toBeTruthy();
        });
        it('can checkCustomerType is Person', function () {
            expect(localUtils.checkCustomerType('RESD', 'Person')).toBeTruthy();
        });
        it('can checkCustomerType is not Person', function () {
            expect(localUtils.checkCustomerType('RESD', 'Organization')).toBeFalsy();
        });
        it('can checkCustomerType is not Organization', function () {
            expect(localUtils.checkCustomerType('SME', 'Person')).toBeFalsy();
        });
        it('can CheckURLErrorType is payment downloadPdf', function () {
            expect(localUtils.CheckURLErrorType('payment/downloadPdf')).toEqual('E625')
        });
        it('can CheckURLErrorType is oneOffPayment downloadPdf', function () {
            expect(localUtils.CheckURLErrorType('oneOffPayment/downloadPdf')).toEqual('E625')
        });
        it('can CheckURLErrorType is payment notifyPaymentResultByEmail', function () {
            expect(localUtils.CheckURLErrorType('payment/notifyPaymentResultByEmail')).toEqual('E618')
        });
        it('can CheckURLErrorType is oneOffPayment notifyPaymentResultByEmail', function () {
            expect(localUtils.CheckURLErrorType('oneOffPayment/notifyPaymentResultByEmail')).toEqual('E618')
        });
        it('can CheckURLErrorType is not payment downloadPdf', function () {
            expect(localUtils.CheckURLErrorType('moving/downloadPdf')).toEqual('')
        });
        it('can CheckURLErrorType is not oneOffPayment downloadPdf', function () {
            expect(localUtils.CheckURLErrorType('direct/downloadPdf')).toEqual('')
        });
        it('can CheckURLErrorType is not payment notifyPaymentResultByEmail', function () {
            expect(localUtils.CheckURLErrorType('moving/notifyPaymentResultByEmail')).toEqual('')
        });
        it('can CheckURLErrorType is not oneOffPayment notifyPaymentResultByEmail', function () {
            expect(localUtils.CheckURLErrorType('direct/notifyPaymentResultByEmail')).toEqual('')
        });
			  it('can create update banner cookie', function () {
				 const accountNumber = 123456;
				 const cookieName = 'update-details-cookie';

				 localUtils.createCookie(cookieName, accountNumber, 180);
				 expect(localUtils.doesCookieExist(cookieName, accountNumber)).toEqual(true);
			});
    });
});

