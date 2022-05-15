angular.module("myaccount.utils").constant("SYNERGY_DATE_FORMAT", "DD/MM/YYYY");
angular.module("myaccount.utils").constant("SYNERGY_DATE_TIME_FORMAT", "DD/MM/YYYY HH:mm:ss");
angular.module("myaccount.utils").constant("HTML5_DATE_FORMAT", "YYYY-MM-DD");
angular.module("myaccount.utils").constant("PAYMENT_ARRANGEMENT_DATE_FORMAT", "YYYY-MM-DDTHH:mm:ss.sss[Z]");
angular.module("myaccount.utils").constant("CARD_EXPIRY_DATE_FORMAT", "MM/YYYY");
angular
	.module("myaccount.utils")
	.service("DateUtils", function (
		HTML5_DATE_FORMAT,
		SYNERGY_DATE_FORMAT,
		SYNERGY_DATE_TIME_FORMAT,
		DateService,
		PAYMENT_ARRANGEMENT_DATE_FORMAT,
		CARD_EXPIRY_DATE_FORMAT
	) {
		this.todayAsString = dateFormat => moment().format(dateFormat || SYNERGY_DATE_FORMAT);

		this.hoursToday = () => moment().diff(moment().startOf("day"), "minutes") / 60;

		this.parseHTML5Date = dateStr => moment(dateStr, HTML5_DATE_FORMAT);

		this.formatHTML5Date = (dateStr, dateFormat = SYNERGY_DATE_FORMAT) =>
			moment(dateStr, HTML5_DATE_FORMAT).format(dateFormat);

		this.formatHTML5DateRange = (date1, date2, dateFormat = SYNERGY_DATE_FORMAT) => {
			const dateFrom = moment(date1, HTML5_DATE_FORMAT).format(dateFormat);
			const dateTo = moment(date2, HTML5_DATE_FORMAT).format(dateFormat);
			return `${dateFrom} to ${dateTo}`;
		};

		this.parseJSONDate = dateStr => moment(dateStr);

		this.formatJSONDate = (dateStr, dateFormat = SYNERGY_DATE_FORMAT) => moment(dateStr).format(dateFormat);

		this.formatJSONDateTime = (dateStr, dateFormat = SYNERGY_DATE_TIME_FORMAT) => moment(dateStr).format(dateFormat);

		this.formatDateToTime = (dateStr, dateFormat = "HH:mm") => moment(dateStr).format(dateFormat);

		this.isPeak = dateStr => {
			const date = moment(dateStr);
			return _.inRange(date.hour(), 8, 22) && _.inRange(date.day(), 1, 6);
		};

		this.isPublicHoliday = moment =>
			_.chain(DateService.PUBLIC_HOLIDAYS)
				.pluck("date")
				.find(it => it.isSame(moment, "day"))
				.value() !== undefined;

		this.formatPaymentArrangementDate = date => moment(date).format(PAYMENT_ARRANGEMENT_DATE_FORMAT);

		this.formatCreditCardExpiry = expiryDate => moment(expiryDate).format(CARD_EXPIRY_DATE_FORMAT);

		this.isSameDate = (date1, date2) => date1.isSame(date2);
	});
