"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentGenerator = exports.DocumentGenerator = void 0;
class DocumentGenerator {
    generateAnalysisDocument(results, config, parameters, options = {}) {
        const { includeCharts = true, includeRawData = false, includeRecommendations = true, title } = options;
        const doc = [];
        // Header
        doc.push('═'.repeat(80));
        doc.push(`📊 MONTE CARLO SIMULATION ANALYSIS REPORT`);
        doc.push('═'.repeat(80));
        doc.push('');
        // Title and metadata
        doc.push(`🎯 **${title || config.name}**`);
        doc.push(`📋 ${config.description}`);
        doc.push(`🏷️  Category: ${config.category}`);
        doc.push(`🔖 Tags: ${config.tags?.join(', ') || 'None'}`);
        doc.push(`📅 Generated: ${new Date().toLocaleString()}`);
        doc.push(`🎲 Iterations: ${results.results.length.toLocaleString()}`);
        doc.push('');
        // Executive Summary
        doc.push('📈 EXECUTIVE SUMMARY');
        doc.push('─'.repeat(50));
        const summary = results.summary;
        const sortedOutputs = Object.entries(summary).sort((a, b) => {
            // Prioritize common business metrics
            const priorities = {
                roi: 10, netBenefit: 9, totalSavings: 8, annualSavings: 8,
                cost: 7, annualCost: 7, benefit: 6, revenue: 6
            };
            const aPriority = priorities[a[0].toLowerCase()] || 0;
            const bPriority = priorities[b[0].toLowerCase()] || 0;
            return bPriority - aPriority;
        });
        for (const [key, stats] of sortedOutputs) {
            const outputConfig = config.outputs?.find(o => o.key === key);
            const label = outputConfig?.label || this.formatKey(key);
            const description = outputConfig?.description || '';
            doc.push(`• ${label}: ${this.formatValue(stats.mean)} ± ${this.formatValue(stats.standardDeviation)}`);
            if (description) {
                doc.push(`  ${description}`);
            }
        }
        doc.push('');
        // Key Insights
        doc.push('💡 KEY INSIGHTS');
        doc.push('─'.repeat(50));
        doc.push(...this.generateKeyInsights(results, config, parameters));
        doc.push('');
        // Parameter Configuration
        doc.push('⚙️ SIMULATION PARAMETERS');
        doc.push('─'.repeat(50));
        for (const [key, value] of Object.entries(parameters)) {
            const paramConfig = config.parameters.find(p => p.key === key);
            const label = paramConfig?.label || this.formatKey(key);
            const formattedValue = this.formatParameterValue(value, paramConfig?.type);
            doc.push(`• ${label}: ${formattedValue}`);
        }
        doc.push('');
        // Statistical Analysis
        doc.push('📊 DETAILED STATISTICAL ANALYSIS');
        doc.push('─'.repeat(50));
        for (const [key, stats] of Object.entries(summary)) {
            const outputConfig = config.outputs?.find(o => o.key === key);
            const label = outputConfig?.label || this.formatKey(key);
            doc.push(`${label}:`);
            doc.push(`  Mean: ${this.formatValue(stats.mean)}`);
            doc.push(`  Standard Deviation: ${this.formatValue(stats.standardDeviation)}`);
            doc.push(`  Range: ${this.formatValue(stats.min)} to ${this.formatValue(stats.max)}`);
            doc.push(`  Confidence Intervals:`);
            doc.push(`    10th percentile: ${this.formatValue(stats.percentile10)}`);
            doc.push(`    50th percentile: ${this.formatValue(stats.median)} (median)`);
            doc.push(`    90th percentile: ${this.formatValue(stats.percentile90)}`);
            doc.push('');
        }
        // Text-based visualizations
        if (includeCharts) {
            doc.push('📈 DISTRIBUTION VISUALIZATIONS');
            doc.push('─'.repeat(50));
            for (const [key, stats] of Object.entries(summary)) {
                const outputConfig = config.outputs?.find(o => o.key === key);
                const label = outputConfig?.label || this.formatKey(key);
                doc.push(`${label} Distribution:`);
                const numericValues = results.results
                    .map(r => r[key])
                    .filter((v) => typeof v === 'number');
                if (numericValues.length > 0) {
                    doc.push(this.generateHistogram(numericValues));
                }
                else {
                    doc.push('No numeric data available for histogram');
                }
                doc.push('');
                doc.push(`${label} Confidence Intervals:`);
                doc.push(this.generateConfidenceChart(stats));
                doc.push('');
            }
        }
        // Risk Analysis
        doc.push('⚠️ RISK ANALYSIS');
        doc.push('─'.repeat(50));
        doc.push(...this.generateRiskAnalysis(results, config));
        doc.push('');
        // Recommendations
        if (includeRecommendations) {
            doc.push('🎯 STRATEGIC RECOMMENDATIONS');
            doc.push('─'.repeat(50));
            doc.push(...this.generateRecommendations(results, config, parameters));
            doc.push('');
        }
        // Raw data appendix
        if (includeRawData) {
            doc.push('📋 RAW DATA APPENDIX');
            doc.push('─'.repeat(50));
            doc.push('First 10 simulation results:');
            doc.push('');
            const headers = Object.keys(results.results[0] || {});
            doc.push('| ' + headers.map(h => h.padEnd(12)).join(' | ') + ' |');
            doc.push('|' + headers.map(() => '-'.repeat(14)).join('|') + '|');
            for (let i = 0; i < Math.min(10, results.results.length); i++) {
                const row = results.results[i];
                doc.push('| ' + headers.map(h => {
                    const value = row[h];
                    const formatted = typeof value === 'number' ? this.formatValue(value) : String(value);
                    return formatted.padEnd(12);
                }).join(' | ') + ' |');
            }
            doc.push('');
            doc.push(`... and ${results.results.length - 10} more results`);
            doc.push('');
        }
        // Footer
        doc.push('═'.repeat(80));
        doc.push('Generated by Monte Carlo Business Decision Framework');
        doc.push(`📊 Framework: Examples-First Monte Carlo Simulation`);
        doc.push(`🔗 GitHub: https://github.com/rmurphey/monte-carlo-simulator`);
        doc.push('═'.repeat(80));
        return doc.join('\n');
    }
    generateHistogram(values) {
        if (!values.length)
            return 'No data available';
        const sortedValues = [...values].sort((a, b) => a - b);
        const min = sortedValues[0];
        const max = sortedValues[sortedValues.length - 1];
        const range = max - min;
        if (range === 0)
            return `All values: ${this.formatValue(min)}`;
        // Create 20 buckets
        const buckets = new Array(20).fill(0);
        const bucketSize = range / 20;
        for (const value of values) {
            const bucketIndex = Math.min(19, Math.floor((value - min) / bucketSize));
            buckets[bucketIndex]++;
        }
        const maxCount = Math.max(...buckets);
        const chart = [];
        // Create histogram bars
        for (let i = 0; i < buckets.length; i++) {
            const bucketMin = min + (i * bucketSize);
            // const bucketMax = min + ((i + 1) * bucketSize) // Unused for now
            const count = buckets[i];
            const barLength = Math.round((count / maxCount) * 40);
            const bar = '█'.repeat(barLength) + '░'.repeat(40 - barLength);
            chart.push(`${this.formatValue(bucketMin).padStart(10)} │${bar}│ ${count}`);
        }
        return chart.join('\n');
    }
    generateConfidenceChart(stats) {
        const chart = [];
        const width = 60;
        // Normalize values to chart width
        const range = stats.max - stats.min;
        if (range === 0)
            return `Single value: ${this.formatValue(stats.mean)}`;
        const normalize = (value) => Math.round(((value - stats.min) / range) * width);
        const p10Pos = normalize(stats.percentile10);
        const p50Pos = normalize(stats.median);
        const p90Pos = normalize(stats.percentile90);
        const meanPos = normalize(stats.mean);
        // Build confidence interval chart
        const line = new Array(width + 1).fill('─');
        line[p10Pos] = '├';
        line[p50Pos] = '┼';
        line[p90Pos] = '┤';
        line[meanPos] = '●';
        chart.push(`${this.formatValue(stats.min).padStart(10)} ${line.join('')} ${this.formatValue(stats.max)}`);
        chart.push(`${''.padStart(11)}├────── 80% confidence ──────┤`);
        chart.push(`${''.padStart(11)}P10: ${this.formatValue(stats.percentile10)} | P50: ${this.formatValue(stats.median)} | P90: ${this.formatValue(stats.percentile90)}`);
        chart.push(`${''.padStart(11)}Mean: ${this.formatValue(stats.mean)} ●`);
        return chart.join('\n');
    }
    generateKeyInsights(results, config, parameters) {
        const insights = [];
        const summary = results.summary;
        // ROI insights
        if (summary.roi || summary.roiPercentage) {
            const roiStats = summary.roi || summary.roiPercentage;
            if (roiStats.mean > 50) {
                insights.push(`🚀 Strong ROI: ${this.formatValue(roiStats.mean)}% average return significantly exceeds market benchmarks`);
            }
            else if (roiStats.mean > 15) {
                insights.push(`📈 Positive ROI: ${this.formatValue(roiStats.mean)}% average return shows good value`);
            }
            else if (roiStats.mean > 0) {
                insights.push(`📊 Marginal ROI: ${this.formatValue(roiStats.mean)}% average return requires careful consideration`);
            }
            else {
                insights.push(`⚠️ Negative ROI: ${this.formatValue(roiStats.mean)}% average indicates investment may not be worthwhile`);
            }
            const riskLevel = roiStats.standardDeviation / Math.abs(roiStats.mean);
            if (riskLevel > 1) {
                insights.push(`🎲 High uncertainty: ROI variance is ${(riskLevel * 100).toFixed(0)}% of mean - consider risk mitigation`);
            }
        }
        // Cost vs benefit insights
        const costKeys = Object.keys(summary).filter(k => k.toLowerCase().includes('cost'));
        const benefitKeys = Object.keys(summary).filter(k => k.toLowerCase().includes('benefit') || k.toLowerCase().includes('saving'));
        if (costKeys.length > 0 && benefitKeys.length > 0) {
            const totalCost = costKeys.reduce((sum, key) => sum + (summary[key]?.mean || 0), 0);
            const totalBenefit = benefitKeys.reduce((sum, key) => sum + (summary[key]?.mean || 0), 0);
            const ratio = totalBenefit / totalCost;
            if (ratio > 3) {
                insights.push(`💰 Excellent value: Benefits exceed costs by ${ratio.toFixed(1)}x`);
            }
            else if (ratio > 1.5) {
                insights.push(`✅ Good value: Benefits exceed costs by ${ratio.toFixed(1)}x`);
            }
            else if (ratio > 1) {
                insights.push(`⚖️ Marginal value: Benefits slightly exceed costs (${ratio.toFixed(1)}x)`);
            }
        }
        // Automation insights (for QA simulations)
        if (config.name.toLowerCase().includes('qa') || config.name.toLowerCase().includes('quality')) {
            if (parameters.qaStrategy === 'automated') {
                insights.push(`🤖 Automation advantage: Significantly faster test execution and better scalability`);
            }
            else if (parameters.qaStrategy === 'hybrid') {
                insights.push(`🎯 Balanced approach: Combines automation efficiency with human insight`);
            }
            else if (parameters.qaStrategy === 'manual') {
                insights.push(`👥 Manual testing: Better edge case detection but limited scalability`);
            }
        }
        return insights;
    }
    generateRiskAnalysis(results, _config) {
        const risks = [];
        const summary = results.summary;
        // Analyze downside risk
        const keyMetrics = ['roi', 'netBenefit', 'totalSavings', 'netAnnualBenefit'];
        for (const metric of keyMetrics) {
            if (summary[metric]) {
                const stats = summary[metric];
                const downsideRisk = (stats.mean - stats.percentile10) / stats.mean;
                if (downsideRisk > 0.5) {
                    risks.push(`⚠️ High downside risk in ${this.formatKey(metric)}: 10% chance of ${(downsideRisk * 100).toFixed(0)}% below average`);
                }
                // Probability of negative outcomes
                const negativeCount = results.results.filter(r => {
                    const value = r[metric];
                    return typeof value === 'number' && value < 0;
                }).length;
                const negativeProbability = (negativeCount / results.results.length) * 100;
                if (negativeProbability > 10) {
                    risks.push(`🚨 Loss probability: ${negativeProbability.toFixed(0)}% chance of negative ${this.formatKey(metric)}`);
                }
                else if (negativeProbability > 0) {
                    risks.push(`📊 Low loss risk: ${negativeProbability.toFixed(1)}% chance of negative ${this.formatKey(metric)}`);
                }
            }
        }
        if (risks.length === 0) {
            risks.push(`✅ Low risk profile: All key metrics show consistent positive outcomes`);
        }
        return risks;
    }
    generateRecommendations(results, config, parameters) {
        const recommendations = [];
        const summary = results.summary;
        // ROI-based recommendations
        if (summary.roi || summary.roiPercentage) {
            const roiStats = summary.roi || summary.roiPercentage;
            if (roiStats.mean > 100) {
                recommendations.push(`🚀 STRONG RECOMMEND: Proceed with investment - exceptional ROI potential`);
            }
            else if (roiStats.mean > 30) {
                recommendations.push(`✅ RECOMMEND: Invest - solid ROI above market benchmarks`);
            }
            else if (roiStats.mean > 10) {
                recommendations.push(`📊 CONDITIONAL: Consider investment with risk mitigation`);
            }
            else if (roiStats.mean > 0) {
                recommendations.push(`⚠️ CAUTION: Marginal returns - explore alternatives`);
            }
            else {
                recommendations.push(`❌ NOT RECOMMENDED: Negative expected returns`);
            }
        }
        // Parameter optimization suggestions
        if (config.name.toLowerCase().includes('qa')) {
            if (parameters.releaseFrequency && parameters.releaseFrequency > 50) {
                recommendations.push(`🤖 High release frequency detected - prioritize automation for efficiency`);
            }
            if (parameters.qaStrategy === 'manual' && parameters.teamSize > 10) {
                recommendations.push(`🔄 Large team with manual QA - consider hybrid approach for scalability`);
            }
        }
        // Risk mitigation
        const highVarianceMetrics = Object.entries(summary)
            .filter(([_, stats]) => (stats.standardDeviation / Math.abs(stats.mean)) > 0.5)
            .map(([key, _]) => this.formatKey(key));
        if (highVarianceMetrics.length > 0) {
            recommendations.push(`🎯 RISK MITIGATION: High variance in ${highVarianceMetrics.join(', ')} - consider pilot program`);
        }
        // Scaling recommendations
        if (parameters.teamSize && parameters.teamSize < 5) {
            recommendations.push(`📈 SCALING: Small team detected - results may scale differently with growth`);
        }
        return recommendations;
    }
    formatKey(key) {
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }
    formatValue(value) {
        if (typeof value !== 'number' || isNaN(value))
            return 'N/A';
        if (Math.abs(value) >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        }
        else if (Math.abs(value) >= 1000) {
            return `${(value / 1000).toFixed(1)}K`;
        }
        else if (value % 1 === 0) {
            return value.toLocaleString();
        }
        else {
            return value.toFixed(2);
        }
    }
    formatParameterValue(value, type) {
        if (type === 'boolean') {
            return value ? 'Yes' : 'No';
        }
        else if (typeof value === 'number') {
            return this.formatValue(value);
        }
        else {
            return String(value);
        }
    }
}
exports.DocumentGenerator = DocumentGenerator;
exports.documentGenerator = new DocumentGenerator();
//# sourceMappingURL=document-generator.js.map