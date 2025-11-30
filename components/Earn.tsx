import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, ArrowUpRight, TrendingUp } from 'lucide-react';
import gsap from 'gsap';
import VaultTable from './VaultTable';
import { fadeInUp, fadeInLeft, fadeInRight } from '../animations';
import { useVaultsContext } from '../contexts/VaultsContext';

interface EarnProps {
  onSelectAssociation: (id: string) => void;
}

const Earn: React.FC<EarnProps> = ({ onSelectAssociation }) => {
  const depositRef = useRef<HTMLSpanElement>(null);
  const apyRef = useRef<HTMLSpanElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const { vaults, loading } = useVaultsContext();

  const totalDeposit = vaults.reduce((acc, v) => acc + (v.totalSupply ?? 0), 0);
  const avgApy = vaults.length > 0 ? vaults.reduce((acc, v) => acc + (v.netApy ?? 0), 0) / vaults.length : 0;

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

        gsap.from(titleRef.current.querySelectorAll('.char'), {
          opacity: 0,
          y: 20,
          stagger: 0.03,
          duration: 0.6,
          ease: "back.out(1.7)"
        });
      }

      const depositProxy = { value: 0 };
      gsap.to(depositProxy, {
        value: totalDeposit,
        duration: 2.5,
        delay: 0.3,
        ease: "power3.out",
        onUpdate: () => {
          if (depositRef.current) {
            depositRef.current.innerText = `${depositProxy.value.toFixed(0)} XRP`;
          }
        }
      });

      const apyProxy = { value: 0 };
      gsap.to(apyProxy, {
        value: avgApy,
        duration: 2.5,
        delay: 0.5,
        ease: "power3.out",
        onUpdate: () => {
          if (apyRef.current) {
            apyRef.current.innerText = `${apyProxy.value.toFixed(2)}%`;
          }
        }
      });
    });

    return () => ctx.revert();
  }, [totalDeposit, avgApy]);

  return (
    <div className="space-y-8">
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!loading && (
        <>
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
                  Fund Real
                </motion.span>
                <br />
                <motion.span
                  className="inline-block"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Environmental Change
                </motion.span>
              </h1>

              <motion.p
                className="text-slate-600 text-lg max-w-xl leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Support verified environmental organizations with your XRP.
                See the impact of your investments in real-time.
              </motion.p>
            </motion.div>

            <motion.div
              ref={statsRef}
              variants={fadeInRight}
              className="flex gap-4 md:gap-8"
            >
              <div className="relative flex flex-col bg-blue-50 p-4 rounded-2xl border border-blue-100 backdrop-blur-sm overflow-hidden">
                <span className="text-sm font-medium text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-2 relative z-10">
                  <TrendingUp className="w-4 h-4" />
                  Total Impact Funding
                </span>
                <span ref={depositRef} className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight relative z-10">
                  {totalDeposit.toFixed(0)} XRP
                </span>
              </div>

              <div className="w-px bg-slate-200"></div>

              <div className="relative flex flex-col bg-green-50 p-4 rounded-2xl border border-green-100 backdrop-blur-sm overflow-hidden">
                <span className="text-sm font-medium text-green-700 uppercase tracking-wider mb-2 relative z-10">
                  Avg. Return
                </span>
                <div className="flex items-center gap-2 relative z-10">
                  <span ref={apyRef} className="text-2xl md:text-3xl font-bold text-green-600 tracking-tight">
                    0.00%
                  </span>
                  <ArrowUpRight className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col md:flex-row gap-4 mb-6 sticky top-20 z-40 bg-white/95 backdrop-blur-sm py-4 border-b border-transparent md:border-slate-200 transition-all"
          >
            <motion.div
              className="relative flex-1 group"
              whileFocus={{ scale: 1.01 }}
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                <Search className={`w-5 h-5 transition-colors duration-300 ${searchFocused ? 'text-blue-500' : 'text-slate-400'}`} />
              </div>

              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search projects by organization, cause, or impact area..."
                className="w-full bg-white border border-slate-200 text-slate-900 pl-12 pr-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-400 hover:bg-slate-50"
              />

              {searchValue && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100"
                  onClick={() => setSearchValue('')}
                >
                  ✕
                </motion.button>
              )}
            </motion.div>

            <motion.button
              className="relative flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors font-medium overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              <SlidersHorizontal className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Filters</span>
            </motion.button>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ padding: '1px' }}
            />
            <div className="bg-white backdrop-blur-xl overflow-hidden">
              <VaultTable
                onSelectAssociation={onSelectAssociation}
                searchQuery={searchValue}
              />
            </div>
          </motion.div>

          <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-blue-500/30 rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                }}
                animate={{
                  y: [null, Math.random() * window.innerHeight],
                  x: [null, Math.random() * window.innerWidth],
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Earn;