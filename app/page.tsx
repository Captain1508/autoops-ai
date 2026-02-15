"use client"

import { useAutoOps } from "@/hooks/useAutoOps"
import { Pipeline } from "@/components/Pipeline"
import { HealthShield } from "@/components/HealthShield"
import { AgentCard } from "@/components/AgentCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Terminal, LayoutDashboard, Settings, User, Bell, ExternalLink, Github, Zap, RefreshCw, MessageSquare, GitPullRequest } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

export default function Home() {
  const { systemStatus, logs, activeStep, agents, artifacts, metrics, triggerDemo } = useAutoOps()
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="min-h-screen bg-[#050505] text-foreground flex font-sans selection:bg-primary/30 overflow-hidden">

      {/* 1. Sidebar - Icon + Text (Functional) */}
      <motion.div
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className="w-24 border-r border-white/10 flex flex-col items-center py-6 gap-6 bg-[#020202] z-50 h-screen sticky top-0"
      >
        <div className="w-12 h-12 mb-2 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-[0_0_20px_rgba(6,182,212,0.4)]">
          A
        </div>

        <div className="flex flex-col gap-4 w-full px-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'incidents', icon: Bell, label: 'Incidents' },
            { id: 'prs', icon: Github, label: 'PRs' },
            { id: 'slack', icon: MessageSquare, label: 'Notifications' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                 group relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300
                 ${activeTab === item.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
               `}
            >
              {activeTab === item.id && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 border border-primary/20 rounded-xl"
                />
              )}
              <item.icon className={`w-6 h-6 mb-1 ${activeTab === item.id ? "drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" : ""}`} />
              <span className="text-[9px] font-bold tracking-wider uppercase">{item.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 h-screen overflow-y-auto">
        {/* Header (Always Visible) */}
        <header className="h-16 border-b border-white/10 bg-[#020202]/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold tracking-tight text-lg">AutoOps AI</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 font-mono uppercase text-sm">{activeTab}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-green-500 uppercase tracking-widest">System Healthy</span>
            </div>

            <Button
              onClick={triggerDemo}
              disabled={systemStatus !== 'healthy'}
              size="sm"
              className={`
                      rounded-full font-bold tracking-wide transition-all duration-300 shadow-xl
                      ${systemStatus === 'healthy'
                  ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white'
                  : 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed'}
                    `}
            >
              <Zap className="w-3 h-3 mr-2 fill-current" />
              {systemStatus === 'healthy' ? 'TRIGGER DEMO' : 'SIMULATING...'}
            </Button>
          </div>
        </header>

        {/* Dynamic Content Views */}
        <div className="p-6 pb-20">

          {/* VIEW: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-12 gap-6">
              {/* Row 1: Pipeline */}
              <div className="col-span-12">
                <Pipeline currentStep={activeStep} />
              </div>

              {/* Row 2: Status & Metrics */}
              <div className="col-span-12 grid grid-cols-12 gap-6">
                {/* System Status */}
                <Card className="col-span-8 bg-[#080808] border-white/10 p-0 overflow-hidden relative min-h-[300px] flex flex-col justify-center items-center">
                  <CardHeader className="absolute top-0 left-0">
                    <CardTitle className="text-sm font-mono text-white uppercase tracking-wider">System Status</CardTitle>
                  </CardHeader>
                  <HealthShield status={systemStatus} />
                </Card>

                {/* Metrics Grid */}
                <div className="col-span-4 grid grid-cols-2 gap-4">
                  <Card className="bg-[#080808] border-white/10 flex flex-col items-center justify-center p-6">
                    <div className="text-2xl font-mono text-cyan-400 mb-1">${metrics.totalCost.toFixed(2)}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Total Cost</div>
                  </Card>
                  <Card className="bg-[#080808] border-white/10 flex flex-col items-center justify-center p-6">
                    <div className="text-2xl font-mono text-purple-400 mb-1">{metrics.threats}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Threats</div>
                  </Card>
                  <Card className="bg-[#080808] border-white/10 flex flex-col items-center justify-center p-6">
                    <div className="text-2xl font-mono text-green-400 mb-1">{metrics.activeAgents}/5</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Agents</div>
                  </Card>
                  <Card className="bg-[#080808] border-white/10 flex flex-col items-center justify-center p-6">
                    <div className="text-2xl font-mono text-orange-400 mb-1">{metrics.incidentCount}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Incidents</div>
                  </Card>
                </div>
              </div>

              {/* Row 3: Incidents & Agents */}
              <div className="col-span-12 grid grid-cols-12 gap-6 h-[400px]">
                {/* Recent Incidents (Terminal) */}
                <Card className="col-span-7 bg-[#080808] border-white/10 p-0 overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <div className="text-sm font-mono text-slate-400 uppercase tracking-wider">Recent Incidents</div>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500/50" />
                      <span className="w-2 h-2 rounded-full bg-yellow-500/50" />
                      <span className="w-2 h-2 rounded-full bg-green-500/50" />
                    </div>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-2 relative">
                    {logs.map(log => (
                      <div key={log.id} className="flex gap-2">
                        <span className="text-slate-600">[{log.timestamp.split(' ')[0]}]</span>
                        <span className={`${log.level === 'error' ? 'text-red-400' : 'text-slate-300'}`}>
                          {log.message}
                        </span>
                      </div>
                    ))}
                    {logs.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-700">
                        No active incidents
                      </div>
                    )}
                  </div>
                </Card>

                {/* Active Agents */}
                <Card className="col-span-5 bg-[#080808] border-white/10 p-0 overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <div className="text-sm font-mono text-slate-400 uppercase tracking-wider">Active Agents</div>
                    <Badge variant="outline" className="border-green-500/20 text-green-500 bg-green-500/5 text-[10px]">OPERATIONAL</Badge>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    <AgentCard name="Log Monitor" role="Observability" status={agents.monitor} details="Ingesting 14k events/sec" />
                    <AgentCard name="Log Analyzer" role="Analysis" status={agents.analyzer} details="Searching for anomalies..." />
                    <AgentCard name="Fix Generator" role="Engineering" status={agents.fix} details="Synthesizing patch code..." />
                    <AgentCard name="PR Agent" role="C.I./C.D." status={agents.pr} details="Managing GitHub workflows..." />
                  </div>
                </Card>
              </div>

              {/* Row 4: Slack Notifications */}
              <div className="col-span-12">
                <Card className="bg-[#080808] border-white/10 p-6 flex flex-col gap-4 min-h-[150px]">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-mono text-slate-400 uppercase tracking-wider">Slack Notifications</div>
                    <div className="text-xs text-slate-600">#ops-alerts</div>
                  </div>
                  <div className="flex items-center justify-center flex-1 text-slate-700 italic text-sm">
                    No recent notifications
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* VIEW: INCIDENTS */}
          {activeTab === 'incidents' && (
            <div className="space-y-6">
              <Card className="bg-[#080808] border-white/10 p-0 min-h-[600px] flex flex-col">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Incident Log</h2>
                  <Button variant="outline" size="sm" className="border-white/10 text-slate-400">Export CSV</Button>
                </div>
                <div className="p-6 font-mono text-sm space-y-4">
                  {logs.length > 0 ? logs.map(log => (
                    <div key={log.id} className="flex gap-4 border-b border-white/5 pb-2 last:border-0">
                      <span className="text-slate-500 w-32 shrink-0">{log.timestamp}</span>
                      <Badge variant={log.level === 'error' ? 'destructive' : 'secondary'} className="uppercase text-[10px] h-5">
                        {log.level}
                      </Badge>
                      <span className="text-slate-300 break-all">{log.message}</span>
                    </div>
                  )) : (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                      <Bell className="w-12 h-12 mb-4 opacity-20" />
                      <p>No incidents recorded in this session.</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* VIEW: PRs */}
          {activeTab === 'prs' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artifacts.prLinks && artifacts.prLinks.length > 0 ? (
                  artifacts.prLinks.map((prLink, index) => (
                    <a
                      key={index}
                      href={prLink.startsWith('http') ? prLink : `https://${prLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <Card className="bg-[#080808] border-white/10 overflow-hidden hover:border-primary/50 transition-all duration-300 cursor-pointer h-full hover:shadow-lg hover:shadow-primary/10">
                        <CardHeader className="border-b border-white/5 pb-4">
                          <div className="flex justify-between items-start">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                              <Github className="w-6 h-6" />
                            </div>
                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">OPEN</Badge>
                          </div>
                          <CardTitle className="text-white mt-4 group-hover:text-primary transition-colors">Auto-Fix #{index + 1}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <p className="text-slate-400 text-sm mb-4">
                            Auto-generated PR to resolve detected system issue.
                          </p>
                          <div className="text-primary text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                            View on GitHub <ExternalLink className="w-3 h-3" />
                          </div>
                        </CardContent>
                      </Card>
                    </a>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-600 border border-dashed border-white/10 rounded-xl">
                    <GitPullRequest className="w-12 h-12 mb-4 opacity-20" />
                    <p>No Pull Requests created yet.</p>
                    <Button variant="link" onClick={() => setActiveTab('dashboard')} className="text-primary">
                      Go to Dashboard to trigger simulation
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW: SLACK/NOTIFICATIONS */}
          {activeTab === 'slack' && (
            <div className="max-w-3xl mx-auto">
              <Card className="bg-[#080808] border-white/10 min-h-[600px] flex flex-col">
                <div className="p-6 border-b border-white/5 flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#4A154B] rounded-lg flex items-center justify-center text-white">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">#ops-alerts</h2>
                    <p className="text-xs text-slate-400">Slack Integration • Connected</p>
                  </div>
                </div>
                <div className="flex-1 p-6 space-y-6">
                  {artifacts.slackMessages && artifacts.slackMessages.length > 0 ? (
                    artifacts.slackMessages.map((msg, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-8 h-8 rounded bg-green-500/20 flex items-center justify-center text-green-500 shrink-0">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-white text-sm">AutoOps Bot</span>
                            <span className="text-[10px] text-slate-500">APP</span>
                            <span className="text-xs text-slate-600">{new Date().toLocaleTimeString()}</span>
                          </div>
                          <p className="text-slate-300 text-sm mt-1">{msg}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600">
                      <p className="italic">All quiet on the western front.</p>
                    </div>
                  )}
                </div></Card>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
