import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';

interface ConnectModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
}

const ConnectModal: React.FC<ConnectModalProps> = ({ show, setShow }) => {
    const { address, connect } = useWallet();
    const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
    const [wallets, setWallets] = useState([
        {
            id: 'xumm',
            name: 'Xumm (Xaman)',
            description: 'Connect with Xumm wallet',
            icon: '🔷',
            available: false,
        },
        {
            id: 'gem',
            name: 'Gem Wallet',
            description: 'Connect with Gem Wallet',
            icon: '💎',
            available: false,
        },
    ]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const win = window as any;
            setWallets((prev) =>
                prev.map((wallet) => ({
                    ...wallet,
                    available:
                        wallet.id === 'xumm' ? !!win.xumm : wallet.id === 'gem' ? !!win.gemWallet : false,
                }))
            );
        }
    }, [show]);

    useEffect(() => {
        if (address) {
            setShow(false);
        }
    }, [address, setShow]);

    const handleConnect = async (walletId: string) => {
        setConnectingWallet(walletId);
        try {
            await connectWallet(walletId);
        } catch (error: any) {
            console.error('Connection error:', error);
            alert(error.message || 'Failed to connect wallet');
        } finally {
            setConnectingWallet(null);
        }
    };

    const connectWallet = async (walletId: string) => {
        const win = window as any;

        if (walletId === 'xumm' && win.xumm) {
            try {
                const xumm = win.xumm;
                let payload = null;
                try {
                    payload = await xumm.payload?.();
                } catch (e) {
                    payload = await xumm.request();
                }

                if (payload && payload.address) {
                    localStorage.setItem('xrpl_address', payload.address);
                    await connect();
                    return;
                }
                throw new Error('No address received from Xumm');
            } catch (e: any) {
                console.error('Xumm connection error:', e);
                throw new Error(e.message || 'Failed to connect to Xumm wallet');
            }
        } else if (walletId === 'gem' && win.gemWallet) {
            try {
                const gemWallet = win.gemWallet;
                const isConnected = await gemWallet.isConnected();
                if (!isConnected) {
                    await gemWallet.connect();
                }
                const account = await gemWallet.getAccount();
                if (account && account.address) {
                    localStorage.setItem('xrpl_address', account.address);
                    await connect();
                    return;
                }
                throw new Error('No address received from Gem Wallet');
            } catch (e: any) {
                console.error('Gem Wallet connection error:', e);
                throw new Error(e.message || 'Failed to connect to Gem Wallet');
            }
        } else {
            throw new Error('Wallet not available. Please install the wallet extension.');
        }
    };

    return (
        <AnimatePresence>
            {show && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShow(false)}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-slate-800">
                                <h2 className="text-2xl font-bold text-white">Connecter un wallet XRP</h2>
                                <button
                                    onClick={() => setShow(false)}
                                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="p-6 space-y-3">
                                {wallets.map((wallet) => (
                                    <button
                                        key={wallet.id}
                                        onClick={() => handleConnect(wallet.id)}
                                        disabled={!wallet.available || connectingWallet !== null}
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${wallet.available
                                            ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600 cursor-pointer'
                                            : 'bg-slate-900/50 border-slate-800 opacity-50 cursor-not-allowed'
                                            } ${connectingWallet !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <div className="text-3xl">{wallet.icon}</div>
                                        <div className="flex-1 text-left">
                                            <div className="font-semibold text-white">{wallet.name}</div>
                                            <div className="text-sm text-slate-400">{wallet.description}</div>
                                        </div>
                                        {connectingWallet === wallet.id && (
                                            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                        )}
                                        {!wallet.available && (
                                            <span className="text-xs text-slate-500">Non installé</span>
                                        )}
                                    </button>
                                ))}

                                {wallets.every((w) => !w.available) && (
                                    <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                                        <p className="text-sm text-slate-400 text-center">
                                            Aucun wallet XRP détecté. Veuillez installer{' '}
                                            <a
                                                href="https://xumm.app"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:text-blue-400 underline"
                                            >
                                                Xumm
                                            </a>{' '}
                                            ou{' '}
                                            <a
                                                href="https://gemwallet.com"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:text-blue-400 underline"
                                            >
                                                Gem Wallet
                                            </a>
                                            .
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ConnectModal;

