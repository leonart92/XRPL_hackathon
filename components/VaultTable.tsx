import React, { useState } from 'react';
import { formatCurrency } from '../constants';
import { ChevronRight, MapPin, Coins, TrendingUp } from 'lucide-react';
import { useVaultsContext } from '../contexts/VaultsContext';
import type { Association } from '../types';

interface VaultTableProps {
  onSelectAssociation: (id: string) => void;
  searchQuery?: string;
}

const VaultTable: React.FC<VaultTableProps> = ({ onSelectAssociation, searchQuery = '' }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { vaults, associations } = useVaultsContext();

  const getAssociationStats = (associationId: string) => {
    const associationVaults = vaults.filter(v => v.associationId === associationId);
    
    if (associationVaults.length === 0) {
      return { totalTVL: 0, avgApy: 0, maxApy: 0, vaultCount: 0 };
    }

    const totalTVL = associationVaults.reduce((sum, v) => sum + v.totalSupply, 0);
    const avgApy = associationVaults.reduce((sum, v) => sum + v.netApy, 0) / associationVaults.length;
    const maxApy = Math.max(...associationVaults.map(v => v.netApy + (v.rewardsApy || 0)));

    return { totalTVL, avgApy, maxApy, vaultCount: associationVaults.length };
  };

  const filterAssociations = (associationsList: Association[]) => {
    if (!searchQuery.trim()) return associationsList;

    const query = searchQuery.toLowerCase().trim();

    return associationsList.filter(association => {
      if (association.name.toLowerCase().includes(query)) return true;
      if (association.shortName.toLowerCase().includes(query)) return true;

      if (association.category.toLowerCase().includes(query)) return true;

      if (association.description.toLowerCase().includes(query)) return true;

      if (association.focus.some(focus => focus.toLowerCase().includes(query))) return true;

      if (association.location.headquarters.toLowerCase().includes(query)) return true;
      if (association.location.scope.toLowerCase().includes(query)) return true;

      return false;
    });
  };

  const filteredAssociations = filterAssociations(associations);

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

      {filteredAssociations.length === 0 && searchQuery.trim() ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <p className="text-lg font-medium text-slate-700 mb-2">No associations found</p>
          <p className="text-sm text-slate-500">Try a different search term</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 md:gap-0">
          {filteredAssociations.map((association) => {
            const stats = getAssociationStats(association.id);

            return (
              <div
                key={association.id}
                onMouseEnter={() => setHoveredId(association.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onSelectAssociation(association.id)}
                className="group bg-white md:bg-transparent border border-slate-200 md:border-0 md:border-b md:border-slate-200/50 rounded-xl md:rounded-none transition-all duration-300 hover:bg-slate-50 cursor-pointer"
              >
                <div className="grid grid-cols-2 md:grid-cols-12 gap-4 p-4 md:px-6 md:py-5 items-center">
                  <div className="col-span-2 md:col-span-5 flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={association.branding.logo}
                        alt={association.name}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white shadow-sm object-contain p-1 transition-transform hover:scale-110"
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

                  <div className="col-span-2 md:col-span-2 flex flex-col items-end md:items-end justify-center">
                    {stats.vaultCount > 0 ? (
                      <>
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-lg md:text-xl font-bold text-green-600 tracking-tight">
                            {stats.maxApy.toFixed(1)}%
                          </span>
                        </div>
                        <span className="text-[10px] md:text-xs font-medium text-slate-500">
                          Best APY
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-slate-400">
                          Coming Soon
                        </span>
                        <span className="text-[10px] md:text-xs font-medium text-slate-400">
                          No vaults yet
                        </span>
                      </>
                    )}
                  </div>

                  <div className="hidden md:flex col-span-2 flex-col items-end justify-center">
                    <span className="text-sm font-semibold text-slate-700">{formatCurrency(stats.totalTVL)}</span>
                    <span className="text-xs text-slate-500">Total Locked</span>
                  </div>

                  <div className="hidden md:flex col-span-2 flex-col items-end justify-center">
                    <div className="flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-semibold text-slate-700">{stats.vaultCount}</span>
                    </div>
                    <span className="text-xs text-slate-500">Vaults</span>
                  </div>

                  <div className="hidden md:flex col-span-1 justify-end">
                    <ChevronRight className={`w-5 h-5 transition-all duration-200 ${hoveredId === association.id ? 'text-blue-500 translate-x-1' : 'text-slate-400'}`} />
                  </div>

                  <div className="absolute right-4 top-1/2 -translate-y-1/2 md:hidden text-slate-400">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VaultTable;
