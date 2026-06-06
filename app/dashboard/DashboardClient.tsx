'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import Editor from '@monaco-editor/react'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

const NeuralField = dynamic(() => import('@/components/canvas/NeuralField'), { ssr: false })

type VaultFile = {
  id: string
  file_name: string
  content: string
  status: 'ACTIVE' | 'WARNING' | 'RELEASED'
  is_encrypted: boolean
  countdown_days: number
  created_at?: string
}

type Beneficiary = { id: string; name: string; email: string }

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: '#00ff41',
  WARNING: '#ffb800',
  RELEASED: '#ff3131',
}

const BLANK_FILE: VaultFile = {
  id: '',
  file_name: '_secrets.env',
  content: '# Vault initialized\nAPI_KEY=""\nDB_URL=""\n',
  status: 'ACTIVE',
  is_encrypted: false,
  countdown_days: 30,
}

export default function DashboardClient({ user }: { user: User }) {
  const supabase = createClient()
  const [files, setFiles] = useState<VaultFile[]>([BLANK_FILE])
  const [activeId, setActiveId] = useState<string>(BLANK_FILE.id)
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [encrypting, setEncrypting] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [showNewFile, setShowNewFile] = useState(false)
  const [newBenName, setNewBenName] = useState('')
  const [newBenEmail, setNewBenEmail] = useState('')
  const [showAddBen, setShowAddBen] = useState(false)
  const [editorContent, setEditorContent] = useState(BLANK_FILE.content)
  const saveTimer = useRef<NodeJS.Timeout | null>(null)

  const activeFile = files.find(f => f.id === activeId) ?? files[0]

  // ─── Load Data ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true)
      const [vaultsRes, bensRes] = await Promise.all([
        supabase.from('vaults').select('*').eq('user_id', user.id).order('created_at'),
        supabase.from('beneficiaries').select('id, name, email').eq('user_id', user.id),
      ])

      if (vaultsRes.data && vaultsRes.data.length > 0) {
        const mapped: VaultFile[] = vaultsRes.data.map(v => ({
          id: v.id,
          file_name: v.file_name ?? '_vault.env',
          content: v.encrypted_payload ?? '',
          status: v.status ?? 'ACTIVE',
          is_encrypted: false,
          countdown_days: v.countdown_days ?? 30,
          created_at: v.created_at,
        }))
        setFiles(mapped)
        setActiveId(mapped[0].id)
        setEditorContent(mapped[0].content)
      }

      if (bensRes.data) setBeneficiaries(bensRes.data)
      setLoading(false)
    }
    load()
  }, [user.id])

  // Update editor content when switching files
  useEffect(() => {
    if (activeFile) setEditorContent(activeFile.content)
  }, [activeId])

  // ─── Auto-save ────────────────────────────────────────────────────────────
  const handleEditorChange = useCallback((val: string | undefined) => {
    if (val === undefined) return
    setEditorContent(val)
    setFiles(prev => prev.map(f => f.id === activeId ? { ...f, content: val } : f))
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => autoSave(val), 2000)
  }, [activeId])

  const autoSave = async (content: string) => {
    if (!activeFile?.id) return
    setSaving(true)
    await supabase.from('vaults').update({ encrypted_payload: content }).eq('id', activeFile.id)
    setSaving(false)
  }

  // ─── Create File ──────────────────────────────────────────────────────────
  const createFile = async () => {
    if (!newFileName.trim()) return
    const name = newFileName.trim().includes('.') ? newFileName.trim() : `${newFileName.trim()}.env`
    const { data, error } = await supabase.from('vaults').insert({
      user_id: user.id,
      file_name: name,
      encrypted_payload: `# ${name}\n`,
      iv: '',
      status: 'ACTIVE',
      countdown_days: 30,
    }).select().single()

    if (!error && data) {
      const newFile: VaultFile = {
        id: data.id,
        file_name: name,
        content: `# ${name}\n`,
        status: 'ACTIVE',
        is_encrypted: false,
        countdown_days: 30,
      }
      setFiles(prev => [...prev, newFile])
      setActiveId(data.id)
      setNewFileName('')
      setShowNewFile(false)
    }
  }

  // ─── Encrypt Toggle ───────────────────────────────────────────────────────
  const toggleEncrypt = async () => {
    if (!activeFile) return
    setEncrypting(true)
    const newVal = !activeFile.is_encrypted
    await supabase.from('vaults').update({ status: newVal ? 'WARNING' : 'ACTIVE' }).eq('id', activeFile.id)
    setFiles(prev => prev.map(f =>
      f.id === activeId ? { ...f, is_encrypted: newVal, status: newVal ? 'WARNING' : 'ACTIVE' } : f
    ))
    setEncrypting(false)
  }

  // ─── Add Beneficiary ──────────────────────────────────────────────────────
  const addBeneficiary = async () => {
    if (!newBenName.trim() || !newBenEmail.trim()) return
    const { data, error } = await supabase.from('beneficiaries').insert({
      user_id: user.id,
      name: newBenName.trim(),
      email: newBenEmail.trim(),
    }).select().single()
    if (!error && data) {
      setBeneficiaries(prev => [...prev, data])
      setNewBenName(''); setNewBenEmail(''); setShowAddBen(false)
    }
  }

  // ─── Generate API Key ─────────────────────────────────────────────────────
  const generateApiKey = async () => {
    const raw = 'dev_' + Array.from(crypto.getRandomValues(new Uint8Array(20)))
      .map(b => b.toString(16).padStart(2, '0')).join('')
    const encoder = new TextEncoder()
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(raw))
    const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
    await supabase.from('api_keys').insert({ user_id: user.id, key_hash: hash })
    setApiKey(raw)
  }

  // ─── Sign Out ─────────────────────────────────────────────────────────────
  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  // ─── Timer display ────────────────────────────────────────────────────────
  const days = activeFile?.countdown_days ?? 0
  const timerBlocks = Math.min(days, 30)
  const timerColor = days > 20 ? '#00ff41' : days > 10 ? '#ffb800' : '#ff3131'

  const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  }
  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 20 } },
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <NeuralField />

      {/* Main content */}
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* ═══ HEADER ═════════════════════════════════════════════════════════ */}
        <header className="h-12 flex items-center px-5 gap-4 vault-panel border-b border-[rgba(0,255,65,0.12)] flex-shrink-0">
          <h1
            className="glitch text-[#00ff41] text-sm font-bold tracking-[0.25em] uppercase select-none"
            data-text="DEV_ESCROW // VAULT"
          >
            DEV_ESCROW // VAULT
          </h1>

          <div className="h-4 w-px bg-[rgba(0,255,65,0.15)] mx-1" />

          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full bg-[#00ff41] status-dot"
              style={{ boxShadow: '0 0 6px #00ff41' }}
            />
            <span className="text-[10px] text-[#3a5a42] tracking-widest uppercase">SECURE</span>
          </div>

          {saving && (
            <motion.span
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-[10px] text-[#3a5a42] tracking-wider"
            >
              Auto-saving...
            </motion.span>
          )}

          <div className="ml-auto flex items-center gap-3">
            <span className="text-[11px] text-[#3a5a42] hidden sm:block truncate max-w-[200px]">
              {user.email}
            </span>
            <button onClick={signOut} className="btn-danger text-[10px] px-3 py-1 rounded-sm">
              TERMINATE SESSION
            </button>
          </div>
        </header>

        {/* ═══ MAIN LAYOUT ════════════════════════════════════════════════════ */}
        <motion.div
          variants={stagger} initial="hidden" animate="show"
          className="flex flex-1 overflow-hidden"
        >
          {/* ─── LEFT SIDEBAR ──────────────────────────────────────────────── */}
          <motion.aside
            variants={fadeUp}
            className="w-56 flex flex-col vault-panel border-r border-[rgba(0,255,65,0.12)] flex-shrink-0 overflow-y-auto"
          >
            {/* Vault Directory */}
            <div className="p-3 border-b border-[rgba(0,255,65,0.08)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-[#3a5a42] tracking-widest uppercase">Vault Directory</span>
                <button
                  onClick={() => setShowNewFile(v => !v)}
                  className="text-[#3a5a42] hover:text-[#00ff41] text-base leading-none transition-colors"
                  title="New file"
                >
                  +
                </button>
              </div>

              <AnimatePresence>
                {showNewFile && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-2"
                  >
                    <div className="flex gap-1">
                      <input
                        autoFocus
                        value={newFileName}
                        onChange={e => setNewFileName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') createFile(); if (e.key === 'Escape') setShowNewFile(false) }}
                        placeholder="filename.env"
                        className="vault-input text-[11px] py-1 flex-1 rounded-sm"
                      />
                    </div>
                    <button onClick={createFile} className="btn-outline text-[10px] w-full mt-1 rounded-sm py-1">
                      Create
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-0.5">
                {loading ? (
                  <div className="text-[11px] text-[#3a5a42]">Loading...</div>
                ) : (
                  files.map(f => (
                    <motion.div
                      key={f.id || f.file_name}
                      onClick={() => setActiveId(f.id)}
                      className={`file-item ${activeId === f.id || (!activeId && files[0] === f) ? 'active' : ''}`}
                      whileHover={{ x: 3 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    >
                      <span style={{ color: STATUS_COLOR[f.status], fontSize: 8 }}>●</span>
                      <span className="flex-1 truncate text-[12px]">{f.file_name}</span>
                      {f.is_encrypted && <span className="text-[10px]">🔒</span>}
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* API Key Panel */}
            <div className="p-3 border-b border-[rgba(0,255,65,0.08)]">
              <span className="text-[10px] text-[#3a5a42] tracking-widest uppercase block mb-2">Proof of Life</span>
              <AnimatePresence mode="wait">
                {apiKey ? (
                  <motion.div
                    key="key"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-black/50 border border-[rgba(0,255,65,0.2)] rounded-sm p-2 relative"
                  >
                    <span className="absolute -top-2 left-2 bg-[#060c06] px-1 text-[9px] text-[#00ff41]">COPY NOW</span>
                    <code className="text-[10px] text-[#a8f0b8] break-all select-all leading-relaxed">{apiKey}</code>
                  </motion.div>
                ) : (
                  <motion.button
                    key="gen"
                    onClick={generateApiKey}
                    className="btn-outline text-[10px] w-full rounded-sm py-2"
                  >
                    [ Generate API Key ]
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* User info */}
            <div className="p-3 mt-auto">
              <div className="text-[9px] text-[#1e3a24] tracking-wider">
                <div>UID: {user.id.slice(0, 8)}...</div>
                <div className="mt-0.5">PROVIDER: {user.app_metadata?.provider ?? 'email'}</div>
              </div>
            </div>
          </motion.aside>

          {/* ─── CENTER EDITOR ─────────────────────────────────────────────── */}
          <motion.main
            variants={fadeUp}
            className={`flex-1 flex flex-col min-w-0 ${encrypting ? 'encrypting' : ''}`}
          >
            {/* Editor toolbar */}
            <div className="h-9 flex items-center px-4 gap-3 border-b border-[rgba(0,255,65,0.08)] bg-black/30 flex-shrink-0">
              <span className="text-[#3a5a42] text-[11px] flex items-center gap-1.5">
                <span style={{ color: STATUS_COLOR[activeFile?.status ?? 'ACTIVE'], fontSize: 8 }}>●</span>
                {activeFile?.file_name ?? 'no file'}
              </span>
              <span className="text-[10px] text-[#1e3a24] tracking-wider">
                {activeFile?.status ?? 'ACTIVE'}
              </span>
              <div className="ml-auto flex items-center gap-2">
                <AnimatePresence>
                  {encrypting && (
                    <motion.span
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-[10px] text-[#00ff41]"
                    >
                      Encrypting...
                    </motion.span>
                  )}
                </AnimatePresence>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={toggleEncrypt}
                  disabled={encrypting}
                  className="btn-solid text-[10px] rounded-sm px-4 py-1.5 disabled:opacity-50"
                >
                  {activeFile?.is_encrypted ? '[ DECRYPT ]' : '[ SECURE VAULT ]'}
                </motion.button>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 overflow-hidden">
              <Editor
                height="100%"
                theme="vs-dark"
                language={activeFile?.file_name?.endsWith('.json') ? 'json'
                  : activeFile?.file_name?.endsWith('.sh') ? 'shell'
                  : activeFile?.file_name?.endsWith('.ts') || activeFile?.file_name?.endsWith('.tsx') ? 'typescript'
                  : 'plaintext'}
                value={editorContent}
                onChange={handleEditorChange}
                options={{
                  minimap: { enabled: false },
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontSize: 13,
                  lineHeight: 22,
                  readOnly: activeFile?.is_encrypted,
                  scrollBeyondLastLine: false,
                  renderLineHighlight: 'all',
                  padding: { top: 16, bottom: 16 },
                  lineNumbers: 'on',
                  smoothScrolling: true,
                  cursorBlinking: 'phase',
                  cursorSmoothCaretAnimation: 'on',
                  wordWrap: 'on',
                  bracketPairColorization: { enabled: true },
                }}
                loading={
                  <div className="flex items-center justify-center h-full text-[#3a5a42] text-sm">
                    Loading editor...
                  </div>
                }
              />
            </div>
          </motion.main>

          {/* ─── RIGHT PANEL ───────────────────────────────────────────────── */}
          <motion.aside
            variants={fadeUp}
            className="w-64 flex flex-col vault-panel border-l border-[rgba(0,255,65,0.12)] flex-shrink-0 overflow-y-auto"
          >
            {/* Decrypt Timer */}
            <div className="p-4 border-b border-[rgba(0,255,65,0.08)]">
              <span className="text-[10px] text-[#3a5a42] tracking-widest uppercase block mb-3">DECRYPT_TIMER</span>
              <div className="flex items-end gap-2 mb-2">
                <motion.span
                  key={days}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold"
                  style={{ color: timerColor, textShadow: `0 0 20px ${timerColor}55` }}
                >
                  {days}
                </motion.span>
                <span className="text-[#3a5a42] text-sm mb-1">days</span>
              </div>
              {/* Progress bar */}
              <div className="h-1 bg-[rgba(0,255,65,0.08)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(timerBlocks / 30) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: timerColor, boxShadow: `0 0 6px ${timerColor}` }}
                />
              </div>
              <p className="text-[10px] text-[#3a5a42] mt-1.5">until automatic handover</p>
            </div>

            {/* Vault Status */}
            <div className="p-4 border-b border-[rgba(0,255,65,0.08)]">
              <span className="text-[10px] text-[#3a5a42] tracking-widest uppercase block mb-3">Vault Status</span>
              <div className="space-y-2">
                {files.map(f => (
                  <div key={f.id || f.file_name} className="flex items-center justify-between">
                    <span className="text-[11px] text-[#3a5a42] truncate max-w-[100px]">{f.file_name}</span>
                    <span className="text-[10px] font-bold" style={{ color: STATUS_COLOR[f.status] }}>
                      {f.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Beneficiaries */}
            <div className="p-4 border-b border-[rgba(0,255,65,0.08)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-[#3a5a42] tracking-widest uppercase">Beneficiaries</span>
                <button
                  onClick={() => setShowAddBen(v => !v)}
                  className="text-[#3a5a42] hover:text-[#00ff41] text-base leading-none transition-colors"
                >
                  +
                </button>
              </div>

              <AnimatePresence>
                {showAddBen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-3 space-y-2"
                  >
                    <input
                      value={newBenName}
                      onChange={e => setNewBenName(e.target.value)}
                      placeholder="Name"
                      className="vault-input text-[11px] py-1 rounded-sm"
                    />
                    <input
                      value={newBenEmail}
                      onChange={e => setNewBenEmail(e.target.value)}
                      placeholder="email@domain.com"
                      className="vault-input text-[11px] py-1 rounded-sm"
                    />
                    <button onClick={addBeneficiary} className="btn-outline text-[10px] w-full rounded-sm py-1">
                      Add
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                {beneficiaries.length === 0 ? (
                  <p className="text-[11px] text-[#1e3a24]">No beneficiaries configured.</p>
                ) : (
                  beneficiaries.map(b => (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-black/30 border border-[rgba(0,255,65,0.08)] rounded-sm p-2"
                    >
                      <p className="text-[11px] text-[#a8f0b8]">{b.name}</p>
                      <p className="text-[10px] text-[#3a5a42] truncate">{b.email}</p>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Encryption status */}
            <div className="p-4">
              <span className="text-[10px] text-[#3a5a42] tracking-widest uppercase block mb-3">Encryption</span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${activeFile?.is_encrypted ? 'bg-[#ffb800]' : 'bg-[#00ff41]'}`}
                  style={{ boxShadow: `0 0 6px ${activeFile?.is_encrypted ? '#ffb800' : '#00ff41'}` }}
                />
                <span className="text-[11px]" style={{ color: activeFile?.is_encrypted ? '#ffb800' : '#00ff41' }}>
                  {activeFile?.is_encrypted ? 'ENCRYPTED (AES-GCM)' : 'PLAINTEXT'}
                </span>
              </div>
              <p className="text-[10px] text-[#1e3a24] mt-2 leading-relaxed">
                {activeFile?.is_encrypted
                  ? 'Payload encrypted. Only decryptable with your passphrase.'
                  : 'Click SECURE VAULT to encrypt the active file.'}
              </p>
            </div>
          </motion.aside>
        </motion.div>
      </div>
    </div>
  )
}
