import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { SearchCode, Search, Sparkles, AlertTriangle, Lightbulb, Tag, DollarSign, Layers } from 'lucide-react';

export const CompetitorResearchView: React.FC = () => {
  const { t } = useI18n();

  const [keyword, setKeyword] = useState('hiking t-shirt');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    keyword: 'hiking t-shirt',
    common_product_types: ['Unisex Jersey T-Shirts', 'Pullover Hoodies', 'Enamel Camp Mugs'],
    common_design_styles: ['Distressed Retro Badges', 'Minimalist Line Art', 'Bold Serif Typography'],
    price_ranges: {
      tshirts: '$22.00 - $28.50',
      hoodies: '$38.00 - $49.00',
      mugs: '$14.00 - $18.00'
    },
    niche_saturation: 'High in generic mountain silhouettes; Low in specific trail-focused and humorous micro-angles',
    market_gaps: {
      what_is_common: 'Generic mountain silhouettes with "The Mountains Are Calling" quotes and overused compass clip-art.',
      what_is_missing: 'Subtle humorous observations for modern trail walkers and ultralight gear enthusiasts.',
      recommended_differentiated_angle: 'Focus on lighthearted, hyper-relatable moments like packing too much trail mix, getting muddy on the easy trail, or celebrating campfire coffee.'
    }
  });

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/competitors/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.trim() })
      });
      const resData = await res.json();
      setData(resData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono mb-1">
          <SearchCode className="w-4 h-4" />
          <span>Market Landscape & Differentiation Architecture</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Competitor Research & Market Gaps</h1>
        <p className="text-xs text-gray-400">
          Identify overused tropes and discover underserved market gaps without imitating or copying existing designs.
        </p>
      </div>

      {/* Compliance Box */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2.5">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
        <span>Ethical POD Principle: GiveMePOD analyzes market structures to help you create differentiated, original artwork. Never copy competitor designs.</span>
      </div>

      {/* Search Input */}
      <form onSubmit={handleAnalyze} className="p-4 rounded-2xl bg-[#12141e] border border-gray-800 flex gap-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Enter product topic or keyword..."
          className="flex-1 px-4 py-2.5 bg-[#0c0e15] border border-gray-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
        >
          {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>{loading ? 'Analyzing Saturation...' : 'Find Market Gaps'}</span>
        </button>
      </form>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Market Gap Discovery */}
        <div className="p-6 rounded-3xl bg-[#12141e] border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Market Gaps & Winning Differentiators</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#0c0e15] border border-gray-800/80">
              <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1">What is Common (Oversaturated):</span>
              <p className="text-gray-300">{data.market_gaps.what_is_common}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#0c0e15] border border-gray-800/80">
              <span className="text-[10px] font-mono text-emerald-400 uppercase block mb-1">What is Missing in Listings:</span>
              <p className="text-gray-300">{data.market_gaps.what_is_missing}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-600/10 border border-indigo-500/30">
              <span className="text-[10px] font-mono text-indigo-300 uppercase block mb-1">Recommended Differentiated Angle:</span>
              <p className="text-white font-medium leading-relaxed">{data.market_gaps.recommended_differentiated_angle}</p>
            </div>
          </div>
        </div>

        {/* Pricing & Formats */}
        <div className="p-6 rounded-3xl bg-[#12141e] border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Marketplace Pricing & Typical Formats</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-[#0c0e15] border border-gray-800 flex items-center justify-between">
              <span className="text-gray-400">T-Shirt Price Range:</span>
              <span className="text-white font-mono font-bold">{data.price_ranges.tshirts}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0c0e15] border border-gray-800 flex items-center justify-between">
              <span className="text-gray-400">Hoodie Price Range:</span>
              <span className="text-white font-mono font-bold">{data.price_ranges.hoodies}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0c0e15] border border-gray-800 flex items-center justify-between">
              <span className="text-gray-400">Mug Price Range:</span>
              <span className="text-white font-mono font-bold">{data.price_ranges.mugs}</span>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1">Saturation Summary:</span>
            <p className="text-xs text-gray-300">{data.niche_saturation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
