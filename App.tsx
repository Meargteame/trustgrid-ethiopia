import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/TrustSignals';
import { Showcase } from './components/ComparisonSection';
import { Testimonials } from './components/Testimonials';
import { GeminiDemo } from './components/GeminiDemo';
import { Footer } from './components/Footer';
import { Dashboard } from './components/Dashboard';
import { AuthPage } from './components/AuthPage';
import { CollectionPage } from './components/CollectionPage';
import { PublicWall } from './components/PublicWall';
import { VerificationPage } from './components/VerificationPage';
import { supabase } from './lib/supabase';

type ViewState = 'landing' | 'auth' | 'dashboard' | 'collection' | 'public-wall' | 'verification';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [embedHandle, setEmbedHandle] = useState<string>('');
  const [collectionHandle, setCollectionHandle] = useState<string>('');
  const [verificationToken, setVerificationToken] = useState<string>('');

  useEffect(() => {
    // Check for "Embed", "Collect", or "Verify" routes manually
    const path = window.location.pathname;
    
    if (path.startsWith('/embed/')) {
       const handle = path.split('/embed/')[1];
       if (handle) {
         setEmbedHandle(handle);
         setCurrentView('public-wall');
         return; 
       }
    }

    if (path.startsWith('/collect/')) {
       const handle = path.split('/collect/')[1];
       if (handle) {
         setCollectionHandle(handle);
         setCurrentView('collection');
         return; 
       }
    }

    if (path.startsWith('/verify/')) {
       const token = path.split('/verify/')[1];
       if (token) {
         setVerificationToken(token);
         setCurrentView('verification');
         return; 
       }
    }

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setCurrentView('dashboard');
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setCurrentView('dashboard');
      }
      if (event === 'SIGNED_OUT') {
        setCurrentView('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleInitiateLogin = () => {
    setCurrentView('auth');
    window.scrollTo(0, 0);
  };

  const handleAuthSuccess = () => {
    // Handled by onAuthStateChange
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // View change handled by onAuthStateChange
    window.scrollTo(0, 0);
  };

  const handleBackToHome = () => {
    setCurrentView('landing');
    window.scrollTo(0, 0);
  };
  
  const handleOpenCollection = () => {
    setCurrentView('collection');
    window.scrollTo(0, 0);
  };

  const handleCloseCollection = () => {
    setCurrentView('dashboard');
    window.scrollTo(0, 0);
  };

  // Render Logic
  if (currentView === 'dashboard') {
    return <Dashboard onLogout={handleLogout} onOpenCollection={handleOpenCollection} />;
  }

  if (currentView === 'collection') {
    return (
      <CollectionPage 
        targetUsername={collectionHandle} 
        onBack={() => {
          if (collectionHandle) {
             // If accessed via public link, go to landing
             setCurrentView('landing');
             window.history.pushState({}, '', '/');
          } else {
             handleCloseCollection();
          }
        }} 
      />
    );
  }

  if (currentView === 'verification') {
    return <VerificationPage token={verificationToken} />;
  }

  if (currentView === 'public-wall') {
    return <PublicWall companyHandle={embedHandle} />;
  }

  if (currentView === 'auth') {
    return <AuthPage onLogin={handleAuthSuccess} onBack={handleBackToHome} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar onLogin={handleInitiateLogin} />
      <main>
        <Hero onLogin={handleInitiateLogin} />
        <Features />
        <Showcase />
        <Testimonials />
        <GeminiDemo />
      </main>
      <Footer />
    </div>
  );
};

export default App;