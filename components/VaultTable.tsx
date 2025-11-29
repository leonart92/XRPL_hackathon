import React, { useState } from 'react';
import { MOCK_VAULTS, formatCurrency, ASSOCIATIONS } from '../constants';
import { Vault, Association } from '../types';
import { ChevronDown, Sparkles, Info } from 'lucide-react';
import VaultChart from './VaultChart';
import AssociationDetail from './AssociationDetail';
import { motion, AnimatePresence } from 'framer-motion';
import { tableRowVariants } from '../animations';

interface VaultTableProps {
  onSelectVaultForAI: (vault: Vault) => void;
  onSelectAssociation: (id: string) => void;
}

const VaultTable: React.FC<VaultTableProps> = ({ onSelectVaultForAI, onSelectAssociation }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20, scale: 0.95 },
    show: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  return (
    <div className="w-full">
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200/50">
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
              className={`group bg-slate-50 md:bg-transparent border border-slate-200 md:border-0 md:border-b md:border-slate-200/50 rounded-xl md:rounded-none transition-all duration-300 ${isExpanded ? 'bg-slate-100/40 border-slate-300' : 'hover:bg-slate-100/30'}`}
            >
              <div
                onClick={() => onSelectAssociation(vault.id)}
                className="grid grid-cols-2 md:grid-cols-12 gap-4 p-4 md:px-6 md:py-5 cursor-pointer items-center relative z-10"
              >
                <div className="col-span-2 md:col-span-4 flex items-center gap-3">
                  <div className="relative">
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      src={vault.token.logo}
                      alt={vault.token.name}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 shadow-sm"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-slate-50 rounded-full p-[2px]">
                      <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-slate-700 flex items-center justify-center text-[8px] text-slate-900 font-bold">
                        {vault.protocol[0]}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-100 text-sm md:text-base">{vault.token.name}</span>
                    <span className="text-xs text-slate-600 font-medium">{vault.token.symbol} • {vault.protocol}</span>
                  </div>
                </div>

                <div className="col-span-2 md:col-span-2 flex flex-col items-end md:items-end justify-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">{vault.netApy}%</span>
                    <Sparkles className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  </div>
                  {vault.rewardsApy && (
                    <span className="text-[10px] md:text-xs font-medium text-slate-600 bg-slate-100/50 px-1.5 py-0.5 rounded">
                      +{vault.rewardsApy}% Rewards
                    </span>
                  )}
                </div>

                <div className="hidden md:flex col-span-2 flex-col items-end justify-center">
                  <span className="text-sm font-medium text-slate-700">{formatCurrency(vault.totalSupply)}</span>
                </div>

                <div className="hidden md:flex col-span-2 flex-col items-end justify-center">
                  <div className="w-24 bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${vault.utilization}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: "circOut" }}
                      className="bg-blue-500 h-full rounded-full"
                    ></motion.div>
                  </div>
                  <span className="text-xs font-medium text-slate-600">{vault.utilization}%</span>
                </div>

                <div className="hidden md:flex col-span-2 flex-col items-end justify-center">
                  <span className="text-sm font-medium text-slate-700">{formatCurrency(vault.liquidity)}</span>
                </div>

                <div className="absolute right-4 top-1/2 -translate-y-1/2 md:hidden text-slate-600">
                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                    <ChevronDown size={20} />
                  </motion.div>
                </div>
              </div>

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
                      <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-4 md:p-6">
                        <div className="flex flex-col lg:flex-row gap-8">

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Historical APY (30D)</h4>
                              <div className="flex items-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={(e) => { e.stopPropagation(); onSelectVaultForAI(vault); }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 text-xs font-bold rounded-lg border border-purple-500/20 transition-colors"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  ASK AI ADVISOR
                                </motion.button>
                              </div>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-2 border border-slate-200/50">
                              <VaultChart data={vault.history} color={vault.token.color} />
                            </div>
                          </div>

                          <div className="w-full lg:w-80 flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-3 md:hidden">
                              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <span className="text-xs text-slate-600">Total Supply</span>
                                <div className="text-sm font-medium text-slate-900">{formatCurrency(vault.totalSupply)}</div>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <span className="text-xs text-slate-600">Liquidity</span>
                                <div className="text-sm font-medium text-slate-900">{formatCurrency(vault.liquidity)}</div>
                              </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Wallet Balance</span>
                                <span className="text-slate-900 font-medium">0.00 {vault.token.symbol}</span>
                              </div>
                              <div className="h-px bg-slate-100 my-1"></div>
                              <div className="flex gap-2">
                                <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-slate-900 font-semibold py-2.5 rounded-lg text-sm transition-colors shadow-lg shadow-blue-900/20">
                                  Supply
                                </button>
                                <button className="flex-1 bg-slate-100 hover:bg-slate-700 text-slate-700 font-semibold py-2.5 rounded-lg text-sm border border-slate-300 transition-colors">
                                  Withdraw
                                </button>
                              </div>
                              <p className="text-[10px] text-slate-600 text-center mt-1">
                                No Protocol fees enabled currently.
                              </p>
                            </div>

                            <div className="bg-slate-100/30 p-3 rounded-lg border border-slate-200 flex items-start gap-3">
                              <Info className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                              <p className="text-xs text-slate-600 leading-relaxed">
                                Supplying to {vault.protocol} incurs smart contract risk.
                                <span className="text-blue-600 cursor-pointer hover:underline ml-1" onClick={(e) => { e.stopPropagation(); onSelectVaultForAI(vault); }}>Analyze risk with AI &rarr;</span>
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