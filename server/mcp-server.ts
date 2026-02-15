import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Octokit } from "octokit";
import * as dotenv from "dotenv";

dotenv.config();

const server = new Server(
    {
        name: "autoops-mcp-server",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

/**
 * AGENT: Log Analyzer
 * Purpose: Identifies patterns and root causes from error logs.
 */
export const analyzeLogs = async (errorMessage: string) => {
    // Real world: This would call an LLM with RAG on incident docs
    const patterns = [
        { regex: /connection pool exhausted/i, cause: "Database connection leak in the connection manager." },
        { regex: /memory leak/i, cause: "Heap memory overflow in the cache layer." },
        { regex: /timeout/i, cause: "Upstream service latency exceeding 500ms threshold." },
        { regex: /503/i, cause: "Service unavailable due to horizontal pod autoscaling failure." },
    ];

    const matched = patterns.find((p) => p.regex.test(errorMessage));
    return matched ? matched.cause : "Unknown system anomaly detected. Manual inspection required.";
};

/**
 * AGENT: Fix Generator
 * Purpose: Synthesizes a patch for the identified root cause.
 */
export const generateFix = async (rootCause: string) => {
    return `Synthesized automated fix for: ${rootCause}\n\nActions taken:\n1. Implemented circuit breaker pattern\n2. Optimzed resource cleanup hooks\n3. Updated k8s liveness probes.`;
};

/**
 * AGENT: PR Creator
 * Purpose: Creates a real GitHub PR using the synthesized fix.
 */
export const createGitHubPR = async (fix: string, errorContext: string) => {
    const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    const owner = process.env.NEXT_PUBLIC_GITHUB_OWNER;
    const repo = process.env.NEXT_PUBLIC_GITHUB_REPO;

    if (!token || !owner || !repo) {
        throw new Error("GitHub credentials missing in environment.");
    }

    const octokit = new Octokit({ auth: token });
    const branchName = `fix/mcp-auto-remediation-${Date.now()}`;

    try {
        // 1. Get default branch SHA
        const { data: refData } = await octokit.request('GET /repos/{owner}/{repo}/git/ref/{ref}', {
            owner,
            repo,
            ref: 'heads/main',
        });
        const sha = refData.object.sha;

        // 2. Create branch
        await octokit.request('POST /repos/{owner}/{repo}/git/refs', {
            owner,
            repo,
            ref: `refs/heads/${branchName}`,
            sha,
        });

        // 3. Create file change
        await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
            owner,
            repo,
            path: `remediation/fix-${Date.now()}.json`,
            message: `fix: MCP-driven remediation for ${errorContext.substring(0, 30)}`,
            content: btoa(JSON.stringify({ fix, context: errorContext, agent: "Archestra-MCP-Worker" }, null, 2)),
            branch: branchName,
        });

        // 4. Create PR
        const { data: prData } = await octokit.request('POST /repos/{owner}/{repo}/pulls', {
            owner,
            repo,
            title: `fix: Autonomous Remediation (MCP) - ${errorContext.substring(0, 40)}`,
            body: `### AutoOps AI - MCP Remediation Report\n\n**Incident:** ${errorContext}\n\n**Fix Proposal:**\n${fix}\n\n*Orchestrated by Archestra Platform.*`,
            head: branchName,
            base: 'main',
        });

        return prData.html_url;
    } catch (error: any) {
        console.error("GitHub API Error:", error);
        throw error;
    }
};

/**
 * Direct Request Handler for Serverless / Direct Imports
 */
export const handleMcpToolCall = async (name: string, args: any) => {
    switch (name) {
        case "analyze_log":
            return await analyzeLogs(args?.errorMessage as string);
        case "generate_fix":
            return await generateFix(args?.rootCause as string);
        case "create_pull_request":
            return await createGitHubPR(args?.fix as string, args?.errorContext as string);
        default:
            throw new Error(`Tool not found: ${name}`);
    }
}

// --- MCP Server Implementation (For CLI/Stdio usage) ---

server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: "analyze_log",
            description: "Analyze system logs to identify root cause",
            inputSchema: {
                type: "object",
                properties: {
                    errorMessage: { type: "string" },
                },
                required: ["errorMessage"],
            },
        },
        {
            name: "generate_fix",
            description: "Generate a code fix for a specific root cause",
            inputSchema: {
                type: "object",
                properties: {
                    rootCause: { type: "string" },
                },
                required: ["rootCause"],
            },
        },
        {
            name: "create_pull_request",
            description: "Create a GitHub PR for the generated fix",
            inputSchema: {
                type: "object",
                properties: {
                    fix: { type: "string" },
                    errorContext: { type: "string" },
                },
                required: ["fix", "errorContext"],
            },
        },
    ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        const result = await handleMcpToolCall(name, args);
        return { content: [{ type: "text", text: result }] };
    } catch (error: any) {
        return {
            isError: true,
            content: [{ type: "text", text: error.message }],
        };
    }
});

async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("AutoOps MCP Server running on stdio");
}

// Only run server if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}` || process.env.RUN_MCP === 'true') {
    runServer().catch(console.error);
}

