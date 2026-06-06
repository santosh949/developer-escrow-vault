import { useVaultStore } from '../store'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal } from 'lucide-react'
import { useEffect, useRef } from 'react'

export function TerminalLog() {
  const { emailLogs } = useVaultStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [emailLogs])

  return (
    <AnimatePresence>
      {emailLogs.length > 0 && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-4 right-4 w-96 glass-panel border-[#00ff41]/30 z-50 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)]"
        >
          <div className="bg-black/80 border-b border-[#00ff41]/20 p-2 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="text-[10px] text-primary font-bold tracking-widest uppercase">SMTP RELAY SYSTEM</span>
          </div>
          <div 
            ref={scrollRef}
            className="p-4 max-h-48 overflow-y-auto space-y-3 font-mono text-[10px] bg-[#020304]/90"
          >
            {emailLogs.map((log) => (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`border-l-2 pl-2 ${log.type === 'WARNING' ? 'border-warning' : 'border-danger'}`}
              >
                <div className="text-textMuted mb-1">{new Date(log.timestamp).toLocaleTimeString()}</div>
                <div className="text-white"><span className="text-textMuted">TO:</span> {log.to}</div>
                <div className={`${log.type === 'WARNING' ? 'text-warning' : 'text-danger'}`}>
                  <span className="text-textMuted">SUBJECT:</span> {log.subject}
                </div>
                <div className="mt-1 text-primary animate-pulse">
                  [ OK ] Message dispatched to relay.
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
