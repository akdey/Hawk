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
  Globe, 
  Cpu, 
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react';
import axios from 'axios';

// --- CONFIG ---
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1/signals';

// --- COMPONENTS ---

const Card = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: delay * 0.1 }}
    className={`premium-card p-5 ${className}`}
  >
    {children}
  </motion.div>
);

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-white/5 text-zinc-400 border-white/10',
    brand: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border tracking-wide uppercase ${variants[variant]}`}>
      {children}
    </span>
  );
};

const JewelCard = ({ item, index }) => (
  <Card delay={index} className="flex flex-col h-full group">
    <div className="flex justify-between items-start mb-5">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-brand-primary/10 text-brand-primary">
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Signal Jewel</h4>
          <Badge variant="brand">{(item.entropy_score * 100).toFixed(0)}% Entropy</Badge>
        </div>
      </div>
      <a 
        href={item.link} 
        target="_blank" 
        rel="noreferrer" 
        className="p-2 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>

    <h3 className="text-lg font-bold leading-tight mb-3 text-balance group-hover:text-brand-primary transition-colors">
      {item.title}
    </h3>

    <div className="flex-1">
      <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-white/5 mb-5">
        <p className="text-sm text-zinc-400 leading-relaxed italic">
          "{item.technical_significance}"
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-[9px] uppercase text-zinc-600 font-bold block mb-1">Architecture</span>
          <span className="text-xs font-mono text-zinc-300">{item.architectural_pattern}</span>
        </div>
        <div>
          <span className="text-[9px] uppercase text-zinc-600 font-bold block mb-1">Evolution</span>
          <span className="text-xs text-zinc-400">{item.future_scope}</span>
        </div>
      </div>
    </div>

    {item.semantic_drift && (
      <div className="mt-5 pt-4 border-t border-white/5 flex items-center gap-2">
        <Activity className="w-3.5 h-3.5 text-brand-secondary" />
        <span className="text-[10px] text-brand-secondary font-mono tracking-tight">{item.semantic_drift}</span>
      </div>
    )}
  </Card>
);

const RawSignalCard = ({ item, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
    className="group flex items-start gap-4 p-4 rounded-xl border border-transparent hover:border-white/5 hover:bg-white/[0.02] transition-all"
  >
    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${item.source.includes('GitHub') ? 'bg-emerald-500' : 'bg-brand-primary'}`} />
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-mono text-zinc-500 uppercase">{item.source}</span>
        <span className="text-[10px] text-zinc-700">•</span>
        <span className="text-[10px] font-mono text-zinc-600">{new Date(item.captured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <a 
        href={item.link} 
        target="_blank" 
        rel="noreferrer" 
        className="block text-sm font-medium text-zinc-300 group-hover:text-white transition-colors truncate"
      >
        {item.title}
      </a>
    </div>
    <ExternalLink className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-500 self-center" />
  </motion.div>
);

// --- MAIN APP ---

export default function App() {
  const [view, setView] = useState('focused');
  const [jewels, setJewels] = useState([]);
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      console.error("Transmission failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-brand-primary/30">
      
      {/* Navigation */}
      <nav className="nav-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center shadow-lg shadow-brand-primary/20">
                <Shield className="text-white w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-black tracking-tighter uppercase">Hawk <span className="text-zinc-600">v1</span></h1>
              </div>
            </div>

            {/* Desktop Tabs */}
            <div className="hidden md:flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-white/5">
              <button 
                onClick={() => setView('focused')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${view === 'focused' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-white'}`}
              >
                <Layers className="w-3.5 h-3.5" /> Focused
              </button>
              <button 
                onClick={() => setView('all')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${view === 'all' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-white'}`}
              >
                <Terminal className="w-3.5 h-3.5" /> Raw Stream
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-2">
              <button 
                onClick={() => setView(view === 'focused' ? 'all' : 'focused')}
                className="p-2 rounded-lg bg-zinc-900 border border-white/5 text-zinc-400"
              >
                {view === 'focused' ? <Terminal className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-3 px-4 border-l border-white/5">
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 uppercase">
                  <span className="status-dot bg-emerald-500 animate-pulse" /> investigation live
                </span>
                <span className="text-zinc-800 text-sm">|</span>
                <span className="text-[10px] font-mono text-zinc-500">{jewels.length + raw.length} SIGNALS</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero / Header Area */}
      <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="brand">Autonomous Agent</Badge>
            <span className="text-zinc-700">•</span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Active Investigation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-balance">
            Technical forensics for modern architecture.
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-xl">
            Sifting through high-entropy noise to find the structural jewels that define the future of software construction.
          </p>
        </motion.div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <AnimatePresence mode="wait">
          {view === 'focused' ? (
            <motion.div 
              key="focused"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {jewels.map((j, i) => <JewelCard key={j.hash || i} item={j} index={i} />)}
              {jewels.length === 0 && !loading && (
                <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 rounded-3xl">
                  <Activity className="w-10 h-10 text-zinc-700 mx-auto mb-4 animate-pulse" />
                  <p className="text-zinc-500 font-medium italic">Scanning hyperspace for high-signal assets...</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="all"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-zinc-900 border border-white/5 text-zinc-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider">Raw Signal Stream</h3>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase">Unfiltered ingestion / Continuous scan</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-mono font-bold">{raw.length}</span>
                  <span className="text-[10px] font-mono text-zinc-600 uppercase block">Total Payloads</span>
                </div>
              </div>
              <div className="space-y-1">
                {raw.map((r, i) => <RawSignalCard key={r.hash || i} item={r} index={i} />)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-12 border-t border-white/5 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
                <Shield className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-tighter italic">Hawk Labs</span>
              </div>
              <div className="hidden sm:flex gap-4 border-l border-white/5 pl-6">
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-600 uppercase">
                  <Cpu className="w-3 h-3" /> Engine: SmolLM2
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-600 uppercase">
                  <Globe className="w-3 h-3" /> Network: Global
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-8 text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">
              <span className="hover:text-white transition-colors cursor-pointer">Docs</span>
              <span className="hover:text-white transition-colors cursor-pointer">API</span>
              <span className="hover:text-white transition-colors cursor-pointer">Privacy</span>
              <span className="text-zinc-800">|</span>
              <span className="text-zinc-600">© 2026</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
