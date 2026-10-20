import React, { useState } from 'react';
import {
  Building2,
  CalendarPlus,
  Bell,
  Landmark,
  ArrowLeft,
  ShieldAlert,
  LogIn,
  User,
} from 'lucide-react';
import Button from '../components/common/Button';
import OrganiserSummaryCard from '../components/organiser/OrganiserSummaryCard';
import OrganizationDetailsTab from '../components/organiser/OrganizationDetailsTab';
import HostedEventsTab from '../components/organiser/HostedEventsTab';
import OrganiserNotificationsTab from '../components/organiser/OrganiserNotificationsTab';
import PayoutSettingsTab from '../components/organiser/PayoutSettingsTab';

/**
 * OrganiserProfilePage renders the Hopi event host & brand profile portal.
 * Mixed-theme: Warm cream background (#FAF0D7) with deep elevated dark-brown panels (#241B18).
 * Two-column desktop layout that stacks cleanly on mobile devices.
 */
export default function OrganiserProfilePage({
  currentUser,
  onNavigate,
  onUserUpdate,
  onSignOut,
  onSignInClick,
  selectedCity = 'Delhi NCR',
  onSelectCity,
}) {
  const [activeTab, setActiveTab] = useState(() => {
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
                <PayoutSettingsTab />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
