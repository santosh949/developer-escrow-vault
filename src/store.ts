import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type VaultFile = {
  id: string
  file_name: string
  content: string
  status: 'ACTIVE' | 'WARNING' | 'RELEASED'
  is_encrypted: boolean
  countdown_days: number // Keeping this for backward compatibility in UI, but we use global timer now
}

export type Beneficiary = {
  id: string
  name: string
  email: string
}

export type EmailLog = {
  id: string
  timestamp: string
  to: string
  subject: string
  type: 'WARNING' | 'HANDOVER'
}

interface VaultState {
  // Vault Data
  files: VaultFile[]
  activeId: string | null
  beneficiaries: Beneficiary[]
  
  // Operator Data
  masterPasswordHash: string | null
  operatorEmail: string
  
  // Timer System
  timerDuration: '30_DAYS' | '10_MINUTES'
  timerRemainingMs: number
  timerStatus: 'ACTIVE' | 'WARNING' | 'RELEASED'
  lastCheckIn: number
  
  // Simulation / Logs
  emailLogs: EmailLog[]

  // Session (Not persisted ideally, but we'll persist it for simplicity right now unless we extract it)
  isUnlocked: boolean

  // Actions
  unlockVault: (pass: string) => boolean
  setMasterPassword: (pass: string) => void
  setOperatorEmail: (email: string) => void
  
  setActiveId: (id: string) => void
  addFile: (name: string) => void
  updateFileContent: (id: string, content: string) => void
  renameFile: (id: string, newName: string) => void
  toggleEncryption: (id: string) => void
  
  addBeneficiary: (name: string, email: string) => void
  removeBeneficiary: (id: string) => void
  
  // Timer Actions
  setTimerDuration: (duration: '30_DAYS' | '10_MINUTES') => void
  checkIn: () => void
  tickTimer: (ms: number) => void
  fastForwardToWarning: () => void
  fastForwardToRelease: () => void
  
  // Internal
  logEmail: (log: Omit<EmailLog, 'id' | 'timestamp'>) => void
}

const INITIAL_FILE: VaultFile = {
  id: '1',
  file_name: 'core_secrets.env',
  content: '# INITIALIZED SECURE VAULT\n\nAPI_KEY="sk_live_x89a0f..."\nDB_URL="postgres://vault:supersecret@db.system.local"\n\n# Graph Memory: Active',
  status: 'ACTIVE',
  is_encrypted: false,
  countdown_days: 30,
}

const getDurationMs = (duration: '30_DAYS' | '10_MINUTES') => {
  return duration === '30_DAYS' ? 30 * 24 * 60 * 60 * 1000 : 10 * 60 * 1000;
}

const getWarningThresholdMs = (duration: '30_DAYS' | '10_MINUTES') => {
  return duration === '30_DAYS' ? 3 * 24 * 60 * 60 * 1000 : 1 * 60 * 1000;
}

export const useVaultStore = create<VaultState>()(
  persist(
    (set, get) => ({
      files: [INITIAL_FILE],
      activeId: '1',
      beneficiaries: [],
      
      masterPasswordHash: null,
      operatorEmail: 'operator@system.local',
      
      timerDuration: '30_DAYS',
      timerRemainingMs: getDurationMs('30_DAYS'),
      timerStatus: 'ACTIVE',
      lastCheckIn: Date.now(),
      
      emailLogs: [],
      isUnlocked: false,

      // --- AUTH ---
      setMasterPassword: (pass) => set({ masterPasswordHash: btoa(pass) }),
      unlockVault: (pass) => {
        const hash = get().masterPasswordHash;
        // If no password set, anything unlocks it (first run)
        if (!hash || btoa(pass) === hash) {
          set({ isUnlocked: true });
          return true;
        }
        return false;
      },
      setOperatorEmail: (email) => set({ operatorEmail: email }),

      // --- FILES ---
      setActiveId: (id) => set({ activeId: id }),
      
      addFile: (name) => set((state) => {
        const newFile: VaultFile = {
          id: Math.random().toString(36).substring(7),
          file_name: name.includes('.') ? name : `${name}.env`,
          content: `# ${name}\n`,
          status: 'ACTIVE',
          is_encrypted: false,
          countdown_days: 30,
        }
        return { files: [...state.files, newFile], activeId: newFile.id }
      }),

      updateFileContent: (id, content) => set((state) => ({
        files: state.files.map(f => f.id === id ? { ...f, content } : f)
      })),

      renameFile: (id, newName) => set((state) => ({
        files: state.files.map(f => f.id === id ? { ...f, file_name: newName } : f)
      })),

      toggleEncryption: (id) => set((state) => ({
        files: state.files.map(f => {
          if (f.id === id) {
            const isEnc = !f.is_encrypted;
            return { ...f, is_encrypted: isEnc }
          }
          return f;
        })
      })),

      // --- BENEFICIARIES ---
      addBeneficiary: (name, email) => set((state) => ({
        beneficiaries: [
          ...state.beneficiaries,
          { id: Math.random().toString(36).substring(7), name, email }
        ]
      })),
      
      removeBeneficiary: (id) => set((state) => ({
        beneficiaries: state.beneficiaries.filter(b => b.id !== id)
      })),

      // --- TIMER & SIMULATION ---
      setTimerDuration: (duration) => set({ 
        timerDuration: duration, 
        timerRemainingMs: getDurationMs(duration),
        timerStatus: 'ACTIVE',
        lastCheckIn: Date.now()
      }),

      checkIn: () => set((state) => ({
        timerRemainingMs: getDurationMs(state.timerDuration),
        timerStatus: 'ACTIVE',
        lastCheckIn: Date.now()
      })),

      tickTimer: (msPassed) => set((state) => {
        if (state.timerStatus === 'RELEASED') return state; // Already fired

        const newRemaining = Math.max(0, state.timerRemainingMs - msPassed);
        let newStatus: 'ACTIVE' | 'WARNING' | 'RELEASED' = state.timerStatus;
        
        const warningThreshold = getWarningThresholdMs(state.timerDuration);

        // Transition to WARNING
        if (newRemaining <= warningThreshold && newRemaining > 0 && state.timerStatus === 'ACTIVE') {
          newStatus = 'WARNING';
          get().logEmail({ to: state.operatorEmail, subject: 'URGENT: Vault Check-In Required', type: 'WARNING' });
        }

        // Transition to RELEASED
        if (newRemaining === 0) {
          newStatus = 'RELEASED';
          state.beneficiaries.forEach(b => {
            get().logEmail({ to: b.email, subject: 'SECURE HANDOVER: Vault Access Granted', type: 'HANDOVER' });
          });
        }

        return { timerRemainingMs: newRemaining, timerStatus: newStatus };
      }),

      fastForwardToWarning: () => set((state) => {
        const ms = getWarningThresholdMs(state.timerDuration) - 1000; // 1 second before warning threshold
        return { timerRemainingMs: ms }
      }),

      fastForwardToRelease: () => set({ timerRemainingMs: 1000 }), // 1 second before release

      logEmail: (log) => set((state) => ({
        emailLogs: [
          ...state.emailLogs,
          { ...log, id: Math.random().toString(36).substring(7), timestamp: new Date().toISOString() }
        ]
      }))
    }),
    {
      name: 'vault-storage',
      partialize: (state) => ({
        files: state.files,
        beneficiaries: state.beneficiaries,
        masterPasswordHash: state.masterPasswordHash,
        operatorEmail: state.operatorEmail,
        timerDuration: state.timerDuration,
        timerRemainingMs: state.timerRemainingMs,
        timerStatus: state.timerStatus,
        lastCheckIn: state.lastCheckIn,
        emailLogs: state.emailLogs,
      }), // Don't persist `isUnlocked` so they have to log in on reload
    }
  )
)
