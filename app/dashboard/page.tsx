"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { deriveKey, encryptPayload } from '@/utils/crypto';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { useMagnetic, KineticTimer } from '@/components/KineticComponents';
import LiquidObsidian from '@/components/canvas/LiquidObsidian';

type Tab = {
  id: string;
  file_name: string;
  content: string;
  status: 'ACTIVE' | 'WARNING' | 'RELEASED';
  isEncrypted: boolean;
  beneficiary_id: string | null;
  countdown_days: number;
};

type Beneficiary = { id: string; name: string; email: string; };

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [sessionLoading, setSessionLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [apiKeyDisplay, setApiKeyDisplay] = useState<string | null>(null);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [newBenName, setNewBenName] = useState('');
  const [newBenEmail, setNewBenEmail] = useState('');

  const [tabs, setTabs] = useState<Tab[]>([
    { id: crypto.randomUUID(), file_name: '_secrets.env', content: 'DATABASE_URL="..."', status: 'ACTIVE', isEncrypted: false, beneficiary_id: null, countdown_days: 30 },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0].id);
  const activeTab = tabs.find(t => t.id === activeTabId);

  // Magnetic Button Logic
  const secureBtn = useMagnetic(0.2);

  useEffect(() => {
    const initialize = async () => {
      // Middleware handles route protection — just fetch the session here.
      // getSession reads from the cookie the middleware already set/refreshed.
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Fallback redirect if middleware somehow misses
        router.push('/login');
        return;
      }
      setUserId(session.user.id);
      const { data: benData } = await supabase
        .from('beneficiaries')
        .select('id, name, email')
        .eq('user_id', session.user.id);
      if (benData) setBeneficiaries(benData);
      setSessionLoading(false);
    };
    initialize();
  }, [router, supabase]);

  const hashKeyLocally = async (key: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleGenerateApiKey = async () => {
    if (!userId) return;
    setIsGeneratingKey(true);
    const rawKey = 'dev_' + Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');
    const hashedKey = await hashKeyLocally(rawKey);
    const { error } = await supabase.from('api_keys').insert({ user_id: userId, key_hash: hashedKey });
    if (!error) setApiKeyDisplay(rawKey);
    setIsGeneratingKey(false);
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const slideUp = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 20 } }
  };

  if (sessionLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-green-500 font-mono">Initializing Neural Link...</div>;
  }

  return (
    <>
      <LiquidObsidian />
      <div className="min-h-screen text-neutral-300 font-mono flex flex-col bg-black/60 backdrop-blur-sm">
        <header className="h-14 border-b border-neutral-800/50 flex items-center px-6 bg-black/50 backdrop-blur-md z-10">
          <h1 className="text-green-500 font-bold tracking-widest text-sm drop-shadow-[0_0_8px_rgba(0,255,0,0.5)]">DEV_ESCROW // VAULT_SYSTEM</h1>
          <div className="ml-auto flex items-center gap-4 text-xs">
            <span className="text-neutral-400">STATUS: {activeTab?.status || 'N/A'}</span>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(0,255,0,0.8)]"></div>
          </div>
        </header>

        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex-1 flex overflow-hidden z-10">
          
          {/* Left Sidebar */}
          <motion.aside variants={slideUp} className="w-64 border-r border-neutral-800/50 bg-black/40 p-4 flex flex-col overflow-y-auto backdrop-blur-lg">
            <h2 className="text-xs text-neutral-500 mb-4 tracking-wider uppercase">Vault Directory</h2>
            <ul className="space-y-2 text-sm flex-1 relative">
              {tabs.map((tab) => (
                <motion.li 
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  whileHover={{ x: 5 }}
                  className={`cursor-pointer flex items-center gap-2 px-2 py-2 rounded relative z-10 transition-colors ${
                    activeTabId === tab.id ? 'text-green-400' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {activeTabId === tab.id && (
                    <motion.div 
                      layoutId="active-pill" 
                      className="absolute inset-0 bg-neutral-800/80 border border-neutral-700/50 rounded z-[-1]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="text-neutral-600">├─</span> {tab.file_name} {tab.isEncrypted && '🔒'}
                </motion.li>
              ))}
            </ul>
            
            <div className="border-t border-neutral-800/50 pt-4 mt-auto">
              <h3 className="text-xs text-neutral-500 mb-2 tracking-wider uppercase">Proof of Life Auth</h3>
              {apiKeyDisplay ? (
                <div className="bg-black/80 border border-green-500 p-2 rounded relative shadow-[0_0_15px_rgba(0,255,0,0.1)]">
                  <span className="text-[10px] text-green-500 absolute -top-2 left-2 bg-black px-1">COPY NOW</span>
                  <code className="text-xs text-neutral-300 break-all select-all">{apiKeyDisplay}</code>
                </div>
              ) : (
                <button 
                  onClick={handleGenerateApiKey} disabled={isGeneratingKey}
                  className="w-full bg-neutral-800/80 hover:bg-neutral-700/80 text-neutral-300 text-xs py-2 rounded transition-colors"
                >
                  {isGeneratingKey ? 'GENERATING...' : 'GENERATE API KEY'}
                </button>
              )}
            </div>
          </motion.aside>

          {/* Central Code Panel */}
          <motion.main variants={slideUp} className="flex-1 bg-black/50 flex flex-col relative backdrop-blur-sm">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none z-0"></div>
            
            <div className="p-2 border-b border-neutral-800/50 bg-black/60 flex justify-between items-center relative z-10">
              <span className="text-xs text-neutral-400">{activeTab?.file_name || 'No file selected'}</span>
              
              <motion.button 
                ref={secureBtn.ref}
                onMouseMove={secureBtn.handleMouseMove}
                onMouseLeave={secureBtn.handleMouseLeave}
                animate={{ x: secureBtn.position.x, y: secureBtn.position.y }}
                transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
                className="bg-green-600/90 hover:bg-green-500 text-black text-xs font-bold px-6 py-1.5 rounded-sm shadow-[0_0_15px_rgba(0,255,0,0.3)] hover:shadow-[0_0_25px_rgba(0,255,0,0.5)] transition-colors disabled:opacity-50"
              >
                SECURE VAULT
              </motion.button>
            </div>
            
            <div className="flex-1 relative z-10 p-2">
              {activeTab ? (
                <Editor
                  height="100%" theme="vs-dark" language="plaintext" value={activeTab.content}
                  options={{ minimap: { enabled: false }, fontFamily: 'monospace', readOnly: activeTab.isEncrypted }}
                />
              ) : null}
            </div>
          </motion.main>

          {/* Right Configuration Widget */}
          <motion.aside variants={slideUp} className="w-80 border-l border-neutral-800/50 bg-black/40 p-6 flex flex-col gap-6 overflow-y-auto backdrop-blur-lg">
            <div>
              <h3 className="text-xs text-neutral-500 mb-3 tracking-wider uppercase">Vault Config</h3>
              <div className="space-y-4">
                <div className="bg-black/50 p-4 border border-neutral-800/50 rounded-lg">
                  <label className="text-xs text-neutral-400 block mb-2">DECRYPT_TIMER</label>
                  <KineticTimer days={activeTab?.countdown_days || 0} />
                </div>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      </div>
    </>
  );
}
