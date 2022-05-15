angular.module('myaccount.shared.services').service('DateService', function() {

    // Hardcoded public holidays, should be retrieved from SAP in the future
    this.PUBLIC_HOLIDAYS = [
        {holiday: "New Year's Day", date: moment("1/01/2021", "DD/MM/YYYY")},
        {holiday: "Australia Day", date: moment("26/01/2021", "DD/MM/YYYY")},
        {holiday: "Labour Day WA", date: moment("1/03/2021", "DD/MM/YYYY")},
        {holiday: "Good Friday", date: moment("02/04/2021", "DD/MM/YYYY")},
        {holiday: "Easter Monday", date: moment("05/04/2021", "DD/MM/YYYY")},
        {holiday: "Anzac Day", date: moment("26/04/2021", "DD/MM/YYYY")},
        {holiday: "Foundation Day", date: moment("7/06/2021", "DD/MM/YYYY")},
        {holiday: "Queens Birthday", date: moment("27/09/2021", "DD/MM/YYYY")},
        {holiday: "Christmas Day", date: moment("27/12/2021", "DD/MM/YYYY")},
        {holiday: "Boxing Day", date: moment("28/12/2021", "DD/MM/YYYY")},
    ];

});