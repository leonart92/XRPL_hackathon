import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import VaultTable from './VaultTable';
import { MOCK_VAULTS } from '../constants';
import { Vault } from '../types';

interface EarnProps {
  onSelectVaultForAI: (vault: Vault) => void;
}

const Earn: React.FC<EarnProps> = ({ onSelectVaultForAI }) => {
  const depositRef = useRef<HTMLSpanElement>(null);
  const apyRef = useRef<HTMLSpanElement>(null);

  // Calculate global stats
  const totalDeposit = MOCK_VAULTS.reduce((acc, v) => acc + v.totalSupply, 0);
  const avgApy = MOCK_VAULTS.reduce((acc, v) => acc + v.netApy, 0) / MOCK_VAULTS.length;
  const depositInBillions = totalDeposit / 1e9;

  // GSAP Counters
  useEffect(() => {
    if (typeof gsap === 'undefined') return;

    const ctx = gsap.context(() => {
      const depositProxy = { value: 0 };
      gsap.to(depositProxy, {
        value: depositInBillions,
        duration: 2,
        ease: "power2.out",
        onUpdate: () => {
          if (depositRef.current) {
            depositRef.current.innerText = `$${depositProxy.value.toFixed(2)}B`;
          }
        }
      });

      const apyProxy = { value: 0 };
      gsap.to(apyProxy, {
        value: avgApy,
        duration: 2.5,
        ease: "power2.out",
        onUpdate: () => {
          if (apyRef.current) {
            apyRef.current.innerText = `${apyProxy.value.toFixed(2)}%`;
          }
        }
      });
    });

    return () => ctx.revert();
  }, [depositInBillions, avgApy]);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-end justify-between mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
            Earn Yield
          </h1>
          <p className="text-slate-400 text-lg max-w-xl leading-relaxed">
            Supply assets to lend on the most efficient lending protocols. Optimized APY, minimized fragmentation.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="flex gap-4 md:gap-8"
        >
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Total Deposits</span>
              <span ref={depositRef} className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                $0.00B
              </span>
            </div>
            <div className="w-px bg-slate-800 h-12"></div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Avg. APY</span>
              <div className="flex items-center gap-2">
                <span ref={apyRef} className="text-2xl md:text-3xl font-bold text-blue-400 tracking-tight">
                  0.00%
                </span>
                <ArrowUpRight className="w-5 h-5 text-blue-500" />
              </div>
            </div>
        </motion.div>
      </div>

      {/* Filters & Search */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="flex flex-col md:flex-row gap-4 mb-6 sticky top-20 z-40 bg-[#020617]/95 backdrop-blur-sm py-4 border-b border-transparent md:border-slate-900 transition-all"
      >
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by asset, protocol, or symbol..." 
            className="w-full bg-slate-900/50 border border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-600"
          />
        </div>
        <button className="flex items-center gap-2 px-5 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-medium active:scale-95 duration-100">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="bg-slate-950/50 rounded-2xl border border-slate-800/50 overflow-hidden shadow-2xl shadow-black/20"
      >
        <VaultTable onSelectVaultForAI={onSelectVaultForAI} />
      </motion.div>
    </div>
  );
};

export default Earn;