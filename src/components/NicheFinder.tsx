import React, { useState } from 'react';
import { useI18n } from '../i18n';
import {
  Lightbulb,
  Search,
  Sparkles,
  ArrowRight,
  Target,
  Compass,
  Layers,
  CheckCircle,
  PlusCircle
} from 'lucide-react';

interface NicheFinderProps {
  onSelectNiche: (nicheName: string) => void;
}

export const NicheFinder: React.FC<NicheFinderProps> = ({ onSelectNiche }) => {
  const { t } = useI18n();

  const [broadNiche, setBroadNiche] = useState('Pets');
  const [loading, setLoading] = useState(false);
  const [nicheData, setNicheData] = useState<any>({
    broad_niche: 'Pets',
    sub_niches: ['Specific Breeds', 'Pet Moms & Dads', 'Senior Pet Care', 'Rescue Dog Appreciation'],
    micro_niches: [
      'Golden Retriever Camping Dads',
      'Anxious Rescue Dog Moms',
      'Senior Dachshund Fan Club',
      'Cat Cafe Coffee Addicts'
    ],
    audience_breakdown: 'Passionate dog & cat owners (25–45) who view pets as immediate family members with high gifting propensity.',
    untapped_angles: [
      'Aesthetic hand-lettered quote tees highlighting specific quirky canine habits rather than generic paw prints',
      'Vintage embroidered-look ceramic camp mugs celebrating rescue adoption anniversaries'
    ],
    recommended_products: ['T-Shirt', 'Mug', 'Tote Bag', 'Hoodie'],
    competition_indicators: 'Medium'
  });

  const handleDiscover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadNiche.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/niches/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ broadNiche: broadNiche.trim() })
      });
      const data = await res.json();
      setNicheData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const presetNiches = ['Pets', 'Outdoor & Camping', 'Book Lovers', 'Coffee & Tea', 'Coding & Tech', 'Plants & Botanical'];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-amber-400 text-xs font-mono mb-1">
          <Lightbulb className="w-4 h-4" />
          <span>Micro-Niche Exploration & Untapped Angles</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Niche Discovery Engine</h1>
        <p className="text-xs text-gray-400">
          Deconstruct oversaturated broad markets into profitable, low-competition micro-niches.
        </p>
      </div>

      {/* Broad Niche Form */}
      <div className="p-5 rounded-2xl bg-[#12141e] border border-gray-800 space-y-4">
        <form onSubmit={handleDiscover} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Compass className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={broadNiche}
              onChange={(e) => setBroadNiche(e.target.value)}
              placeholder="Enter broad niche (e.g. Pets, Fishing, Gaming, Fitness)..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#0c0e15] border border-gray-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wide shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
          >
            {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{loading ? 'Deconstructing Niche...' : 'Deconstruct Niche'}</span>
          </button>
        </form>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] text-gray-500 font-mono">Popular:</span>
          {presetNiches.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setBroadNiche(p);
              }}
              className="px-2.5 py-1 rounded-lg bg-gray-800/60 hover:bg-gray-700 text-gray-300 text-[11px] transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Results Decomposition Breakdown */}
      {nicheData && (
        <div className="space-y-6">
          {/* Breadcrumb Hierarchy breakdown */}
          <div className="p-4 rounded-2xl bg-[#0e1017] border border-gray-800/80 flex items-center gap-2 text-xs font-mono text-gray-400 overflow-x-auto">
            <span className="text-white font-semibold">{nicheData.broad_niche}</span>
            <span className="text-indigo-400">→</span>
            <span>{nicheData.sub_niches?.[0] || 'Sub-Niches'}</span>
            <span className="text-indigo-400">→</span>
            <span className="text-emerald-400 font-bold">{nicheData.micro_niches?.[0] || 'Target Micro-Niche'}</span>
          </div>

          {/* Micro-Niches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#12141e] border border-gray-800">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                <span>High-Intent Micro-Niches</span>
              </h3>
              <div className="space-y-2">
                {nicheData.micro_niches?.map((mn: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#0c0e15] border border-gray-800/60 flex items-center justify-between group hover:border-indigo-500/40 transition-colors"
                  >
                    <span className="text-xs text-gray-200 font-medium">{mn}</span>
                    <button
                      onClick={() => onSelectNiche(mn)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/20 group-hover:bg-indigo-600 text-indigo-300 group-hover:text-white text-[11px] font-semibold transition-all flex items-center gap-1"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>Use Niche</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Untapped Angles */}
            <div className="p-5 rounded-2xl bg-[#12141e] border border-gray-800">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Untapped Market Angles & Gaps</span>
              </h3>
              <div className="space-y-3">
                {nicheData.untapped_angles?.map((angle: string, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#0c0e15] border border-amber-500/20 text-xs text-gray-300 leading-relaxed flex items-start gap-2.5">
                    <span className="text-amber-400 font-mono font-bold shrink-0">0{idx + 1}</span>
                    <span>{angle}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Audience Profiling & Products */}
          <div className="p-5 rounded-2xl bg-[#12141e] border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-mono text-gray-500 uppercase">Target Demographic:</div>
              <div className="text-xs text-gray-300 mt-1">{nicheData.audience_breakdown}</div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-gray-500 uppercase mr-1">Recommended Blanks:</span>
              {nicheData.recommended_products?.map((prod: string, idx: number) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-gray-800 text-xs text-gray-200">
                  {prod}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
