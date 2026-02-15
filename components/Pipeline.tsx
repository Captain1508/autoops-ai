"use client"

import { motion } from "framer-motion"
import { Search, FileText, Activity, Wrench, GitPullRequest, MessageSquare } from "lucide-react"

const steps = [
    { id: "monitor", label: "Monitor", icon: Search },
    { id: "analyze", label: "Analysis", icon: FileText },
    { id: "diagnose", label: "Diagnose", icon: Activity },
    { id: "fix", label: "Generate Fix", icon: Wrench },
    { id: "pr", label: "Create PR", icon: GitPullRequest },
    { id: "comms", label: "Slack Notify", icon: MessageSquare },
]

export function Pipeline({ currentStep }: { currentStep: string }) {
    return (
        <div className="w-full p-6 bg-[#080808] border border-white/10 rounded-xl shadow-2xl relative overflow-hidden group">
            {/* Ambient background bloom */}
            <div className="absolute top-0 left-1/4 w-1/2 h-full bg-primary/5 blur-[50px] pointer-events-none" />

            <h3 className="text-xl font-bold mb-10 flex items-center gap-3 relative z-10 text-white/90">
                <Activity className="w-6 h-6 text-primary animate-pulse" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/40">
                    Multi-Agent Orchestration Pipeline
                </span>
            </h3>

            <div className="relative flex justify-between items-center px-8">
                {/* Track Line */}
                <div className="absolute top-1/2 left-8 right-8 h-[2px] bg-white/10 -z-0">
                    {/* Active Progress Line */}
                    <motion.div
                        className="h-full bg-gradient-to-r from-primary via-cyan-400 to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                        initial={{ width: "0%" }}
                        animate={{
                            width: `${(steps.findIndex(s => s.id === currentStep) / (steps.length - 1)) * 100}%`
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />

                    {/* Moving Particle Effect */}
                    <motion.div
                        className="absolute top-1/2 -translate-y-1/2 w-20 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80"
                        animate={{ x: ["0%", "100%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        style={{ display: currentStep === 'completed' ? 'none' : 'block' }}
                    />
                </div>

                {steps.map((step, index) => {
                    const isActive = step.id === currentStep
                    const isPast = steps.findIndex(s => s.id === currentStep) > index
                    const isFuture = !isActive && !isPast

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center gap-4">
                            {/* Icon Circle */}
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isActive ? 1.3 : 1,
                                    backgroundColor: isActive ? "rgba(6,182,212,1)" : isPast ? "rgba(6,182,212,0.2)" : "rgba(10,10,15,1)",
                                    borderColor: isActive ? "rgba(6,182,212,1)" : isPast ? "rgba(6,182,212,0.5)" : "rgba(255,255,255,0.1)",
                                }}
                                className={`
                                    w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-500 shadow-xl
                                    ${isActive ? "shadow-[0_0_30px_rgba(6,182,212,0.6)]" : ""}
                                `}
                            >
                                <step.icon className={`w-6 h-6 ${isActive ? "text-black fill-current" : isPast ? "text-primary" : "text-white/20"}`} />
                            </motion.div>

                            {/* Label */}
                            <motion.div
                                className="flex flex-col items-center gap-1"
                                animate={{ y: isActive ? 5 : 0, opacity: isActive || isPast ? 1 : 0.5 }}
                            >
                                <span className={`text-xs font-bold tracking-widest uppercase ${isActive ? "text-primary drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" : "text-white/40"}`}>
                                    {step.label}
                                </span>
                                {isActive && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-[10px] text-primary/80"
                                    >
                                        Processing...
                                    </motion.span>
                                )}
                            </motion.div>

                            {/* Ripple Effect for Active */}
                            {isActive && (
                                <>
                                    <motion.div
                                        className="absolute top-2 left-2 w-12 h-12 rounded-full border border-primary/50  -z-10"
                                        initial={{ scale: 1, opacity: 1 }}
                                        animate={{ scale: 2, opacity: 0 }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                    />
                                    <motion.div
                                        className="absolute top-2 left-2 w-12 h-12 rounded-full border border-primary/30 -z-10"
                                        initial={{ scale: 1, opacity: 1 }}
                                        animate={{ scale: 2.5, opacity: 0 }}
                                        transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                                    />
                                </>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
