import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  ArrowLeft,
  ExternalLink, 
  ArrowRight,
  ChevronRight,
  Globe,
  Lock,
  Search,
  Zap,
  Radio
} from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1/signals';

export default function App() {
  const [activeTab, setActiveTab] = useState('JEWELS'); // JEWELS | RAW
  const [jewels, setJewels] = useState([]);
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSignal, setSelectedSignal] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [jRes, rRes] = await Promise.all([
        axios.get(`${API_BASE}/jewels?limit=30`),
        axios.get(`${API_BASE}/raw?limit=50`)
      ]);
      setJewels(jRes.data);
      setRaw(rRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Link failure:", err);
    }
  };

  const signals = activeTab === 'JEWELS' ? jewels : raw;

  return (
    <div className="min-h-screen bg-noir text-blanc font-mono selection:bg-coral/30 flex flex-col">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-50 liquid-glass border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Hawk" className="w-10 h-10 object-contain" />
          <h1 className="text-xl font-black tracking-tighter uppercase leading-none">Hawk</h1>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest">
          {['JEWELS', 'RAW'].map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedSignal(null); }}
              className={`pb-1 border-b-2 transition-all ${activeTab === tab ? 'border-coral text-coral' : 'border-transparent text-zinc-500 hover:text-white'}`}
            >
              {tab === 'JEWELS' ? 'Audit_Jewels' : 'Raw_Feed'}
            </button>
          ))}
        </nav>

        <div className="md:hidden flex items-center gap-4">
          <nav className="flex items-center gap-6 text-[9px] font-black uppercase tracking-widest">
            {['JEWELS', 'RAW'].map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSelectedSignal(null); }}
                className={`${activeTab === tab ? 'text-coral' : 'text-zinc-500'}`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 pt-12 pb-24">
        <AnimatePresence mode="wait">
          {!selectedSignal ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Newsletter List */}
              <div className="space-y-4">
                {signals.map((signal, i) => (
                  <motion.div
                    key={signal.hash || i}
                    onClick={() => setSelectedSignal(signal)}
                    className="signal-card group"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-[9px] text-coral font-black uppercase tracking-[0.2em]">
                        {signal.source || 'Unknown'}
                      </span>
                      <span className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest">
                        {new Date(signal.captured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-start gap-6">
                      <h3 className="text-xl md:text-2xl font-black text-white group-hover:text-coral transition-colors flex-1 leading-tight uppercase tracking-tighter italic">
                        {signal.title}
                      </h3>
                      <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center group-hover:border-coral/30 group-hover:bg-coral/5 transition-all">
                        <ChevronRight className="w-4 h-4 text-zinc-800 group-hover:text-coral transform transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>

                    {(activeTab === 'JEWELS' ? signal.technical_significance : (signal.local_summary || signal.gist)) && (
                      <p className="mt-4 text-zinc-400 text-sm font-typewriter leading-relaxed max-w-3xl border-l border-white/10 pl-6">
                        {activeTab === 'JEWELS' ? signal.technical_significance : (signal.local_summary || signal.gist)}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="liquid-glass p-8 md:p-16"
            >
              <button 
                onClick={() => setSelectedSignal(null)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-coral transition-colors mb-16"
              >
                <ArrowLeft className="w-4 h-4" />
                Return_To_Stream
              </button>

              <div className="space-y-12">
                <header>
                  <div className="flex items-center gap-4 mb-6">
                    <span className="meta-tag">{selectedSignal.source}</span>
                    <span className="text-[10px] text-zinc-600 font-bold">
                      {new Date(selectedSignal.captured_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-6xl font-black uppercase tracking-tighter leading-none text-white mb-10 italic">
                    {selectedSignal.title}
                  </h1>
                  <a 
                    href={selectedSignal.link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn-primary"
                  >
                    View_Source
                    <ArrowRight className="ml-2 w-4 h-4 inline-block" />
                  </a>
                </header>

                <div className="prose prose-invert max-w-none">
                  <div className="space-y-10">
                    <section>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-coral mb-6">Brief_Summary</h4>
                      <p className="text-xl text-zinc-300 font-typewriter leading-relaxed border-l-4 border-coral pl-8">
                        {activeTab === 'JEWELS' ? selectedSignal.technical_significance : (selectedSignal.local_summary || selectedSignal.gist)}
                      </p>
                    </section>

                    {activeTab === 'JEWELS' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-white/10">
                        <section>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-4 font-mono">Pattern</h4>
                          <p className="text-zinc-400 font-typewriter text-lg">{selectedSignal.architectural_pattern}</p>
                        </section>
                        <section>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-4 font-mono">Entropy</h4>
                          <p className="text-coral font-black text-4xl">{(selectedSignal.entropy_score * 100).toFixed(2)}%</p>
                        </section>
                        <section className="md:col-span-2">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-4 font-mono">Scope</h4>
                          <p className="text-zinc-400 font-typewriter text-lg leading-relaxed">{selectedSignal.future_scope}</p>
                        </section>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-16 px-6 border-t border-white/5 bg-black mt-24">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-4 grayscale opacity-50">
            <img src="/logo.png" alt="Hawk" className="w-6 h-6 object-contain" />
            <span className="text-[10px] font-black text-zinc-700 tracking-[0.5em] uppercase">Hawk_v4</span>
          </div>
          <p className="text-[9px] text-zinc-800 uppercase font-black tracking-widest">
            Developed by Amit Kumar Dey / <a href="https://portfolio.akdey.vercel.app/" target="_blank" rel="noreferrer" className="text-zinc-700 hover:text-coral transition-colors underline decoration-coral/20">Portfolio</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
