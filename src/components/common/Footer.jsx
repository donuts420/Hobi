import React from 'react';
import { Ticket, ShieldCheck, Mail, Sparkles, ArrowRight } from 'lucide-react';
import Button from './Button';

export default function Footer({ onHostEventClick }) {
  return (
    <footer className="bg-elevated border-t border-elevatedBorder pt-16 pb-12 text-warmCream font-serif mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-elevatedBorder">
          
          {/* Brand & Mission Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terracotta to-clayBrown flex items-center justify-center border border-terracotta/40 shadow-sm">
                <Ticket className="w-4 h-4 text-softButter" />
              </div>
              <span className="font-serif font-black text-xl text-softButter">
                Hopi
              </span>
            </div>
            <p className="text-xs text-mutedClay leading-relaxed">
              Hopi — Curated live events and ticketing. Discover concerts, standup comedy specials, electronic music festivals, and culinary pop-ups in your city.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-mutedClay/90 pt-1">
              <ShieldCheck className="w-4 h-4 text-terracotta shrink-0" />
              <span>100% Verified Entry & Secure Payments</span>
            </div>
          </div>

          {/* Discover Col */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-softButter font-semibold">
              Discover
            </h4>
            <ul className="space-y-2 text-xs text-mutedClay">
              <li className="hover:text-warmCream cursor-pointer transition-colors">Browse Events by City</li>
              <li className="hover:text-warmCream cursor-pointer transition-colors">All Live Concerts & Tours</li>
              <li className="hover:text-warmCream cursor-pointer transition-colors">Standup Comedy Specials</li>
              <li className="hover:text-warmCream cursor-pointer transition-colors">Nightlife & Club Parties</li>
              <li className="hover:text-warmCream cursor-pointer transition-colors">Food Festivals & Tastings</li>
            </ul>
          </div>

          {/* For Organizers Col */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-softButter font-semibold">
              For Organizers
            </h4>
            <ul className="space-y-2 text-xs text-mutedClay">
              <li>
                <button type="button" onClick={onHostEventClick} className="hover:text-warmCream transition-colors">Host an Event</button>
              </li>
              <li className="hover:text-warmCream cursor-pointer transition-colors">Organizer Dashboard</li>
              <li className="hover:text-warmCream cursor-pointer transition-colors">Ticketing & Pricing Plans</li>
              <li className="hover:text-warmCream cursor-pointer transition-colors">RFID & Box Office Entry Solutions</li>
              <li className="hover:text-warmCream cursor-pointer transition-colors">Promoter Partner Program</li>
            </ul>
          </div>

          {/* Support & Legal Col */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-softButter font-semibold">
              Support & Inquiries
            </h4>
            <ul className="space-y-2 text-xs text-mutedClay">
              <li className="hover:text-warmCream cursor-pointer transition-colors">Help Center & FAQs</li>
              <li className="hover:text-warmCream cursor-pointer transition-colors">Terms of Service</li>
              <li className="hover:text-warmCream cursor-pointer transition-colors">Privacy Policy</li>
              <li className="hover:text-warmCream cursor-pointer transition-colors">Ticket Refund Grievance</li>
              <li className="hover:text-warmCream cursor-pointer transition-colors">Contact Support: support@hopi.com</li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-mutedClay gap-4">
          <p>© 2026 Hopi. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px] text-mutedClay/80">
            <span>Mumbai</span>
            <span>•</span>
            <span>Jaipur</span>
            <span>•</span>
            <span>Delhi NCR</span>
            <span>•</span>
            <span>Bengaluru</span>
            <span>•</span>
            <span>Goa</span>
            <span>•</span>
            <span>Pune</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
