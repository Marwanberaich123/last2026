import React, { useState, useEffect } from 'react';
import { I18nProvider, useI18n } from './i18n';
import { User, Project } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar, TabKey } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { LockedView } from './components/LockedView';
import { SupportModal } from './components/SupportModal';
import { CommandPalette } from './components/CommandPalette';
import { ProductWizard } from './components/ProductWizard';
import { DashboardHome } from './components/DashboardHome';
import { TrendHunter } from './components/TrendHunter';
import { NicheFinder } from './components/NicheFinder';
import { DesignStudio } from './components/DesignStudio';
import { MockupFactory } from './components/MockupFactory';
import { RiskScanner } from './components/RiskScanner';
import { MarketAnalyzer } from './components/MarketAnalyzer';
import { CompetitorResearchView } from './components/CompetitorResearchView';
import { EtsyListingView } from './components/EtsyListingView';
import { PinterestFactory } from './components/PinterestFactory';
import { ProfitCalculatorView } from './components/ProfitCalculatorView';
import { SeasonalPlannerView } from './components/SeasonalPlannerView';
import { AiAdvisor } from './components/AiAdvisor';
import { MyProducts } from './components/MyProducts';
import { ProjectDetail } from './components/ProjectDetail';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { AdminPanel } from './components/AdminPanel';
import { MessageCircle, HelpCircle } from 'lucide-react';

export const MainApp: React.FC = () => {
  const { t } = useI18n();

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [accessSuffix, setAccessSuffix] = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Navigation State
  const [currentTab, setCurrentTab] = useState<TabKey>('dashboard');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Projects State
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Fetch Session & Projects
  const fetchSessionAndProjects = async () => {
    try {
      const savedKey = localStorage.getItem('givemepod_key') || '';
      const headers: Record<string, string> = {};
      if (savedKey) {
        headers['x-access-key'] = savedKey;
      }

      const res = await fetch('/api/auth/session', { headers });
      const data = await res.json();
      if (data.user && !data.isLocked) {
        setUser(data.user);
        setIsLocked(false);
        setAccessSuffix(data.accessSuffix || null);

        const resProj = await fetch('/api/projects', { headers });
        const pList = await resProj.json();
        setProjects(pList);
      } else {
        setUser(null);
        setIsLocked(true);
      }
    } catch (err) {
      console.error('Failed to load session:', err);
    } finally {
      setLoadingSession(false);
    }
  };

  useEffect(() => {
    fetchSessionAndProjects();
  }, []);

  // Keyboard shortcut listener for Command Palette (⌘K or Ctrl+K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setIsCommandOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers: Sign in strictly using Secret Key
  const handleSignInWithKey = async (key: string): Promise<boolean> => {
    try {
      const cleanKey = key.trim();
      const res = await fetch('/api/auth/key-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: cleanKey })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return false;
      }

      localStorage.setItem('givemepod_key', data.key);
      setUser(data.user);
      setIsLocked(false);
      setAccessSuffix(data.accessSuffix);

      // If user is Admin (kalo@123), route directly to Admin Panel!
      if (data.isAdmin || data.user.role === 'ADMIN') {
        setCurrentTab('admin');
      }

      const resProj = await fetch('/api/projects', {
        headers: { 'x-access-key': data.key }
      });
      const pList = await resProj.json();
      setProjects(pList);
      return true;
    } catch (err) {
      console.error('Sign-in failed:', err);
      return false;
    }
  };

  const handleUnlockSuccess = (suffix: string) => {
    setIsLocked(false);
    setAccessSuffix(suffix);
    fetchSessionAndProjects();
  };

  const handleLogout = async () => {
    localStorage.removeItem('givemepod_key');
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setIsLocked(true);
    setSelectedProjectId(null);
  };

  const handleProjectCreated = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev]);
    setSelectedProjectId(newProject.id);
  };

  const handleDuplicateProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}/duplicate`, { method: 'POST' });
      const dup = await res.json();
      setProjects(prev => [dup, ...prev]);
      setSelectedProjectId(dup.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      setProjects(prev => prev.filter(p => p.id !== id));
      if (selectedProjectId === id) setSelectedProjectId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectTab = (tab: TabKey) => {
    setSelectedProjectId(null);
    setCurrentTab(tab);
  };

  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0] || null;

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center animate-pulse text-indigo-400">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
            </svg>
          </div>
          <span className="text-xs font-mono text-gray-400">Loading GiveMePOD...</span>
        </div>
      </div>
    );
  }

  // 1. Not signed in with Secret Key -> Landing Page
  if (!user) {
    return (
      <>
        <LandingPage onSignInWithKey={handleSignInWithKey} onOpenSupport={() => setIsSupportOpen(true)} />
        <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
      </>
    );
  }

  // 2. Signed in but locked -> Locked Screen
  if (isLocked) {
    return (
      <>
        <Navbar
          user={user}
          accessSuffix={accessSuffix}
          isLocked={true}
          onOpenSupport={() => setIsSupportOpen(true)}
          onOpenCommand={() => setIsCommandOpen(true)}
          onToggleSidebar={() => {}}
          onLogout={handleLogout}
        />
        <LockedView
          user={user}
          onUnlockSuccess={handleUnlockSuccess}
          onOpenSupport={() => setIsSupportOpen(true)}
        />
        <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
      </>
    );
  }

  // 3. Authenticated and Unlocked Full Command Center
  return (
    <div className="min-h-screen bg-[#090a0f] text-gray-100 flex flex-col selection:bg-indigo-500/30 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        user={user}
        accessSuffix={accessSuffix}
        isLocked={false}
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenCommand={() => setIsCommandOpen(true)}
        onToggleSidebar={() => setIsSidebarOpenMobile(prev => !prev)}
        onLogout={handleLogout}
        onSelectTab={handleSelectTab}
      />

      <div className="flex-1 flex w-full">
        {/* Sidebar */}
        <Sidebar
          currentTab={selectedProjectId ? 'myProducts' : currentTab}
          onSelectTab={handleSelectTab}
          onOpenWizard={() => setIsWizardOpen(true)}
          isOpenMobile={isSidebarOpenMobile}
          onCloseMobile={() => setIsSidebarOpenMobile(false)}
          isAdmin={user.role === 'ADMIN'}
        />

        {/* Main Workspace Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {/* If a project is explicitly selected, display its full detail tabs */}
          {selectedProjectId && activeProject ? (
            <ProjectDetail
              project={activeProject}
              onBack={() => setSelectedProjectId(null)}
              onUpdateProject={(updated) => {
                setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
              }}
              onDuplicate={handleDuplicateProject}
              onDelete={handleDeleteProject}
            />
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DashboardHome
                  user={user}
                  projects={projects}
                  onOpenWizard={() => setIsWizardOpen(true)}
                  onOpenTrendHunter={() => setCurrentTab('trendHunter')}
                  onOpenProject={(id) => setSelectedProjectId(id)}
                />
              )}

              {currentTab === 'trendHunter' && (
                <TrendHunter
                  onBuildProductWithTrend={(niche, kw) => {
                    setIsWizardOpen(true);
                  }}
                />
              )}

              {currentTab === 'ideaFinder' && (
                <NicheFinder
                  onSelectNiche={(niche) => {
                    setIsWizardOpen(true);
                  }}
                />
              )}

              {currentTab === 'designStudio' && (
                <DesignStudio initialDesign={activeProject?.design} />
              )}

              {currentTab === 'mockupFactory' && (
                <MockupFactory
                  mockups={activeProject?.mockups || []}
                  productName={activeProject?.name || 'GiveMePOD Product'}
                  designTitle={activeProject?.design?.title || 'POD Artwork'}
                />
              )}

              {currentTab === 'riskScanner' && <RiskScanner />}

              {currentTab === 'marketAnalyzer' && <MarketAnalyzer />}

              {currentTab === 'competitorResearch' && <CompetitorResearchView />}

              {currentTab === 'etsyListing' && activeProject?.seo_listing && (
                <EtsyListingView seoData={activeProject.seo_listing} />
              )}

              {currentTab === 'pinterestFactory' && (
                <PinterestFactory
                  pins={activeProject?.pinterest_pins || []}
                  productName={activeProject?.name || 'POD Product'}
                />
              )}

              {currentTab === 'profitCalculator' && (
                <ProfitCalculatorView initialProfit={activeProject?.profit} />
              )}

              {currentTab === 'seasonalPlanner' && <SeasonalPlannerView />}

              {currentTab === 'aiAdvisor' && <AiAdvisor currentProject={activeProject} />}

              {currentTab === 'myProducts' && (
                <MyProducts
                  projects={projects}
                  onOpenProject={(id) => setSelectedProjectId(id)}
                  onOpenWizard={() => setIsWizardOpen(true)}
                  onDuplicate={handleDuplicateProject}
                  onDelete={handleDeleteProject}
                />
              )}

              {currentTab === 'analytics' && <AnalyticsView projects={projects} />}

              {currentTab === 'settings' && (
                <SettingsView
                  user={user}
                  accessSuffix={accessSuffix}
                  onOpenSupport={() => setIsSupportOpen(true)}
                />
              )}

              {currentTab === 'admin' && user.role === 'ADMIN' && <AdminPanel />}
            </>
          )}
        </main>
      </div>

      {/* Floating Support Button */}
      <button
        onClick={() => setIsSupportOpen(true)}
        className="fixed bottom-5 right-5 z-40 px-4 py-2.5 rounded-full bg-[#161824] hover:bg-[#202334] border border-emerald-500/40 text-emerald-400 font-semibold text-xs shadow-xl shadow-black/50 transition-all transform hover:scale-105 flex items-center gap-2 group"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <MessageCircle className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
        <span>{t('common.needHelp', 'Need Help?')}</span>
      </button>

      {/* Modals */}
      <ProductWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onSelectTab={handleSelectTab}
        onOpenWizard={() => setIsWizardOpen(true)}
      />
    </div>
  );
};

export default function App() {
  return (
    <I18nProvider>
      <MainApp />
    </I18nProvider>
  );
}
