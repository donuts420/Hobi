import React, { useState } from 'react';
import { ChevronDown, Ticket, RefreshCw, QrCode, Sparkles } from 'lucide-react';

/**
 * Displays the Hopi FAQ accordion and booking photo strip.
 */
export default function FaqAccordion({ items = [], photos }) {
  const [activePhoto, setActivePhoto] = useState(0);

  if (photos?.length) {
    return (
      <div className="flex h-56 sm:h-72 w-full gap-2 overflow-hidden rounded-xl">
        {photos.map((photo, index) => (
          <button
            key={photo.src}
            type="button"
            aria-label={`Show event photo ${index + 1}`}
            aria-pressed={activePhoto === index}
            onClick={() => setActivePhoto(index)}
            className={`relative min-w-0 overflow-hidden rounded-lg transition-[flex] duration-500 cursor-pointer ${
              activePhoto === index ? 'flex-[5]' : 'flex-1'
            }`}
          >
            <img
              src={photo.src}
              alt={photo.alt}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <span className="absolute bottom-3 left-3 text-left text-sm font-semibold text-white">
              {photo.alt}
            </span>
          </button>
        ))}
      </div>
    );
  }

  const defaultItems = [
    {
      id: 'delivery',
      title: 'How do I receive my booking and digital ticket?',
      category: 'Instant Delivery',
      icon: <Ticket className="w-4 h-4 text-terracotta" />,
      content:
        'Once your payment is confirmed, your digital ticket with a high-resolution entry QR code is sent immediately via WhatsApp and Email. You can also view, save, or download it anytime directly from your Hopi account.',
      highlights: [
        'Instant WhatsApp & Email confirmation',
        'Offline-ready digital QR ticket',
        'Apple Wallet & Google Wallet pass support',
      ],
    },
    {
      id: 'transfer',
      title: 'Can I transfer or cancel my ticket?',
      category: 'Flexible Policies',
      icon: <RefreshCw className="w-4 h-4 text-softButter" />,
      content:
        'Yes! Hopi allows 1-click ticket transfer to your friends using their mobile number or email up to 3 hours before gates open. For cancellations and refunds, event-specific organizer policies apply as shown on the checkout screen.',
      highlights: [
        'Zero-fee instant ticket transfer',
        'Transparent organizer refund window',
        'Automated fan-to-fan resale for sold-out gigs',
      ],
    },
    {
      id: 'checkin',
      title: 'How does venue entry check-in work?',
      category: 'At The Gate',
      icon: <QrCode className="w-4 h-4 text-terracotta" />,
      content:
        'Simply present the digital QR code on your smartphone screen at the venue gate for rapid contactless scanner check-in. No paper printouts are ever required. Gates typically open 60 to 90 minutes before showtime.',
      highlights: [
        'Fast contactless scanner entry',
        '100% paperless mobile tickets',
        'Express entry lines for VIP & early-bird passes',
      ],
    },
    {
      id: 'host',
      title: 'How do I list and sell tickets for my own event?',
      category: 'For Organizers',
      icon: <Sparkles className="w-4 h-4 text-softButter" />,
      content:
        'Publishing your concert, standup show, club night, food festival, or workshop takes under 10 minutes. Enjoy dynamic multi-tier ticket sales, real-time attendee analytics, promo codes, and prompt automated payouts.',
      highlights: [
        'Self-serve 10-minute event onboarding',
        'Transparent platform fees with no hidden costs',
        'Direct automated bank settlement after show',
      ],
    },
  ];

  const galleryItems = items && items.length > 0 ? items : defaultItems;
  const [openId, setOpenId] = useState(galleryItems[0]?.id || null);

  const toggleAccordion = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="w-full space-y-3 font-serif">
      {galleryItems.map((item) => {
        const isOpen = openId === item.id;
        const titleText = item.title || item.question || '';
        const contentText = item.content || item.answer || '';

        return (
          <div
            key={item.id}
            className={`rounded-xl border transition-all duration-300 overflow-hidden ${
              isOpen
                ? 'bg-elevated border-clayBrown/70 shadow-dune-md'
                : 'bg-elevated/60 border-elevatedBorder hover:border-elevatedBorder/80'
            }`}
          >
            <button
              type="button"
              onClick={() => toggleAccordion(item.id)}
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
                    {titleText}
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
                  {contentText}
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
