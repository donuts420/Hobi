import React, { useEffect, useState } from 'react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AppRoutes from './routes/AppRoutes';
import AuthModal from './components/common/AuthModal';
import { supabase } from './lib/supabase';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('events');
  const [selectedCity, setSelectedCity] = useState('Delhi NCR');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [recoverySession, setRecoverySession] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) setRecoverySession(true);
      if (event === 'SIGNED_OUT') {
        setRecoverySession(false);
        setCurrentRoute('events');
        setCurrentUser(null);
      }
      const user = session?.user;
      if (user) {
        setCurrentUser({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer',
          phone: user.user_metadata?.phone || '',
          preferredCity: user.user_metadata?.preferred_city || '',
          preferences: user.user_metadata?.preferences || null,
          userMetadata: user.user_metadata || {},
          user_metadata: user.user_metadata || {},
          createdAt: user.created_at || null,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Support route & preview flags via URL query parameters (e.g. ?route=profile or ?demo=1)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const routeParam = params.get('route');
      if (routeParam) {
        setCurrentRoute(routeParam);
      }
      if (params.get('demo') === '1' && !currentUser) {
        setCurrentUser({
          id: 'usr-demo-789421',
          email: 'aarav.sharma@example.com',
          name: 'Aarav Sharma',
          phone: '+91 98765 43210',
          preferredCity: 'Delhi NCR',
          preferences: {
            emailAlerts: true,
            eventReminders: true,
            weeklyDigest: false,
            selectedGenres: ['Concerts & Gigs', 'Standup Comedy'],
          },
          userMetadata: {
            organization_name: 'Desert Mirage Productions',
            business_email: 'events@desertmirage.in',
            business_phone: '+91 98765 43210',
            website_url: 'https://desertmirage.in',
            organizer_bio: 'Independent live music, cultural gatherings, and curated theatre experiences across Delhi NCR & Rajasthan.',
            city: 'Delhi NCR',
          },
          user_metadata: {
            organization_name: 'Desert Mirage Productions',
            business_email: 'events@desertmirage.in',
            business_phone: '+91 98765 43210',
            website_url: 'https://desertmirage.in',
            organizer_bio: 'Independent live music, cultural gatherings, and curated theatre experiences across Delhi NCR & Rajasthan.',
            city: 'Delhi NCR',
          },
          createdAt: '2026-01-15T10:00:00.000Z',
        });
      }
    } catch {
      // Ignore if URLSearchParams is unavailable
    }
  }, []);

  const handleSignOut = async () => {
    setCurrentUser(null);
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Could not sign out:', error.message);
  };

  const handleNavigate = (route) => {
    setCurrentRoute(route);
    document.getElementById('main-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHostEventClick = () => {
    if (currentUser) {
      handleNavigate('organiser-profile');
    } else {
      setAuthDefaultTab('signup');
      setAuthModalOpen(true);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (currentRoute !== 'events') {
      setCurrentRoute('events');
    }
  };

  return (
    <div className="h-dvh overflow-hidden bg-darkRoast text-warmCream font-serif flex flex-col selection:bg-terracotta selection:text-softButter select-none">
      {/* Top Navbar with Clean Links, Categories Mega-Menu, Location Modal, and JWT-ready Login */}
      <Navbar
        selectedCity={selectedCity}
        onSelectCity={(city) => {
          setSelectedCity(city);
          if (currentRoute !== 'events') setCurrentRoute('events');
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectCategory={handleCategorySelect}
        onSignInClick={() => {
          setAuthDefaultTab('login');
          setAuthModalOpen(true);
        }}
        onHostEventClick={handleHostEventClick}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onNavigate={handleNavigate}
        currentRoute={currentRoute}
      />

      {/* Main Dynamic View Area */}
      <main id="main-scroll-container" className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain">
        <AppRoutes
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          currentUser={currentUser}
          onUserUpdate={(updatedFields) => {
            setCurrentUser((prev) => (prev ? { ...prev, ...updatedFields } : prev));
          }}
          onSignOut={handleSignOut}
          onSignInClick={() => {
            setAuthDefaultTab('login');
            setAuthModalOpen(true);
          }}
        />
        <Footer
          onHostEventClick={handleHostEventClick}
          onNavigate={handleNavigate}
        />
      </main>

      {/* JWT-Ready Sign In & Registration Modal */}
      <AuthModal
        isOpen={authModalOpen || recoverySession}
        recoveryMode={recoverySession}
        defaultTab={authDefaultTab}
        onClose={() => setAuthModalOpen(false)}
        onRecoveryComplete={() => setRecoverySession(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
        }}
      />
    </div>
  );
}
