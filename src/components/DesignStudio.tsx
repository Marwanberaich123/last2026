import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { DesignData } from '../types';
import {
  Palette,
  Sparkles,
  Copy,
  Check,
  Download,
  Layers,
  FileCode,
  Sliders,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface DesignStudioProps {
  initialDesign?: DesignData | null;
}

export const DesignStudio: React.FC<DesignStudioProps> = ({ initialDesign }) => {
  const { t } = useI18n();

  const [mode, setMode] = useState<'prompt' | 'artwork'>('prompt');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [design, setDesign] = useState<DesignData>(
    initialDesign || {
      title: 'Lost in the Pines Camp Badge',
      concept: 'Vintage 1970s Pacific Northwest outdoors emblem with stylized pines and sunburst.',
      image_prompt:
        'Commercial print-on-demand graphic design for t-shirt, featuring vintage 1970s national park inspired badge with pine trees, stylized sunburst behind alpine mountains, text "LOST IN THE PINES" curved along top arc, distressed screen print texture, clean vector edges, isolated on transparent background, no t-shirt mockup, no human model, direct to garment print ready.',
      negative_prompt:
        'photograph, realistic person, t-shirt folds, mannequin, blurry, trademarked logos, low resolution, 3d render',
      print_specifications: {
        resolution: '4500 x 5400 px',
        color_profile: 'sRGB IEC61966-2.1',
        dpi: 300,
        dimensions: '15 x 18 inches'
      },
      recommended_product: 'Bella+Canvas 3001 or Comfort Colors 1717',
      color_palette: ['#1B3B2B', '#E8D8B0', '#C86D51', '#2C3539'],
      transparent_background: true
    }
  );

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono mb-1">
            <Palette className="w-4 h-4" />
            <span>Commercial Print-On-Demand Graphic Studio</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">AI Design Studio</h1>
          <p className="text-xs text-gray-400">
            Generate production-ready POD prompts and print specs engineered specifically for DTG apparel printers.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center p-1 bg-[#12141e] border border-gray-800 rounded-xl text-xs">
          <button
            onClick={() => setMode('prompt')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              mode === 'prompt' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Mode B: Production Prompt
          </button>
          <button
            onClick={() => setMode('artwork')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              mode === 'artwork' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Mode A: Artwork Preview
          </button>
        </div>
      </div>

      {mode === 'prompt' ? (
        /* MODE B: Production Prompt Engine */
        <div className="space-y-4">
          {/* Main Prompt Card */}
          <div className="p-6 rounded-3xl bg-[#12141e] border border-gray-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase">Commercial POD Artwork Prompt</span>
                <h3 className="text-base font-bold text-white">{design.title}</h3>
              </div>
              <button
                onClick={() => copyToClipboard(design.image_prompt, 'prompt')}
                className="px-3 py-1.5 rounded-xl bg-[#1b1e2c] hover:bg-[#232738] border border-gray-700 text-gray-200 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                {copiedKey === 'prompt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'prompt' ? 'Copied!' : 'Copy Prompt'}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#0c0e15] border border-gray-800 font-mono text-xs text-gray-300 leading-relaxed select-all">
              {design.image_prompt}
            </div>

            {/* Negative Prompt */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono text-rose-400 uppercase">Negative Constraints (Anti-Mockup)</span>
                <button
                  onClick={() => copyToClipboard(design.negative_prompt, 'negative')}
                  className="text-[11px] text-gray-400 hover:text-white transition-colors"
                >
                  {copiedKey === 'negative' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="p-3 rounded-xl bg-[#0c0e15] border border-gray-800/80 font-mono text-xs text-rose-300/80">
                {design.negative_prompt}
              </div>
            </div>
          </div>

          {/* Print Specifications & Palette */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Print Specs */}
            <div className="p-5 rounded-2xl bg-[#12141e] border border-gray-800 space-y-3">
              <h4 className="text-xs font-mono uppercase text-gray-400">Print Specifications</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#0c0e15] border border-gray-800">
                  <span className="text-gray-500 block text-[10px]">Target Resolution</span>
                  <span className="font-mono text-white font-semibold">{design.print_specifications.resolution}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0c0e15] border border-gray-800">
                  <span className="text-gray-500 block text-[10px]">Print DPI</span>
                  <span className="font-mono text-white font-semibold">{design.print_specifications.dpi} DPI</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0c0e15] border border-gray-800">
                  <span className="text-gray-500 block text-[10px]">Physical Canvas</span>
                  <span className="font-mono text-white font-semibold">{design.print_specifications.dimensions}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0c0e15] border border-gray-800">
                  <span className="text-gray-500 block text-[10px]">Color Profile</span>
                  <span className="font-mono text-white font-semibold">{design.print_specifications.color_profile}</span>
                </div>
              </div>
            </div>

            {/* Recommended Product & Color Palette */}
            <div className="p-5 rounded-2xl bg-[#12141e] border border-gray-800 space-y-3">
              <h4 className="text-xs font-mono uppercase text-gray-400">Recommended Garment & Inks</h4>
              <div className="p-3 rounded-xl bg-[#0c0e15] border border-gray-800 text-xs">
                <span className="text-gray-500 block text-[10px]">Blank Recommendation</span>
                <span className="text-white font-medium">{design.recommended_product}</span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1.5">Color Palette</span>
                <div className="flex items-center gap-2">
                  {design.color_palette.map((color, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      <div
                        className="w-10 h-10 rounded-xl border border-gray-700 shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-[10px] font-mono text-gray-400">{color}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* MODE A: Artwork Vector Canvas */
        <div className="p-8 rounded-3xl bg-[#12141e] border border-gray-800 flex flex-col items-center justify-center text-center">
          {/* Simulated DTG Transparent Canvas Artwork */}
          <div className="w-72 h-80 rounded-2xl bg-[#0c0e15] border border-gray-800 shadow-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden mb-6 group">
            {/* Subtle checkered pattern to signify PNG transparency */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(#ffffff 1px, transparent 1px), radial-gradient(#ffffff 1px, transparent 1px)',
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 8px 8px'
              }}
            />

            {/* Vector Graphic Emblem */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-28 h-28 rounded-full border-2 border-amber-400/80 flex items-center justify-center p-3 relative mb-3 bg-gradient-to-b from-emerald-950/40 to-transparent">
                <svg className="w-16 h-16 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
                </svg>
              </div>
              <span className="text-xs font-mono font-bold tracking-widest text-amber-200 uppercase">
                LOST IN THE PINES
              </span>
              <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase mt-0.5">
                CAMP SOCIETY · 1974
              </span>
            </div>

            <div className="absolute bottom-2 right-2 text-[9px] font-mono text-gray-500 bg-gray-900/80 px-2 py-0.5 rounded border border-gray-800">
              PNG 4500x5400
            </div>
          </div>

          <h3 className="text-base font-bold text-white mb-1">{design.title}</h3>
          <p className="text-xs text-gray-400 max-w-md mb-6 leading-relaxed">
            Direct transparent artwork rendered at 300 DPI direct-to-garment resolution ready for Printify or Printful upload.
          </p>

          <button
            onClick={() => copyToClipboard(design.image_prompt, 'artwork_prompt')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export DTG Print Asset Package</span>
          </button>
        </div>
      )}
    </div>
  );
};
