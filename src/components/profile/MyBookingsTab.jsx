import React, { useEffect, useMemo, useState } from 'react';
import { Ticket, Calendar, Sparkles, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import ETicketStub from '../cards/ETicketStub';
import { supabase } from '../../lib/supabase';

/**
 * MyBookingsTab renders customer booking history with upcoming & past segments.
 * Honestly reflects that no active server-backed bookings exist for this account yet,
 * with structured empty states and an interactive demo ticket preview.
 */
export default function MyBookingsTab({ onNavigate }) {
  const [activeSegment, setActiveSegment] = useState('upcoming'); // 'upcoming' | 'past'
  const [showDemoPass, setShowDemoPass] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function loadBookings() {
      setLoading(true);
      setLoadError('');
      const { data, error } = await supabase
        .from('bookings')
        .select('id,status,total_amount_inr,created_at,paid_at,events(title,starts_at,venue,city,banner_image_url),booking_items(ticket_name,quantity,unit_price_inr)')
        .in('status', ['confirmed', 'refund_processing', 'refunded'])
        .order('created_at', { ascending: false });
      if (cancelled) return;
      if (error) {
        setLoadError('Bookings could not be loaded. Please try again in a moment.');
      } else {
        setBookings(data || []);
      }
      setLoading(false);
    }
    loadBookings();
    return () => { cancelled = true; };
  }, []);

  const { activeBookings, pastBookings } = useMemo(() => {
    const now = Date.now();
    const upcoming = [];
    const past = [];
    bookings.forEach((booking) => {
      const startsAt = booking.events?.starts_at ? new Date(booking.events.starts_at).getTime() : 0;
      (startsAt >= now ? upcoming : past).push(booking);
    });
    return { activeBookings: upcoming, pastBookings: past };
  }, [bookings]);

  const currentList = activeSegment === 'upcoming' ? activeBookings : pastBookings;

  return (
    <div className="space-y-6">
      {/* Tab Header & Segment Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-elevatedBorder">
        <div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-softButter">
            My Bookings & E-Tickets
          </h3>
          <p className="text-xs sm:text-sm text-mutedClay mt-1">
            Access your contactless venue entry QR passes and past festival records.
          </p>
        </div>

        {/* Sub-segment switch */}
        <div className="inline-flex p-1 rounded-xl bg-darkRoast border border-elevatedBorder shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveSegment('upcoming')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-serif font-semibold transition-all cursor-pointer ${
              activeSegment === 'upcoming'
                ? 'bg-clayBrown text-softButter shadow-dune-sm'
                : 'text-mutedClay hover:text-warmCream'
            }`}
          >
            Upcoming ({activeBookings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSegment('past')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-serif font-semibold transition-all cursor-pointer ${
              activeSegment === 'past'
                ? 'bg-clayBrown text-softButter shadow-dune-sm'
                : 'text-mutedClay hover:text-warmCream'
            }`}
          >
            Past Events ({pastBookings.length})
          </button>
        </div>
      </div>

      {/* Booking List or Honest Empty State */}
      {loading ? (
        <div className="bg-darkRoast/70 border border-elevatedBorder rounded-2xl p-10 text-center text-sm text-mutedClay">Loading your bookings…</div>
      ) : loadError ? (
        <div role="alert" className="bg-darkRoast/70 border border-terracotta/50 rounded-2xl p-8 text-center text-sm text-softButter">{loadError}</div>
      ) : currentList.length > 0 ? (
        <div className="space-y-6">
          {currentList.map((booking) => (
            <article key={booking.id} className="rounded-2xl bg-darkRoast/70 border border-elevatedBorder p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-elevatedBorder pb-4">
                <div>
                  <h4 className="font-serif font-bold text-lg text-softButter">{booking.events?.title || 'Event booking'}</h4>
                  <p className="mt-1 text-xs text-mutedClay">
                    {booking.events?.starts_at ? new Date(booking.events.starts_at).toLocaleString() : 'Event date unavailable'}
                    {booking.events?.venue ? ` · ${booking.events.venue}` : ''}
                    {booking.events?.city ? `, ${booking.events.city}` : ''}
                  </p>
                </div>
                <Badge variant={booking.status === 'confirmed' ? 'butter' : 'terracotta'} size="sm">
                  {booking.status === 'confirmed' ? 'Paid' : booking.status === 'refunded' ? 'Refunded' : 'Refund processing'}
                </Badge>
              </div>
              <div className="space-y-2">
                {(booking.booking_items || []).map((item) => (
                  <div key={`${booking.id}-${item.ticket_name}`} className="flex justify-between gap-4 text-sm">
                    <span className="text-warmCream">{item.ticket_name} × {item.quantity}</span>
                    <span className="font-mono text-softButter">₹{(Number(item.unit_price_inr) * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t border-elevatedBorder pt-3 text-sm">
                <span className="text-mutedClay">{booking.status === 'confirmed' ? 'Amount paid' : 'Booking total'}</span>
                <strong className="font-mono text-softButter">₹{Number(booking.total_amount_inr).toLocaleString('en-IN')}</strong>
              </div>
              {booking.status !== 'confirmed' && (
                <p className="text-xs text-mutedClay">
                  {booking.status === 'refunded'
                    ? 'The ticket hold expired after payment. Razorpay confirmed the refund.'
                    : 'The ticket hold expired after payment. Razorpay is processing the refund.'}
                </p>
              )}
              <p className="text-[11px] text-mutedClay font-mono">Booking {booking.id.slice(0, 8).toUpperCase()}</p>
              {booking.status === 'confirmed' && booking.events && (booking.booking_items || []).map((item, index) => {
                const startsAt = booking.events.starts_at ? new Date(booking.events.starts_at) : null;
                const code = `HOPI-${booking.id.replaceAll('-', '').slice(0, 4).toUpperCase()}`;
                return <ETicketStub key={`${booking.id}-${item.ticket_name}-${index}`} ticket={{
                  id: booking.id.slice(0, 8).toUpperCase(),
                  eventTitle: booking.events.title,
                  eventImage: booking.events.banner_image_url,
                  tierName: item.ticket_name,
                  date: startsAt?.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }) || 'Date unavailable',
                  time: startsAt?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) || '',
                  venue: booking.events.venue,
                  city: booking.events.city,
                  attendeeName: 'Booking holder',
                  gate: 'General entry',
                  seat: `${item.quantity} ${Number(item.quantity) === 1 ? 'guest' : 'guests'}`,
                  code,
                }} />;
              })}
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-darkRoast/70 border border-elevatedBorder rounded-2xl p-8 sm:p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-elevated border border-clayBrown/60 flex items-center justify-center mx-auto text-terracotta">
            <Ticket className="w-6 h-6" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h4 className="font-serif font-bold text-lg text-softButter">
              {activeSegment === 'upcoming'
                ? 'No Upcoming Bookings Found'
                : 'No Past Events on Record'}
            </h4>
            <p className="text-xs text-mutedClay leading-relaxed">
              {activeSegment === 'upcoming'
                ? 'You have not reserved passes for any upcoming live concerts, comedy specials, or club nights. When you complete a booking, your official e-tickets with high-resolution entry QR codes will be securely delivered here.'
                : 'You have not attended any ticketed events with this account yet.'}
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              icon={<Sparkles className="w-4 h-4" />}
              onClick={() => onNavigate && onNavigate('events')}
            >
              Explore Live Events
            </Button>
          </div>
        </div>
      )}

      {/* Expandable Sample Ticket Preview */}
      <div className="pt-4 border-t border-elevatedBorder">
        <button
          type="button"
          onClick={() => setShowDemoPass(!showDemoPass)}
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-darkRoast border border-elevatedBorder text-xs font-serif text-warmCream hover:border-clayBrown/70 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5 text-left">
            <ShieldCheck className="w-4 h-4 text-terracotta shrink-0" />
            <div>
              <span className="font-semibold text-softButter block">
                Sample Verified E-Ticket Pass
              </span>
              <span className="text-[11px] text-mutedClay">
                Preview how contactless QR passes look once confirmed
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-mutedClay">
            <span className="text-[11px] font-mono">{showDemoPass ? 'Hide Preview' : 'Show Preview'}</span>
            {showDemoPass ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showDemoPass && (
          <div className="mt-4 p-4 rounded-xl bg-darkRoast/50 border border-elevatedBorder space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between px-2">
              <Badge variant="clay" size="sm">
                Specimen Preview • Non-Purchased
              </Badge>
              <span className="text-[10px] font-mono text-mutedClay">
                SAMPLE PASS FORMAT
              </span>
            </div>
            <ETicketStub />
          </div>
        )}
      </div>
    </div>
  );
}
