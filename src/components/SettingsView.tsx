import React, { useState } from 'react';
import { useI18n, Language } from '../i18n';
import { User } from '../types';
import {
  Settings,
  User as UserIcon,
  Globe,
  SunMoon,
  Link,
  ShieldCheck,
  CheckCircle,
  MessageCircle,
  Send,
  Lock
} from 'lucide-react';

interface SettingsViewProps {
  user: User;
  accessSuffix: string | null;
  onOpenSupport: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, accessSuffix, onOpenSupport }) => {
  const { language, setLanguage, t } = useI18n();

  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English (Default)' },
    { code: 'ar', label: 'العربية (Arabic - RTL)' },
    { code: 'fr', label: 'Français (French)' },
    { code: 'pt', label: 'Português (Portuguese)' }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono mb-1">
          <Settings className="w-4 h-4" />
          <span>System & Account Configuration</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Settings</h1>
        <p className="text-xs text-gray-400">
          Manage your permanent Google entitlement, preferred language, and store integrations.
        </p>
      </div>

      {/* Account & Permanent Entitlement Card */}
      <div className="p-6 rounded-3xl bg-[#12141e] border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Permanent GiveMePOD Entitlement</span>
        </h3>

        <div className="p-4 rounded-2xl bg-[#0c0e15] border border-gray-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-gray-700" />
            <div>
              <div className="text-sm font-bold text-white">{user.name}</div>
              <div className="text-xs text-gray-400 font-mono">{user.email}</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-mono text-gray-500 uppercase">License Suffix:</div>
            <div className="text-sm font-mono font-bold text-emerald-400">
              {accessSuffix || '••••••••••••K2L8'}
            </div>
            <div className="text-[10px] text-gray-500">Permanent Access · Activated: YES</div>
          </div>
        </div>
      </div>

      {/* Language Preference */}
      <div className="p-6 rounded-3xl bg-[#12141e] border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-400" />
          <span>Interface Language</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`p-3.5 rounded-xl border text-left text-xs font-medium transition-all ${
                language === l.code
                  ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm'
                  : 'bg-[#0c0e15] border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Appearance */}
      <div className="p-6 rounded-3xl bg-[#12141e] border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <SunMoon className="w-4 h-4 text-purple-400" />
          <span>Appearance</span>
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {(['dark', 'light', 'system'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setTheme(m)}
              className={`p-3 rounded-xl border text-center text-xs font-semibold uppercase tracking-wider transition-all ${
                theme === m
                  ? 'bg-indigo-600/20 border-indigo-500 text-white'
                  : 'bg-[#0c0e15] border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Direct Support */}
      <div className="p-6 rounded-3xl bg-[#12141e] border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white">Need Assistance?</h3>
          <p className="text-xs text-gray-400 mt-1">Direct support via official WhatsApp or Telegram channel.</p>
        </div>

        <button
          onClick={onOpenSupport}
          className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold transition-colors flex items-center gap-2"
        >
          <MessageCircle className="w-4 h-4 text-emerald-400" />
          <span>Open Support Center</span>
        </button>
      </div>
    </div>
  );
};
