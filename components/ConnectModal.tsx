import React, { useState, useEffect } from 'react';
import { X, Chrome, Smartphone, ExternalLink, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isValidAddress } from 'xrpl';
import { useWallet } from '../contexts/WalletContext';
import { isInstalled as isGemWalletInstalled, getAddress as getGemWalletAddress } from '@gemwallet/api';

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
    type: 'extension' | 'mobile';
    available: boolean;
    installUrl?: string;
}

const ConnectModal: React.FC<ConnectModalProps> = ({ show, setShow }) => {
    const { address, connect } = useWallet();
    const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
    const [showXamanView, setShowXamanView] = useState(false);
    const [manualAddress, setManualAddress] = useState('');

    const [wallets, setWallets] = useState<WalletOption[]>([
        {
            id: 'gem',
            name: 'GemWallet',
            description: 'Chrome extension for XRPL',
            logo: '/gemWalletLogo.png',
            type: 'extension',
            available: false,
            installUrl: 'https://chromewebstore.google.com/detail/gemwallet/egebedonbdapoieedfcfkofloclfghab',
        },
        {
            id: 'crossmark',
            name: 'Crossmark',
            description: 'Chrome extension for XRPL',
            logo: '/crossmarkLogo.png',
            type: 'extension',
            available: false,
            installUrl: 'https://chromewebstore.google.com/detail/crossmark-wallet/canipghmckojpianfgiklhbgpfmhjkjg',
        },
        {
            id: 'xaman-app',
            name: 'Xaman',
            description: 'Connect with your mobile wallet',
            logo: '/xamanLogo.jpeg',
            type: 'mobile',
            available: true,
            installUrl: 'https://xaman.app/',
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
        }
    }, [address, setShow]);

    useEffect(() => {
        if (!show) {
            setConnectingWallet(null);
            setShowXamanView(false);
            setManualAddress('');
        }
    }, [show]);

    const handleConnect = async (walletId: string) => {
        setConnectingWallet(walletId);

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

    const handleManualConnect = async () => {
        const trimmedAddress = manualAddress.trim();

        if (!trimmedAddress) {
            alert('Please enter an XRPL address');
            return;
        }

        if (!isValidAddress(trimmedAddress)) {
            alert('Invalid XRPL address format.\n\nValid addresses:\n- Start with "r"\n- 25-35 characters\n- Use Base58 encoding (case-sensitive)\n- No 0, O, I, or l characters');
            return;
        }

        localStorage.setItem('xrpl_address', trimmedAddress);
        await connect();
        setShowXamanView(false);
        setManualAddress('');
    };

    const connectWallet = async (walletId: string) => {
        const win = window as any;

        if (walletId === 'xaman-app') {
            setShowXamanView(true);
            throw new Error('cancelled');
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
    const mobileWallet = wallets.find(w => w.id === 'xaman-app');

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
                                {showXamanView ? (
                                    <div className="space-y-5">
                                        <button
                                            onClick={() => {
                                                setShowXamanView(false);
                                                setManualAddress('');
                                            }}
                                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            <span className="text-sm">Back to wallets</span>
                                        </button>

                                        <div className="text-center space-y-3">
                                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-800 overflow-hidden">
                                                <img
                                                    src="/xamanLogo.jpeg"
                                                    alt="Xaman logo"
                                                    className="w-full h-full object-cover rounded-xl"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white">Xaman Wallet</h3>
                                                <p className="text-sm text-slate-400 mt-1">
                                                    Enter your XRPL address to connect
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-slate-800/50 rounded-xl p-5 space-y-4 border border-slate-700/50">
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">How to connect</p>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">1</div>
                                                    <p className="text-sm text-slate-200">Open <span className="font-semibold text-white">Xaman</span> on your phone</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">2</div>
                                                    <p className="text-sm text-slate-200">Tap your account to copy the <span className="font-semibold text-white">r-address</span></p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">3</div>
                                                    <p className="text-sm text-slate-200">Paste it below and connect</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={manualAddress}
                                                    onChange={(e) => setManualAddress(e.target.value)}
                                                    placeholder="rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                                                    className="w-full px-5 py-4 bg-slate-800 border-2 border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-sm transition-all"
                                                />
                                                {manualAddress && (
                                                    <button
                                                        onClick={() => setManualAddress('')}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <button
                                                onClick={handleManualConnect}
                                                disabled={!manualAddress}
                                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:opacity-50 text-white rounded-xl transition-all font-semibold text-base"
                                            >
                                                Connect Wallet
                                            </button>
                                        </div>

                                        <div className="text-center pt-2">
                                            <a
                                                href="https://xaman.app"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors"
                                            >
                                                <span>Don't have Xaman?</span>
                                                <span className="text-blue-400 font-medium">Download here</span>
                                                <ExternalLink className="w-3 h-3 text-blue-400" />
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {mobileWallet && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Smartphone className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm font-medium text-slate-400">Mobile</span>
                                                </div>
                                                <button
                                                    onClick={() => handleConnect(mobileWallet.id)}
                                                    disabled={connectingWallet !== null}
                                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all bg-blue-600/10 border-blue-500/30 hover:bg-blue-600/20 hover:border-blue-500/50 cursor-pointer ${connectingWallet !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    {mobileWallet.logo ? (
                                                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden">
                                                            <img
                                                                src={mobileWallet.logo}
                                                                alt={`${mobileWallet.name} logo`}
                                                                className="w-full h-full object-cover rounded-lg"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                                                            <span className="text-2xl">{mobileWallet.icon}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex-1 text-left">
                                                        <div className="font-semibold text-white flex items-center gap-2">
                                                            {mobileWallet.name}
                                                        </div>
                                                        <div className="text-sm text-slate-400">{mobileWallet.description}</div>
                                                    </div>
                                                    {connectingWallet === mobileWallet.id && (
                                                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                                    )}
                                                </button>
                                            </div>
                                        )}

                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Chrome className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm font-medium text-slate-400">Browser Extensions</span>
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
                                                            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden">
                                                                <img
                                                                    src={wallet.logo}
                                                                    alt={`${wallet.name} logo`}
                                                                    className="w-full h-full object-cover rounded-lg"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                                                                <span className="text-2xl">{wallet.icon}</span>
                                                            </div>
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
