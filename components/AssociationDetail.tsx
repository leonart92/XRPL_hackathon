import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ExternalLink, MapPin, Globe, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Vault } from '../types';
import { ASSOCIATIONS, MOCK_VAULTS } from '../constants';

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
    if (text.includes('préservation') && text.includes('habitat')) {
        return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80';
    }
    if (text.includes('espace naturel')) {
        return 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80';
    }

    if (text.includes('océan') || text.includes('ocean')) {
        return 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80';
    }
    if (text.includes('littoral') || text.includes('côte')) {
        return 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&q=80';
    }
    if (text.includes('vague') || text.includes('surf')) {
        return 'https://images.unsplash.com/photo-1502933691298-84fc14542831?w=800&q=80';
    }

    if (text.includes('forêt') || text.includes('forest')) {
        return 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80';
    }
    if (text.includes('préservation') && text.includes('forêt')) {
        return 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&q=80';
    }

    if (text.includes('changement climatique') || text.includes('climat')) {
        return 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&q=80';
    }
    if (text.includes('plastique')) {
        return 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&q=80';
    }
    if (text.includes('pollution')) {
        return 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&q=80';
    }
    if (text.includes('déchet')) {
        return 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80';
    }

    if (text.includes('énergie') || text.includes('renouvelable')) {
        return 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80';
    }
    if (text.includes('agriculture') || text.includes('agricole')) {
        return 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80';
    }

    if (text.includes('qualité') && text.includes('eau')) {
        return 'https://images.unsplash.com/photo-1550093497-221331fbd264?w=800&q=80';
    }
    if (text.includes('eau')) {
        return 'https://images.unsplash.com/photo-1501696461415-6bd6660c6742?w=800&q=80';
    }

    if (text.includes('air') || text.includes('atmosphère')) {
        return 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&q=80';
    }
    if (text.includes('transition') && text.includes('énergétique')) {
        return 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80';
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
    const [investAmount, setInvestAmount] = useState('');
    const [selectedFocus, setSelectedFocus] = useState<{ title: string, image: string, description: string, index: number } | null>(null);

    const association = ASSOCIATIONS.find(a => a.id === associationId);
    const vault = MOCK_VAULTS.find(v => v.id === associationId);

    if (!association || !vault) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-slate-600">
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
            default: return 'text-slate-600 bg-slate-500/10 border-slate-500/20';
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group"
                >
                    <div className="p-2 rounded-full bg-slate-50 border border-slate-200 group-hover:border-slate-300 transition-colors">
                        <ArrowLeft size={20} />
                    </div>
                    <span className="font-medium">Back to Earn</span>
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-8">
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
                                    className="absolute -bottom-3 -right-3 px-2.5 py-1 rounded-lg text-xs font-bold border shadow-sm bg-white"
                                    style={{
                                        borderColor: `${association.branding.color}40`,
                                        color: association.branding.color,
                                    }}
                                >
                                    {association.symbol}
                                </div>
                            </div>
                            <div className="flex-1 pt-2">
                                <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-3 tracking-tight">
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

                        <p className="text-lg text-slate-700 leading-relaxed max-w-4xl">
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
                        <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-5 hover:bg-slate-50/80 transition-colors">
                            <div className="flex items-center gap-2 text-slate-600 mb-2">
                                <MapPin size={18} className="text-blue-400" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Location</span>
                            </div>
                            <div className="text-slate-900 font-medium text-lg">{association.location.headquarters}</div>
                            <div className="text-sm text-slate-600">{association.location.scope}</div>
                        </div>

                        <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-5 hover:bg-slate-50/80 transition-colors">
                            <div className="flex items-center gap-2 text-slate-600 mb-2">
                                <Globe size={18} className="text-blue-400" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Website</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <a
                                    href={association.contact.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-slate-900 hover:text-blue-400 font-medium flex items-center gap-2 transition-colors group"
                                >
                                    Visit Official Website
                                    <ExternalLink size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                                </a>
                                {association.contact.websiteFR && (
                                    <a
                                        href={association.contact.websiteFR}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-slate-600 hover:text-blue-400 flex items-center gap-2 transition-colors"
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
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <TrendingUp size={20} className="text-blue-400" />
                            Causes & Actions
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {association.focus.map((item, index) => (
                                <motion.div
                                    key={index}
                                    layoutId={`focus-card-${item}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    onClick={() => setSelectedFocus({
                                        title: item,
                                        image: getFocusImage(item, index),
                                        description: (association as any).focusDetails?.[item] || "Description détaillée à venir pour cette cause.",
                                        index: index
                                    })}
                                    className="relative group overflow-hidden rounded-xl h-48 cursor-pointer"
                                >
                                    {/* Image de fond */}
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                        style={{
                                            backgroundImage: `url(${getFocusImage(item, index)})`,
                                        }}
                                    />

                                    {/* Overlay gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 group-hover:from-black/95 transition-all duration-300" />

                                    {/* Contenu */}
                                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                        <div className="transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                                            <h3 className="text-slate-900 font-bold text-lg leading-tight mb-2">
                                                {item}
                                            </h3>
                                            <div
                                                className="h-1 w-12 rounded-full transition-all duration-300 group-hover:w-20"
                                                style={{
                                                    backgroundColor: association.branding.color,
                                                    boxShadow: `0 0 12px ${association.branding.color}`
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Border effect on hover */}
                                    <div
                                        className="absolute inset-0 border-2 border-transparent group-hover:border-white/20 rounded-xl transition-all duration-300"
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* APY Metric */}
                    {association.metrics && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="space-y-4"
                        >
                            <h2 className="text-xl font-bold text-slate-900">Expected Returns</h2>
                            <div className="bg-gradient-to-br from-blue-950 to-slate-900 border border-blue-500/30 rounded-xl p-6 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="text-sm text-blue-300/80 font-medium uppercase tracking-wider mb-2">Net APY</div>
                                <div className="text-4xl md:text-5xl font-bold text-blue-400 flex items-center gap-2">
                                    {association.metrics.netApy}%
                                    <ArrowUpRight size={24} className="text-green-500" />
                                </div>
                                {association.metrics.rewardsApy && (
                                    <div className="mt-3 text-sm text-green-400">
                                        + {association.metrics.rewardsApy}% Rewards APY
                                    </div>
                                )}
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
                    <div className="bg-slate-50/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 lg:sticky lg:top-24 shadow-xl">
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 mb-2">Manage Investment</h2>
                                <p className="text-sm text-slate-600">Support this cause and earn rewards</p>
                            </div>

                            {/* Wallet Balance */}
                            <div className="bg-white/50 border border-slate-200 rounded-xl p-4 flex justify-between items-center">
                                <div>
                                    <div className="text-xs text-slate-600 uppercase tracking-wider mb-1">Wallet Balance</div>
                                    <div className="text-xl font-bold text-slate-900">0.00 {association.symbol}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-600 uppercase tracking-wider mb-1">Value</div>
                                    <div className="text-sm font-medium text-slate-700">≈ $0.00</div>
                                </div>
                            </div>

                            {/* Investment Amount */}
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-slate-700">Amount to Invest</label>
                                <input
                                    type="number"
                                    value={investAmount}
                                    onChange={(e) => setInvestAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-white border border-slate-200 text-slate-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-mono"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3 pt-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-slate-900 font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2"
                                >
                                    Supply Assets
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-slate-100 hover:bg-slate-700 text-slate-700 font-bold py-3.5 rounded-xl border border-slate-300 transition-colors"
                                >
                                    Withdraw Assets
                                </motion.button>
                            </div>

                            {/* Risk Warning */}
                            <div className="bg-slate-100/30 border border-slate-200 rounded-xl p-4">
                                <p className="text-xs text-slate-600 leading-relaxed text-center">
                                    Supplying to {association.name} incurs smart contract risk. Please ensure you understand the risks before investing.
                                </p>
                            </div>

                            {/* Additional Info */}
                            <div className="text-xs text-slate-600 text-center">
                                No protocol fees enabled currently.
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Modal pour les détails de focus */}
            <AnimatePresence mode="wait">
                {selectedFocus && (
                    <motion.div
                        initial={{ backgroundColor: "rgba(0,0,0,0)", backdropFilter: "blur(0px)" }}
                        animate={{ backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", transition: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] } }}
                        exit={{ backgroundColor: "rgba(0,0,0,0)", backdropFilter: "blur(0px)", transition: { duration: 0.2, ease: [0.43, 0.13, 0.23, 0.96] } }}
                        onClick={() => setSelectedFocus(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            layoutId={`focus-card-${selectedFocus.title}`}
                            transition={{
                                layout: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] },
                                opacity: { duration: 0.2, ease: [0.43, 0.13, 0.23, 0.96] }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden max-w-6xl w-full h-[90vh] relative"
                        >
                            <div className="absolute inset-0 z-0">
                                <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{ backgroundImage: `url(${selectedFocus.image})` }}
                                />
                                <div className="absolute inset-0 bg-black/80" />
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.5 } }}
                                exit={{ opacity: 0, y: 0, transition: { duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] } }}
                                className="absolute inset-0 z-10 flex flex-col justify-center p-12 overflow-y-auto"
                            >
                                <div className="space-y-8 max-w-5xl mx-auto">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
                                    >
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: 96, transition: { delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
                                            className="h-1.5 rounded-full mb-6"
                                            style={{
                                                backgroundColor: association.branding.color,
                                                boxShadow: `0 0 12px ${association.branding.color}`
                                            }}
                                        />
                                        <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-4">
                                            {selectedFocus.title}
                                        </h2>
                                        <p className="text-slate-600 text-lg">
                                            {association.name}
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
                                        className=""
                                    >
                                        <p className="text-slate-200 text-xl md:text-2xl leading-relaxed">
                                            {selectedFocus.description}
                                        </p>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1, transition: { delay: 0.6, duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
                                        className="flex justify-end"
                                    >
                                        <motion.button
                                            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSelectedFocus(null)}
                                            className="px-8 py-4 bg-slate-100 hover:bg-slate-700 text-slate-900 font-bold text-lg rounded-xl transition-colors border border-slate-300"
                                        >
                                            Fermer
                                        </motion.button>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AssociationDetail;
