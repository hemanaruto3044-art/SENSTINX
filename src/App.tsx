/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import TerminalUI from './components/TerminalUI';
import AdminPanel from './components/AdminPanel';
import { Shield, Zap, Lock, Unlock, Cpu, Network, Database, LogIn } from 'lucide-react';
import { auth } from './lib/firebase';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const tapTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogoTap = () => {
    setTapCount(prev => prev + 1);
    
    if (tapTimer.current) clearTimeout(tapTimer.current);
    
    tapTimer.current = setTimeout(() => {
      if (tapCount + 1 >= 3) {
        setIsAdminOpen(true);
      }
      setTapCount(0);
    }, 500);
  };

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-emerald-500/30 overflow-x-hidden font-sans">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation / Header */}
        <header className="px-6 py-8 md:px-12 md:py-12 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-6">
            {/* Platform Logo - Triple Tap Gateway */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogoTap}
              className="group relative cursor-pointer"
            >
              <div className="absolute -inset-2 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center rotate-3 shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-white/20">
                <Cpu className="w-8 h-8 text-black" strokeWidth={2.5} />
                
                {/* Micro Indicators for Taps */}
                <div className="absolute -bottom-1 -right-1 flex gap-0.5">
                   {[...Array(3)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1.5 h-1.5 rounded-full border border-white/20 ${i < tapCount ? 'bg-white' : 'bg-transparent'}`} 
                    />
                  ))}
                </div>
              </div>
            </motion.button>
            
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl font-black tracking-[-0.05em] italic uppercase">
                Sentinax <span className="text-emerald-500">AI</span>
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Precision Core</span>
                <div className="h-0.5 w-8 bg-emerald-500/20" />
                <span className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-[0.3em]">Live_Analysis</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-12">
            {user && (
              <button 
                onClick={() => signOut(auth)}
                className="text-[10px] uppercase font-bold tracking-widest text-white/40 hover:text-white transition-colors"
              >
                Sign Out ({user.email})
              </button>
            )}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest font-bold">
                <Network className="w-3 h-3" />
                Network_Load
              </div>
              <div className="text-sm font-mono text-white/80">0.042 ms / PING</div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center py-12 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight max-w-2xl mx-auto leading-[0.95] mb-6">
                Process Your Trading <span className="italic font-serif">Logic</span> At Scale.
              </h2>
              <p className="text-white/40 max-w-lg mx-auto text-sm md:text-base leading-relaxed tracking-wide">
                Sentinax AI consumes Pine Script architecture to provide deep pattern recognition and automated ARCHIVING for professional oversight.
              </p>
            </div>
            
            <TerminalUI />
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="px-12 py-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 bg-black/40">
          <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-white/20">
            <span>© 2026 Sentinax Tech Corp</span>
            <div className="w-1 h-1 bg-white/10 rounded-full" />
            <span>Encrypted Connection v2.10</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="bg-white/5 rounded-full px-4 py-1.5 flex items-center gap-2 border border-white/5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">System Operational</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/20 hover:text-white/40 transition-colors cursor-help">
              <Lock className="w-3.5 h-3.5" />
              <span className="text-[9px] font-bold uppercase tracking-widest">RSA_4096</span>
            </div>
          </div>
        </footer>

        {/* Admin Overlay */}
        <AnimatePresence>
          {isAdminOpen && (
            user ? (
               <AdminPanel onClose={() => setIsAdminOpen(false)} />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-2xl bg-black/80 p-6"
              >
                <div className="w-full max-w-md p-8 bg-zinc-900 border border-white/10 rounded-2xl flex flex-col items-center gap-6 text-center shadow-2xl">
                  <div className="p-4 bg-emerald-500/10 rounded-full">
                    <Shield className="w-12 h-12 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold uppercase tracking-widest italic">Secret Entry Authorized</h2>
                    <p className="text-sm text-white/40 mt-2 uppercase tracking-tighter">Please authenticate via Google to access the Administrative Core.</p>
                  </div>
                  <button
                    onClick={handleSignIn}
                    className="w-full flex items-center justify-center gap-4 py-4 bg-white text-black font-black uppercase tracking-widest rounded-lg hover:bg-zinc-200 transition-all active:scale-[0.98]"
                  >
                    <LogIn className="w-5 h-5" />
                    Connect via Google
                  </button>
                  <button
                    onClick={() => setIsAdminOpen(false)}
                    className="text-[10px] uppercase font-bold text-white/20 hover:text-white/40 transition-colors tracking-[0.3em]"
                  >
                    Cancel_Override
                  </button>
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
