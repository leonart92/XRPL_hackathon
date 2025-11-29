import React from 'react';
import { Hexagon, Wallet, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activePage, onNavigate }) => {
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "circOut" }}
      className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo Section */}
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => onNavigate('Dashboard')}
        >
          <div className="relative flex items-center justify-center">
            <Hexagon className="w-8 h-8 text-blue-500 fill-blue-500/20" />
            <span className="absolute text-xs font-bold text-blue-100">M</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white hidden sm:block">Morpho</span>
          <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-medium text-slate-400 border border-slate-700">
            CLONE
          </span>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {['Dashboard', 'Earn', 'Borrow', 'Portfolio'].map((item) => (
            <button
              key={item}
              onClick={() => onNavigate(item)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activePage === item
                  ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-medium text-slate-300">Ethereum</span>
          </div>
          
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-900/20 active:scale-95 duration-100">
            <Wallet className="w-4 h-4" />
            <span>0x12...4F8A</span>
          </button>
          
          <button className="md:hidden p-2 text-slate-400 hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;