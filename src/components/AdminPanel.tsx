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
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const exportToPDF = (log: LogData) => {
    const doc = new jsPDF();
    const margin = 20;
    const lineHeight = 10;
    let cursorY = margin;

    // Header
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
    
    // Split text into multiple lines for PDF
    const splitCode = doc.splitTextToSize(log.code, 170);
    
    // Simple pagination logic
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 backdrop-blur-xl bg-black/60"
    >
      <div className="w-full max-w-6xl h-[90vh] bg-zinc-900 border border-white/10 rounded-2xl flex flex-col shadow-2xl overflow-hidden relative">
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        
        {/* Header */}
        <div className="relative px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Shield className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight uppercase italic">Administrative Dashboard</h2>
              <p className="text-[10px] text-white/30 uppercase tracking-widest">Sentinax secure_channel :: core_override</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
          {/* Sidebar: Log List */}
          <div className="w-full md:w-80 border-r border-white/5 flex flex-col bg-black/20">
            <div className="p-4 border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="text"
                  placeholder="SEARCH LOGS..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs focus:border-blue-500/50 outline-none transition-all placeholder:text-white/10 tracking-widest"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto terminal-scroll">
              {filteredLogs.map((log) => (
                <button
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`w-full text-left p-4 border-b border-white/5 transition-all hover:bg-white/5 flex flex-col gap-1 group active:bg-blue-500/10 ${
                    selectedLog?.id === log.id ? 'bg-blue-500/10 border-r-2 border-r-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono tracking-tight group-hover:text-blue-400 transition-colors uppercase">
                      {log.username}
                    </span>
                    <div className="flex items-center gap-1 text-[8px] text-white/30">
                      <Clock className="w-2.5 h-2.5" />
                      {log.createdAt?.toDate().toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-[10px] text-white/40 font-mono truncate tracking-tight">
                    UUID: {log.id.slice(0, 8)}...
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[9px] text-emerald-500/60 uppercase tracking-widest font-bold">Script_Saved</span>
                    <ChevronRight className="w-3 h-3 text-white/10 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
              {filteredLogs.length === 0 && (
                <div className="p-8 text-center text-white/20 text-xs tracking-widest uppercase">
                  No records found
                </div>
              )}
            </div>
          </div>

          {/* Main Content: Script Preview */}
          <div className="flex-1 bg-black/40 flex flex-col overflow-hidden">
            <AnimatePresence mode="wait">
              {selectedLog ? (
                <motion.div
                  key={selectedLog.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">Preview_Active</span>
                      <h3 className="text-sm font-mono text-blue-400">{selectedLog.username} / {selectedLog.id}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                       <button
                        onClick={() => handleCopy(selectedLog.code)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-md text-xs transition-all tracking-wide"
                      >
                        {copySuccess ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        {copySuccess ? 'COPIED!' : 'COPY'}
                      </button>
                      <button
                        onClick={() => exportToPDF(selectedLog)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-black font-bold rounded-md text-xs transition-all hover:bg-blue-400"
                      >
                        <Download className="w-4 h-4" />
                        EXPORT PDF
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-0 overflow-hidden flex flex-col bg-[#050505] selection:bg-blue-500/50">
                    <div className="px-6 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-black tracking-[0.2em] text-blue-500 uppercase">Original_Source_Code</span>
                      </div>
                      <button
                        onClick={() => handleCopy(selectedLog.code)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-black font-black rounded-lg text-[10px] transition-all transform active:scale-95 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                      >
                        {copySuccess ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copySuccess ? 'COPIED TO CLIPBOARD' : 'CLICK TO COPY ALL'}
                      </button>
                    </div>

                    <div className="flex-1 p-6 overflow-auto terminal-scroll custom-scrollbar">
                      <div className="relative group min-w-max">
                        {/* Line Numbers Simulation */}
                        <div className="absolute left-0 top-0 bottom-0 pr-4 border-r border-white/5 text-right text-white/10 font-mono text-[10px] select-none pointer-events-none hidden md:block">
                          {selectedLog.code.split('\n').map((_, i) => (
                            <div key={i}>{i + 1}</div>
                          ))}
                        </div>
                        
                        <pre className="md:pl-10 text-[13px] md:text-sm leading-6 font-mono text-blue-50 whitespace-pre">
                          <code>{selectedLog.code}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-6 py-3 border-t border-white/5 bg-white/[0.01] flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-white/30" />
                      <span className="text-[10px] text-white/40 uppercase tracking-widest">
                        Created {selectedLog.createdAt?.toDate().toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-white/30" />
                      <span className="text-[10px] text-white/40 uppercase tracking-widest">
                        {selectedLog.code.length} Characters
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-white/10 gap-4">
                  <div className="p-6 rounded-full bg-white/[0.02] border border-white/5">
                    <Users className="w-16 h-16 opacity-20" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-mono tracking-[0.3em] uppercase">Selection Required</p>
                    <p className="text-[10px] uppercase mt-2 opacity-50">Select a user log from the side panel to view telemetry</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
