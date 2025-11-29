import React, { useState } from 'react';
import { MOCK_VAULTS, formatCurrency } from '../constants';
import { Vault } from '../types';
import { ChevronDown, ChevronUp, Sparkles, TrendingUp, Info } from 'lucide-react';
import VaultChart from './VaultChart';
import { motion, AnimatePresence } from 'framer-motion';

interface VaultTableProps {
  onSelectVaultForAI: (vault: Vault) => void;
}

const VaultTable: React.FC<VaultTableProps> = ({ onSelectVaultForAI }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full">
      {/* Table Header - Hidden on Mobile */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800/50">
        <div className="col-span-4">Asset</div>
        <div className="col-span-2 text-right">Net APY</div>
        <div className="col-span-2 text-right">Total Supply</div>
        <div className="col-span-2 text-right">Utilization</div>
        <div className="col-span-2 text-right">Liquidity</div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-2 md:gap-0"
      >
        {MOCK_VAULTS.map((vault) => {
          const isExpanded = expandedId === vault.id;
          
          return (
            <motion.div 
              variants={item}
              key={vault.id} 
              className={`group bg-slate-900 md:bg-transparent border border-slate-800 md:border-0 md:border-b md:border-slate-800/50 rounded-xl md:rounded-none transition-all duration-300 ${isExpanded ? 'bg-slate-800/40 border-slate-700' : 'hover:bg-slate-800/30'}`}
            >
              {/* Row Main Content */}
              <div 
                onClick={() => toggleExpand(vault.id)}
                className="grid grid-cols-2 md:grid-cols-12 gap-4 p-4 md:px-6 md:py-5 cursor-pointer items-center relative z-10"
              >
                {/* Asset Column */}
                <div className="col-span-2 md:col-span-4 flex items-center gap-3">
                  <div className="relative">
                    <motion.img 
                      whileHover={{ scale: 1.1 }}
                      src={vault.token.logo} 
                      alt={vault.token.name} 
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-800 shadow-sm" 
                    />
                    <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-[2px]">
                       <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-slate-700 flex items-center justify-center text-[8px] text-white font-bold">
                         {vault.protocol[0]}
                       </div>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-100 text-sm md:text-base">{vault.token.name}</span>
                    <span className="text-xs text-slate-500 font-medium">{vault.token.symbol} • {vault.protocol}</span>
                  </div>
                </div>

                {/* Net APY */}
                <div className="col-span-2 md:col-span-2 flex flex-col items-end md:items-end justify-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg md:text-xl font-bold text-white tracking-tight">{vault.netApy}%</span>
                    <Sparkles className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  </div>
                  {vault.rewardsApy && (
                    <span className="text-[10px] md:text-xs font-medium text-slate-400 bg-slate-800/50 px-1.5 py-0.5 rounded">
                      +{vault.rewardsApy}% Rewards
                    </span>
                  )}
                </div>

                {/* Desktop Only Columns */}
                <div className="hidden md:flex col-span-2 flex-col items-end justify-center">
                  <span className="text-sm font-medium text-slate-300">{formatCurrency(vault.totalSupply)}</span>
                </div>
                
                <div className="hidden md:flex col-span-2 flex-col items-end justify-center">
                   <div className="w-24 bg-slate-800 rounded-full h-1.5 mb-2 overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${vault.utilization}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "circOut" }}
                        className="bg-blue-500 h-full rounded-full" 
                     ></motion.div>
                   </div>
                   <span className="text-xs font-medium text-slate-400">{vault.utilization}%</span>
                </div>

                <div className="hidden md:flex col-span-2 flex-col items-end justify-center">
                  <span className="text-sm font-medium text-slate-300">{formatCurrency(vault.liquidity)}</span>
                </div>
                
                {/* Mobile Expansion Indicator */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 md:hidden text-slate-600">
                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                    <ChevronDown size={20} />
                  </motion.div>
                </div>
              </div>

              {/* Expanded Detail View */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 md:px-6 md:pb-6">
                       <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 md:p-6">
                          <div className="flex flex-col lg:flex-row gap-8">
                            
                            {/* Left: Chart & Key Stats */}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Historical APY (30D)</h4>
                                <div className="flex items-center gap-2">
                                   <motion.button 
                                     whileHover={{ scale: 1.05 }}
                                     whileTap={{ scale: 0.95 }}
                                     onClick={(e) => { e.stopPropagation(); onSelectVaultForAI(vault); }}
                                     className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-bold rounded-lg border border-purple-500/20 transition-colors"
                                   >
                                     <Sparkles className="w-3.5 h-3.5" />
                                     ASK AI ADVISOR
                                   </motion.button>
                                </div>
                              </div>
                              <div className="bg-slate-900 rounded-lg p-2 border border-slate-800/50">
                                 <VaultChart data={vault.history} color={vault.token.color} />
                              </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="w-full lg:w-80 flex flex-col gap-4">
                               {/* Mobile only stats */}
                               <div className="grid grid-cols-2 gap-3 md:hidden">
                                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                                    <span className="text-xs text-slate-500">Total Supply</span>
                                    <div className="text-sm font-medium text-white">{formatCurrency(vault.totalSupply)}</div>
                                  </div>
                                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                                    <span className="text-xs text-slate-500">Liquidity</span>
                                    <div className="text-sm font-medium text-white">{formatCurrency(vault.liquidity)}</div>
                                  </div>
                               </div>

                               <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Wallet Balance</span>
                                    <span className="text-white font-medium">0.00 {vault.token.symbol}</span>
                                  </div>
                                  <div className="h-px bg-slate-800 my-1"></div>
                                  <div className="flex gap-2">
                                    <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors shadow-lg shadow-blue-900/20">
                                      Supply
                                    </button>
                                    <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-lg text-sm border border-slate-700 transition-colors">
                                      Withdraw
                                    </button>
                                  </div>
                                  <p className="text-[10px] text-slate-500 text-center mt-1">
                                    No Protocol fees enabled currently.
                                  </p>
                               </div>

                               <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-800 flex items-start gap-3">
                                 <Info className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                                 <p className="text-xs text-slate-400 leading-relaxed">
                                    Supplying to {vault.protocol} incurs smart contract risk. 
                                    <span className="text-blue-400 cursor-pointer hover:underline ml-1" onClick={(e) => { e.stopPropagation(); onSelectVaultForAI(vault); }}>Analyze risk with AI &rarr;</span>
                                 </p>
                               </div>
                            </div>

                          </div>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default VaultTable;