import React from 'react';
import { useI18n } from '../i18n';
import { MessageCircle, Send, X, ShieldCheck } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();

  if (!isOpen) return null;

  const whatsappUrl = 'https://wa.me/212613960504?text=Hello%20GiveMePOD%20Support%2C%20I%20need%20assistance%20with%20my%20account.';
  const telegramUrl = 'https://t.me/kalo_1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#13151c] border border-gray-800 rounded-2xl p-6 shadow-2xl text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{t('common.needHelp', 'GiveMePOD Support')}</h3>
            <p className="text-xs text-gray-400">Direct assistance from the operations team</p>
          </div>
        </div>

        <p className="text-sm text-gray-300 mb-6 leading-relaxed">
          Need an access code, custom enterprise onboarding, or have questions about your POD workspace? Connect with us directly:
        </p>

        <div className="space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 bg-[#1b1e29] hover:bg-[#232736] border border-emerald-500/30 hover:border-emerald-500/60 rounded-xl transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">{t('common.whatsAppSupport', 'WhatsApp Support')}</div>
                <div className="text-xs text-emerald-400 font-mono">+212 613 960 504</div>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Online</span>
          </a>

          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 bg-[#1b1e29] hover:bg-[#232736] border border-sky-500/30 hover:border-sky-500/60 rounded-xl transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">{t('common.telegramSupport', 'Telegram Support')}</div>
                <div className="text-xs text-sky-400 font-mono">@kalo_1</div>
              </div>
            </div>
            <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 px-2 py-1 rounded">Direct Chat</span>
          </a>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500">Typical response time: Under 15 minutes</p>
        </div>
      </div>
    </div>
  );
};
