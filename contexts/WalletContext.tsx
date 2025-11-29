import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, Wallet as XRPLWallet } from 'xrpl';

interface WalletContextType {
    wallet: XRPLWallet | null;
    address: string | null;
    isConnected: boolean;
    connect: () => Promise<void>;
    disconnect: () => void;
    client: Client | null;
    isLoading: boolean;
    openModal: () => void;
    closeModal: () => void;
    showModal: boolean;
    setShowModal: (show: boolean) => void;
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
        }
    }, []);

    useEffect(() => {
        const handleStorageChange = () => {
            const savedAddress = localStorage.getItem('xrpl_address');
            if (savedAddress && savedAddress !== address) {
                setAddress(savedAddress);
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
                setAddress(savedAddress);
                setIsLoading(false);
                return;
            }

            if (win.xumm) {
                try {
                    const xumm = win.xumm;
                    let payload = null;
                    try {
                        payload = await xumm.payload?.();
                    } catch (e) {
                        payload = await xumm.request();
                    }

                    if (payload && payload.address) {
                        setAddress(payload.address);
                        localStorage.setItem('xrpl_address', payload.address);
                        setIsLoading(false);
                        return;
                    }
                } catch (e) {
                    console.log('Xumm connection error:', e);
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
                        setAddress(account.address);
                        localStorage.setItem('xrpl_address', account.address);
                        setIsLoading(false);
                        return;
                    }
                } catch (e) {
                    console.log('Gem Wallet connection error:', e);
                }
            }

            if (win.crossmark) {
                try {
                    const response = await win.crossmark.signInAndWait();
                    if (response?.response?.data?.address) {
                        setAddress(response.response.data.address);
                        localStorage.setItem('xrpl_address', response.response.data.address);
                        setIsLoading(false);
                        return;
                    }
                } catch (e) {
                    console.log('Crossmark connection error:', e);
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

    const disconnect = () => {
        setWallet(null);
        setAddress(null);
        localStorage.removeItem('xrpl_address');
        localStorage.removeItem('xrpl_wallet');
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
        connect,
        disconnect,
        client,
        isLoading,
        openModal,
        closeModal,
        showModal,
        setShowModal,
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};

