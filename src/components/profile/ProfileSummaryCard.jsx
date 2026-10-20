import React from 'react';
import { Calendar, MapPin, ShieldCheck, ArrowLeft, LogOut, User, Briefcase } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

/**
 * ProfileSummaryCard renders the left-hand column summary card for the Hopi customer profile.
 * Displays genuine user attributes (initials avatar, name, email, member-since if available).
 */
export default function ProfileSummaryCard({
  currentUser,
  onNavigate,
  onSignOut,
}) {
  const name = currentUser?.name || 'Hopi Guest';
  const email = currentUser?.email || 'No email provided';
  const initial = (name || 'C').charAt(0).toUpperCase();

  // Safely format member-since date if genuine createdAt is available
  let memberSinceText = null;
  if (currentUser?.createdAt) {
    try {
      const date = new Date(currentUser.createdAt);
      if (!isNaN(date.getTime())) {
        memberSinceText = `Member since ${date.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        })}`;
      }
    } catch {
      memberSinceText = null;
    }
  }

  // Shortened user identifier
  const shortId = currentUser?.id ? `${currentUser.id.slice(0, 8)}...` : null;

  return (
    <aside className="bg-elevated border border-clayBrown/40 rounded-2xl p-6 sm:p-7 text-warmCream shadow-dune-md flex flex-col justify-between space-y-6">
      <div className="space-y-6">
        {/* Top: Avatar & Name */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-clayBrown/60 border-2 border-terracotta text-softButter text-2xl font-serif font-black flex items-center justify-center shadow-dune-sm">
              {initial}
            </div>
            <span
              className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-darkRoast border border-terracotta flex items-center justify-center"
              title="Verified Attendee"
            >
              <ShieldCheck className="w-3 h-3 text-softButter" />
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-black text-softButter mt-4 tracking-tight">
            {name}
          </h2>

          <p className="text-xs font-mono text-mutedClay mt-1 break-all select-text">
            {email}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <Badge variant="butter" size="sm">
              Attendee Account
            </Badge>
            {currentUser?.preferredCity && (
              <Badge variant="outline" size="sm">
                {currentUser.preferredCity}
              </Badge>
            )}
          </div>
        </div>

        {/* Account Metadata Row */}
        <div className="pt-4 border-t border-elevatedBorder/80 space-y-2.5 text-xs text-mutedClay font-serif">
          {memberSinceText && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-terracotta shrink-0" />
              <span>{memberSinceText}</span>
            </div>
          )}

          {shortId && (
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <User className="w-4 h-4 text-terracotta shrink-0" />
              <span className="text-mutedClay">ID:</span>
              <span className="text-softButter">{shortId}</span>
            </div>
          )}

          {currentUser?.preferredCity && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-terracotta shrink-0" />
              <span>Primary Hub: <strong className="text-warmCream">{currentUser.preferredCity}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Card Actions */}
      <div className="pt-4 border-t border-elevatedBorder/80 space-y-2">
        {onNavigate && (
          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-center text-xs"
            icon={<Briefcase className="w-3.5 h-3.5 text-terracotta" />}
            onClick={() => onNavigate('organiser-profile')}
          >
            Switch to Organiser Portal
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-center"
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
