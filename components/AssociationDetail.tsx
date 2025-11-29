import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, MapPin, Globe, TrendingUp, Info, ArrowUpRight, Sparkles } from 'lucide-react';
import { Vault } from '../types';
import { formatCurrency, ASSOCIATIONS, MOCK_VAULTS } from '../constants';
import VaultChart from './VaultChart';

interface AssociationDetailProps {
    associationId: string;
    onBack: () => void;
    onSelectVaultForAI: (vault: Vault) => void;
}

const AssociationDetail: React.FC<AssociationDetailProps> = ({
    associationId,
    onBack,
    onSelectVaultForAI,
}) => {
    const [investAmount, setInvestAmount] = useState('');

    const association = ASSOCIATIONS.find(a => a.id === associationId);
    const vault = MOCK_VAULTS.find(v => v.id === associationId);

    if (!association || !vault) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
                <p>Association not found</p>
                <button onClick={onBack} className="mt-4 text-blue-400 hover:underline">Go Back</button>
            </div>
        );
    }

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'Low': return 'text-green-400 bg-green-500/10 border-green-500/20';
            case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            case 'High': return 'text-red-400 bg-red-500/10 border-red-500/20';
            default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        }
    };

    return (
        <div className="min-h-screen bg-[#020617]">
            {/* Back Button */}
            <div className="mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                >
                    <div className="p-2 rounded-full bg-slate-900 border border-slate-800 group-hover:border-slate-700 transition-colors">
                        <ArrowLeft size={20} />
                    </div>
                    <span className="font-medium">Back to Earn</span>
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Section - Association Details */}
                <div className="flex-1 space-y-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-6"
                    >
                        <div className="flex items-start gap-6">
                            <div className="relative shrink-0">
                                <img
                                    src={association.branding.logo}
                                    alt={association.name}
                                    className="w-24 h-24 rounded-2xl bg-white p-2 shadow-lg"
                                />
                                <div
                                    className="absolute -bottom-3 -right-3 px-2.5 py-1 rounded-lg text-xs font-bold border shadow-sm bg-slate-950"
                                    style={{
                                        borderColor: `${association.branding.color}40`,
                                        color: association.branding.color,
                                    }}
                                >
                                    {association.symbol}
                                </div>
                            </div>
                            <div className="flex-1 pt-2">
                                <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                                    {association.name}
                                </h1>
                                <div className="flex flex-wrap items-center gap-3">
                                    <span
                                        className="px-3 py-1 rounded-full text-sm font-semibold"
                                        style={{
                                            backgroundColor: `${association.branding.color}15`,
                                            color: association.branding.color,
                                            border: `1px solid ${association.branding.color}30`
                                        }}
                                    >
                                        {association.category}
                                    </span>
                                    {association.metrics && (
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskColor(association.metrics.riskFactor)}`}>
                                            {association.metrics.riskFactor} Risk
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <p className="text-lg text-slate-300 leading-relaxed max-w-4xl">
                            {association.description}
                        </p>
                    </motion.div>

                    {/* Location & Contact */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:bg-slate-900/80 transition-colors">
                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                <MapPin size={18} className="text-blue-400" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Location</span>
                            </div>
                            <div className="text-white font-medium text-lg">{association.location.headquarters}</div>
                            <div className="text-sm text-slate-400">{association.location.scope}</div>
                        </div>

                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:bg-slate-900/80 transition-colors">
                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                <Globe size={18} className="text-blue-400" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Website</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <a
                                    href={association.contact.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white hover:text-blue-400 font-medium flex items-center gap-2 transition-colors group"
                                >
                                    Visit Official Website
                                    <ExternalLink size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                                </a>
                                {association.contact.websiteFR && (
                                    <a
                                        href={association.contact.websiteFR}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-slate-400 hover:text-blue-400 flex items-center gap-2 transition-colors"
                                    >
                                        French Version <ExternalLink size={12} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Focus Areas */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4"
                    >
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <TrendingUp size={20} className="text-blue-400" />
                            Focus Areas
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {association.focus.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + index * 0.05 }}
                                    className="bg-slate-900/30 border border-slate-800/50 rounded-lg p-4 flex items-start gap-3 hover:bg-slate-900/60 transition-colors"
                                >
                                    <div
                                        className="w-2 h-2 rounded-full mt-2 shrink-0 shadow-[0_0_8px]"
                                        style={{
                                            backgroundColor: association.branding.color,
                                            boxShadow: `0 0 8px ${association.branding.color}`
                                        }}
                                    />
                                    <span className="text-slate-200 font-medium">{item}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Metrics & Chart */}
                    {association.metrics && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="space-y-6"
                        >
                            <h2 className="text-xl font-bold text-white">Performance Metrics</h2>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-br from-blue-950 to-slate-900 border border-blue-500/30 rounded-xl p-5 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="text-xs text-blue-300/80 font-medium uppercase tracking-wider mb-1">Net APY</div>
                                    <div className="text-3xl font-bold text-blue-400 flex items-center gap-1">
                                        {association.metrics.netApy}%
                                        <ArrowUpRight size={20} className="text-green-500" />
                                    </div>
                                </div>

                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                                    <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Total Supply</div>
                                    <div className="text-2xl font-bold text-white">{formatCurrency(association.metrics.totalSupply)}</div>
                                </div>

                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                                    <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Liquidity</div>
                                    <div className="text-2xl font-bold text-white">{formatCurrency(association.metrics.liquidity)}</div>
                                </div>

                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                                    <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Utilization</div>
                                    <div className="text-2xl font-bold text-white">{association.metrics.utilization}%</div>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                                        Historical APY (30D)
                                    </h3>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => onSelectVaultForAI(vault)}
                                        className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-bold rounded-lg border border-purple-500/20 transition-colors shadow-[0_0_15px_-5px_rgba(168,85,247,0.4)]"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        ASK AI ADVISOR
                                    </motion.button>
                                </div>
                                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/50 h-[300px]">
                                    <VaultChart data={vault.history} color={association.branding.color} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Right Section - Investment Panel */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full lg:w-96 shrink-0"
                >
                    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 lg:sticky lg:top-24 shadow-xl">
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">Manage Investment</h2>
                                <p className="text-sm text-slate-400">Support this cause and earn rewards</p>
                            </div>

                            {/* Wallet Balance */}
                            <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
                                <div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Wallet Balance</div>
                                    <div className="text-xl font-bold text-white">0.00 {association.symbol}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Value</div>
                                    <div className="text-sm font-medium text-slate-300">≈ $0.00</div>
                                </div>
                            </div>

                            {/* Investment Amount */}
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-slate-300">Amount to Invest</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={investAmount}
                                        onChange={(e) => setInvestAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-mono"
                                    />
                                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-2 py-1 rounded">
                                        MAX
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    {['25%', '50%', '75%', '100%'].map((percent) => (
                                        <button
                                            key={percent}
                                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2 rounded-lg transition-colors border border-slate-700 hover:border-slate-600"
                                        >
                                            {percent}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Expected Returns */}
                            {association.metrics && investAmount && parseFloat(investAmount) > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-700/30 rounded-xl p-4 space-y-3"
                                >
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Expected APY</span>
                                        <span className="text-blue-400 font-bold">{association.metrics.netApy}%</span>
                                    </div>
                                    {association.metrics.rewardsApy && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Rewards APY</span>
                                            <span className="text-green-400 font-bold">+{association.metrics.rewardsApy}%</span>
                                        </div>
                                    )}
                                    <div className="h-px bg-slate-700/50 my-2" />
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-300 font-semibold">Yearly Earnings</span>
                                        <span className="text-white font-bold text-lg">
                                            ${((parseFloat(investAmount) * association.metrics.netApy) / 100).toFixed(2)}
                                        </span>
                                    </div>
                                </motion.div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-3 pt-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2"
                                >
                                    Supply Assets
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3.5 rounded-xl border border-slate-700 transition-colors"
                                >
                                    Withdraw Assets
                                </motion.button>
                            </div>

                            {/* Risk Warning */}
                            <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
                                <Info className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" />
                                <div className="space-y-2">
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        Supplying to {association.name} incurs smart contract risk.
                                    </p>
                                    <button
                                        onClick={() => onSelectVaultForAI(vault)}
                                        className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors flex items-center gap-1"
                                    >
                                        Analyze risk with AI <ArrowUpRight size={12} />
                                    </button>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="text-xs text-slate-600 text-center">
                                No protocol fees enabled currently.
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AssociationDetail;
