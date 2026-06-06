import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVaultStore } from '../store'
import { useNavigate } from 'react-router-dom'
import { Lock, Fingerprint, Activity } from 'lucide-react'
import NeuralField from '../components/NeuralField'

export function Login() {
  const { masterPasswordHash, setMasterPassword, unlockVault } = useVaultStore()
  const navigate = useNavigate()
  
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [booting, setBooting] = useState(true)
  const isFirstRun = !masterPasswordHash

  useEffect(() => {
    // Simulate boot sequence
    const timer = setTimeout(() => setBooting(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) return

    if (isFirstRun) {
      setMasterPassword(password)
      unlockVault(password)
      navigate('/dashboard')
    } else {
      const success = unlockVault(password)
      if (success) {
        navigate('/dashboard')
      } else {
        setError(true)
        setPassword('')
        setTimeout(() => setError(false), 1000)
      }
    }
  }

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden items-center justify-center font-sans text-text">
      <NeuralField />
      
      <div className="relative z-10 w-full max-w-md p-6">
        <AnimatePresence mode="wait">
          {booting ? (
            <motion.div
              key="boot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-4 text-primary"
            >
              <Activity className="w-12 h-12 animate-pulse" />
              <h2 className="glitch-text text-xl font-bold tracking-[0.3em] uppercase" data-text="SYSTEM BOOTING">
                SYSTEM BOOTING
              </h2>
              <div className="w-48 h-1 bg-black/50 overflow-hidden rounded-full mt-4">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: "100%" }} 
                  transition={{ duration: 1.8 }} 
                  className="h-full bg-primary" 
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-8 shadow-[0_0_50px_rgba(0,255,65,0.1)]"
            >
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 rounded-full bg-black/50 border border-primary/30 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,255,65,0.2)]">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-primary tracking-widest text-center">DEAD-MAN VAULT</h1>
                <p className="text-xs text-textMuted mt-2 tracking-widest uppercase">
                  {isFirstRun ? 'System Initialization' : 'Authentication Required'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-[10px] text-textMuted tracking-widest uppercase block mb-2">
                    {isFirstRun ? 'Set Master Password' : 'Enter Master Password'}
                  </label>
                  <div className="relative">
                    <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                    <input
                      type="password"
                      autoFocus
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`vault-input pl-10 ${error ? 'border-danger ring-danger/50' : ''}`}
                      placeholder="••••••••••••"
                    />
                  </div>
                  {error && <p className="text-danger text-xs mt-2 animate-pulse">ACCESS DENIED</p>}
                </div>

                <button type="submit" className="btn-premium w-full flex justify-center items-center gap-2 py-3">
                  {isFirstRun ? 'INITIALIZE VAULT' : 'DECRYPT & ENTER'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
