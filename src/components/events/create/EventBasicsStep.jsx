import React from 'react';
import { Type, Layers, FileText, Sparkles, AlertCircle, Mail } from 'lucide-react';

export default function EventBasicsStep({
  formData,
  onChange,
  errors = {},
}) {
  const categories = [
    'Concerts & Gigs',
    'Standup Comedy',
    'Nightlife & Clubs',
    'Food & Drinks',
    'Theater & Arts',
    'Workshops',
  ];

  const titleLength = formData.title ? formData.title.length : 0;
  const descLength = formData.description ? formData.description.length : 0;

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-terracotta font-semibold">
            Step 1 of 5
          </span>
          <span className="text-mutedClay">•</span>
          <span className="text-xs text-mutedClay">Event Identity</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-serif font-black text-softButter mt-1">
          Event Basics & Overview
        </h3>
        <p className="text-xs sm:text-sm text-mutedClay mt-1">
          Set the public title, genre category, and evocative description for your event listing.
        </p>
      </div>

      <div className="space-y-5">
        {/* Event Title */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="event-title"
              className="block text-xs font-serif uppercase tracking-wider text-softButter font-semibold"
            >
              Event Name / Tour Title <span className="text-terracotta">*</span>
            </label>
            <span
              className={`text-[11px] font-mono ${
                titleLength > 120 ? 'text-red-400 font-bold' : 'text-mutedClay'
              }`}
            >
              {titleLength}/120
            </span>
          </div>
          <div className="relative">
            <input
              id="event-title"
              type="text"
              value={formData.title}
              onChange={(e) => onChange('title', e.target.value)}
              placeholder="e.g. Prateek Kuhad — Silhouettes Acoustic India Tour"
              maxLength={130}
              className={`w-full bg-darkRoast text-warmCream placeholder-mutedClay/60 text-sm font-serif px-3.5 py-2.5 pl-10 rounded-xl border transition-colors ${
                errors.title
                  ? 'border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-400'
                  : 'border-elevatedBorder focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta/40'
              }`}
            />
            <Type className="w-4 h-4 text-mutedClay absolute left-3.5 top-3" />
          </div>
          {errors.title ? (
            <p className="text-xs text-red-400 flex items-center gap-1.5 pt-0.5 animate-fadeIn">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.title}</span>
            </p>
          ) : (
            <p className="text-[11px] text-mutedClay">
              Give your event a memorable, distinct title that includes the headliner or special tour theme.
            </p>
          )}
        </div>

        {/* Category Selection */}
        <div className="space-y-1.5">
          <label
            htmlFor="event-category"
            className="block text-xs font-serif uppercase tracking-wider text-softButter font-semibold"
          >
            Experience Category <span className="text-terracotta">*</span>
          </label>
          <div className="relative">
            <select
              id="event-category"
              value={formData.category}
              onChange={(e) => onChange('category', e.target.value)}
              className={`w-full bg-darkRoast text-warmCream text-sm font-serif px-3.5 py-2.5 pl-10 rounded-xl border transition-colors appearance-none cursor-pointer ${
                errors.category
                  ? 'border-red-500 focus:border-red-400'
                  : 'border-elevatedBorder focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta/40'
              }`}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <Layers className="w-4 h-4 text-mutedClay absolute left-3.5 top-3 pointer-events-none" />
          </div>
          {errors.category ? (
            <p className="text-xs text-red-400 flex items-center gap-1.5 pt-0.5 animate-fadeIn">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.category}</span>
            </p>
          ) : (
            <p className="text-[11px] text-mutedClay">
              Ensures your event appears in Hopi's category filters, mega-menu, and curated discover feeds.
            </p>
          )}
        </div>

        {/* Event Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="event-description"
              className="block text-xs font-serif uppercase tracking-wider text-softButter font-semibold"
            >
              Event Description & Overview <span className="text-terracotta">*</span>
            </label>
            <span
              className={`text-[11px] font-mono ${
                descLength < 20 || descLength > 1500
                  ? descLength === 0
                    ? 'text-mutedClay'
                    : 'text-terracotta'
                  : 'text-mutedClay'
              }`}
            >
              {descLength}/1500 {descLength < 20 && '(min 20)'}
            </span>
          </div>
          <div className="relative">
            <textarea
              id="event-description"
              rows={5}
              value={formData.description}
              onChange={(e) => onChange('description', e.target.value)}
              placeholder="Describe the artist lineup, venue atmosphere, musical genre, seating setup, and why fans shouldn't miss it..."
              maxLength={1600}
              className={`w-full bg-darkRoast text-warmCream placeholder-mutedClay/60 text-sm font-serif px-3.5 py-2.5 pl-10 rounded-xl border transition-colors resize-none ${
                errors.description
                  ? 'border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-400'
                  : 'border-elevatedBorder focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta/40'
              }`}
            />
            <FileText className="w-4 h-4 text-mutedClay absolute left-3.5 top-3" />
          </div>
          {errors.description ? (
            <p className="text-xs text-red-400 flex items-center gap-1.5 pt-0.5 animate-fadeIn">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.description}</span>
            </p>
          ) : (
            <p className="text-[11px] text-mutedClay">
              Minimum 20 characters. Highlight entry guidelines, special guest appearances, and schedule notes.
            </p>
          )}
        </div>

        <section className="space-y-3" aria-labelledby="event-contacts-heading">
          <div>
            <h4 id="event-contacts-heading" className="text-xs font-serif uppercase tracking-wider text-softButter font-semibold">
              Contact Us <span className="text-terracotta">*</span>
            </h4>
            <p className="text-[11px] text-mutedClay mt-1">These contacts will be shown to attendees on your event listing.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((number) => (
              <div key={number} className="space-y-3 rounded-xl border border-elevatedBorder bg-darkRoast/50 p-4">
                <h5 className="text-xs font-serif font-bold text-warmCream">Contact {number}</h5>
                <div className="space-y-1.5">
                  <label htmlFor={`event-contact-${number}-name`} className="block text-[11px] uppercase tracking-wider text-mutedClay">
                    Name <span className="text-terracotta">*</span>
                  </label>
                  <input
                    id={`event-contact-${number}-name`}
                    type="text"
                    required
                    autoComplete="name"
                    value={formData[`contact${number}Name`]}
                    onChange={(e) => onChange(`contact${number}Name`, e.target.value)}
                    aria-invalid={Boolean(errors[`contact${number}Name`])}
                    className={`w-full bg-darkRoast text-warmCream placeholder-mutedClay/60 text-sm px-3 py-2.5 rounded-lg border focus:outline-none focus:border-terracotta ${errors[`contact${number}Name`] ? 'border-red-500' : 'border-elevatedBorder'}`}
                  />
                  {errors[`contact${number}Name`] && <p role="alert" className="text-xs text-red-400">{errors[`contact${number}Name`]}</p>}
                </div>
                <div className="space-y-1.5">
                  <label htmlFor={`event-contact-${number}-email`} className="block text-[11px] uppercase tracking-wider text-mutedClay">
                    Email <span className="text-terracotta">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id={`event-contact-${number}-email`}
                      type="email"
                      required
                      autoComplete="email"
                      value={formData[`contact${number}Email`]}
                      onChange={(e) => onChange(`contact${number}Email`, e.target.value)}
                      aria-invalid={Boolean(errors[`contact${number}Email`])}
                      className={`w-full bg-darkRoast text-warmCream placeholder-mutedClay/60 text-sm px-3 py-2.5 pr-9 rounded-lg border focus:outline-none focus:border-terracotta ${errors[`contact${number}Email`] ? 'border-red-500' : 'border-elevatedBorder'}`}
                    />
                    <Mail className="w-4 h-4 text-mutedClay absolute right-3 top-3" aria-hidden="true" />
                  </div>
                  {errors[`contact${number}Email`] && <p role="alert" className="text-xs text-red-400">{errors[`contact${number}Email`]}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
