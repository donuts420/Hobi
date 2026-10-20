import React from 'react';
import { Calendar, Clock, MapPin, Building2, Moon, AlertCircle, Compass } from 'lucide-react';

export default function DateVenueStep({
  formData,
  onChange,
  errors = {},
}) {
  const popularCities = [
    'Delhi NCR',
    'Mumbai',
    'Bengaluru',
    'Jaipur',
    'Pune',
    'Hyderabad',
    'Goa',
  ];

  // Calculate today's date in YYYY-MM-DD for min attribute
  const todayStr = new Date().toISOString().split('T')[0];

  // Detect whether start and end times imply an overnight schedule
  const isOvernight = Boolean(
    formData.startTime &&
    formData.endTime &&
    formData.endTime <= formData.startTime
  );

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-terracotta font-semibold">
            Step 2 of 5
          </span>
          <span className="text-mutedClay">•</span>
          <span className="text-xs text-mutedClay">Logistics & Location</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-serif font-black text-softButter mt-1">
          Schedule & Venue Details
        </h3>
        <p className="text-xs sm:text-sm text-mutedClay mt-1">
          Specify when the event takes place and where attendees should arrive for entry check-in.
        </p>
      </div>

      <div className="space-y-5">
        {/* Date and Time Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Event Date */}
          <div className="space-y-1.5 sm:col-span-1">
            <label
              htmlFor="event-date"
              className="block text-xs font-serif uppercase tracking-wider text-softButter font-semibold"
            >
              Event Date <span className="text-terracotta">*</span>
            </label>
            <div className="relative">
              <input
                id="event-date"
                type="date"
                min={todayStr}
                value={formData.eventDate}
                onChange={(e) => onChange('eventDate', e.target.value)}
                className={`w-full bg-darkRoast text-warmCream text-sm font-mono px-3.5 py-2.5 pl-10 rounded-xl border transition-colors ${
                  errors.eventDate
                    ? 'border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-400'
                    : 'border-elevatedBorder focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta/40'
                }`}
              />
              <Calendar className="w-4 h-4 text-mutedClay absolute left-3.5 top-3" />
            </div>
            {errors.eventDate && (
              <p className="text-xs text-red-400 flex items-center gap-1.5 pt-0.5 animate-fadeIn">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.eventDate}</span>
              </p>
            )}
          </div>

          {/* Start Time */}
          <div className="space-y-1.5 sm:col-span-1">
            <label
              htmlFor="start-time"
              className="block text-xs font-serif uppercase tracking-wider text-softButter font-semibold"
            >
              Doors Open / Start Time <span className="text-terracotta">*</span>
            </label>
            <div className="relative">
              <input
                id="start-time"
                type="time"
                value={formData.startTime}
                onChange={(e) => onChange('startTime', e.target.value)}
                className={`w-full bg-darkRoast text-warmCream text-sm font-mono px-3.5 py-2.5 pl-10 rounded-xl border transition-colors ${
                  errors.startTime
                    ? 'border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-400'
                    : 'border-elevatedBorder focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta/40'
                }`}
              />
              <Clock className="w-4 h-4 text-mutedClay absolute left-3.5 top-3" />
            </div>
            {errors.startTime && (
              <p className="text-xs text-red-400 flex items-center gap-1.5 pt-0.5 animate-fadeIn">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.startTime}</span>
              </p>
            )}
          </div>

          {/* End Time */}
          <div className="space-y-1.5 sm:col-span-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="end-time"
                className="block text-xs font-serif uppercase tracking-wider text-softButter font-semibold"
              >
                Concludes / End Time
              </label>
              <span className="text-[10px] text-mutedClay font-mono">Optional</span>
            </div>
            <div className="relative">
              <input
                id="end-time"
                type="time"
                value={formData.endTime}
                onChange={(e) => onChange('endTime', e.target.value)}
                className={`w-full bg-darkRoast text-warmCream text-sm font-mono px-3.5 py-2.5 pl-10 rounded-xl border transition-colors ${
                  errors.endTime
                    ? 'border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-400'
                    : 'border-elevatedBorder focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta/40'
                }`}
              />
              <Clock className="w-4 h-4 text-mutedClay absolute left-3.5 top-3" />
            </div>
            {errors.endTime && (
              <p className="text-xs text-red-400 flex items-center gap-1.5 pt-0.5 animate-fadeIn">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.endTime}</span>
              </p>
            )}
          </div>
        </div>

        {/* Overnight Indicator Banner */}
        {isOvernight && (
          <div className="bg-clayBrown/25 border border-terracotta/50 rounded-xl p-3 flex items-center gap-2.5 text-xs text-softButter animate-fadeIn font-serif">
            <Moon className="w-4 h-4 text-terracotta shrink-0" />
            <span>
              <strong>Overnight Event Detected:</strong> The end time ({formData.endTime}) occurs past midnight into the morning of the following calendar day.
            </span>
          </div>
        )}

        {/* Venue Name & Operating City Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Venue Name */}
          <div className="space-y-1.5 sm:col-span-2">
            <label
              htmlFor="venue-name"
              className="block text-xs font-serif uppercase tracking-wider text-softButter font-semibold"
            >
              Venue / Auditorium / Stadium Name <span className="text-terracotta">*</span>
            </label>
            <div className="relative">
              <input
                id="venue-name"
                type="text"
                value={formData.venue}
                onChange={(e) => onChange('venue', e.target.value)}
                placeholder="e.g. Jawahar Kala Kendra Amphitheatre"
                className={`w-full bg-darkRoast text-warmCream placeholder-mutedClay/60 text-sm font-serif px-3.5 py-2.5 pl-10 rounded-xl border transition-colors ${
                  errors.venue
                    ? 'border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-400'
                    : 'border-elevatedBorder focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta/40'
                }`}
              />
              <Building2 className="w-4 h-4 text-mutedClay absolute left-3.5 top-3" />
            </div>
            {errors.venue ? (
              <p className="text-xs text-red-400 flex items-center gap-1.5 pt-0.5 animate-fadeIn">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.venue}</span>
              </p>
            ) : (
              <p className="text-[11px] text-mutedClay">
                Specify the exact hall, ground, or theatre name where gates open.
              </p>
            )}
          </div>

          {/* Operating City */}
          <div className="space-y-1.5 sm:col-span-1">
            <label
              htmlFor="event-city"
              className="block text-xs font-serif uppercase tracking-wider text-softButter font-semibold"
            >
              City Hub <span className="text-terracotta">*</span>
            </label>
            <div className="relative">
              <select
                id="event-city"
                value={formData.city}
                onChange={(e) => onChange('city', e.target.value)}
                className={`w-full bg-darkRoast text-warmCream text-sm font-serif px-3.5 py-2.5 pl-10 rounded-xl border transition-colors appearance-none cursor-pointer ${
                  errors.city
                    ? 'border-red-500 focus:border-red-400'
                    : 'border-elevatedBorder focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta/40'
                }`}
              >
                {popularCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <MapPin className="w-4 h-4 text-mutedClay absolute left-3.5 top-3 pointer-events-none" />
            </div>
            {errors.city && (
              <p className="text-xs text-red-400 flex items-center gap-1.5 pt-0.5 animate-fadeIn">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.city}</span>
              </p>
            )}
          </div>
        </div>

        {/* Address / Gate Instructions (Optional) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="venue-address"
              className="block text-xs font-serif uppercase tracking-wider text-softButter font-semibold"
            >
              Street Address & Gate Directions
            </label>
            <span className="text-[10px] text-mutedClay font-mono">Optional</span>
          </div>
          <div className="relative">
            <input
              id="venue-address"
              type="text"
              value={formData.address}
              onChange={(e) => onChange('address', e.target.value)}
              placeholder="e.g. Gate 4, JLN Marg, Opp. Commerce College, JKK Campus"
              className="w-full bg-darkRoast text-warmCream placeholder-mutedClay/60 text-sm font-serif px-3.5 py-2.5 pl-10 rounded-xl border border-elevatedBorder focus:outline-none focus:border-terracotta transition-colors"
            />
            <Compass className="w-4 h-4 text-mutedClay absolute left-3.5 top-3" />
          </div>
          <p className="text-[11px] text-mutedClay">
            Helpful for venue navigation, parking bay allocation, and box office badge pickup.
          </p>
        </div>
      </div>
    </div>
  );
}
