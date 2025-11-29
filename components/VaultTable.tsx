import React, { useState } from 'react';
import { ASSOCIATIONS, getVaultsByAssociation, formatCurrency } from '../constants';
import { Vault } from '../types';
import { ChevronRight, Sparkles, MapPin, Coins, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface VaultTableProps {
  onSelectVaultForAI: (vault: Vault) => void;
  onSelectAssociation: (id: string) => void;
}

const VaultTable: React.FC<VaultTableProps> = ({ onSelectVaultForAI, onSelectAssociation }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
        ease: "easeOut" as const
      }
    }
  };

  // Calculate stats for each association
  const getAssociationStats = (associationId: string) => {
    const vaults = getVaultsByAssociation(associationId);
    if (vaults.length === 0) return null;

    const totalTVL = vaults.reduce((sum, v) => sum + v.totalSupply, 0);
    const avgApy = vaults.reduce((sum, v) => sum + v.netApy, 0) / vaults.length;
    const maxApy = Math.max(...vaults.map(v => v.netApy + (v.rewardsApy || 0)));

    return { totalTVL, avgApy, maxApy, vaultCount: vaults.length };
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200/50">
        <div className="col-span-5">Association</div>
        <div className="col-span-2 text-right">Best APY</div>
        <div className="col-span-2 text-right">Total TVL</div>
        <div className="col-span-2 text-right">Vaults</div>
        <div className="col-span-1"></div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-2 md:gap-0"
      >
        {ASSOCIATIONS.map((association) => {
          const stats = getAssociationStats(association.id);
          if (!stats) return null; // Skip associations without vaults

          return (
            <motion.div
              variants={item}
              key={association.id}
              onMouseEnter={() => setHoveredId(association.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelectAssociation(association.id)}
              className="group bg-white md:bg-transparent border border-slate-200 md:border-0 md:border-b md:border-slate-200/50 rounded-xl md:rounded-none transition-all duration-300 hover:bg-slate-50 cursor-pointer"
            >
              <div className="grid grid-cols-2 md:grid-cols-12 gap-4 p-4 md:px-6 md:py-5 items-center">
                {/* Association Info */}
                <div className="col-span-2 md:col-span-5 flex items-center gap-4">
                  <div className="relative">
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      src={association.branding.logo}
                      alt={association.name}
                      className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white shadow-sm object-contain p-1"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm md:text-base text-slate-900">{association.name}</span>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span
                        className="px-2 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor: `${association.branding.color}15`,
                          color: association.branding.color,
                        }}
                      >
                        {association.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={10} />
                        {association.location.scope}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Best APY */}
                <div className="col-span-2 md:col-span-2 flex flex-col items-end md:items-end justify-center">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-lg md:text-xl font-bold text-green-600 tracking-tight">
                      {stats.maxApy.toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-[10px] md:text-xs font-medium text-slate-500">
                    Best APY
                  </span>
                </div>

                {/* Total TVL */}
                <div className="hidden md:flex col-span-2 flex-col items-end justify-center">
                  <span className="text-sm font-semibold text-slate-700">{formatCurrency(stats.totalTVL)}</span>
                  <span className="text-xs text-slate-500">Total Locked</span>
                </div>

                {/* Vault Count */}
                <div className="hidden md:flex col-span-2 flex-col items-end justify-center">
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold text-slate-700">{stats.vaultCount}</span>
                  </div>
                  <span className="text-xs text-slate-500">Vaults</span>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex col-span-1 justify-end">
                  <motion.div
                    animate={{ x: hoveredId === association.id ? 5 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </motion.div>
                </div>

                {/* Mobile Arrow */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 md:hidden text-slate-400">
                  <ChevronRight size={20} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default VaultTable;
