import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '../i18n';
import { TabKey } from './Sidebar';
import {
  Search,
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
  Settings,
  PlusCircle,
  X
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: TabKey) => void;
  onOpenWizard: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenWizard
}) => {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const items = [
    { label: t('common.buildProduct', 'Build a POD Product'), icon: PlusCircle, action: onOpenWizard, shortcut: 'B' },
    { label: t('nav.trendHunter', 'Trend Hunter'), icon: Flame, tab: 'trendHunter' as TabKey },
    { label: t('nav.ideaFinder', 'Idea Finder'), icon: Lightbulb, tab: 'ideaFinder' as TabKey },
    { label: t('nav.designStudio', 'Design Studio'), icon: Palette, tab: 'designStudio' as TabKey },
    { label: t('nav.mockupFactory', 'Mockup Factory'), icon: Camera, tab: 'mockupFactory' as TabKey },
    { label: t('nav.riskScanner', 'Risk Scanner'), icon: ShieldAlert, tab: 'riskScanner' as TabKey },
    { label: t('nav.etsyListing', 'Etsy Listing'), icon: FileText, tab: 'etsyListing' as TabKey },
    { label: t('nav.pinterestFactory', 'Pinterest Factory'), icon: Pin, tab: 'pinterestFactory' as TabKey },
    { label: t('nav.profitCalculator', 'Profit Calculator'), icon: Calculator, tab: 'profitCalculator' as TabKey },
    { label: t('nav.seasonalPlanner', 'Seasonal Planner'), icon: CalendarDays, tab: 'seasonalPlanner' as TabKey },
    { label: t('nav.aiAdvisor', 'AI POD Advisor'), icon: Bot, tab: 'aiAdvisor' as TabKey },
    { label: t('nav.myProducts', 'My Products'), icon: FolderKanban, tab: 'myProducts' as TabKey },
    { label: t('nav.settings', 'Settings'), icon: Settings, tab: 'settings' as TabKey }
  ];

  const filtered = items.filter(i => i.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-[#12141e] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-gray-800/80">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, tool, or press Esc to exit..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded hover:bg-gray-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-500">No matching commands found.</div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else if (item.tab) {
                      onSelectTab(item.tab);
                    }
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-600/15 text-gray-300 hover:text-white transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gray-800/60 group-hover:bg-indigo-500/20 flex items-center justify-center text-gray-400 group-hover:text-indigo-300">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium">{item.label}</span>
                  </div>

                  {item.shortcut && (
                    <span className="text-[10px] font-mono text-gray-500 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800">
                      {item.shortcut}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 border-t border-gray-800/60 bg-[#0d0f17] text-[11px] text-gray-500 flex items-center justify-between font-mono">
          <span>Navigation Quick Jump</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
};
