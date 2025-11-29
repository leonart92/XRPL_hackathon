import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, Wallet as XRPLWallet, isValidAddress } from 'xrpl';

interface AccountInfo {
    balance: string;
    exists: boolean;
    reserve: string;
}

interface WalletContextType {
    wallet: XRPLWallet | null;
    address: string | null;
    isConnected: boolean;
    isVerified: boolean;
    accountInfo: AccountInfo | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    verifyAddress: (addr: string) => Promise<boolean>;
    client: Client | null;
    isLoading: boolean;
    openModal: () => void;
    closeModal: () => void;
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    showDisconnectModal: boolean;
    setShowDisconnectModal: (show: boolean) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};

interface WalletProviderProps {
    children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
    const [wallet, setWallet] = useState<XRPLWallet | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [client, setClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showDisconnectModal, setShowDisconnectModal] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);

    useEffect(() => {
        const network = (import.meta as any).env?.VITE_XRPL_NETWORK || 'mainnet';
        const wsUrl = (import.meta as any).env?.VITE_XRPL_WS_URL ||
            (network === 'testnet'
                ? 'wss://s.altnet.rippletest.net:51233'
                : 'wss://xrplcluster.com');

        const xrplClient = new Client(wsUrl);

        xrplClient.connect().then(() => {
            setClient(xrplClient);
        }).catch(console.error);

        return () => {
            if (xrplClient.isConnected()) {
                xrplClient.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        const savedAddress = localStorage.getItem('xrpl_address');
        const savedWallet = localStorage.getItem('xrpl_wallet');

        if (savedAddress) {
            if (isValidAddress(savedAddress)) {
                setAddress(savedAddress);
                if (savedWallet) {
                    try {
                        const xrplWallet = XRPLWallet.fromSeed(savedWallet);
                        setWallet(xrplWallet);
                    } catch (e) {
                        console.error('Error restoring wallet:', e);
                        localStorage.removeItem('xrpl_address');
                        localStorage.removeItem('xrpl_wallet');
                    }
                }
            } else {
                localStorage.removeItem('xrpl_address');
                localStorage.removeItem('xrpl_wallet');
            }
        }
    }, []);

    useEffect(() => {
        if (client && client.isConnected() && address) {
            verifyAddress(address);
        }
    }, [client, address]);

    useEffect(() => {
        const handleStorageChange = () => {
            const savedAddress = localStorage.getItem('xrpl_address');
            if (savedAddress && savedAddress !== address) {
                if (isValidAddress(savedAddress)) {
                    setAddress(savedAddress);
                } else {
                    localStorage.removeItem('xrpl_address');
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        const interval = setInterval(handleStorageChange, 500);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, [address]);

    const connect = async () => {
        setIsLoading(true);
        try {
            const win = window as any;
            const savedAddress = localStorage.getItem('xrpl_address');

            if (savedAddress) {
                if (isValidAddress(savedAddress)) {
                    setAddress(savedAddress);
                    setIsLoading(false);
                    return;
                } else {
                    localStorage.removeItem('xrpl_address');
                }
            }

            if (win.xaman) {
                try {
                    const xaman = win.xaman;
                    let payload = null;
                    try {
                        payload = await xaman.payload?.();
                    } catch (e) {
                        payload = await xaman.request();
                    }

                    if (payload && payload.address) {
                        if (isValidAddress(payload.address)) {
                            setAddress(payload.address);
                            localStorage.setItem('xrpl_address', payload.address);
                            setIsLoading(false);
                            return;
                        } else {
                        }
                    }
                } catch (e) {
                }
            }

            if (win.gemWallet) {
                try {
                    const gemWallet = win.gemWallet;
                    const isConnected = await gemWallet.isConnected();
                    if (!isConnected) {
                        await gemWallet.connect();
                    }
                    const account = await gemWallet.getAccount();
                    if (account && account.address) {
                        if (isValidAddress(account.address)) {
                            setAddress(account.address);
                            localStorage.setItem('xrpl_address', account.address);
                            setIsLoading(false);
                            return;
                        } else {
                        }
                    }
                } catch (e) {
                }
            }

            if (win.crossmark) {
                try {
                    const response = await win.crossmark.signInAndWait();
                    if (response?.response?.data?.address) {
                        const addr = response.response.data.address;
                        if (isValidAddress(addr)) {
                            setAddress(addr);
                            localStorage.setItem('xrpl_address', addr);
                            setIsLoading(false);
                            return;
                        } else {
                        }
                    }
                } catch (e) {
                }
            }

            setShowModal(true);
        } catch (error) {
            console.error('Error connecting wallet:', error);
            setShowModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    const verifyAddress = async (addr: string): Promise<boolean> => {
        if (!client || !client.isConnected()) {
            return false;
        }

        if (!isValidAddress(addr)) {
            setAccountInfo(null);
            setIsVerified(false);
            return false;
        }

        try {
            const response = await client.request({
                command: 'account_info',
                account: addr,
                ledger_index: 'validated'
            });

            if (response.result?.account_data) {
                const balance = response.result.account_data.Balance;
                const balanceXRP = (parseInt(balance) / 1_000_000).toFixed(2);
                setAccountInfo({
                    balance: balanceXRP,
                    exists: true,
                    reserve: '10'
                });
                setIsVerified(true);
                return true;
            }
            return false;
        } catch (error: any) {
            if (error?.data?.error === 'actNotFound') {
                setAccountInfo({
                    balance: '0',
                    exists: false,
                    reserve: '10'
                });
                setIsVerified(false);
            } else {
                console.error('Error verifying address:', error);
            }
            return false;
        }
    };

    const disconnect = () => {
        setWallet(null);
        setAddress(null);
        setIsVerified(false);
        setAccountInfo(null);
        localStorage.removeItem('xrpl_address');
        localStorage.removeItem('xrpl_wallet');
        setShowDisconnectModal(false);
    };

    const openModal = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const value: WalletContextType = {
        wallet,
        address,
        isConnected: !!address,
        isVerified,
        accountInfo,
        connect,
        disconnect,
        verifyAddress,
        client,
        isLoading,
        openModal,
        closeModal,
        showModal,
        setShowModal,
        showDisconnectModal,
        setShowDisconnectModal,
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};

