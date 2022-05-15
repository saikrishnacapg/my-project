angular.module('myaccount.route').controller('SeeAndSaveAlertCtrl', function() {
//    this.stream = _.range(1,11);
//    this.type = 'day';
});

angular.module('myaccount.route').factory('SeeAndSaveAlert', function (SeeAndSaveData, SeeAndSaveParameters) {

    var alertColors = {
        green: "#43A047",
        light_orange: "#FFB74D",
        orange: "#EFBD46",
        light_red: "#E57373",
        red: "#EF5350",
        grey: "#D3D3D3"
    };

    var update = function(userAlert, alert, usage) {
        alert.usage = usage.kwh;
        alert.delta = userAlert.value - alert.usage ;
        alert.ratio = parseInt(_.round(alert.usage/userAlert.value * 100));
        alert.chart = [
            {
                label: alert.delta > 0 ? "Units used" : "Units goal",
                value: alert.delta > 0 ? alert.usage : userAlert.value,
                color: alert.ratio < 80 ? alertColors.green : alert.ratio < 100 ? alertColors.orange : alertColors.light_red
            } ,
            {
                label: alert.delta < 0 ? "Units exceeded" : "Units remaining",
                value: Math.abs(alert.delta),
                color: alert.ratio < 100 ? alertColors.grey : alertColors.red
            }
        ];
        
        return alert;
    };

    return {
        update: update
    };
});