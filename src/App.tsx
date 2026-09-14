import React, { useState, useEffect, useCallback } from 'react';
import { NavPageId, Threat } from './types';
import { INITIAL_MOCK_THREATS } from './data/mockThreats';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardView } from './components/DashboardView';
import { LiveThreatsView } from './components/LiveThreatsView';
import { InvestigationView } from './components/InvestigationView';
import { NetworkMapView } from './components/NetworkMapView';
import { SimulationView } from './components/SimulationView';
import { IncidentsKanbanView } from './components/IncidentsKanbanView';
import { ThreatHistoryView } from './components/ThreatHistoryView';
import { ModelMonitoringView } from './components/ModelMonitoringView';
import { HowToUseView } from './components/HowToUseView';
import { SettingsView } from './components/SettingsView';
import { PlaceholderView } from './components/PlaceholderView';
import { ThreatDetailModal } from './components/ThreatDetailModal';
import { HelpModal } from './components/HelpModal';
import { GuidedTour, TOUR_STEPS } from './components/GuidedTour';
import { SplashIntro } from './components/SplashIntro';
import { useSettings } from './context/SettingsContext';

export default function App() {
  const { settings } = useSettings();
  const [activePage, setActivePage] = useState<NavPageId>('dashboard');
  const [threats, setThreats] = useState<Threat[]>(INITIAL_MOCK_THREATS);
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Splash intro state: only play once per visit (sessionStorage)
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem('ipthreat_splash_shown');
    } catch {
      return false;
    }
  });

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    try {
      sessionStorage.setItem('ipthreat_splash_shown', 'true');
    } catch {
      // ignore
    }
  }, []);

  // Allow any keypress to skip splash
  useEffect(() => {
    if (!showSplash) return;
    const handleKey = () => handleSplashComplete();
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showSplash, handleSplashComplete]);

  // Tour & Help Modals
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [currentTourStep, setCurrentTourStep] = useState<number>(0);

  const activeCriticalCount = threats.filter(
    (t) => t.severity === 'critical' && t.status !== 'resolved'
  ).length;

  const activeInvestigatingCount = threats.filter(
    (t) => t.status === 'investigating'
  ).length;

  const activeIncidentsCount = threats.filter(
    (t) => t.status !== 'resolved'
  ).length;

  const handleAddThreat = (newThreat: Threat) => {
    setThreats((prev) => [newThreat, ...prev]);
  };

  const handleUpdateStatus = (threatId: string, newStatus: Threat['status']) => {
    setThreats((prev) =>
      prev.map((t) => (t.id === threatId ? { ...t, status: newStatus } : t))
    );
    if (selectedThreat && selectedThreat.id === threatId) {
      setSelectedThreat((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleStartTour = useCallback(() => {
    setIsTourOpen(true);
    setCurrentTourStep(0);
  }, []);

  const handleTourNext = useCallback(() => {
    if (currentTourStep < TOUR_STEPS.length - 1) {
      setCurrentTourStep((prev) => prev + 1);
    } else {
      handleTourFinish();
    }
  }, [currentTourStep]);

  const handleTourPrev = useCallback(() => {
    if (currentTourStep > 0) {
      setCurrentTourStep((prev) => prev - 1);
    }
  }, [currentTourStep]);

  const handleTourSkip = useCallback(() => {
    setIsTourOpen(false);
  }, []);

  const handleTourFinish = useCallback(() => {
    localStorage.setItem('ipthreat_tour_completed', 'true');
    setIsTourOpen(false);
    setActivePage('dashboard');
  }, []);

  // Keyboard Shortcuts (Requirement 10)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input or textarea
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isInput) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      // Modals Dismissal with Escape
      if (e.key === 'Escape') {
        if (isTourOpen) setIsTourOpen(false);
        if (isHelpModalOpen) setIsHelpModalOpen(false);
        if (selectedThreat) setSelectedThreat(null);
        return;
      }

      // Help Shortcut
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsHelpModalOpen((prev) => !prev);
        return;
      }

      // Check key (case-insensitive for single keys without Ctrl/Meta)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key.toUpperCase();
      switch (key) {
        case 'D':
          e.preventDefault();
          setActivePage('dashboard');
          break;
        case 'T':
          e.preventDefault();
          setActivePage('live-threats');
          break;
        case 'N':
          e.preventDefault();
          setActivePage('network-map');
          break;
        case 'I':
          e.preventDefault();
          setActivePage('incidents');
          break;
        case 'H':
          e.preventDefault();
          setActivePage('threat-history');
          break;
        case 'S':
          e.preventDefault();
          setActivePage('settings');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTourOpen, isHelpModalOpen, selectedThreat]);

  return (
    <div className="flex h-screen w-full bg-[var(--bg-app)] text-[var(--text-main)] overflow-hidden font-sans">
      {/* Persistent Left Navigation Sidebar (desktop) / Slide-out drawer (mobile) */}
      <Sidebar
        activePage={activePage}
        onSelectPage={(page) => setActivePage(page)}
        activeCriticalCount={activeCriticalCount}
        activeInvestigatingCount={activeInvestigatingCount}
        activeIncidentsCount={activeIncidentsCount}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Sticky Header Top Bar */}
        <TopBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          threats={threats}
          onSelectThreat={(threat) => setSelectedThreat(threat)}
          onOpenHelp={() => setIsHelpModalOpen(true)}
          onNavigatePage={(pageId) => setActivePage(pageId as NavPageId)}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        />

        {/* Scrollable Main Content Area */}
        <main
          id="soc-main-viewport"
          className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-8 space-y-5 sm:space-y-6"
        >
          {activePage === 'dashboard' ? (
            <DashboardView
              threats={threats}
              onSelectThreat={(threat) => setSelectedThreat(threat)}
              onNavigatePage={(pageId) => setActivePage(pageId)}
              onStartTour={handleStartTour}
            />
          ) : activePage === 'live-threats' ? (
            <LiveThreatsView
              threats={threats}
              onAddThreat={handleAddThreat}
              onSelectThreat={(threat) => setSelectedThreat(threat)}
              onNavigateToInvestigation={(threatId) => {
                setActivePage('investigation');
                setSelectedThreat(threats.find((t) => t.id === threatId) || null);
              }}
            />
          ) : activePage === 'investigation' ? (
            <InvestigationView
              threats={threats}
              onUpdateStatus={handleUpdateStatus}
              initialSelectedId={selectedThreat?.id}
            />
          ) : activePage === 'network-map' ? (
            <NetworkMapView
              threats={threats}
              onNavigateToInvestigation={(threatId) => {
                setActivePage('investigation');
                setSelectedThreat(threats.find((t) => t.id === threatId) || null);
              }}
            />
          ) : activePage === 'simulation' ? (
            <SimulationView
              onAddThreat={handleAddThreat}
              onNavigateToInvestigation={(threatId) => {
                setActivePage('investigation');
                setSelectedThreat(threats.find((t) => t.id === threatId) || null);
              }}
            />
          ) : activePage === 'incidents' ? (
            <IncidentsKanbanView
              threats={threats}
              onUpdateStatus={handleUpdateStatus}
              onSelectThreat={(threat) => setSelectedThreat(threat)}
              onNavigateToInvestigation={(threatId) => {
                setActivePage('investigation');
                setSelectedThreat(threats.find((t) => t.id === threatId) || null);
              }}
              onAddThreat={handleAddThreat}
            />
          ) : activePage === 'threat-history' ? (
            <ThreatHistoryView
              threats={threats}
              onSelectThreat={(threat) => setSelectedThreat(threat)}
              onNavigateToInvestigation={(threatId) => {
                setActivePage('investigation');
                setSelectedThreat(threats.find((t) => t.id === threatId) || null);
              }}
            />
          ) : activePage === 'model-monitoring' ? (
            <ModelMonitoringView />
          ) : activePage === 'how-to-use' ? (
            <HowToUseView
              onStartTour={handleStartTour}
              onNavigatePage={(pageId) => setActivePage(pageId)}
            />
          ) : activePage === 'settings' ? (
            <SettingsView />
          ) : (
            <PlaceholderView
              pageId={activePage}
              threats={threats}
              onSelectThreat={(threat) => setSelectedThreat(threat)}
            />
          )}
        </main>
      </div>

      {/* Threat Detail Modal / Deep Inspector */}
      {selectedThreat && activePage !== 'investigation' && (
        <ThreatDetailModal
          threat={selectedThreat}
          onClose={() => setSelectedThreat(null)}
          onUpdateStatus={handleUpdateStatus}
          onNavigateToInvestigation={(threatId) => {
            setActivePage('investigation');
            setSelectedThreat(threats.find((t) => t.id === threatId) || null);
          }}
        />
      )}

      {/* Help Modal */}
      {isHelpModalOpen && (
        <HelpModal
          isOpen={isHelpModalOpen}
          onClose={() => setIsHelpModalOpen(false)}
          onNavigatePage={(pageId) => {
            setActivePage(pageId);
            setIsHelpModalOpen(false);
          }}
          onStartTour={() => {
            setIsHelpModalOpen(false);
            handleStartTour();
          }}
        />
      )}

      {/* Interactive Guided Tour */}
      {isTourOpen && (
        <GuidedTour
          currentStepIndex={currentTourStep}
          isOpen={isTourOpen}
          onNext={handleTourNext}
          onPrev={handleTourPrev}
          onSkip={handleTourSkip}
          onFinish={handleTourFinish}
          onNavigatePage={(page) => setActivePage(page)}
        />
      )}

      {/* First-Visit Splash Intro Animation */}
      {showSplash && <SplashIntro onComplete={handleSplashComplete} />}
    </div>
  );
}
