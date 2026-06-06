import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useVaultStore } from '../store'
import { Timer, Users, FastForward, CheckCircle2, AlertTriangle, Plus } from 'lucide-react'

function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (days > 0) {
    return `${days}D ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function WidgetsPanel() {
  const { 
    timerRemainingMs, timerStatus, timerDuration, 
    checkIn, setTimerDuration, fastForwardToWarning, fastForwardToRelease,
    beneficiaries, addBeneficiary, removeBeneficiary
  } = useVaultStore()

  const [newBenName, setNewBenName] = useState('')
  const [newBenEmail, setNewBenEmail] = useState('')
  const [showAddBen, setShowAddBen] = useState(false)

  const handleAddBen = (e: React.FormEvent) => {
    e.preventDefault()
    if (newBenName && newBenEmail) {
      addBeneficiary(newBenName, newBenEmail)
      setNewBenName('')
      setNewBenEmail('')
      setShowAddBen(false)
    }
  }

  const isWarning = timerStatus === 'WARNING'
  const isReleased = timerStatus === 'RELEASED'

  return (
    <motion.aside 
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-80 glass-panel flex flex-col m-4 ml-0 overflow-y-auto border-l border-[#00ff41]/20 z-10"
    >
      {/* Timer Section */}
      <div className={`p-5 border-b border-[#00ff41]/10 space-y-4 transition-colors ${isWarning ? 'bg-warning/10' : isReleased ? 'bg-danger/10' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Timer className="w-4 h-4" />
            <h3 className="text-[10px] font-bold tracking-widest uppercase">DEAD-MAN TIMER</h3>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${isWarning ? 'bg-warning text-black' : isReleased ? 'bg-danger text-white' : 'bg-primary/20 text-primary'}`}>
            {timerStatus}
          </span>
        </div>

        <div className="text-center">
          <span className={`text-4xl font-bold font-mono tracking-wider drop-shadow-md ${isWarning ? 'text-warning' : isReleased ? 'text-danger' : 'text-primary'}`}>
            {formatTime(timerRemainingMs)}
          </span>
        </div>

        <button 
          onClick={checkIn}
          disabled={isReleased}
          className={`w-full py-3 rounded-lg font-bold tracking-widest text-sm flex items-center justify-center gap-2 transition-all ${
            isWarning 
              ? 'bg-warning text-black animate-pulse hover:bg-warning/80 shadow-[0_0_20px_rgba(255,184,0,0.6)]' 
              : isReleased
                ? 'bg-danger/20 text-danger border border-danger/50 cursor-not-allowed'
                : 'btn-premium'
          }`}
        >
          {isReleased ? (
            <><AlertTriangle className="w-4 h-4" /> PAYLOAD RELEASED</>
          ) : (
            <><CheckCircle2 className="w-4 h-4" /> ACKNOWLEDGE & CHECK-IN</>
          )}
        </button>
      </div>

      {/* Simulator Tools */}
      <div className="p-5 border-b border-[#00ff41]/10 space-y-3 bg-black/40">
        <div className="flex items-center gap-2 text-secondary">
          <FastForward className="w-4 h-4" />
          <h3 className="text-[10px] font-bold tracking-widest uppercase">TIME MACHINE (SIMULATOR)</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <button onClick={fastForwardToWarning} className="text-[10px] border border-warning/30 text-warning hover:bg-warning/10 py-1.5 rounded-sm transition-colors">
            Jump to Warning
          </button>
          <button onClick={fastForwardToRelease} className="text-[10px] border border-danger/30 text-danger hover:bg-danger/10 py-1.5 rounded-sm transition-colors">
            Jump to Release
          </button>
        </div>
        
        <div className="flex items-center gap-2 pt-2">
          <span className="text-[10px] text-textMuted uppercase">Duration:</span>
          <select 
            className="bg-black/60 border border-primary/20 text-[10px] text-primary p-1 rounded-sm outline-none"
            value={timerDuration}
            onChange={(e) => setTimerDuration(e.target.value as any)}
          >
            <option value="30_DAYS">30 Days</option>
            <option value="10_MINUTES">10 Minutes (Test)</option>
          </select>
        </div>
      </div>

      {/* Beneficiaries */}
      <div className="p-5 border-b border-[#00ff41]/10 flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[#00ff41]/70">
            <Users className="w-4 h-4" />
            <h3 className="text-[10px] font-bold tracking-widest uppercase">BENEFICIARIES</h3>
          </div>
          <button onClick={() => setShowAddBen(!showAddBen)} className="text-primary hover:text-white transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence>
          {showAddBen && (
            <motion.form 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleAddBen}
              className="space-y-2 mb-4 overflow-hidden"
            >
              <input 
                placeholder="Name" 
                className="vault-input py-1 text-xs" 
                value={newBenName} 
                onChange={e => setNewBenName(e.target.value)} 
              />
              <input 
                type="email" 
                placeholder="Email Address" 
                className="vault-input py-1 text-xs" 
                value={newBenEmail} 
                onChange={e => setNewBenEmail(e.target.value)} 
              />
              <button type="submit" className="btn-premium w-full text-[10px] py-1.5">Add Beneficiary</button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {beneficiaries.length === 0 ? (
            <p className="text-xs text-textMuted italic">No beneficiaries added.</p>
          ) : (
            beneficiaries.map(b => (
              <div key={b.id} className="bg-black/30 border border-primary/10 rounded-md p-2 flex justify-between items-center group">
                <div className="min-w-0">
                  <p className="text-xs text-text truncate">{b.name}</p>
                  <p className="text-[10px] text-textMuted truncate">{b.email}</p>
                </div>
                <button 
                  onClick={() => removeBeneficiary(b.id)}
                  className="text-danger/50 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity p-1"
                >
                  &times;
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.aside>
  )
}
