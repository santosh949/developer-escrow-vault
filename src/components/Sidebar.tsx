import { useState } from 'react'
import { useVaultStore } from '../store'
import { motion, AnimatePresence } from 'framer-motion'
import { FileCode2, ShieldAlert, Plus, FolderLock, Edit2 } from 'lucide-react'

export function Sidebar() {
  const { files, activeId, setActiveId, addFile, renameFile } = useVaultStore()
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleDoubleClick = (id: string, name: string) => {
    setEditingId(id)
    setEditName(name)
  }

  const handleRenameSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault()
    if (editName.trim()) {
      renameFile(id, editName)
    }
    setEditingId(null)
  }

  return (
    <motion.aside 
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 glass-panel flex flex-col m-4 overflow-hidden border-r border-[#00ff41]/20 z-10"
    >
      <div className="p-4 border-b border-[#00ff41]/10 bg-black/40 flex items-center gap-2">
        <FolderLock className="text-primary w-5 h-5" />
        <h2 className="glitch-text text-primary font-bold tracking-[0.2em] uppercase text-xs" data-text="GRAPH MEMORY">
          GRAPH MEMORY
        </h2>
      </div>

      <div className="p-3">
        <button 
          onClick={() => addFile('new_secret')}
          className="btn-premium w-full flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> NEW NODE
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        <AnimatePresence>
          {files.map(f => (
            <motion.div
              key={f.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={() => {
                if (editingId !== f.id) setActiveId(f.id)
              }}
              onDoubleClick={() => handleDoubleClick(f.id, f.file_name)}
              className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-colors group ${
                activeId === f.id ? 'bg-primary/20 border border-primary/40' : 'bg-black/20 hover:bg-black/40 border border-transparent'
              }`}
            >
              {f.is_encrypted ? (
                <ShieldAlert className="w-4 h-4 text-warning flex-shrink-0" />
              ) : (
                <FileCode2 className="w-4 h-4 text-primary flex-shrink-0" />
              )}
              
              <div className="flex-1 min-w-0">
                {editingId === f.id ? (
                  <form onSubmit={(e) => handleRenameSubmit(e, f.id)}>
                    <input
                      autoFocus
                      className="bg-black/60 border border-primary text-text px-1 py-0.5 rounded w-full text-xs outline-none"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={(e) => handleRenameSubmit(e as any, f.id)}
                    />
                  </form>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-xs truncate text-text">{f.file_name}</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDoubleClick(f.id, f.file_name); }}
                        className="opacity-0 group-hover:opacity-100 text-textMuted hover:text-primary transition-opacity"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-[10px] text-textMuted">{f.status}</p>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.aside>
  )
}
