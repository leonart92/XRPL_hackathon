import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Hexagon, Wallet, Menu, CheckCircle, AlertCircle } from 'lucide-react';
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
    { name: 'Borrow', path: '/borrow' },
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
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
          <div className="relative flex items-center justify-center">
            <Hexagon className="w-8 h-8 text-blue-500 fill-blue-500/20" />
            <span className="absolute text-xs font-bold text-blue-600">M</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 hidden sm:block">Morpho</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActivePage(item.path)
                  ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
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
    </motion.header>
  );
};

export default Header;