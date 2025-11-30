import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Settings, AlertCircle, CheckCircle2, Loader2, ExternalLink, Sprout } from 'lucide-react';
import associationsData from '../associations.json';

interface DeploymentResult {
  address: string;
  seed: string;
  ammAccount?: string;
}

interface HarvestResult {
  success: boolean;
  lpTokensWithdrawn: string;
  xrpAmount: number;
  ngoAddress: string;
  withdrawTxHash: string;
  paymentTxHash: string | null;
}

const Admin: React.FC = () => {
  const [formData, setFormData] = useState({
    vaultName: '',
    vaultDescription: '',
    vaultTokenCurrency: '',
    strategyType: 'AMM' as 'AMM' | 'TOKEN_YIELD',
    ngoAddress: '',
    ammPoolAddress: '',
    yieldTokenCurrency: '',
    yieldTokenIssuer: '',
  });

  const [deploying, setDeploying] = useState(false);
  const [result, setResult] = useState<DeploymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [harvesting, setHarvesting] = useState(false);
  const [harvestResult, setHarvestResult] = useState<HarvestResult | null>(null);
  const [harvestError, setHarvestError] = useState<string | null>(null);
  const [harvestVaultAddress, setHarvestVaultAddress] = useState('rsyu6pQUbm1ZbZVxMP7RgnXtgycetiU4L9');
  const [harvestVaultSeed, setHarvestVaultSeed] = useState('sEdV4XGLyorp6MwtbfmjejWpdGbfCT1');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeploying(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/deploy-vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Deployment failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error('Deployment error:', err);
      setError(err.message || 'Deployment failed');
    } finally {
      setDeploying(false);
    }
  };

  const handleHarvest = async () => {
    setHarvesting(true);
    setHarvestError(null);
    setHarvestResult(null);

    try {
      const response = await fetch('/api/harvest-yield', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vaultAddress: harvestVaultAddress,
          vaultSeed: harvestVaultSeed,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Harvest failed');
      }

      const data = await response.json();
      setHarvestResult(data);
    } catch (err: any) {
      console.error('Harvest error:', err);
      setHarvestError(err.message || 'Harvest failed');
    } finally {
      setHarvesting(false);
    }
  };

  const associations = associationsData.associations;

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
          <div className="flex items-center gap-3">
            <Settings className="text-white" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-white">Créer une nouvelle campagne</h1>
              <p className="text-blue-100 text-sm">Déployez une vault sur XRPL Testnet</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nom de la campagne</label>
              <input
                type="text"
                required
                value={formData.vaultName}
                onChange={(e) => setFormData({ ...formData, vaultName: e.target.value })}
                placeholder="Fonds pour l'environnement"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Code du token (3 lettres)</label>
              <input
                type="text"
                required
                maxLength={3}
                value={formData.vaultTokenCurrency}
                onChange={(e) => setFormData({ ...formData, vaultTokenCurrency: e.target.value.toUpperCase() })}
                placeholder="ENV"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea
              required
              value={formData.vaultDescription}
              onChange={(e) => setFormData({ ...formData, vaultDescription: e.target.value })}
              placeholder="Cette campagne soutient les initiatives environnementales..."
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Stratégie</label>
              <select
                value={formData.strategyType}
                onChange={(e) => setFormData({ ...formData, strategyType: e.target.value as 'AMM' | 'TOKEN_YIELD' })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="AMM">AMM (2% APY)</option>
                <option value="TOKEN_YIELD">Token Yield (10% APY)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Association</label>
              <select
                required
                value={formData.ngoAddress}
                onChange={(e) => setFormData({ ...formData, ngoAddress: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choisir une association...</option>
                {associations.map((assoc) => (
                  <option key={assoc.id} value={assoc.walletAddress}>
                    {assoc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formData.strategyType === 'AMM' && (
            <div className="space-y-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <label className="text-sm font-medium text-slate-700">Adresse du Pool AMM</label>
              <input
                type="text"
                required
                value={formData.ammPoolAddress}
                onChange={(e) => setFormData({ ...formData, ammPoolAddress: e.target.value })}
                placeholder="rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-blue-700">L'adresse du pool AMM existant où les fonds seront déployés</p>
            </div>
          )}

          {formData.strategyType === 'TOKEN_YIELD' && (
            <div className="space-y-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Token Yield - Currency Code</label>
                <input
                  type="text"
                  required
                  maxLength={3}
                  value={formData.yieldTokenCurrency}
                  onChange={(e) => setFormData({ ...formData, yieldTokenCurrency: e.target.value.toUpperCase() })}
                  placeholder="USD"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Token Yield - Issuer Address</label>
                <input
                  type="text"
                  required
                  value={formData.yieldTokenIssuer}
                  onChange={(e) => setFormData({ ...formData, yieldTokenIssuer: e.target.value })}
                  placeholder="rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-purple-700">Le token qui génère du yield (ex: USD stablecoin avec intérêts)</p>
            </div>
          )}

          <div className="flex justify-end pt-4 mt-6">
            <button
              type="submit"
              disabled={deploying}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {deploying ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Déploiement...
                </>
              ) : (
                <>
                  <Wallet size={20} />
                  Créer la campagne
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-8 mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="text-red-600 mt-0.5" size={20} />
            <div>
              <h3 className="font-medium text-red-900">Échec du déploiement</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-8 mb-8 space-y-4"
          >
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="text-green-600 mt-0.5" size={20} />
              <div className="flex-1">
                <h3 className="font-medium text-green-900">Campagne créée avec succès !</h3>
                <p className="text-sm text-green-700 mt-1">Votre vault est maintenant en ligne sur XRPL Testnet</p>
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-lg space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Adresse de la Vault</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded text-sm font-mono">
                    {result.address}
                  </code>
                  <a
                    href={`https://testnet.xrpl.org/accounts/${result.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                  >
                    <ExternalLink size={18} className="text-slate-600" />
                  </a>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Seed de la Vault</label>
                <div className="mt-1 p-3 bg-yellow-50 border border-yellow-300 rounded">
                  <code className="text-sm font-mono text-yellow-900">{result.seed}</code>
                  <p className="text-xs text-yellow-700 mt-2">⚠️ Sauvegardez ce seed de manière sécurisée !</p>
                </div>
              </div>

              {result.ammAccount && (
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">AMM Account</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded text-sm font-mono">
                      {result.ammAccount}
                    </code>
                    <a
                      href={`https://testnet.xrpl.org/accounts/${result.ammAccount}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      <ExternalLink size={18} className="text-slate-600" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h2 className="font-semibold text-blue-900 mb-2">📝 Comment ça marche</h2>
        <ul className="text-sm text-blue-800 space-y-1.5">
          <li>• Remplissez le formulaire avec le nom et la description de la campagne</li>
          <li>• Choisissez une stratégie (AMM ou Token Yield) et une association</li>
          <li>• Cliquez sur "Deploy Vault" pour créer la campagne sur XRPL</li>
          <li>• Gardez le seed en sécurité pour gérer la vault plus tard</li>
        </ul>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
          <div className="flex items-center gap-3">
            <Sprout className="text-white" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-white">Harvest Yield</h1>
              <p className="text-green-100 text-sm">Récoltez et distribuez les rendements aux associations</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Vault Address</label>
              <input
                type="text"
                value={harvestVaultAddress}
                onChange={(e) => setHarvestVaultAddress(e.target.value)}
                placeholder="rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Vault Seed</label>
              <input
                type="password"
                value={harvestVaultSeed}
                onChange={(e) => setHarvestVaultSeed(e.target.value)}
                placeholder="sXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleHarvest}
              disabled={harvesting || !harvestVaultAddress || !harvestVaultSeed}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {harvesting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Harvesting...
                </>
              ) : (
                <>
                  <Sprout size={20} />
                  Harvest Yield
                </>
              )}
            </button>
          </div>
        </div>

        {harvestError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-8 mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="text-red-600 mt-0.5" size={20} />
            <div>
              <h3 className="font-medium text-red-900">Harvest Failed</h3>
              <p className="text-sm text-red-700 mt-1">{harvestError}</p>
            </div>
          </motion.div>
        )}

        {harvestResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-8 mb-8 space-y-4"
          >
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="text-green-600 mt-0.5" size={20} />
              <div className="flex-1">
                <h3 className="font-medium text-green-900">Yield Harvested Successfully! 🎉</h3>
                <p className="text-sm text-green-700 mt-1">
                  {harvestResult.xrpAmount} XRP sent to NGO
                </p>
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-lg space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">LP Tokens Withdrawn</label>
                <div className="mt-1 px-3 py-2 bg-white border border-slate-300 rounded">
                  <code className="text-sm font-mono">{harvestResult.lpTokensWithdrawn}</code>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">XRP Amount Sent</label>
                <div className="mt-1 px-3 py-2 bg-white border border-slate-300 rounded">
                  <code className="text-sm font-mono">{harvestResult.xrpAmount} XRP</code>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">NGO Address</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded text-sm font-mono">
                    {harvestResult.ngoAddress}
                  </code>
                  <a
                    href={`https://testnet.xrpl.org/accounts/${harvestResult.ngoAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                  >
                    <ExternalLink size={18} className="text-slate-600" />
                  </a>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Withdrawal TX</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded text-sm font-mono truncate">
                    {harvestResult.withdrawTxHash}
                  </code>
                  <a
                    href={`https://testnet.xrpl.org/transactions/${harvestResult.withdrawTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                  >
                    <ExternalLink size={18} className="text-slate-600" />
                  </a>
                </div>
              </div>

              {harvestResult.paymentTxHash && (
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">Payment TX to NGO</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded text-sm font-mono truncate">
                      {harvestResult.paymentTxHash}
                    </code>
                    <a
                      href={`https://testnet.xrpl.org/transactions/${harvestResult.paymentTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      <ExternalLink size={18} className="text-slate-600" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Admin;
