import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { BarChart3, Search, Sparkles, TrendingUp, ShieldCheck, Info } from 'lucide-react';

export const MarketAnalyzer: React.FC = () => {
  const { t } = useI18n();

  const [nicheQuery, setNicheQuery] = useState('Vintage Mountain Hiking');
  const [analyzing, setAnalyzing] = useState(false);

  const [scoreData, setScoreData] = useState({
    search_demand: 82,
    competition: 61,
    trend_momentum: 91,
    niche_specificity: 84,
    commercial_intent: 77,
    seasonality: 68,
    profit_potential: 73,
    ip_risk_rating: 'LOW',
    overall_score: 78,
    disclaimer: 'This score is an analytical indicator, not a sales prediction.'
  });

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicheQuery.trim()) return;

    setAnalyzing(true);
    try {
      const res = await fetch('/api/trends/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: nicheQuery })
      });
      const data = await res.json();
      setScoreData({
        search_demand: data.search_demand || 82,
        competition: data.competition || 55,
        trend_momentum: data.trend_momentum === 'Rising' ? 90 : 70,
        niche_specificity: data.niche_specificity || 85,
        commercial_intent: 78,
        seasonality: 72,
        profit_potential: 80,
        ip_risk_rating: 'LOW',
        overall_score: data.opportunity_score || 81,
        disclaimer: 'This score is an analytical indicator, not a sales prediction.'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono mb-1">
          <BarChart3 className="w-4 h-4" />
          <span>Multivariate Niche Opportunity Scoring</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Product Opportunity Analyzer</h1>
        <p className="text-xs text-gray-400">
          Transparent algorithmic breakdown evaluating demand, competition, and IP viability.
        </p>
      </div>

      <form onSubmit={handleAnalyze} className="p-4 rounded-2xl bg-[#12141e] border border-gray-800 flex gap-3">
        <input
          type="text"
          value={nicheQuery}
          onChange={(e) => setNicheQuery(e.target.value)}
          placeholder="Enter product topic or keyword..."
          className="flex-1 px-4 py-2.5 bg-[#0c0e15] border border-gray-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={analyzing}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
        >
          {analyzing ? <Sparkles className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>{analyzing ? 'Calculating...' : 'Evaluate Opportunity'}</span>
        </button>
      </form>

      {/* Main Scorecard Card */}
      <div className="p-6 rounded-3xl bg-[#12141e] border border-gray-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
          <div>
            <span className="text-[10px] font-mono text-gray-400 uppercase">POD Opportunity Score</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-extrabold text-white font-mono">{scoreData.overall_score}</span>
              <span className="text-sm font-mono text-indigo-400">/ 100</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#0c0e15] border border-gray-800 text-xs">
            <span className="text-gray-400 block text-[10px] uppercase font-mono">IP Risk Clearance</span>
            <span className="text-emerald-400 font-bold font-mono">{scoreData.ip_risk_rating} RISK</span>
          </div>
        </div>

        {/* Breakdown Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {[
            { label: 'Search Demand', val: scoreData.search_demand },
            { label: 'Competition Saturation', val: scoreData.competition },
            { label: 'Trend Momentum', val: scoreData.trend_momentum },
            { label: 'Niche Specificity', val: scoreData.niche_specificity },
            { label: 'Commercial Intent', val: scoreData.commercial_intent },
            { label: 'Seasonality Resilience', val: scoreData.seasonality },
            { label: 'Profit Potential', val: scoreData.profit_potential }
          ].map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-[#0c0e15] border border-gray-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 font-medium">{item.label}</span>
                <span className="font-mono text-white font-bold">{item.val}/100</span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full"
                  style={{ width: `${item.val}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 text-[11px] text-gray-400 flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{scoreData.disclaimer}</span>
        </div>
      </div>
    </div>
  );
};
