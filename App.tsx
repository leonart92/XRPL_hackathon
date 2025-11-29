import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Earn from './components/Earn';
import Dashboard from './components/Dashboard';
import AIAdvisor from './components/AIAdvisor';
import { Vault } from './types';
import Lenis from 'lenis';
import { AnimatePresence, motion } from 'framer-motion';

const App: React.FC = () => {
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [activePage, setActivePage] = useState<string>('Earn');

  // Initialize Lenis Smooth Scroll
  useEffect(() => {
    if (typeof Lenis === 'undefined') return;

    try {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        touchMultiplier: 2,
      });

      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);

      return () => {
        lenis.destroy();
      };
    } catch (e) {
      console.error("Failed to initialize Lenis:", e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-blue-500/30">
      <Header activePage={activePage} onNavigate={setActivePage} />
      
      <main className="container mx-auto px-4 py-8 pb-20">
        <AnimatePresence mode="wait">
          {activePage === 'Dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Dashboard />
            </motion.div>
          )}

          {activePage === 'Earn' && (
             <motion.div 
               key="earn"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.3 }}
             >
               <Earn onSelectVaultForAI={setSelectedVault} />
             </motion.div>
          )}

          {activePage !== 'Dashboard' && activePage !== 'Earn' && (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-[50vh] text-slate-500"
            >
              <h2 className="text-2xl font-bold text-slate-300 mb-2">Coming Soon</h2>
              <p>The {activePage} module is currently under development.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* AI Modal */}
      <AnimatePresence>
        {selectedVault && (
          <AIAdvisor 
            vault={selectedVault} 
            onClose={() => setSelectedVault(null)} 
          />
        )}
      </AnimatePresence>

    </div>
  );
};

export default App;