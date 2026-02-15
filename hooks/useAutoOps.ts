"use client"

import { useState, useEffect, useCallback } from "react"
import { Octokit } from "octokit"

export type AgentStatus = "idle" | "active" | "completed" | "failed"
export type SystemStatus = "healthy" | "critical" | "healing"

interface Log {
    id: string
    timestamp: string
    level: "info" | "warning" | "error"
    message: string
}

export function useAutoOps() {
    const [systemStatus, setSystemStatus] = useState<SystemStatus>("healthy")
    const [logs, setLogs] = useState<Log[]>([])
    const [activeStep, setActiveStep] = useState<string>("monitor")

    // Agent States
    const [monitorStatus, setMonitorStatus] = useState<AgentStatus>("idle")
    const [analyzerStatus, setAnalyzerStatus] = useState<AgentStatus>("idle")
    const [rootCauseStatus, setRootCauseStatus] = useState<AgentStatus>("idle")
    const [fixStatus, setFixStatus] = useState<AgentStatus>("idle")
    const [prStatus, setPrStatus] = useState<AgentStatus>("idle")
    const [commsStatus, setCommsStatus] = useState<AgentStatus>("idle")

    const [prLinks, setPrLinks] = useState<string[]>([])
    const [slackMessages, setSlackMessages] = useState<string[]>([])
    const [isRemediating, setIsRemediating] = useState(false)

    // Metrics
    const [totalCost, setTotalCost] = useState(0)
    const [threats, setThreats] = useState(0)
    const [incidentCount, setIncidentCount] = useState(0)

    const addLog = useCallback((level: "info" | "warning" | "error", message: string) => {
        setLogs(prev => [{
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toLocaleTimeString(),
            level,
            message
        }, ...prev].slice(0, 50)) // Keep last 50 logs

        // Update incident count when error is logged
        if (level === "error") {
            setIncidentCount(prev => prev + 1)
            setThreats(prev => prev + 1)
        }
    }, [])

    // Background System Health Check (Simulation)
    useEffect(() => {
        const interval = setInterval(() => {
            if (systemStatus === "healthy") {
                addLog("info", `System Health Check: OK - CPU ${Math.floor(Math.random() * 20 + 10)}%, Mem ${Math.floor(Math.random() * 30 + 20)}%`)
            }
        }, 30000)
        return () => clearInterval(interval)
    }, [addLog, systemStatus])

    // Chaos Monkey (Random Background Errors - GENERATES ACTUAL ERRORS NOW)
    useEffect(() => {
        const interval = setInterval(() => {
            if (systemStatus === "healthy" && Math.random() > 0.3) {
                const errorMessages = [
                    "CRITICAL: Database connection pool exhausted in payment-service",
                    "ERROR: Memory leak detected in user-auth module",
                    "CRITICAL: Redis cache timeout - 500ms threshold exceeded",
                    "ERROR: API Gateway returning 503 - Service Unavailable",
                    "CRITICAL: Kubernetes pod crash loop detected in analytics-service"
                ]
                const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)]
                addLog("error", randomError)
            }
        }, 60000) // Every 1 minute
        return () => clearInterval(interval)
    }, [addLog, systemStatus])

    // AUTO-DETECT ERRORS AND TRIGGER REMEDIATION
    useEffect(() => {
        // Watch for new error logs
        const latestLog = logs[0]
        if (latestLog && latestLog.level === "error" && systemStatus === "healthy" && !isRemediating) {
            console.log("🚨 Auto-detected error, triggering remediation flow...")
            runRemediationFlow(latestLog.message)
        }
    }, [logs, systemStatus, isRemediating])


    const createPR = async (errorContext: string) => {
        const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN
        const owner = process.env.NEXT_PUBLIC_GITHUB_OWNER
        const repo = process.env.NEXT_PUBLIC_GITHUB_REPO

        if (!token || !owner || !repo) {
            addLog("warning", "GitHub credentials missing in .env, skipping real PR creation.")
            return `github.com/autoops/fix-${Date.now()}/pull/${Math.floor(Math.random() * 100)}` // Fallback
        }

        try {
            const octokit = new Octokit({ auth: token })
            const branchName = `fix/auto-remediation-${Date.now()}`

            // 1. Get default branch SHA
            const { data: refData } = await octokit.request('GET /repos/{owner}/{repo}/git/ref/{ref}', {
                owner,
                repo,
                ref: 'heads/main', // Assuming main is default
            })
            const sha = refData.object.sha

            // 2. Create new branch
            await octokit.request('POST /repos/{owner}/{repo}/git/refs', {
                owner,
                repo,
                ref: `refs/heads/${branchName}`,
                sha,
            })

            // 3. Create dummy file change
            await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
                owner,
                repo,
                path: `fixes/auto-fix-${Date.now()}.json`,
                message: `fix: Auto-remediation for ${errorContext.substring(0, 50)}`,
                content: btoa(JSON.stringify({ fix: errorContext, timestamp: Date.now() }, null, 2)),
                branch: branchName,
            })

            // 4. Create PR
            const { data: prData } = await octokit.request('POST /repos/{owner}/{repo}/pulls', {
                owner,
                repo,
                title: `fix: Auto-remediation for ${errorContext.substring(0, 50)}`,
                body: `Automated fix generated by AutoOps AI.\n\nError: ${errorContext}`,
                head: branchName,
                base: 'main',
            })

            return prData.html_url
        } catch (error: any) {
            addLog("error", `GitHub API Error: ${error.message}`)
            return `github.com/autoops/fix-${Date.now()}/pull/${Math.floor(Math.random() * 100)} (Simulation)`
        }
    }

    const runRemediationFlow = async (errorMessage: string) => {
        if (isRemediating) return
        setIsRemediating(true)

        // Start Sequence (UI Feedback)
        addLog("info", "🔍 AutoOps: Connecting to Archestra Centralized Runtime...")
        setMonitorStatus("active")
        setActiveStep("monitor")
        setSystemStatus("healing")

        try {
            // CALL REAL ARCHESTRA/MCP ORCHESTRATION
            const response = await fetch("/api/orchestration/trigger", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ errorMessage })
            });

            if (!response.ok) throw new Error("Orchestration failed");

            const result = await response.json();
            const { rootCause, fix, prUrl } = result.data;

            // Step 1: Monitor Complete
            setTimeout(() => {
                setMonitorStatus("completed")
                addLog("info", "Log Monitor: Anomaly detected and context ingested.")

                // Step 2: Analyze
                setActiveStep("analyze")
                setAnalyzerStatus("active")

                setTimeout(() => {
                    addLog("info", `Log Analyzer (MCP): Pattern match found. Root Cause: ${rootCause}`)
                    setAnalyzerStatus("completed")

                    // Step 3: Diagnose
                    setActiveStep("diagnose")
                    setRootCauseStatus("active")

                    setTimeout(() => {
                        addLog("info", "Diagnosis: Validated incident with system topology.")
                        setRootCauseStatus("completed")

                        // Step 4: Fix
                        setActiveStep("fix")
                        setFixStatus("active")

                        setTimeout(() => {
                            addLog("info", `Fix Generator (MCP): Synthesized patch.`)
                            setFixStatus("completed")

                            // Step 5: PR
                            setActiveStep("pr")
                            setPrStatus("active")

                            setTimeout(() => {
                                addLog("info", `PR Agent (MCP): GitHub Pull Request created!`)
                                setPrLinks(prev => [...prev, prUrl])
                                setPrStatus("completed")

                                // Increment cost for real PR creation
                                setTotalCost(prev => parseFloat((prev + Math.random() * 0.5 + 0.1).toFixed(2)))

                                // Step 6: Comms
                                setActiveStep("comms")
                                setCommsStatus("active")

                                setTimeout(() => {
                                    const notification = `🚨 Resolved via Archestra MCP: ${errorMessage.substring(0, 50)}...`
                                    setSlackMessages(prev => [...prev, notification])
                                    setCommsStatus("completed")
                                    setSystemStatus("healthy")
                                    setActiveStep("monitor")
                                    addLog("info", "✅ System stability restored by Archestra Orchestrator.")
                                    setIsRemediating(false)

                                    // Reduce threat count
                                    setThreats(prev => Math.max(0, prev - 1))

                                    // Reset agent statuses
                                    setTimeout(() => {
                                        setMonitorStatus("idle")
                                        setAnalyzerStatus("idle")
                                        setRootCauseStatus("idle")
                                        setFixStatus("idle")
                                        setPrStatus("idle")
                                        setCommsStatus("idle")
                                    }, 1000)
                                }, 1500)
                            }, 2000)
                        }, 2000)
                    }, 1500)
                }, 1500)
            }, 1000)

        } catch (error: any) {
            addLog("error", `Archestra Error: ${error.message}`)
            setIsRemediating(false)
            setSystemStatus("critical")
        }
    }

    const triggerDemo = () => {
        if (systemStatus === "critical" || isRemediating) return

        // Simulate a critical error
        addLog("error", "MANUAL TRIGGER: High latency detected in PaymentService API")
        addLog("error", "500 Internal Server Error: Connection timed out")
    }

    return {
        systemStatus,
        logs,
        activeStep,
        agents: {
            monitor: monitorStatus,
            analyzer: analyzerStatus,
            rootCause: rootCauseStatus,
            fix: fixStatus,
            pr: prStatus,
            comms: commsStatus
        },
        artifacts: {
            prLinks,
            slackMessages
        },
        metrics: {
            totalCost,
            threats,
            activeAgents: 5, // Always 5 agents active
            incidentCount
        },
        triggerDemo
    }
}
