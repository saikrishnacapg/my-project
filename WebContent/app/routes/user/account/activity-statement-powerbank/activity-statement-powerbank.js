angular.module('myaccount.route').config(function ($stateProvider) {
    $stateProvider.state('user.account.activitystatementpowerbank', {
        url: 'activitystatementpowerbank',
        templateUrl: 'app/routes/user/account/activity-statement-powerbank/activity-statement-powerbank.html',
        controller: 'ActivityStatementPowerbankCtrl',
        controllerAs: 'activityStatementPowerbankCtrl'
    });
});

angular.module('myaccount.route').constant('PowerBank3Constants', {
    PBSaverPlan6kW: 'PowerBank Saver Plan (6 kWh)',
    PBSaverPlan8kW: 'PowerBank Saver Plan (8 kWh)',
    PercentageBreakdown: '% Breakdown',
    TotalConsumption: 'Total Consumption',
    BatteryOffset: 'Battery Offset',
    BillableConsumption: 'Billable Consumption',
    ApplicableRate: 'Applicable Rate',
    EnergyConsumption: 'Energy Consumption',
    BatteryGreenValue: 75,
    BatteryAmberValue: 50,
    TwoDecimalPoint: 2,
    FourDecimalPoint: 4,
    ConsumptionDataFlag:5
});

angular
    .module('myaccount.route')
    .controller('ActivityStatementPowerbankCtrl', function (
        $scope,
        activityStatementPowerbankService,
        Modals,
        $sce,
        PowerBank3Constants,
        Regex,
        SYNERGY_DATE_FORMAT
    ) {
        let self = this;
        self.peakUsage = [];
        self.offPeakUsage = [];
        self.weekDayShoulder = [];
        self.weekEndShoulder = [];
        self.consumptionType = [];
        const index = 1;

        self.bandType = [
            '<span class="text-bold">Peak Period </span><br/> (3pm - 9pm weekdays)',
            '<span class="text-bold">Weekend Shoulder </span><br/>(7am - 9pm weekends)',
            '<span class="text-bold">Everyday Off-Peak </span><br/> (9pm - 7am everyday)',
            '<span class="text-bold">Weekday Shoulder </span><br/> (7am - 3pm weekdays)'
        ];

        self.account = $scope.accountCtrl.currentAccount;
        self.contractAccNumber = self.account.contractAccountNumber;

        //Load billing periods
        activityStatementPowerbankService.getPowerbankBillingPeriods(self.contractAccNumber).then(function (result) {
            if (result && result !=="null") {
                self.billPeriodsPB = result;
                self.selectedBillPeriod = result[result.length - index].billingPeriodName;
                self.loadPowerbankActivityStatementData(self.selectedBillPeriod);
            } else {
                self.showActivityStatementTooltip("Error", "MA_E69");
            }
        });

        //Load activity statement charges
        self.loadPowerbankActivityStatementData = function (billDate) {
            self.selectedBillPeriod = billDate;
            activityStatementPowerbankService
                .getPowerbankChargesData(self.contractAccNumber, billDate)
                .then(function (result) {
                    self.updateValues(result);
                });
        };
        self.updateValues = function (response) {
            self.peakUsage = [];
            self.offPeakUsage = [];
            self.weekDayShoulder = [];
            self.weekEndShoulder = [];
            self.consumptionType = [];
            self.a1Charges = response.A1Cost;
            self.batteryActualCharge = response.batteryActualCharge;
            self.pbSaverPlanCost = response.pbSaverPlanCost;
            self.pbSaverPlanStDt = response.pbSaverPlanStDt;
            self.possibleCharge = response.possibleCharge;
            self.savings = response.savings;
            self.totalSavings = response.totalSavings;
            //Energy Consumption & offset
            self.consumption = response.consumption;
            //Other charges & credits
            self.supplyCharge = response.supplyCharge;
            self.subscriptionFee = response.subscriptionFee;
            self.sellBuybackCredits = response.sellBuybackCredits;
            self.totalSum = [];
            self.peakUsageExended = [];
            self.offPeakUsageExended = [];
            self.weekDayShoulderExended = [];
            self.weekEndShoulderExended = [];
            self.totalSumExtended = [];
            self.firstCycleStartDate = '';
            self.firstCycleEndDate = '';
            self.secondCycleStartDate = '';
            self.secondCycleEndDate = '';
            self.firstCycleBillPeriod = '';
            self.secondCycleBillPeriod = '';
            self.splitBill=''
            angular.forEach(self.consumption, function (value, key) {
                let bandTotal = '';
                self.consumptionType.push(value.consumptionType);
                if (value.consumptionType === PowerBank3Constants.ApplicableRate) {
                    bandTotal = 'N/A';
                } else if (value.consumptionType !== PowerBank3Constants.PercentageBreakdown) {
                    bandTotal =
                     self.convertToFloat(value.peakUsage) +
                     self.convertToFloat(value.offPeakUsage) +
                     self.convertToFloat(value.weekDayShoulder) +
                     self.convertToFloat(value.weekEndShoulder);
                     bandTotal = self.limitDecimalPlace(bandTotal, PowerBank3Constants.TwoDecimalPoint);
                    if (value.consumptionType === PowerBank3Constants.EnergyConsumption) {
                        bandTotal = self.addDollarSign(bandTotal);
                    }
                }
                if (key <= PowerBank3Constants.ConsumptionDataFlag) {
                    self.totalSum.push(bandTotal);
                    self.firstCycleStartDate=moment(value.startDate).format(SYNERGY_DATE_FORMAT);
                    self.firstCycleEndDate=moment(value.endDate).format(SYNERGY_DATE_FORMAT);
                    self.firstCycleBillPeriod = self.firstCycleStartDate +' - '+ self.firstCycleEndDate;
                    self.splitBill=value.splitBill==='X'?true:false;
                } else {
                    self.totalSumExtended.push(bandTotal);
                    self.secondCycleStartDate=moment(value.startDate).format(SYNERGY_DATE_FORMAT);
                    self.secondCycleEndDate=moment(value.endDate).format(SYNERGY_DATE_FORMAT);
                    self.secondCycleBillPeriod = self.secondCycleStartDate +' - '+ self.secondCycleEndDate;
                    self.splitBill=value.splitBill==='X'?true:false;
                }
            });
            angular.forEach(self.consumption, function (value, key) {
                if (value.consumptionType !== PowerBank3Constants.PercentageBreakdown) {
                    if (self.consumptionType[key] === value.consumptionType) {
                        if (key <= PowerBank3Constants.ConsumptionDataFlag) {
                            self.peakUsage.push(self.formatDisplayValue(value.peakUsage, value.consumptionType));
                            self.offPeakUsage.push(self.formatDisplayValue(value.offPeakUsage, value.consumptionType));
                            self.weekDayShoulder.push(self.formatDisplayValue(value.weekDayShoulder, value.consumptionType));
                            self.weekEndShoulder.push(self.formatDisplayValue(value.weekEndShoulder, value.consumptionType));
                        } else {
                            self.peakUsageExended.push(self.formatDisplayValue(value.peakUsage, value.consumptionType));
                            self.offPeakUsageExended.push(self.formatDisplayValue(value.offPeakUsage, value.consumptionType));
                            self.weekDayShoulderExended.push(self.formatDisplayValue(value.weekDayShoulder, value.consumptionType));
                            self.weekEndShoulderExended.push(self.formatDisplayValue(value.weekEndShoulder, value.consumptionType));
                        }
                    }
                } else {
                    if (self.consumptionType[key] === value.consumptionType) {
                        let peakUsage = `${Math.round(value.peakUsage)}%`;
                        let peakUsageContent = `<div class='consumption-peak colour-red' style='width: ${peakUsage};'></div><span>${peakUsage}</span>`;
                        let offPeakUsage = `${Math.round(value.offPeakUsage)}%`;
                        let offPeakUsageContent = `<div class='consumption-off-peak colour-navy' style='width: ${offPeakUsage};'></div><span>${offPeakUsage}</span>`;
                        let weekDayShoulder = `${Math.round(value.weekDayShoulder)}%`;
                        let weekDayShoulderContent = `<div class='consumption-weekday-shoulder colour-green' style='width: ${weekDayShoulder};'></div><span>${weekDayShoulder}</span>`;
                        let weekEndShoulder = `${Math.round(value.weekEndShoulder)}%`;
                        let weekEndShoulderContent = `<div class='consumption-weekend-shoulder colour-turqoise' style='width: ${weekEndShoulder};'></div><span>${weekEndShoulder}</span>`;
                        if (key <= PowerBank3Constants.ConsumptionDataFlag) {
                            self.peakUsage.push(peakUsageContent);
                            self.offPeakUsage.push(offPeakUsageContent);
                            self.weekDayShoulder.push(weekDayShoulderContent);
                            self.weekEndShoulder.push(weekEndShoulderContent);
                        } else {
                            self.peakUsageExended.push(peakUsageContent);
                            self.offPeakUsageExended.push(offPeakUsageContent);
                            self.weekDayShoulderExended.push(weekDayShoulderContent);
                            self.weekEndShoulderExended.push(weekEndShoulderContent);
                        }
                    }
                }
            });

            self.finalResult = {
                bandType: self.bandType,
                consumptionValue: [self.peakUsage, self.weekEndShoulder, self.offPeakUsage, self.weekDayShoulder],
                consumptionValueExtended: [self.peakUsageExended, self.weekEndShoulderExended, self.offPeakUsageExended, self.weekDayShoulderExended]
            };

            //Savings,other charges input css based on value - positive - green, negative - red, 0 black
            let cssClassName;
            const savingPbSaverPlan = document.querySelector('[name="savings-pb-saver-plan"]');
            if (savingPbSaverPlan) {
                cssClassName = self.getSavingValueColour(self.savings);
                if (cssClassName) {
                    self.removeTextBoxClass(savingPbSaverPlan);
                    savingPbSaverPlan.classList.add(cssClassName);
                }
            }
            const savingSinceDate = document.querySelector('[name="savings-since-date"]');
            if (savingSinceDate) {
                cssClassName = self.getSavingValueColour(self.totalSavings);
                if (cssClassName) {
                    self.removeTextBoxClass(savingSinceDate);
                    savingSinceDate.classList.add(cssClassName);
                }
            }
            const otherSellBuybackCredits = document.querySelector('[name="other-sellBuybackCredits"]');
            if (otherSellBuybackCredits) {
                cssClassName = self.getOtherChargesColour(self.sellBuybackCredits);
                if (cssClassName) {
                    self.removeTextBoxClass(otherSellBuybackCredits);
                    otherSellBuybackCredits.classList.add(cssClassName);
                }
            }

            // Battery % and color
            self.batteryPercentageValue = self.getBatteryPercentageValue(self.batteryActualCharge, self.possibleCharge);
            const batteryPercentage = document.querySelector('.battery-percentage');
            if (batteryPercentage) {
                batteryPercentage.style.width = `${self.batteryPercentageValue}%`;
                let batteryCssClassName = self.getBatteryPercentageColour();
                if (batteryCssClassName) {
                    self.removeBatteryClass(batteryPercentage);
                    batteryPercentage.classList.add(batteryCssClassName);
                }
            }
        };

        self.formatDisplayValue = function (value, key) {
            let displayValue = 0;
            let floatValue = self.convertToFloat(value);
            if (
                key === PowerBank3Constants.TotalConsumption ||
                key === PowerBank3Constants.EnergyConsumption ||
                key === PowerBank3Constants.BatteryOffset ||
                key === PowerBank3Constants.BillableConsumption
            ) {
                displayValue = self.limitDecimalPlace(floatValue, PowerBank3Constants.TwoDecimalPoint);
                if (key === PowerBank3Constants.EnergyConsumption) {
                    displayValue = self.addDollarSign(displayValue);
                }
            } else if (key === PowerBank3Constants.ApplicableRate) {
                displayValue = self.limitDecimalPlace(floatValue, PowerBank3Constants.FourDecimalPoint);
                displayValue = self.addDollarSign(displayValue);
            }
            return displayValue;
        };

        self.convertToFloat = function (value) {
            let floatValue = '0';
            if (value) {
                floatValue = value.replace(Regex.FILTER_STRING, '');
            }
            return parseFloat(floatValue);
        };

        self.limitDecimalPlace = (value, decimalPoint) => value.toFixed(decimalPoint);

        self.addDollarSign = (value) => `$${value}`;

        self.getBatteryPercentageValue = function (value, totalValue) {
            let percentage = 0;
            let hundred = 100;
            let floatValue = self.convertToFloat(value);
            let floatTotalValue = self.convertToFloat(totalValue);
            if (floatValue && floatTotalValue) {
                percentage = Math.round(floatValue / floatTotalValue * hundred);
            }
            return percentage;
        };

        self.getBatteryPercentageColour = function () {
            let batteryPercentageColour;
            let minValue = 0;
            if (self.batteryPercentageValue >= PowerBank3Constants.BatteryGreenValue) {
                batteryPercentageColour = 'colour-green-battery';
            } else if (self.batteryPercentageValue > PowerBank3Constants.BatteryAmberValue && self.batteryPercentageValue < PowerBank3Constants.BatteryGreenValue) {
                batteryPercentageColour = 'colour-amber-battery';
            } else if (self.batteryPercentageValue > minValue && self.batteryPercentageValue < PowerBank3Constants.BatteryAmberValue) {
                batteryPercentageColour = 'colour-red-battery';
            } else {
                batteryPercentageColour = 'colour-white-battery';
            }
            return batteryPercentageColour;
        };

        self.getSavingValueColour = function (value) {
            let floatValue = self.convertToFloat(value);
            let minValue = 0;
            return floatValue && floatValue > minValue ? 'green-box-border' : floatValue && floatValue < minValue ? 'red-box-border':'black-box-border';
        };

        self.getOtherChargesColour = function (value) {
            let floatValue = self.convertToFloat(value);
            let minValue = 0;
            return floatValue && floatValue < minValue ? 'green-box-border' : floatValue && floatValue > minValue ? 'red-box-border':'black-box-border';
        };

        self.removeBatteryClass = function (item) {
            if (item){
                item.classList.remove('colour-green-battery', 'colour-amber-battery', 'colour-red-battery', 'colour-white-battery');
            }
        };

        self.removeTextBoxClass = function (item) {
            if (item) {
                item.classList.remove('green-box-border', 'red-box-border', 'black-box-border');
            }
        };

        // Tooltip-information messages
        self.showActivityStatementTooltip = function (title, messageID) {
            const message = $rootScope.messages[messageID];
            Modals.showAlert(title, `<p> ${message} </p>`);
        };

        $scope.trustAsHtml = function (string) {
            return $sce.trustAsHtml(string);
        };
    });