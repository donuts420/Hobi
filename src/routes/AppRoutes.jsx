import React from 'react';
import LandingPage from '../pages/LandingPage';
import CustomerProfilePage from '../pages/CustomerProfilePage';
import OrganiserProfilePage from '../pages/OrganiserProfilePage';
import EventCreationPage from '../pages/EventCreationPage';
import ETicketStub from '../components/cards/ETicketStub';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { ArrowLeft, Ticket, ShieldCheck, MapPin } from 'lucide-react';

/**
 * AppRoutes provides the client-side state-driven view routing for Hopi.
 * Handles 'events' (LandingPage), 'profile' (CustomerProfilePage), 'organiser-profile' (OrganiserProfilePage), and customer 'vault'.
 */
export default function AppRoutes({
  currentRoute = 'events',
  onNavigate,
  selectedCity = 'Delhi NCR',
  onSelectCity,
  searchQuery = '',
  selectedCategory = 'All',
  onSelectCategory,
  currentUser = null,
  onUserUpdate,
  onSignOut,
  onSignInClick,
}) {
  // Customer ticket passes state (shown after signing in)
  const mockVaultTickets = [
    {
      id: 'HOPI-9481-JPR',
      eventTitle: 'Prateek Kuhad — Silhouettes Acoustic India Tour',
      tierName: 'Gold Fan Pit',
      date: 'Sat, 28 Nov 2026',
      time: '07:00 PM onwards',
      venue: 'Jawahar Kala Kendra Amphitheatre',
      city: 'Jaipur, India',
      attendeeName: 'Aarav Sharma',
      gate: 'Gate B (Fan Pit)',
      seat: 'Front Pit • 2 Guests',
      code: 'HOPI-9481',
    },
    {
      id: 'HOPI-4420-BOM',
      eventTitle: 'Zakir Khan Live — Haq Se Single 2.0 Comedy Special',
      tierName: 'Ground Floor Classic',
      date: 'Sun, 06 Dec 2026',
      time: '06:30 PM & 09:00 PM',
      venue: 'Shanmukhananda Hall',
      city: 'Mumbai, India',
      attendeeName: 'Aarav Sharma',
      gate: 'Main Auditorium Foyer',
      seat: 'Row H, Seats 14-15',
      code: 'HOPI-4420',
    },
  ];

  if (currentRoute === 'profile') {
    return (
      <CustomerProfilePage
        currentUser={currentUser}
        onNavigate={onNavigate}
        onUserUpdate={onUserUpdate}
        onSignOut={onSignOut}
        onSignInClick={onSignInClick}
        selectedCity={selectedCity}
        onSelectCity={onSelectCity}
      />
    );
  }

  if (currentRoute === 'organiser-profile') {
    return (
      <OrganiserProfilePage
        currentUser={currentUser}
        onNavigate={onNavigate}
        onUserUpdate={onUserUpdate}
        onSignOut={onSignOut}
        onSignInClick={onSignInClick}
        selectedCity={selectedCity}
        onSelectCity={onSelectCity}
      />
    );
  }

  if (currentRoute === 'create-event') {
    return (
      <EventCreationPage
        currentUser={currentUser}
        onNavigate={onNavigate}
        selectedCity={selectedCity}
        onSelectCity={onSelectCity}
      />
    );
  }

  if (currentRoute === 'vault') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 min-h-screen">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-elevatedBorder">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="butter" size="sm">
                Verified Account
              </Badge>
              <span className="text-xs font-mono text-mutedClay">2 Active Bookings</span>
            </div>
            <h1 className="text-3xl font-serif font-black text-softButter mt-2">
              My Bookings & E-Tickets
            </h1>
            <p className="text-xs text-mutedClay mt-1">
              Your confirmed digital passes with entry QR codes ready for contactless venue check-in.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => onNavigate && onNavigate('events')}
          >
            Back to Explore Events
          </Button>
        </div>

        <div className="space-y-12">
          {mockVaultTickets.map((ticket) => (
            <div key={ticket.id} className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-mutedClay px-2">
                <span>BOOKING ID: {ticket.id}</span>
                <span className="text-softButter">CONFIRMED PASS</span>
              </div>
              <ETicketStub ticket={ticket} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: LandingPage
  return (
    <LandingPage
      selectedCity={selectedCity}
      onSelectCity={onSelectCity}
      searchQuery={searchQuery}
      selectedCategory={selectedCategory}
      onSelectCategory={onSelectCategory}
      currentUser={currentUser}
      onSignInClick={onSignInClick}
    />
  );
}
