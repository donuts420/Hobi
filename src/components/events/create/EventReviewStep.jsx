import React, { useState } from 'react';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Ticket,
  Edit3,
  Save,
  Send,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Button from '../../common/Button';
import Badge from '../../common/Badge';

export default function EventReviewStep({
  formData,
  currentBannerImage,
  startingPrice,
  totalCapacity,
  grossPotential,
  currentUser,
  onGoToStep,
  onSaveDraft,
  onPublishEvent,
  isSubmitting = false,
  statusNotice = null,
}) {
  // Format date display
  let formattedDate = formData.eventDate || 'Not specified';
  if (formData.eventDate) {
    try {
      const d = new Date(formData.eventDate + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString('en-US', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      }
    } catch {
      formattedDate = formData.eventDate;
    }
  }

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-terracotta font-semibold">
            Step 5 of 5
          </span>
          <span className="text-mutedClay">•</span>
            <span className="text-xs text-mutedClay">Review & Publish</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-serif font-black text-softButter mt-1">
          Review Event Details & Tiers
        </h3>
        <p className="text-xs sm:text-sm text-mutedClay mt-1">
          Verify your event listing coordinates and ticketing configuration before saving.
        </p>
      </div>

      {/* Status Notice if Saved */}
      {statusNotice && (
        <div className="bg-clayBrown/30 border border-terracotta/60 rounded-xl p-4 text-xs text-softButter flex items-start gap-3 animate-fadeIn">
          {statusNotice.title === 'Event Published'
            ? <CheckCircle2 className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
            : <AlertCircle className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />}
          <div className="space-y-1">
            <p className="font-bold">{statusNotice.title}</p>
            <p className="text-mutedClay text-[11px] leading-relaxed">
              {statusNotice.message}
            </p>
          </div>
        </div>
      )}

      {/* Review Sections Grid */}
      <div className="space-y-4">
        {/* Section 1: Event Basics Review Card */}
        <div className="bg-darkRoast rounded-2xl border border-elevatedBorder p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-elevatedBorder">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-terracotta" />
              <h4 className="font-serif font-bold text-softButter text-sm">
                Event Identity & Overview
              </h4>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep(1)}
              className="inline-flex items-center gap-1.5 text-xs text-terracotta hover:text-terracottaHover font-semibold cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Basics</span>
            </button>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-[10px] font-mono uppercase text-mutedClay block">Event Title</span>
              <p className="text-base font-serif font-black text-warmCream">
                {formData.title || 'Untitled Event'}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Badge variant="butter" size="sm">
                {formData.category}
              </Badge>
              <span className="text-xs text-mutedClay font-serif">
                Organised by <strong>{currentUser?.userMetadata?.organization_name || currentUser?.name || 'Hopi Host'}</strong>
              </span>
            </div>

            <div className="pt-2">
              <span className="text-[10px] font-mono uppercase text-mutedClay block">Description</span>
              <p className="text-xs text-mutedClay/90 leading-relaxed font-serif pt-1 whitespace-pre-line">
                {formData.description || 'No description provided.'}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Schedule & Venue Review Card */}
        <div className="bg-darkRoast rounded-2xl border border-elevatedBorder p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-elevatedBorder">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-terracotta" />
              <h4 className="font-serif font-bold text-softButter text-sm">
                Schedule & Venue Coordinates
              </h4>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep(2)}
              className="inline-flex items-center gap-1.5 text-xs text-terracotta hover:text-terracottaHover font-semibold cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Schedule</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-serif">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-mutedClay block">Date</span>
                  <p className="font-semibold text-warmCream">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-mutedClay block">Doors & Timing</span>
                  <p className="font-semibold text-warmCream">
                    {formData.startTime || 'TBD'}
                    {formData.endTime && ` – ${formData.endTime}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-mutedClay block">Venue & City</span>
                  <p className="font-semibold text-warmCream">
                    {formData.venue || 'TBD'} • {formData.city}
                  </p>
                </div>
              </div>

              {formData.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-mono uppercase text-mutedClay block">Gate Address</span>
                    <p className="text-mutedClay">{formData.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Artwork Review Card */}
        <div className="bg-darkRoast rounded-2xl border border-elevatedBorder p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-elevatedBorder">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-terracotta" />
              <h4 className="font-serif font-bold text-softButter text-sm">
                Event Artwork Preview
              </h4>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep(3)}
              className="inline-flex items-center gap-1.5 text-xs text-terracotta hover:text-terracottaHover font-semibold cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Artwork</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <img
              src={currentBannerImage}
              alt="Event banner"
              className="w-28 h-18 rounded-xl object-cover border border-elevatedBorder shrink-0"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="clay" size="sm">
                  {formData.artworkType === 'preset'
                    ? 'Curated Preset'
                    : formData.artworkType === 'file'
                    ? 'Event Gallery Upload'
                    : 'External Image URL'}
                </Badge>
              </div>
              <p className="text-xs text-mutedClay truncate font-mono">
                {formData.localFile ? formData.localFile.name : currentBannerImage}
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Ticket Tiers & Pricing Breakdown */}
        <div className="bg-darkRoast rounded-2xl border border-elevatedBorder p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-elevatedBorder">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-terracotta" />
              <h4 className="font-serif font-bold text-softButter text-sm">
                Configured Ticket Tiers ({formData.ticketTypes.length})
              </h4>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep(4)}
              className="inline-flex items-center gap-1.5 text-xs text-terracotta hover:text-terracottaHover font-semibold cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Tickets</span>
            </button>
          </div>

          <div className="divide-y divide-elevatedBorder">
            {formData.ticketTypes.map((tier, idx) => (
              <div key={tier.id || idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div>
                  <h5 className="font-serif font-bold text-warmCream">{tier.name}</h5>
                  <div className="flex items-center gap-2 text-mutedClay text-[11px] mt-0.5">
                    <span>{tier.totalQuantity} allocation</span>
                    {tier.perks && tier.perks.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{tier.perks.length} perks</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-softButter text-sm">
                    {Number(tier.price) === 0 ? 'Free RSVP' : `₹${Number(tier.price).toLocaleString('en-IN')}`}
                  </span>
                  <span className="text-[10px] text-mutedClay block font-mono">
                    Gross: ₹{(Number(tier.price) * Number(tier.totalQuantity)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Aggregate Stats */}
          <div className="pt-3 border-t border-elevatedBorder flex flex-wrap items-center justify-between gap-2 text-xs font-serif bg-elevated/40 p-3 rounded-xl">
            <div>
              <span className="text-mutedClay block text-[11px]">Total Event Capacity</span>
              <span className="font-mono font-bold text-softButter text-sm">
                {totalCapacity.toLocaleString('en-IN')} Passes
              </span>
            </div>

            <div>
              <span className="text-mutedClay block text-[11px]">Entry Price</span>
              <span className="font-mono font-bold text-softButter text-sm">
                {startingPrice > 0 ? `From ₹${startingPrice.toLocaleString('en-IN')}` : 'Free / ₹0'}
              </span>
            </div>

            <div className="text-right">
              <span className="text-mutedClay block text-[11px]">Theoretical Gross Revenue</span>
              <span className="font-mono font-bold text-softButter text-sm">
                ₹{grossPotential.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-clayBrown/25 border border-terracotta/40 rounded-2xl p-4 flex items-start gap-3 text-xs text-softButter">
        <ShieldCheck className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Publish to Hopi</p>
          <p className="text-mutedClay text-[11px] leading-relaxed">
            Publishing saves this event and its ticket tiers to Hopi. Customers can then find it and pay securely through Razorpay Checkout.
          </p>
        </div>
      </div>

      {/* Submission Actions */}
      <div className="pt-4 border-t border-elevatedBorder flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="md"
          icon={<Save className="w-4 h-4" />}
          onClick={onSaveDraft}
        >
          Save Browser Draft
        </Button>

        <Button
          type="button"
          variant="primary"
          size="md"
          icon={<Send className="w-4 h-4" />}
          disabled={isSubmitting}
          onClick={onPublishEvent}
        >
          {isSubmitting ? 'Publishing Event…' : 'Publish Event'}
        </Button>
      </div>
    </div>
  );
}
