import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { PinterestPin } from '../types';
import {
  Pin,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Share2,
  Lock,
  Layers,
  CheckCircle2,
  Info
} from 'lucide-react';

interface PinterestFactoryProps {
  pins: PinterestPin[];
  productName: string;
}

export const PinterestFactory: React.FC<PinterestFactoryProps> = ({ pins, productName }) => {
  const { t } = useI18n();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

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
          <div className="flex items-center gap-2 text-rose-400 text-xs font-mono mb-1">
            <Pin className="w-4 h-4" />
            <span>Organic Traffic & Visual Discovery Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            {t('pinterest.title', 'Pinterest Content Factory')}
          </h1>
          <p className="text-xs text-gray-400">
            5 high-CTR Pin concepts per product complete with keywords, compelling CTAs, and destination links.
          </p>
        </div>

        {/* Pinterest Connection Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141622] border border-gray-800 text-xs">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-gray-300">{isConnected ? 'Pinterest Connected' : 'Not Connected'}</span>
          </div>

          <button
            onClick={() => setIsConnected(!isConnected)}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-colors flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isConnected ? 'Disconnect Shop' : 'Connect Pinterest'}</span>
          </button>
        </div>
      </div>

      {/* Compliance / Connection Notice */}
      <div className="p-4 rounded-2xl bg-[#141620] border border-gray-800 text-xs text-gray-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block mb-0.5">Pinterest API Compliance & Safety:</strong>
          {t('pinterest.connectNotice', 'Connect Pinterest to publish Pins directly from GiveMePOD. All credentials and access tokens are managed securely server-side. GiveMePOD never publishes without explicit user authorization.')}
        </div>
      </div>

      {/* 5 Pins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pins.map((pin, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-[#12141e] border border-gray-800 hover:border-gray-700 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-rose-400 font-bold">PIN 0{idx + 1}</span>
                <span className="text-gray-500 truncate max-w-[140px]">{pin.suggested_board}</span>
              </div>

              <h3 className="text-sm font-bold text-white line-clamp-2">{pin.pin_title}</h3>

              <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                {pin.description}
              </p>

              {/* Image Concept Note */}
              <div className="p-2.5 rounded-xl bg-[#0c0e15] border border-gray-800/80 text-[11px] text-gray-400">
                <span className="text-indigo-400 font-mono block text-[10px] uppercase">Creative Visual Direction:</span>
                {pin.image_concept}
              </div>

              {/* Keywords */}
              <div className="flex flex-wrap gap-1">
                {pin.keywords?.map((kw, kIdx) => (
                  <span key={kIdx} className="text-[10px] font-mono text-gray-400 bg-gray-800/80 px-1.5 py-0.5 rounded">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800/80 mt-4 flex items-center justify-between">
              <div className="text-[11px] text-emerald-400 font-mono">CTA: {pin.cta}</div>
              <button
                onClick={() =>
                  copyToClipboard(
                    `${pin.pin_title}\n\n${pin.description}\n\nTags: ${pin.keywords.join(' ')}\nBoard: ${pin.suggested_board}`,
                    `pin_${idx}`
                  )
                }
                className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
                title="Copy Pin Package"
              >
                {copiedKey === `pin_${idx}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
