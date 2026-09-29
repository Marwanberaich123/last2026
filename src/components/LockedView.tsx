import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { User } from '../types';
import { Lock, KeyRound, ShoppingCart, MessageCircle, Send, AlertCircle, CheckCircle, ShieldCheck, ArrowRight } from 'lucide-react';

interface LockedViewProps {
  user: User;
  onUnlockSuccess: (accessSuffix: string) => void;
  onOpenSupport: () => void;
}

export const LockedView: React.FC<LockedViewProps> = ({ user, onUnlockSuccess, onOpenSupport }) => {
  const { t } = useI18n();
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/access-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({ code: accessCode.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || t('auth.invalidCode', 'Invalid access code. Please try again.'));
      } else {
        if (data.key) {
          localStorage.setItem('givemepod_key', data.key);
        }
        onUnlockSuccess(data.accessSuffix || '••••••••••••K2L8');
      }
    } catch (err: any) {
      setErrorMessage(t('common.somethingWentWrong', 'Something went wrong. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-[#090a0f]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-xl bg-[#12141d] border border-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center">
        {/* Shield Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-indigo-500/10 to-transparent border border-amber-500/30 flex items-center justify-center mx-auto mb-6 text-amber-400 shadow-lg shadow-amber-500/10">
          <KeyRound className="w-8 h-8" />
        </div>

        {/* Locked Title & Subtitle */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
          {t('auth.lockedTitle', 'Enter Secret Access Key')}
        </h2>

        <p className="text-sm text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
          {t('auth.lockedMessage', 'Enter your authorized license key to instantly unlock the GiveMePOD command center.')}
        </p>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5 text-left animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Access Code Input Form */}
        <form onSubmit={handleActivate} className="space-y-4 mb-8">
          <div className="relative">
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="e.g. A3F9K2L8Z1"
              className="w-full px-4 py-3.5 bg-[#0b0c12] border border-gray-700 focus:border-indigo-500 rounded-xl text-center text-sm font-mono tracking-widest text-white uppercase placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !accessCode.trim()}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm tracking-wide shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>{loading ? t('common.loading', 'Validating Code...') : t('auth.activateCode', 'Activate Permanent Access')}</span>
          </button>
        </form>

        {/* Action Buttons: Buy Permanent Access & Support */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-gray-800/80">
          <button
            type="button"
            onClick={() => setShowBuyModal(true)}
            className="py-3 px-4 rounded-xl bg-[#171a25] hover:bg-[#1e2230] border border-gray-700/80 text-gray-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <ShoppingCart className="w-4 h-4 text-indigo-400" />
            <span>{t('auth.buyPermanentAccess', 'Buy Permanent Access')}</span>
          </button>

          <button
            type="button"
            onClick={onOpenSupport}
            className="py-3 px-4 rounded-xl bg-[#171a25] hover:bg-[#1e2230] border border-gray-700/80 text-gray-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>{t('auth.contactSupport', 'Contact Support')}</span>
          </button>
        </div>

        {/* Guarantee Bullet Points */}
        <div className="mt-8 pt-6 border-t border-gray-800/50 flex flex-col sm:flex-row items-center justify-around gap-2 text-[11px] text-gray-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            {t('auth.oneTimeAccess', 'One-time access')}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            {t('auth.permanentEntitlement', 'Linked to your Google account')}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            {t('auth.noRecurring', 'No recurring fees')}
          </span>
        </div>
      </div>

      {/* Buy Access Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#141620] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-left">
            <h3 className="text-xl font-bold text-white mb-2">{t('auth.buyTitle', 'Get Permanent GiveMePOD Access')}</h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Unlock the entire AI command center forever with a single entitlement linked permanently to your authenticated Google account.
            </p>

            <div className="p-4 rounded-2xl bg-[#0d0f17] border border-gray-800 space-y-3 mb-6 text-xs text-gray-300">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle className="w-4 h-4" />
                <span>Unlimited Product Pipelines & 11-Image Mockup Generation</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle className="w-4 h-4" />
                <span>IP / Trademark Risk Scanner with Automated Screenings</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle className="w-4 h-4" />
                <span>Etsy SEO Optimizer (13 Algorithmic Tags) & Pinterest Factory</span>
              </div>
            </div>

            {/* Configurable Payment State Notice */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs mb-6 leading-relaxed">
              <strong>{t('auth.paymentNotConfigured', 'Payment integration not configured yet. Contact the administrator.')}</strong>
              <div className="mt-2 text-gray-300">
                You can receive your private activation code immediately by contacting us on WhatsApp (+212613960504) or Telegram (@kalo_1).
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowBuyModal(false);
                  onOpenSupport();
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contact for Instant Code</span>
              </button>

              <button
                onClick={() => setShowBuyModal(false)}
                className="py-3 px-4 rounded-xl bg-[#1f2230] hover:bg-[#282c3e] text-gray-300 hover:text-white text-xs font-semibold transition-colors"
              >
                {t('common.close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
