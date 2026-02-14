// Monitor Agent - Detects anomalies in logs

async function simulateMonitorAgent(logs) {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Find errors in logs
  const errors = logs.filter(log => log.level === 'ERROR');
  
  if (errors.length === 0) {
    return {
      hasAnomaly: false,
      severity: 'none',
      summary: 'No anomalies detected',
      tokens: { input: 30, output: 20 }
    };
  }
  
  // Analyze severity based on error patterns
  const errorMessages = errors.map(e => e.message).join('. ');
  
  let severity = 'medium';
  let impactedUsers = 10;
  
  // Determine severity
  if (errorMessages.toLowerCase().includes('critical') || 
      errorMessages.toLowerCase().includes('fatal') ||
      errorMessages.toLowerCase().includes('ssl') ||
      errorMessages.toLowerCase().includes('certificate')) {
    severity = 'critical';
    impactedUsers = 1000 + Math.floor(Math.random() * 500);
  } else if (errorMessages.includes('timeout') || 
             errorMessages.includes('connection') ||
             errorMessages.includes('pool exhausted') ||
             errorMessages.includes('rate limit')) {
    severity = 'critical';
    impactedUsers = 500 + Math.floor(Math.random() * 500);
  } else if (errorMessages.includes('failed') || 
             errorMessages.includes('error') ||
             errorMessages.includes('unavailable')) {
    severity = 'high';
    impactedUsers = 100 + Math.floor(Math.random() * 400);
  }
  
  // Extract service from first error
  const service = errors[0].service || 'unknown-service';
  
  // Get first error message for summary
  const firstError = errors[0].message;
  
  return {
    hasAnomaly: true,
    severity: severity,
    affectedService: service,
    summary: `${errors.length} critical error${errors.length > 1 ? 's' : ''} detected in ${service}`,
    impactedUsers: impactedUsers,
    errorCount: errors.length,
    firstError: firstError,
    tokens: { input: 50, output: 80 }
  };
}

module.exports = { simulateMonitorAgent };