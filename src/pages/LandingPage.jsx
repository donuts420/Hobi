import React, { useState, useEffect } from 'react';
import { Sparkles, Compass, Filter, ShieldCheck, Ticket, Calendar, X, Check, MapPin, TrendingUp, Flame, ArrowRight } from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import MarqueeStrip from '../components/bits/MarqueeStrip';
import EventCard from '../components/cards/EventCard';
import TicketTierCard from '../components/cards/TicketTierCard';
import DepthCarousel from '../components/bits/DepthCarousel';
import AccordionGallery from '../components/bits/AccordionGallery';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function LandingPage({
  selectedCity = 'Delhi NCR',
  onSelectCity,
  searchQuery = '',
  selectedCategory: propCategory,
  onSelectCategory: propOnSelectCategory,
  currentUser = null,
  onSignInClick,
}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [internalCategory, setInternalCategory] = useState('All');
  const selectedCategory = propCategory !== undefined ? propCategory : internalCategory;
  const setSelectedCategory = propOnSelectCategory || setInternalCategory;
  const [activeEvent, setActiveEvent] = useState(null);
  const [selectedTiers, setSelectedTiers] = useState({});
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [activeSpotlightIndex, setActiveSpotlightIndex] = useState(0);

  // Load published events from Supabase or fallback to /mock/events.json
  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('events')
            .select('id, title, category, description, starts_at, venue, city, banner_image_url, rating, review_count, ticket_types(name, price_inr, available_quantity, perks)')
            .eq('status', 'published')
            .order('starts_at');

          if (!cancelled && !error && Array.isArray(data) && data.length > 0) {
            setEvents(data.map((event) => {
              const ticketTypes = event.ticket_types || [];
              const startsAt = new Date(event.starts_at);
              return {
                ...event,
                date: startsAt.toLocaleDateString(),
                time: startsAt.toLocaleTimeString(),
                priceStartingFrom: ticketTypes.length
                  ? Math.min(...ticketTypes.map((tier) => Number(tier.price_inr)))
                  : 0,
                bannerImage: event.banner_image_url,
                reviewCount: event.review_count,
                ticketTypes: ticketTypes.map((tier) => ({
                  ...tier,
                  price: Number(tier.price_inr),
                  availableQuantity: tier.available_quantity,
                  perks: Array.isArray(tier.perks) ? tier.perks : [],
                })),
              };
            }));
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Supabase fetch failed, falling back to mock events:', err);
        }
      }

      // Fallback to local static mock dataset
      try {
        const res = await fetch('/mock/events.json');
        if (res.ok) {
          const mockData = await res.json();
          if (!cancelled) {
            setEvents(mockData);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not load mock events:', err);
      }

      if (!cancelled) {
        setLoading(false);
      }
    }

    loadEvents();
    return () => { cancelled = true; };
  }, []);

  const categories = [
    'All',
    'Concerts & Gigs',
    'Standup Comedy',
    'Nightlife & Clubs',
    'Food & Drinks',
    'Theater & Arts',
    'Workshops',
  ];

  // Multi-dimensional filtering by Category, City, and Search query
  const filteredEvents = events.filter((e) => {
    // Category match
    const matchesCategory =
      selectedCategory === 'All' || e.category === selectedCategory;

    // City match (if not 'All Cities')
    const matchesCity =
      !selectedCity || selectedCity === 'All Cities' || e.city.toLowerCase() === selectedCity.toLowerCase();

    // Search query match (title, artist, venue, category, city)
    const matchesSearch =
      !searchQuery.trim() ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesCity && matchesSearch;
  });

  const spotlightEvent = events[activeSpotlightIndex] || events[0];

  const handleSelectEvent = (event) => {
    setActiveEvent(event);
    setSelectedTiers({});
    setBookingSuccess(null);
  };

  const handleTierQuantityChange = (tierName, qty) => {
    setSelectedTiers((prev) => ({
      ...prev,
      [tierName]: qty,
    }));
  };

  // Calculate order total in INR
  const totalAmount = activeEvent
    ? (activeEvent.ticketTypes || []).reduce((acc, tier) => {
        const qty = selectedTiers[tier.name] || 0;
        return acc + tier.price * qty;
      }, 0)
    : 0;

  const totalTicketsCount = Object.values(selectedTiers).reduce((a, b) => a + b, 0);

  const handleConfirmBooking = () => {
    if (totalTicketsCount === 0 || !activeEvent) return;
    if (!currentUser) {
      setActiveEvent(null);
      onSignInClick?.();
      return;
    }
    const tierName = Object.keys(selectedTiers).find((k) => selectedTiers[k] > 0);
    const bookingRef = `HOPI-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingSuccess({
      ref: bookingRef,
      eventTitle: activeEvent.title,
      tierName: tierName || 'General Entry',
      count: totalTicketsCount,
      total: totalAmount,
    });
  };

  return (
    <div className="min-h-screen bg-darkRoast text-warmCream font-serif pb-24">
      {/* Top Live Ticker Strip */}
      <MarqueeStrip />

      {/* Hero Section (District-style Discovery) */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-terracotta/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-elevated border border-clayBrown/60 text-xs font-serif text-softButter shadow-dune-sm">
            <Sparkles className="w-3.5 h-3.5 text-terracotta animate-pulse" />
            <span>Discover Top Experiences in {selectedCity}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-softButter tracking-tight leading-[1.15]">
            Live the Moment. <span className="text-terracotta italic font-normal">Find Your Next Event.</span>
          </h1>

          <p className="text-base sm:text-lg text-warmCream/90 max-w-2xl mx-auto leading-relaxed">
            Book tickets to top music festivals, comedy nights, intimate gigs, and food pop-ups across your city.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              icon={<TrendingUp className="w-4 h-4" />}
              onClick={() => {
                document.getElementById('events-catalogue')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Explore Events
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                document.getElementById('weekend-spotlight')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Weekend Highlights
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Filter Chips Directly Below Hero */}
      <section id="categories-bar" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-elevated/70 border border-elevatedBorder p-3 sm:p-4 rounded-xl shadow-dune-sm">
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-elevatedBorder/70 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-terracotta" />
              <span className="text-xs uppercase tracking-wider font-semibold text-softButter">
                Browse by Category
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-mutedClay font-mono">
              <span>City: <strong className="text-softButter">{selectedCity}</strong></span>
              <span>•</span>
              <span>{filteredEvents.length} Events Available</span>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 no-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-serif text-xs whitespace-nowrap transition-all duration-200 ${
                    isSelected
                      ? 'bg-clayBrown text-softButter border border-clayBrown shadow-dune-sm font-semibold'
                      : 'bg-darkRoast text-mutedClay border border-elevatedBorder hover:text-warmCream hover:border-clayBrown/60'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Weekend Spotlight / Featured Highlights (Replaces old Perforated Stub) */}
      <section id="weekend-spotlight" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-elevatedBorder">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-terracotta mb-1">
              <Flame className="w-3.5 h-3.5" />
              <span>Trending Spotlight</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-softButter">
              Explore Events
            </h2>
          </div>
          <span className="hidden sm:inline-block text-xs text-mutedClay">
            Handpicked by Hopi editors
          </span>
        </div>

        {loading ? <p className="py-12 text-center text-sm text-mutedClay">Loading events...</p> : events.length > 0 && <>
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] items-center gap-6 lg:gap-10">
          <div className="h-[360px] sm:h-[400px] relative">
            <DepthCarousel
              items={events.map((event) => ({ image: event.bannerImage, alt: event.title }))}
              cardWidth={340}
              cardHeight={360}
              radius={18}
              tint="#181210"
              depth={150}
              spread={60}
              tilt={16}
              visibleCards={4}
              falloff={0.18}
              blur={4}
              autoplay={false}
              loop
              onChange={setActiveSpotlightIndex}
            />
          </div>
          {spotlightEvent && <div className="bg-elevated border border-elevatedBorder rounded-xl p-5 sm:p-6 shadow-dune-md space-y-4">
            <Badge variant="terracotta" size="sm">{spotlightEvent.category}</Badge>
            <div>
              <p className="text-xs font-mono text-terracotta mb-1">{spotlightEvent.date} · {spotlightEvent.city}</p>
              <h3 className="text-xl font-bold text-softButter">{spotlightEvent.title}</h3>
              <p className="text-sm text-mutedClay mt-2">{spotlightEvent.venue}</p>
            </div>
            {spotlightEvent.description && <p className="text-xs text-warmCream/80 line-clamp-3">{spotlightEvent.description}</p>}
            <div className="flex items-center justify-between border-t border-elevatedBorder pt-4">
              <span className="font-mono text-sm text-softButter">From ₹{spotlightEvent.priceStartingFrom.toLocaleString('en-IN')}</span>
              <Button variant="primary" size="sm" onClick={() => handleSelectEvent(spotlightEvent)} icon={<ArrowRight className="w-4 h-4" />}>
                View Tickets
              </Button>
            </div>
          </div>}
          </div>
        </>}

      </section>

      {/* Main Events Catalogue Grid */}
      <section id="events-catalogue" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-elevatedBorder">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-softButter">
              All Upcoming Events {selectedCity !== 'All Cities' ? `in ${selectedCity}` : ''}
            </h2>
            <p className="text-xs text-mutedClay mt-1">
              Select any event to view ticket categories, perks, and secure passes.
            </p>
          </div>
          {searchQuery && (
            <div className="text-xs text-softButter bg-clayBrown/40 px-3 py-1 rounded border border-clayBrown font-mono">
              Filtered by: "{searchQuery}"
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center font-serif text-mutedClay">
            <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>Loading live events catalogue...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center bg-elevated rounded-xl border border-elevatedBorder max-w-xl mx-auto space-y-4">
            <p className="text-warmCream font-serif text-lg">No events found matching your criteria.</p>
            <p className="text-xs text-mutedClay">
              Try switching your city or choosing "All Cities" in the navigation bar.
            </p>
            {onSelectCity && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectCity('All Cities')}
              >
                Show All Cities
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((evt) => (
              <EventCard
                key={evt.id}
                event={evt}
                onSelect={(selected) => handleSelectEvent(selected)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Interactive Booking Drawer / Modal */}
      {activeEvent && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-darkRoast/85 backdrop-blur-md animate-fadeIn">
          <div role="dialog" aria-modal="true" aria-labelledby="booking-event-title" className="bg-elevated border border-clayBrown max-w-2xl w-full rounded-2xl shadow-dune-lg overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-elevatedBorder flex items-start justify-between bg-darkRoast/80">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-black/60 text-softButter border border-white/10">
                  {activeEvent.category}
                </span>
                <h3 id="booking-event-title" className="font-serif font-bold text-xl sm:text-2xl text-softButter">
                  {activeEvent.title}
                </h3>
                <p className="text-xs text-mutedClay flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-terracotta shrink-0" />
                  <span>{activeEvent.venue}, {activeEvent.city} • {activeEvent.date}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveEvent(null)}
                className="p-2 rounded-lg bg-elevated border border-elevatedBorder text-mutedClay hover:text-warmCream transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Ticket Tier Cards */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {!bookingSuccess && (
                <AccordionGallery
                  items={(Array.isArray(activeEvent.galleryImages) && activeEvent.galleryImages.length ? activeEvent.galleryImages : [{ src: activeEvent.bannerImage, alt: activeEvent.title }]).map((photo) => ({
                    image: photo.image || photo.src,
                    label: photo.label || photo.alt || activeEvent.title,
                    alt: photo.alt || activeEvent.title,
                  }))}
                  accentColor="#D36135"
                  overlayColor="#181210"
                  textColor="#FFF1A6"
                  height={220}
                  defaultIndex={0}
                  trigger="click"
                />
              )}
              {bookingSuccess ? (
                <div className="bg-darkRoast border border-clayBrown rounded-xl p-6 text-center space-y-4 animate-fadeIn">
                  <div className="w-12 h-12 bg-terracotta/20 border border-terracotta text-terracotta rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6 text-softButter" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-xl text-softButter">
                      Booking Confirmed!
                    </h4>
                    <p className="text-xs text-mutedClay mt-1">
                      Your booking reference is <strong className="text-softButter font-mono">{bookingSuccess.ref}</strong>
                    </p>
                  </div>
                  <div className="bg-elevated p-4 rounded-lg border border-elevatedBorder text-xs text-left space-y-2">
                    <div className="flex justify-between">
                      <span className="text-mutedClay">Event:</span>
                      <span className="text-softButter font-semibold">{bookingSuccess.eventTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mutedClay">Pass Type:</span>
                      <span className="text-warmCream">{bookingSuccess.tierName} ({bookingSuccess.count} Guest)</span>
                    </div>
                    <div className="flex justify-between border-t border-elevatedBorder pt-2">
                      <span className="text-mutedClay">Amount Paid:</span>
                      <span className="text-softButter font-mono font-bold">₹{bookingSuccess.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-mutedClay">
                    ✓ E-ticket with QR code sent via WhatsApp & Email. No printouts needed!
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => setActiveEvent(null)}
                  >
                    Done & Return to Events
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-sm uppercase tracking-wider text-softButter font-semibold">
                      Select Tickets
                    </h4>
                    <span className="text-xs text-mutedClay">All prices inclusive of taxes</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {(activeEvent.ticketTypes || []).length ? activeEvent.ticketTypes.map((tier) => (
                      <TicketTierCard
                        key={tier.name}
                        tier={tier}
                        quantity={selectedTiers[tier.name] || 0}
                        onQuantityChange={(qty) => handleTierQuantityChange(tier.name, qty)}
                      />
                    )) : <p className="rounded-lg border border-elevatedBorder bg-darkRoast/60 p-4 text-sm text-mutedClay">Ticket pricing is not available for this event yet.</p>}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer: Total & Checkout Button */}
            {!bookingSuccess && (
              <div className="p-5 sm:p-6 border-t border-elevatedBorder bg-darkRoast/90 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase text-mutedClay block">
                    Total Amount ({totalTicketsCount} Tickets)
                  </span>
                  <span className="font-mono font-bold text-2xl text-softButter">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="md" onClick={() => setActiveEvent(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    disabled={totalTicketsCount === 0}
                    onClick={handleConfirmBooking}
                    icon={<Ticket className="w-4 h-4" />}
                  >
                    Confirm & Book
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
