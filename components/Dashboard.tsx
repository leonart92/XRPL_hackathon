import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { ArrowUpRight, ShieldCheck, Wallet, Activity, TrendingUp } from 'lucide-react';
import { MOCK_VAULTS, formatCurrency } from '../constants';

const MOCK_PORTFOLIO_HISTORY = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  value: 125000 + (Math.random() * 5000) + (i * 200) // Upward trend
}));

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Welcome back, 0x12...4F8A</p>
        </div>
        <div className="text-right">
           <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Net Worth</div>
           <div className="text-2xl font-bold text-white">$131,240.50</div>
           <div className="text-xs text-green-400 flex justify-end items-center gap-1">
             <TrendingUp size={12} /> +2.4% (24h)
           </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity size={48} />
          </div>
          <div className="text-slate-400 text-sm font-medium mb-2">Net APY</div>
          <div className="text-3xl font-bold text-blue-400">7.24%</div>
          <p className="text-xs text-slate-500 mt-2">Weighted average across all positions</p>
        </motion.div>

        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group"
        >
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldCheck size={48} className="text-green-500" />
          </div>
          <div className="text-slate-400 text-sm font-medium mb-2">Health Factor</div>
          <div className="text-3xl font-bold text-green-400">2.45</div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
             <div className="h-full bg-green-500 w-[70%] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
          </div>
        </motion.div>

        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group"
        >
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet size={48} className="text-purple-500" />
          </div>
          <div className="text-slate-400 text-sm font-medium mb-2">Borrow Capacity</div>
          <div className="text-3xl font-bold text-white">$45,000</div>
          <p className="text-xs text-slate-500 mt-2">Available to borrow against collateral</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white">Portfolio Performance</h3>
          <div className="flex gap-2">
            {['1W', '1M', '1Y', 'ALL'].map(t => (
               <button key={t} className={`text-xs font-bold px-3 py-1 rounded-lg ${t === '1M' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}>{t}</button>
            ))}
          </div>
        </div>
        <div className="h-[250px] w-full">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={MOCK_PORTFOLIO_HISTORY}>
               <defs>
                 <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                   <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <XAxis dataKey="date" hide />
               <Tooltip 
                 contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                 formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
               />
               <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
             </AreaChart>
           </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Active Positions</h3>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800 bg-slate-950/50">
            <div className="col-span-5">Asset</div>
            <div className="col-span-3 text-right">Balance</div>
            <div className="col-span-2 text-right">APY</div>
            <div className="col-span-2 text-right">Type</div>
          </div>
          
          {[MOCK_VAULTS[0], MOCK_VAULTS[2]].map((vault, i) => (
             <div key={vault.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                <div className="col-span-5 flex items-center gap-3">
                   <img src={vault.token.logo} alt={vault.token.symbol} className="w-8 h-8 rounded-full" />
                   <div>
                     <div className="text-sm font-bold text-white">{vault.token.name}</div>
                     <div className="text-xs text-slate-500">{vault.protocol}</div>
                   </div>
                </div>
                <div className="col-span-3 text-right">
                  <div className="text-sm font-bold text-white">${(i === 0 ? 120000 : 11000).toLocaleString()}</div>
                  <div className="text-xs text-slate-500">{i === 0 ? '120,000' : '0.15'} {vault.token.symbol}</div>
                </div>
                <div className="col-span-2 text-right">
                   <div className="text-sm font-bold text-green-400">{vault.netApy}%</div>
                </div>
                <div className="col-span-2 text-right">
                   <span className="text-[10px] font-bold px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                     Supply
                   </span>
                </div>
             </div>
          ))}
          
           <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-800/30 transition-colors">
                <div className="col-span-5 flex items-center gap-3">
                   <img src={MOCK_VAULTS[1].token.logo} alt="ETH" className="w-8 h-8 rounded-full" />
                   <div>
                     <div className="text-sm font-bold text-white">Wrapped Ethereum</div>
                     <div className="text-xs text-slate-500">Morpho Blue</div>
                   </div>
                </div>
                <div className="col-span-3 text-right">
                  <div className="text-sm font-bold text-white">$5,240</div>
                  <div className="text-xs text-slate-500">2.1 ETH</div>
                </div>
                <div className="col-span-2 text-right">
                   <div className="text-sm font-bold text-red-400">-3.8%</div>
                </div>
                <div className="col-span-2 text-right">
                   <span className="text-[10px] font-bold px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">
                     Borrow
                   </span>
                </div>
             </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;