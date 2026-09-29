import React, { useState } from 'react';
import { useI18n } from '../i18n';
import {
  Flame,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  Layers,
  Calendar,
  Globe,
  PlusCircle
} from 'lucide-react';

interface TrendHunterProps {
  onBuildProductWithTrend: (niche: string, keyword: string) => void;
}

export const TrendHunter: React.FC<TrendHunterProps> = ({ onBuildProductWithTrend }) => {
  const { t } = useI18n();

  const [keyword, setKeyword] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([
    {
      keyword: 'Vintage National Park Hiking',
      niche: 'Outdoor & Nature',
      search_demand: 88,
      competition: 54,
      trend_momentum: 'Rising',
      niche_specificity: 84,
      opportunity_score: 86,
      source: 'Etsy Signals & Pinterest Search',
      data_type: 'Velocity & Save Aggregation',
      last_updated: '2026-09-29',
      related_keywords: ['retro trail shirt', 'lost in the woods tee', 'pacific northwest badge']
    },
    {
      keyword: 'Cottagecore Botanical Herbs',
      niche: 'Gardening & Aesthetic',
      search_demand: 82,
      competition: 61,
      trend_momentum: 'Stable',
      niche_specificity: 89,
      opportunity_score: 80,
      source: 'Pinterest Visual Signal',
      data_type: 'Board Save Index',
      last_updated: '2026-09-28',
      related_keywords: ['wild herb illustration', 'vintage plant lover mug', 'cottagecore tote']
    },
    {
      keyword: 'Funny Anxious Dog Parent',
      niche: 'Pets & Humor',
      search_demand: 91,
      competition: 48,
      trend_momentum: 'Rising',
      niche_specificity: 92,
      opportunity_score: 93,
      source: 'Etsy Marketplace Trend Stream',
      data_type: 'Add-to-Cart Velocity',
      last_updated: '2026-09-29',
      related_keywords: ['introvert dog mom', 'emotional support golden', 'funny pet parent hoodie']
    }
  ]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/trends/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: keyword.trim(),
          product: selectedProduct,
          country: selectedCountry
        })
      });
      const data = await res.json();
      setResults([data, ...results.filter(r => r.keyword !== data.keyword)]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMomentumIcon = (mom: string) => {
    if (mom === 'Rising') return <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold"><TrendingUp className="w-3.5 h-3.5" /> Rising</span>;
    if (mom === 'Declining') return <span className="inline-flex items-center gap-1 text-rose-400 font-semibold"><TrendingDown className="w-3.5 h-3.5" /> Declining</span>;
    return <span className="inline-flex items-center gap-1 text-gray-400 font-semibold"><Minus className="w-3.5 h-3.5" /> Stable</span>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono mb-1">
            <Flame className="w-4 h-4" />
            <span>Market Demand & Trend Signal Velocity</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Trend Hunter</h1>
          <p className="text-xs text-gray-400">Discover vetted print-on-demand search spikes with transparent source attribution.</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <form onSubmit={handleSearch} className="p-4 rounded-2xl bg-[#12141e] border border-gray-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search keyword, niche, or theme (e.g. Vintage Astronomy, Pickleball Mom)..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#0c0e15] border border-gray-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wide shadow-md shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{loading ? 'Analyzing Signals...' : 'Analyze Trend'}</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-800/60 text-xs">
          <span className="text-[11px] text-gray-500 font-mono flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filters:
          </span>

          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="bg-[#181a26] border border-gray-800 rounded-lg px-2.5 py-1 text-xs text-gray-300 focus:outline-none"
          >
            <option value="All">All Products</option>
            <option value="T-Shirt">T-Shirts</option>
            <option value="Hoodie">Hoodies</option>
            <option value="Mug">Mugs</option>
            <option value="Tote Bag">Tote Bags</option>
          </select>

          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="bg-[#181a26] border border-gray-800 rounded-lg px-2.5 py-1 text-xs text-gray-300 focus:outline-none"
          >
            <option value="US">Market: United States</option>
            <option value="UK">Market: United Kingdom</option>
            <option value="CA">Market: Canada</option>
            <option value="EU">Market: European Union</option>
          </select>
        </div>
      </form>

      {/* Trend Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((tr, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-[#12141e] border border-gray-800 hover:border-gray-700 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header metadata */}
              <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                <span className="text-indigo-400">{tr.niche}</span>
                {getMomentumIcon(tr.trend_momentum)}
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-white mb-2">{tr.keyword}</h3>

              {/* Opportunity Score Indicator */}
              <div className="p-3 rounded-xl bg-[#0b0d13] border border-gray-800/80 mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Opportunity Score</div>
                  <div className="text-lg font-mono font-bold text-emerald-400">{tr.opportunity_score}/100</div>
                </div>
                <div className="text-right text-[11px] font-mono text-gray-400">
                  <div>Demand: <strong className="text-white">{tr.search_demand}</strong></div>
                  <div>Competition: <strong className="text-white">{tr.competition}</strong></div>
                </div>
              </div>

              {/* Related Keyword Chips */}
              <div className="space-y-1 mb-4">
                <span className="text-[10px] font-mono text-gray-500 uppercase">Related Signals:</span>
                <div className="flex flex-wrap gap-1.5">
                  {tr.related_keywords?.slice(0, 3).map((kw: string, kIdx: number) => (
                    <span key={kIdx} className="text-[11px] px-2 py-0.5 rounded bg-gray-800/60 text-gray-300">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions & Data Source */}
            <div className="pt-3 border-t border-gray-800/80 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                <span>{tr.source}</span>
                <span>{tr.last_updated}</span>
              </div>

              <button
                onClick={() => onBuildProductWithTrend(tr.niche, tr.keyword)}
                className="w-full py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 hover:border-transparent text-indigo-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Build POD Product from Trend</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
