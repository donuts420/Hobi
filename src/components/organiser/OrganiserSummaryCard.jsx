import React from 'react';
import { Building2, MapPin, Mail, ArrowLeft, User, LogOut } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

/**
 * OrganiserSummaryCard renders the left-hand column summary card for the Hopi Organiser Profile.
 * Displays brand identity (monogram, organization name, primary operating city, and navigation shortcuts).
 * Strictly avoids fake verification checkmarks, badges, or fabricated metrics.
 */
export default function OrganiserSummaryCard({
  currentUser,
  onNavigate,
  onSignOut,
}) {
  const meta = currentUser?.userMetadata || {};
  const orgName = meta.organization_name || currentUser?.name || 'Hopi Organiser';
  const email = meta.business_email || currentUser?.email || 'No email provided';
  const city = meta.preferred_city || currentUser?.preferredCity || null;
  const initial = orgName.charAt(0).toUpperCase() || 'O';

  return (
    <aside className="bg-elevated border border-clayBrown/40 rounded-2xl p-6 sm:p-7 text-warmCream shadow-dune-md flex flex-col justify-between space-y-6">
      <div className="space-y-6">
        {/* Top: Avatar & Organization Name */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-clayBrown/60 border-2 border-terracotta text-softButter text-2xl font-serif font-black flex items-center justify-center shadow-dune-sm">
            {initial}
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-black text-softButter mt-4 tracking-tight">
            {orgName}
          </h2>

          <p className="text-xs font-mono text-mutedClay mt-1 break-all select-text">
            {email}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <Badge variant="butter" size="sm">
              Organiser Profile
            </Badge>
            {city && (
              <Badge variant="outline" size="sm">
                {city}
              </Badge>
            )}
          </div>
        </div>

        {/* Brand Information Metadata */}
        <div className="pt-4 border-t border-elevatedBorder/80 space-y-2.5 text-xs text-mutedClay font-serif">
          {city && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-terracotta shrink-0" />
              <span>Base Hub: <strong className="text-warmCream">{city}</strong></span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-terracotta shrink-0" />
            <span>Hosting Identity: <strong className="text-warmCream font-mono text-[11px]">{currentUser?.email || 'Active Account'}</strong></span>
          </div>
        </div>
      </div>

      {/* Navigation Shortcuts */}
      <div className="pt-4 border-t border-elevatedBorder/80 space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-center"
          icon={<User className="w-3.5 h-3.5 text-terracotta" />}
          onClick={() => onNavigate && onNavigate('profile')}
        >
          Switch to Attendee Profile
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center text-warmCream hover:text-softButter"
          icon={<ArrowLeft className="w-3.5 h-3.5" />}
          onClick={() => onNavigate && onNavigate('events')}
        >
          Explore Live Events
        </Button>

        {onSignOut && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-terracotta hover:text-terracottaHover"
            icon={<LogOut className="w-3.5 h-3.5" />}
            onClick={onSignOut}
          >
            Sign Out
          </Button>
        )}
      </div>
    </aside>
  );
}
