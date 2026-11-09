import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { RTLProvider } from '../components/layout/RTLProvider';
import { LandingPage } from '../pages/LandingPage';
import { MemberPortal } from '../pages/MemberPortal';
import { StaffCheckin } from '../pages/StaffCheckin';
import '../styles/global.css';

type ViewMode = 'landing' | 'member' | 'staff';

function parseHashView(): ViewMode {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (hash === 'portal' || hash === 'member') return 'member';
  if (hash === 'staff') return 'staff';
  return 'landing';
}

const ProshotWebsiteApp: React.FC = () => {
  const [view, setView] = useState<ViewMode>(() => parseHashView());
  const [branchSlug, setBranchSlug] = useState<string>(
    () => localStorage.getItem('ps_mock_branch_slug') || 'premium'
  );
  const [portalKey, setPortalKey] = useState(0);

  const handleNavigate = (nextView: ViewMode, nextBranchSlug?: string) => {
    if (nextBranchSlug) {
      if ((window as any).setMockBranchSlug) {
        (window as any).setMockBranchSlug(nextBranchSlug);
      } else {
        localStorage.setItem('ps_mock_branch_slug', nextBranchSlug);
      }
      setBranchSlug(nextBranchSlug);
      setPortalKey((k) => k + 1);
    }
    setView(nextView);
    window.location.hash = nextView === 'landing' ? '' : `#/${nextView}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    // Initialize mock branch slug on load
    if ((window as any).setMockBranchSlug) {
      (window as any).setMockBranchSlug(branchSlug);
    }
    const onHashChange = () => {
      setView(parseHashView());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <RTLProvider>
      {view === 'landing' && (
        <LandingPage
          key={`landing-${portalKey}`}
          onNavigate={handleNavigate}
          activeBranchSlug={branchSlug}
        />
      )}

      {view === 'member' && (
        <MemberPortal
          key={`member-${portalKey}`}
          onBackToSite={() => handleNavigate('landing')}
        />
      )}

      {view === 'staff' && (
        <StaffCheckin
          key={`staff-${portalKey}`}
          onBackToSite={() => handleNavigate('landing')}
        />
      )}
    </RTLProvider>
  );
};

const rootEl = document.getElementById('proshot-website-root');
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <ProshotWebsiteApp />
    </React.StrictMode>
  );
}
