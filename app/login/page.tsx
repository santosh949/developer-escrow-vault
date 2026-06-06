'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'

const BOOT_LINES = [
  { t: 'DEV_ESCROW_VAULT :: BIOS v3.11.7 — Zero-Knowledge Systems', c: 'text-[#00ff41] font-bold' },
  { t: 'Copyright (c) 2026 Secure Escrow Labs. All rights reserved.', c: 'text-[#3a5a42]' },
  { t: '', c: '' },
  { t: 'Loading encryption modules...', c: 'text-[#a8f0b8]' },
  { t: '  [AES-GCM-256]      ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  LOADED', c: 'text-[#00ff41]' },
  { t: '  [SHA-3-512]        ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  LOADED', c: 'text-[#00ff41]' },
  { t: '  [PKCE HANDSHAKE]   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ACTIVE', c: 'text-[#00ff41]' },
  { t: '  [RLS POLICIES]     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ENFORCED', c: 'text-[#00ff41]' },
  { t: '  [TIME-LOCK ENGINE] ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ARMED', c: 'text-[#00ff41]' },
  { t: '', c: '' },
  { t: 'Establishing secure channel...', c: 'text-[#a8f0b8]' },
  { t: '  Supabase endpoint:   VERIFIED (TLS 1.3)', c: 'text-[#00ff41]' },
  { t: '  Edge region:         iad1 (Washington D.C.)', c: 'text-[#00ff41]' },
  { t: '', c: '' },
  { t: '▶  VAULT ONLINE. Operator authentication required.', c: 'text-[#e8ffe8] font-bold' },
]

export default function LoginPage() {
  const supabase = createClient()
  const [visibleLines, setVisibleLines] = useState(0)
  const [bootDone, setBootDone] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Boot sequence animation
  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i++
      setVisibleLines(i)
      if (i >= BOOT_LINES.length) {
        clearInterval(interval)
        setTimeout(() => setBootDone(true), 600)
      }
    }, 160)
    return () => clearInterval(interval)
  }, [])

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setIsError(false)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })

    if (error) {
      setMessage(error.message)
      setIsError(true)
    } else {
      setMessage('ACCESS CODE transmitted. Check your inbox.')
      setStep(2)
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    }
    setLoading(false)
  }

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const token = digits.join('')
    if (token.length < 6) return
    setLoading(true)
    setMessage('')
    setIsError(false)

    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token }),
    })
    const data = await res.json()

    if (!res.ok) {
      setMessage(data.error ?? 'Verification failed. Try requesting a new code.')
      setIsError(true)
      setDigits(['', '', '', '', '', ''])
      setTimeout(() => otpRefs.current[0]?.focus(), 50)
      setLoading(false)
    } else {
      setMessage('NEURAL LINK ESTABLISHED. Routing to vault...')
      setTimeout(() => { window.location.href = '/dashboard' }, 600)
    }
  }

  const handleDigitChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    const d = [...digits]
    d[idx] = val.slice(-1)
    setDigits(d)
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus()
    if (d.every(x => x) && val) {
      setTimeout(() => handleVerifyOtp(), 100)
    }
  }

  const handleDigitKey = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && idx > 0) otpRefs.current[idx - 1]?.focus()
    if (e.key === 'ArrowRight' && idx < 5) otpRefs.current[idx + 1]?.focus()
  }

  const handleDigitPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!paste) return
    const d = [...digits]
    for (let i = 0; i < paste.length; i++) d[i] = paste[i]
    setDigits(d)
    otpRefs.current[Math.min(paste.length, 5)]?.focus()
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen bg-[#020304] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(0,255,65,0.06),transparent)]" />

      {/* Boot terminal */}
      <AnimatePresence>
        {!bootDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
            className="w-full max-w-2xl"
          >
            <div className="vault-panel rounded-sm p-6 min-h-[360px]">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[rgba(0,255,65,0.1)]">
                <div className="w-3 h-3 rounded-full bg-[#ff3131]" />
                <div className="w-3 h-3 rounded-full bg-[#ffb800]" />
                <div className="w-3 h-3 rounded-full bg-[#00ff41]" />
                <span className="ml-2 text-[10px] text-[#3a5a42] tracking-widest uppercase">terminal — vault_init</span>
              </div>
              <div className="space-y-0.5 font-mono text-[13px]">
                {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`${line.c} leading-relaxed`}
                  >
                    {line.t || '\u00A0'}
                  </motion.div>
                ))}
                {visibleLines < BOOT_LINES.length && (
                  <span className="text-[#00ff41] cursor-blink">█</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login form */}
      <AnimatePresence>
        {bootDone && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-md"
          >
            <div className="vault-panel rounded-sm p-8">
              {/* Logo */}
              <div className="text-center mb-8">
                <h1
                  className="glitch text-[#00ff41] text-2xl font-bold tracking-[0.2em] uppercase mb-1"
                  data-text="DEV_ESCROW // VAULT"
                >
                  DEV_ESCROW // VAULT
                </h1>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[rgba(0,255,65,0.3)]" />
                  <span className="text-[10px] text-[#3a5a42] tracking-[0.3em] uppercase">Authentication Required</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[rgba(0,255,65,0.3)]" />
                </div>
              </div>

              {/* Step 1: Email */}
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.form
                    key="email"
                    onSubmit={handleRequestOtp}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="text-[10px] text-[#3a5a42] tracking-widest uppercase block mb-2">Operator Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="operator@system.com"
                        className="vault-input rounded-sm"
                        required
                        autoFocus
                      />
                    </div>
                    <button type="submit" disabled={loading} className="btn-solid w-full rounded-sm mt-2">
                      {loading ? 'Transmitting...' : '[ REQUEST ACCESS CODE ]'}
                    </button>

                    <div className="relative my-2">
                      <div className="animated-border w-full" />
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#060c06] px-3 text-[10px] text-[#3a5a42] tracking-widest uppercase">
                        or
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="btn-outline w-full rounded-sm"
                    >
                      [ Initialize Neural Link (Google) ]
                    </button>
                  </motion.form>
                )}

                {/* Step 2: OTP */}
                {step === 2 && (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="text-[11px] text-[#3a5a42] tracking-wider mb-1">Access code sent to</p>
                    <p className="text-[#00ff41] text-sm mb-6 truncate">{email}</p>

                    <label className="text-[10px] text-[#3a5a42] tracking-widest uppercase block mb-3">
                      Enter 6-Digit Code
                    </label>

                    <form onSubmit={handleVerifyOtp}>
                      <div className="flex gap-2 justify-between mb-6" onPaste={handleDigitPaste}>
                        {digits.map((d, i) => (
                          <input
                            key={i}
                            ref={el => { otpRefs.current[i] = el }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={d}
                            onChange={e => handleDigitChange(i, e.target.value)}
                            onKeyDown={e => handleDigitKey(i, e)}
                            className={`otp-box rounded-sm ${d ? 'filled' : ''}`}
                          />
                        ))}
                      </div>

                      <button
                        type="submit"
                        disabled={loading || digits.join('').length < 6}
                        className="btn-solid w-full rounded-sm"
                      >
                        {loading ? 'Verifying...' : '[ Initialize Vault Link ]'}
                      </button>
                    </form>

                    <button
                      type="button"
                      onClick={() => { setStep(1); setDigits(['','','','','','']); setMessage(''); setIsError(false) }}
                      className="text-[#3a5a42] hover:text-[#a8f0b8] text-[11px] mt-4 w-full text-center transition-colors"
                    >
                      ← Back to email
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Message */}
              <AnimatePresence>
                {message && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mt-4 text-[12px] text-center ${isError ? 'text-[#ff3131]' : 'text-[#00ff41]'}`}
                  >
                    {isError ? '✗ ' : '✓ '}{message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <p className="text-center text-[10px] text-[#1e3a24] mt-4 tracking-wider">
              ZERO-KNOWLEDGE • END-TO-END ENCRYPTED • TIME-LOCKED
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
