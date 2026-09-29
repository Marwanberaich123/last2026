import React from 'react';
import { useI18n } from '../i18n';
import { Project } from '../types';
import { LineChart, BarChart3, AlertCircle, ShoppingBag, FolderKanban, Camera, Sparkles, ShieldCheck } from 'lucide-react';

interface AnalyticsViewProps {
  projects: Project[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ projects }) => {
  const { t } = useI18n();

  const totalMockups = projects.reduce((acc, p) => acc + (p.mockups?.length || 0), 0);
  const totalPins = projects.reduce((acc, p) => acc + (p.pinterest_pins?.length || 0), 0);
  const totalConcepts = projects.reduce((acc, p) => acc + (p.concepts?.length || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono mb-1">
          <LineChart className="w-4 h-4" />
          <span>Workspace Operational Intelligence & Platform Analytics</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Analytics</h1>
        <p className="text-xs text-gray-400">
          Track production output, mockup generations, risk screenings, and store sync metrics.
        </p>
      </div>

      {/* Sales Analytics Notice Box */}
      <div className="p-6 rounded-3xl bg-[#12141e] border border-gray-800 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-white">Revenue & Order Sync</h3>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          Connect a platform to unlock sales analytics. GiveMePOD does not simulate artificial transaction telemetry.
        </p>
        <button className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium transition-colors">
          Connect Etsy or Shopify in Settings
        </button>
      </div>

      {/* Production Output Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#12141e] border border-gray-800">
          <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1">Projects Created</span>
          <span className="text-2xl font-bold font-mono text-white">{projects.length}</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#12141e] border border-gray-800">
          <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1">Mockups Generated</span>
          <span className="text-2xl font-bold font-mono text-purple-400">{totalMockups}</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#12141e] border border-gray-800">
          <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1">Pinterest Pins</span>
          <span className="text-2xl font-bold font-mono text-rose-400">{totalPins}</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#12141e] border border-gray-800">
          <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1">Concepts Researched</span>
          <span className="text-2xl font-bold font-mono text-emerald-400">{totalConcepts}</span>
        </div>
      </div>
    </div>
  );
};
