/**
 * Uses the ngCsv script to translate an array to a CSV file.
 * In pilot at the moment hence the angularLoad approach.
 */
angular.module('myaccount.directives').directive('syCsvDownload', function (CsvService) {
    return {
        restrict: 'A',
        scope: {
            csvCa: '=',
            csvHeader: '=?',
            csvData: '='
        }, // isolate scope
        link: function(scope, element) {
            element.on('click', function() {
                CsvService.downloadAsCSV(scope.csvCa, scope.csvHeader, scope.csvData);
            });
        }
    };
});

angular.module('myaccount.directives').service('CsvService', function (http, DateUtils, MyAccountServer, Regex) {
    this.downloadAsCSV = function(contractAccountNumber, header, array) {

        var formattedData = _.collect(array, function(row){
            return _.collect(row, function(column) {
                return Regex.JSONDATE.test(column) ? DateUtils.formatJSONDateTime(column) : column;
            });
        });


        var url = MyAccountServer + "/csv/" + contractAccountNumber + "/download";
        var el = document.createElement('form');
        angular.extend(el, {
            method: 'post',
            action: url,
            target: '_blank',
            headers: {'Content-Type': undefined}
        });

        document.body.appendChild(el);

        var input = document.createElement('input');
        if (header)
            formattedData.unshift(header);
        var arrayAsCsv = this.toCsvArray(formattedData);
        var arrayAsString = _.reduce(arrayAsCsv, function(result, row) {
            result+=row;
            return result;
        });

        angular.element(input).attr({type: 'hidden', name: 'csvData', value:arrayAsString})

        el.appendChild(input);

        el.submit();
    };

    this.toCsvArray = function(array) {
        return _.map(array, function(row) {
            var rowAsCsv =  _.reduce(row, function(result, column) {
                result = result + ("," + column);
                return result;
            });
            return rowAsCsv + "\n";
        })
    };

});