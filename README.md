# 🛡️ AutoOps AI: Autonomous DevOps Orchestration

**AutoOps AI** is a cutting-edge, self-healing DevOps platform built for the **"2 Fast 2 MCP"** hackathon. It leverages the power of the **Model Context Protocol (MCP)** and **Archestra** to detect, diagnose, and remediate system errors automatically through a coordinated multi-agent pipeline.

---

## 🚀 Features

- **Real-Time Anomaly Detection**: A "Chaos Monkey" system that identifies critical infrastructure failures.
- **MCP Multi-Agent Pipeline**: Sequentially orchestrates agents (Monitor → Analyze → Diagnose → Fix → PR) using real-time backend workers.
- **Automated GitHub Remediation**: Automatically synthesizes code fixes and creates real GitHub Pull Requests.
- **Archestra Orchestration**: Uses `archestra.config.json` for centralized agent lifecycle management and security guardrails.
- **Premium Cyberpunk Dashboard**: A high-performance UI with glassmorphism, animated pipelines, and dynamic cost/threat metrics.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, Framer Motion, Tailwind CSS, Lucide React.
- **Backend**: Node.js, MCP SDK, Octokit (GitHub SDK).
- **Communication Protocol**: Model Context Protocol (MCP) via JSON-RPC over stdio.
- **Orchestration**: Archestra Blueprint (`archestra.config.json`).

---

## 📖 User & Setup Guide

### 1. Prerequisites
- **Node.js**: v20 or higher.
- **GitHub Token**: You'll need a GitHub Personal Access Token (Classic) with `repo` permissions to allow the PR Agent to work.

### 2. Environment Setup
Create a `.env` file in the root directory and add your credentials:
```env
NEXT_PUBLIC_GITHUB_TOKEN=your_token_here
NEXT_PUBLIC_GITHUB_OWNER=your_github_username
NEXT_PUBLIC_GITHUB_REPO=autoops-ai
SLACK_WEBHOOK_URL=your_webhook_here (Optional)
```

### 3. Installation
```bash
npm install
```

### 4. Running the Project
```bash
# Start the development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the dashboard.

### 5. Triggering a Simulation
Wait for the background "Chaos Monkey" to fire (every 180s) or click the **"⚡ SIMULATING"** button in the top right to force an incident.

---

## 🤖 Architecture: The MCP Core

Unlike standard apps that handle logic in the browser, AutoOps AI uses a **Centralized MCP Runtime**:

1. **The Client**: The Next.js frontend detects an incident and calls the `/api/orchestration/trigger` route.
2. **The Orchestrator**: The backend proxy spawns the `mcp-server.ts` process.
3. **The Handshake**: The system performs a mandatory MCP `initialize` handshake to secure the communication channel.
4. **The Sequence**: Tools are called via JSON-RPC in a sequential order defined by the Archestra blueprint.

---

## 🤝 Archestra Integration
This project is built to be **Archestra-Ready**. It implements:
- ✅ **Centralized Agent Discovery**: All tools are exposed via a single MCP endpoint.
- ✅ **Sequential Control Flow**: Defined in `archestra.config.json`.
- ✅ **Security Guardrails**: Controlled repo access and sanitization in the PR agent.
- ✅ **Observability**: Standardized logging for traces and reasoning.

---

## 🏆 Hackathon Credits
Built with 💙 by **Captain1508** for the **2 Fast 2 MCP** Hackathon.

