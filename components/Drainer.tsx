import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Check, ChevronRight, Sparkles, Trash2, ArrowRight, Key, Gift, AlertCircle, Eye, EyeOff, Loader2, ShieldAlert } from 'lucide-react';
import { ASSOCIATIONS } from '../constants';

interface DeadWallet {
    id: string;
    address: string;
    balance: number;
    token: string;
    usdValue: number;
    lastActivity: string;
}

const MOCK_DEAD_WALLETS: DeadWallet[] = [
    { id: '1', address: 'rN7n3473SaZBCG4d...', balance: 0.42, token: 'XRP', usdValue: 0.89, lastActivity: '6 months ago' },
    { id: '2', address: 'rPT1Sjq2YGrBMT...', balance: 1.23, token: 'XRP', usdValue: 2.61, lastActivity: '1 year ago' },
    { id: '3', address: 'rLHzPsX3F6iN3...', balance: 0.08, token: 'XRP', usdValue: 0.17, lastActivity: '8 months ago' },
    { id: '4', address: 'rKLpjpCoXgLQ...', balance: 2.51, token: 'XRP', usdValue: 5.32, lastActivity: '3 months ago' },
    { id: '5', address: 'rGhp4XrT9nB2...', balance: 0.15, token: 'XRP', usdValue: 0.32, lastActivity: '2 years ago' },
];

const Drainer: React.FC = () => {
    const [seedPhrase, setSeedPhrase] = useState('');
    const [showSeed, setShowSeed] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [wallets, setWallets] = useState<DeadWallet[]>([]);
    const [selectedWallets, setSelectedWallets] = useState<string[]>([]);
    const [step, setStep] = useState<'seed' | 'select' | 'confirm' | 'success'>('seed');
    const [isDraining, setIsDraining] = useState(false);
    const [selectedAssociation, setSelectedAssociation] = useState(ASSOCIATIONS[0]?.id || '');
    const [seedError, setSeedError] = useState('');

    const totalSelected = wallets.filter(w => selectedWallets.includes(w.id));
    const totalXRP = totalSelected.reduce((acc, w) => acc + w.balance, 0);
    const totalUSD = totalSelected.reduce((acc, w) => acc + w.usdValue, 0);

    const handleScanWallets = () => {
        setSeedError('');

        if (!seedPhrase.trim()) {
            setSeedError('Please enter your seed phrase');
            return;
        }

        setIsScanning(true);

        setTimeout(() => {
            setWallets(MOCK_DEAD_WALLETS);
            setIsScanning(false);
            setStep('select');
        }, 2000);
    };

    const toggleWallet = (id: string) => {
        setSelectedWallets(prev =>
            prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedWallets.length === wallets.length) {
            setSelectedWallets([]);
        } else {
            setSelectedWallets(wallets.map(w => w.id));
        }
    };

    const handleDrain = () => {
        setIsDraining(true);
        setTimeout(() => {
            setIsDraining(false);
            setStep('success');
        }, 2000);
    };

    const reset = () => {
        setStep('seed');
        setSeedPhrase('');
        setWallets([]);
        setSelectedWallets([]);
    };

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
            >
                <motion.div
                    className="absolute -left-4 top-0 w-1 h-16 bg-orange-500 rounded-full"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 64, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-2">
                    <span className="inline-flex items-center gap-3">
                        Give a Tip
                    </span>
                </h1>
                <p className="text-slate-600 text-lg max-w-xl">
                    Reclaim unused XRP from old wallets and donate it to the environmental organization of your choice.
                </p>
            </motion.div>

            <AnimatePresence mode="wait">
                {step === 'seed' && (
                    <motion.div
                        key="seed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="max-w-xl mx-auto space-y-6"
                    >
                        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
                                    <Key className="w-8 h-8 text-orange-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Find Your Old Wallets</h2>
                                <p className="text-slate-600">
                                    Enter your recovery phrase to discover wallets with unused XRP that you can donate.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="relative">
                                    <textarea
                                        value={seedPhrase}
                                         onChange={(e) => {
                                            setSeedPhrase(e.target.value);
                                            setSeedError('');
                                        }}
                                        placeholder="Enter your 12 or 24 word recovery phrase..."
                                        rows={4}
                                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all resize-none font-mono text-sm ${seedError
                                            ? 'border-red-300 focus:ring-red-500/30 focus:border-red-500'
                                            : 'border-slate-200 focus:ring-blue-500/30 focus:border-blue-500'
                                            } ${showSeed ? '' : 'text-security-disc'}`}
                                        style={!showSeed ? { WebkitTextSecurity: 'disc' } as React.CSSProperties : {}}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowSeed(!showSeed)}
                                        className="absolute right-3 top-3 p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
                                    >
                                        {showSeed ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {seedError && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-sm text-red-500 flex items-center gap-2"
                                    >
                                        <AlertCircle className="w-4 h-4" />
                                        {seedError}
                                    </motion.p>
                                )}

                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-amber-800">
                                            <span className="font-semibold">Privacy First:</span> Your recovery phrase is processed locally and never stored or sent anywhere.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleScanWallets}
                                disabled={isScanning || !seedPhrase.trim()}
                                className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 bg-orange-500 hover:bg-orange-400 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/20 disabled:shadow-none"
                            >
                                {isScanning ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Scanning Wallets...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Find Old Wallets
                                        <ChevronRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 'select' && (
                    <motion.div
                        key="select"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={selectAll}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedWallets.length === wallets.length
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                >
                                    <Check className="w-4 h-4" />
                                    {selectedWallets.length === wallets.length ? 'Deselect All' : 'Select All'}
                                </button>
                                <span className="text-sm text-slate-500">
                                    {selectedWallets.length} of {wallets.length} selected
                                </span>
                            </div>

                            {selectedWallets.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-3 px-4 py-2 bg-orange-50 border border-orange-200 rounded-xl"
                                >
                                    <Sparkles className="w-5 h-5 text-orange-500" />
                                    <span className="font-semibold text-orange-700">{totalXRP.toFixed(2)} XRP</span>
                                    <span className="text-orange-500">≈ ${totalUSD.toFixed(2)}</span>
                                </motion.div>
                            )}
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg">
                            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50">
                                <div className="col-span-1"></div>
                                <div className="col-span-4">Wallet</div>
                                <div className="col-span-2 text-right">Balance</div>
                                <div className="col-span-2 text-right">USD Value</div>
                                <div className="col-span-3 text-right">Last Activity</div>
                            </div>

                            {wallets.map((wallet, index) => {
                                const isSelected = selectedWallets.includes(wallet.id);
                                return (
                                    <motion.div
                                        key={wallet.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => toggleWallet(wallet.id)}
                                        className={`grid grid-cols-12 gap-4 px-6 py-4 items-center cursor-pointer transition-all ${isSelected
                                            ? 'bg-blue-50/50 border-l-4 border-l-blue-500'
                                            : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                                            } ${index !== wallets.length - 1 ? 'border-b border-slate-100' : ''}`}
                                    >
                                        <div className="col-span-1">
                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected
                                                ? 'bg-blue-600 border-blue-600'
                                                : 'border-slate-300 hover:border-blue-400'
                                                }`}>
                                                {isSelected && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                        </div>
                                        <div className="col-span-4">
                                            <div className="font-mono text-sm text-slate-900">{wallet.address}</div>
                                        </div>
                                        <div className="col-span-2 text-right">
                                            <span className="font-semibold text-slate-900">{wallet.balance} {wallet.token}</span>
                                        </div>
                                        <div className="col-span-2 text-right">
                                            <span className="text-slate-600">${wallet.usdValue.toFixed(2)}</span>
                                        </div>
                                        <div className="col-span-3 text-right">
                                            <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                                                {wallet.lastActivity}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex justify-end"
                        >
                            <button
                                onClick={() => setStep('confirm')}
                                disabled={selectedWallets.length === 0}
                                className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-400 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/20 disabled:shadow-none"
                            >
                                <Gift className="w-5 h-5" />
                                Donate Selected
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {step === 'confirm' && (
                    <motion.div
                        key="confirm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="max-w-2xl mx-auto space-y-6"
                    >
                        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
                                    <Gift className="w-8 h-8 text-orange-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Choose Your Organization</h2>
                                <p className="text-slate-600">
                                    Your tip of <span className="font-semibold text-orange-600">{totalXRP.toFixed(2)} XRP</span> (≈${totalUSD.toFixed(2)}) will support their environmental mission.
                                </p>
                            </div>

                            <div className="space-y-4 mb-8">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Select an organization to receive your tip
                                </label>
                                <div className="grid gap-3">
                                    {ASSOCIATIONS.slice(0, 4).map(association => (
                                        <button
                                            key={association.id}
                                            onClick={() => setSelectedAssociation(association.id)}
                                            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${selectedAssociation === association.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-slate-200 hover:border-slate-300 bg-white'
                                                }`}
                                        >
                                            <img
                                                src={association.branding.logo}
                                                alt={association.name}
                                                className="w-12 h-12 rounded-lg object-contain bg-white p-1"
                                            />
                                            <div className="flex-1">
                                                <div className="font-semibold text-slate-900">{association.name}</div>
                                                <div className="text-sm text-slate-500">{association.category}</div>
                                            </div>
                                            {selectedAssociation === association.id && (
                                                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-amber-800">
                                        <span className="font-semibold">One-time donation.</span> Your tip will be sent directly to the organization's verified wallet.
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep('select')}
                                    className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleDrain}
                                    disabled={isDraining}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-400 disabled:bg-orange-300 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/20"
                                >
                                    {isDraining ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                            />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Gift className="w-5 h-5" />
                                            Send My Tip
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 'success' && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="max-w-lg mx-auto text-center py-12"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                            className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Check className="w-12 h-12 text-green-600" />
                            </motion.div>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-3xl font-bold text-slate-900 mb-3"
                        >
                            Thank You for Your Tip!
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-slate-600 mb-2"
                        >
                            You've donated <span className="font-semibold text-green-600">{totalXRP.toFixed(2)} XRP</span> to help protect our planet.
                        </motion.p>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="text-sm text-slate-500 mb-8"
                        >
                            Thank you for making a difference! 🌍
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="flex gap-3 justify-center"
                        >
                            <button
                                onClick={reset}
                                className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all"
                            >
                                <Gift className="w-5 h-5" />
                                Give Another Tip
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Drainer;

