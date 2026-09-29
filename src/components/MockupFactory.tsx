import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { MockupItem } from '../types';
import JSZip from 'jszip';
import {
  Camera,
  Download,
  Copy,
  Check,
  Sparkles,
  Maximize2,
  SlidersHorizontal,
  Layers,
  ChevronRight,
  Eye
} from 'lucide-react';

interface MockupFactoryProps {
  mockups: MockupItem[];
  productName: string;
  designTitle: string;
}

export const MockupFactory: React.FC<MockupFactoryProps> = ({
  mockups,
  productName,
  designTitle
}) => {
  const { t } = useI18n();

  const [selectedMockup, setSelectedMockup] = useState<MockupItem>(mockups[0] || null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [downloadingZip, setDownloadingZip] = useState(false);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadAllZip = async () => {
    setDownloadingZip(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder(`${productName.replace(/[^a-zA-Z0-9]/g, '_')}_mockup_package`);

      // Add text prompts and specs for all 11 mockups
      mockups.forEach((m) => {
        const content = `MOCKUP ${m.id} — ${m.title.toUpperCase()}
Purpose: ${m.purpose}
Scene: ${m.scene}
Camera & Lens: ${m.camera}
Lighting: ${m.lighting}
Composition: ${m.composition}
Product Placement: ${m.product_placement}
Negative Constraints: ${m.negative_prompt}
`;
        folder?.file(`mockup_${String(m.id).padStart(2, '0')}_${m.type}.txt`, content);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${productName.replace(/[^a-zA-Z0-9]/g, '_')}_11_mockups_package.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create ZIP', err);
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Batch Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-mono mb-1">
            <Camera className="w-4 h-4" />
            <span>11-Image Complete Ecommerce Listing Suite</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            {t('mockup.title', 'Mockup Factory (11 Images)')}
          </h1>
          <p className="text-xs text-gray-400">
            1 Main Etsy Hero Mockup + 10 dedicated lifestyle, detail, and outfit variations maintaining exact print fidelity.
          </p>
        </div>

        <button
          onClick={handleDownloadAllZip}
          disabled={downloadingZip}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs tracking-wide shadow-md shadow-purple-600/20 transition-all flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>{downloadingZip ? 'Packing ZIP...' : t('mockup.downloadAll', 'Download All 11 (.ZIP)')}</span>
        </button>
      </div>

      {/* Main View: Hero Stage & Detail Inspector */}
      {selectedMockup && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 rounded-3xl bg-[#12141e] border border-gray-800">
          {/* Visual Mockup Scene Simulation (Left 7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 rounded-2xl bg-[#0b0c13] border border-gray-800/80 relative overflow-hidden min-h-[360px]">
            {/* Mockup Badge */}
            <div className="absolute top-4 left-4 z-20">
              <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono uppercase tracking-wider font-bold">
                {selectedMockup.badge} · {selectedMockup.type.toUpperCase()}
              </span>
            </div>

            {/* Simulated Photorealistic Garment Display with consistent graphic */}
            <div
              className="relative w-64 h-72 sm:w-72 sm:h-80 rounded-2xl shadow-2xl flex items-center justify-center transition-all p-4 border border-gray-700/60"
              style={{ backgroundColor: selectedMockup.preview_bg_color }}
            >
              {/* Product Silhouette / T-Shirt Graphic */}
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                {/* Apparel Collar Contour */}
                <div className="w-24 h-5 border-b-2 border-white/20 rounded-b-full mb-3" />

                {/* Printed Artwork Vector (Stays identical across all mockups!) */}
                <div className="p-3 border border-dashed border-white/20 rounded-xl bg-black/30 backdrop-blur-xs flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full border border-amber-400/60 flex items-center justify-center mb-1">
                    <svg className="w-9 h-9 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
                    </svg>
                  </div>
                  <span className="text-[9px] font-mono font-bold tracking-wider text-amber-200 uppercase">
                    LOST IN THE PINES
                  </span>
                  <span className="text-[7px] font-mono text-gray-400 uppercase">
                    CAMP SOCIETY
                  </span>
                </div>

                {/* Garment subtle drape folds */}
                <div className="w-48 h-1 bg-white/5 rounded-full mt-4" />
              </div>
            </div>

            <div className="mt-4 text-center">
              <span className="text-xs font-semibold text-white">{selectedMockup.title}</span>
              <p className="text-[11px] text-gray-400">{selectedMockup.purpose}</p>
            </div>
          </div>

          {/* Technical Prompt Engine Metadata (Right 5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-purple-400">Mockup Prompt Architecture</span>
                <h3 className="text-base font-bold text-white">{selectedMockup.title}</h3>
                <p className="text-xs text-gray-400">{selectedMockup.purpose}</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#0c0e15] border border-gray-800">
                  <span className="text-[10px] font-mono text-gray-500 uppercase block">Scene Context:</span>
                  <span className="text-gray-300">{selectedMockup.scene}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0c0e15] border border-gray-800">
                  <span className="text-[10px] font-mono text-gray-500 uppercase block">Camera & Optical Spec:</span>
                  <span className="text-gray-300">{selectedMockup.camera}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0c0e15] border border-gray-800">
                  <span className="text-[10px] font-mono text-gray-500 uppercase block">Lighting & Reflections:</span>
                  <span className="text-gray-300">{selectedMockup.lighting}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0c0e15] border border-gray-800">
                  <span className="text-[10px] font-mono text-gray-500 uppercase block">Negative Constraints:</span>
                  <span className="text-rose-300/80 font-mono text-[11px]">{selectedMockup.negative_prompt}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                copyToClipboard(
                  `Mockup ${selectedMockup.id}: ${selectedMockup.scene}. Camera: ${selectedMockup.camera}. Lighting: ${selectedMockup.lighting}. Placement: ${selectedMockup.product_placement}. Negative: ${selectedMockup.negative_prompt}`,
                  `mockup_${selectedMockup.id}`
                )
              }
              className="w-full py-2.5 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              {copiedKey === `mockup_${selectedMockup.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === `mockup_${selectedMockup.id}` ? 'Prompt Copied' : 'Copy Mockup Prompt Specification'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 11 Mockups Thumbnail Gallery Selector */}
      <div>
        <div className="text-xs font-mono uppercase text-gray-400 mb-3 flex items-center justify-between">
          <span>Complete 11-Image Listing Set:</span>
          <span>Click any scene to inspect parameters</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {mockups.map((m) => {
            const isSelected = selectedMockup?.id === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMockup(m)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-purple-600/15 border-purple-500 shadow-md shadow-purple-500/10'
                    : 'bg-[#12141e] border-gray-800 hover:border-gray-700'
                }`}
              >
                <div
                  className="w-full h-20 rounded-xl mb-2 flex items-center justify-center border border-gray-700/40 relative overflow-hidden"
                  style={{ backgroundColor: m.preview_bg_color }}
                >
                  <span className="text-[9px] font-mono uppercase text-white/70 bg-black/40 px-1.5 py-0.5 rounded">
                    {m.badge}
                  </span>
                  {m.is_hero && (
                    <span className="absolute top-1 right-1 text-[8px] font-mono text-emerald-300 bg-emerald-500/20 px-1 rounded">
                      HERO
                    </span>
                  )}
                </div>

                <div className="text-xs font-semibold text-white truncate">{m.title}</div>
                <div className="text-[10px] text-gray-400 truncate">{m.type}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
