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
  MousePointer2,
  Fingerprint,
  Radio,
  Clock,
  Command,
  ArrowUpRight
} from 'lucide-react';
import axios from 'axios';

// --- CONFIG ---
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1/signals';

// --- COMPONENTS ---

const GlassCard = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ 
      duration: 0.2, 
      delay: delay * 0.02, 
      ease: "easeOut" 
    }}
    className={`glass-card p-6 ${className}`}
  >
    {children}
  </motion.div>
);

const Badge = ({ children }) => (
  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-studio-emerald/10 text-studio-emerald border border-studio-emerald/20">
    {children}
  </span>
);

const Indicator = ({ label, value, icon: Icon, color = "emerald" }) => (
  <div className="flex items-center gap-3">
    <div className={`p-2 rounded-lg bg-zinc-900 border border-white/5 ${color === 'emerald' ? 'text-studio-emerald' : 'text-zinc-500'}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none mb-1.5">{label}</p>
      <p className="text-sm font-mono font-medium text-white leading-none">{value}</p>
    </div>
  </div>
);

const JewelCard = ({ item, index }) => (
  <GlassCard delay={index} className="flex flex-col h-full">
    <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
      <div className="flex flex-col">
        <h3 className="text-base font-bold text-white tracking-tight leading-tight">
          {item.title}
        </h3>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] font-mono text-studio-emerald uppercase tracking-wider">HASH:</span>
          <span className="text-[10px] font-mono text-zinc-500">{item.hash?.slice(0, 12)}</span>
        </div>
      </div>
      <a 
        href={item.link} 
        target="_blank" 
        rel="noreferrer" 
        className="p-2 rounded-lg bg-zinc-900/50 hover:bg-studio-emerald/10 text-zinc-500 hover:text-studio-emerald transition-all"
      >
        <ArrowUpRight className="w-4 h-4" />
      </a>
    </div>

    <div className="flex-1 space-y-6">
      <div className="p-4 rounded-xl bg-zinc-950/60 border border-white/5">
        <p className="text-sm text-zinc-300 leading-relaxed">
          {item.technical_significance}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-y-4 text-xs font-mono">
        <div>
          <span className="text-[9px] uppercase text-zinc-600 font-bold tracking-widest block mb-1">Architecture</span>
          <span className="text-zinc-300">{item.architectural_pattern}</span>
        </div>
        <div>
          <span className="text-[9px] uppercase text-zinc-600 font-bold tracking-widest block mb-1">Entropy</span>
          <span className="text-studio-emerald">{(item.entropy_score * 100).toFixed(1)}%</span>
        </div>
        <div>
          <span className="text-[9px] uppercase text-zinc-600 font-bold tracking-widest block mb-1">Semantic Drift</span>
          <span className="text-zinc-500">{item.semantic_drift || '0.00'}</span>
        </div>
        <div>
          <span className="text-[9px] uppercase text-zinc-600 font-bold tracking-widest block mb-1">Target Scope</span>
          <span className="text-zinc-400 truncate">{item.future_scope}</span>
        </div>
      </div>
    </div>
  </GlassCard>
);

const RawRow = ({ item, index }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.1, delay: index * 0.01 }}
    className="group flex items-center gap-6 py-3 px-6 border-b border-white/[0.03] hover:bg-studio-emerald/[0.03] transition-colors"
  >
    <div className="w-1.5 h-1.5 rounded-full bg-studio-emerald/60 shrink-0" />
    <span className="text-[11px] font-mono text-zinc-600 w-20 shrink-0">
      {new Date(item.captured_at).toLocaleTimeString([], { hour12: false })}
    </span>
    <span className="text-[11px] font-mono text-zinc-500 w-32 shrink-0 truncate uppercase tracking-widest">
      {item.source}
    </span>
    <a 
      href={item.link} 
      target="_blank" 
      rel="noreferrer" 
      className="text-[13px] font-medium text-zinc-300 hover:text-white transition-colors truncate flex-1"
    >
      {item.title}
      <span className="block text-[10px] text-zinc-600 font-mono mt-0.5">
        {item.local_summary}
      </span>
    </a>
    <ExternalLink className="w-3.5 h-3.5 text-zinc-800" />
  </motion.div>
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
      console.error("System Drift:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-studio-bg selection:bg-studio-emerald/20 pb-20 md:pb-0">
      
      {/* Utility-Focused Nav */}
      <nav className="glass-nav px-4 md:px-6">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-studio-emerald flex items-center justify-center">
              <Shield className="text-black w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white uppercase leading-none">Hawk</h1>
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mt-1">Forensic Agent</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 bg-zinc-950/50 p-1 rounded-lg border border-white/5">
            {['ANALYZE', 'TELEMETRY'].map(tab => (
              <button
                key={tab}
                onClick={() => setView(tab)}
                className={`px-6 py-1.5 rounded-md text-[10px] font-bold tracking-widest transition-all ${view === tab ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-6 px-6 border-l border-white/5">
              <Indicator label="Status" value="LIVE" icon={Radio} />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-8 md:py-12 flex-1">
        
        {/* Simplified Header */}
        <div className="mb-12">
          <GlassCard className="!p-6 md:!p-10 border-studio-emerald/10 bg-zinc-900/20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex-1">
                <Badge>AUTONOMOUS_FORENSICS</Badge>
                <h2 className="text-3xl font-extrabold text-white mt-4 tracking-tight uppercase">Signals Hub</h2>
                <p className="text-zinc-500 mt-2 text-sm leading-relaxed max-w-2xl font-medium">
                  Continuous architectural pattern recognition and entropy analysis across all forensic streams.
                </p>
              </div>
              <div className="flex flex-row gap-12 items-center bg-black/40 px-8 py-6 rounded-2xl border border-white/5">
                <div className="flex flex-col">
                  <span className="text-2xl font-mono font-bold text-studio-emerald">{jewels.length}</span>
                  <span className="text-[9px] font-mono text-zinc-600 uppercase font-bold">ASSETS</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-mono font-bold text-white">{raw.length}</span>
                  <span className="text-[9px] font-mono text-zinc-600 uppercase font-bold">PAYLOADS</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Responsive Feed */}
        <AnimatePresence mode="wait">
          {view === 'ANALYZE' ? (
            <motion.div 
              key="analyze"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
            >
              {jewels.map((j, i) => <JewelCard key={j.hash || i} item={j} index={i} />)}
            </motion.div>
          ) : (
            <motion.div 
              key="telemetry"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="glass-card !p-0 overflow-hidden border-white/[0.06]"
            >
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between bg-zinc-900/40">
                <div className="flex items-center gap-3">
                  <Terminal className="w-4 h-4 text-studio-emerald" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white font-mono">Telemetry.log</h3>
                </div>
                <Badge>REALTIME_STREAM</Badge>
              </div>
              <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                {raw.map((r, i) => <RawRow key={r.hash || i} item={r} index={i} />)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Nav Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden p-4">
        <div className="glass-card !bg-black/95 !p-1.5 flex items-center justify-around border-white/10 shadow-2xl">
          {[
            { id: 'ANALYZE', icon: Search, label: 'Analyze' },
            { id: 'TELEMETRY', icon: Activity, label: 'Live' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`flex flex-col items-center gap-1 px-8 py-2 rounded-lg transition-all ${view === tab.id ? 'bg-studio-emerald text-black' : 'text-zinc-500'}`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-[9px] font-bold uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <footer className="mt-12 border-t border-white/5 py-12 bg-zinc-950/20 mb-20 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-zinc-700" />
              <span className="text-xs font-bold text-white tracking-widest uppercase font-mono">Hawk.v4</span>
            </div>

            <div className="flex items-center gap-8 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
              <div className="flex items-center gap-2 group">
                <span className="font-mono text-zinc-800 px-2 py-0.5 border border-white/5 rounded">DEV</span>
                <a 
                  href="https://portfolio.akdey.vercel.app/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-white hover:text-studio-emerald transition-all"
                >
                  Amit Kumar Dey
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/[0.03] flex justify-center text-[9px] font-mono text-zinc-800 uppercase tracking-[0.2em]">
            <span>© 2026 ARCHITECTURAL_FORENSICS_LABS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
