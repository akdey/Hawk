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
          <div className="w-10 h-10 coral-gradient flex items-center justify-center">
            <Shield className="text-black w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter uppercase leading-none">Hawk Agent</h1>
            <p className="text-[10px] text-coral font-bold uppercase tracking-[0.3em] mt-1">Forensic_Audit_Portal</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest">
          {['JEWELS', 'RAW'].map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedSignal(null); }}
              className={`pb-1 border-b-2 transition-all ${activeTab === tab ? 'border-coral text-coral' : 'border-transparent text-zinc-500 hover:text-white'}`}
            >
              {tab === 'JEWELS' ? 'Validated_Jewels' : 'Raw_Observations'}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${loading ? 'bg-zinc-800' : 'bg-coral animate-pulse'}`} />
          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Live</span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 pt-12 pb-24">
        <AnimatePresence mode="wait">
          {!selectedSignal ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="mb-12">
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-6">
                  {activeTab === 'JEWELS' ? 'Validated\nFindings' : 'Observation\nStream'}
                </h2>
                <p className="text-zinc-500 text-sm max-w-xl font-typewriter leading-relaxed">
                  {activeTab === 'JEWELS' 
                    ? "Audited architectural shifts and verified high-signal signals curated by the Hawk analytical engine."
                    : "Unfiltered data telemetry from the frontline. Raw inputs captured across all forensic sensors."}
                </p>
              </div>

              {/* Newsletter List */}
              <div className="divide-y divide-white/5 border-t border-white/5">
                {signals.map((signal, i) => (
                  <motion.div
                    key={signal.hash || i}
                    onClick={() => setSelectedSignal(signal)}
                    className="signal-row group"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-[10px] text-zinc-600 font-bold">{String(i + 1).padStart(2, '0')}</span>
                      <span className="text-[10px] text-coral font-bold uppercase tracking-widest">
                        {signal.source || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between items-end gap-6">
                      <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-coral transition-colors flex-1 line-clamp-2">
                        {signal.title}
                      </h3>
                      <ChevronRight className="w-5 h-5 text-zinc-800 group-hover:text-coral transform transition-transform group-hover:translate-x-1" />
                    </div>
                    {(activeTab === 'JEWELS' ? signal.technical_significance : (signal.local_summary || signal.gist)) && (
                      <p className="mt-4 text-zinc-500 text-sm font-typewriter line-clamp-2 max-w-2xl">
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
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white/[0.02] border border-white/5 p-8 md:p-12 rounded-sm"
            >
              <button 
                onClick={() => setSelectedSignal(null)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-coral transition-colors mb-12"
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
                  <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-tight text-white mb-8 italic italic-coral">
                    {selectedSignal.title}
                  </h1>
                  <a 
                    href={selectedSignal.link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-coral text-noir font-black uppercase tracking-widest text-xs hover:bg-white transition-all transform hover:-translate-y-1 active:translate-y-0"
                  >
                    View_Source_Asset
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </header>

                <div className="prose prose-invert max-w-none">
                  <div className="space-y-8">
                    <section>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-coral mb-4">Final_Analysis_Summary</h4>
                      <p className="text-lg text-zinc-300 font-typewriter leading-relaxed border-l-2 border-coral pl-6">
                        {activeTab === 'JEWELS' ? selectedSignal.technical_significance : (selectedSignal.local_summary || selectedSignal.gist)}
                      </p>
                    </section>

                    {activeTab === 'JEWELS' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-white/5">
                        <section>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">Architectural_Pattern</h4>
                          <p className="text-zinc-400 font-typewriter">{selectedSignal.architectural_pattern}</p>
                        </section>
                        <section>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">Entropy_Score</h4>
                          <p className="text-coral font-black text-2xl">{(selectedSignal.entropy_score * 100).toFixed(2)}%</p>
                        </section>
                        <section>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">Future_Scope</h4>
                          <p className="text-zinc-400 font-typewriter">{selectedSignal.future_scope}</p>
                        </section>
                        <section>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">Signal_Hash</h4>
                          <p className="text-zinc-600 font-mono text-[10px] truncate">{selectedSignal.hash}</p>
                        </section>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 liquid-glass border-t border-white/10 px-6 py-4 flex justify-around">
        {['JEWELS', 'RAW'].map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSelectedSignal(null); }}
            className={`text-[10px] font-black uppercase tracking-widest ${activeTab === tab ? 'text-coral' : 'text-zinc-500'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <footer className="py-12 px-6 border-t border-white/5 bg-black">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-zinc-800" />
            <span className="text-[10px] font-black text-zinc-600 tracking-[0.4em] uppercase">Hawk_v4.0.08</span>
          </div>
          <p className="text-[10px] text-zinc-800 uppercase font-black">
            Developed by Amit Kumar Dey / <a href="https://portfolio.akdey.vercel.app/" target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-coral transition-colors underline">Portfolio</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
