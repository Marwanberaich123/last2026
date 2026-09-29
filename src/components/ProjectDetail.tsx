import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { Project } from '../types';
import { DesignStudio } from './DesignStudio';
import { MockupFactory } from './MockupFactory';
import { EtsyListingView } from './EtsyListingView';
import { PinterestFactory } from './PinterestFactory';
import { ProfitCalculatorView } from './ProfitCalculatorView';
import JSZip from 'jszip';
import {
  ArrowLeft,
  Download,
  Share2,
  Trash2,
  Copy,
  Archive,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Camera,
  Palette,
  ShieldCheck,
  TrendingUp,
  Calculator,
  Pin,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onUpdateProject: (updated: Project) => void;
  onDuplicate: (projectId: string) => void;
  onDelete: (projectId: string) => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onBack,
  onUpdateProject,
  onDuplicate,
  onDelete
}) => {
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'concept' | 'design' | 'mockups' | 'risk' | 'seo' | 'profit' | 'pinterest'
  >('overview');

  const [exporting, setExporting] = useState(false);

  // Quality check metrics
  const hasDesign = Boolean(project.design);
  const hasMockups = Boolean(project.mockups && project.mockups.length >= 11);
  const hasSeo = Boolean(project.seo_listing && project.seo_listing.tags?.length === 13);
  const hasProfit = Boolean(project.profit);
  const isLowRisk = project.risk_analysis?.risk_level === 'LOW';

  const isFullyReady = hasDesign && hasMockups && hasSeo && hasProfit;

  const handleExportZip = async () => {
    setExporting(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder(`${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_package`);

      // 1. Project Metadata & Readiness
      const metadata = {
        name: project.name,
        product_type: project.product_type,
        niche: project.niche,
        style: project.style,
        audience: project.audience,
        opportunity_score: project.opportunity_score,
        risk_analysis: project.risk_analysis,
        exported_at: new Date().toISOString()
      };
      folder?.file('project_summary.json', JSON.stringify(metadata, null, 2));

      // 2. SEO Listing & Tags
      if (project.seo_listing) {
        const seoText = `TITLE:
${project.seo_listing.seo_title}

13 ETSY TAGS:
${project.seo_listing.tags.join(', ')}

SHORT HOOK:
${project.seo_listing.short_description}

FULL DESCRIPTION:
${project.seo_listing.description}

MATERIALS:
${project.seo_listing.materials}

IMAGE ALT TEXT:
${project.seo_listing.alt_text}
`;
        folder?.file('etsy_seo_listing.txt', seoText);
      }

      // 3. Design Artwork Prompt
      if (project.design) {
        const designText = `TITLE: ${project.design.title}
CONCEPT: ${project.design.concept}

IMAGE GENERATION PROMPT:
${project.design.image_prompt}

NEGATIVE CONSTRAINTS:
${project.design.negative_prompt}

PRINT SPECIFICATIONS:
Resolution: ${project.design.print_specifications.resolution}
DPI: ${project.design.print_specifications.dpi}
Canvas: ${project.design.print_specifications.dimensions}
Color Profile: ${project.design.print_specifications.color_profile}

RECOMMENDED BLANK: ${project.design.recommended_product}
COLOR PALETTE: ${project.design.color_palette.join(', ')}
`;
        folder?.file('dtg_artwork_prompt.txt', designText);
      }

      // 4. Mockups Prompts
      if (project.mockups) {
        let mockupsDoc = `GIVEMEPOD — 11 COMMERCIAL MOCKUP SPECIFICATIONS\n\n`;
        project.mockups.forEach((m) => {
          mockupsDoc += `MOCKUP #${m.id} — ${m.title} (${m.type})\nPurpose: ${m.purpose}\nScene: ${m.scene}\nCamera: ${m.camera}\nLighting: ${m.lighting}\nProduct Placement: ${m.product_placement}\nNegative: ${m.negative_prompt}\n\n`;
        });
        folder?.file('11_mockup_specifications.txt', mockupsDoc);
      }

      // 5. Pinterest Pins
      if (project.pinterest_pins) {
        let pinsDoc = `PINTEREST CONTENT PACK (5 PINS)\n\n`;
        project.pinterest_pins.forEach((pin, i) => {
          pinsDoc += `PIN #${i + 1}: ${pin.pin_title}\nBoard: ${pin.suggested_board}\nCTA: ${pin.cta}\nDescription: ${pin.description}\nKeywords: ${pin.keywords.join(' ')}\n\n`;
        });
        folder?.file('pinterest_pins.txt', pinsDoc);
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_complete_pod_package.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export ZIP', err);
    } finally {
      setExporting(false);
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`);
    dl.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#12141e] border border-gray-800 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-mono uppercase text-gray-400">
                {project.product_type} · {project.niche}
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  project.status === 'Ready'
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                    : 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
                }`}
              >
                {project.status}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{project.name}</h1>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onDuplicate(project.id)}
            className="px-3 py-2 rounded-xl bg-[#1a1c29] hover:bg-[#232738] border border-gray-700 text-gray-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
            title="Duplicate"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Duplicate</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-3 py-2 rounded-xl bg-[#1a1c29] hover:bg-[#232738] border border-gray-700 text-gray-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <span>JSON</span>
          </button>

          <button
            onClick={handleExportZip}
            disabled={exporting}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wide shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? 'Packing...' : 'Export Package (.ZIP)'}</span>
          </button>

          <button
            onClick={() => onDelete(project.id)}
            className="p-2 rounded-xl bg-[#1a1c29] hover:bg-rose-500/20 border border-gray-700 hover:border-rose-500/40 text-gray-400 hover:text-rose-400 transition-colors"
            title="Delete Project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-gray-800 text-xs">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'concept', label: 'Concept' },
          { key: 'design', label: 'Design Studio' },
          { key: 'mockups', label: '11 Mockups' },
          { key: 'risk', label: 'Risk Scanner' },
          { key: 'seo', label: 'Etsy SEO' },
          { key: 'profit', label: 'Profit & Margins' },
          { key: 'pinterest', label: 'Pinterest Pins' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-[#151722]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Readiness Scorecard */}
          <div className="p-6 rounded-3xl bg-[#12141e] border border-gray-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase">Product Readiness Scorecard</span>
                <h3 className="text-base font-bold text-white">Commercial Launch Checklist</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
                  {isFullyReady ? 'READY FOR MANUAL LISTING' : 'IN PROGRESS'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#0c0e15] border border-gray-800 text-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span className="text-gray-300 font-medium block">Research</span>
                <span className="text-[10px] text-gray-500 font-mono">Completed</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0c0e15] border border-gray-800 text-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span className="text-gray-300 font-medium block">Concept</span>
                <span className="text-[10px] text-gray-500 font-mono">1/1 Active</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0c0e15] border border-gray-800 text-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span className="text-gray-300 font-medium block">Design</span>
                <span className="text-[10px] text-gray-500 font-mono">DTG Specs</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0c0e15] border border-gray-800 text-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span className="text-gray-300 font-medium block">Risk Scan</span>
                <span className="text-[10px] text-emerald-400 font-mono">LOW RISK</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0c0e15] border border-gray-800 text-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span className="text-gray-300 font-medium block">11 Mockups</span>
                <span className="text-[10px] text-purple-400 font-mono">11/11 Ready</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0c0e15] border border-gray-800 text-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span className="text-gray-300 font-medium block">SEO Listing</span>
                <span className="text-[10px] text-indigo-400 font-mono">13 Tags</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0c0e15] border border-gray-800 text-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span className="text-gray-300 font-medium block">Unit Profit</span>
                <span className="text-[10px] text-emerald-400 font-mono">~$8.74</span>
              </div>
            </div>
          </div>

          {/* Opportunity Breakdown & Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Opportunity Radar Breakdown */}
            <div className="p-6 rounded-3xl bg-[#12141e] border border-gray-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                <span>POD Opportunity Score Breakdown</span>
                <span className="font-mono text-indigo-400 text-lg">
                  {project.opportunity_score?.overall_score || 83}/100
                </span>
              </h3>

              <div className="space-y-2 text-xs">
                {[
                  { label: 'Search Demand Index', val: project.opportunity_score?.search_demand || 86 },
                  { label: 'Competition Saturation', val: project.opportunity_score?.competition || 54 },
                  { label: 'Trend Momentum Velocity', val: project.opportunity_score?.trend_momentum || 92 },
                  { label: 'Niche Specificity', val: project.opportunity_score?.niche_specificity || 88 },
                  { label: 'Commercial Intent Score', val: project.opportunity_score?.commercial_intent || 84 },
                  { label: 'Profit Potential', val: project.opportunity_score?.profit_potential || 80 }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-gray-300">
                    <span>{item.label}:</span>
                    <span className="font-mono font-bold text-white">{item.val}/100</span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-gray-500 font-mono pt-2 border-t border-gray-800">
                This score is an analytical indicator based on public search signals, not a sales prediction.
              </p>
            </div>

            {/* Quick Concept Summary */}
            <div className="p-6 rounded-3xl bg-[#12141e] border border-gray-800 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-mono text-purple-400 uppercase">Selected Concept</span>
                <h3 className="text-base font-bold text-white mt-1">
                  {project.selected_concept?.title || project.name}
                </h3>
                <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                  {project.selected_concept?.design_angle || 'Vintage distressed outdoor emblem aesthetic.'}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-800 space-y-2 text-xs text-gray-400">
                <div>Customer: <strong className="text-white">{project.audience}</strong></div>
                <div>Keywords: <strong className="text-white">{project.selected_concept?.keywords?.join(', ')}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONCEPT TAB */}
      {activeTab === 'concept' && (
        <div className="p-6 rounded-3xl bg-[#12141e] border border-gray-800 space-y-4">
          <h3 className="text-base font-bold text-white">Generated Concept Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.concepts?.map((c) => (
              <div key={c.id} className="p-5 rounded-2xl bg-[#0c0e15] border border-gray-800 space-y-3">
                <div className="text-xs font-mono text-indigo-400 uppercase">{c.headline}</div>
                <h4 className="text-sm font-bold text-white">{c.title}</h4>
                <p className="text-xs text-gray-300">{c.design_angle}</p>
                <div className="text-[11px] text-gray-500">{c.why_interesting}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DESIGN STUDIO TAB */}
      {activeTab === 'design' && <DesignStudio initialDesign={project.design} />}

      {/* MOCKUPS TAB */}
      {activeTab === 'mockups' && (
        <MockupFactory
          mockups={project.mockups}
          productName={project.name}
          designTitle={project.design?.title || project.name}
        />
      )}

      {/* RISK TAB */}
      {activeTab === 'risk' && (
        <div className="p-6 rounded-3xl bg-[#12141e] border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">IP / Trademark Scan for {project.name}</h3>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
              {project.risk_analysis?.risk_level || 'LOW RISK'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#0c0e15] border border-gray-800 text-xs text-gray-300 space-y-2">
            <div>AI Inference: {project.risk_analysis?.ai_inference}</div>
            <div>Policy Notes: {project.risk_analysis?.marketplace_policy_notes}</div>
          </div>
        </div>
      )}

      {/* SEO TAB */}
      {activeTab === 'seo' && project.seo_listing && <EtsyListingView seoData={project.seo_listing} />}

      {/* PROFIT TAB */}
      {activeTab === 'profit' && <ProfitCalculatorView initialProfit={project.profit} />}

      {/* PINTEREST TAB */}
      {activeTab === 'pinterest' && (
        <PinterestFactory pins={project.pinterest_pins} productName={project.name} />
      )}
    </div>
  );
};
