angular.module('myaccount.route').config(function ($stateProvider) {
    $stateProvider.state('user.account.bills', {
        url: 'bills',
        templateUrl: 'app/routes/user/account/bills/bills.html',
        controller: 'BillsCtrl',
        controllerAs: 'billsCtrl'
    });
});

angular
    .module('myaccount.route')
    .controller('BillsCtrl', function (
        account,
        AccountBillServer,
        BillRecordsServer,
        AccountUtils,
        Modals,
        Utils,
        BillsCtrlService
    ) {
        var self = this;
        var increment = 6; // Months

        this.account = account;
        this.billData = account.billHistory;
        this.dateRange = angular.copy(this.billData.supplyPeriod);
        this.selectedBillCode = '';
        this.billFormatEligiblity = angular.copy(account.billEligiblity.billFormatEligiblity);
        this.billDownloadEligiblityDate = account.billEligiblity.billDownloadEligiblityDate;
        this.downloadEligiblityByDate = function (postingDate) {
            return moment(postingDate).isAfter(self.billDownloadEligiblityDate);
        };
        this.choiceListSelect = [];
        this.maxRangeValue = '730';
        this.firstApply = true;
        this.deSelectDisplay = true;
        this.selectDisplay = false;
        this.showDiv = false;
        this.billDataCsv = [{}];
        this.billchoiceList = [
            {
                id: 'IN',
                name: 'IN',
                label: 'Bill issued',
                value: 'IN'
            },
            {
                id: 'BP',
                name: 'BP',
                label: 'BPAY payments',
                value: 'BP'
            },
            {
                id: 'RC',
                name: 'RC',
                label: 'Cancelled refund',
                value: 'RC'
            },
            {
                id: 'CC',
                name: 'CC',
                label: 'Card payment',
                value: 'CC'
            },
            {
                id: 'CP',
                name: 'CP',
                label: 'Centrepay payment',
                value: 'CP'
            },
            {
                id: 'CN',
                name: 'CN',
                label: 'Credit cancelled',
                value: 'CN'
            },
            {
                id: 'CR',
                name: 'CR',
                label: 'Credits received',
                value: 'CR'
            },
            {
                id: 'DI',
                name: 'DI',
                label: 'Direct Debit instalment',
                value: 'DI'
            },
            {
                id: 'DP',
                name: 'DP',
                label: 'Direct Debit payment',
                value: 'DP'
            },
            {
                id: 'HG',
                name: 'HG',
                label: 'HUGS payment',
                value: 'HG'
            },
            {
                id: 'OP',
                name: 'OP',
                label: 'One-off bank account payment',
                value: 'OP'
            },
            {
                id: 'PT',
                name: 'PT',
                label: 'Payment received',
                value: 'PT'
            },
            {
                id: 'AP',
                name: 'AP',
                label: 'Post Billpay payments',
                value: 'AP'
            },
            {
                id: 'RF',
                name: 'RF',
                label: 'Refund',
                value: 'RF'
            },

            {
                id: 'CB',
                name: 'CB',
                label: 'Bill Issued',
                value: 'CB'
            },
            {
                id: 'ER',
                name: 'ER',
                label: 'Payment received',
                value: 'ER'
            },
            {
                id: 'EB',
                name: 'EB',
                label: 'Payment received',
                value: 'EB'
            },
            {
                id: 'HC',
                name: 'HC',
                label: 'Synergy HUGS contribution Payment',
                value: 'HC'
            }
        ];

        this.init = function (choiceList) {
            this.choiceListSelect = [
                'IN',
                'BP',
                'CP',
                'CC',
                'DI',
                'DP',
                'PT',
                'AP',
                'RC',
                'RF',
                'CB',
                'ER',
                'EB',
                'HG',
                'HC',
                'WC',
                'WT',
                'SA',
                'TR',
                'ET',
                'ED',
                'SC',
                'ST'
            ];
            angular.forEach(this.choiceList, function () {
                this.choiceListSelect.checked = true;
            });
        };
        this.startDate = self.dateRange.startDate;
        this.endDate = self.dateRange.endDate;
        BillsCtrlService.startDate = self.dateRange.startDate;
        BillsCtrlService.endDate = self.dateRange.endDate;
        this.pastCutoffDate = function () {
            return BillsCtrlService.pastCutoffDate(this.startDate);
        };

        this.startDateAfterEndDate = function () {
            return BillsCtrlService.startDateAfterEndDate(this.startDate, this.endDate);
        };

        this.overMaxRange = function () {
            return BillsCtrlService.overMaxRange(this.startDate, this.endDate, this.maxRangeValue);
        };

        this.endDateIsInFuture = function () {
            return BillsCtrlService.endDateIsInFuture(this.startDate);
        };

        this.valid = function () {
            return !(
                this.pastCutoffDate() ||
                this.startDateAfterEndDate() ||
                this.overMaxRange() ||
                this.endDateIsInFuture()
            );
        };

        this.hideCBType = function (itemStatus) {
            return (itemStatus !== 'CB' && itemStatus !== 'EB' && itemStatus !== 'ER') ? true : false;
        };

        this.cutoffDateReached = function () {
            return !moment(self.billData.supplyPeriod.startDate).isAfter(AccountUtils.usageCutoff);
        };

        this.fetchPreviousRecords = function () {
            var endDate = moment(self.billData.supplyPeriod.startDate).subtract(1, 'days').endOf('day');
            var startDate = moment(endDate).subtract(increment, 'months').startOf('day');
            // TODO child accounts
            var promise = BillRecordsServer.getBillHistory(
                account.contractAccountNumber,
                startDate.toDate(),
                endDate.toDate()
            );
            promise.then(function (result) {
                var converted = Utils.convertStringsToDateByKeys(result, /\w+Date/);
                self.billData.supplyPeriod.startDate = converted.supplyPeriod.startDate;
                self.billData.records = self.billData.records.concat(converted.records); // Prepend
                self.billData.timestamp = converted.timestamp;
            });
        };

        this.search = function () {
            var promise = Modals.showDateRange(self.dateRange);
            promise.then(function (result) {
                var promise2 = BillRecordsServer.getBillHistory(
                    account.contractAccountNumber,
                    self.dateRange.startDate,
                    self.dateRange.endDate
                );
                promise2.then(function (result) {
                    self.billData = Utils.convertStringsToDateByKeys(result, /\w+Date/);
                    self.dateRange = angular.copy(self.billData.supplyPeriod);
                    BillsCtrlService.startDate = self.dateRange.startDate;
                    BillsCtrlService.endDate = self.dateRange.endDate;
                });
            });
        };

        this.searchDisplay = function () {
            var promise2 = BillRecordsServer.getBillHistory(account.contractAccountNumber, this.startDate, this.endDate);
            promise2.then(function (result) {
                self.billData = Utils.convertStringsToDateByKeys(result, /\w+Date/);
                self.dateRange = angular.copy(self.billData.supplyPeriod);
                BillsCtrlService.startDate = self.dateRange.startDate;
                BillsCtrlService.endDate = self.dateRange.endDate;
            });
        };

        this.ccLinkReciept = function (bill) {
            this.eventTracking('receipt');
            BillRecordsServer.billReceiptHistory(
                account.contractAccountNumber,
                bill.ccPaymentDate,
                bill.ccNumber,
                bill.ccReceiptNo,
                bill.amount
            );
        };
        this.billLink = function (bill, exportFormat) {
            return AccountBillServer.billLink(this.account.contractAccountNumber, bill, exportFormat);
        };

        this.showFilterOption = function () {
            this.showDiv = true;
        };

        this.checkOptions = function (choiceList) {
            this.showDiv = false;
            this.firstApply = false;
            self.choiceListSelect = [];
            angular.forEach(choiceList, function (value, key) {
                if (choiceList[key].checked) {
                    if (choiceList[key].id === 'IN') {
                        self.choiceListSelect.push(choiceList[key].id);
                        self.choiceListSelect.push('CB');
                    } else if (choiceList[key].id === 'PT') {
                        self.choiceListSelect.push(choiceList[key].id);
                        self.choiceListSelect.push('ER');
                    } else if (choiceList[key].id === 'CB' || choiceList[key].id === 'ER' || choiceList[key].id === 'EB') {
                        // Do nothing
                    } else if (choiceList[key].id === 'CR') {
                        self.choiceListSelect.push('WC'); // WA Government Household Electricity Credit Offset
                        self.choiceListSelect.push('WT'); // WA Govt Household Electricity Cr Offset Transfer
                        self.choiceListSelect.push('TR'); // Track to Change Reward (adjustment)
                        self.choiceListSelect.push('SA');
                        self.choiceListSelect.push('EB');
                        self.choiceListSelect.push('ET');
                        self.choiceListSelect.push('ST');
                        self.choiceListSelect.push('SC');
                    } else if (choiceList[key].id === 'CN') {
                        self.choiceListSelect.push('ED'); // Unused WA Small Business and Charity Tariff Offset
                    } else {
                        self.choiceListSelect.push(choiceList[key].id);
                    }
                }
            });
        };

        this.selectAll = function (choiceList) {
            self.choiceListSelect = [];
            this.deSelectDisplay = true;
            this.selectDisplay = false;
            angular.forEach(choiceList, function (value, key) {
                choiceList[key].checked = true;
            });
            this.checkOptions(choiceList);
        };

        this.deSelectAll = function (choiceList) {
            self.choiceListSelect = [];
            this.deSelectDisplay = false;
            this.selectDisplay = true;
            angular.forEach(choiceList, function (value, key) {
                choiceList[key].checked = false;
            });
            this.checkOptions(choiceList);
            this.eventTracking('deselect');
        };

        this.filterByBillCode = function (bill) {
            if (self.firstApply) {
                self.choiceListSelect = [];

                return bill;
            }

            for (var i = 0, len = self.choiceListSelect.length; i < len; i++) {
                if (bill.billingCode === self.choiceListSelect[i]) {
                    return bill.billingCode;
                }
            }
        };

        this.printBillHistory = function () {
            this.eventTracking('print');
            var printContents = document.getElementById('dvBillingTableToPrint').innerHTML;
            var popupWin = window.open('', '_blank', 'width=1000,height=700');
            popupWin.document.open();
            popupWin.document.write(
                `<html><head><link rel="stylesheet" type="text/css" href="style.css" ><style>.ng-hide { display: none !important; }</style></link></head><body onload="window.print()">${printContents}</body></html>`
            );
            popupWin.document.close();
        };

        this.exportTableToCSV = function () {
            this.eventTracking('csv');
            BillRecordsServer.exportBillHistory(
                account.contractAccountNumber,
                self.dateRange.startDate,
                self.dateRange.endDate,
                'download',
                'csv'
            );
        };

        this.exportTableToPDF = function () {
            this.eventTracking('pdf');
            BillRecordsServer.exportBillHistory(
                account.contractAccountNumber,
                self.dateRange.startDate,
                self.dateRange.endDate,
                'download',
                'pdf'
            );
        };

        this.exportTableToEmail = function () {
            this.eventTracking('email');
            BillRecordsServer.exportBillHistory(
                account.contractAccountNumber,
                self.dateRange.startDate,
                self.dateRange.endDate,
                'email',
                'csv'
            );
        };
        this.getPositiveAmount = function (amount) {
            return amount < 0 ? amount * -1 : amount;
        };
        this.eventTracking = function (attrs) {
            var category1,
                title,
                label1 = {};
            switch (attrs) {
                case 'print':
                    title = 'Print';
                    category1 = 'Link click';
                    label1 = 'MA – Billing history';
                    break;
                case 'pdf':
                    title = 'Export PDF';
                    category1 = 'Link click';
                    label1 = 'MA – Billing history';
                    break;
                case 'csv':
                    title = 'Export CSV';
                    category1 = 'Link click';
                    label1 = 'MA – Billing history';
                    break;
                case 'email':
                    title = 'Email';
                    category1 = 'Link click';
                    label1 = 'MA – Billing history';
                    break;
                case 'bill':
                    title = 'Download bill';
                    category1 = 'Link click';
                    label1 = 'MA – Billing history';
                    break;
                case 'receipt':
                    title = 'Download receipt';
                    category1 = 'Link click';
                    label1 = 'MA – Billing history';
                    break;
                case 'select':
                    title = 'Select filter';
                    category1 = 'Link click';
                    label1 = 'MA – Billing history';
                    break;
                case 'deselect':
                    title = 'Deselect';
                    category1 = 'Link click';
                    label1 = 'MA – Billing history';
                    break;
                case 'filter':
                    title = 'Apply filter';
                    category1 = 'Link click';
                    label1 = 'MA – Billing history';
                    break;
                default:
                    break;
            }
        };
    });

angular.module('myaccount.route').service('BillsCtrlService', function () {
    this.cutoffDate = moment('2009 01 01', 'YYYY MM DD');
    this.today = moment().endOf('day');

    this.pastCutoffDate = function (date) {
        if (_.isEmpty(date)) {
            return false;
        }
        return moment(date).isBefore(this.cutoffDate);
    };

    this.startDateAfterEndDate = function (startDate, endDate) {
        if (_.isEmpty(startDate) || _.isEmpty(startDate)) {
            return false;
        }
        return moment(startDate).isAfter(endDate);
    };

    this.overMaxRange = function (startDate, endDate, days) {
        return Math.abs(moment(endDate).diff(moment(startDate), 'days')) > days;
    };
    this.checkMoveInDate = function (startDate, endDate, filter) {
        return moment(filter.start.min).isAfter(startDate);
    };
    this.checkMoveOutDate = function (startDate, endDate, filter) {
        return moment(filter.end.max).isBefore(endDate);
    };
    this.endDateIsInFuture = function (date) {
        return moment(date).isAfter(this.today);
    };
});

/**
 * AccountHistoryServer is a singleton service that keeps a local cache of account history data, used by the usage/bills routes
 */
angular.module('myaccount.route').factory('BillRecordsServer', function (http, Utils, MyAccountServer) {
    var BillRecordsServer = {
        getBillHistory: function (contractAccountNumber, startDate, endDate) {
            return http({
                method: 'POST',
                url: `/accountRecords/${contractAccountNumber}/getBillHistory`,
                params: {
                    startDate: encodeURIComponent(Utils.convertToHTML5Date(startDate)),
                    endDate: encodeURIComponent(Utils.convertToHTML5Date(endDate))
                }
            });
        },
        billReceiptHistory: function (contractAccountNumber, ccPaymentDate, ccNumber, ccReceiptNo, amount) {
            var el = document.createElement('form');
            angular.extend(el, {
                method: 'post',
                action: `${MyAccountServer}/accountRecords/${contractAccountNumber}/billReceiptHistory?ccPaymentDate=${Utils.convertToHTML5Date(
                    ccPaymentDate
                )}&contractAccountNumber=${contractAccountNumber}&ccReceiptNo=${ccReceiptNo}&ccNumber=${ccNumber}&amount=${amount}`,
                target: '_blank',
                headers: { 'Content-Type': undefined },
                params: {
                    contractAccountNumber: contractAccountNumber,
                    ccNumber: ccNumber,
                    ccReceiptNo: ccReceiptNo,
                    amount: amount,
                    paymentDate: ccPaymentDate
                }
            });
            document.body.appendChild(el);
            el.submit();
        },
        exportBillHistory: function (contractAccountNumber, startDate, endDate, exportType, exportFormat) {
            var el = document.createElement('form');
            angular.extend(el, {
                method: 'post',
                action: `${MyAccountServer}/accountRecords/${contractAccountNumber}/exportBillHistory?startDate=${Utils.convertToHTML5Date(
                    startDate
                )}&endDate=${Utils.convertToHTML5Date(endDate)}&exportType=${exportType}&exportFormat=${exportFormat}`,
                target: '_blank',
                headers: { 'Content-Type': undefined },
                params: {
                    startDate: Utils.convertToHTML5Date(startDate),
                    endDate: Utils.convertToHTML5Date(endDate),
                    exportType: exportType,
                    exportFormat: exportFormat
                }
            });
            document.body.appendChild(el);
            el.submit();
        },
        emailBillHistory: function (contractAccountNumber, startDate, endDate, exportType, exportFormat, emailId) {
            return http({
                method: 'POST',
                url: `/accountRecords/${contractAccountNumber}/exportBillHistory`,
                params: {
                    startDate: Utils.convertToHTML5Date(startDate),
                    endDate: Utils.convertToHTML5Date(endDate),
                    exportType: exportType,
                    exportFormat: exportFormat,
                    emailId: emailId
                }
            });
        }
    };
    return BillRecordsServer;
});
