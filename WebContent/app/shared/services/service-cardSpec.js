describe('Card service', function() {
    var cardService;
    var now = moment();
    var currentMonth = parseInt(now.format('MM'));
    var currentYear = parseInt(now.format('YY'));

    beforeEach(module('myaccount.shared.services'));

    beforeEach(inject(function (CardService) {
        cardService = CardService;
    }));

    describe('expiry month', function () {
        describe('of current year', function(){
            it('should return only future months', function() {
                expect(_.filter(cardService.CREDIT_CARD_EXPIRY_MONTHS(currentYear), function(n) {return n > currentMonth;})).to.have.length(12 - currentMonth);
                expect(_.filter(cardService.CREDIT_CARD_EXPIRY_MONTHS(currentYear), function(n) {return n <= currentMonth;})).to.be.empty;
            });
        });
        describe('of next (or not specified) year', function(){
            it('should all months', function() {
                expect(cardService.CREDIT_CARD_EXPIRY_MONTHS(currentYear + 1)).to.have.length(cardService.ALL_EXPIRY_MONTHS.length);
                expect(cardService.CREDIT_CARD_EXPIRY_MONTHS()).to.have.length(cardService.ALL_EXPIRY_MONTHS.length);
            });
        });
    });

    describe('expiry year', function () {
        describe('when month is less or equals to current month', function(){
            it('should return only 25 future years (excluding current one)', function() {
                var month = currentMonth;
                expect(cardService.CREDIT_CARD_EXPIRY_YEARS(month)).to.have.length(25)
                expect(_.filter(cardService.CREDIT_CARD_EXPIRY_YEARS(month), function(n) {return n != ""+currentYear;})).to.have.length(cardService.CREDIT_CARD_EXPIRY_YEARS(month).length);
                month = currentMonth-1;
                expect(cardService.CREDIT_CARD_EXPIRY_YEARS(month)).to.have.length(25)
                expect(_.filter(cardService.CREDIT_CARD_EXPIRY_YEARS(month), function(n) {return n != ""+currentYear;})).to.have.length(cardService.CREDIT_CARD_EXPIRY_YEARS(month).length);
            });
        });
        describe('when month is greater than current month (or not specified)', function(){
            it('should return 25 future years (including current one)', function() {
                expect(cardService.CREDIT_CARD_EXPIRY_YEARS()).to.have.length(25)
                expect(_.filter(cardService.CREDIT_CARD_EXPIRY_YEARS(), function(n) {return n == ""+currentYear;})).to.have.length(1);
                var month = currentMonth+1;
                expect(cardService.CREDIT_CARD_EXPIRY_YEARS(month)).to.have.length(25)
                expect(_.filter(cardService.CREDIT_CARD_EXPIRY_YEARS(month), function(n) {return n == ""+currentYear;})).to.have.length(1);
            });
        });

    });
});