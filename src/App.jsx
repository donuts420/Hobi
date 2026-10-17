import React, { useState } from 'react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AppRoutes from './routes/AppRoutes';
import AuthModal from './components/common/AuthModal';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('events');
  const [selectedCity, setSelectedCity] = useState('Jaipur');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);

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
        onSignOut={() => {
          setCurrentUser(null);
          setCurrentRoute('events');
        }}
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
        isOpen={authModalOpen}
        defaultTab={authDefaultTab}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
        }}
      />
    </div>
  );
}
