angular.module('myaccount.shared.services').factory('AccountBillServer', function (http, MyAccountServer) {
    var AccountBillServer = {
        billLink: function (contractAccountNumber, bill, format) {
            if (!bill.isBill) {
                return undefined;
            }
            if (contractAccountNumber != bill.contractAccountNumber) {
                return `${MyAccountServer}/billPdf/${contractAccountNumber}/${bill.contractAccountNumber}/show?id=${bill.pdfId}&exportFormat=${format}`;
            } else {
                return `${MyAccountServer}/billPdf/${contractAccountNumber}/show?id=${bill.pdfId}&exportFormat=${format}`;
            }
        },
        viewBillLink: function (contractAccountNumber, latestBill_pdfId, format) {
            if (!latestBill_pdfId) {
                return undefined;
            }
            return `${MyAccountServer}/billPdf/${contractAccountNumber}/show?id=${latestBill_pdfId}&exportFormat=${format}`;
        },
        getNextScheduleMeterReading: function (contractAccountNumber) {
            return http({
                method: 'POST',
                url: `/accountRecords/${contractAccountNumber}/getNextScheduleMeterReading`
            });
        },
        getMyAccountNotification: function (contractAccountNumber) {
            return http({
                method: 'POST',
                url: `/accountRecords/${contractAccountNumber}/getMyAccountNotification`
            });
        },
        getSolarXbannerShowHideFlag: function (contractAccountNumber) {
            return http({
                method: 'POST',
                url: `/accountRecords/${contractAccountNumber}/getSolarXbannerShowHideFlag`
            });
        },
        getBannerAccountInfo: function (contractAccountNumber) {
            return http({
                method: 'POST',
                url: `/accountRecords/${contractAccountNumber}/getBannerAccountInfo`
            });
        },
        getRecontractingBannerInfo: function (contractAccountNumber) {
            return http({
                method: 'GET',
                url: `/accountRecords/${contractAccountNumber}/getRecontractingBannerInfo`
            });
        },
        getPaymentArrangementDetails: function (contractAccountNumber) {
            return http({
                method: 'POST',
                url: `/accountRecords/${contractAccountNumber}/getP2PDetails`
            });
        }
    };

    return AccountBillServer;
});
