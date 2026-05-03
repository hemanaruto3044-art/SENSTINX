import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { Users, FileText, Copy, Download, X, Search, Clock, ChevronRight, Shield, Check } from 'lucide-react';
import jsPDF from 'jspdf';

interface LogData {
  id: string;
  username: string;
  code: string;
  createdAt: Timestamp;
}

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const [logs, setLogs] = useState<LogData[]>([]);
  const [selectedLog, setSelectedLog] = useState<LogData | null>(null);
  const [search, setSearch] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'logs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LogData[];
      setLogs(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'logs');
    });

    return () => unsubscribe();
  }, []);

  const handleCopy = (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const exportToPDF = (log: LogData) => {
    const doc = new jsPDF();
    const margin = 20;
    const lineHeight = 10;
    let cursorY = margin;

    doc.setFontSize(18);
    doc.text('Sentinax AI - Script Report', margin, cursorY);
    cursorY += lineHeight * 2;

    doc.setFontSize(12);
    doc.text(`User: ${log.username}`, margin, cursorY);
    cursorY += lineHeight;
    doc.text(`Date: ${log.createdAt?.toDate().toLocaleString() || 'N/A'}`, margin, cursorY);
    cursorY += lineHeight * 1.5;

    doc.setFontSize(14);
    doc.text('Pine Script Code:', margin, cursorY);
    cursorY += lineHeight;

    doc.setFontSize(10);
    doc.setFont('courier', 'normal');
    
    const splitCode = doc.splitTextToSize(log.code, 170);
    
    splitCode.forEach((line: string) => {
      if (cursorY > 280) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(line, margin, cursorY);
      cursorY += 5;
    });

    doc.save(`sentinax_script_${log.username}_${log.id.slice(0, 5)}.pdf`);
  };

  const filteredLogs = logs.filter(log => 
    log.username.toLowerCase().includes(search.toLowerCase()) || 
    log.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-8 backdrop-blur-xl bg-black/90"
    >
      <div className="w-full md:w-[95%] max-w-6xl h-full md:h-[90vh] bg-[#080808] border-none md:border md:border-white/10 md:rounded-2xl flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="relative px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black">
          <div className="flex items-center gap-3">
            {selectedLog && (
              <button 
                onClick={() => setSelectedLog(null)}
                className="md:hidden p-2 -ml-2 bg-white/5 rounded-lg text-white/60"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <div>
                <h2 className="text-sm font-black tracking-widest uppercase italic">Admin_Core</h2>
                <p className="text-[8px] text-white/20 uppercase tracking-[0.2em] hidden sm:block">Secure Session Active</p>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar: Log List - Hidden on mobile when a log is selected */}
          <div className={`${selectedLog ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-white/10 flex-col bg-black/40`}>
            <div className="p-4 border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="text"
                  placeholder="SEARCH_LOGS..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-[10px] focus:border-blue-500/50 outline-none transition-all placeholder:text-white/10 tracking-widest font-mono"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto terminal-scroll">
              {filteredLogs.map((log) => (
                <button
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`w-full text-left p-4 border-b border-white/5 transition-all flex flex-col gap-1 group relative ${
                    selectedLog?.id === log.id ? 'bg-blue-500/10' : 'hover:bg-white/5'
                  }`}
                >
                  {selectedLog?.id === log.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                  )}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black font-mono tracking-tight transition-colors uppercase ${
                      selectedLog?.id === log.id ? 'text-blue-400' : 'text-white/80'
                    }`}>
                      {log.username}
                    </span>
                    <span className="text-[8px] text-white/20 font-mono">
                      {log.createdAt?.toDate().toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-[9px] text-white/30 font-mono truncate">
                    ID: {log.id.slice(0, 12)}...
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content: Script Preview - Shown only when selected or on desktop */}
          <div className={`${!selectedLog ? 'hidden md:flex' : 'flex'} flex-1 bg-black flex flex-col overflow-hidden`}>
            <AnimatePresence mode="wait">
              {selectedLog ? (
                <motion.div
                  key={selectedLog.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  {/* Action Bar */}
                  <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex flex-col sm:flex-row items-center gap-3 justify-between">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-white/30 uppercase font-bold tracking-widest leading-none mb-1">Source_Capture</span>
                        <h3 className="text-[11px] font-mono text-white leading-none">{selectedLog.username}</h3>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleCopy(selectedLog.code)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-lg text-[10px] transition-all transform active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                      >
                        {copySuccess ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copySuccess ? 'COPIED' : 'COPY_ALL_CODE'}
                      </button>
                      <button
                        onClick={() => exportToPDF(selectedLog)}
                        className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 transition-all border border-white/10"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Code Area */}
                  <div className="flex-1 overflow-auto bg-[#020202] terminal-scroll p-4 md:p-8">
                    <div className="relative">
                      <pre className="text-xs md:text-sm font-mono text-zinc-100 whitespace-pre-wrap leading-relaxed tracking-tight selection:bg-emerald-500/40">
                        <code>{selectedLog.code}</code>
                      </pre>
                    </div>
                  </div>

                  <div className="p-4 border-t border-white/10 bg-black flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <span className="text-[9px] text-white/20 font-mono tracking-widest uppercase">
                        TIMESTAMP: {selectedLog.createdAt?.toDate().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-white/10 gap-4">
                  <Users className="w-12 h-12 opacity-10" />
                  <p className="text-[10px] font-black tracking-[0.4em] uppercase opacity-30">Waiting for selection</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
