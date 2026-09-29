import React from 'react';
import { useI18n, Language } from '../i18n';
import { User } from '../types';
import { Search, Globe, Shield, MessageCircle, Menu, Sparkles, LogOut, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  accessSuffix: string | null;
  isLocked: boolean;
  onOpenSupport: () => void;
  onOpenCommand: () => void;
  onToggleSidebar: () => void;
  onLogout: () => void;
  onSelectTab?: (tab: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  accessSuffix,
  isLocked,
  onOpenSupport,
  onOpenCommand,
  onToggleSidebar,
  onLogout,
  onSelectTab
}) => {
  const { language, setLanguage, t, isRtl } = useI18n();

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'ar', label: 'العربية' },
    { code: 'fr', label: 'FR' },
    { code: 'pt', label: 'PT' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-[#0e1017]/90 backdrop-blur-md border-b border-gray-800/80 px-4 lg:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 p-[1px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-[#0d0f16] rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              GiveMe<span className="text-indigo-400">POD</span>
              <span className="text-[10px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hidden sm:inline-block">
                PRO
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Center: Search & Command Palette shortcut */}
      <div className="hidden md:flex items-center max-w-md w-full mx-4">
        <button
          onClick={onOpenCommand}
          className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-gray-400 bg-[#141620] hover:bg-[#191c28] border border-gray-800 rounded-xl transition-all shadow-inner group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400 group-hover:text-indigo-400 transition-colors" />
            <span className="text-xs text-gray-400">{t('common.search', 'Quick search projects, niches, trends...')}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono text-gray-500 bg-gray-900 border border-gray-700/60 px-1.5 py-0.5 rounded">
            <span>⌘</span>
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Switcher */}
        <div className="flex items-center bg-[#141620] border border-gray-800 rounded-xl p-1 text-xs">
          <Globe className="w-3.5 h-3.5 text-gray-400 ml-1.5 mr-1" />
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                language === l.code
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Access Status / Permanent badge */}
        {!isLocked && accessSuffix && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{accessSuffix}</span>
          </div>
        )}

        {/* Master Admin Panel Button */}
        {user?.role === 'ADMIN' && onSelectTab && (
          <button
            onClick={() => onSelectTab('admin')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all shadow-sm shadow-amber-500/10"
            title="لوحة تحكم الأدمن (Admin Dashboard)"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>لوحة الأدمن</span>
          </button>
        )}

        {/* Support Button */}
        <button
          onClick={onOpenSupport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white bg-[#141620] hover:bg-[#1c1f2c] border border-gray-800 rounded-xl transition-colors"
          title="Direct Support"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">{t('common.needHelp', 'Support')}</span>
        </button>

        {/* User Avatar & Logout */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-gray-800">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full border border-gray-700 object-cover"
            />
            <button
              onClick={onLogout}
              className="p-1.5 text-gray-400 hover:text-rose-400 rounded-lg hover:bg-gray-800/60 transition-colors"
              title={t('common.logout', 'Sign Out')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
