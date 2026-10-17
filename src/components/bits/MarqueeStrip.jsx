import React from 'react';
import { Flame, Sparkles, Star, Ticket, Zap } from 'lucide-react';

export default function MarqueeStrip({ items = [] }) {
  const defaultItems = [
    { text: "MUMBAI: PRATEEK KUHAD LIVE TOUR — 90% PASSES BOOKED", icon: <Flame className="w-3.5 h-3.5 text-terracotta" /> },
    { text: "JAIPUR: WINTER MUSIC & FOOD CARNIVAL EARLY BIRDS LIVE", icon: <Star className="w-3.5 h-3.5 text-softButter" /> },
    { text: "GOA: SUNBURN ARENA FT. BORIS BREJCHA VIP TABLES OPEN", icon: <Zap className="w-3.5 h-3.5 text-terracotta" /> },
    { text: "DELHI NCR: ZAKIR KHAN STANDUP SPECIAL SHOWS ADDED", icon: <Ticket className="w-3.5 h-3.5 text-softButter" /> },
    { text: "BENGALURU: ANUV JAIN WINTER CONCERT ARENA PASSES SELLING FAST", icon: <Sparkles className="w-3.5 h-3.5 text-terracotta" /> },
    { text: "INSTANT WHATSAPP TICKETS • 100% VERIFIED ENTRY GUARANTEE", icon: <Star className="w-3.5 h-3.5 text-softButter" /> },
  ];

  const displayList = items.length > 0 ? items : defaultItems;

  return (
    <div className="w-full bg-elevated/90 border-y border-elevatedBorder overflow-hidden py-2.5 select-none relative">
      <div className="flex w-max animate-marquee space-x-8">
        {[...displayList, ...displayList].map((item, index) => (
          <div
            key={index}
            className="flex items-center space-x-2.5 text-xs font-serif tracking-wider uppercase text-warmCream/90"
          >
            <span>{item.icon}</span>
            <span>{item.text}</span>
            <span className="text-clayBrown pl-6">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
