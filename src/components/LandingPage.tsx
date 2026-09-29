import React, { useState } from 'react';
import { useI18n, Language } from '../i18n';
import {
  Flame,
  Lightbulb,
  Palette,
  Camera,
  ShieldCheck,
  FileText,
  Pin,
  Calculator,
  BarChart3,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  Layers,
  KeyRound,
  Globe,
  MessageCircle,
  Shield,
  HelpCircle
} from 'lucide-react';

interface LandingPageProps {
  onSignInWithKey: (key: string) => Promise<boolean>;
  onOpenSupport: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSignInWithKey, onOpenSupport }) => {
  const { t, language, setLanguage } = useI18n();
  const [accessKey, setAccessKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const languages: { code: Language; label: string }[] = [
    { code: 'ar', label: 'العربية' },
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'pt', label: 'Português' }
  ];

  const handleSubmit = async (e?: React.FormEvent, directKey?: string) => {
    if (e) e.preventDefault();
    const keyToTest = (directKey || accessKey).trim();
    if (!keyToTest) return;

    setLoading(true);
    setErrorMsg(null);

    const success = await onSignInWithKey(keyToTest);
    if (!success) {
      setErrorMsg(
        t(
          'auth.invalidCode',
          'كود الدخول غير صحيح أو تم إلغاؤه. يرجى إدخال كود الترخيص الصحيح أو كود الأدمن kalo@123'
        )
      );
    }
    setLoading(false);
  };

  const quickLoginWith = (key: string) => {
    setAccessKey(key);
    handleSubmit(undefined, key);
  };

  const features = [
    {
      icon: Flame,
      title: t('landing.sections.trends', 'Trend Research / فحص الترندات'),
      desc: 'Screen live market signals, search momentum, and seasonal spikes across Etsy and Pinterest without scraping.'
    },
    {
      icon: Lightbulb,
      title: t('landing.sections.niches', 'Niche Discovery / اكتشاف النيشات'),
      desc: 'Deconstruct broad themes into underserved micro-niches and pinpoint untapped commercial gaps.'
    },
    {
      icon: Palette,
      title: t('landing.sections.design', 'AI Design Studio / استوديو التصميم'),
      desc: 'Generate commercial print-ready artwork specs and prompt architectures tailored for direct-to-garment (DTG).'
    },
    {
      icon: ShieldCheck,
      title: t('landing.sections.risk', 'POD Risk Scanner / فاحص العلامات التجارية'),
      desc: 'Rigorous intellectual property screening across trademark indexes, celebrity names, sports franchises, and brand policies.'
    },
    {
      icon: Camera,
      title: t('landing.sections.mockups', 'Mockup Factory (11 Images) / مولد النماذج'),
      desc: '1 Main Etsy Hero mockup + 10 contextual listing images maintaining complete artwork and visual fidelity.'
    },
    {
      icon: FileText,
      title: t('landing.sections.etsy', 'Etsy Listing Generator / سيو ووصف إتسي'),
      desc: 'High-converting SEO titles under 140 chars, exactly 13 algorithmic tags, buyer FAQs, and keyword clusters.'
    },
    {
      icon: Pin,
      title: t('landing.sections.pinterest', 'Pinterest Content Factory / محتوى بنترست'),
      desc: '5 click-optimized Pin concepts per product complete with keywords, compelling CTAs, and destination links.'
    },
    {
      icon: Calculator,
      title: t('landing.sections.profit', 'Profit & Margin Calculator / حاسبة الأرباح'),
      desc: 'Real-time net margin modeling incorporating base blanks, shipping, marketplace percentages, and ad cost per unit.'
    },
    {
      icon: BarChart3,
      title: t('landing.sections.analyzer', 'Product Opportunity Analyzer / تقييم الفرص'),
      desc: 'Transparent 0-100 Opportunity Score evaluating demand velocity, competition saturation, and profitability.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#090a0f] text-gray-100 flex flex-col selection:bg-indigo-500/30 selection:text-white">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-800/80 bg-[#090a0f]/90 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 p-[1px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-[#0d0f16] rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
              </svg>
            </div>
          </div>
          <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
            GiveMe<span className="text-indigo-400">POD</span>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              PRO
            </span>
          </span>
        </div>

        {/* Right Nav: Language & Admin Login Shortcut */}
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

          {/* Quick Admin Access Button */}
          <button
            onClick={() => quickLoginWith('kalo@123')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all shadow-sm"
            title="دخول لوحة تحكم الأدمن بكود kalo@123"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">دخول الأدمن</span>
            <span className="text-[10px] font-mono text-amber-400/80">(kalo@123)</span>
          </button>

          {/* Support Link */}
          <button
            onClick={onOpenSupport}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#141620] hover:bg-[#1a1c29] border border-gray-800 text-gray-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
            title="الدعم الفني"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{t('common.needHelp', 'Support')}</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center overflow-hidden">
        {/* Ambient Gradient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('landing.previewBadge', 'Next-Gen POD Command Center')}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15] mb-5">
          {t('landing.heroTitle', 'حوّل أفكار الطباعة عند الطلب إلى منتجات جاهزة للبيع')}
        </h1>

        <p className="text-sm sm:text-lg text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          {t(
            'landing.heroSubtitle',
            'ابحث في الترندات، استكشف النيشات المربحة، افحص حقوق الملكية والعلامات التجارية، أنشئ تصاميم احترافية مع 11 موك آب، وجَهّز سيو إتسي — كل ذلك في مركز تحكم واحد.'
          )}
        </p>

        {/* Secret Key Input Form */}
        <div className="max-w-xl mx-auto mb-14">
          <form onSubmit={handleSubmit} className="p-3 rounded-2xl bg-[#131520] border border-gray-800 shadow-2xl flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative w-full">
              <KeyRound className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="أدخل كود الدخول (مثال: A3F9K2L8Z1 أو كود الأدمن kalo@123)"
                className="w-full pl-10 pr-4 py-3 bg-[#0a0c12] border border-gray-800 focus:border-indigo-500 rounded-xl text-center sm:text-left text-sm font-mono tracking-wide text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !accessKey.trim()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              <span>{loading ? 'جاري التحقق...' : 'تسجيل الدخول وفتح الأداة'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Error Message */}
          {errorMsg && (
            <div className="mt-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium animate-in fade-in">
              {errorMsg}
            </div>
          )}

          {/* Quick Helper Badges for Testing & Admin */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-[11px] text-gray-400">تجربة سريعة بنقرة واحدة:</span>

            {/* Quick Admin Click */}
            <button
              type="button"
              onClick={() => quickLoginWith('kalo@123')}
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono font-medium transition-all flex items-center gap-1.5 shadow-sm"
              title="تسجيل الدخول فوراً كمسؤول عام"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>👑 كود الأدمن: kalo@123</span>
            </button>

            {/* Sample License Keys */}
            <button
              type="button"
              onClick={() => quickLoginWith('A3F9K2L8Z1')}
              className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-medium transition-all flex items-center gap-1.5"
              title="استخدام كود ترخيص تجريبي رقم 1"
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              <span>كود ترخيص: A3F9K2L8Z1</span>
            </button>

            <button
              type="button"
              onClick={() => quickLoginWith('M7X4V0C5B9')}
              className="px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-mono font-medium transition-all flex items-center gap-1.5"
              title="استخدام كود ترخيص تجريبي رقم 2"
            >
              <KeyRound className="w-3.5 h-3.5 text-purple-400" />
              <span>كود ترخيص: M7X4V0C5B9</span>
            </button>
          </div>

          <div className="mt-4 text-[11px] text-gray-500 flex items-center justify-center gap-2">
            <Lock className="w-3 h-3 text-indigo-400" />
            <span>يتطلب كود ترخيص مفعّل أو كود الأدمن العام</span>
            <span>·</span>
            <button
              type="button"
              onClick={onOpenSupport}
              className="text-gray-400 hover:text-white underline underline-offset-2"
            >
              طلب كود تفعيل
            </button>
          </div>
        </div>

        {/* Interactive Dashboard Mockup Preview */}
        <div className="relative max-w-5xl mx-auto rounded-2xl border border-gray-800 bg-[#0f111a] shadow-2xl p-4 sm:p-6 text-left overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-gray-800/80 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs font-mono text-gray-500">GiveMePOD · Active Workspace Preview</span>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
              Score: 84/100 · LOW RISK
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#151724] border border-gray-800/80">
              <div className="text-xs font-mono text-indigo-400 mb-1">01 / CONCEPT SPECIFICATION</div>
              <div className="text-sm font-semibold text-white mb-2">Vintage Camp Hiking Badge Tee</div>
              <div className="text-xs text-gray-400 leading-relaxed">
                Pacific Northwest 70s aesthetics featuring weathered pines and distressed typography.
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#151724] border border-gray-800/80">
              <div className="text-xs font-mono text-purple-400 mb-1">02 / MOCKUP FACTORY</div>
              <div className="text-sm font-semibold text-white mb-2">11 Commercial Assets Generated</div>
              <div className="text-xs text-gray-400 leading-relaxed">
                Hero flatlay, model in motion, close-up fabric texture, styled gift box, and size charts.
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#151724] border border-gray-800/80">
              <div className="text-xs font-mono text-emerald-400 mb-1">03 / COMPLIANCE & PROFIT</div>
              <div className="text-sm font-semibold text-white mb-2">0 Trademark Flags · 32% Margin</div>
              <div className="text-xs text-gray-400 leading-relaxed">
                Clean IP scan across USPTO index with automated profit modeling for DTG shirts.
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Sequence Banner */}
        <div className="mt-14 p-6 rounded-2xl bg-[#10121c] border border-gray-800/80 max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4 text-xs font-mono text-indigo-400 uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <p className="text-base font-bold text-white">One Idea → Complete Launch-Ready Package</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-mono text-gray-400">
            {['DISCOVER', 'RESEARCH', 'FIND NICHE', 'ANALYZE TREND', 'CHECK RISK', 'GENERATE CONCEPT', 'GENERATE DESIGN', '11 MOCKUPS', 'SEO LISTING', 'CALCULATE PROFIT', 'SAVE PROJECT'].map((step, i, arr) => (
              <React.Fragment key={step}>
                <span className="px-3 py-1.5 rounded-lg bg-[#141622] border border-gray-800 text-gray-200">
                  {step}
                </span>
                {i < arr.length - 1 && <span className="text-indigo-400 font-bold">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* 9 Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            كل ما يحتاجه بائع الطباعة عند الطلب المحترف
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            استغنِ عن 5 اشتراكات منفصلة. يجمع GiveMePOD بين أبحاث السوق، التحقق القانوني، توليد التصاميم والموك آب، وسيو المتاجر في مساحة عمل واحدة متكاملة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#11131b] border border-gray-800/80 hover:border-indigo-500/40 transition-all hover:shadow-xl hover:shadow-indigo-500/5 group text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#141724] to-[#0f1118] border border-indigo-500/30 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
              {t('landing.buildCta', 'Build Your Next POD Product')}
            </h2>
            <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto mb-8">
              أدخل كود الترخيص الرسمي الخاص بك، وفعّل وصولك الدائم لإنشاء منتجات طباعة عند الطلب جاهزة للإطلاق في ثوانٍ.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all active:scale-95 inline-flex items-center gap-2"
              >
                <span>{t('auth.activateCode', 'Enter Secret Key')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => quickLoginWith('kalo@123')}
                className="px-6 py-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-sm transition-all inline-flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>دخول الأدمن (kalo@123)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-gray-800/60 bg-[#090a0f] text-center text-xs text-gray-500 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-300">GiveMePOD</span>
            <span>— Research. Design. Validate. Mockup. Sell.</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button onClick={onOpenSupport} className="hover:text-gray-300 transition-colors">
              Support (WhatsApp / Telegram)
            </button>
            <span>·</span>
            <span>Independent POD Intelligence Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
