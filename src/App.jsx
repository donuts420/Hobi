import React, { useEffect, useState } from 'react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AppRoutes from './routes/AppRoutes';
import AuthModal from './components/common/AuthModal';
import { supabase } from './lib/supabase';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('events');
  const [selectedCity, setSelectedCity] = useState('Jaipur');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [recoverySession, setRecoverySession] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) setRecoverySession(true);
      if (event === 'SIGNED_OUT') setRecoverySession(false);
      const user = session?.user;
      if (!user) setCurrentRoute('events');
      setCurrentUser(user ? {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer',
      } : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Could not sign out:', error.message);
  };

  const handleNavigate = (route) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (currentRoute !== 'events') {
      setCurrentRoute('events');
    }
  };

  return (
    <div className="min-h-screen bg-darkRoast text-warmCream font-serif flex flex-col selection:bg-terracotta selection:text-softButter select-none">
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
        onHostEventClick={() => {
          setAuthDefaultTab('signup');
          setAuthModalOpen(true);
        }}
        currentUser={currentUser}
        onSignOut={handleSignOut}
      />

      {/* Main Dynamic View Area */}
      <main className="flex-1">
        <AppRoutes
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </main>

      {/* Global Theme Footer */}
      <Footer onHostEventClick={() => {
        setAuthDefaultTab('signup');
        setAuthModalOpen(true);
      }} />

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
