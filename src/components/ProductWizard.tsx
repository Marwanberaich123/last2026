import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { Project } from '../types';
import {
  Sparkles,
  Layers,
  Palette,
  Users,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface ProductWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

const PRODUCT_TYPES = [
  { id: 'T-Shirt', icon: '👕', desc: 'Classic & Heavyweight Tees' },
  { id: 'Hoodie', icon: '🧥', desc: 'Cozy Fleece & Pullovers' },
  { id: 'Mug', icon: '☕', desc: '11oz & 15oz Ceramic Mugs' },
  { id: 'Sweatshirt', icon: '🧶', desc: 'Crewnecks & Warmers' },
  { id: 'Tote Bag', icon: '👜', desc: 'Eco Canvas & Shopping Totes' },
  { id: 'Poster', icon: '🖼️', desc: 'Matte & Luster Fine Art Prints' },
  { id: 'Phone Case', icon: '📱', desc: 'Impact & Slim Cases' },
  { id: 'Sticker', icon: '✨', desc: 'Die-Cut Vinyl Stickers' },
  { id: 'Cap', icon: '🧢', desc: 'Embroidered Dad Hats & Snapbacks' },
  { id: 'Notebook', icon: '📓', desc: 'Hardcover & Spiral Journals' }
];

const DESIGN_STYLES = [
  'Minimalist',
  'Vintage',
  'Retro',
  'Typography',
  'Funny',
  'Cute',
  'Streetwear',
  'Dark',
  'Boho',
  'Cottagecore',
  'Y2K',
  'Western',
  'Hand-drawn',
  'Illustrative',
  'Anime-inspired',
  'Distressed'
];

const AUDIENCES = [
  { label: 'Unisex', age: '18–34', tags: 'Nature, Outdoors, Everyday' },
  { label: 'Women', age: '25–44', tags: 'Moms, Wellness, Aesthetic' },
  { label: 'Men', age: '25–45', tags: 'Fitness, Humor, Work' },
  { label: 'Youth', age: '18–24', tags: 'College, Gaming, Pop Culture' }
];

export const ProductWizard: React.FC<ProductWizardProps> = ({
  isOpen,
  onClose,
  onProjectCreated
}) => {
  const { t } = useI18n();

  const [step, setStep] = useState(1);
  const [productType, setProductType] = useState('T-Shirt');
  const [conceptCount, setConceptCount] = useState(3);
  const [style, setStyle] = useState('Vintage');
  const [customStyle, setCustomStyle] = useState('');
  const [audience, setAudience] = useState('Unisex (25-34) Outdoor Lovers');
  const [customAudience, setCustomAudience] = useState('');
  const [niche, setNiche] = useState('Hiking & Wilderness');
  const [researchTrends, setResearchTrends] = useState(true);

  // Execution & Progress State
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepText, setCurrentStepText] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);

  if (!isOpen) return null;

  const handleStartPipeline = async () => {
    setIsRunning(true);
    setProgressPercent(10);
    setCurrentStepText('Creating project architecture...');

    const chosenStyle = customStyle.trim() || style;
    const chosenAudience = customAudience.trim() || audience;

    try {
      // Step A: Create initial project record
      const resCreate = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${chosenStyle} ${niche} ${productType}`,
          product_type: productType,
          niche: niche,
          style: chosenStyle,
          audience: chosenAudience,
          concept_count: conceptCount
        })
      });

      const project: Project = await resCreate.json();

      // Step B: Progress step animations
      const steps = [
        { text: 'Researching market demand signals...', p: 25 },
        { text: 'Discovering sub-niches and untrod angles...', p: 40 },
        { text: 'Screening trademarks & IP risks...', p: 55 },
        { text: 'Engineering commercial artwork & prompts...', p: 70 },
        { text: 'Assembling 11-image Mockup Factory gallery...', p: 85 },
        { text: 'Writing Etsy 13 tags, SEO listing & Pinterest pins...', p: 95 }
      ];

      for (const s of steps) {
        setCurrentStepText(s.text);
        setProgressPercent(s.p);
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      // Step C: Trigger backend pipeline
      const resPipeline = await fetch(`/api/projects/${project.id}/build-pipeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const pipeData = await resPipeline.json();

      setProgressPercent(100);
      setCurrentStepText('Product package finalized!');
      await new Promise((resolve) => setTimeout(resolve, 400));

      if (pipeData.project) {
        onProjectCreated(pipeData.project);
      } else {
        onProjectCreated(project);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setCurrentStepText('Error during generation. Please try again.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#12141e] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800/80">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-400">Step {step} of 5</span>
            <h2 className="text-lg font-bold text-white">{t('wizard.title', 'Build My POD Product')}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isRunning}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Running Pipeline Progress View */}
        {isRunning ? (
          <div className="py-12 px-4 text-center my-auto">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto mb-6 text-indigo-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">{currentStepText}</h3>
            <p className="text-xs text-gray-400 mb-6">
              GiveMePOD engine is running AI risk verification, mockup scenes, and SEO compilation.
            </p>

            <div className="w-full bg-[#1b1e2c] h-2.5 rounded-full overflow-hidden max-w-md mx-auto mb-2 border border-gray-800">
              <div
                className="bg-gradient-to-r from-indigo-500 via-indigo-400 to-purple-500 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-xs font-mono text-indigo-400">{progressPercent}%</div>
          </div>
        ) : (
          /* Step-by-Step Forms */
          <div className="flex-1 overflow-y-auto py-6 space-y-6">
            {/* STEP 1: PRODUCT TYPE */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">
                    {t('wizard.step1Title', 'What product do you want to create?')}
                  </h3>
                  <p className="text-xs text-gray-400">Select the apparel or gift format for your launch.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PRODUCT_TYPES.map((p) => {
                    const isSelected = productType === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setProductType(p.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-indigo-600/15 border-indigo-500 shadow-md shadow-indigo-500/10'
                            : 'bg-[#151722] border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        <span className="text-2xl mb-1.5 block">{p.icon}</span>
                        <div className="text-xs font-semibold text-white">{p.id}</div>
                        <div className="text-[10px] text-gray-400 truncate">{p.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: NUMBER OF CONCEPTS & NICHE */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">
                    {t('wizard.step2Title', 'How many product concepts do you want?')}
                  </h3>
                  <p className="text-xs text-gray-400">Choose between 1 and 4 concepts to generate.</p>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setConceptCount(num)}
                      className={`py-4 rounded-2xl border text-center font-bold text-lg transition-all ${
                        conceptCount === num
                          ? 'bg-indigo-600/20 border-indigo-500 text-white'
                          : 'bg-[#151722] border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Target Niche or Topic
                  </label>
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="e.g. Vintage Mountain Hiking, Golden Retriever Moms, Coffee & Coding"
                    className="w-full px-4 py-2.5 bg-[#0e1017] border border-gray-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: DESIGN STYLE */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">
                    {t('wizard.step3Title', 'What design style do you want?')}
                  </h3>
                  <p className="text-xs text-gray-400">Select a core aesthetic or provide custom directives.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {DESIGN_STYLES.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setStyle(st);
                        setCustomStyle('');
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                        style === st && !customStyle
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                          : 'bg-[#151722] border-gray-800 text-gray-300 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    {t('wizard.customStyle', 'Custom Style Directives')}
                  </label>
                  <input
                    type="text"
                    value={customStyle}
                    onChange={(e) => setCustomStyle(e.target.value)}
                    placeholder="e.g., Cyberpunk Botanical with Japanese typography"
                    className="w-full px-4 py-2.5 bg-[#0e1017] border border-gray-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: TARGET AUDIENCE */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">
                    {t('wizard.step4Title', 'Who is this product for?')}
                  </h3>
                  <p className="text-xs text-gray-400">Audience profiling helps calibrate tone and gifting intent.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {AUDIENCES.map((aud, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAudience(`${aud.label} (${aud.age}) - ${aud.tags}`);
                        setCustomAudience('');
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        audience.includes(aud.label) && !customAudience
                          ? 'bg-indigo-600/15 border-indigo-500 text-white'
                          : 'bg-[#151722] border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-semibold text-white">{aud.label} ({aud.age})</div>
                      <div className="text-[11px] text-gray-400">{aud.tags}</div>
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    {t('wizard.customAudience', 'Custom Audience')}
                  </label>
                  <input
                    type="text"
                    value={customAudience}
                    onChange={(e) => setCustomAudience(e.target.value)}
                    placeholder="e.g. Night shift ICU Nurses who love iced matcha"
                    className="w-full px-4 py-2.5 bg-[#0e1017] border border-gray-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* STEP 5: TREND RESEARCH & CONFIRMATION */}
            {step === 5 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">
                    {t('wizard.step5Title', 'Should GiveMePOD research current trends?')}
                  </h3>
                  <p className="text-xs text-gray-400">
                    When enabled, we query aggregated market signals from Etsy and Pinterest indexes.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setResearchTrends(true)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      researchTrends
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-[#151722] border-gray-800 text-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>{t('wizard.yesResearch', 'YES — Live Signals')}</span>
                    </div>
                    <p className="text-[11px] text-gray-400">Calculates demand velocity, search score, and keyword clusters.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResearchTrends(false)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      !researchTrends
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-[#151722] border-gray-800 text-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-300 mb-1">
                      <Layers className="w-4 h-4" />
                      <span>{t('wizard.noResearch', 'NO — Direct Prompt')}</span>
                    </div>
                    <p className="text-[11px] text-gray-400">Focuses purely on concept creation and artwork prompt generation.</p>
                  </button>
                </div>

                {/* Configuration Summary Card */}
                <div className="p-4 rounded-2xl bg-[#0b0c12] border border-gray-800 text-xs space-y-1.5 text-gray-400">
                  <div className="text-[10px] font-mono uppercase text-indigo-400">Summary:</div>
                  <div>Product: <strong className="text-white">{productType}</strong> ({conceptCount} concepts)</div>
                  <div>Niche & Style: <strong className="text-white">{niche}</strong> · <strong className="text-white">{customStyle || style}</strong></div>
                  <div>Audience: <strong className="text-white">{customAudience || audience}</strong></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Navigation */}
        {!isRunning && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-800/80">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-300 flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('common.back', 'Back')}</span>
              </button>
            ) : <div />}

            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep(s => s + 1)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
              >
                <span>{t('common.next', 'Next')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartPipeline}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold tracking-wide shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t('wizard.runBuild', 'BUILD MY POD PRODUCT')}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
