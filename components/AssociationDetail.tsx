import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, MapPin, Globe, TrendingUp, Clock, Coins, ChevronRight } from 'lucide-react';
import { Vault } from '../types';
import { formatCurrency } from '../constants';
import { useVaultsContext } from '../contexts/VaultsContext';
import Tooltip from './Tooltip';

interface AssociationDetailProps {
    associationId: string;
    onBack: () => void;
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
}) => {
    const [selectedFocus, setSelectedFocus] = useState<{ title: string, image: string, description: string, index: number } | null>(null);
    const navigate = useNavigate();

    const { vaults, associations } = useVaultsContext();

    const association = associations.find(a => a.id === associationId);
    const associationVaults = vaults.filter(v => v.associationId === associationId);

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

    const getConfidenceLevel = (risk: string) => {
        switch (risk) {
            case 'Low': return 'Established';
            case 'Medium': return 'Growing';
            case 'High': return 'New';
            default: return risk;
        }
    };

    return (
        <main role="main" className="min-h-screen bg-white">
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
                    Ways to Support This Cause
                    <span className="text-sm font-normal text-slate-500 ml-2">
                                 ({associationVaults.length} projects available)
                    </span>
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {associationVaults.map((vault, index) => (
                        <motion.div
                            key={vault.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            onClick={() => navigate(`/vault/${vault.vaultAddress}`)}
                            className="relative bg-white rounded-xl border-2 border-slate-200 hover:border-slate-300 p-5 cursor-pointer transition-all hover:shadow-lg"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">{vault.name}</h3>
                                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{vault.description}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-400" />
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-4">
                                {vault.netApy !== undefined && (
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                                            <Tooltip term="Annual Growth" explanation="How much your contribution grows each year.">
                                                Growth Rate
                                            </Tooltip>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-xl font-bold text-green-600">{vault.netApy}%</span>
                                            {vault.rewardsApy && (
                                                <span className="text-xs text-green-500">+{vault.rewardsApy}%</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {vault.riskFactor && (
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                                            <Tooltip term="Confidence Level" explanation="How established this project is. Established = proven track record, Growing = expanding impact, New = recently launched.">
                                                Confidence
                                            </Tooltip>
                                        </div>
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${getRiskColor(vault.riskFactor)}`}>
                                            {getConfidenceLevel(vault.riskFactor)}
                                        </span>
                                    </div>
                                )}
                                {vault.lockPeriod && (
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                                            <Tooltip term="Commitment Time" explanation="How long your support stays with this project before you can withdraw.">
                                                Duration
                                            </Tooltip>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-slate-700">
                                            <Clock size={12} />
                                            {vault.lockPeriod}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {(vault.totalSupply !== undefined || vault.utilization !== undefined) && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                                    {vault.totalSupply !== undefined && (
                                        <div className="text-sm text-slate-500">
                                            <span className="font-medium text-slate-700">{formatCurrency(vault.totalSupply)}</span> funded
                                        </div>
                                    )}
                                    {vault.utilization !== undefined && (
                                        <div className="text-sm text-slate-500">
                                            <span className="font-medium text-slate-700">{vault.utilization.toFixed(1)}%</span> in active use
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </motion.div>

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
        </main>
    );
};

export default AssociationDetail;
