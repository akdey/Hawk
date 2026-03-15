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

        </div>
      </nav>

      {/* Content-First Workspace */}
      <main className="max-w-[1600px] mx-auto w-full px-4 md:px-6 pt-6 flex-1 flex flex-col min-h-0 overflow-hidden">
        
        {/* Analysis Stream (Primary focus) */}
        <section className="flex-1 overflow-y-auto custom-scrollbar pb-6 pr-2">
          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-3">
            <div className="flex items-center gap-3">
              <Badge>Analysis_Stream</Badge>
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-[0.2em] font-mono">Forensic_Assets</h2>
            </div>
            <span className="text-[10px] font-mono text-zinc-700 font-bold">{jewels.length} SIGNALED OBJECTS</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {jewels.map((j, i) => <JewelCard key={j.hash || i} item={j} index={i} />)}
            {jewels.length === 0 && !loading && (
              <div className="col-span-full py-32 text-center border border-dashed border-white/5 rounded-3xl">
                <p className="text-zinc-700 font-mono text-[10px] uppercase tracking-widest font-bold">Scanning for high-signal architectural patterns...</p>
              </div>
            )}
          </div>
        </section>

        {/* System Console (Secondary telemetry) */}
        <section className="h-24 md:h-28 border-t border-white/[0.08] bg-black/40 px-4 flex flex-col shrink-0">
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Terminal className="w-3 h-3 text-studio-emerald/50" />
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Live_System_Log</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-50">
              <div className="w-1 h-1 rounded-full bg-studio-emerald animate-pulse" />
              <span className="text-[8px] font-mono text-zinc-700 font-bold uppercase">Streaming live forensics</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar-mini py-2 font-mono">
            {raw.map((r, i) => (
              <div key={r.hash || i} className="flex items-center gap-4 text-[10px] py-0.5 hover:bg-white/[0.02]">
                <span className="text-zinc-800 shrink-0">[{new Date(r.captured_at).toLocaleTimeString([], { hour12: false })}]</span>
                <span className="text-studio-emerald/40 shrink-0 uppercase tracking-tighter">@{r.source}</span>
                <a href={r.link} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-zinc-300 truncate transition-colors">
                  {r.title}
                  {r.local_summary && <span className="text-zinc-700 ml-2">&gt; {r.local_summary}</span>}
                </a>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Sticky Mini-Footer */}
      <footer className="h-10 border-t border-white/5 bg-zinc-950 px-6 flex items-center justify-between shrink-0 sticky bottom-0 z-50">
        <div className="flex items-center gap-4 text-[9px] font-mono text-zinc-700 uppercase tracking-widest font-bold">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3 h-3" />
            <span>Hawk.v4.07</span>
          </div>
          <div className="w-px h-3 bg-white/5" />
          <span>Architectural Forensics</span>
        </div>

        <div className="flex items-center gap-4 text-[9px] font-mono">
          <span className="text-zinc-800">DEV:</span>
          <a href="https://portfolio.akdey.vercel.app/" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-studio-emerald transition-all uppercase tracking-widest font-bold">
            Amit Kumar Dey
          </a>
        </div>
      </footer>
    </div>
  );
}
