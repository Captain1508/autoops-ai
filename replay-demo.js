// Demo script for incident replay

const IncidentReplay = require('./incident-replay');

async function main() {
  const replay = new IncidentReplay();
  
  // Generate comprehensive analysis report
  await replay.generateReport();
  
  // Optional: Replay a specific incident
  // await replay.replayIncident('INC-1234567890');
}

main().catch(console.error);