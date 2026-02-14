// AutoOps AI - Production Server

const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = 3000;

app.use(express.static('dashboard'));
app.use('/data', express.static('data'));
app.use(express.json());

// SSE clients
let clients = [];

// SSE endpoint
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  res.write('data: {"type":"connected"}\n\n');
  clients.push(res);
  
  req.on('close', () => {
    clients = clients.filter(client => client !== res);
  });
});

// Broadcast to all clients
function broadcast(data) {
  clients.forEach(client => {
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}

// Watch for file changes
const chokidar = require('chokidar');
const watcher = chokidar.watch('data/*.json', {
  persistent: true,
  ignoreInitial: false
});

watcher.on('change', async (filepath) => {
  try {
    const data = await fs.readFile(filepath, 'utf-8');
    const json = JSON.parse(data);
    
    if (filepath.includes('monitor-status.json')) {
      broadcast({ type: 'status_update', data: json });
    } else if (filepath.includes('incident-')) {
      broadcast({ type: 'incident_update', data: json });
    }
  } catch (error) {
    console.error('Broadcast error:', error);
  }
});

// API: Latest incident
app.get('/api/latest-incident', async (req, res) => {
  try {
    const files = await fs.readdir('data');
    const incidentFiles = files.filter(f => f.startsWith('incident-INC-')).sort();
    
    if (incidentFiles.length === 0) {
      return res.json({ error: 'No incidents found' });
    }
    
    const latestFile = incidentFiles[incidentFiles.length - 1];
    const data = await fs.readFile(path.join('data', latestFile), 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: All incidents
app.get('/api/incidents', async (req, res) => {
  try {
    const files = await fs.readdir('data');
    const incidentFiles = files.filter(f => f.startsWith('incident-INC-'));
    
    const incidents = await Promise.all(
      incidentFiles.map(async f => {
        const data = await fs.readFile(path.join('data', f), 'utf-8');
        return JSON.parse(data);
      })
    );
    
    incidents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Monitor status
app.get('/api/monitor-status', async (req, res) => {
  try {
    const data = await fs.readFile('data/monitor-status.json', 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.json({ status: 'unknown', monitoring: false });
  }
});

// Install chokidar if needed
const { exec } = require('child_process');
exec('npm list chokidar', (error) => {
  if (error) {
    console.log('📦 Installing chokidar...');
    exec('npm install chokidar', (err) => {
      if (err) console.error('Failed to install chokidar:', err);
    });
  }
});

app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   🚀 AutoOps AI - Production Mode      ║');
  console.log('╚══════════════════════════════════════════╝\n');
  console.log(`🌐 Dashboard: http://localhost:${PORT}`);
  console.log(`📡 Real-time updates: ENABLED\n`);
  console.log(`💡 Next: Run "node auto-monitor.js" in another terminal\n`);
});