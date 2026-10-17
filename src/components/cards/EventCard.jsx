import React from 'react';
import { Calendar, Clock, MapPin, ArrowUpRight } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import PeekRating from '../bits/PeekRating';

/**
 * EventCard component for rendering curated desert events.
 *
 * @param {Object} event - Event data object
 * @param {Function} onSelect - Callback when user clicks to view tiers/details
 */
export default function EventCard({ event, onSelect }) {
  if (!event) return null;

  return (
    <article className="group bg-elevated rounded-xl border border-elevatedBorder overflow-hidden flex flex-col transition-all duration-300 hover:border-clayBrown hover:shadow-dune-lg hover:-translate-y-1">
      {/* Media Container with Category & Quick Badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-darkRoast">
        <img
          src={event.bannerImage}
          alt={event.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-elevated via-elevated/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-serif font-medium tracking-wide uppercase bg-black/70 backdrop-blur-md text-softButter border border-white/15 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" />
            {event.category}
          </span>
          <div className="bg-darkRoast/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-elevatedBorder text-[11px] font-mono font-bold text-softButter shadow-sm">
            From ₹{event.priceStartingFrom.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Bottom City Overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-warmCream font-serif bg-darkRoast/80 backdrop-blur-md px-2.5 py-1 rounded border border-elevatedBorder/80">
          <MapPin className="w-3.5 h-3.5 text-terracotta shrink-0" />
          <span className="truncate">{event.city}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <h3 className="font-serif font-bold text-lg text-warmCream group-hover:text-softButter transition-colors line-clamp-2 leading-snug">
            {event.title}
          </h3>

          <p className="text-xs text-mutedClay line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Date & Venue Metadata */}
          <div className="pt-2 border-t border-elevatedBorder/60 space-y-1.5 text-xs text-mutedClay">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-terracotta shrink-0" />
              <span>{event.date}</span>
              <span className="text-elevatedBorder">•</span>
              <Clock className="w-3.5 h-3.5 text-mutedClay shrink-0" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-softButter/90 truncate font-medium">
                {event.venue}
              </span>
            </div>
          </div>
        </div>

        {/* Rating and Action Footer */}
        <div className="pt-3 border-t border-elevatedBorder/60 flex items-center justify-between gap-2">
          <PeekRating rating={4.9} reviewCount={450} tag="Trending" compact />

          <Button
            variant="primary"
            size="sm"
            onClick={() => onSelect && onSelect(event)}
            icon={<ArrowUpRight className="w-3.5 h-3.5" />}
          >
            Book Now
          </Button>
        </div>
      </div>
    </article>
  );
}
