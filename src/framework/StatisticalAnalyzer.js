export class StatisticalAnalyzer {
    calculateSummary(values) {
        if (values.length === 0) {
            throw new Error('Cannot calculate statistics for empty array');
        }
        const sorted = [...values].sort((a, b) => a - b);
        const n = sorted.length;
        return {
            mean: this.calculateMean(values),
            median: this.calculatePercentile(sorted, 50),
            standardDeviation: this.calculateStandardDeviation(values),
            percentile10: this.calculatePercentile(sorted, 10),
            percentile25: this.calculatePercentile(sorted, 25),
            percentile75: this.calculatePercentile(sorted, 75),
            percentile90: this.calculatePercentile(sorted, 90),
            min: sorted[0],
            max: sorted[n - 1],
            count: n
        };
    }
    calculateMean(values) {
        return values.reduce((sum, value) => sum + value, 0) / values.length;
    }
    calculateStandardDeviation(values) {
        const mean = this.calculateMean(values);
        const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
        const variance = this.calculateMean(squaredDifferences);
        return Math.sqrt(variance);
    }
    calculatePercentile(sortedValues, percentile) {
        if (percentile < 0 || percentile > 100) {
            throw new Error('Percentile must be between 0 and 100');
        }
        const index = (percentile / 100) * (sortedValues.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index % 1;
        if (lower === upper) {
            return sortedValues[lower];
        }
        return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
    }
    calculateHistogram(values, bins = 20) {
        if (values.length === 0)
            return [];
        const min = Math.min(...values);
        const max = Math.max(...values);
        const binWidth = (max - min) / bins;
        const histogram = [];
        for (let i = 0; i < bins; i++) {
            const binStart = min + i * binWidth;
            const binEnd = binStart + binWidth;
            const count = values.filter(value => value >= binStart && (i === bins - 1 ? value <= binEnd : value < binEnd)).length;
            histogram.push({
                binStart,
                binEnd,
                count,
                percentage: (count / values.length) * 100
            });
        }
        return histogram;
    }
    calculateRiskMetrics(values, threshold = 0) {
        const sorted = [...values].sort((a, b) => a - b);
        const n = sorted.length;
        const lossCount = values.filter(v => v < threshold).length;
        const probabilityOfLoss = (lossCount / n) * 100;
        const var95Index = Math.floor(n * 0.05);
        const var99Index = Math.floor(n * 0.01);
        const valueAtRisk95 = sorted[var95Index];
        const valueAtRisk99 = sorted[var99Index];
        const tail95 = sorted.slice(0, var95Index + 1);
        const tail99 = sorted.slice(0, var99Index + 1);
        const expectedShortfall95 = tail95.length > 0 ? this.calculateMean(tail95) : valueAtRisk95;
        const expectedShortfall99 = tail99.length > 0 ? this.calculateMean(tail99) : valueAtRisk99;
        return {
            probabilityOfLoss,
            valueAtRisk95,
            valueAtRisk99,
            expectedShortfall95,
            expectedShortfall99
        };
    }
}
//# sourceMappingURL=StatisticalAnalyzer.js.map