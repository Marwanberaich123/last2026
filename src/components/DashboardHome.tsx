import React from 'react';
import { useI18n } from '../i18n';
import { User, Project } from '../types';
import {
  PlusCircle,
  TrendingUp,
  FolderKanban,
  Lightbulb,
  ShieldCheck,
  Camera,
  Layers,
  ArrowRight,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface DashboardHomeProps {
  user: User;
  projects: Project[];
  onOpenWizard: () => void;
  onOpenTrendHunter: () => void;
  onOpenProject: (projectId: string) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  user,
  projects,
  onOpenWizard,
  onOpenTrendHunter,
  onOpenProject
}) => {
  const { t } = useI18n();

  const firstName = user.name ? user.name.split(' ')[0] : 'Creator';

  // Metrics computation
  const activeCount = projects.filter(p => p.status !== 'Archived').length;
  const readyCount = projects.filter(p => p.status === 'Ready').length;
  const mockupsCount = projects.reduce((acc, p) => acc + (p.mockups?.length || 0), 0);
  const ideasCount = projects.reduce((acc, p) => acc + (p.concepts?.length || 0), 0);

  const statusColors: Record<string, string> = {
    Ready: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    Listing: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    Mockups: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    Design: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    Concept: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    Research: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    Archived: 'text-gray-400 bg-gray-500/10 border-gray-500/30'
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#141724] via-[#10121b] to-[#0d0f15] border border-gray-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Print-on-Demand Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('dashboard.welcomeBack', 'Welcome back')}, {firstName}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xl">
            Ready to research your next high-converting POD product? Generate complete listings, 11 mockups, and SEO in one pass.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto">
          <button
            onClick={onOpenWizard}
            className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('common.buildProduct', 'Build a POD Product')}</span>
          </button>

          <button
            onClick={onOpenTrendHunter}
            className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-[#1a1c29] hover:bg-[#222538] border border-gray-700/80 text-gray-200 hover:text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>{t('common.researchTrend', 'Research Trend')}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#11131c] border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium">{t('dashboard.activeProjects', 'Active Projects')}</span>
            <FolderKanban className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{activeCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#11131c] border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium">{t('dashboard.productsCreated', 'Ready Products')}</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{readyCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#11131c] border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium">{t('dashboard.ideasSaved', 'Ideas Saved')}</span>
            <Lightbulb className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{ideasCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#11131c] border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium">{t('dashboard.riskChecks', 'Risk Checks')}</span>
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{projects.length}</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#11131c] border border-gray-800 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium">{t('dashboard.mockupsGenerated', 'Mockups')}</span>
            <Camera className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{mockupsCount}</div>
        </div>
      </div>

      {/* Recent Projects Workspace */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">{t('dashboard.yourWorkspace', 'Your POD Workspace')}</h2>
            <p className="text-xs text-gray-400">Manage recently researched products, designs, and Etsy listings</p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#11131c] border border-gray-800/80">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <FolderKanban className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">{t('dashboard.noProjects', 'No projects yet')}</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6">
              Launch your first automated product workflow to generate designs, 11 mockups, and SEO tags.
            </p>
            <button
              onClick={onOpenWizard}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('common.buildProduct', 'Build My First Product')}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((proj) => {
              const oppScore = proj.opportunity_score?.overall_score || 78;
              const riskLevel = proj.risk_analysis?.risk_level || 'LOW';
              const statusClass = statusColors[proj.status] || statusColors.Research;

              return (
                <div
                  key={proj.id}
                  onClick={() => onOpenProject(proj.id)}
                  className="p-5 rounded-2xl bg-[#12141e] hover:bg-[#161825] border border-gray-800 hover:border-indigo-500/40 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Product Type & Status Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
                        {proj.product_type} · {proj.niche}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${statusClass}`}>
                        {proj.status}
                      </span>
                    </div>

                    {/* Project Name */}
                    <h3 className="text-sm font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {proj.name}
                    </h3>

                    {/* Style and Audience */}
                    <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                      {proj.selected_concept?.design_angle || `${proj.style} style design targeted at ${proj.audience}`}
                    </p>
                  </div>

                  {/* Bottom Stats */}
                  <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-[10px] text-gray-500 block">Opportunity</span>
                        <span className="font-mono font-bold text-indigo-400">{oppScore}/100</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block">Risk</span>
                        <span className={`font-mono text-[11px] font-semibold ${
                          riskLevel === 'HIGH' ? 'text-rose-400' : 'text-emerald-400'
                        }`}>
                          {riskLevel}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-indigo-400 group-hover:translate-x-1 transition-transform">
                      <span>{t('common.open', 'Open')}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
