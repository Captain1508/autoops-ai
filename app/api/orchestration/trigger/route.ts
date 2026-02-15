import { NextRequest, NextResponse } from "next/server";
import { handleMcpToolCall } from "@/server/mcp-server";

export async function POST(req: NextRequest) {
    try {
        const { errorMessage } = await req.json();

        if (!errorMessage) {
            return NextResponse.json({ error: "Missing errorMessage" }, { status: 400 });
        }

        console.log("🔍 Running Analyzer...");
        const rootCause = await handleMcpToolCall("analyze_log", { errorMessage });

        console.log("🛠️ Running Fixer...");
        const fix = await handleMcpToolCall("generate_fix", { rootCause });

        console.log("🐙 Running PR Agent...");
        const prUrl = await handleMcpToolCall("create_pull_request", { fix, errorContext: errorMessage });

        return NextResponse.json({
            success: true,
            data: {
                rootCause,
                fix,
                prUrl,
                orchestration: "Archestra-MCP-Direct-Runtime"
            }
        });

    } catch (error: any) {
        console.error("Orchestration Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
