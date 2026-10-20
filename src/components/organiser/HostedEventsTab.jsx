import React from 'react';
import { CalendarPlus, Sparkles, Layers, Clock } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';

/**
 * HostedEventsTab renders the organiser's event management section.
 * Honestly presents an empty state since event ownership/creation is not yet implemented (Priority 3).
 * Strictly avoids fabricated events, counts, ticket revenue, or false publication statuses.
 */
export default function HostedEventsTab({ onNavigate }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-elevatedBorder">
        <div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-softButter">
            Hosted Events & Listings
          </h3>
          <p className="text-xs sm:text-sm text-mutedClay mt-1">
            Manage your published tour dates, upcoming festival schedules, and box office listings.
          </p>
        </div>

        <Badge variant="clay" size="sm">
          0 Active Listings
        </Badge>
      </div>

      {/* Honest Empty State Container */}
      <div className="bg-darkRoast/70 border border-elevatedBorder rounded-2xl p-8 sm:p-12 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-elevated border border-clayBrown/60 flex items-center justify-center mx-auto text-terracotta shadow-dune-sm">
          <CalendarPlus className="w-7 h-7" />
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <h4 className="font-serif font-bold text-lg sm:text-xl text-softButter">
            You Haven't Created Any Events Yet
          </h4>
          <p className="text-xs sm:text-sm text-mutedClay leading-relaxed">
            When event creation is completed, your published listings, multi-tier ticket sales, and venue schedules will appear here.
          </p>
        </div>

        {/* Informational Future Scope Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-elevated border border-elevatedBorder text-[11px] font-mono text-softButter">
          <Layers className="w-3.5 h-3.5 text-terracotta" />
          <span>Launch new event listings with our 5-step guided wizard</span>
        </div>

        {/* Active Create an Event CTA Button */}
        <div className="pt-2">
          <Button
            type="button"
            id="create-event-cta-btn"
            variant="primary"
            size="md"
            icon={<Sparkles className="w-4 h-4 text-softButter" />}
            onClick={() => onNavigate && onNavigate('create-event')}
          >
            Create an Event
          </Button>
        </div>
      </div>
    </div>
  );
}
