import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Activity, 
  ExternalLink, 
  Zap, 
  Terminal, 
  Search, 
  Layers, 
  Cpu, 
  Box,
  Hash,
  ArrowRight,
  Info
} from 'lucide-react';
import axios from 'axios';

// --- CONFIG ---
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1/signals';

// --- COMPONENTS ---

const Panel = ({ children, title, subtitle, className = "" }) => (
  <div className={`instrument-panel border-sharp flex flex-col ${className}`}>
    {(title || subtitle) && (
      <div className="px-4 py-2 border-b border-lab-border flex justify-between items-center bg-lab-bg/50">
        <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-lab-cyan uppercase">{title}</span>
        <span className="text-[9px] font-mono text-lab-border-focus uppercase">{subtitle}</span>
      </div>
    )}
    <div className="p-4 flex-1">
      {children}
    </div>
  </div>
);

const ReadoutValue = ({ label, value, color = "white" }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[8px] font-mono font-bold text-zinc-600 uppercase tracking-widest">{label}</span>
    <span className={`readout-value text-xs ${color === 'cyan' ? 'text-lab-cyan' : color === 'yellow' ? 'text-lab-yellow' : 'text-zinc-200'}`}>
      {value}
    </span>
  </div>
);

const JewelCard = ({ item }) => (
  <Panel 
    title="Structural Asset" 
    subtitle={`ID: ${item.hash?.slice(0, 8) || '0x000'}`}
    className="h-full group"
  >
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center border border-lab-yellow bg-lab-yellow/5 text-lab-yellow">
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold leading-tight text-white mb-0.5 tracking-tight group-hover:text-lab-cyan transition-technical">
            {item.title}
          </h3>
          <span className="text-[10px] font-mono text-zinc-500 italic block">PRECISION INVESTIGATION</span>
        </div>
      </div>
      <a href={item.link} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-lab-cyan transition-colors">
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>

    <div className="p-3 bg-zinc-900/30 border border-lab-border mb-6">
      <p className="text-xs text-zinc-400 font-mono leading-relaxed">
        {item.technical_significance}
      </p>
    </div>

    <div className="grid grid-cols-2 gap-y-4 border-t border-lab-border/50 pt-4">
      <ReadoutValue label="Pattern" value={item.architectural_pattern} />
      <ReadoutValue label="Entropy" value={`${(item.entropy_score * 100).toFixed(2)}%`} color="yellow" />
      <ReadoutValue label="Future Scope" value={item.future_scope} />
      <ReadoutValue label="Drift" value={item.semantic_drift || "NOMINAL"} color="cyan" />
    </div>
  </Panel>
);

const RawReadout = ({ item }) => (
  <div className="group flex items-center gap-4 py-2 px-4 border-b border-lab-border/30 hover:bg-lab-cyan/5 transition-colors">
    <div className="w-1.5 h-1.5 status-active" />
    <span className="text-[10px] font-mono text-zinc-600 w-24 shrink-0 uppercase tracking-tighter">
      [{new Date(item.captured_at).toLocaleTimeString([], { hour12: false })}]
    </span>
    <span className="text-[10px] font-mono text-lab-cyan w-32 shrink-0 truncate uppercase">
      {item.source}
    </span>
    <a 
      href={item.link} 
      target="_blank" 
      rel="noreferrer" 
      className="text-[11px] font-medium text-zinc-400 group-hover:text-white transition-colors truncate flex-1"
    >
      {item.title}
    </a>
    <ArrowRight className="w-3 h-3 text-zinc-800 group-hover:text-lab-cyan transition-colors" />
  </div>
);

export default function App() {
  const [view, setView] = useState('ANALYZE');
  const [jewels, setJewels] = useState([]);
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [jRes, rRes] = await Promise.all([
        axios.get(`${API_BASE}/jewels?limit=20`),
        axios.get(`${API_BASE}/raw?limit=50`)
      ]);
      setJewels(jRes.data);
      setRaw(rRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Link Failure:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-lab-bg selection:bg-lab-cyan/30">
      
      {/* Precision Header */}
      <header className="border-b border-lab-border bg-lab-bg sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto flex items-center h-12 px-4">
          <div className="flex items-center gap-3 border-r border-lab-border pr-6 h-full">
            <Shield className="w-4 h-4 text-lab-cyan" />
            <h1 className="text-xs font-black tracking-[0.4em] uppercase">Hawk <span className="text-zinc-700">LABS</span></h1>
          </div>

          <nav className="flex items-center h-full px-6 gap-8">
            {['ANALYZE', 'TELEMETRY'].map(tab => (
              <button
                key={tab}
                onClick={() => setView(tab)}
                className={`text-[10px] font-bold tracking-widest h-full border-b-2 transition-colors ${view === tab ? 'border-lab-cyan text-white' : 'border-transparent text-zinc-600 hover:text-zinc-300'}`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="ml-auto hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 status-active" />
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Engine: ACTIVE</span>
            </div>
            <div className="px-3 py-1 border border-lab-border bg-lab-surface">
              <span className="text-[9px] font-mono text-lab-cyan font-bold">{jewels.length + raw.length} SIGNALS</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full p-4 lg:p-8">
        
        {/* Dashboard Analytics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="border border-lab-border p-4 bg-lab-surface/50 translate-x-[1px]">
            <ReadoutValue label="Capturing Node" value="NORTH-AMERICA-01" color="cyan" />
          </div>
          <div className="border border-lab-border p-4 bg-lab-surface/50">
            <ReadoutValue label="Core Uptime" value="1,244:32:02" />
          </div>
          <div className="border border-lab-border p-4 bg-lab-surface/50">
            <ReadoutValue label="Signals Processed" value="45,920" color="yellow" />
          </div>
          <div className="border border-lab-border p-4 bg-lab-surface/50 -translate-x-[1px]">
            <ReadoutValue label="Agent Entropy" value="0.041" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {view === 'ANALYZE' ? (
            <motion.div 
              key="analyze"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-lab-border"
            >
              {jewels.map((j, i) => <JewelCard key={j.hash || i} item={j} />)}
              {jewels.length === 0 && (
                <div className="col-span-full bg-lab-surface flex flex-col items-center justify-center py-48 border border-lab-border">
                  <Cpu className="w-12 h-12 text-zinc-800 mb-6 animate-pulse" />
                  <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-[0.3em]">Synthesizing structural assets...</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="telemetry"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="border border-lab-border bg-lab-surface"
            >
              <div className="px-6 py-4 border-b border-lab-border bg-lab-bg/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Terminal className="w-4 h-4 text-lab-cyan" />
                  <h2 className="text-[10px] font-bold uppercase tracking-widest">Unfiltered Telemetry Stream</h2>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Buffer: 50/50</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-3 bg-lab-cyan/20" />
                    <div className="w-1 h-3 bg-lab-cyan" />
                    <div className="w-1 h-3 bg-lab-cyan/40" />
                  </div>
                </div>
              </div>
              <div className="overflow-y-auto max-h-[70vh]">
                {raw.map((r, i) => <RawReadout key={r.hash || i} item={r} />)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer System Status Bar */}
      <footer className="border-t border-lab-border bg-lab-bg/80 backdrop-blur-sm mt-auto">
        <div className="max-w-[1600px] mx-auto h-10 px-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest font-bold">© 2026 HAWK LABS</span>
            <div className="flex gap-1.5 opacity-30">
              {[...Array(6)].map((_, i) => <div key={i} className="w-1 h-1 bg-lab-cyan" />)}
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-mono text-zinc-600 uppercase">System Integrity:</span>
              <span className="text-[9px] font-mono text-lab-cyan">100%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-mono text-zinc-600 uppercase">Investigation Latency:</span>
              <span className="text-[9px] font-mono text-lab-yellow">12ms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
