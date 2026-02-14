// AutoOps AI - Production Dashboard (COMPLETE & WORKING)

let currentIncident = null;
let eventSource = null;
let slackNotifications = [];
let allIncidents = [];
let currentView = 'dashboard';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('🤖 AutoOps AI Dashboard Starting...');
  
  setupNavigation();
  connectStream();
  loadMonitorStatus();
  loadLatestIncident();
  loadHistory();
  loadPRs();
  loadSlackNotifications();
  
  // Refresh every 3 seconds for real-time feel
  setInterval(() => {
    loadMonitorStatus();
    loadLatestIncident();
    loadHistory();
    loadPRs();
  }, 3000);
});

// Setup sidebar navigation
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      
      switch(index) {
        case 0: showDashboard(); break;
        case 1: showIncidentsView(); break;
        case 2: showPRsView(); break;
        case 3: showSlackView(); break;
        case 4: showSettingsView(); break;
      }
    });
  });
}

// Connect to SSE
function connectStream() {
  if (eventSource) eventSource.close();
  
  eventSource = new EventSource('/api/stream');
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'status_update') {
      updateStatus(data.data.status);
    } else if (data.type === 'incident_update') {
      currentIncident = data.data;
      if (currentView === 'dashboard') {
        displayIncident(data.data);
        updateMetrics(data.data);
      }
      loadHistory();
      loadPRs();
      
      // Add Slack notification for incident
      addSlackNotification({
        type: 'incident',
        title: '🚨 Incident Detected',
        body: data.data.anomaly.summary,
        timestamp: data.data.timestamp
      });
      
      // Add resolution notification after processing
      setTimeout(() => {
        if (data.data.status === 'ready_for_deployment') {
          addSlackNotification({
            type: 'resolved',
            title: '✅ Incident Resolved',
            body: `Fixed in ${data.data.processingTime}ms - PR #${data.data.githubPR?.pr?.number || 'pending'}`,
            timestamp: new Date().toISOString()
          });
        }
      }, 2000);
    }
  };
  
  eventSource.onerror = () => {
    setTimeout(connectStream, 5000);
  };
}

// Load monitor status
async function loadMonitorStatus() {
  try {
    const res = await fetch('/api/monitor-status');
    const status = await res.json();
    updateStatus(status.status);
  } catch (error) {
    console.error('Failed to load status:', error);
  }
}

// Update status with animation
function updateStatus(status) {
  const badge = document.getElementById('status-badge');
  const nodes = document.querySelectorAll('.pipeline-node');
  
  if (status === 'healthy') {
    badge.className = 'status-badge healthy';
    badge.innerHTML = '<div class="status-dot"></div><span>System Healthy</span>';
    nodes.forEach(node => node.classList.remove('active'));
  } else if (status === 'incident_detected') {
    badge.className = 'status-badge incident';
    badge.innerHTML = '<div class="status-dot"></div><span>Incident Active</span>';
    animatePipeline();
  } else if (status === 'resolved') {
    badge.className = 'status-badge healthy';
    badge.innerHTML = '<div class="status-dot"></div><span>Incident Resolved</span>';
  }
}

// Animate pipeline
async function animatePipeline() {
  const nodes = document.querySelectorAll('.pipeline-node');
  nodes.forEach(node => node.classList.remove('active'));
  
  for (let i = 0; i < nodes.length; i++) {
    await sleep(600);
    nodes[i].classList.add('active');
  }
}

// Load latest incident
async function loadLatestIncident() {
  try {
    const res = await fetch('/api/latest-incident');
    const incident = await res.json();
    
    if (incident.error) {
      if (currentView === 'dashboard') showWelcome();
      return;
    }
    
    currentIncident = incident;
    if (currentView === 'dashboard') {
      displayIncident(incident);
    }
    updateMetrics(incident);
    
  } catch (error) {
    console.error('Failed to load incident:', error);
  }
}

// Show welcome
function showWelcome() {
  const mainContent = document.getElementById('main-content');
  document.querySelector('#main-card .card-title').textContent = 'System Status';
  
  mainContent.innerHTML = `
    <div class="welcome">
      <div class="welcome-icon">🛡️</div>
      <div class="welcome-title">All Systems Operational</div>
      <div class="welcome-text">
        AutoOps AI is actively monitoring your production environment.<br>
        You'll be alerted immediately if any issues are detected.
      </div>
    </div>
  `;
}

// Display incident
function displayIncident(incident) {
  const mainCard = document.getElementById('main-card');
  const mainContent = document.getElementById('main-content');
  
  mainCard.querySelector('.card-header').innerHTML = `
    <div class="card-title">Live Incident Terminal</div>
    <div class="badge">ACTIVE</div>
  `;
  
  mainContent.innerHTML = `
    <div class="terminal">
      <div class="terminal-header">Active Incident: ${incident.id}</div>
      
      <div class="terminal-error">ERROR [${incident.anomaly.affectedService}] ${incident.anomaly.firstError || incident.anomaly.summary}</div>
      <div style="margin: 10px 0; color: #9CA3AF;">
        Severity: ${incident.anomaly.severity.toUpperCase()} | 
        Impact: ~${incident.anomaly.impactedUsers.toLocaleString()} users | 
        Errors: ${incident.anomaly.errorCount}
      </div>
      
      ${incident.logAnalysis ? `
        <div style="margin-top: 15px;">
          <div class="terminal-info">📊 Log Analysis:</div>
          <div style="color: #E4E7EB; margin: 8px 0;">${incident.logAnalysis.conclusion}</div>
        </div>
      ` : ''}
      
      ${incident.rootCause ? `
        <div style="margin-top: 15px;">
          <div class="terminal-info">🧠 Root Cause:</div>
          <div style="color: #E4E7EB; margin: 8px 0;">${incident.rootCause.primaryRootCause}</div>
          <div class="terminal-success">Confidence: ${incident.rootCause.probability}%</div>
        </div>
      ` : ''}
      
      ${incident.proposedFix ? `
        <div style="margin-top: 15px;">
          <div class="terminal-info">🔧 Auto-Generated Fix:</div>
          <div style="color: #F59E0B; margin: 8px 0;">
            ${incident.proposedFix.files.map(f => `- ${f.path} (${f.action})`).join('<br>')}
          </div>
        </div>
      ` : ''}
      
      ${incident.securityReport ? `
        <div style="margin-top: 15px;">
          <div class="${incident.securityReport.approved ? 'terminal-success' : 'terminal-error'}">
            🔒 Security: ${incident.securityReport.approved ? 'PASSED ✓' : 'FAILED ✗'}
          </div>
        </div>
      ` : ''}
      
      ${incident.githubPR && incident.githubPR.created ? `
        <div style="margin-top: 15px;">
          <div class="terminal-success">📝 PR Created: #${incident.githubPR.pr.number}</div>
          <div style="color: #6366F1; cursor: pointer; text-decoration: underline;" onclick="window.open('https://github.com/${process.env.GITHUB_REPO_OWNER || 'Captain1508'}/autoops-ai/pull/${incident.githubPR.pr.number}', '_blank')">
            → View on GitHub
          </div>
        </div>
      ` : ''}
      
      <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #1F2937;">
        <div class="terminal-info">⏱️ Processing: ${incident.processingTime}ms</div>
        <div class="terminal-info">💰 Cost: $${calculateIncidentCost(incident).toFixed(6)}</div>
      </div>
    </div>
  `;
}

// Update metrics - REAL VALUES
function updateMetrics(incident) {
  let totalTokens = 0;
  let totalCost = 0;
  
  ['anomaly', 'logAnalysis', 'rootCause', 'proposedFix', 'securityReport', 'costOptimization', 'githubPR'].forEach(key => {
    if (incident[key] && incident[key].tokens) {
      const tokens = incident[key].tokens;
      totalTokens += tokens.input + tokens.output;
      totalCost += (tokens.input / 1000000) * 3 + (tokens.output / 1000000) * 15;
    }
  });
  
  document.getElementById('metric-cost').textContent = `$${totalCost.toFixed(4)}`;
  document.getElementById('metric-tokens').textContent = totalTokens.toLocaleString();
  
  let agentsUsed = 0;
  if (incident.anomaly) agentsUsed++;
  if (incident.logAnalysis) agentsUsed++;
  if (incident.rootCause) agentsUsed++;
  if (incident.proposedFix) agentsUsed++;
  if (incident.securityReport) agentsUsed++;
  if (incident.costOptimization) agentsUsed++;
  if (incident.githubPR) agentsUsed++;
  
  document.getElementById('metric-agents').textContent = `${agentsUsed}/7`;
  
  fetch('/api/incidents')
    .then(r => r.json())
    .then(incidents => {
      if (!incidents.error) {
        document.getElementById('metric-incidents').textContent = incidents.length;
      }
    });
}

// Load history
async function loadHistory() {
  try {
    const res = await fetch('/api/incidents');
    const incidents = await res.json();
    
    allIncidents = incidents;
    const historyEl = document.getElementById('history');
    
    if (incidents.error || incidents.length === 0) {
      historyEl.innerHTML = '<div class="empty-state"><div class="empty-icon">📜</div><div class="empty-text">No incidents yet</div></div>';
      return;
    }
    
    historyEl.innerHTML = incidents.slice(0, 8).map(inc => `
      <div class="history-item" onclick="viewIncident('${inc.id}')">
        <div class="history-top">
          <div class="severity severity-${inc.anomaly.severity}">${inc.anomaly.severity}</div>
          <div class="history-time">${formatTime(inc.timestamp)}</div>
        </div>
        <div class="history-title">${inc.anomaly.summary}</div>
        <div class="history-meta">
          <span>🎯 ${inc.anomaly.affectedService}</span>
          <span>⚡ ${inc.processingTime}ms</span>
          <span>👥 ${inc.anomaly.impactedUsers} users</span>
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Failed to load history:', error);
  }
}

// Load PRs
async function loadPRs() {
  try {
    const res = await fetch('/api/incidents');
    const incidents = await res.json();
    
    const prs = incidents.filter(inc => inc.githubPR && inc.githubPR.created);
    const prList = document.getElementById('pr-list');
    
    if (prs.length === 0) {
      prList.innerHTML = '<div class="empty-state"><div class="empty-icon">📝</div><div class="empty-text">No PRs yet</div></div>';
      return;
    }
    
    prList.innerHTML = prs.slice(0, 5).map(inc => `
      <div class="pr-item" onclick="window.open('https://github.com/Captain1508/autoops-ai/pull/${inc.githubPR.pr.number}', '_blank')">
        <div class="pr-header">
          <div class="pr-number">PR #${inc.githubPR.pr.number}</div>
          <div class="pr-status">OPEN</div>
        </div>
        <div class="pr-title">${inc.githubPR.pr.title}</div>
        <div class="pr-meta">
          Created ${formatTime(inc.githubPR.pr.created_at)} • ${inc.proposedFix.files.length} files
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Failed to load PRs:', error);
  }
}

// Load Slack notifications
function loadSlackNotifications() {
  const slackEl = document.getElementById('slack-notifs');
  
  if (slackNotifications.length === 0) {
    slackEl.innerHTML = '<div class="empty-state"><div class="empty-icon">💬</div><div class="empty-text">Waiting for incidents...</div></div>';
    return;
  }
  
  slackEl.innerHTML = slackNotifications.slice(0, 10).map(notif => `
    <div class="notif-item">
      <div class="notif-header">
        <div class="notif-icon">${notif.type === 'incident' ? '🚨' : '✅'}</div>
        <div class="notif-title">${notif.title}</div>
      </div>
      <div class="notif-body">${notif.body}</div>
      <div class="notif-time">${formatTime(notif.timestamp)}</div>
    </div>
  `).join('');
}

// Add Slack notification
function addSlackNotification(notif) {
  slackNotifications.unshift(notif);
  if (slackNotifications.length > 50) {
    slackNotifications = slackNotifications.slice(0, 50);
  }
  loadSlackNotifications();
}

// View incident
function viewIncident(incidentId) {
  const incident = allIncidents.find(i => i.id === incidentId);
  if (incident) {
    currentIncident = incident;
    displayIncident(incident);
    updateMetrics(incident);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// VIEW FUNCTIONS
function showDashboard() {
  location.reload();
}

function showIncidentsView() {
  currentView = 'incidents';
  const content = document.querySelector('.content');
  content.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">All Incidents</div>
      </div>
      <div id="all-incidents"></div>
    </div>
  `;
  
  const allInc = document.getElementById('all-incidents');
  
  if (allIncidents.length === 0) {
    allInc.innerHTML = '<div class="empty-state"><div class="empty-icon">📜</div><div class="empty-text">No incidents</div></div>';
    return;
  }
  
  allInc.innerHTML = allIncidents.map(inc => `
    <div class="history-item" style="margin-bottom: 15px;">
      <div class="history-top">
        <div class="severity severity-${inc.anomaly.severity}">${inc.anomaly.severity}</div>
        <div class="history-time">${new Date(inc.timestamp).toLocaleString()}</div>
      </div>
      <div class="history-title">${inc.anomaly.summary}</div>
      <div class="history-meta">
        <span>🎯 ${inc.anomaly.affectedService}</span>
        <span>⚡ ${inc.processingTime}ms</span>
        <span>💰 $${calculateIncidentCost(inc).toFixed(6)}</span>
      </div>
    </div>
  `).join('');
}

function showPRsView() {
  currentView = 'prs';
  const content = document.querySelector('.content');
  
  const prs = allIncidents.filter(inc => inc.githubPR && inc.githubPR.created);
  
  content.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">Auto-Generated Pull Requests</div>
        <div class="badge">${prs.length} Total</div>
      </div>
      <div id="all-prs"></div>
    </div>
  `;
  
  const allPRs = document.getElementById('all-prs');
  
  if (prs.length === 0) {
    allPRs.innerHTML = '<div class="empty-state"><div class="empty-icon">📝</div><div class="empty-text">No PRs generated yet</div></div>';
    return;
  }
  
  allPRs.innerHTML = prs.map(inc => `
    <div class="pr-item" onclick="window.open('https://github.com/Captain1508/autoops-ai/pull/${inc.githubPR.pr.number}', '_blank')" style="margin-bottom: 15px;">
      <div class="pr-header">
        <div class="pr-number">PR #${inc.githubPR.pr.number}</div>
        <div class="pr-status">OPEN</div>
      </div>
      <div class="pr-title">${inc.githubPR.pr.title}</div>
      <div class="pr-meta">
        Created ${formatTime(inc.githubPR.pr.created_at)} • 
        ${inc.proposedFix.files.length} files changed • 
        Security: ${inc.securityReport.approved ? '✅' : '❌'}
      </div>
    </div>
  `).join('');
}

function showSlackView() {
  currentView = 'slack';
  const content = document.querySelector('.content');
  content.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">Slack Notifications</div>
        <div class="badge">${slackNotifications.length} Total</div>
      </div>
      <div id="all-slack"></div>
    </div>
  `;
  
  const allSlack = document.getElementById('all-slack');
  
  if (slackNotifications.length === 0) {
    allSlack.innerHTML = '<div class="empty-state"><div class="empty-icon">💬</div><div class="empty-text">No notifications yet</div></div>';
    return;
  }
  
  allSlack.innerHTML = slackNotifications.map(notif => `
    <div class="notif-item" style="margin-bottom: 15px;">
      <div class="notif-header">
        <div class="notif-icon">${notif.type === 'incident' ? '🚨' : '✅'}</div>
        <div class="notif-title">${notif.title}</div>
      </div>
      <div class="notif-body">${notif.body}</div>
      <div class="notif-time">${formatTime(notif.timestamp)}</div>
    </div>
  `).join('');
}

function showSettingsView() {
  currentView = 'settings';
  const content = document.querySelector('.content');
  content.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">Settings</div>
      </div>
      <div style="padding: 20px;">
        <h3 style="color: #6366F1; margin-bottom: 15px;">Configuration</h3>
        <p style="color: #9CA3AF; line-height: 1.8;">
          AutoOps AI is currently monitoring your production environment.<br><br>
          
          <strong>Monitoring Interval:</strong> 45 seconds<br>
          <strong>GitHub Integration:</strong> ${process.env.GITHUB_TOKEN ? '✅ Enabled' : '❌ Disabled'}<br>
          <strong>Slack Notifications:</strong> ${process.env.SLACK_WEBHOOK_URL ? '✅ Enabled' : '❌ Disabled'}<br><br>
          
          To modify settings, edit your <code>.env</code> file and restart the server.
        </p>
      </div>
    </div>
  `;
}

// Helper functions
function calculateIncidentCost(incident) {
  let total = 0;
  ['anomaly', 'logAnalysis', 'rootCause', 'proposedFix', 'securityReport', 'costOptimization', 'githubPR'].forEach(key => {
    if (incident[key] && incident[key].tokens) {
      const tokens = incident[key].tokens;
      total += (tokens.input / 1000000) * 3 + (tokens.output / 1000000) * 15;
    }
  });
  return total;
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

console.log('✅ AutoOps AI Dashboard Ready');