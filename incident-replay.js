// Incident Replay - Learn from past incidents

const fs = require('fs').promises;
const path = require('path');

class IncidentReplay {
  constructor() {
    this.incidents = [];
  }

  async loadAllIncidents() {
    try {
      const files = await fs.readdir('data');
      const incidentFiles = files.filter(f => f.startsWith('incident-INC-'));
      
      this.incidents = await Promise.all(
        incidentFiles.map(async f => {
          const data = await fs.readFile(path.join('data', f), 'utf-8');
          return JSON.parse(data);
        })
      );
      
      console.log(`📂 Loaded ${this.incidents.length} historical incidents`);
      return this.incidents;
      
    } catch (error) {
      console.error('Failed to load incidents:', error.message);
      return [];
    }
  }

  analyzePatterns() {
    if (this.incidents.length === 0) {
      console.log('No incidents to analyze');
      return null;
    }

    const analysis = {
      totalIncidents: this.incidents.length,
      severityBreakdown: {},
      serviceBreakdown: {},
      commonRootCauses: {},
      averageResolutionTime: 0,
      totalCost: 0,
      securityIssues: 0,
      mostAffectedService: '',
      recommendations: []
    };

    let totalTime = 0;
    let totalCost = 0;

    this.incidents.forEach(incident => {
      // Severity breakdown
      const severity = incident.anomaly.severity;
      analysis.severityBreakdown[severity] = (analysis.severityBreakdown[severity] || 0) + 1;

      // Service breakdown
      const service = incident.anomaly.affectedService;
      analysis.serviceBreakdown[service] = (analysis.serviceBreakdown[service] || 0) + 1;

      // Root causes
      if (incident.rootCause) {
        const cause = incident.rootCause.primaryRootCause.substring(0, 50);
        analysis.commonRootCauses[cause] = (analysis.commonRootCauses[cause] || 0) + 1;
      }

      // Timing & cost
      totalTime += incident.processingTime || 0;
      
      // Calculate cost
      ['anomaly', 'logAnalysis', 'rootCause', 'proposedFix', 'securityReport'].forEach(key => {
        if (incident[key] && incident[key].tokens) {
          const tokens = incident[key].tokens;
          const cost = (tokens.input / 1000000) * 3 + (tokens.output / 1000000) * 15;
          totalCost += cost;
        }
      });

      // Security issues
      if (incident.securityReport && !incident.securityReport.approved) {
        analysis.securityIssues++;
      }
    });

    analysis.averageResolutionTime = Math.round(totalTime / this.incidents.length);
    analysis.totalCost = totalCost;

    // Find most affected service
    let maxCount = 0;
    for (const [service, count] of Object.entries(analysis.serviceBreakdown)) {
      if (count > maxCount) {
        maxCount = count;
        analysis.mostAffectedService = service;
      }
    }

    // Generate recommendations
    if (analysis.severityBreakdown.critical > 2) {
      analysis.recommendations.push('⚠️ High number of critical incidents - consider proactive monitoring');
    }
    if (analysis.serviceBreakdown[analysis.mostAffectedService] > analysis.totalIncidents * 0.5) {
      analysis.recommendations.push(`🎯 ${analysis.mostAffectedService} is the most problematic service - focus improvements here`);
    }
    if (analysis.securityIssues > 0) {
      analysis.recommendations.push('🔒 Some fixes failed security scan - review security practices');
    }
    if (analysis.averageResolutionTime > 10000) {
      analysis.recommendations.push('⚡ Consider optimizing agent response times');
    }

    return analysis;
  }

  async generateReport() {
    await this.loadAllIncidents();
    const analysis = this.analyzePatterns();

    if (!analysis) {
      console.log('No data to generate report');
      return;
    }

    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║              📊 INCIDENT ANALYSIS REPORT                 ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    console.log(`📈 Total Incidents Analyzed: ${analysis.totalIncidents}`);
    console.log(`⏱️  Average Resolution Time: ${analysis.averageResolutionTime}ms`);
    console.log(`💰 Total AI Cost: $${analysis.totalCost.toFixed(6)}`);
    console.log(`📉 Cost per Incident: $${(analysis.totalCost / analysis.totalIncidents).toFixed(6)}\n`);

    console.log('🔴 Severity Breakdown:');
    Object.entries(analysis.severityBreakdown).forEach(([severity, count]) => {
      const percentage = ((count / analysis.totalIncidents) * 100).toFixed(1);
      console.log(`   ${severity.padEnd(10)} ${count} incidents (${percentage}%)`);
    });

    console.log('\n🎯 Service Breakdown:');
    Object.entries(analysis.serviceBreakdown).forEach(([service, count]) => {
      const percentage = ((count / analysis.totalIncidents) * 100).toFixed(1);
      console.log(`   ${service.padEnd(20)} ${count} incidents (${percentage}%)`);
    });

    console.log(`\n⚠️  Most Affected Service: ${analysis.mostAffectedService}`);

    console.log('\n💡 Recommendations:');
    analysis.recommendations.forEach(rec => {
      console.log(`   ${rec}`);
    });

    console.log('\n' + '═'.repeat(60) + '\n');

    // Save report
    await fs.writeFile(
      'data/analysis-report.json',
      JSON.stringify(analysis, null, 2)
    );
    console.log('💾 Report saved to: data/analysis-report.json\n');

    return analysis;
  }

  async replayIncident(incidentId) {
    const incident = this.incidents.find(i => i.id === incidentId);
    
    if (!incident) {
      console.log(`Incident ${incidentId} not found`);
      return;
    }

    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║                  🔄 INCIDENT REPLAY                      ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    console.log(`Replaying: ${incident.id}`);
    console.log(`Timestamp: ${incident.timestamp}`);
    console.log(`Severity: ${incident.anomaly.severity}\n`);

    console.log('📍 Timeline:');
    console.log(`  1. Detection: ${incident.anomaly.summary}`);
    console.log(`  2. Analysis: ${incident.logAnalysis.conclusion}`);
    console.log(`  3. Diagnosis: ${incident.rootCause.primaryRootCause}`);
    console.log(`  4. Fix: ${incident.proposedFix.files.length} files modified`);
    console.log(`  5. Security: ${incident.securityReport.approved ? 'Passed' : 'Failed'}`);
    console.log(`\n⏱️  Total Time: ${incident.processingTime}ms\n`);
  }
}

module.exports = IncidentReplay;