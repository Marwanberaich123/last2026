import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { SeoListingData } from '../types';
import {
  FileText,
  Copy,
  Check,
  Tag,
  HelpCircle,
  Sparkles,
  Info,
  DollarSign,
  Layers,
  ChevronRight
} from 'lucide-react';

interface EtsyListingViewProps {
  seoData: SeoListingData;
}

export const EtsyListingView: React.FC<EtsyListingViewProps> = ({ seoData }) => {
  const { t } = useI18n();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyAllTags = () => {
    copyToClipboard(seoData.tags.join(', '), 'all_tags');
  };

  const titleLength = seoData.seo_title.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono mb-1">
            <FileText className="w-4 h-4" />
            <span>Search Engine Optimization & Listing Copy</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            {t('seo.title', 'Etsy Listing Generator')}
          </h1>
          <p className="text-xs text-gray-400">
            Algorithmic titles under 140 chars, 13 exact tags, structured buyer FAQs, and keyword clusters.
          </p>
        </div>

        {/* Etsy Compliance Notice */}
        <div className="text-[11px] font-mono text-gray-400 max-w-xs text-right">
          GiveMePOD is an independent application and is not endorsed or certified by Etsy, Inc.
        </div>
      </div>

      {/* SEO Title Box with Character Counter */}
      <div className="p-5 rounded-2xl bg-[#12141e] border border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-indigo-400">Algorithmic Title</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                titleLength <= 140 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              {titleLength}/140 chars
            </span>
          </div>

          <button
            onClick={() => copyToClipboard(seoData.seo_title, 'title')}
            className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            {copiedKey === 'title' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'title' ? 'Copied' : 'Copy Title'}</span>
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0c0e15] border border-gray-800 text-xs font-medium text-white leading-relaxed select-all">
          {seoData.seo_title}
        </div>
      </div>

      {/* 13 Etsy Tags Matrix */}
      <div className="p-5 rounded-2xl bg-[#12141e] border border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-mono uppercase text-purple-400">13 Algorithmic Etsy Tags</span>
            <span className="text-[10px] font-mono text-gray-500">({seoData.tags.length}/13 populated)</span>
          </div>

          <button
            onClick={copyAllTags}
            className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            {copiedKey === 'all_tags' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'all_tags' ? 'All 13 Copied!' : 'Copy All 13 Tags'}</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {seoData.tags.map((tag, idx) => (
            <button
              key={idx}
              onClick={() => copyToClipboard(tag, `tag_${idx}`)}
              className="px-3 py-1.5 rounded-xl bg-[#0c0e15] hover:bg-[#181a28] border border-gray-800 text-xs text-gray-300 hover:text-white font-medium transition-colors flex items-center gap-1.5 group"
            >
              <span className="text-[10px] font-mono text-gray-500 group-hover:text-purple-400">#{idx + 1}</span>
              <span>{tag}</span>
              {copiedKey === `tag_${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-gray-600 group-hover:text-gray-300" />}
            </button>
          ))}
        </div>
      </div>

      {/* Description & Materials */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Full Listing Description (Left 7 Cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#12141e] border border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-gray-400">Full Description & Hook</span>
            <button
              onClick={() => copyToClipboard(seoData.description, 'desc')}
              className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              {copiedKey === 'desc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'desc' ? 'Copied' : 'Copy Description'}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#0c0e15] border border-gray-800 text-xs text-gray-300 whitespace-pre-line leading-relaxed max-h-80 overflow-y-auto font-sans">
            {seoData.description}
          </div>
        </div>

        {/* FAQs, Price Range, & Alt Text (Right 5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Price Range */}
          <div className="p-4 rounded-2xl bg-[#12141e] border border-gray-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-gray-500 uppercase">Suggested Price Range</span>
              <div className="text-base font-bold font-mono text-emerald-400">
                ${seoData.price_range?.min?.toFixed(2)} – ${seoData.price_range?.max?.toFixed(2)} {seoData.price_range?.currency || 'USD'}
              </div>
            </div>
            <DollarSign className="w-6 h-6 text-emerald-400/50" />
          </div>

          {/* Materials & Alt text */}
          <div className="p-4 rounded-2xl bg-[#12141e] border border-gray-800 space-y-2 text-xs">
            <div>
              <span className="text-[10px] font-mono text-gray-500 uppercase block">Materials Spec:</span>
              <p className="text-gray-300">{seoData.materials}</p>
            </div>
            <div className="pt-2 border-t border-gray-800">
              <span className="text-[10px] font-mono text-gray-500 uppercase block">Image Alt Text (SEO):</span>
              <p className="text-gray-300 italic">{seoData.alt_text}</p>
            </div>
          </div>

          {/* Buyer FAQs */}
          <div className="p-4 rounded-2xl bg-[#12141e] border border-gray-800 space-y-2 text-xs">
            <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1">Buyer FAQs:</span>
            {seoData.buyer_faq?.map((faq, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-[#0c0e15] border border-gray-800/80">
                <strong className="text-white block mb-0.5">{faq.q}</strong>
                <p className="text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
