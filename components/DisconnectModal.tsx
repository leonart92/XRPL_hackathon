import React, { useState } from 'react';
import { X, LogOut, ExternalLink, CheckCircle, AlertCircle, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';

interface DisconnectModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
}

const DisconnectModal: React.FC<DisconnectModalProps> = ({ show, setShow }) => {
    const { address, disconnect, isVerified, accountInfo } = useWallet();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDisconnect = () => {
        disconnect();
        setShow(false);
    };

    const formatAddress = (addr: string | null) => {
        if (!addr) return '';
        return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
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
                            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-slate-100">
                                <h2 className="text-lg font-bold text-slate-900">Account</h2>
                                <button
                                    onClick={() => setShow(false)}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="p-5 space-y-4">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    {isVerified ? (
                                        accountInfo?.exists ? (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                                        )
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                    )}
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-900">
                                            {isVerified ? 'Verified on XRPL' : 'Not verified'}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {isVerified
                                                ? (accountInfo?.exists
                                                    ? 'Account exists on the ledger'
                                                    : 'Needs 10 XRP to activate')
                                                : 'Verification pending...'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Address</p>
                                    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                                        <code className="flex-1 text-sm text-slate-700 font-mono truncate">
                                            {formatAddress(address)}
                                        </code>
                                        <button
                                            onClick={handleCopy}
                                            className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                                            title="Copy address"
                                        >
                                            {copied ? (
                                                <Check className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <Copy className="w-4 h-4 text-slate-400" />
                                            )}
                                        </button>
                                        <a
                                            href={`https://xrpscan.com/account/${address}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                                            title="View on XRPScan"
                                        >
                                            <ExternalLink className="w-4 h-4 text-slate-400" />
                                        </a>
                                    </div>
                                </div>

                                {accountInfo && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Balance</p>
                                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-2xl font-bold text-slate-900">
                                                    {accountInfo.balance}
                                                </span>
                                                <span className="text-sm text-slate-500">XRP</span>
                                            </div>
                                            {!accountInfo.exists && (
                                                <p className="text-xs text-yellow-600 mt-1">
                                                    Account needs {accountInfo.reserve} XRP to activate
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleDisconnect}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl transition-all font-medium"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Disconnect</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default DisconnectModal;

