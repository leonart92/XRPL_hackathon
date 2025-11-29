import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, TrendingUp, Clock, Coins, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../constants';
import { useVaultsContext } from '../contexts/VaultsContext';
import { useWallet } from '../contexts/WalletContext';
import { useDeposit } from '../hooks/useDeposit';
import { useTrustline } from '../hooks/useTrustline';
import { useVaultBalance } from '../hooks/useVaultBalance';
import { useWithdraw } from '../hooks/useWithdraw';

interface VaultDetailProps {
    vaultAddress: string;
    onBack: () => void;
}

const VaultDetail: React.FC<VaultDetailProps> = ({ vaultAddress, onBack }) => {
    const [investAmount, setInvestAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentStep, setCurrentStep] = useState<'idle' | 'trustline' | 'deposit' | 'withdraw' | 'success'>('idle');
    const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
    const [showNotFound, setShowNotFound] = useState(false);

    const { vaults, associations, loading } = useVaultsContext();
    const { wallet, address, isConnected } = useWallet();

    console.log('[VaultDetail] vaultAddress:', vaultAddress);
    console.log('[VaultDetail] vaults:', vaults);
    console.log('[VaultDetail] loading:', loading);

    const vault = vaults.find(v => v.vaultAddress === vaultAddress);
    const association = vault ? associations.find(a => a.id === vault.associationId) : null;

    console.log('[VaultDetail] found vault:', vault);
    console.log('[VaultDetail] found association:', association);

    useEffect(() => {
        if (!loading && !vault) {
            const timer = setTimeout(() => {
                setShowNotFound(true);
            }, 10000);
            return () => clearTimeout(timer);
        } else if (vault) {
            setShowNotFound(false);
        }
    }, [loading, vault]);

    const trustlineHook = useTrustline({
        vaultAddress: vault?.vaultAddress || '',
        vaultTokenCurrency: vault?.vaultTokenCurrency || '',
    });

    const depositHook = useDeposit({
        vaultAddress: vault?.vaultAddress || '',
        acceptedCurrency: vault?.acceptedCurrency || '',
        acceptedCurrencyIssuer: vault?.acceptedCurrencyIssuer || '',
    });

    const { balance: userBalance, loading: balanceLoading, refetch: refetchBalance } = useVaultBalance({
        vaultAddress: vault?.vaultAddress || '',
        userAddress: address || '',
        vaultTokenCurrency: vault?.vaultTokenCurrency || '',
    });

    const withdrawHook = useWithdraw({
        vaultAddress: vault?.vaultAddress || '',
        vaultTokenCurrency: vault?.vaultTokenCurrency || '',
    });

    if (loading || !vault) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                    <div className="flex-1">
                        <div className="h-8 bg-slate-200 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-100 p-6 rounded-2xl">
                        <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-slate-200 rounded w-2/3"></div>
                    </div>
                    <div className="bg-slate-100 p-6 rounded-2xl">
                        <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-slate-200 rounded w-2/3"></div>
                    </div>
                    <div className="bg-slate-100 p-6 rounded-2xl">
                        <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-slate-200 rounded w-2/3"></div>
                    </div>
                </div>
                <div className="bg-slate-100 p-8 rounded-2xl">
                    <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-full"></div>
                        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                        <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (showNotFound) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-slate-600">
                <p className="text-xl font-semibold text-slate-900 mb-2">Page Not Found</p>
                <p className="text-sm text-slate-500 mb-4">The project you're looking for doesn't exist</p>
                <button onClick={onBack} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Go Back</button>
            </div>
        );
    }

    if (!association) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                    <div className="flex-1">
                        <div className="h-8 bg-slate-200 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        );
    }

    const handleInvest = async () => {
        if (!investAmount || !address || !isConnected) {
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
            
            await refetchBalance();
            
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

    const handleWithdraw = async () => {
        if (!withdrawAmount || !address || !isConnected) {
            if (!isConnected) {
                alert('Please connect your wallet first');
            }
            return;
        }

        const withdrawAmountNum = parseFloat(withdrawAmount);
        const balanceNum = parseFloat(userBalance || '0');
        
        if (withdrawAmountNum > balanceNum) {
            alert(`Insufficient balance. You have ${balanceNum} ${vault.vaultTokenCurrency}`);
            return;
        }

        setIsProcessing(true);
        try {
            setCurrentStep('withdraw');
            await withdrawHook.withdraw(address, withdrawAmount);

            setCurrentStep('success');
            setWithdrawAmount('');
            
            await refetchBalance();
            
            setTimeout(() => {
                setCurrentStep('idle');
            }, 3000);
        } catch (error) {
            console.error('Withdrawal failed:', error);
            alert(`Withdrawal failed: ${(error as Error).message}`);
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

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                        <div className="flex items-center gap-2 text-green-600 mb-2">
                            <TrendingUp size={20} />
                            <span className="text-sm font-semibold uppercase tracking-wider">Annual Return</span>
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
                            <span className="text-sm font-semibold uppercase tracking-wider">Total Funding</span>
                        </div>
                        <div className="text-3xl font-bold text-slate-900">{formatCurrency(vault.totalSupply)}</div>
                        <div className="text-sm text-slate-500 mt-1">{vault.utilization.toFixed(1)}% deployed</div>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                            <Coins size={20} />
                            <span className="text-sm font-semibold uppercase tracking-wider">Your Investment</span>
                        </div>
                        {balanceLoading ? (
                            <div className="text-2xl font-bold text-blue-600">Loading...</div>
                        ) : address ? (
                            <>
                                <div className="text-3xl font-bold text-blue-700">{parseFloat(userBalance || '0').toFixed(2)}</div>
                                <div className="text-sm text-blue-600 mt-1">{vault.vaultTokenCurrency}</div>
                            </>
                        ) : (
                            <div className="text-sm text-slate-500">Connect wallet</div>
                        )}
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
                    <div className="flex gap-4 mb-6 border-b border-slate-200">
                        <button
                            onClick={() => setActiveTab('deposit')}
                            className={`pb-3 px-4 font-bold text-lg transition-colors ${
                                activeTab === 'deposit'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            Invest
                        </button>
                        <button
                            onClick={() => setActiveTab('withdraw')}
                            className={`pb-3 px-4 font-bold text-lg transition-colors ${
                                activeTab === 'withdraw'
                                    ? 'text-orange-600 border-b-2 border-orange-600'
                                    : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            Withdraw
                        </button>
                    </div>
                    
                    <AnimatePresence>
                        {currentStep !== 'idle' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 overflow-hidden"
                            >
                                <div className={`${activeTab === 'deposit' ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} border rounded-xl p-4`}>
                                    {activeTab === 'deposit' ? (
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
                                    ) : (
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                                    currentStep === 'withdraw' ? 'bg-orange-500 text-white animate-pulse' : 
                                                    currentStep === 'success' ? 'bg-green-500 text-white' : 
                                                    'bg-slate-300 text-slate-600'
                                                }`}>
                                                    {currentStep === 'success' ? <CheckCircle2 size={16} /> : '1'}
                                                </div>
                                                <span className={`text-sm font-semibold ${
                                                    currentStep === 'withdraw' ? 'text-orange-700' : 
                                                    currentStep === 'success' ? 'text-green-700' : 
                                                    'text-slate-600'
                                                }`}>
                                                    Withdraw Funds
                                                </span>
                                            </div>
                                            
                                            <div className="flex-1 h-0.5 bg-slate-300 mx-3">
                                                <div className={`h-full transition-all duration-500 ${
                                                    currentStep === 'success' ? 'bg-green-500 w-full' : 'bg-orange-500 w-0'
                                                }`} />
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                                    currentStep === 'success' ? 'bg-green-500 text-white' : 
                                                    'bg-slate-300 text-slate-600'
                                                }`}>
                                                    {currentStep === 'success' ? <CheckCircle2 size={16} /> : '2'}
                                                </div>
                                                <span className={`text-sm font-semibold ${
                                                    currentStep === 'success' ? 'text-green-700' : 
                                                    'text-slate-600'
                                                }`}>
                                                    Complete
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    
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
                                        {currentStep === 'withdraw' && (
                                            <p className="text-orange-800 text-sm font-medium">
                                                Please approve the withdrawal transaction in your wallet...
                                            </p>
                                        )}
                                        {currentStep === 'success' && (
                                            <p className="text-green-800 text-sm font-medium flex items-center justify-center gap-2">
                                                <CheckCircle2 size={16} />
                                                {activeTab === 'deposit' ? 'Success! Deposit complete' : 'Success! Withdrawal complete'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
{activeTab === 'deposit' ? (
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
                                 {currentStep === 'trustline' ? 'Setting Up...' : 
                                 currentStep === 'deposit' ? 'Investing...' :
                                 currentStep === 'success' ? 'Success!' :
                                 isConnected ? 'Invest Now' : 'Connect Wallet'}
                            </motion.button>
                        </div>
                    ) : (
                        <div>
                            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Amount ({vault.vaultTokenCurrency})
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={withdrawAmount}
                                            onChange={(e) => setWithdrawAmount(e.target.value)}
                                            placeholder="Enter amount"
                                            disabled={isProcessing}
                                            className="w-full bg-slate-50 border-2 border-slate-200 text-slate-900 px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-lg disabled:opacity-50 transition-all"
                                        />
                                        <button
                                            onClick={() => setWithdrawAmount(userBalance || '0')}
                                            disabled={isProcessing || !userBalance || parseFloat(userBalance) === 0}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-orange-600 hover:text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed bg-orange-50 px-3 py-1 rounded-lg"
                                        >
                                            MAX
                                        </button>
                                    </div>
                                </div>
                                
                                <motion.button
                                    whileHover={!isProcessing ? { scale: 1.02 } : {}}
                                    whileTap={!isProcessing ? { scale: 0.98 } : {}}
                                    onClick={handleWithdraw}
                                    disabled={isProcessing || !isConnected || !withdrawAmount}
                                    className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-8 py-4 rounded-xl transition-colors shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg whitespace-nowrap"
                                >
                                     {currentStep === 'withdraw' ? 'Processing...' :
                                     currentStep === 'success' ? 'Success!' :
                                     isConnected ? 'Withdraw' : 'Connect Wallet'}
                                </motion.button>
                            </div>
                            {userBalance && (
                                <div className="mt-2 text-sm text-slate-500">
                                    Available: {parseFloat(userBalance).toFixed(2)} {vault.vaultTokenCurrency}
                                </div>
                            )}
                        </div>
                    )}

                    {isConnected && address && (
                        <div className="mt-4 text-sm text-slate-500">
                            Connected: {address.substring(0, 8)}...{address.substring(address.length - 6)}
                        </div>
                    )}
                </div>

                <div className="mt-8 bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-8">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="bg-green-500 text-white p-3 rounded-full">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-green-900 text-xl mb-2">Real-World Impact</h3>
                            <p className="text-green-800 text-sm leading-relaxed">
                                Your investment directly supports {association.name}'s mission to protect our environment.
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 space-y-3">
                        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-green-100">
                            <p className="text-sm text-slate-700">
                                <strong className="text-green-700">Project Focus:</strong> {vault.strategyType === 'TokenYield' ? 'Sustainable token yield generation' : 'Automated market making for environmental tokens'}
                            </p>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-green-100">
                            <p className="text-sm text-slate-700">
                                <strong className="text-green-700">Your Contribution:</strong> Every {vault.acceptedCurrency} you invest helps fund environmental initiatives while generating sustainable returns.
                            </p>
                        </div>
                        {association.shortName === 'WWF' && (
                            <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-green-100">
                                <p className="text-sm text-slate-700">
                                    <strong className="text-green-700">Example Impact:</strong> Funding wildlife conservation, protecting endangered species, and preserving critical habitats worldwide.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default VaultDetail;
