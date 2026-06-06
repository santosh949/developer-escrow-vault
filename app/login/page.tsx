"use client";

import { createClient } from '@/utils/supabase/client';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    if (error) {
      setMessage(error.message);
      setIsError(true);
    } else {
      setMessage('6-digit code sent. Check your email.');
      setStep(2);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    // POST to our server-side route — this sets cookies via Set-Cookie headers
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token: otp }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error ?? 'Verification failed. Try again.');
      setIsError(true);
      setLoading(false);
    } else {
      setMessage('Neural Link established. Routing...');
      // Hard redirect — sends fresh HTTP request with the server-set cookies
      window.location.href = '/dashboard';
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-mono">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none z-0"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-black/80 border border-neutral-800 p-8 rounded-lg backdrop-blur-md relative z-10 shadow-[0_0_30px_rgba(0,255,0,0.1)]"
      >
        <h1 className="text-green-500 font-bold text-xl tracking-widest text-center mb-2 drop-shadow-[0_0_8px_rgba(0,255,0,0.5)]">
          DEV_ESCROW // VAULT
        </h1>
        <p className="text-neutral-500 text-xs text-center mb-8">AUTHENTICATION REQUIRED</p>

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <input
              type="email"
              placeholder="operator@system.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 text-green-400 text-sm px-4 py-2 rounded focus:outline-none focus:border-green-500 transition-colors"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold py-2 rounded transition-colors text-sm"
            >
              {loading ? 'TRANSMITTING...' : 'REQUEST ACCESS CODE'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full bg-neutral-900 border border-neutral-800 text-green-400 text-center text-2xl tracking-widest px-4 py-3 rounded focus:outline-none focus:border-green-500 transition-colors"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600/90 hover:bg-green-500 text-black font-bold py-2 rounded transition-colors text-sm shadow-[0_0_15px_rgba(0,255,0,0.3)] hover:shadow-[0_0_25px_rgba(0,255,0,0.5)]"
            >
              {loading ? 'VERIFYING...' : 'INITIALIZE LINK'}
            </button>
            <button
              type="button"
              onClick={() => { setStep(1); setMessage(''); setOtp(''); setIsError(false); }}
              className="w-full text-neutral-500 hover:text-neutral-300 text-xs mt-2"
            >
              ← Back to Email Input
            </button>
          </form>
        )}

        {step === 1 && (
          <>
            <div className="my-6 border-t border-neutral-800 relative">
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-2 text-xs text-neutral-600">OR</span>
            </div>
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-green-600/90 hover:bg-green-500 text-black font-bold py-2 rounded transition-colors text-sm shadow-[0_0_15px_rgba(0,255,0,0.3)] hover:shadow-[0_0_25px_rgba(0,255,0,0.5)]"
            >
              INITIALIZE NEURAL LINK (GOOGLE)
            </button>
          </>
        )}

        {message && (
          <p className={`mt-4 text-xs text-center ${isError ? 'text-red-400' : 'text-green-400'}`}>
            {message}
          </p>
        )}
      </motion.div>
    </div>
  );
}
