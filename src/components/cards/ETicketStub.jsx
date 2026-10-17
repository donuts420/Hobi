import React from 'react';
import { Calendar, Clock, MapPin, QrCode, ShieldCheck, Download, Share2 } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import CodeSlots from '../bits/CodeSlots';

/**
 * ETicketStub component displays a collectible perforated digital ticket pass.
 *
 * @param {Object} ticket - Ticket data object { id, eventTitle, tierName, date, time, venue, city, attendeeName, seatNumber, code }
 */
export default function ETicketStub({ ticket }) {
  const defaultTicket = {
    id: 'TRX-9481-JPR',
    eventTitle: 'Prateek Kuhad — Silhouettes Acoustic India Tour',
    tierName: 'Gold Fan Pit',
    date: 'Sat, 28 Nov 2026',
    time: '07:00 PM onwards',
    venue: 'Jawahar Kala Kendra Amphitheatre',
    city: 'Jaipur, India',
    attendeeName: 'Aarav Sharma',
    gate: 'Gate B (Fan Pit)',
    seat: 'Front Pit • 2 Guests',
    code: 'TRX-9481',
  };

  const data = ticket || defaultTicket;

  return (
    <div className="w-full max-w-2xl mx-auto font-serif">
      <div className="relative bg-elevated rounded-2xl border border-clayBrown/70 shadow-dune-lg overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Main Event Pass */}
        <div className="flex-1 p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-elevatedBorder/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-gradient-to-br from-terracotta to-clayBrown flex items-center justify-center border border-terracotta/40">
                <span className="font-serif font-black text-xs text-softButter">T</span>
              </div>
              <span className="font-serif font-black text-sm tracking-wider text-softButter">
                TERRATIX ADMIT ONE
              </span>
            </div>
            <Badge variant="butter" size="sm">
              {data.tierName}
            </Badge>
          </div>

          {/* Event Details */}
          <div className="space-y-2">
            <h3 className="font-serif font-bold text-2xl text-softButter tracking-tight">
              {data.eventTitle}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-terracotta">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{data.venue} — {data.city}</span>
            </div>
          </div>

          {/* Grid Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-elevatedBorder/80 text-xs">
            <div>
              <span className="block text-mutedClay text-[10px] uppercase font-mono tracking-wider">Date & Time</span>
              <span className="font-semibold text-warmCream mt-0.5 block">{data.date}</span>
              <span className="text-mutedClay text-[11px] block">{data.time}</span>
            </div>
            <div>
              <span className="block text-mutedClay text-[10px] uppercase font-mono tracking-wider">Attendee</span>
              <span className="font-semibold text-warmCream mt-0.5 block">{data.attendeeName}</span>
              <span className="text-mutedClay text-[11px] block">{data.seat}</span>
            </div>
            <div>
              <span className="block text-mutedClay text-[10px] uppercase font-mono tracking-wider">Entry Portal</span>
              <span className="font-semibold text-softButter mt-0.5 block">{data.gate}</span>
              <span className="text-mutedClay text-[11px] block">Fast Track</span>
            </div>
          </div>

          {/* Cryptographic Code Slot */}
          <div className="pt-2">
            <CodeSlots code={data.code} label="GATE VERIFICATION CRYPTO-HASH" size="sm" />
          </div>
        </div>

        {/* Perforated Divider (Dashed with circular punch-outs) */}
        <div className="relative flex md:flex-col items-center justify-between border-t md:border-t-0 md:border-l border-dashed border-clayBrown/70 px-4 py-4 md:py-8 bg-darkRoast/50">
          {/* Top circle cutout (for desktop) */}
          <div className="hidden md:block absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-darkRoast border border-clayBrown/60" />
          {/* Bottom circle cutout (for desktop) */}
          <div className="hidden md:block absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-darkRoast border border-clayBrown/60" />

          {/* QR Stub */}
          <div className="flex flex-col items-center text-center space-y-3 w-full md:w-36">
            <div className="p-3 bg-warmCream rounded-xl border border-clayBrown shadow-inner">
              {/* QR Code representation */}
              <div className="w-24 h-24 bg-darkRoast p-2 rounded flex flex-col items-center justify-center relative overflow-hidden">
                <QrCode className="w-20 h-20 text-softButter" />
                <div className="absolute inset-0 bg-terracotta/10 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="font-mono text-[10px] text-mutedClay uppercase block">TICKET ID</span>
              <span className="font-mono text-xs font-bold text-softButter block">{data.id}</span>
            </div>

            <div className="flex items-center gap-1 text-[10px] font-mono text-terracotta">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Offline Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Action Buttons */}
      <div className="mt-4 flex items-center justify-end gap-3">
        <Button
          variant="outline"
          size="sm"
          icon={<Share2 className="w-3.5 h-3.5" />}
          onClick={() => alert(`Share link for ticket #${data.id} copied to clipboard!`)}
        >
          Share Pass
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={<Download className="w-3.5 h-3.5" />}
          onClick={() => window.print()}
        >
          Download PDF
        </Button>
      </div>
    </div>
  );
}
