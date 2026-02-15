"use client"

import { Shield, ShieldAlert, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

interface HealthShieldProps {
    status: "healthy" | "critical" | "healing"
}

export function HealthShield({ status }: HealthShieldProps) {
    return (
        <div className="relative flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border overflow-hidden">
            {/* Background Glow */}
            <motion.div
                animate={{
                    opacity: status === "critical" ? [0.1, 0.3, 0.1] : 0.05,
                    scale: status === "critical" ? [1, 1.2, 1] : 1,
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`absolute inset-0 bg-gradient-to-br ${status === "healthy" ? "from-green-500/20 to-blue-500/0" : "from-red-500/20 to-orange-500/0"
                    }`}
            />

            <motion.div
                animate={{
                    scale: status === "critical" ? [1, 1.1, 1] : 1,
                }}
                transition={{ duration: 0.5, repeat: status === "critical" ? Infinity : 0 }}
            >
                {status === "healthy" ? (
                    <Shield className="w-32 h-32 text-green-500" />
                ) : (
                    <ShieldAlert className="w-32 h-32 text-red-500" />
                )}
            </motion.div>

            <h2 className="mt-6 text-2xl font-bold text-white">
                {status === "healthy" ? "All Systems Operational" : "Critical System Error Detected"}
            </h2>
            <p className="mt-2 text-slate-400 text-center">
                {status === "healthy"
                    ? "AutoOps AI is actively monitoring your production environment. You'll be alerted immediately if any issues are detected."
                    : "AutoOps Agents have been deployed to analyze and resolve the incident. Orchestration is in progress."}
            </p>
        </div>
    )
}
