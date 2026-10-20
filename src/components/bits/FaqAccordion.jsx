import React, { useState } from 'react';
import { ChevronDown, Ticket, RefreshCw, QrCode, Sparkles } from 'lucide-react';

export default function FaqAccordion({ items = [] }) {
  const defaultFaqs = [
    {
      id: 'delivery',
      question: 'How do I receive my booking and digital ticket?',
      category: 'Instant Delivery',
      icon: <Ticket className="w-4 h-4 text-terracotta" />,
      answer:
        'Once your payment is confirmed, your digital ticket with a high-resolution entry QR code is sent immediately via WhatsApp and Email. You can also view, save, or download it anytime directly from your Hopi account.',
      highlights: [
        'Instant WhatsApp & Email confirmation',
        'Offline-ready digital QR ticket',
        'Apple Wallet & Google Wallet pass support',
      ],
    },
    {
      id: 'transfer',
      question: 'Can I transfer or cancel my ticket?',
      category: 'Flexible Policies',
      icon: <RefreshCw className="w-4 h-4 text-softButter" />,
      answer:
        'Yes! Hopi allows 1-click ticket transfer to your friends using their mobile number or email up to 3 hours before gates open. For cancellations and refunds, event-specific organizer policies apply as shown on checkout.',
      highlights: [
        'Zero-fee instant ticket transfer',
        'Transparent organizer refund window',
        'Automated fan-to-fan resale for sold-out gigs',
      ],
    },
    {
      id: 'checkin',
      question: 'How does venue entry check-in work?',
      category: 'At The Gate',
      icon: <QrCode className="w-4 h-4 text-terracotta" />,
      answer:
        'Simply present the digital QR code on your smartphone screen at the venue gate for rapid contactless scanner check-in. No paper printouts are ever required. Gates typically open 60 to 90 minutes before showtime.',
      highlights: [
        'Fast contactless scanner entry',
        '100% paperless mobile tickets',
        'Express entry lines for VIP & early-bird passes',
      ],
    },
    {
      id: 'host',
      question: 'How do I list and sell tickets for my own event?',
      category: 'For Organizers',
      icon: <Sparkles className="w-4 h-4 text-softButter" />,
      answer:
        'Publishing your concert, standup show, club night, food festival, or workshop takes under 10 minutes. Enjoy dynamic multi-tier ticket sales, real-time attendee analytics, promo codes, and prompt automated payouts.',
      highlights: [
        'Self-serve 10-minute event onboarding',
        'Transparent platform fees with no hidden costs',
        'Direct automated bank settlement after show',
      ],
    },
  ];

  const list = items && items.length > 0 ? items : defaultFaqs;
  const [openId, setOpenId] = useState(list[0]?.id || null);

  const toggleItem = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="w-full space-y-3 font-serif">
      {list.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className={`rounded-xl border transition-all duration-300 overflow-hidden ${
              isOpen
                ? 'bg-elevated border-clayBrown/80 shadow-dune-md'
                : 'bg-elevated/60 border-elevatedBorder hover:border-elevatedBorder/90'
            }`}
          >
            <button
              type="button"
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors focus:outline-none cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                    isOpen ? 'bg-clayBrown/40 border border-clayBrown' : 'bg-darkRoast border border-elevatedBorder'
                  }`}
                >
                  {item.icon}
                </div>
                <div>
                  <span className="block text-[10px] tracking-widest uppercase font-mono text-terracotta">
                    {item.category}
                  </span>
                  <h4 className="text-base font-semibold text-warmCream tracking-wide">
                    {item.question}
                  </h4>
                </div>
              </div>

              <div
                className={`p-1.5 rounded-full border border-elevatedBorder text-mutedClay transition-transform duration-300 shrink-0 ${
                  isOpen ? 'rotate-180 bg-clayBrown/30 text-softButter' : ''
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>

            {isOpen && (
              <div className="px-5 pb-5 pt-1 border-t border-elevatedBorder/50 space-y-3 animate-fadeIn">
                <p className="text-sm text-warmCream/90 leading-relaxed">
                  {item.answer}
                </p>

                {item.highlights && item.highlights.length > 0 && (
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {item.highlights.map((highlight, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-mutedClay bg-darkRoast/60 px-3 py-1.5 rounded-lg border border-elevatedBorder/60"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
