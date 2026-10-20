import React, { useEffect, useState } from 'react';
import {
  Building2,
  CalendarPlus,
  Bell,
  Landmark,
  ArrowLeft,
  ShieldAlert,
  LogIn,
  User,
  Phone,
} from 'lucide-react';
import Button from '../components/common/Button';
import OrganiserSummaryCard from '../components/organiser/OrganiserSummaryCard';
import OrganizationDetailsTab from '../components/organiser/OrganizationDetailsTab';
import HostedEventsTab from '../components/organiser/HostedEventsTab';
import OrganiserNotificationsTab from '../components/organiser/OrganiserNotificationsTab';
import PayoutSettingsTab from '../components/organiser/PayoutSettingsTab';
import { supabase } from '../lib/supabase';

/**
 * OrganiserProfilePage renders the Hopi event host & brand profile portal.
 * Mixed-theme: Warm cream background (#FAF0D7) with deep elevated dark-brown panels (#241B18).
 * Two-column desktop layout that stacks cleanly on mobile devices.
 */
export default function OrganiserProfilePage({
  currentUser,
  initialTab,
  onNavigate,
  onUserUpdate,
  onSignOut,
  onSignInClick,
  selectedCity = 'Delhi NCR',
  onSelectCity,
}) {
  const [profileRole, setProfileRole] = useState(null);
  const [profileLoading, setProfileLoading] = useState(Boolean(currentUser?.id));
  const [profileLoadError, setProfileLoadError] = useState('');
  const [organizerName, setOrganizerName] = useState(currentUser?.name || '');
  const [organizerPhone, setOrganizerPhone] = useState(currentUser?.phone || '');
  const [organizerSubmitting, setOrganizerSubmitting] = useState(false);
  const [organizerError, setOrganizerError] = useState('');

  const [activeTab, setActiveTab] = useState(() => {
    if (['details', 'events', 'notifications', 'payout'].includes(initialTab)) return initialTab;
    try {
      const p = new URLSearchParams(window.location.search);
      const tabParam = p.get('tab');
      return ['details', 'events', 'notifications', 'payout'].includes(tabParam)
        ? tabParam
        : 'details';
    } catch {
      return 'details';
    }
  });

  const tabs = [
    {
      id: 'details',
      label: 'Organization Details',
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: 'events',
      label: 'Hosted Events',
      icon: <CalendarPlus className="w-4 h-4" />,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-4 h-4" />,
    },
    {
      id: 'payout',
      label: 'Payout Setup',
      icon: <Landmark className="w-4 h-4" />,
    },
  ];

  useEffect(() => {
    let cancelled = false;
    if (!currentUser?.id) {
      setProfileLoading(false);
      setProfileRole(null);
      return () => { cancelled = true; };
    }

    setProfileLoading(true);
    setProfileLoadError('');
    supabase
      .from('profiles')
      .select('role, full_name, phone')
      .eq('id', currentUser.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setProfileLoadError('We could not load your account role. Please refresh and try again.');
        } else {
          setProfileRole(data?.role || 'customer');
          setOrganizerName(data?.full_name || currentUser.name || '');
          setOrganizerPhone(data?.phone || currentUser.phone || '');
          if (data?.full_name || data?.phone) {
            onUserUpdate?.({
              name: data?.full_name || currentUser.name,
              phone: data?.phone || currentUser.phone || '',
            });
          }
        }
        setProfileLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setProfileLoadError('We could not load your account role. Please refresh and try again.');
        setProfileLoading(false);
      });

    return () => { cancelled = true; };
  }, [currentUser?.id, currentUser?.name, currentUser?.phone]);

  const handleOrganizerSignup = async (event) => {
    event.preventDefault();
    setOrganizerError('');
    const name = organizerName.trim();
    const phone = organizerPhone.trim();
    const phoneDigits = phone.replace(/\D/g, '').length;
    if (name.length < 2 || name.length > 100) {
      setOrganizerError('Enter a name between 2 and 100 characters.');
      return;
    }
    if (phoneDigits < 7 || phoneDigits > 15) {
      setOrganizerError('Enter a phone number with 7 to 15 digits.');
      return;
    }

    setOrganizerSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('become_organizer', {
        p_full_name: name,
        p_phone: phone,
      });
      if (error) throw error;
      setProfileRole(data || 'organizer');
      setOrganizerName(name);
      setOrganizerPhone(phone);
      setActiveTab('events');
      onUserUpdate?.({ name, phone });
    } catch (error) {
      setOrganizerError(error.message || 'Organizer setup could not be completed. Please try again.');
    } finally {
      setOrganizerSubmitting(false);
    }
  };

  // Unauthenticated State
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-warmCream text-darkRoast font-serif py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-elevated border border-clayBrown/50 rounded-2xl p-8 sm:p-10 text-center text-warmCream shadow-dune-lg space-y-6">
          <div className="w-16 h-16 rounded-full bg-clayBrown/30 border border-terracotta/60 text-softButter flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-terracotta" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-bold text-softButter">
              Sign In Required
            </h2>
            <p className="text-xs sm:text-sm text-mutedClay leading-relaxed">
              Please sign in with your Hopi account to configure your organizer brand profile, manage hosted events, and review settlement settings.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center"
              icon={<LogIn className="w-4 h-4" />}
              onClick={() => onSignInClick && onSignInClick()}
            >
              Sign In to Hopi
            </Button>

            <Button
              variant="outline"
              size="md"
              className="w-full justify-center"
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => onNavigate && onNavigate('events')}
            >
              Return to Explore Events
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (profileLoading || profileLoadError) {
    return (
      <div className="min-h-screen bg-warmCream text-darkRoast font-serif py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-elevated border border-clayBrown/50 rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-xl font-bold text-softButter">Organizer account</h2>
          <p className="text-sm text-mutedClay" role={profileLoadError ? 'alert' : undefined}>
            {profileLoadError || 'Checking your account…'}
          </p>
          {profileLoadError && (
            <Button variant="outline" onClick={() => window.location.reload()}>Refresh</Button>
          )}
        </div>
      </div>
    );
  }

  if (!['organizer', 'administrator'].includes(profileRole)) {
    return (
      <div className="min-h-screen bg-warmCream text-darkRoast font-serif py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <form onSubmit={handleOrganizerSignup} className="max-w-lg w-full bg-elevated border border-clayBrown/50 rounded-2xl p-7 sm:p-9 text-warmCream shadow-dune-lg space-y-6">
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-terracotta">Hopi for Hosts</span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-softButter">Become an organizer</h1>
            <p className="text-sm text-mutedClay">Add your contact details to start creating and publishing events.</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="organizer-name" className="block text-xs uppercase tracking-wider text-mutedClay">Your name</label>
            <input id="organizer-name" required minLength={2} maxLength={100} autoComplete="name" value={organizerName} onChange={(e) => setOrganizerName(e.target.value)} className="w-full bg-darkRoast text-warmCream px-3.5 py-3 rounded-lg border border-elevatedBorder focus:outline-none focus:border-terracotta" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="organizer-email" className="block text-xs uppercase tracking-wider text-mutedClay">Account email</label>
            <input id="organizer-email" type="email" value={currentUser.email || ''} readOnly className="w-full bg-darkRoast/70 text-mutedClay px-3.5 py-3 rounded-lg border border-elevatedBorder" />
            <p className="text-[11px] text-mutedClay">Your existing sign-in email will be used. Verify it through your Hopi account first.</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="organizer-phone" className="block text-xs uppercase tracking-wider text-mutedClay">Phone number</label>
            <div className="relative">
              <input id="organizer-phone" type="tel" required autoComplete="tel" value={organizerPhone} onChange={(e) => setOrganizerPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full bg-darkRoast text-warmCream px-3.5 py-3 pr-10 rounded-lg border border-elevatedBorder focus:outline-none focus:border-terracotta" />
              <Phone className="w-4 h-4 text-mutedClay absolute right-3 top-3.5" aria-hidden="true" />
            </div>
            <p className="text-[11px] text-mutedClay">We’ll save this as your organizer contact number. SMS verification isn’t enabled yet.</p>
          </div>

          {organizerError && <p role="alert" className="text-sm text-red-300">{organizerError}</p>}

          <Button type="submit" className="w-full" disabled={organizerSubmitting}>
            {organizerSubmitting ? 'Setting up your organizer account…' : 'Continue as an organizer'}
          </Button>
          <button type="button" onClick={() => onNavigate?.('events')} className="w-full text-sm text-mutedClay hover:text-warmCream">Back to events</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warmCream text-darkRoast font-serif py-10 px-4 sm:px-6 lg:px-8 select-text">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Breadcrumb & Page Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-clayBrown/20">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-clayBrown font-semibold">
                Account & Brand Settings
              </span>
              <span className="text-clayBrown/40">•</span>
              <span className="text-[11px] font-mono text-clayBrown">
                Organiser Portal
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-darkRoast tracking-tight">
              Organiser Profile & Settings
            </h1>
            <p className="text-xs sm:text-sm text-clayBrown/80 max-w-xl">
              Manage your event hosting identity, attendee support coordinates, and settlement preferences.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              id="switch-to-attendee-btn"
              onClick={() => onNavigate && onNavigate('profile')}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-serif font-bold border border-clayBrown/40 bg-warmCream text-darkRoast hover:bg-clayBrown/10 transition-all cursor-pointer"
            >
              <User className="w-4 h-4 text-terracotta shrink-0" />
              <span>Attendee Profile</span>
            </button>

            <button
              type="button"
              id="back-to-explore-btn"
              onClick={() => onNavigate && onNavigate('events')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-serif font-bold border border-clayBrown/60 bg-warmCream text-darkRoast hover:bg-clayBrown/10 hover:border-clayBrown transition-all cursor-pointer shadow-dune-sm"
            >
              <ArrowLeft className="w-4 h-4 text-terracotta shrink-0" />
              <span>Back to Explore</span>
            </button>
          </div>
        </div>

        {/* Two-Column Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Organiser Summary Card */}
          <div className="lg:col-span-4 w-full">
            <OrganiserSummaryCard
              currentUser={currentUser}
              onNavigate={onNavigate}
              onSignOut={onSignOut}
            />
          </div>

          {/* Right Column: Tabbed Settings Container */}
          <div className="lg:col-span-8 w-full space-y-4">
            {/* Horizontal Tabs Rail */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar" role="tablist">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`organiser-tab-${tab.id}`}
                    role="tab"
                    aria-selected={isActive}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2.5 rounded-xl font-serif text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-elevated text-softButter border border-terracotta shadow-dune-sm'
                        : 'bg-elevated/80 text-warmCream/80 hover:bg-elevated hover:text-softButter border border-transparent'
                    }`}
                  >
                    <span className={isActive ? 'text-terracotta' : 'text-mutedClay'}>
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Tab Card Content */}
            <div className="bg-elevated border border-clayBrown/40 rounded-2xl p-6 sm:p-8 text-warmCream shadow-dune-md">
              {activeTab === 'details' && (
                <OrganizationDetailsTab
                  currentUser={currentUser}
                  onUserUpdate={onUserUpdate}
                  selectedCity={selectedCity}
                  onSelectCity={onSelectCity}
                />
              )}

              {activeTab === 'events' && (
                <HostedEventsTab currentUser={currentUser} onNavigate={onNavigate} />
              )}

              {activeTab === 'notifications' && (
                <OrganiserNotificationsTab
                  currentUser={currentUser}
                  onUserUpdate={onUserUpdate}
                />
              )}

              {activeTab === 'payout' && (
                <PayoutSettingsTab onNavigate={onNavigate} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
