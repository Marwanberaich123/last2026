import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { KeyRound, X, ArrowRight, ShieldCheck, Lock, AlertCircle, Sparkles } from 'lucide-react';
import { ADMIN_KEY } from '../auth/keys';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignInWithKey: (key: string) => Promise<boolean>;
  onOpenSupport: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSignInWithKey,
  onOpenSupport
}) => {
  const { t } = useI18n();
  const [keyInput, setKeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    const success = await onSignInWithKey(keyInput.trim());
    if (!success) {
      setErrorMsg(t('auth.invalidCode', 'الكود غير صحيح أو تم إلغاؤه. يرجى التأكد من كود التفعيل أو كود الأدمن.'));
      setLoading(false);
    } else {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#12141f] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
          <KeyRound className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-white mb-1">
          {t('auth.lockedTitle', 'تسجيل الدخول بالكود السري')}
        </h3>
        <p className="text-xs text-gray-400 mb-6 leading-relaxed">
          أدخل كود الترخيص الخاص بك أو كود الأدمن لفتح لوحة التحكم فوراً.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1.5">
              Secret Key / كود الدخول
            </label>
            <input
              type="text"
              autoFocus
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="e.g. A3F9K2L8Z1 أو kalo@123"
              className="w-full px-4 py-3.5 bg-[#0b0d14] border border-gray-700 focus:border-indigo-500 rounded-xl text-center text-sm font-mono tracking-widest text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !keyInput.trim()}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            <span>{loading ? 'جاري التحقق...' : 'تسجيل الدخول وفتح الأداة'}</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
          <span>ليس لديك كود بعد؟</span>
          <button
            onClick={() => {
              onClose();
              onOpenSupport();
            }}
            className="text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            طلب كود تفعيل
          </button>
        </div>
      </div>
    </div>
  );
};
