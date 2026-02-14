// Cost Optimizer Agent - Analyzes and optimizes AI costs

async function simulateCostOptimizer(incident, historicalData = []) {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const currentCost = calculateIncidentCost(incident);
  
  // Analyze historical costs
  let avgCost = currentCost;
  let totalHistoricalCost = 0;
  
  if (historicalData.length > 0) {
    historicalData.forEach(inc => {
      totalHistoricalCost += calculateIncidentCost(inc);
    });
    avgCost = totalHistoricalCost / historicalData.length;
  }

  // Cost analysis
  const costAnalysis = {
    currentIncident: {
      totalCost: currentCost,
      breakdown: getTokenBreakdown(incident),
      costPerAgent: getCostPerAgent(incident)
    },
    historical: {
      averageCost: avgCost,
      totalIncidents: historicalData.length,
      totalSpent: totalHistoricalCost,
      trend: currentCost > avgCost ? 'increasing' : 'decreasing'
    },
    optimizations: [],
    projectedSavings: 0,
    recommendations: []
  };

  // Generate optimizations
  
  // 1. Check if we can use smaller models for some agents
  if (incident.anomaly && incident.anomaly.tokens) {
    const monitorTokens = incident.anomaly.tokens.input + incident.anomaly.tokens.output;
    if (monitorTokens < 100) {
      costAnalysis.optimizations.push({
        agent: 'Monitor Agent',
        suggestion: 'Use Claude Haiku instead of Sonnet',
        currentCost: calculateAgentCost(incident.anomaly.tokens),
        optimizedCost: calculateAgentCost(incident.anomaly.tokens, 'haiku'),
        savings: calculateAgentCost(incident.anomaly.tokens) - calculateAgentCost(incident.anomaly.tokens, 'haiku')
      });
    }
  }

  // 2. Check for redundant agent calls
  const agentCalls = [
    incident.anomaly ? 'monitor' : null,
    incident.logAnalysis ? 'analyzer' : null,
    incident.rootCause ? 'rootcause' : null,
    incident.proposedFix ? 'fix' : null,
    incident.securityReport ? 'security' : null
  ].filter(Boolean).length;

  if (agentCalls === 5) {
    costAnalysis.recommendations.push({
      type: 'Pipeline Optimization',
      description: 'All 5 agents ran. Consider caching common patterns.',
      impact: 'Could reduce cost by 20-30% for similar incidents'
    });
  }

  // 3. Prompt optimization suggestions
  if (incident.proposedFix && incident.proposedFix.tokens) {
    const fixTokens = incident.proposedFix.tokens.output;
    if (fixTokens > 300) {
      costAnalysis.recommendations.push({
        type: 'Prompt Optimization',
        description: 'Fix Generator is verbose. Optimize prompts to be more concise.',
        impact: `Could save ~${((fixTokens * 0.3 / 1000000) * 15).toFixed(6)} per incident`
      });
    }
  }

  // 4. Batch processing suggestions
  if (historicalData.length > 10) {
    const similarIncidents = historicalData.filter(inc => 
      inc.anomaly && inc.anomaly.affectedService === incident.anomaly.affectedService
    );
    
    if (similarIncidents.length > 5) {
      costAnalysis.recommendations.push({
        type: 'Pattern Caching',
        description: `${similarIncidents.length} similar incidents in ${incident.anomaly.affectedService}. Implement caching.`,
        impact: `Could save up to ${(similarIncidents.length * currentCost * 0.8).toFixed(6)} by caching solutions`
      });
    }
  }

  // Calculate total projected savings
  costAnalysis.projectedSavings = costAnalysis.optimizations.reduce(
    (sum, opt) => sum + (opt.savings || 0), 0
  );

  // ROI calculation
  costAnalysis.roi = {
    costPerIncident: currentCost,
    manualResolutionCost: 250, // $250 for 3.5 hours of SRE time at $70/hr
    savings: 250 - currentCost,
    roi: ((250 - currentCost) / currentCost * 100).toFixed(0) + '%'
  };

  // Future projections
  if (historicalData.length > 0) {
    const weeklyIncidents = 10; // Estimate
    const monthlyIncidents = weeklyIncidents * 4;
    const yearlyIncidents = monthlyIncidents * 12;

    costAnalysis.projections = {
      monthly: {
        incidents: monthlyIncidents,
        aiCost: (currentCost * monthlyIncidents).toFixed(2),
        manualCost: (250 * monthlyIncidents).toFixed(2),
        savings: ((250 - currentCost) * monthlyIncidents).toFixed(2)
      },
      yearly: {
        incidents: yearlyIncidents,
        aiCost: (currentCost * yearlyIncidents).toFixed(2),
        manualCost: (250 * yearlyIncidents).toFixed(2),
        savings: ((250 - currentCost) * yearlyIncidents).toFixed(2)
      }
    };
  }

  return {
    ...costAnalysis,
    tokens: { input: 200, output: 300 }
  };
}

// Helper functions
function calculateIncidentCost(incident) {
  let total = 0;
  ['anomaly', 'logAnalysis', 'rootCause', 'proposedFix', 'securityReport'].forEach(key => {
    if (incident[key] && incident[key].tokens) {
      total += calculateAgentCost(incident[key].tokens);
    }
  });
  return total;
}

function calculateAgentCost(tokens, model = 'sonnet') {
  const pricing = {
    sonnet: { input: 3, output: 15 },
    haiku: { input: 0.25, output: 1.25 }
  };
  
  const price = pricing[model];
  return (tokens.input / 1000000) * price.input + (tokens.output / 1000000) * price.output;
}

function getTokenBreakdown(incident) {
  const breakdown = {};
  ['anomaly', 'logAnalysis', 'rootCause', 'proposedFix', 'securityReport'].forEach(key => {
    if (incident[key] && incident[key].tokens) {
      const tokens = incident[key].tokens;
      breakdown[key] = tokens.input + tokens.output;
    }
  });
  return breakdown;
}

function getCostPerAgent(incident) {
  const costs = {};
  ['anomaly', 'logAnalysis', 'rootCause', 'proposedFix', 'securityReport'].forEach(key => {
    if (incident[key] && incident[key].tokens) {
      costs[key] = calculateAgentCost(incident[key].tokens);
    }
  });
  return costs;
}

module.exports = { simulateCostOptimizer };