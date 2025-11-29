import React, { useState, useEffect } from 'react';
import { Vault } from '../types';
import { analyzeVault } from '../services/geminiService';
import { Bot, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface AIAdvisorProps {
  vault: Vault;
  onClose: () => void;
}

const SimpleMarkdown = ({ text }: { text: string }) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-2 text-slate-300 leading-relaxed text-sm">
      {lines.map((line, idx) => {
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          return <div key={idx} className="flex gap-2 ml-2"><span className="text-purple-400 mt-1.5">•</span><span>{line.replace(/^[-*] /, '')}</span></div>;
        }
        if (line.match(/^\d\./)) {
           return <div key={idx} className="font-semibold text-white mt-4 mb-1">{line}</div>;
        }
        return <p key={idx} className={line.length === 0 ? 'h-2' : ''}>{line}</p>;
      })}
    </div>
  );
};

const AIAdvisor: React.FC<AIAdvisorProps> = ({ vault, onClose }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (vault) {
      setLoading(true);
      setAnalysis('');
      analyzeVault(vault)
        .then((text) => setAnalysis(text))
        .finally(() => setLoading(false));
    }
  }, [vault]);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ y: "100%", opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: "20%", opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl shadow-2xl pointer-events-auto flex flex-col max-h-[85vh] overflow-hidden m-0 sm:m-4"
      >
        
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <Bot className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Gemini Risk Advisor</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Powered by Gemini 2.5 Flash</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-3 mb-6 p-4 bg-slate-800/30 rounded-xl border border-slate-800">
            <img src={vault.token.logo} alt={vault.token.name} className="w-12 h-12 rounded-full" />
            <div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">Analyzing Market</div>
              <div className="text-lg font-bold text-white flex items-center gap-2">
                {vault.token.name}
                <span className="text-xs px-2 py-0.5 bg-slate-700 rounded text-slate-300 font-normal">{vault.protocol}</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              <p className="text-sm text-purple-300/80 animate-pulse">Analyzing on-chain metrics...</p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 shadow-inner">
                <SimpleMarkdown text={analysis} />
              </div>
              
              <div className="mt-6 flex gap-3">
                <div className="flex-1 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Risk Factor</span>
                  <span className={`text-xl font-bold ${
                    vault.riskFactor === 'Low' ? 'text-green-400' : 
                    vault.riskFactor === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                  }`}>{vault.riskFactor}</span>
                </div>
                <div className="flex-1 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Current Net APY</span>
                  <span className="text-xl font-bold text-blue-400">{vault.netApy}%</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-3 border-t border-slate-800 bg-slate-900 text-center text-[10px] text-slate-600">
          AI generated content may be inaccurate. Not financial advice.
        </div>
      </motion.div>
    </div>
  );
};

export default AIAdvisor;