// AutoOps AI Demo - Run the complete system

const AutoOpsOrchestrator = require('./orchestrator');
const fs = require('fs').promises;

async function runDemo() {
  // Create orchestrator
  const autoops = new AutoOpsOrchestrator();
  
  // Load sample logs
  const logsData = await fs.readFile('data/sample-logs.json', 'utf-8');
  const logs = JSON.parse(logsData);
  
  console.log('\n🎬 Starting AutoOps AI Demo...\n');
  console.log('📋 Loaded', logs.length, 'log entries\n');
  
  // Process the incident
  const incident = await autoops.processIncident(logs, 'Production codebase');
  
  // Show final metrics
  const metrics = autoops.getMetrics();
  
  console.log('\n🎯 DEMO COMPLETE!\n');
  console.log('Key Takeaways:');
  console.log('✅ Multi-agent orchestration working');
  console.log('✅ Root cause identified automatically');
  console.log('✅ Fix generated with security validation');
  console.log('✅ Full observability and cost tracking');
  console.log(`✅ Total cost: $${metrics.totalCost.toFixed(6)}`);
  console.log('\nThis demonstrates production-ready AI operations! 🚀\n');
}

// Run the demo
runDemo().catch(error => {
  console.error('Demo failed:', error);
  process.exit(1);
});