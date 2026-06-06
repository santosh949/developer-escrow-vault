import { useVaultStore } from '../store'
import Editor from '@monaco-editor/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Unlock, Zap } from 'lucide-react'

export function EditorView() {
  const { files, activeId, updateFileContent, toggleEncryption } = useVaultStore()
  const activeFile = files.find(f => f.id === activeId)

  if (!activeFile) return null

  return (
    <motion.main 
      key={activeFile.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-1 glass-panel m-4 ml-0 flex flex-col z-10 overflow-hidden relative"
    >
      {/* Editor Header */}
      <header className="h-14 border-b border-[#00ff41]/10 bg-black/40 flex items-center px-6 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse-slow shadow-[0_0_8px_#00ff41]" />
          <span className="text-primary font-bold text-sm">{activeFile.file_name}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <AnimatePresence mode="wait">
            {activeFile.is_encrypted ? (
              <motion.div
                key="enc"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 text-warning text-xs font-bold px-3 py-1 bg-warning/10 rounded-full border border-warning/30"
              >
                <Lock className="w-3 h-3" /> ENCRYPTED
              </motion.div>
            ) : (
              <motion.div
                key="plain"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 text-primary text-xs font-bold px-3 py-1 bg-primary/10 rounded-full border border-primary/30"
              >
                <Unlock className="w-3 h-3" /> PLAINTEXT
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={() => toggleEncryption(activeFile.id)}
            className="btn-premium flex items-center gap-2"
          >
            <Zap className="w-3 h-3" />
            {activeFile.is_encrypted ? 'DECRYPT' : 'SECURE VAULT'}
          </button>
        </div>
      </header>

      {/* Editor Area */}
      <div className="flex-1 relative bg-[#020304]/80">
        {activeFile.is_encrypted && (
          <div className="absolute inset-0 z-20 backdrop-blur-sm bg-black/50 flex flex-col items-center justify-center">
            <Lock className="w-12 h-12 text-warning mb-4 animate-pulse-slow" />
            <h3 className="text-warning font-bold tracking-widest text-lg">PAYLOAD ENCRYPTED</h3>
            <p className="text-textMuted text-xs mt-2">Authentication required to view contents</p>
          </div>
        )}
        
        <Editor
          height="100%"
          theme="vs-dark"
          language={activeFile.file_name.endsWith('.json') ? 'json' : 'shell'}
          value={activeFile.content}
          onChange={(val) => updateFileContent(activeFile.id, val || '')}
          options={{
            minimap: { enabled: false },
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 14,
            lineHeight: 24,
            padding: { top: 24, bottom: 24 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            readOnly: activeFile.is_encrypted,
          }}
          loading={<div className="flex h-full items-center justify-center text-primary">Initializing Neural Link...</div>}
        />
      </div>
    </motion.main>
  )
}
