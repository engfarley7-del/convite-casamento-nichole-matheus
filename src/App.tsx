import React, { useState, useEffect } from 'react';
import { WeddingProvider, useWedding } from './context/WeddingContext.tsx';
import { HeaderNav } from './components/HeaderNav.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { HistoryPage } from './pages/HistoryPage.tsx';
import { DetailsPage } from './pages/DetailsPage.tsx';
import { RsvpPage } from './pages/RsvpPage.tsx';
import { GiftsPage } from './pages/GiftsPage.tsx';
import { GroomsmenPage } from './pages/GroomsmenPage.tsx';
import { BridesmaidsPage } from './pages/BridesmaidsPage.tsx';
import { SpecialInvitePage } from './pages/SpecialInvitePage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';

function MainApp() {
  const { settings } = useWedding();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Listen to browser navigation (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Real URL navigation helper (preserves query strings like ?nome=...)
  const navigate = (path: string) => {
    const cleanPath = path.split('?')[0] || '/';
    if (window.location.pathname + window.location.search !== path) {
      window.history.pushState({}, '', path);
      setCurrentPath(cleanPath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Sync document title dynamically
  useEffect(() => {
    let pageTitle = `${settings.coupleNames} - Convite de Casamento | 18/07/2027`;
    if (currentPath === '/nossa-historia') {
      pageTitle = `Nossa História - ${settings.coupleNames} | 18/07/2027`;
    } else if (currentPath === '/detalhes') {
      pageTitle = `Detalhes & Local - ${settings.coupleNames} | 18/07/2027`;
    } else if (currentPath === '/presenca') {
      pageTitle = `Confirmação de Presença (RSVP) - ${settings.coupleNames}`;
    } else if (currentPath === '/presentes') {
      pageTitle = `Lista de Presentes - ${settings.coupleNames}`;
    } else if (currentPath === '/padrinhos') {
      pageTitle = `Página dos Padrinhos - ${settings.coupleNames}`;
    } else if (currentPath === '/madrinhas') {
      pageTitle = `Página das Madrinhas - ${settings.coupleNames}`;
    } else if (currentPath.startsWith('/convite/')) {
      const slug = currentPath.replace('/convite/', '').replace(/\/+$/, '');
      const honoree = settings.honorees?.find((h) => h.slug.toLowerCase() === slug.toLowerCase());
      pageTitle = honoree
        ? `Convite Especial: ${honoree.names} - ${settings.coupleNames}`
        : `Convite Especial - ${settings.coupleNames}`;
    } else if (currentPath === '/admin') {
      pageTitle = `Painel dos Noivos - ${settings.coupleNames}`;
    }
    document.title = pageTitle;

    // Set noindex for hidden/admin/personalized routes
    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const isHidden =
      currentPath === '/padrinhos' ||
      currentPath === '/madrinhas' ||
      currentPath === '/admin' ||
      currentPath.startsWith('/convite/');
    if (isHidden) {
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.name = 'robots';
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.content = 'noindex, nofollow';
    } else if (robotsMeta) {
      robotsMeta.remove();
    }
  }, [currentPath, settings.coupleNames, settings.honorees]);

  // Route Renderer
  const renderCurrentRoute = () => {
    if (currentPath.startsWith('/convite/')) {
      const slug = currentPath.replace('/convite/', '').replace(/\/+$/, '');
      return <SpecialInvitePage slug={slug} onNavigate={navigate} />;
    }

    switch (currentPath) {
      case '/nossa-historia':
        return <HistoryPage />;
      case '/detalhes':
        return <DetailsPage />;
      case '/presenca':
        return <RsvpPage />;
      case '/presentes':
        return <GiftsPage />;
      case '/padrinhos':
        return <GroomsmenPage onNavigate={navigate} />;
      case '/madrinhas':
        return <BridesmaidsPage onNavigate={navigate} />;
      case '/admin':
        return <AdminPage onNavigate={navigate} />;
      case '/':
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F1EF] text-[#3D2C24] flex flex-col font-sans selection:bg-[#EC008C] selection:text-white">
      {/* Top Header */}
      <HeaderNav
        currentPath={currentPath}
        onNavigate={navigate}
        coupleNames={settings.coupleNames}
      />

      {/* Main Content View */}
      <main className="flex-1 w-full max-w-6xl mx-auto">
        {renderCurrentRoute()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <WeddingProvider>
      <MainApp />
    </WeddingProvider>
  );
}
