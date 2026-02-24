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
import { TestimonialCardEmbed } from './components/TestimonialCardEmbed';
import { supabase } from './lib/supabase';

type ViewState = 'landing' | 'auth' | 'dashboard' | 'collection' | 'public-wall' | 'verification' | 'embed-card';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [embedHandle, setEmbedHandle] = useState<string>('');
  const [embedCardId, setEmbedCardId] = useState<string>(''); // For single card embed
  const [collectionHandle, setCollectionHandle] = useState<string>('');
  const [verificationToken, setVerificationToken] = useState<string>('');

  useEffect(() => {
    // Check for "Embed", "Collect", or "Verify" routes manually
    const path = window.location.pathname;
    
    if (path.startsWith('/embed/')) {
       // Check if it's a card embed first: /embed/card/:id
       if (path.startsWith('/embed/card/')) {
          let cardId = path.split('/embed/card/')[1];
          // Remove query params if any
          if (cardId.includes('?')) {
             cardId = cardId.split('?')[0];
          }
          if (cardId) {
             setEmbedCardId(cardId);
             setCurrentView('embed-card'); // New view type will be needed
             return;
          }
       }

       let handle = path.split('/embed/')[1];
       // Clean up handle (remove trailing slash and query params)
       if (handle.endsWith('/')) {
         handle = handle.slice(0, -1);
       }
       if (handle.includes('?')) {
         handle = handle.split('?')[0];
       }

       if (handle) {
         setEmbedHandle(handle);
         setCurrentView('public-wall');
         return; 
       }
    }

    if (path.startsWith('/collect/')) {
       let handle = path.split('/collect/')[1];
       // Clean up handle
       if (handle.endsWith('/')) {
         handle = handle.slice(0, -1);
       }
       if (handle.includes('?')) {
         handle = handle.split('?')[0];
       }
       
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
    // Only check session if we are NOT on a public route
    if (!path.startsWith('/collect/') && !path.startsWith('/embed/') && !path.startsWith('/verify/')) {
        supabase.auth.getSession().then(({ data: { session }, error }) => {
          if (error) {
              console.error("Error retrieving session:", error);
          }
          if (session) {
              console.log("Existing session found:", session.user.email);
              setCurrentView('dashboard');
          } else {
              console.log("No existing session found.");
          }
        });
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Supabase Auth Event: ${event}`);
      
      if (session) {
         console.log("Session Active for:", session.user.email);
      } else {
         console.log("No Active Session");
      }

      // Handle OAuth callback token parsing implicitly done by supabase-js
      const isPublicRoute = window.location.pathname.startsWith('/collect/') || 
                            window.location.pathname.startsWith('/embed/') ||
                            window.location.pathname.startsWith('/verify/');

      if (!isPublicRoute) {
          // Redirect to dashboard on sign in
          if (event === 'SIGNED_IN' && session) {
            console.log("Redirecting to Dashboard...");
            setCurrentView('dashboard');
          }
          // Redirect to landing on sign out
          if (event === 'SIGNED_OUT') {
             console.log("Redirecting to Landing Page...");
             setCurrentView('landing');
          }
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

if (currentView === 'embed-card') {
    // Render just the card centered (or filling the iframe body)
    // Using h-full to fit within the iframe dimensions without forcing scrollbars if possible
    return (
      <div className="h-screen w-screen bg-transparent flex items-center justify-center p-0 sm:p-4">
         <div className="w-full h-full max-w-md max-h-[400px]">
            <TestimonialCardEmbed testimonialId={embedCardId} />
         </div>
      </div>
    );
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