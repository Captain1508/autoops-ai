// Slack Notifier - Sends incident alerts to Slack

const axios = require('axios');

class SlackNotifier {
  constructor(webhookUrl) {
    this.webhookUrl = webhookUrl || process.env.SLACK_WEBHOOK_URL;
  }

  async sendIncidentAlert(incident) {
    if (!this.webhookUrl) {
      console.log('⚠️  Slack webhook not configured - skipping notification');
      return;
    }

    try {
      const message = {
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "🚨 Production Incident Detected",
              emoji: true
            }
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Severity:*\n${this.getSeverityEmoji(incident.anomaly.severity)} ${incident.anomaly.severity.toUpperCase()}`
              },
              {
                type: "mrkdwn",
                text: `*Incident ID:*\n\`${incident.id}\``
              },
              {
                type: "mrkdwn",
                text: `*Service:*\n${incident.anomaly.affectedService}`
              },
              {
                type: "mrkdwn",
                text: `*Impacted Users:*\n~${incident.anomaly.impactedUsers.toLocaleString()}`
              }
            ]
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Summary:*\n${incident.anomaly.summary}`
            }
          },
          {
            type: "divider"
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "🤖 *AutoOps AI is analyzing...*\nMulti-agent pipeline initiated"
            }
          }
        ]
      };

      await axios.post(this.webhookUrl, message);
      console.log('✅ Slack notification sent: Incident detected');
      
    } catch (error) {
      console.error('❌ Failed to send Slack notification:', error.message);
    }
  }

  async sendResolutionAlert(incident) {
    if (!this.webhookUrl) return;

    try {
      const message = {
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "✅ Incident Resolved",
              emoji: true
            }
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Incident ID:*\n\`${incident.id}\``
              },
              {
                type: "mrkdwn",
                text: `*Resolution Time:*\n${incident.processingTime}ms`
              },
              {
                type: "mrkdwn",
                text: `*Status:*\n${incident.status.replace(/_/g, ' ').toUpperCase()}`
              },
              {
                type: "mrkdwn",
                text: `*Cost:*\n$${this.calculateCost(incident)}`
              }
            ]
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*🧠 Root Cause:*\n${incident.rootCause.primaryRootCause}`
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*🔧 Fix Generated:*\n${incident.proposedFix.files.length} file(s) modified\n• ${incident.proposedFix.files.map(f => f.path).join('\n• ')}`
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*🔒 Security Scan:*\n${incident.securityReport.approved ? '✅ PASSED' : '❌ FAILED'} - Risk Level: ${incident.securityReport.riskLevel}`
            }
          },
          {
            type: "divider"
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "View Dashboard",
                  emoji: true
                },
                url: "http://localhost:3000",
                style: "primary"
              }
            ]
          }
        ]
      };

      await axios.post(this.webhookUrl, message);
      console.log('✅ Slack notification sent: Incident resolved');
      
    } catch (error) {
      console.error('❌ Failed to send Slack notification:', error.message);
    }
  }

  getSeverityEmoji(severity) {
    const emojis = {
      'critical': '🔴',
      'high': '🟠',
      'medium': '🟡',
      'low': '🟢'
    };
    return emojis[severity] || '⚪';
  }

  calculateCost(incident) {
    let total = 0;
    ['anomaly', 'logAnalysis', 'rootCause', 'proposedFix', 'securityReport'].forEach(key => {
      if (incident[key] && incident[key].tokens) {
        const tokens = incident[key].tokens;
        const cost = (tokens.input / 1000000) * 3 + (tokens.output / 1000000) * 15;
        total += cost;
      }
    });
    return total.toFixed(6);
  }
}

module.exports = SlackNotifier;