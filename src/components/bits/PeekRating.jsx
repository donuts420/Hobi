import React from 'react';
import { Star, Users, Award } from 'lucide-react';

/**
 * PeekRating component showing ratings, reviews, and event sentiment tags.
 *
 * @param {number} rating - Score out of 5 (e.g., 4.95)
 * @param {number} reviewCount - Total count of verified attendee reviews
 * @param {string} tag - Editorial badge / sentiment (e.g., "Acoustic Perfection")
 */
export default function PeekRating({
  rating = 4.96,
  reviewCount = 680,
  tag = 'Sanctuary Choice',
  compact = false,
}) {
  const fullStars = Math.floor(rating);

  return (
    <div className="inline-flex items-center gap-2 select-none">
      <div className="flex items-center gap-1 bg-elevated/80 px-2.5 py-1 rounded border border-elevatedBorder">
        {/* Star icons */}
        <div className="flex items-center text-softButter">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < fullStars
                  ? 'fill-softButter text-softButter'
                  : 'fill-softButter/20 text-softButter/30'
              }`}
            />
          ))}
        </div>

        {/* Rating score */}
        <span className="font-mono text-xs font-semibold text-softButter ml-1">
          {rating.toFixed(2)}
        </span>

        {!compact && (
          <>
            <span className="text-mutedClay/40 text-xs">|</span>
            <div className="flex items-center gap-1 text-[11px] font-serif text-mutedClay">
              <Users className="w-3 h-3 text-mutedClay" />
              <span>{reviewCount.toLocaleString()}</span>
            </div>
          </>
        )}
      </div>

      {tag && !compact && (
        <div className="hidden sm:inline-flex items-center gap-1 bg-clayBrown/20 border border-clayBrown/40 text-[10px] uppercase tracking-wider text-warmCream px-2 py-0.5 rounded font-serif">
          <Award className="w-3 h-3 text-terracotta" />
          <span>{tag}</span>
        </div>
      )}
    </div>
  );
}
