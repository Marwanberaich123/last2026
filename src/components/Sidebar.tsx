import React from 'react';
import { useI18n } from '../i18n';
import {
  LayoutDashboard,
  Flame,
  Lightbulb,
  Palette,
  Camera,
  ShieldAlert,
  BarChart3,
  SearchCode,
  FileText,
  Pin,
  Calculator,
  CalendarDays,
  Bot,
  FolderKanban,
  LineChart,
  Settings,
  ShieldCheck,
  PlusCircle,
  X
} from 'lucide-react';

export type TabKey =
  | 'dashboard'
  | 'trendHunter'
  | 'ideaFinder'
  | 'designStudio'
  | 'mockupFactory'
  | 'riskScanner'
  | 'marketAnalyzer'
  | 'competitorResearch'
  | 'etsyListing'
  | 'pinterestFactory'
  | 'profitCalculator'
  | 'seasonalPlanner'
  | 'aiAdvisor'
  | 'myProducts'
  | 'analytics'
  | 'settings'
  | 'admin';

interface SidebarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  onOpenWizard: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isAdmin: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenWizard,
  isOpenMobile,
  onCloseMobile,
  isAdmin
}) => {
  const { t } = useI18n();

  const navItems = [
    { key: 'dashboard' as TabKey, label: t('nav.dashboard', 'Dashboard'), icon: LayoutDashboard },
    { key: 'trendHunter' as TabKey, label: t('nav.trendHunter', 'Trend Hunter'), icon: Flame, badge: 'HOT' },
    { key: 'ideaFinder' as TabKey, label: t('nav.ideaFinder', 'Idea Finder'), icon: Lightbulb },
    { key: 'designStudio' as TabKey, label: t('nav.designStudio', 'Design Studio'), icon: Palette },
    { key: 'mockupFactory' as TabKey, label: t('nav.mockupFactory', 'Mockup Factory'), icon: Camera, badge: '11 IMGs' },
    { key: 'riskScanner' as TabKey, label: t('nav.riskScanner', 'Risk Scanner'), icon: ShieldAlert },
    { key: 'marketAnalyzer' as TabKey, label: t('nav.marketAnalyzer', 'Market Analyzer'), icon: BarChart3 },
    { key: 'competitorResearch' as TabKey, label: t('nav.competitorResearch', 'Competitor Research'), icon: SearchCode },
    { key: 'etsyListing' as TabKey, label: t('nav.etsyListing', 'Etsy Listing'), icon: FileText },
    { key: 'pinterestFactory' as TabKey, label: t('nav.pinterestFactory', 'Pinterest Factory'), icon: Pin },
    { key: 'profitCalculator' as TabKey, label: t('nav.profitCalculator', 'Profit Calculator'), icon: Calculator },
    { key: 'seasonalPlanner' as TabKey, label: t('nav.seasonalPlanner', 'Seasonal Planner'), icon: CalendarDays },
    { key: 'aiAdvisor' as TabKey, label: t('nav.aiAdvisor', 'AI POD Advisor'), icon: Bot, badge: 'AI' },
    { key: 'myProducts' as TabKey, label: t('nav.myProducts', 'My Products'), icon: FolderKanban },
    { key: 'analytics' as TabKey, label: t('nav.analytics', 'Analytics'), icon: LineChart },
    { key: 'settings' as TabKey, label: t('nav.settings', 'Settings'), icon: Settings }
  ];

  if (isAdmin) {
    navItems.push({
      key: 'admin' as TabKey,
      label: t('common.admin', 'Admin Panel'),
      icon: ShieldCheck,
      badge: 'SECURE'
    });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 bg-[#0d0f15] border-r border-gray-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Section: Quick Create CTA */}
        <div className="p-4 border-b border-gray-800/60 flex items-center justify-between">
          <button
            onClick={() => {
              onOpenWizard();
              if (isOpenMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('common.buildProduct', 'Build a POD Product')}</span>
          </button>

          <button
            onClick={onCloseMobile}
            className="lg:hidden ml-2 p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Nav List */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onSelectTab(item.key);
                  if (isOpenMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-[#151722]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-indigo-400' : 'text-gray-400 group-hover:text-gray-200'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Workspace Status */}
        <div className="p-3 border-t border-gray-800/80 bg-[#0a0c10]/60 text-[11px] text-gray-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-gray-400">Engine Online</span>
          </div>
          <span className="font-mono text-gray-400">v2.6.4</span>
        </div>
      </aside>
    </>
  );
};
