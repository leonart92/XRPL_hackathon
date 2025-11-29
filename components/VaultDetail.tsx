import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, TrendingUp, Clock, Coins, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../constants';
import { useVaultsContext } from '../contexts/VaultsContext';
import { useWallet } from '../contexts/WalletContext';
import { useDeposit } from '../hooks/useDeposit';
import { useTrustline } from '../hooks/useTrustline';

interface VaultDetailProps {
    vaultAddress: string;
    onBack: () => void;
}

const VaultDetail: React.FC<VaultDetailProps> = ({ vaultAddress, onBack }) => {
    const [investAmount, setInvestAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentStep, setCurrentStep] = useState<'idle' | 'trustline' | 'deposit' | 'success'>('idle');

    const { vaults, associations } = useVaultsContext();
    const { wallet, address, isConnected } = useWallet();

    const vault = vaults.find(v => v.vaultAddress === vaultAddress);
    const association = vault ? associations.find(a => a.id === vault.associationId) : null;

    const trustlineHook = vault ? useTrustline({
        vaultAddress: vault.vaultAddress,
        vaultTokenCurrency: vault.vaultTokenCurrency,
    }) : null;

    const depositHook = vault ? useDeposit({
        vaultAddress: vault.vaultAddress,
        acceptedCurrency: vault.acceptedCurrency,
        acceptedCurrencyIssuer: vault.acceptedCurrencyIssuer,
    }) : null;

    if (!vault || !association) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-slate-600">
                <p>Vault not found</p>
                <button onClick={onBack} className="mt-4 text-blue-400 hover:underline">Go Back</button>
            </div>
        );
    }

    const handleInvest = async () => {
        if (!investAmount || !address || !isConnected || !trustlineHook || !depositHook) {
            if (!isConnected) {
                alert('Please connect your wallet first');
            }
            return;
        }

        setIsProcessing(true);
        try {
            setCurrentStep('trustline');
            await trustlineHook.setupTrustline(address);
            
            setCurrentStep('deposit');
            await depositHook.deposit(address, investAmount);

            setCurrentStep('success');
            setInvestAmount('');
            
            setTimeout(() => {
                setCurrentStep('idle');
            }, 3000);
        } catch (error) {
            console.error('Investment failed:', error);
            alert(`Investment failed: ${(error as Error).message}`);
            setCurrentStep('idle');
        } finally {
            setIsProcessing(false);
        }
    };

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
            <div className="mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group"
                >
                    <div className="p-2 rounded-full bg-slate-50 border border-slate-200 group-hover:border-slate-300 transition-colors">
                        <ArrowLeft size={20} />
                    </div>
                    <span className="font-medium">Back</span>
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-start gap-6 mb-6">
                    <div className="relative shrink-0">
                        <img
                            src={association.branding.logo}
                            alt={association.name}
                            className="w-20 h-20 rounded-2xl bg-white p-2 shadow-lg object-contain"
                        />
                    </div>
                    <div className="flex-1 pt-2">
                        <div className="text-sm text-slate-500 mb-2">{association.name}</div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
                            {vault.name}
                        </h1>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            {vault.description}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                        <div className="flex items-center gap-2 text-green-600 mb-2">
                            <TrendingUp size={20} />
                            <span className="text-sm font-semibold uppercase tracking-wider">APY</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-green-700">{vault.netApy}%</span>
                            {vault.rewardsApy && (
                                <span className="text-lg text-green-600">+{vault.rewardsApy}%</span>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <div className="flex items-center gap-2 text-slate-600 mb-2">
                            <Coins size={20} />
                            <span className="text-sm font-semibold uppercase tracking-wider">TVL</span>
                        </div>
                        <div className="text-3xl font-bold text-slate-900">{formatCurrency(vault.totalSupply)}</div>
                        <div className="text-sm text-slate-500 mt-1">{vault.utilization.toFixed(1)}% utilization</div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <div className="flex items-center gap-2 text-slate-600 mb-2">
                            <Clock size={20} />
                            <span className="text-sm font-semibold uppercase tracking-wider">Lock Period</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900 mb-2">{vault.lockPeriod || 'No lock'}</div>
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold border ${getRiskColor(vault.riskFactor)}`}>
                            {vault.riskFactor} Risk
                        </span>
                    </div>
                </div>

                <div className="bg-white border-2 border-slate-200 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Invest in this Vault</h2>
                    
                    <AnimatePresence>
                        {currentStep !== 'idle' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 overflow-hidden"
                            >
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                                currentStep === 'trustline' ? 'bg-blue-500 text-white animate-pulse' : 
                                                currentStep === 'deposit' || currentStep === 'success' ? 'bg-green-500 text-white' : 
                                                'bg-slate-300 text-slate-600'
                                            }`}>
                                                {currentStep === 'deposit' || currentStep === 'success' ? <CheckCircle2 size={16} /> : '1'}
                                            </div>
                                            <span className={`text-sm font-semibold ${
                                                currentStep === 'trustline' ? 'text-blue-700' : 
                                                currentStep === 'deposit' || currentStep === 'success' ? 'text-green-700' : 
                                                'text-slate-600'
                                            }`}>
                                                Setup Trustline
                                            </span>
                                        </div>
                                        
                                        <div className="flex-1 h-0.5 bg-slate-300 mx-3">
                                            <div className={`h-full transition-all duration-500 ${
                                                currentStep === 'deposit' || currentStep === 'success' ? 'bg-green-500 w-full' : 'bg-blue-500 w-0'
                                            }`} />
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                                currentStep === 'deposit' ? 'bg-blue-500 text-white animate-pulse' : 
                                                currentStep === 'success' ? 'bg-green-500 text-white' : 
                                                'bg-slate-300 text-slate-600'
                                            }`}>
                                                {currentStep === 'success' ? <CheckCircle2 size={16} /> : '2'}
                                            </div>
                                            <span className={`text-sm font-semibold ${
                                                currentStep === 'deposit' ? 'text-blue-700' : 
                                                currentStep === 'success' ? 'text-green-700' : 
                                                'text-slate-600'
                                            }`}>
                                                Deposit Funds
                                            </span>
                                        </div>
                                        
                                        <div className="flex-1 h-0.5 bg-slate-300 mx-3">
                                            <div className={`h-full transition-all duration-500 ${
                                                currentStep === 'success' ? 'bg-green-500 w-full' : 'bg-blue-500 w-0'
                                            }`} />
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                                currentStep === 'success' ? 'bg-green-500 text-white' : 
                                                'bg-slate-300 text-slate-600'
                                            }`}>
                                                {currentStep === 'success' ? <CheckCircle2 size={16} /> : '3'}
                                            </div>
                                            <span className={`text-sm font-semibold ${
                                                currentStep === 'success' ? 'text-green-700' : 
                                                'text-slate-600'
                                            }`}>
                                                Complete
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="text-center">
                                        {currentStep === 'trustline' && (
                                            <p className="text-blue-800 text-sm font-medium">
                                                Please approve the trustline transaction in your wallet...
                                            </p>
                                        )}
                                        {currentStep === 'deposit' && (
                                            <p className="text-blue-800 text-sm font-medium">
                                                Please approve the deposit transaction in your wallet...
                                            </p>
                                        )}
                                        {currentStep === 'success' && (
                                            <p className="text-green-800 text-sm font-medium flex items-center justify-center gap-2">
                                                <CheckCircle2 size={16} />
                                                Success! Investment complete
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Amount ({vault.acceptedCurrency})
                            </label>
                            <input
                                type="number"
                                value={investAmount}
                                onChange={(e) => setInvestAmount(e.target.value)}
                                placeholder="Enter amount"
                                disabled={isProcessing}
                                className="w-full bg-slate-50 border-2 border-slate-200 text-slate-900 px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-lg disabled:opacity-50 transition-all"
                            />
                        </div>
                        
                        <motion.button
                            whileHover={!isProcessing ? { scale: 1.02 } : {}}
                            whileTap={!isProcessing ? { scale: 0.98 } : {}}
                            onClick={handleInvest}
                            disabled={isProcessing || !isConnected || !investAmount}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl transition-colors shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                        >
                            {currentStep === 'trustline' ? 'Approving Trustline...' : 
                             currentStep === 'deposit' ? 'Approving Deposit...' :
                             currentStep === 'success' ? 'Success!' :
                             isConnected ? 'Deposit' : 'Connect Wallet'}
                        </motion.button>
                    </div>

                    {isConnected && address && (
                        <div className="mt-4 text-sm text-slate-500">
                            Connected: {address.substring(0, 8)}...{address.substring(address.length - 6)}
                        </div>
                    )}
                </div>

                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="font-bold text-blue-900 mb-3">About this Vault</h3>
                    <div className="space-y-2 text-sm text-blue-800">
                        <p><strong>Strategy:</strong> {vault.strategyType}</p>
                        <p><strong>Accepted Currency:</strong> {vault.acceptedCurrency}</p>
                        <p><strong>Vault Address:</strong> <code className="bg-blue-100 px-2 py-1 rounded text-xs">{vault.vaultAddress}</code></p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default VaultDetail;
