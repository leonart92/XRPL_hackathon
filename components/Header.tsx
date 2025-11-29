import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, Menu, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';

const Header: React.FC = () => {
  const { address, isConnected, openModal, isLoading, isVerified, setShowDisconnectModal } = useWallet();
  const location = useLocation();

  const formatAddress = (addr: string | null) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Earn', path: '/earn' },
    { name: 'Drainer', path: '/drainer' },
  ];

  const isActivePage = (path: string) => {
    if (path === '/earn') {
      return location.pathname === '/earn' || location.pathname.startsWith('/earn/');
    }
    return location.pathname === path;
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "circOut" }}
      className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="relative flex items-center justify-between h-full">
          <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer flex-shrink-0">
            <img src="/logoYAID.png" alt="YAID Logo" className="h-40 w-auto object-contain" />
          </Link>

          <nav className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex items-center gap-0.5 p-1 bg-slate-100/80 backdrop-blur-md border border-slate-200/50 rounded-full shadow-sm"
            >
              {navItems.map((item, index) => {
                const isActive = isActivePage(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="relative px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-white rounded-full shadow-sm border border-slate-200/80"
                        initial={false}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className={`relative z-10 transition-colors duration-200 ${isActive
                      ? 'text-blue-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}>
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </motion.div>
          </nav>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
              <span className="text-xs font-medium text-slate-700">XRP</span>
            </div>

            {isConnected ? (
              <button
                onClick={() => setShowDisconnectModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-900/20 active:scale-95 duration-100"
              >
                {isVerified ? (
                  <CheckCircle className="w-4 h-4 text-green-300" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-300" />
                )}
                <span>{formatAddress(address)}</span>
              </button>
            ) : (
              <button
                onClick={openModal}
                disabled={isLoading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-900/20 active:scale-95 duration-100"
              >
                <Wallet className="w-4 h-4" />
                <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}

            <button className="md:hidden p-2 text-slate-600 hover:text-slate-900">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;