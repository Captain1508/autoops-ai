import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";

export async function POST(req: NextRequest) {
    try {
        const { errorMessage } = await req.json();

        if (!errorMessage) {
            return NextResponse.json({ error: "Missing errorMessage" }, { status: 400 });
        }

        // 1. Start the MCP Server as a background process
        const mcpProcess = spawn("npx", ["--yes", "tsx", "server/mcp-server.ts"], {
            cwd: process.cwd(),
            shell: true,
        });

        // Helper to send request to MCP and wait for response via stdio
        const callMcp = (method: string, params: any, isNotification = false): Promise<any> => {
            return new Promise((resolve, reject) => {
                const requestId = isNotification ? null : Math.floor(Math.random() * 1000000);
                const request: any = {
                    jsonrpc: "2.0",
                    method,
                    params,
                };
                if (requestId !== null) request.id = requestId;

                const requestStr = JSON.stringify(request) + "\n";

                if (isNotification) {
                    mcpProcess.stdin.write(requestStr);
                    resolve(null);
                    return;
                }

                let fullResponse = "";
                const timeout = setTimeout(() => {
                    mcpProcess.stdout.removeListener("data", onData);
                    reject(new Error(`Timeout calling ${method} after 20s`));
                }, 20000);

                const onData = (data: Buffer) => {
                    const chunk = data.toString();
                    fullResponse += chunk;

                    if (fullResponse.includes("\n")) {
                        const lines = fullResponse.split("\n");
                        for (const line of lines) {
                            if (!line.trim()) continue;
                            try {
                                const response = JSON.parse(line.trim());
                                if (response.id === requestId) {
                                    clearTimeout(timeout);
                                    mcpProcess.stdout.removeListener("data", onData);
                                    resolve(response.result);
                                    return;
                                }
                            } catch (e) {
                                // Not this line or partial JSON
                            }
                        }
                    }
                };

                mcpProcess.stdout.on("data", onData);
                mcpProcess.stdin.write(requestStr);
            });
        };

        // 2. MCP HANDSHAKE
        await callMcp("initialize", {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: { name: "autoops-client", version: "1.0.0" }
        });
        await callMcp("notifications/initialized", {}, true);
        console.log("✅ MCP Handshake Complete.");

        // 3. ORCHESTRATION
        const callTool = (name: string, args: any) => callMcp("tools/call", { name, arguments: args });

        console.log("🔍 Running Analyzer...");
        const analysisResult = await callTool("analyze_log", { errorMessage });
        const rootCause = analysisResult.content[0].text;

        console.log("🛠️ Running Fixer...");
        const fixResult = await callTool("generate_fix", { rootCause });
        const fix = fixResult.content[0].text;

        console.log("🐙 Running PR Agent...");
        const prResult = await callTool("create_pull_request", { fix, errorContext: errorMessage });
        const prUrl = prResult.content[0].text;

        // Cleanup
        mcpProcess.kill();

        return NextResponse.json({
            success: true,
            data: {
                rootCause,
                fix,
                prUrl,
                orchestration: "Archestra-MCP-Sequential-Workflow"
            }
        });

    } catch (error: any) {
        console.error("Orchestration Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
