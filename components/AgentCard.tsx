"use client"

import { Badge } from "@/components/ui/badge" // Need to create badge
import { motion } from "framer-motion"
import { CheckCircle2, Loader2, Circle, AlertCircle } from "lucide-react"
import { AgentStatus } from "@/hooks/useAutoOps"

interface AgentCardProps {
    name: string
    role: string
    status: AgentStatus
    details: string
}

export function AgentCard({ name, role, status, details }: AgentCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`
        p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 relative overflow-hidden group
        ${status === 'active'
                    ? 'bg-primary/10 border-primary/50 shadow-lg shadow-primary/15'
                    : status === 'completed'
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-card/30 border-white/5 hover:bg-white/5'}
      `}
        >
            {status === 'active' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -skew-x-12 translate-x-[-200%] animate-shimmer" />
            )}

            <div className="flex justify-between items-start mb-2 relative z-10">
                <div>
                    <h4 className={`font-bold text-sm ${status === 'active' ? 'text-primary' : 'text-white'}`}>
                        {name}
                    </h4>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">{role}</p>
                </div>
                <div className="mt-1">
                    {status === 'idle' && <Circle className="w-4 h-4 text-muted-foreground/30" />}
                    {status === 'active' && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                    {status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {status === 'failed' && <AlertCircle className="w-4 h-4 text-red-500" />}
                </div>
            </div>

            <div className="relative z-10">
                <p className={`text-xs transition-colors duration-300 ${status === 'active' ? 'text-cyan-100' : 'text-slate-400'}`}>
                    {status === 'idle' ? 'Waiting for task...' : details}
                </p>

                {status === 'active' && (
                    <div className="h-1 w-full bg-primary/20 rounded-full mt-3 overflow-hidden">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>
                )}
            </div>
        </motion.div>
    )
}
