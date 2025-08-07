"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessSimulation = void 0;
const BaseSimulation_1 = require("./BaseSimulation");
/**
 * Base class for business-focused Monte Carlo simulations
 * Provides essential business intelligence functions without industry-specific logic
 */
class BusinessSimulation extends BaseSimulation_1.BaseSimulation {
    /**
     * Calculate return on investment percentage
     */
    calculateROI(investment, returns, timeframe = 1) {
        if (investment <= 0)
            return 0;
        return ((returns - investment) / investment) * 100 / timeframe;
    }
    /**
     * Calculate payback period in months
     */
    calculatePaybackPeriod(investment, monthlyReturns) {
        if (monthlyReturns <= 0)
            return 999;
        return investment / monthlyReturns;
    }
    /**
     * Calculate break-even timeline
     */
    calculateBreakEven(fixedCosts, unitPrice, unitCost, monthlyVolume) {
        const monthlyMargin = (unitPrice - unitCost) * monthlyVolume;
        if (monthlyMargin <= 0)
            return 999;
        return fixedCosts / monthlyMargin;
    }
    /**
     * Calculate Customer Acquisition Cost
     */
    calculateCAC(marketingSpend, customersAcquired) {
        if (customersAcquired <= 0)
            return 0;
        return marketingSpend / customersAcquired;
    }
    /**
     * Calculate Customer Lifetime Value
     */
    calculateCLV(avgOrderValue, purchaseFrequency, customerLifespan, grossMargin = 0.3) {
        return avgOrderValue * purchaseFrequency * customerLifespan * grossMargin;
    }
    /**
     * Calculate Net Present Value with discount rate
     */
    calculateNPV(cashFlows, discountRate) {
        return cashFlows.reduce((npv, cashFlow, year) => {
            return npv + cashFlow / Math.pow(1 + discountRate, year);
        }, 0);
    }
    /**
     * Calculate compound annual growth rate
     */
    calculateCAGR(startingValue, endingValue, periods) {
        if (startingValue <= 0 || endingValue <= 0 || periods <= 0)
            return 0;
        return (Math.pow(endingValue / startingValue, 1 / periods) - 1) * 100;
    }
    /**
     * Calculate monthly burn rate and runway
     */
    calculateRunway(currentCash, monthlyBurnRate) {
        if (monthlyBurnRate <= 0)
            return 999;
        return currentCash / monthlyBurnRate;
    }
    /**
     * Calculate team scaling costs with coordination overhead
     */
    calculateTeamScalingCost(currentTeamSize, newHires, avgSalary, coordinationOverhead = 0.15) {
        const baseCost = newHires * avgSalary;
        const coordinationCost = (currentTeamSize + newHires) * coordinationOverhead * avgSalary;
        return baseCost + coordinationCost;
    }
    /**
     * Generate standard business KPIs
     */
    generateBusinessKPIs(revenue, costs, investment, customersAcquired = 0, marketingSpend = 0) {
        const netProfit = revenue - costs;
        const roi = this.calculateROI(investment, revenue);
        const paybackPeriod = this.calculatePaybackPeriod(investment, netProfit / 12);
        const marginPercent = revenue > 0 ? (netProfit / revenue) * 100 : 0;
        const kpis = {
            roi: this.round(roi, 1),
            paybackPeriod: this.round(Math.min(paybackPeriod, 999), 1),
            marginPercent: this.round(marginPercent, 1),
            revenuePerUnit: revenue
        };
        if (customersAcquired > 0 && marketingSpend > 0) {
            kpis.customerAcquisitionCost = this.round(this.calculateCAC(marketingSpend, customersAcquired), 2);
        }
        return kpis;
    }
    /**
     * Apply seasonal variation to a value
     */
    applySeasonalVariation(baseValue, seasonalVariationPercent) {
        const variation = (this.random() - 0.5) * (seasonalVariationPercent / 100);
        return baseValue * (1 + variation);
    }
    /**
     * Model market competition impact
     */
    applyCompetitionImpact(baseValue, competitionLevel) {
        const competitionMultipliers = {
            low: 1.2,
            moderate: 1.0,
            high: 0.8,
            saturated: 0.6
        };
        const baseMultiplier = competitionMultipliers[competitionLevel];
        const variance = 0.8 + this.random() * 0.4; // ±20% execution variance
        return baseValue * baseMultiplier * variance;
    }
    /**
     * Calculate confidence intervals for results
     */
    calculateConfidenceInterval(values, confidence = 0.95) {
        const sorted = values.slice().sort((a, b) => a - b);
        const alpha = 1 - confidence;
        const lowerIndex = Math.floor(sorted.length * (alpha / 2));
        const upperIndex = Math.ceil(sorted.length * (1 - alpha / 2)) - 1;
        const mean = sorted.reduce((sum, val) => sum + val, 0) / sorted.length;
        return {
            lower: sorted[lowerIndex],
            upper: sorted[upperIndex],
            mean
        };
    }
    /**
     * Run Monte Carlo simulation with multiple iterations
     */
    runMonteCarloAnalysis(parameters, iterations = 1000) {
        const results = [];
        for (let i = 0; i < iterations; i++) {
            const result = this.calculateScenario(parameters);
            results.push(result);
        }
        // Calculate statistics
        const outputKeys = Object.keys(results[0]).filter(key => typeof results[0][key] === 'number');
        const statistics = {
            mean: {},
            median: {},
            confidenceInterval95: {},
            standardDeviation: {}
        };
        outputKeys.forEach(key => {
            const values = results.map(r => r[key]);
            const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
            const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
            const stdDev = Math.sqrt(variance);
            const ci = this.calculateConfidenceInterval(values, 0.95);
            statistics.mean[key] = this.round(mean, 2);
            statistics.median[key] = this.round(ci.mean, 2);
            statistics.confidenceInterval95[key] = {
                lower: this.round(ci.lower, 2),
                upper: this.round(ci.upper, 2)
            };
            statistics.standardDeviation[key] = this.round(stdDev, 2);
        });
        return { results, statistics };
    }
}
exports.BusinessSimulation = BusinessSimulation;
//# sourceMappingURL=BusinessSimulation.js.map