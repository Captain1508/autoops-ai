require('dotenv').config();

// Simulated AI agent (works without any API)
async function simulateAIResponse(prompt) {
  // Simulate thinking time
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulated intelligent response
  if (prompt.includes('Database connection timeout')) {
    return {
      text: `CRITICAL ALERT DETECTED

Analysis: Database connection timeout after 30 seconds

Severity: HIGH
Impact: This will cause user-facing errors and failed transactions
Root Cause Hypothesis: Connection pool exhausted or database overload
Recommended Action: Scale database connections or add connection pooling

Immediate Steps:
1. Check active database connections
2. Review connection pool configuration
3. Monitor for connection leaks
4. Consider increasing max_connections parameter`,
      tokens: { input: 45, output: 120 }
    };
  }
  
  return {
    text: 'Analysis complete.',
    tokens: { input: 30, output: 50 }
  };
}

async function testAgent() {
  console.log('🤖 Testing AI Agent (Simulated Mode)...\n');
  console.log('📝 Note: Using mock responses for development\n');
  
  try {
    const response = await simulateAIResponse(
      'You are a DevOps monitoring agent. Analyze this error log and tell me if it is critical: "Database connection timeout after 30 seconds"'
    );
    
    console.log('✅ Agent Response:');
    console.log(response.text);
    
    console.log('\n📊 Token Usage:');
    console.log('Input tokens:', response.tokens.input);
    console.log('Output tokens:', response.tokens.output);
    
    const inputCost = (response.tokens.input / 1000000) * 3;
    const outputCost = (response.tokens.output / 1000000) * 15;
    const totalCost = inputCost + outputCost;
    
    console.log('💰 Estimated cost: $' + totalCost.toFixed(6));
    console.log('\n✨ This demonstrates the concept - real API can be added later!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAgent();