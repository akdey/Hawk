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
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ 
      duration: 0.8, 
      delay: delay * 0.05, 
      ease: [0.16, 1, 0.3, 1] 
    }}
    className={`glass-card p-6 ${className}`}
  >
    {children}
  </motion.div>
);

const Badge = ({ children, glow = false }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-studio-emerald/10 text-studio-emerald border border-studio-emerald/20 ${glow ? 'shadow-[0_0_12px_rgba(16,185,129,0.15)]' : ''}`}>
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
  <GlassCard delay={index} className="flex flex-col h-full group">
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-studio-emerald/5 border border-studio-emerald/10 flex items-center justify-center text-studio-emerald group-hover:bg-studio-emerald/10 group-hover:scale-110 transition-all duration-500">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white tracking-tight leading-tight group-hover:text-studio-emerald transition-colors duration-300">
            {item.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">STRUCTURAL ASSET</span>
            <span className="w-1 h-1 rounded-full bg-zinc-800" />
            <span className="text-[10px] font-mono text-zinc-600 truncate max-w-[80px]">{item.hash?.slice(0, 10)}</span>
          </div>
        </div>
      </div>
      <a 
        href={item.link} 
        target="_blank" 
        rel="noreferrer" 
        className="p-2 rounded-lg hover:bg-white/5 text-zinc-600 hover:text-white transition-all"
      >
        <ArrowUpRight className="w-4 h-4" />
      </a>
    </div>

    <div className="flex-1">
      <div className="relative p-4 rounded-xl bg-zinc-950/40 border border-white/5 mb-6 group-hover:border-studio-emerald/10 transition-colors">
        <div className="absolute top-3 right-3 opacity-20 group-hover:opacity-40 transition-opacity">
          <Fingerprint className="w-4 h-4 text-studio-emerald" />
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed italic">
          "{item.technical_significance}"
        </p>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-5">
        <div>
          <span className="text-[10px] uppercase text-zinc-600 font-bold tracking-widest block mb-1.5">Pattern</span>
          <span className="text-xs font-mono text-zinc-300 bg-zinc-900/50 px-2 py-0.5 rounded border border-white/5">{item.architectural_pattern}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase text-zinc-600 font-bold tracking-widest block mb-1.5">Entropy</span>
          <span className="text-xs font-mono text-studio-emerald font-bold">{(item.entropy_score * 100).toFixed(1)}%</span>
        </div>
        <div>
          <span className="text-[10px] uppercase text-zinc-600 font-bold tracking-widest block mb-1.5">Scope</span>
          <span className="text-xs text-zinc-400 line-clamp-1">{item.future_scope}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase text-zinc-600 font-bold tracking-widest block mb-1.5">Drift</span>
          <span className="text-[10px] font-mono text-zinc-500 italic uppercase">{item.semantic_drift || 'Stable'}</span>
        </div>
      </div>
    </div>
  </GlassCard>
);

const RawRow = ({ item, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.02 }}
    className="group flex items-center gap-6 py-3.5 px-6 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
  >
    <div className="w-1.5 h-1.5 rounded-full bg-studio-emerald shrink-0 group-hover:animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
    <span className="text-[11px] font-mono text-zinc-600 w-20 shrink-0">
      {new Date(item.captured_at).toLocaleTimeString([], { hour12: false })}
    </span>
    <span className="text-[11px] font-mono text-studio-emerald/60 w-32 shrink-0 truncate uppercase font-bold tracking-tighter">
      {item.source}
    </span>
    <a 
      href={item.link} 
      target="_blank" 
      rel="noreferrer" 
      className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors truncate flex-1"
    >
      {item.title}
      {item.local_summary && (
        <span className="block text-[10px] text-zinc-500 font-mono mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          &gt; {item.local_summary}
        </span>
      )}
    </a>
    <ExternalLink className="w-3.5 h-3.5 text-zinc-800 group-hover:text-zinc-500 transition-colors" />
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
    <div className="min-h-screen flex flex-col bg-studio-bg selection:bg-studio-emerald/20">
      
      {/* Refined Floating Header */}
      <nav className="glass-nav px-6">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-studio-emerald flex items-center justify-center shadow-lg shadow-studio-emerald/20">
              <Shield className="text-black w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white uppercase leading-none">Hawk</h1>
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mt-1">Forensic Agent</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-zinc-950/50 p-1 rounded-xl border border-white/5">
            {['ANALYZE', 'TELEMETRY'].map(tab => (
              <button
                key={tab}
                onClick={() => setView(tab)}
                className={`px-6 py-1.5 rounded-lg text-xs font-bold transition-all ${view === tab ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-6 px-6 border-l border-white/5">
              <Indicator label="Live Stream" value="CONNECTED" icon={Radio} />
              <Indicator label="Entropy Engine" value="STRIATED" icon={Cpu} />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-6 py-12 flex-1">
        
        {/* Systems Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <GlassCard className="md:col-span-2 !p-8 bg-gradient-to-br from-zinc-900/40 to-transparent">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <Badge glow>Autonomous Scan Active</Badge>
                <h2 className="text-3xl font-extrabold text-white mt-4 tracking-tight">Technical Forensics</h2>
                <p className="text-zinc-400 mt-2 text-base leading-relaxed max-w-md">
                  Sifting through high-entropy noise to identify architectural patterns and structural drift.
                </p>
              </div>
              <div className="flex flex-col gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-mono font-bold text-studio-emerald">{jewels.length}</span>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider leading-tight">High-Signal<br/>Assets</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-mono font-bold text-white">{raw.length}</span>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider leading-tight">Telemetry<br/>Payloads</span>
                </div>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="bg-studio-emerald/5 border-studio-emerald/20 flex flex-col justify-center gap-8 !p-8 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-5">
              <Shield className="w-32 h-32 text-studio-emerald" />
            </div>
            <Indicator label="Global Nodes" value="08 ACTIVE" icon={Layers} color="emerald" />
            <Indicator label="Avg Latency" value="124ms" icon={Clock} color="zinc" />
            <Indicator label="Agent Speed" value="4.2s/scan" icon={MousePointer2} color="zinc" />
          </GlassCard>
        </div>

        {/* Dynamic Viewport */}
        <AnimatePresence mode="wait">
          {view === 'ANALYZE' ? (
            <motion.div 
              key="analyze"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {jewels.map((j, i) => <JewelCard key={j.hash || i} item={j} index={i} />)}
              {jewels.length === 0 && !loading && (
                <div className="col-span-full py-32 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto mb-6">
                    <Activity className="w-6 h-6 text-zinc-700 animate-pulse" />
                  </div>
                  <p className="text-zinc-500 font-medium italic">Scanning technical horizons...</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="telemetry"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card !p-0 overflow-hidden border-white/[0.06]"
            >
              <div className="px-8 py-5 border-b border-white/[0.06] flex items-center justify-between bg-zinc-900/20">
                <div className="flex items-center gap-3">
                  <Terminal className="w-4 h-4 text-studio-emerald" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white">Live Payload Stream</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-2 py-0.5 rounded-md bg-zinc-900 border border-white/5 text-[9px] font-mono text-zinc-500 uppercase">
                    BUFFER: 100%
                  </div>
                </div>
              </div>
              <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                {raw.map((r, i) => <RawRow key={r.hash || i} item={r} index={i} />)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Sophisticated Minimalist Footer */}
      <footer className="mt-24 border-t border-white/5 py-12 bg-zinc-950/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-zinc-500" />
                </div>
                <span className="text-xs font-bold text-white tracking-widest uppercase">Hawk Forensics</span>
              </div>
              <p className="text-[11px] text-zinc-600 max-w-xs leading-relaxed uppercase tracking-tighter">
                IDENTIFYING HIGH-SIGNAL ARCHITECTURAL PATTERNS THROUGH AUTONOMOUS INVESTIGATION.
              </p>
            </div>

            <div className="flex items-center gap-12 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              <a href="#" className="hover:text-studio-emerald transition-colors">Documentation</a>
              <a href="#" className="hover:text-studio-emerald transition-colors">Forensic API</a>
              <div className="h-4 w-px bg-white/5 hidden md:block" />
              <div className="flex items-center gap-2 group">
                <span className="text-zinc-700">Developed by</span>
                <a 
                  href="https://portfolio.akdey.vercel.app/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-white hover:text-studio-emerald transition-all flex items-center gap-1.5"
                >
                  Amit Kumar Dey
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/[0.03] flex justify-between items-center text-[9px] font-mono text-zinc-700 uppercase tracking-widest">
            <span>© 2026 HAWK LABS • ALL RIGHTS RESERVED</span>
            <div className="flex gap-4">
              <span>SYSTEM: OPTIMAL</span>
              <span>VER: 4.0.2</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
