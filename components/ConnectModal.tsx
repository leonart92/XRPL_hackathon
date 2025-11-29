import React, { useState, useEffect, useCallback } from 'react';
import { X, Chrome, Smartphone, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';
import { isInstalled as isGemWalletInstalled, getAddress as getGemWalletAddress } from '@gemwallet/api';
import { Xumm } from 'xumm';

interface ConnectModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
}

interface WalletOption {
    id: string;
    name: string;
    description: string;
    icon?: string;
    logo?: string;
    type: 'extension' | 'qrcode';
    available: boolean;
    installUrl?: string;
}

const ConnectModal: React.FC<ConnectModalProps> = ({ show, setShow }) => {
    const { address, connect } = useWallet();
    const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [xummInstance, setXummInstance] = useState<Xumm | null>(null);
    const xummApiKey = (import.meta as any).env?.VITE_XUMM_API_KEY;
    const hasXummApiKey = !!xummApiKey;

    const [wallets, setWallets] = useState<WalletOption[]>([
        {
            id: 'xumm-qr',
            name: 'Xumm (QR Code)',
            description: hasXummApiKey ? 'Scan with Xumm app on mobile' : 'Configure VITE_XUMM_API_KEY',
            icon: '📱',
            type: 'qrcode',
            available: hasXummApiKey,
        },
        {
            id: 'gem',
            name: 'GemWallet',
            description: 'Chrome extension for XRPL',
            logo: '/gemWalletLogo.png',
            type: 'extension',
            available: false,
            installUrl: 'https://gemwallet.app',
        },
        {
            id: 'crossmark',
            name: 'Crossmark',
            description: 'Chrome extension for XRPL',
            logo: '/crossmarkLogo.png',
            type: 'extension',
            available: false,
            installUrl: 'https://crossmark.io',
        },
    ]);

    useEffect(() => {
        const checkWallets = async () => {
            const win = window as any;

            let gemAvailable = false;
            try {
                const gemInstalled = await isGemWalletInstalled();
                gemAvailable = gemInstalled.result.isInstalled;
            } catch {
                gemAvailable = !!win.gemWallet;
            }

            const crossmarkAvailable = !!win.crossmark;

            setWallets((prev) =>
                prev.map((wallet) => ({
                    ...wallet,
                    available:
                        wallet.id === 'gem' ? gemAvailable :
                            wallet.id === 'crossmark' ? crossmarkAvailable :
                                wallet.available,
                }))
            );
        };

        if (show) {
            checkWallets();
        }
    }, [show]);

    useEffect(() => {
        if (address) {
            setShow(false);
            setQrCodeUrl(null);
        }
    }, [address, setShow]);

    useEffect(() => {
        if (!show) {
            setQrCodeUrl(null);
            setConnectingWallet(null);
        }
    }, [show]);

    const handleConnect = async (walletId: string) => {
        setConnectingWallet(walletId);
        setQrCodeUrl(null);

        try {
            await connectWallet(walletId);
        } catch (error: any) {
            console.error('Connection error:', error);
            if (error.message !== 'cancelled') {
                alert(error.message || 'Connection failed');
            }
        } finally {
            setConnectingWallet(null);
        }
    };

    const connectWallet = async (walletId: string) => {
        const win = window as any;

        if (walletId === 'xumm-qr') {
            try {
                if (!xummApiKey) {
                    throw new Error('Xumm API key not configured. Add VITE_XUMM_API_KEY to your .env file');
                }

                const xumm = new Xumm(xummApiKey);
                setXummInstance(xumm);

                const payload = await xumm.payload?.create({
                    txjson: {
                        TransactionType: 'SignIn'
                    }
                });

                if (!payload?.uuid) {
                    throw new Error('Unable to create Xumm payload');
                }

                if (payload?.refs?.qr_png) {
                    setQrCodeUrl(payload.refs.qr_png);
                }

                const subscription = await xumm.payload?.subscribe(payload.uuid, (event) => {
                    if (event.data.signed === true) {
                        return true; // Resolve the subscription
                    }
                    if (event.data.signed === false) {
                        throw new Error('Connection rejected by user');
                    }
                });

                const resolvedPayload = await subscription?.resolved as any;

                if (resolvedPayload?.response?.account) {
                    localStorage.setItem('xrpl_address', resolvedPayload.response.account);
                    await connect();
                    return;
                }

                throw new Error('Connection cancelled or expired');
            } catch (e: any) {
                console.error('Xumm QR error:', e);
                throw new Error(e.message || 'Failed to connect via QR code');
            }
        }

        if (walletId === 'gem') {
            try {
                const response = await getGemWalletAddress();
                if (response.result?.address) {
                    localStorage.setItem('xrpl_address', response.result.address);
                    await connect();
                    return;
                }
                throw new Error('No address received from GemWallet');
            } catch (e: any) {
                console.error('GemWallet error:', e);
                throw new Error(e.message || 'Failed to connect to GemWallet');
            }
        }

        if (walletId === 'crossmark') {
            try {
                const crossmark = win.crossmark;
                if (!crossmark) {
                    throw new Error('Crossmark not detected');
                }

                const response = await crossmark.signInAndWait();
                if (response?.response?.data?.address) {
                    localStorage.setItem('xrpl_address', response.response.data.address);
                    await connect();
                    return;
                }
                throw new Error('No address received from Crossmark');
            } catch (e: any) {
                console.error('Crossmark error:', e);
                throw new Error(e.message || 'Failed to connect to Crossmark');
            }
        }

        throw new Error('Wallet not supported');
    };

    const extensionWallets = wallets.filter(w => w.type === 'extension');
    const qrWallets = wallets.filter(w => w.type === 'qrcode');

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
                                <h2 className="text-xl font-bold text-white">Connect XRPL Wallet</h2>
                                <button
                                    onClick={() => setShow(false)}
                                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {qrCodeUrl && (
                                    <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-xl">
                                        <p className="text-slate-900 font-medium text-center">
                                            Scan with Xumm app
                                        </p>
                                        <img src={qrCodeUrl} alt="QR Code Xumm" className="w-48 h-48" />
                                        <p className="text-slate-500 text-sm text-center">
                                            Waiting for confirmation...
                                        </p>
                                    </div>
                                )}

                                {!qrCodeUrl && (
                                    <>
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Smartphone className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm font-medium text-slate-400">Via QR Code (Mobile)</span>
                                            </div>
                                            <div className="space-y-2">
                                                {qrWallets.map((wallet) => (
                                                    <button
                                                        key={wallet.id}
                                                        onClick={() => wallet.available ? handleConnect(wallet.id) : undefined}
                                                        disabled={!wallet.available || connectingWallet !== null}
                                                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${wallet.available
                                                            ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30 hover:from-blue-500/20 hover:to-purple-500/20 hover:border-blue-500/50 cursor-pointer'
                                                            : 'bg-slate-900/50 border-slate-800 opacity-60 cursor-not-allowed'
                                                            } ${connectingWallet !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {wallet.logo ? (
                                                            <img
                                                                src={wallet.logo}
                                                                alt={`${wallet.name} logo`}
                                                                className="w-10 h-10 object-contain"
                                                            />
                                                        ) : (
                                                            <div className="text-2xl">{wallet.icon}</div>
                                                        )}
                                                        <div className="flex-1 text-left">
                                                            <div className="font-semibold text-white flex items-center gap-2">
                                                                {wallet.name}
                                                                {wallet.available && (
                                                                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                                                                        Recommended
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-slate-400">{wallet.description}</div>
                                                        </div>
                                                        {connectingWallet === wallet.id && (
                                                            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                                        )}
                                                        {!wallet.available && (
                                                            <a
                                                                href="https://apps.xumm.dev/"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <span>Get API key</span>
                                                                <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Chrome className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm font-medium text-slate-400">Extensions Chrome</span>
                                            </div>
                                            <div className="space-y-2">
                                                {extensionWallets.map((wallet) => (
                                                    <button
                                                        key={wallet.id}
                                                        onClick={() => wallet.available ? handleConnect(wallet.id) : window.open(wallet.installUrl, '_blank')}
                                                        disabled={connectingWallet !== null}
                                                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${wallet.available
                                                            ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600 cursor-pointer'
                                                            : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800/30 cursor-pointer'
                                                            } ${connectingWallet !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {wallet.logo ? (
                                                            <img
                                                                src={wallet.logo}
                                                                alt={`${wallet.name} logo`}
                                                                className="w-10 h-10 object-contain"
                                                            />
                                                        ) : (
                                                            <div className="text-2xl">{wallet.icon}</div>
                                                        )}
                                                        <div className="flex-1 text-left">
                                                            <div className="font-semibold text-white">{wallet.name}</div>
                                                            <div className="text-sm text-slate-400">{wallet.description}</div>
                                                        </div>
                                                        {connectingWallet === wallet.id && (
                                                            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                                        )}
                                                        {!wallet.available && (
                                                            <div className="flex items-center gap-1 text-xs text-blue-400">
                                                                <span>Install</span>
                                                                <ExternalLink className="w-3 h-3" />
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                                            <p className="text-sm text-slate-400 text-center">
                                                💡 <strong className="text-slate-300">Tip:</strong> Use Xumm QR code to easily connect from your phone without installing an extension.
                                            </p>
                                        </div>
                                    </>
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
