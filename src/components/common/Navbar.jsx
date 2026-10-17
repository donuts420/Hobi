import React, { useState, useRef, useEffect } from 'react';
import {
  Ticket,
  MapPin,
  Search,
  ChevronDown,
  Menu,
  X,
  User,
  PlusCircle,
  Navigation,
  Music,
  Smile,
  Flame,
  Coffee,
  Palette,
  Sparkles,
  Check,
  LogOut,
  Layers,
} from 'lucide-react';
import Button from './Button';

export default function Navbar({
  selectedCity = 'Delhi NCR',
  onSelectCity,
  searchQuery = '',
  onSearchChange,
  onSelectCategory,
  onSignInClick,
  onHostEventClick,
  currentUser = null,
  onSignOut,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationToast, setLocationToast] = useState('');

  const cityModalRef = useRef(null);
  const categoriesRef = useRef(null);
  const userDropdownRef = useRef(null);

  const popularCities = [
    'All Cities',
    'Jaipur',
    'Delhi NCR',
    'Mumbai',
    'Bengaluru',
    'Pune',
    'Hyderabad',
    'Goa',
  ];

  const categoryItems = [
    {
      id: 'concerts',
      name: 'Concerts & Live Music',
      categoryValue: 'Concerts & Gigs',
      desc: 'Indie gigs, stadium tours, and acoustic evenings',
      icon: <Music className="w-4 h-4 text-terracotta" />,
    },
    {
      id: 'comedy',
      name: 'Standup Comedy',
      categoryValue: 'Standup Comedy',
      desc: 'Solo specials, open mics, and improv nights',
      icon: <Smile className="w-4 h-4 text-softButter" />,
    },
    {
      id: 'nightlife',
      name: 'Nightlife & Club Parties',
      categoryValue: 'Nightlife & Clubs',
      desc: 'DJ sets, techno arenas, and weekend clubbing',
      icon: <Flame className="w-4 h-4 text-terracotta" />,
    },
    {
      id: 'food',
      name: 'Food & Drink Festivals',
      categoryValue: 'Food & Drinks',
      desc: 'Craft beer galas, pop-up tastings, and chef hearths',
      icon: <Coffee className="w-4 h-4 text-softButter" />,
    },
    {
      id: 'theater',
      name: 'Theater & Cultural Arts',
      categoryValue: 'Theater & Arts',
      desc: 'Broadway musicals, classical recitals, and drama',
      icon: <Palette className="w-4 h-4 text-terracotta" />,
    },
    {
      id: 'workshops',
      name: 'Workshops & Masterclasses',
      categoryValue: 'Workshops',
      desc: 'Pottery, mixology, visual arts, and design sessions',
      icon: <Sparkles className="w-4 h-4 text-softButter" />,
    },
  ];

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (cityModalRef.current && !cityModalRef.current.contains(event.target)) {
        setCityModalOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setCategoriesOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setCityModalOpen(false);
        setCategoriesOpen(false);
        setUserDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleCitySelect = (city) => {
    if (onSelectCity) onSelectCity(city);
    setCityModalOpen(false);
    setLocationToast('');
  };

  const handleFindMyLocation = () => {
    setLocating(true);
    setLocationToast('Detecting location via browser GPS...');

    setTimeout(() => {
      setLocating(false);
      // Simulated GPS detection
      const detectedCity = 'Jaipur';
      if (onSelectCity) onSelectCity(detectedCity);
      setLocationToast(`Location identified: ${detectedCity} (Nearby)`);
      setTimeout(() => {
        setCityModalOpen(false);
        setLocationToast('');
      }, 1200);
    }, 900);
  };

  const handleCategoryClick = (categoryValue) => {
    if (onSelectCategory) {
      onSelectCategory(categoryValue);
    }
    setCategoriesOpen(false);
    setMobileMenuOpen(false);

    // Smooth scroll to events catalogue
    const catalogueEl = document.getElementById('events-catalogue');
    if (catalogueEl) {
      catalogueEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-darkRoast/95 backdrop-blur-md border-b border-elevatedBorder transition-all duration-200 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Left: Brand Logo + District-style Location Selector */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            {/* Brand Logo */}
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('main-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-terracotta to-clayBrown flex items-center justify-center border border-terracotta/40 shadow-dune-sm group-hover:scale-105 transition-transform">
                <Ticket className="w-4 h-4 text-softButter" />
              </div>
              <span className="font-serif font-black text-2xl tracking-wider text-softButter">
                Terra<span className="text-terracotta">Tix</span>
              </span>
            </a>

            {/* Location Selector (District.in Style) */}
            <div className="relative" ref={cityModalRef}>
              <button
                type="button"
                onClick={() => {
                  setCityModalOpen(!cityModalOpen);
                  setCategoriesOpen(false);
                  setUserDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-elevated hover:bg-elevatedBorder border border-elevatedBorder text-xs font-serif text-warmCream transition-all duration-150 cursor-pointer shadow-sm"
                aria-expanded={cityModalOpen}
                aria-label="Select City"
              >
                <MapPin className="w-3.5 h-3.5 text-terracotta shrink-0" />
                <span className="font-medium truncate max-w-[100px] sm:max-w-none">
                  {selectedCity}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-mutedClay transition-transform duration-200 ${
                    cityModalOpen ? 'rotate-180 text-softButter' : ''
                  }`}
                />
              </button>

              {/* Location Modal / Dropdown */}
              {cityModalOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-elevated border border-clayBrown/80 rounded-2xl shadow-dune-lg p-4 z-50 animate-fadeIn font-serif text-warmCream">
                  
                  {/* Top Action: Find My Location (District.in style) */}
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={handleFindMyLocation}
                      disabled={locating}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-darkRoast hover:bg-clayBrown/30 border border-clayBrown/60 text-xs text-softButter font-semibold transition-all shadow-inner group cursor-pointer"
                    >
                      <Navigation
                        className={`w-3.5 h-3.5 text-terracotta transition-transform group-hover:scale-110 ${
                          locating ? 'animate-spin' : ''
                        }`}
                      />
                      <span>
                        {locating ? 'Detecting Location...' : 'Find My Location'}
                      </span>
                    </button>

                    {locationToast && (
                      <p className="text-[11px] font-mono text-terracotta mt-1.5 text-center animate-fadeIn">
                        {locationToast}
                      </p>
                    )}
                  </div>

                  <div className="px-1 py-1 text-[10px] font-mono uppercase tracking-widest text-mutedClay border-b border-elevatedBorder mb-2.5">
                    Popular Cities in India
                  </div>

                  {/* Grid of Popular Cities */}
                  <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto no-scrollbar">
                    {popularCities.map((city) => {
                      const isSelected = selectedCity === city;
                      return (
                        <button
                          key={city}
                          type="button"
                          onClick={() => handleCitySelect(city)}
                          className={`w-full text-left px-3 py-2 text-xs rounded-lg font-serif flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-clayBrown text-softButter font-semibold shadow-sm'
                              : 'text-warmCream/85 hover:bg-elevatedBorder hover:text-softButter'
                          }`}
                        >
                          <span className="truncate">{city}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-softButter" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                placeholder="Search by artist, event, venue, or genre..."
                className="w-full bg-elevated text-xs font-serif text-warmCream placeholder-mutedClay/70 pl-9 pr-8 py-2.5 rounded-lg border border-elevatedBorder focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-colors shadow-inner"
              />
              <Search className="w-4 h-4 text-mutedClay absolute left-3 top-3 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange && onSearchChange('')}
                  className="absolute right-2.5 top-2.5 text-mutedClay hover:text-warmCream p-0.5 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Clean Navbar Links & Sign In CTA */}
          <div className="hidden lg:flex items-center gap-5 shrink-0">
            <nav className="flex items-center gap-5 text-xs font-serif">
              {/* Categories Mega-Menu Trigger */}
              <div className="relative" ref={categoriesRef}>
                <button
                  type="button"
                  onClick={() => {
                    setCategoriesOpen(!categoriesOpen);
                    setCityModalOpen(false);
                    setUserDropdownOpen(false);
                  }}
                  className={`flex items-center gap-1.5 py-1 transition-colors cursor-pointer ${
                    categoriesOpen ? 'text-softButter font-semibold' : 'text-mutedClay hover:text-warmCream'
                  }`}
                  aria-expanded={categoriesOpen}
                >
                  <Layers className="w-3.5 h-3.5 text-terracotta" />
                  <span>Categories</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      categoriesOpen ? 'rotate-180 text-softButter' : 'text-mutedClay'
                    }`}
                  />
                </button>

                {/* Categories Popover Card / Mega-Menu */}
                {categoriesOpen && (
                  <div className="absolute top-full right-0 mt-3 w-80 bg-elevated border border-clayBrown/80 rounded-2xl shadow-dune-lg p-2.5 z-50 animate-fadeIn font-serif">
                    <div className="px-3 py-2 border-b border-elevatedBorder text-[10px] font-mono uppercase tracking-widest text-mutedClay">
                      Explore By Medium
                    </div>

                    <div className="space-y-1 pt-1.5">
                      {categoryItems.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleCategoryClick(cat.categoryValue)}
                          className="w-full text-left p-2.5 rounded-xl hover:bg-clayBrown/25 border border-transparent hover:border-terracotta/40 transition-all flex items-start gap-3 group cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-darkRoast border border-elevatedBorder flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                            {cat.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-warmCream group-hover:text-softButter transition-colors truncate">
                              {cat.name}
                            </h4>
                            <p className="text-[11px] text-mutedClay/80 line-clamp-1 leading-snug">
                              {cat.desc}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Host an Event */}
              <button
                type="button"
                onClick={() => onHostEventClick && onHostEventClick()}
                className="flex items-center gap-1.5 text-mutedClay hover:text-softButter transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-terracotta" />
                <span>Host an Event</span>
              </button>
            </nav>

            {/* User Profile or Login CTA */}
            {currentUser ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 bg-elevated hover:bg-elevatedBorder border border-elevatedBorder px-3 py-1.5 rounded-lg text-xs font-serif text-warmCream cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-terracotta/30 border border-terracotta flex items-center justify-center text-[10px] font-mono text-softButter font-bold">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium truncate max-w-[120px]">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-mutedClay" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-elevated border border-clayBrown/80 rounded-xl shadow-dune-lg p-1.5 z-50 animate-fadeIn text-xs">
                    <div className="px-3 py-1.5 border-b border-elevatedBorder text-[10px] text-mutedClay font-mono truncate">
                      {currentUser.email}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        const el = document.getElementById('events-catalogue');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full text-left px-3 py-2 rounded text-warmCream hover:bg-elevatedBorder flex items-center gap-2 cursor-pointer"
                    >
                      <Ticket className="w-3.5 h-3.5 text-terracotta" />
                      <span>My Bookings</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        if (onSignOut) onSignOut();
                      }}
                      className="w-full text-left px-3 py-2 rounded text-terracotta hover:bg-elevatedBorder flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon={<User className="w-3.5 h-3.5" />}
                onClick={() => onSignInClick && onSignInClick()}
              >
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center gap-2">
            {!currentUser ? (
              <Button
                variant="primary"
                size="sm"
                className="text-xs px-2.5 py-1.5"
                onClick={() => onSignInClick && onSignInClick()}
              >
                Login
              </Button>
            ) : (
              <button
                type="button"
                onClick={() => onSignOut && onSignOut()}
                className="p-1.5 rounded-md bg-elevated border border-elevatedBorder text-xs text-softButter"
              >
                Sign Out
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-mutedClay hover:text-warmCream hover:bg-elevated border border-elevatedBorder cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input Row */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Search artist, event, venue..."
              className="w-full bg-elevated text-xs font-serif text-warmCream placeholder-mutedClay/70 pl-8 pr-3 py-2 rounded-lg border border-elevatedBorder focus:outline-none focus:border-terracotta"
            />
            <Search className="w-3.5 h-3.5 text-mutedClay absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-elevated border-b border-elevatedBorder px-4 pt-3 pb-6 space-y-4 animate-fadeIn font-serif">
          {/* Mobile Location Selector with Find My Location */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase text-mutedClay">Selected City</span>
              <button
                type="button"
                onClick={handleFindMyLocation}
                className="text-[11px] text-terracotta flex items-center gap-1 font-semibold"
              >
                <Navigation className="w-3 h-3" />
                <span>Find My Location</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {popularCities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    handleCitySelect(city);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-serif text-left cursor-pointer ${
                    selectedCity === city
                      ? 'bg-clayBrown text-softButter font-semibold'
                      : 'bg-darkRoast text-mutedClay hover:text-warmCream'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Categories in Mobile Menu */}
          <div className="pt-2 border-t border-elevatedBorder">
            <div className="text-[11px] font-mono uppercase text-mutedClay mb-2">Browse Categories</div>
            <div className="grid grid-cols-1 gap-1">
              {categoryItems.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.categoryValue)}
                  className="w-full text-left px-3 py-2 rounded text-xs text-warmCream hover:bg-elevatedBorder flex items-center gap-2.5 cursor-pointer"
                >
                  {cat.icon}
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Host an Event */}
          <div className="pt-2 border-t border-elevatedBorder">
            <button
              type="button"
              onClick={() => {
                onHostEventClick && onHostEventClick();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-serif text-terracotta hover:bg-elevatedBorder rounded flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Host an Event on TerraTix</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
