import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ExternalLink, MapPin, Globe, TrendingUp, ArrowUpRight, Shield, Clock, Coins, ChevronRight } from 'lucide-react';
import { Vault } from '../types';
import { ASSOCIATIONS, getVaultsByAssociation, formatCurrency } from '../constants';

interface AssociationDetailProps {
    associationId: string;
    onBack: () => void;
    onSelectVaultForAI: (vault: Vault) => void;
}

const getFocusImage = (focusText: string, index: number): string => {
    const text = focusText.toLowerCase();

    if (text.includes('conservation') && text.includes('biodiversité')) {
        return 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80';
    }
    if (text.includes('espèces menacées') || text.includes('protection des espèces')) {
        return 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=800&q=80';
    }
    if (text.includes('biodiversité')) {
        return 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&q=80';
    }
    if (text.includes('habitat') && text.includes('naturel')) {
        return 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80';
    }
    if (text.includes('océan') || text.includes('ocean')) {
        return 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80';
    }
    if (text.includes('littoral') || text.includes('côte')) {
        return 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&q=80';
    }
    if (text.includes('forêt') || text.includes('forest')) {
        return 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80';
    }
    if (text.includes('changement climatique') || text.includes('climat')) {
        return 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&q=80';
    }
    if (text.includes('plastique')) {
        return 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&q=80';
    }
    if (text.includes('déchet')) {
        return 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80';
    }
    if (text.includes('énergie') || text.includes('renouvelable')) {
        return 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80';
    }

    const defaultImages = [
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
        'https://images.unsplash.com/photo-1476362555312-ab9e108a0b7e?w=800&q=80',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
        'https://images.unsplash.com/photo-1511497584788-876760111969?w=800&q=80',
    ];
    return defaultImages[index % defaultImages.length];
};

const AssociationDetail: React.FC<AssociationDetailProps> = ({
    associationId,
    onBack,
    onSelectVaultForAI,
}) => {
    const [selectedFocus, setSelectedFocus] = useState<{ title: string, image: string, description: string, index: number } | null>(null);
    const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
    const [investAmount, setInvestAmount] = useState('');

    const association = ASSOCIATIONS.find(a => a.id === associationId);
    const vaults = getVaultsByAssociation(associationId);

    if (!association) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-slate-600">
                <p>Association not found</p>
                <button onClick={onBack} className="mt-4 text-blue-400 hover:underline">Go Back</button>
            </div>
        );
    }

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'Low': return 'text-green-600 bg-green-50 border-green-200';
            case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'High': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-slate-600 bg-slate-50 border-slate-200';
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Back Button */}
            <div className="mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group"
                >
                    <div className="p-2 rounded-full bg-slate-50 border border-slate-200 group-hover:border-slate-300 transition-colors">
                        <ArrowLeft size={20} />
                    </div>
                    <span className="font-medium">Back to Associations</span>
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
            >
                <div className="flex items-start gap-6 mb-6">
                    <div className="relative shrink-0">
                        <img
                            src={association.branding.logo}
                            alt={association.name}
                            className="w-24 h-24 rounded-2xl bg-white p-2 shadow-lg object-contain"
                        />
                    </div>
                    <div className="flex-1 pt-2">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
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
                            <span className="text-sm text-slate-500 flex items-center gap-1">
                                <MapPin size={14} />
                                {association.location.headquarters}
                            </span>
                        </div>
                    </div>
                </div>

                <p className="text-lg text-slate-700 leading-relaxed max-w-4xl">
                    {association.description}
                </p>

                <div className="flex gap-4 mt-4">
                    <a
                        href={association.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        <Globe size={16} />
                        Official Website
                        <ExternalLink size={12} />
                    </a>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
            >
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Coins size={24} className="text-blue-500" />
                    Investment Vaults
                    <span className="text-sm font-normal text-slate-500 ml-2">
                        ({vaults.length} available)
                    </span>
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {vaults.map((vault, index) => (
                        <motion.div
                            key={vault.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            onClick={() => setSelectedVault(vault)}
                            className={`relative bg-white rounded-xl border-2 p-5 cursor-pointer transition-all hover:shadow-lg ${selectedVault?.id === vault.id
                                ? 'border-blue-500 shadow-lg shadow-blue-100'
                                : 'border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">{vault.name}</h3>
                                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{vault.description}</p>
                                </div>
                                <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${selectedVault?.id === vault.id ? 'rotate-90' : ''
                                    }`} />
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-4">
                                <div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">APY</div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-xl font-bold text-green-600">{vault.netApy}%</span>
                                        {vault.rewardsApy && (
                                            <span className="text-xs text-green-500">+{vault.rewardsApy}%</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Risk</div>
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${getRiskColor(vault.riskFactor)}`}>
                                        {vault.riskFactor}
                                    </span>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Lock</div>
                                    <div className="flex items-center gap-1 text-sm text-slate-700">
                                        <Clock size={12} />
                                        {vault.lockPeriod || 'No lock'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                                <div className="text-sm text-slate-500">
                                    <span className="font-medium text-slate-700">{formatCurrency(vault.totalSupply)}</span> TVL
                                </div>
                                <div className="text-sm text-slate-500">
                                    <span className="font-medium text-slate-700">{vault.utilization.toFixed(1)}%</span> Utilization
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            <AnimatePresence>
                {selectedVault && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-2xl p-6 z-40"
                    >
                        <div className="max-w-4xl mx-auto">
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-bold text-slate-900">{selectedVault.name}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getRiskColor(selectedVault.riskFactor)}`}>
                                            {selectedVault.riskFactor} Risk
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600">
                                        Earn <span className="font-bold text-green-600">{selectedVault.netApy}% APY</span>
                                        {selectedVault.rewardsApy && <span className="text-green-500"> + {selectedVault.rewardsApy}% bonus</span>}
                                        {selectedVault.lockPeriod !== 'No lock' && (
                                            <span className="text-slate-500"> • {selectedVault.lockPeriod} lock period</span>
                                        )}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={investAmount}
                                            onChange={(e) => setInvestAmount(e.target.value)}
                                            placeholder="Amount in XRP"
                                            className="w-40 bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm"
                                        />
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-200"
                                    >
                                        Invest XRP
                                    </motion.button>
                                    <button
                                        onClick={() => onSelectVaultForAI(selectedVault)}
                                        className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                                        title="Analyze with AI"
                                    >
                                        <Shield size={20} className="text-slate-600" />
                                    </button>
                                    <button
                                        onClick={() => setSelectedVault(null)}
                                        className="p-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
            >
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <TrendingUp size={20} className="text-blue-500" />
                    Causes & Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {association.focus.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + index * 0.05 }}
                            onClick={() => setSelectedFocus({
                                title: item,
                                image: getFocusImage(item, index),
                                description: association.focusDetails?.[item] || "Detailed description coming soon for this cause.",
                                index: index
                            })}
                            className="relative group overflow-hidden rounded-xl h-32 cursor-pointer"
                        >
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                style={{ backgroundImage: `url(${getFocusImage(item, index)})` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                            <div className="absolute inset-0 p-4 flex flex-col justify-end">
                                <h3 className="text-white font-semibold text-sm leading-tight">
                                    {item}
                                </h3>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            <AnimatePresence>
                {selectedFocus && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedFocus(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl"
                        >
                            <div
                                className="h-48 bg-cover bg-center relative"
                                style={{ backgroundImage: `url(${selectedFocus.image})` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <h2 className="text-2xl font-bold text-white">{selectedFocus.title}</h2>
                                    <p className="text-white/80 text-sm">{association.name}</p>
                                </div>
                            </div>
                            <div className="p-6">
                                <p className="text-slate-700 leading-relaxed">{selectedFocus.description}</p>
                                <button
                                    onClick={() => setSelectedFocus(null)}
                                    className="mt-6 w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {selectedVault && <div className="h-32" />}
        </div>
    );
};

export default AssociationDetail;
