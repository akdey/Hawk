import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Radio, Activity, ExternalLink, Zap, Terminal, Search, Layers } from 'lucide-react';
import axios from 'axios';

// --- CONFIG ---
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1/signals';

// --- COMPONENTS ---

const GlassCard = ({ children, className = '', glow = false }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5, scale: 1.01 }}
    className={`glass-panel glow-card p-6 rounded-2xl relative overflow-hidden ${className}`}
  >
    {glow && <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl -z-10" />}
    {children}
  </motion.div>
);

const JewelCard = ({ item }) => (
  <GlassCard className="border-l-4 border-l-yellow-400 group">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-400 shadow-yellow-400" />
        <span className="text-sm font-mono text-yellow-400 uppercase tracking-widest">Architectural Jewel</span>
      </div>
      <div className="flex items-center gap-3">
         <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono uppercase text-gray-400">
           Entropy: {(item.entropy_score * 100).toFixed(1)}%
         </span>
         <a href={item.link} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white transition-colors">
           <ExternalLink className="w-4 h-4" />
         </a>
      </div>
    </div>
    
    <h3 className="text-xl font-bold mb-3 group-hover:text-purple-400 transition-colors">{item.title}</h3>
    
    <div className="p-3 rounded-xl bg-black/40 border border-white/5 mb-4">
      <p className="text-sm text-gray-300 leading-relaxed italic">"{item.technical_significance}"</p>
    </div>

    <div className="grid grid-cols-2 gap-4 mt-4">
      <div className="space-y-1">
        <span className="text-[10px] uppercase text-gray-500 font-bold block">Pattern</span>
        <span className="text-xs font-mono text-purple-300">{item.architectural_pattern}</span>
      </div>
      <div className="space-y-1">
        <span className="text-[10px] uppercase text-gray-500 font-bold block">Future Scope</span>
        <span className="text-xs text-gray-400">{item.future_scope}</span>
      </div>
    </div>

    {item.semantic_drift && (
      <div className="mt-4 pt-4 border-t border-white/5 flex items-start gap-2">
        <Activity className="w-3 h-3 text-cyan-400 mt-1" />
        <span className="text-[10px] text-cyan-400 font-mono">{item.semantic_drift}</span>
      </div>
    )}
  </GlassCard>
);

const RawSignalCard = ({ item }) => (
  <motion.div 
    layout
    className="p-4 rounded-xl glass-panel group border border-white/5 hover:border-white/20 transition-all flex flex-col gap-2"
  >
    <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
      <span className="flex items-center gap-1">
        <Radio className="w-3 h-3 text-emerald-500" />
        {item.source}
      </span>
      <span>{new Date(item.captured_at).toLocaleTimeString()}</span>
    </div>
    <div className="flex justify-between items-start gap-4">
      <a href={item.link} target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors flex-1 line-clamp-2">
        {item.title}
      </a>
      <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-gray-400 shrink-0 mt-1" />
    </div>
  </motion.div>
);

// --- MAIN APP ---

export default function App() {
  const [view, setView] = useState('focused'); // 'focused' or 'all'
  const [jewels, setJewels] = useState([]);
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30s heart-beat
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
      console.error("Transmission failed:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col min-h-screen">
      
      {/* HUD Header */}
      <header className="flex justify-between items-center mb-16 border-b border-white/5 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-xl shadow-purple-500/20 liquid-border">
            <Shield className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter glow-text m-0">Hawk <span className="text-gray-600">v1</span></h1>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">Autonomous Technical Investigator</p>
          </div>
        </div>

        <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
          <button 
            onClick={() => setView('focused')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${view === 'focused' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'text-gray-400 hover:text-white'}`}
          >
            <Layers className="w-3 h-3" /> Focused
          </button>
          <button 
            onClick={() => setView('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${view === 'all' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Terminal className="w-3 h-3" /> Raw Stream
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {view === 'focused' ? (
            <motion.div 
              key="focused"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {jewels.map((j, i) => <JewelCard key={j.hash || i} item={j} />)}
              {jewels.length === 0 && (
                <div className="col-span-3 py-32 text-center border-2 border-dashed border-white/5 rounded-3xl">
                  <Activity className="w-12 h-12 text-gray-700 mx-auto mb-4 animate-pulse" />
                  <p className="text-gray-500 font-mono text-sm">Waiting for high-signal architectural alpha...</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="all"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-4 max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <Search className="w-4 h-4" />
                  <span className="text-xs font-mono">Continuous Scanning Payload</span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">COUNT: {raw.length}</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {raw.map((r, i) => <RawSignalCard key={r.hash || i} item={r} />)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer System Status */}
      <footer className="mt-20 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-gray-600 uppercase tracking-widest">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Agent: Online</span>
          <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Sieve: Active</span>
          <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Brain: Ready</span>
        </div>
        <span>© 2026 HAWK LABS // ARCHITECTURAL FORENSICS</span>
      </footer>

      {/* Background VFX */}
      <div className="fixed top-0 left-0 w-full h-full -z-50 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

    </div>
  );
}
