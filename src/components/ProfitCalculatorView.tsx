import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { ProfitCalculation } from '../types';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  Percent,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';

interface ProfitCalculatorViewProps {
  initialProfit?: ProfitCalculation | null;
}

export const ProfitCalculatorView: React.FC<ProfitCalculatorViewProps> = ({ initialProfit }) => {
  const { t } = useI18n();

  const [sellingPrice, setSellingPrice] = useState(initialProfit?.selling_price || 26.99);
  const [productCost, setProductCost] = useState(initialProfit?.product_cost || 8.50);
  const [shipping, setShipping] = useState(initialProfit?.shipping || 4.25);
  const [marketplaceFeePct, setMarketplaceFeePct] = useState(8); // ~6.5% Etsy transaction + listing
  const [paymentFeePct, setPaymentFeePct] = useState(3.5); // Stripe / Etsy payments
  const [adCost, setAdCost] = useState(initialProfit?.ad_cost || 2.50);
  const [currency, setCurrency] = useState(initialProfit?.currency || 'USD');

  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'CA$',
    AUD: 'AU$',
    MAD: 'DH '
  };

  const curr = currencySymbols[currency] || '$';

  // Calculations
  const grossRevenue = Number(sellingPrice) || 0;
  const fees = (grossRevenue * (marketplaceFeePct / 100)) + (grossRevenue * (paymentFeePct / 100));
  const totalCost = Number(productCost) + Number(shipping) + Number(adCost) + fees;
  const netProfit = grossRevenue - totalCost;
  const marginPct = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono mb-1">
            <Calculator className="w-4 h-4" />
            <span>Unit Economics & Net Margin Simulator</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            {t('profit.title', 'Profit & Margin Calculator')}
          </h1>
          <p className="text-xs text-gray-400">
            Model accurate direct-to-garment margins accounting for print costs, shipping, platform fees, and ad acquisitions.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center bg-[#12141e] border border-gray-800 rounded-xl p-1 text-xs">
          <span className="text-gray-400 px-2 font-mono">Currency:</span>
          {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'MAD'].map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-2.5 py-1 rounded-lg font-mono font-semibold transition-colors ${
                currency === c ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls & Inputs (Left 7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[#12141e] border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-white mb-2">Cost & Pricing Parameters</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                {t('profit.sellingPrice', 'Target Retail Price')} ({curr})
              </label>
              <input
                type="number"
                step="0.01"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-[#0c0e15] border border-gray-800 focus:border-indigo-500 rounded-xl text-xs font-mono text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                {t('profit.productCost', 'Print & Blank Cost')} ({curr})
              </label>
              <input
                type="number"
                step="0.01"
                value={productCost}
                onChange={(e) => setProductCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-[#0c0e15] border border-gray-800 focus:border-indigo-500 rounded-xl text-xs font-mono text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                {t('profit.shipping', 'Shipping Cost')} ({curr})
              </label>
              <input
                type="number"
                step="0.01"
                value={shipping}
                onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-[#0c0e15] border border-gray-800 focus:border-indigo-500 rounded-xl text-xs font-mono text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                {t('profit.adCost', 'Est. Ad Cost per Sale')} ({curr})
              </label>
              <input
                type="number"
                step="0.01"
                value={adCost}
                onChange={(e) => setAdCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-[#0c0e15] border border-gray-800 focus:border-indigo-500 rounded-xl text-xs font-mono text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Marketplace Fee (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={marketplaceFeePct}
                onChange={(e) => setMarketplaceFeePct(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-[#0c0e15] border border-gray-800 focus:border-indigo-500 rounded-xl text-xs font-mono text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Payment Processing Fee (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={paymentFeePct}
                onChange={(e) => setPaymentFeePct(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-[#0c0e15] border border-gray-800 focus:border-indigo-500 rounded-xl text-xs font-mono text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Results & Margins Card (Right 5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#12141e] border border-gray-800 flex flex-col justify-between space-y-6">
          <div>
            <span className="text-[10px] font-mono text-emerald-400 uppercase">Estimated Unit Margin</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-extrabold text-white font-mono">
                {curr}{netProfit.toFixed(2)}
              </span>
              <span className="text-sm font-mono text-gray-400">/ unit</span>
            </div>

            {/* Profit Margin Gauge */}
            <div className="mt-4 p-4 rounded-2xl bg-[#0c0e15] border border-gray-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">{t('profit.profitMargin', 'Net Profit Margin')}</span>
                <span className={`font-mono font-bold ${marginPct >= 20 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {marginPct.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${marginPct >= 20 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(Math.max(marginPct, 0), 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Breakdown Ledger */}
          <div className="space-y-2 pt-4 border-t border-gray-800 text-xs">
            <div className="flex items-center justify-between text-gray-400">
              <span>{t('profit.grossRevenue', 'Gross Retail Price')}:</span>
              <span className="text-white font-mono">{curr}{grossRevenue.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span>Production + Shipping:</span>
              <span className="text-rose-400 font-mono">-{curr}{(Number(productCost) + Number(shipping)).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span>Platform & Processing Fees:</span>
              <span className="text-rose-400 font-mono">-{curr}{fees.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span>Estimated Ad Spend:</span>
              <span className="text-rose-400 font-mono">-{curr}{Number(adCost).toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-gray-800 flex items-center justify-between font-bold text-white">
              <span>Estimated Net Return:</span>
              <span className="text-emerald-400 font-mono">{curr}{netProfit.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
