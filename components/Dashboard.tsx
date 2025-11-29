import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { ArrowUpRight, ShieldCheck, Activity, TrendingUp } from 'lucide-react';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../constants';
import { fadeInUp, fadeInLeft } from '../animations';
import { useVaultsContext } from '../contexts/VaultsContext';
import { useWallet } from '../contexts/WalletContext';
import { useUserVaultBalances } from '../hooks/useUserVaultBalances';

const MOCK_PORTFOLIO_HISTORY = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  value: 125000 + (Math.random() * 5000) + (i * 200) // Upward trend
}));

const Dashboard: React.FC = () => {
  const netWorthRef = useRef<HTMLSpanElement>(null);
  const apyRef = useRef<HTMLSpanElement>(null);
  const healthFactorRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const navigate = useNavigate();

  const { vaults, associations } = useVaultsContext();
  const { address } = useWallet();
  const { balances, loading: balancesLoading } = useUserVaultBalances({
    userAddress: address,
    vaults,
  });

  const netWorthValue = 131240.50;
  const apyValue = 7.24;
  const healthFactorValue = 2.45;

  useEffect(() => {
    if (typeof gsap === 'undefined') return;

    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.from(titleRef.current, {
          opacity: 0,
          y: 30,
          duration: 1,
          ease: "power3.out"
        });
      }

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
      <div className="flex flex-col lg:flex-row gap-8 lg:items-end justify-between mb-12">
        <motion.div
          variants={fadeInLeft}
          initial="initial"
          animate="animate"
          className="relative"
        >
          <motion.div
            className="absolute -left-4 top-0 w-1 h-16 bg-blue-500 rounded-full"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 64, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          />

          <h1
            ref={titleRef}
            className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-2 relative"
          >
            <motion.span
              className="inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Your Impact
            </motion.span>
          </h1>

          <motion.p
            className="text-slate-600 text-lg max-w-xl leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Track the real-world impact of your environmental investments.
          </motion.p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-2xl border border-blue-200 backdrop-blur-sm overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity size={48} className="text-blue-500" />
          </div>
          <div className="text-blue-700 text-sm font-medium uppercase tracking-wider mb-2 relative z-10">Annual Return</div>
          <div className="flex items-center gap-2 relative z-10">
            <span ref={apyRef} className="text-3xl font-bold text-blue-600 tracking-tight">0.00%</span>
            <ArrowUpRight className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-xs text-slate-600 mt-2 relative z-10">Average return across your investments</p>

        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative bg-gradient-to-br from-green-50 to-green-100/50 p-6 rounded-2xl border border-green-200 backdrop-blur-sm overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldCheck size={48} className="text-green-600" />
          </div>
          <div className="text-green-700 text-sm font-medium uppercase tracking-wider mb-2 relative z-10">Projects Supported</div>
          <span ref={healthFactorRef} className="text-3xl font-bold text-green-600 tracking-tight relative z-10 block">0.00</span>
          <p className="text-xs text-slate-600 mt-3 relative z-10">Environmental organizations you're helping</p>

        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200 backdrop-blur-sm overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={48} className="text-blue-500" />
          </div>
          <div className="text-slate-600 text-sm font-medium uppercase tracking-wider mb-2 flex items-center gap-2 relative z-10">
            <TrendingUp className="w-4 h-4" />
            Total Impact Invested
          </div>
          <span ref={netWorthRef} className="text-3xl font-bold text-slate-900 tracking-tight relative z-10 block">
            $0.00
          </span>
          <div className="text-sm text-green-600 flex items-center gap-1 mt-2 relative z-10">
            <TrendingUp size={14} /> Growing daily
          </div>
        </motion.div>
      </div>

      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Impact Portfolio</h3>
        <div className="relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ padding: '1px' }}
          />

          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200 bg-slate-50 relative z-10">
            <div className="col-span-4">Project</div>
            <div className="col-span-3 text-right">Your Investment</div>
            <div className="col-span-2 text-right">Total Funding</div>
            <div className="col-span-2 text-right">Return</div>
            <div className="col-span-1 text-right">Impact</div>
          </div>

          {balancesLoading ? (
            <div className="px-6 py-8 text-center text-slate-500 relative z-10">
              Loading positions...
            </div>
          ) : balances.length === 0 ? (
            <div className="px-6 py-8 text-center text-slate-500 relative z-10">
              <p className="text-sm">You haven't invested in any projects yet</p>
              <p className="text-xs mt-1">Browse environmental projects and start making an impact</p>
            </div>
          ) : (
            balances.map((userBalance, i) => {
              const vault = vaults.find(v => v.vaultAddress === userBalance.vaultAddress);
              if (!vault) return null;
              
              const association = associations.find(a => a.id === vault.associationId);
              const balanceNum = parseFloat(userBalance.balance);
              
              return (
                <motion.div
                  key={vault.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-slate-200 hover:bg-slate-50 transition-colors relative z-10 cursor-pointer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  onClick={() => navigate(`/vault/${vault.vaultAddress}`)}
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <img
                      src={association?.branding.logo}
                      alt={association?.name}
                      className="w-8 h-8 rounded-full bg-white object-contain p-0.5"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900">{vault.name}</div>
                      <div className="text-xs text-slate-600">{association?.shortName}</div>
                    </div>
                  </div>
                  <div className="col-span-3 text-right">
                    <div className="text-sm font-bold text-blue-600">{balanceNum.toFixed(2)} {vault.vaultTokenCurrency}</div>
                    <div className="text-xs text-slate-600">≈ {balanceNum.toFixed(2)} {vault.acceptedCurrency}</div>
                  </div>
                  <div className="col-span-2 text-right">
                    <div className="text-sm font-bold text-slate-900">{formatCurrency(vault.totalSupply / 100)}</div>
                  </div>
                  <div className="col-span-2 text-right">
                    <div className="text-sm font-bold text-green-600">{vault.netApy}%</div>
                  </div>
                  <div className="col-span-1 text-right">
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-blue-50 text-blue-600 border border-blue-200 uppercase">
                      Long
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>

      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-500/20 rounded-full"
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