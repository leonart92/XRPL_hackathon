import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Earn from './components/Earn';
import Dashboard from './components/Dashboard';
import AIAdvisor from './components/AIAdvisor';
import ConnectModal from './components/ConnectModal';
import DisconnectModal from './components/DisconnectModal';
import AssociationDetail from './components/AssociationDetail';
import { Vault } from './types';
import Lenis from 'lenis';
import { AnimatePresence, motion } from 'framer-motion';
import { WalletProvider, useWallet } from './contexts/WalletContext';

const App: React.FC = () => {
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
    <WalletProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </WalletProvider>
  );
};

const AppContent: React.FC = () => {
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const { showModal, setShowModal, showDisconnectModal, setShowDisconnectModal } = useWallet();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-blue-500/30">
      <Header />

      <main className="container mx-auto px-4 py-8 pb-20">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/dashboard" element={
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Dashboard />
              </motion.div>
            } />

            <Route path="/earn" element={
              <motion.div
                key="earn"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <EarnWrapper onSelectVaultForAI={setSelectedVault} />
              </motion.div>
            } />

            <Route path="/earn/:associationId" element={
              <motion.div
                key="association-detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AssociationDetailWrapper onSelectVaultForAI={setSelectedVault} />
              </motion.div>
            } />

            <Route path="*" element={
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-[50vh] text-slate-500"
              >
                <h2 className="text-2xl font-bold text-slate-300 mb-2">Coming Soon</h2>
                <p>This module is currently under development.</p>
              </motion.div>
            } />
          </Routes>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {selectedVault && (
          <AIAdvisor
            vault={selectedVault}
            onClose={() => setSelectedVault(null)}
          />
        )}
      </AnimatePresence>

      <ConnectModal show={showModal} setShow={setShowModal} />
      <DisconnectModal show={showDisconnectModal} setShow={setShowDisconnectModal} />
    </div>
  );
};

const EarnWrapper: React.FC<{ onSelectVaultForAI: (vault: Vault) => void }> = ({ onSelectVaultForAI }) => {
  const navigate = useNavigate();

  return (
    <Earn
      onSelectVaultForAI={onSelectVaultForAI}
      onSelectAssociation={(id) => navigate(`/earn/${id}`)}
    />
  );
};

const AssociationDetailWrapper: React.FC<{ onSelectVaultForAI: (vault: Vault) => void }> = ({ onSelectVaultForAI }) => {
  const { associationId } = useParams<{ associationId: string }>();
  const navigate = useNavigate();

  if (!associationId) {
    navigate('/earn');
    return null;
  }

  return (
    <AssociationDetail
      associationId={associationId}
      onBack={() => navigate('/earn')}
      onSelectVaultForAI={onSelectVaultForAI}
    />
  );
};

export default App;