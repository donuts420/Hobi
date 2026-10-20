import React from 'react';
import { Eye, Sparkles, Layers, MapPin, Calendar, Clock, TrendingUp, DollarSign } from 'lucide-react';
import EventCard from '../../cards/EventCard';
import Badge from '../../common/Badge';

/**
 * CreateEventLivePreview renders a persistent or collapsible real-time listing preview
 * using the real Hopi EventCard component and calculated inventory metrics.
 */
export default function CreateEventLivePreview({
  formData,
  currentBannerImage,
  startingPrice = 0,
  totalCapacity = 0,
  grossPotential = 0,
  currentUser = null,
}) {
  // Format date display for card preview
  let formattedDate = 'Date to be selected';
  if (formData.eventDate) {
    try {
      const d = new Date(formData.eventDate + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString('en-US', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      }
    } catch {
      formattedDate = formData.eventDate;
    }
  }

  // Format time display
  let formattedTime = 'Time to be configured';
  if (formData.startTime) {
    formattedTime = formData.endTime
      ? `${formData.startTime} – ${formData.endTime}`
      : `${formData.startTime} onwards`;
  }

  const previewEvent = {
    id: 'preview-event-card',
    title: formData.title.trim() || 'Untitled Event Experience',
    category: formData.category || 'Concerts & Gigs',
    bannerImage: currentBannerImage,
    priceStartingFrom: startingPrice,
    city: formData.city || 'Delhi NCR',
    venue: formData.venue.trim() || 'Venue to be announced',
    date: formattedDate,
    time: formattedTime,
    description:
      formData.description.trim() ||
      'Your evocative event description and experience details will appear here as you type...',
    rating: 5.0,
    reviewCount: 'Draft Preview',
  };

  return (
    <div className="space-y-4">
      {/* Header Pill */}
      <div className="flex items-center justify-between pb-2 border-b border-elevatedBorder">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-terracotta shrink-0" />
          <span className="text-xs font-serif font-bold uppercase tracking-wider text-softButter">
            Live Customer Preview
          </span>
        </div>
        <Badge variant="butter" size="sm">
          Real-time
        </Badge>
      </div>

      {/* The Actual Hopi EventCard in Preview Mode */}
      <div className="pointer-events-none select-none drop-shadow-dune-md">
        <EventCard event={previewEvent} onSelect={() => {}} />
      </div>

      {/* Financial & Capacity Forecast Widget */}
      <div className="bg-darkRoast/90 border border-elevatedBorder rounded-xl p-4 space-y-3 font-serif">
        <div className="flex items-center justify-between text-[11px] font-mono text-mutedClay uppercase tracking-wider border-b border-elevatedBorder pb-2">
          <span>Ticketing Forecast</span>
          <span className="text-softButter font-bold">Estimated</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <span className="text-mutedClay text-[11px] block">Starting Ticket</span>
            <span className="text-softButter font-mono font-bold text-sm">
              {startingPrice > 0 ? `₹${startingPrice.toLocaleString('en-IN')}` : 'Free / ₹0'}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-mutedClay text-[11px] block">Total Capacity</span>
            <span className="text-warmCream font-mono font-bold text-sm">
              {totalCapacity.toLocaleString('en-IN')} passes
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-elevatedBorder/60 flex items-center justify-between">
          <span className="text-xs text-mutedClay flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-terracotta" />
            <span>Gross Revenue Potential:</span>
          </span>
          <span className="text-softButter font-mono font-bold text-sm">
            ₹{grossPotential.toLocaleString('en-IN')}
          </span>
        </div>
        <p className="text-[10px] text-mutedClay/80 leading-tight">
          *Theoretical maximum based on 100% tier sellout; does not represent actual bookings.
        </p>
      </div>

      {/* Organiser Attribution Card */}
      <div className="p-3 bg-elevated/70 border border-elevatedBorder rounded-xl flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-clayBrown/40 border border-terracotta/40 flex items-center justify-center font-serif font-black text-softButter text-sm">
          {(currentUser?.userMetadata?.organization_name || currentUser?.name || 'H').charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[10px] uppercase font-mono tracking-wider text-mutedClay block">
            Hosting Brand
          </span>
          <p className="text-xs font-serif font-bold text-warmCream truncate">
            {currentUser?.userMetadata?.organization_name || currentUser?.name || 'Hopi Organiser'}
          </p>
        </div>
      </div>
    </div>
  );
}
