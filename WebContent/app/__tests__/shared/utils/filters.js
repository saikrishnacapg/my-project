describe('Filters', function () {
    beforeEach(angular.mock.module('myaccount.utils'));
    let $filter;

    beforeEach(
        angular.mock.inject(function (_$filter_) {
            $filter = _$filter_;
        })
    );

    describe('syContractAccountNumber', function () {
        it('should remove leading zeros if more than 9 characters', function () {
            const LONG_CONTRACT_ACCOUNT_NUMBER = '0123456789';
            let result = $filter('syContractAccountNumber')(LONG_CONTRACT_ACCOUNT_NUMBER);
            expect(result).toEqual('123456789');
        });

        it('should add a leading 0 if there are 8 characters', function () {
            const SHORT_CONTRACT_ACCOUNT_NUMBER = '12345678';
            let result = $filter('syContractAccountNumber')(SHORT_CONTRACT_ACCOUNT_NUMBER);
            expect(result).toEqual('012345678');
        });
    });

    describe('synergyCardTypeFilter', function () {
        it('should return VISA when 0002 is passed in', function () {
            let result = $filter('synergyCardTypeFilter')('0002');
            expect(result).toEqual('VISA');
        });

        it('should return MC when 0003 is passed in', function () {
            let result = $filter('synergyCardTypeFilter')('0003');
            expect(result).toEqual('MC');
        });

        it('should return AMEX when anything but 0002 or 0003 is passed in', function () {
            let result = $filter('synergyCardTypeFilter')('004');
            expect(result).toEqual('AMEX');
        });
    });

    describe('syMaskCard', function () {
        it('should show the first 6 and last 3 numbers', function () {
            const SAMPLE_CARD_NUMBER = '1234567890123456';
            let result = $filter('syMaskCard')(SAMPLE_CARD_NUMBER);
            expect(result).toEqual('123456*******456');
        });
    });

    describe('min', function () {
        it('should return the lowest number', function () {
            const SAMPLE_NUMBERS = [5, 7, 3, 9, 100, 4536];
            let result = $filter('min')(SAMPLE_NUMBERS);
            expect(result).toEqual(3);
        });
    });

    describe('max', function () {
        it('should return the highest number', function () {
            const SAMPLE_NUMBERS = [5, 7, 3, 9, 100, 4536];
            let result = $filter('max')(SAMPLE_NUMBERS);
            expect(result).toEqual(4536);
        });
    });

    describe('avg', function () {
        it('should return the average from a group of numbers', function () {
            const SAMPLE_NUMBERS = [4, 1, 10, 7, 8];
            let result = $filter('avg')(SAMPLE_NUMBERS);
            expect(result).toEqual(6);
        });
    });
});
