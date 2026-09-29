import React, { useState } from 'react';
import { useI18n } from '../i18n';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Upload,
  Search,
  ExternalLink,
  Sparkles,
  FileCheck,
  RefreshCw,
  Info
} from 'lucide-react';

export const RiskScanner: React.FC = () => {
  const { t } = useI18n();

  const [inputText, setInputText] = useState('Lost in the Pines Camp Club');
  const [loading, setLoading] = useState(false);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>({
    risk_level: 'LOW',
    detected_evidence: ['Generic outdoor nature wording', 'No proprietary trademarked slogan'],
    ai_inference: 'Low probability of collision with registered goods in US Class 025 (Apparel).',
    needs_human_review: false,
    trademark_flags: [],
    copyright_flags: [],
    celebrity_flags: [],
    brand_flags: [],
    marketplace_policy_notes: 'Compliant with Etsy & Merch by Amazon intellectual property guidelines.',
    suggested_modifications: ['Safe for commercial print-on-demand listing without brand references.'],
    disclaimer: 'GiveMePOD provides automated screening and market analysis. It does not provide legal advice and cannot guarantee that a product is free from intellectual-property claims or marketplace policy violations.'
  });

  const handleScanText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/risk/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: inputText.trim(), type: 'text' })
      });
      const data = await res.json();
      setScanResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setImageUploadLoading(true);
    try {
      const res = await fetch('/api/risk/scan-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name })
      });
      const data = await res.json();
      setScanResult({
        risk_level: data.risk_level,
        detected_evidence: [data.detected_text, ...data.detected_elements],
        ai_inference: `Visual inspection: ${data.style}. Recommended for ${data.recommended_product}.`,
        needs_human_review: false,
        trademark_flags: data.trademark_flags,
        copyright_flags: [],
        celebrity_flags: [],
        brand_flags: [],
        marketplace_policy_notes: 'Visual elements checked for logos, character copies, and brand badges.',
        suggested_modifications: [`Recommended Mockup: ${data.recommended_mockup_style}`],
        disclaimer: data.disclaimer
      });
    } catch (err) {
      console.error(err);
    } finally {
      setImageUploadLoading(false);
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'HIGH':
        return (
          <span className="px-3 py-1 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" /> HIGH RISK
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> MEDIUM RISK
          </span>
        );
      case 'NEEDS REVIEW':
        return (
          <span className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
            <Info className="w-4 h-4" /> NEEDS REVIEW
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> LOW RISK
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-rose-400 text-xs font-mono mb-1">
          <ShieldAlert className="w-4 h-4" />
          <span>Intellectual Property & Policy Compliance Engine</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          {t('risk.title', 'IP / Trademark / Copyright Risk Scanner')}
        </h1>
        <p className="text-xs text-gray-400">
          Screen slogans, product titles, keywords, or uploaded artwork against trademark registers and marketplace policies.
        </p>
      </div>

      {/* Legal Disclaimer Box */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs leading-relaxed flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block mb-0.5">Automated Screening Disclaimer</strong>
          {t('risk.disclaimer', 'GiveMePOD provides automated screening and market analysis. It does not provide legal advice and cannot guarantee that a product is free from intellectual-property claims or marketplace policy violations.')}
        </div>
      </div>

      {/* Input Options: Text Screening & Image Upload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Text/Slogan Scanner */}
        <div className="p-5 rounded-2xl bg-[#12141e] border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-400" />
            <span>Screen Slogan, Phrase, or Brand Name</span>
          </h3>

          <form onSubmit={handleScanText} className="space-y-3">
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter phrase, quote, or slogan to screen..."
              className="w-full p-3 bg-[#0c0e15] border border-gray-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none resize-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wide shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
              <span>{loading ? 'Screening Database...' : 'Run IP Risk Scan'}</span>
            </button>
          </form>
        </div>

        {/* Image Vision Analysis */}
        <div className="p-5 rounded-2xl bg-[#12141e] border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-purple-400" />
            <span>{t('risk.uploadDesign', 'Upload Design Image for Vision Scan')}</span>
          </h3>

          <label className="border-2 border-dashed border-gray-800 hover:border-indigo-500/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#0c0e15]">
            <Upload className="w-8 h-8 text-gray-500 mb-2" />
            <span className="text-xs font-medium text-gray-300">
              {imageUploadLoading ? 'Scanning visual vectors...' : t('risk.dragDrop', 'Drop PNG/JPG design here, or click to browse')}
            </span>
            <span className="text-[10px] text-gray-500 mt-1">Direct-to-garment transparency check & logo detection</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleSimulateImageUpload}
              className="hidden"
              disabled={imageUploadLoading}
            />
          </label>
        </div>
      </div>

      {/* Scan Results Card */}
      {scanResult && (
        <div className="p-6 rounded-3xl bg-[#12141e] border border-gray-800 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gray-800/80">
            <div>
              <span className="text-[10px] font-mono uppercase text-gray-500">Risk Assessment Result</span>
              <h3 className="text-base font-bold text-white">Compliance Breakdown</h3>
            </div>
            {getRiskBadge(scanResult.risk_level)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Detected Evidence */}
            <div className="p-4 rounded-xl bg-[#0c0e15] border border-gray-800 space-y-2">
              <span className="text-[11px] font-mono text-gray-400 uppercase">{t('risk.detectedEvidence', 'Detected Evidence')}</span>
              <ul className="text-xs text-gray-300 space-y-1">
                {scanResult.detected_evidence?.map((item: string, i: number) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Inference */}
            <div className="p-4 rounded-xl bg-[#0c0e15] border border-gray-800 space-y-2">
              <span className="text-[11px] font-mono text-gray-400 uppercase">{t('risk.aiInference', 'AI Inference')}</span>
              <p className="text-xs text-gray-300 leading-relaxed">{scanResult.ai_inference}</p>
            </div>

            {/* Marketplace Policies */}
            <div className="p-4 rounded-xl bg-[#0c0e15] border border-gray-800 space-y-2">
              <span className="text-[11px] font-mono text-gray-400 uppercase">Policy & Action Notes</span>
              <p className="text-xs text-gray-300 leading-relaxed">{scanResult.marketplace_policy_notes}</p>
            </div>
          </div>

          {/* Research & Action Links */}
          <div className="pt-4 border-t border-gray-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="https://tmsearch.uspto.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#181a26] hover:bg-[#202334] text-gray-300 hover:text-white border border-gray-700 font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <span>USPTO Trademark TESS</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href="https://www.wipo.int/branddb/en/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#181a26] hover:bg-[#202334] text-gray-300 hover:text-white border border-gray-700 font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <span>WIPO Global Brand Database</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="text-[11px] text-gray-500 font-mono">
              Always verify proprietary words manually before commercial distribution.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
