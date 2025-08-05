import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter } from 'recharts';

const MonteCarloSimulation = () => {
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [scenarios, setScenarios] = useState([]);
  
  // Simulation parameters
  const [params, setParams] = useState({
    initialCost: 50000,
    monthlySubscription: 5000,
    implementationTime: 6,
    adoptionRate: 0.7,
    revenueImpact: 0.15,
    costSavings: 25000,
    priceIncreaseRate: 1.5,
    priceIncreaseMonth: 18,
    baselineRevenue: 1000000,
    iterations: 1000
  });

  const runSimulation = () => {
    setIsRunning(true);
    
    setTimeout(() => {
      const iterations = params.iterations;
      const results = [];
      const scenarioData = [];
      
      for (let i = 0; i < iterations; i++) {
        const scenario = simulateScenario(params);
        results.push(scenario);
        
        // Store some scenarios for detailed view
        if (i < 100) {
          scenarioData.push({
            iteration: i,
            roi: scenario.roi,
            totalCost: scenario.totalCost,
            totalBenefit: scenario.totalBenefit,
            adoptionSuccess: scenario.adoptionSuccess
          });
        }
      }
      
      // Calculate summary statistics
      const rois = results.map(r => r.roi).sort((a, b) => a - b);
      const totalCosts = results.map(r => r.totalCost);
      const totalBenefits = results.map(r => r.totalBenefit);
      
      const summary = {
        meanROI: rois.reduce((a, b) => a + b, 0) / rois.length,
        medianROI: rois[Math.floor(rois.length / 2)],
        percentile10: rois[Math.floor(rois.length * 0.1)],
        percentile90: rois[Math.floor(rois.length * 0.9)],
        negativeROIPercentage: (rois.filter(r => r < 0).length / rois.length) * 100,
        meanCost: totalCosts.reduce((a, b) => a + b, 0) / totalCosts.length,
        meanBenefit: totalBenefits.reduce((a, b) => a + b, 0) / totalBenefits.length
      };
      
      // Create histogram data
      const histogramBins = 20;
      const minROI = Math.min(...rois);
      const maxROI = Math.max(...rois);
      const binWidth = (maxROI - minROI) / histogramBins;
      
      const histogram = [];
      for (let i = 0; i < histogramBins; i++) {
        const binStart = minROI + i * binWidth;
        const binEnd = binStart + binWidth;
        const count = rois.filter(roi => roi >= binStart && roi < binEnd).length;
        histogram.push({
          bin: `${binStart.toFixed(0)}% to ${binEnd.toFixed(0)}%`,
          binCenter: binStart + binWidth / 2,
          count: count,
          percentage: (count / iterations) * 100
        });
      }
      
      setResults({ summary, histogram, scenarios: scenarioData });
      setScenarios(scenarioData);
      setIsRunning(false);
    }, 100);
  };

  const simulateScenario = (params) => {
    // Random factors affecting the outcome
    const adoptionMultiplier = Math.random() < params.adoptionRate ? 1 : 0.3;
    const implementationDelay = 1 + Math.random() * 2; // 1-3x longer than expected
    const actualRevenueImpact = params.revenueImpact * (0.5 + Math.random()); // 50%-150% of expected
    const actualCostSavings = params.costSavings * (0.3 + Math.random() * 0.9); // 30%-120% of expected
    const competitorResponse = Math.random() < 0.3 ? 0.7 : 1; // 30% chance competitors reduce our advantage
    
    // Calculate costs over 36 months
    let totalCost = params.initialCost;
    let totalBenefit = 0;
    
    const timeToValue = params.implementationTime * implementationDelay;
    
    for (let month = 1; month <= 36; month++) {
      // Monthly subscription cost (with price increase)
      let monthlyCost = params.monthlySubscription;
      if (month >= params.priceIncreaseMonth) {
        monthlyCost *= params.priceIncreaseRate;
      }
      totalCost += monthlyCost;
      
      // Benefits start after implementation period
      if (month > timeToValue) {
        const monthlyRevenueBenefit = (actualRevenueImpact * params.baselineRevenue / 12) * adoptionMultiplier * competitorResponse;
        const monthlyCostSaving = (actualCostSavings / 12) * adoptionMultiplier;
        totalBenefit += monthlyRevenueBenefit + monthlyCostSaving;
      }
    }
    
    const roi = ((totalBenefit - totalCost) / totalCost) * 100;
    
    return {
      roi,
      totalCost,
      totalBenefit,
      adoptionSuccess: adoptionMultiplier > 0.5,
      implementationDelay,
      timeToValue
    };
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white">
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-webkit-slider-track {
          height: 8px;
          border-radius: 4px;
          background: #E5E7EB;
        }
        
        .slider::-moz-range-track {
          height: 8px;
          border-radius: 4px;
          background: #E5E7EB;
          border: none;
        }
      `}</style>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">AI Tool Investment Monte Carlo Simulation</h2>
        <p className="text-gray-700 mb-6">
          This simulation models the financial uncertainty around AI tool investments, incorporating variables like 
          adoption success, implementation delays, price increases, and varying business impact.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Initial Costs</h3>
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Initial Setup Cost: ${params.initialCost.toLocaleString()}
            </label>
            <input
              type="range"
              min="10000"
              max="200000"
              step="5000"
              value={params.initialCost}
              onChange={(e) => setParams({...params, initialCost: parseInt(e.target.value)})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>$10k</span>
              <span>$200k</span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Monthly Subscription: ${params.monthlySubscription.toLocaleString()}
            </label>
            <input
              type="range"
              min="1000"
              max="20000"
              step="500"
              value={params.monthlySubscription}
              onChange={(e) => setParams({...params, monthlySubscription: parseInt(e.target.value)})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>$1k</span>
              <span>$20k</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Implementation</h3>
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Expected Implementation: {params.implementationTime} months
            </label>
            <input
              type="range"
              min="1"
              max="12"
              step="1"
              value={params.implementationTime}
              onChange={(e) => setParams({...params, implementationTime: parseInt(e.target.value)})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 month</span>
              <span>12 months</span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Adoption Success Rate: {(params.adoptionRate * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={params.adoptionRate}
              onChange={(e) => setParams({...params, adoptionRate: parseFloat(e.target.value)})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Expected Benefits</h3>
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Revenue Impact: {(params.revenueImpact * 100).toFixed(1)}%
            </label>
            <input
              type="range"
              min="0.01"
              max="0.5"
              step="0.01"
              value={params.revenueImpact}
              onChange={(e) => setParams({...params, revenueImpact: parseFloat(e.target.value)})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1%</span>
              <span>50%</span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Annual Cost Savings: ${params.costSavings.toLocaleString()}
            </label>
            <input
              type="range"
              min="5000"
              max="200000"
              step="5000"
              value={params.costSavings}
              onChange={(e) => setParams({...params, costSavings: parseInt(e.target.value)})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>$5k</span>
              <span>$200k</span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Baseline Annual Revenue: ${(params.baselineRevenue / 1000000).toFixed(1)}M
            </label>
            <input
              type="range"
              min="100000"
              max="50000000"
              step="100000"
              value={params.baselineRevenue}
              onChange={(e) => setParams({...params, baselineRevenue: parseInt(e.target.value)})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>$0.1M</span>
              <span>$50M</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Market Changes</h3>
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Price Increase: {params.priceIncreaseRate}x
            </label>
            <input
              type="range"
              min="1"
              max="5"
              step="0.1"
              value={params.priceIncreaseRate}
              onChange={(e) => setParams({...params, priceIncreaseRate: parseFloat(e.target.value)})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1x</span>
              <span>5x</span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Price Increase Month: {params.priceIncreaseMonth}
            </label>
            <input
              type="range"
              min="6"
              max="36"
              step="1"
              value={params.priceIncreaseMonth}
              onChange={(e) => setParams({...params, priceIncreaseMonth: parseInt(e.target.value)})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>6 months</span>
              <span>36 months</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Simulation</h3>
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Iterations: {params.iterations.toLocaleString()}
            </label>
            <input
              type="range"
              min="100"
              max="5000"
              step="100"
              value={params.iterations}
              onChange={(e) => setParams({...params, iterations: parseInt(e.target.value)})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>100</span>
              <span>5,000</span>
            </div>
          </div>
          <button
            onClick={runSimulation}
            disabled={isRunning}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors"
          >
            {isRunning ? 'Running Simulation...' : 'Run Monte Carlo Simulation'}
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Quick Presets</h3>
          <div className="space-y-2">
            <button
              onClick={() => setParams({
                initialCost: 25000,
                monthlySubscription: 2500,
                implementationTime: 3,
                adoptionRate: 0.9,
                revenueImpact: 0.05,
                costSavings: 15000,
                priceIncreaseRate: 1.2,
                priceIncreaseMonth: 24,
                baselineRevenue: 1000000,
                iterations: 1000
              })}
              className="w-full bg-green-100 hover:bg-green-200 text-green-800 p-2 rounded text-sm transition-colors"
            >
              Conservative Scenario
            </button>
            <button
              onClick={() => setParams({
                initialCost: 50000,
                monthlySubscription: 5000,
                implementationTime: 6,
                adoptionRate: 0.7,
                revenueImpact: 0.15,
                costSavings: 25000,
                priceIncreaseRate: 1.5,
                priceIncreaseMonth: 18,
                baselineRevenue: 2000000,
                iterations: 1000
              })}
              className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 p-2 rounded text-sm transition-colors"
            >
              Realistic Scenario
            </button>
            <button
              onClick={() => {
                console.log('Aggressive scenario clicked');
                setParams({
                  initialCost: 100000,
                  monthlySubscription: 10000,
                  implementationTime: 9,
                  adoptionRate: 0.5,
                  revenueImpact: 0.3,
                  costSavings: 50000,
                  priceIncreaseRate: 2.5,
                  priceIncreaseMonth: 12,
                  baselineRevenue: 5000000,
                  iterations: 1000
                });
              }}
              className="w-full bg-orange-100 hover:bg-orange-200 text-orange-800 p-2 rounded text-sm transition-colors"
            >
              Aggressive Scenario
            </button>
          </div>
        </div>
      </div>

      {results && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <h4 className="font-semibold text-blue-800">Mean ROI</h4>
              <p className="text-2xl font-bold text-blue-600">{results.summary.meanROI.toFixed(1)}%</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <h4 className="font-semibold text-green-800">90th Percentile</h4>
              <p className="text-2xl font-bold text-green-600">{results.summary.percentile90.toFixed(1)}%</p>
            </div>
            <div className="bg-red-50 p-4 rounded">
              <h4 className="font-semibold text-red-800">10th Percentile</h4>
              <p className="text-2xl font-bold text-red-600">{results.summary.percentile10.toFixed(1)}%</p>
            </div>
            <div className="bg-orange-50 p-4 rounded">
              <h4 className="font-semibold text-orange-800">Negative ROI Risk</h4>
              <p className="text-2xl font-bold text-orange-600">{results.summary.negativeROIPercentage.toFixed(1)}%</p>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">ROI Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={results.histogram}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="binCenter" 
                  domain={['dataMin', 'dataMax']}
                  type="number"
                  tickFormatter={(value) => `${value.toFixed(0)}%`}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [`${value} scenarios`, 'Count']}
                  labelFormatter={(value) => `ROI: ${value.toFixed(0)}%`}
                />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Cost vs Benefit Analysis (Sample Scenarios)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={scenarios}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="totalCost" 
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                />
                <YAxis 
                  dataKey="totalBenefit"
                  tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'totalBenefit' ? `$${(value/1000).toFixed(0)}k` : value,
                    name === 'totalBenefit' ? 'Total Benefit' : name
                  ]}
                  labelFormatter={(value) => `Total Cost: $${(value/1000).toFixed(0)}k`}
                />
                <Scatter 
                  dataKey="totalBenefit" 
                  fill="#3B82F6"
                  fillOpacity={0.6}
                />
              </ScatterChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-600 mt-2">
              Points above the diagonal line (where benefit > cost) represent profitable scenarios
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h4 className="font-semibold mb-2">Key Insights</h4>
            <ul className="space-y-1 text-sm">
              <li>• There's a {results.summary.negativeROIPercentage.toFixed(1)}% chance of negative ROI</li>
              <li>• Average total cost over 36 months: ${(results.summary.meanCost/1000).toFixed(0)}k</li>
              <li>• Average total benefit over 36 months: ${(results.summary.meanBenefit/1000).toFixed(0)}k</li>
              <li>• 10% of scenarios have ROI below {results.summary.percentile10.toFixed(1)}%</li>
              <li>• 10% of scenarios have ROI above {results.summary.percentile90.toFixed(1)}%</li>
            </ul>
          </div>
        </div>
      )}

      <div className="mt-8 text-sm text-gray-600">
        <h4 className="font-semibold mb-2">Simulation Notes:</h4>
        <ul className="space-y-1">
          <li>• Implementation delays are modeled as 1-3x longer than expected</li>
          <li>• Actual benefits vary from 50%-150% of projections</li>
          <li>• 30% chance that competitors reduce your competitive advantage</li>
          <li>• Failed adoption reduces benefits to 30% of projections</li>
          <li>• Price increases occur at the specified month for remaining duration</li>
        </ul>
      </div>
    </div>
  );
};

export default MonteCarloSimulation;
