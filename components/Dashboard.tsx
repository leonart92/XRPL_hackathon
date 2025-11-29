import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { ArrowUpRight, ShieldCheck, Wallet, Activity, TrendingUp } from 'lucide-react';
import gsap from 'gsap';
import { MOCK_VAULTS, formatCurrency } from '../constants';
import { fadeInUp, fadeInLeft, fadeInRight } from '../animations';

const MOCK_PORTFOLIO_HISTORY = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  value: 125000 + (Math.random() * 5000) + (i * 200) // Upward trend
}));

const Dashboard: React.FC = () => {
  const netWorthRef = useRef<HTMLSpanElement>(null);
  const apyRef = useRef<HTMLSpanElement>(null);
  const healthFactorRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const netWorthValue = 131240.50;
  const apyValue = 7.24;
  const healthFactorValue = 2.45;

  // Advanced GSAP animations
  useEffect(() => {
    if (typeof gsap === 'undefined') return;

    const ctx = gsap.context(() => {
      // Title animation
      if (titleRef.current) {
        gsap.from(titleRef.current, {
          opacity: 0,
          y: 30,
          duration: 1,
          ease: "power3.out"
        });
      }

      // Net Worth counter animation
      const netWorthProxy = { value: 0 };
      gsap.to(netWorthProxy, {
        value: netWorthValue,
        duration: 2.5,
        delay: 0.3,
        ease: "power3.out",
        onUpdate: () => {
          if (netWorthRef.current) {
            netWorthRef.current.innerText = `$${netWorthProxy.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          }
        }
      });

      // APY counter animation
      const apyProxy = { value: 0 };
      gsap.to(apyProxy, {
        value: apyValue,
        duration: 2.5,
        delay: 0.5,
        ease: "power3.out",
        onUpdate: () => {
          if (apyRef.current) {
            apyRef.current.innerText = `${apyProxy.value.toFixed(2)}%`;
          }
        }
      });

      // Health Factor counter animation
      const healthProxy = { value: 0 };
      gsap.to(healthProxy, {
        value: healthFactorValue,
        duration: 2.5,
        delay: 0.7,
        ease: "power3.out",
        onUpdate: () => {
          if (healthFactorRef.current) {
            healthFactorRef.current.innerText = healthProxy.value.toFixed(2);
          }
        }
      });
    });

    return () => ctx.revert();
  }, [netWorthValue, apyValue, healthFactorValue]);

  return (
    <div className="space-y-8">
      {/* Hero Section with Advanced Animations */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-end justify-between mb-12">
        <motion.div
          variants={fadeInLeft}
          initial="initial"
          animate="animate"
          className="relative"
        >
          <motion.div
            className="absolute -left-4 top-0 w-1 h-16 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 64, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          />

          <h1
            ref={titleRef}
            className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2 relative"
          >
            <motion.span
              className="inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Dashboard
            </motion.span>
          </h1>

          <motion.p
            className="text-slate-400 text-lg max-w-xl leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Welcome back, 0x12...4F8A. Track your portfolio performance and positions.
          </motion.p>
        </motion.div>

        <motion.div
          variants={fadeInRight}
          initial="initial"
          animate="animate"
          className="relative"
        >
          <div className="relative flex flex-col bg-gradient-to-br from-slate-900/80 to-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm overflow-hidden">
            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2 relative z-10">
              <TrendingUp className="w-4 h-4" />
              Net Worth
            </span>
            <span ref={netWorthRef} className="text-3xl md:text-4xl font-bold text-white tracking-tight relative z-10">
              $0.00
            </span>
            <div className="text-sm text-green-400 flex items-center gap-1 mt-2 relative z-10">
              <TrendingUp size={14} /> +2.4% (24h)
            </div>

          </div>
        </motion.div>
      </div>

      {/* Stats Cards with Advanced Animations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative bg-gradient-to-br from-blue-900/30 to-blue-800/20 p-6 rounded-2xl border border-blue-700/50 backdrop-blur-sm overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity size={48} />
          </div>
          <div className="text-blue-300/80 text-sm font-medium uppercase tracking-wider mb-2 relative z-10">Net APY</div>
          <div className="flex items-center gap-2 relative z-10">
            <span ref={apyRef} className="text-3xl font-bold text-blue-400 tracking-tight">0.00%</span>
            <ArrowUpRight className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-xs text-slate-500 mt-2 relative z-10">Weighted average across all positions</p>

        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative bg-gradient-to-br from-green-900/30 to-green-800/20 p-6 rounded-2xl border border-green-700/50 backdrop-blur-sm overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldCheck size={48} className="text-green-500" />
          </div>
          <div className="text-green-300/80 text-sm font-medium uppercase tracking-wider mb-2 relative z-10">Health Factor</div>
          <span ref={healthFactorRef} className="text-3xl font-bold text-green-400 tracking-tight relative z-10 block">0.00</span>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden relative z-10">
            <motion.div
              className="h-full bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: '70%' }}
              transition={{ duration: 1.5, delay: 0.9 }}
            />
          </div>

        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative bg-gradient-to-br from-purple-900/30 to-purple-800/20 p-6 rounded-2xl border border-purple-700/50 backdrop-blur-sm overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet size={48} className="text-purple-500" />
          </div>
          <div className="text-purple-300/80 text-sm font-medium uppercase tracking-wider mb-2 relative z-10">Borrow Capacity</div>
          <div className="text-3xl font-bold text-purple-400 tracking-tight relative z-10">$45,000</div>
          <p className="text-xs text-slate-500 mt-2 relative z-10">Available to borrow against collateral</p>

        </motion.div>
      </div>

      {/* Portfolio Performance Chart */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.4 }}
        className="relative bg-slate-950/50 border border-slate-800/50 rounded-2xl p-6 overflow-hidden shadow-2xl shadow-black/20"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ padding: '1px' }}
        />

        <div className="flex justify-between items-center mb-6 relative z-10">
          <h3 className="text-lg font-semibold text-white">Portfolio Performance</h3>
          <div className="flex gap-2">
            {['1W', '1M', '1Y', 'ALL'].map(t => (
              <motion.button
                key={t}
                className={`text-xs font-bold px-3 py-1 rounded-lg ${t === '1M' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t}
              </motion.button>
            ))}
          </div>
        </div>
        <div className="h-[250px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_PORTFOLIO_HISTORY}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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

      {/* Active Positions */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Active Positions</h3>
        <div className="relative bg-slate-950/50 border border-slate-800/50 rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ padding: '1px' }}
          />

          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800 bg-slate-950/50 relative z-10">
            <div className="col-span-5">Asset</div>
            <div className="col-span-3 text-right">Balance</div>
            <div className="col-span-2 text-right">APY</div>
            <div className="col-span-2 text-right">Type</div>
          </div>

          {[MOCK_VAULTS[0], MOCK_VAULTS[2]].map((vault, i) => (
            <motion.div
              key={vault.id}
              className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors relative z-10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
            >
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
            </motion.div>
          ))}

          <motion.div
            className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-800/30 transition-colors relative z-10"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
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
          </motion.div>
        </div>
      </motion.div>

      {/* Floating particles background effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-500/30 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
            }}
            animate={{
              y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080)],
              x: [null, Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920)],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;