import React, { useState } from 'react';
import { Bell, Mail, Sparkles, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export default function PreferencesTab({ currentUser, onUserUpdate }) {
  const existingPrefs = currentUser?.preferences || {};

  const [emailAlerts, setEmailAlerts] = useState(
    existingPrefs.emailAlerts !== undefined ? existingPrefs.emailAlerts : true
  );
  const [eventReminders, setEventReminders] = useState(
    existingPrefs.eventReminders !== undefined ? existingPrefs.eventReminders : true
  );
  const [weeklyDigest, setWeeklyDigest] = useState(
    existingPrefs.weeklyDigest !== undefined ? existingPrefs.weeklyDigest : false
  );

  const availableCategories = [
    'Concerts & Gigs',
    'Standup Comedy',
    'Nightlife & Clubs',
    'Food & Drinks',
    'Theater & Arts',
    'Workshops',
  ];

  const [selectedGenres, setSelectedGenres] = useState(
    Array.isArray(existingPrefs.selectedGenres)
      ? existingPrefs.selectedGenres
      : ['Concerts & Gigs', 'Standup Comedy']
  );

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);
    setSaving(true);

    const updatedPreferences = {
      emailAlerts,
      eventReminders,
      weeklyDigest,
      selectedGenres,
    };

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.updateUser({
          data: {
            preferences: updatedPreferences,
          },
        });

        if (error) throw error;

        if (onUserUpdate) {
          onUserUpdate({ preferences: updatedPreferences });
        }
        setStatusMessage('Your event and notification preferences have been saved.');
      } else {
        if (onUserUpdate) {
          onUserUpdate({ preferences: updatedPreferences });
        }
        setStatusMessage(
          'Preferences updated in local session (Supabase backend is currently operating in offline/demo mode).'
        );
      }
    } catch (err) {
      setErrorMessage(
        err.message || 'Unable to save preferences. Please check your network connection.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl sm:text-2xl font-serif font-bold text-softButter">
          Ticketing & Event Preferences
        </h3>
        <p className="text-xs sm:text-sm text-mutedClay mt-1">
          Customize your event notifications, curated genre interests, and dispatch channels.
        </p>
      </div>

      {statusMessage && (
        <div className="bg-clayBrown/30 border border-terracotta/60 rounded-xl p-3.5 text-xs text-softButter flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-terracotta shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-darkRoast border border-red-500/60 rounded-xl p-3.5 text-xs text-red-300 flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Email Notification Toggles */}
        <div className="space-y-4">
          <h4 className="text-xs font-serif uppercase tracking-wider text-softButter font-semibold">
            Notification Dispatches
          </h4>

          {/* Locked / Mandatory item: Booking receipts */}
          <div className="flex items-start justify-between p-4 rounded-xl bg-darkRoast border border-elevatedBorder gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-serif font-bold text-warmCream">
                  Booking Confirmations & Digital Passes
                </span>
                <Badge variant="butter" size="sm">
                  Required
                </Badge>
              </div>
              <p className="text-xs text-mutedClay leading-relaxed">
                Transactional emails containing your e-ticket entry QR codes, booking receipts, and gate guidelines.
              </p>
            </div>
            <div className="text-xs font-mono text-terracotta shrink-0 pt-1 font-semibold">
              Always Active
            </div>
          </div>

          {/* Toggle: Event reminders */}
          <label className="flex items-start justify-between p-4 rounded-xl bg-darkRoast border border-elevatedBorder gap-4 cursor-pointer hover:border-clayBrown/60 transition-colors">
            <div className="space-y-1">
              <span className="text-sm font-serif font-bold text-warmCream block">
                Showtime Reminders & Gate Updates
              </span>
              <p className="text-xs text-mutedClay leading-relaxed">
                Receive notifications 24 hours and 3 hours before your scheduled event starts, including venue parking rules.
              </p>
            </div>
            <input
              type="checkbox"
              checked={eventReminders}
              onChange={(e) => setEventReminders(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-elevatedBorder text-terracotta accent-terracotta focus:ring-terracotta cursor-pointer"
            />
          </label>

          {/* Toggle: Weekly Curated drops */}
          <label className="flex items-start justify-between p-4 rounded-xl bg-darkRoast border border-elevatedBorder gap-4 cursor-pointer hover:border-clayBrown/60 transition-colors">
            <div className="space-y-1">
              <span className="text-sm font-serif font-bold text-warmCream block">
                Weekend Highlights & Tour Announcements
              </span>
              <p className="text-xs text-mutedClay leading-relaxed">
                Curated weekly guide to top indie concerts, standup comedy tours, and culinary festivals in your city.
              </p>
            </div>
            <input
              type="checkbox"
              checked={weeklyDigest}
              onChange={(e) => setWeeklyDigest(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-elevatedBorder text-terracotta accent-terracotta focus:ring-terracotta cursor-pointer"
            />
          </label>
        </div>

        {/* Favorite Categories Multi-select */}
        <div className="space-y-3 pt-4 border-t border-elevatedBorder">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-serif uppercase tracking-wider text-softButter font-semibold">
              Favorite Event Genres
            </h4>
            <span className="text-[11px] text-mutedClay font-mono">
              {selectedGenres.length} selected
            </span>
          </div>
          <p className="text-xs text-mutedClay">
            Select genres to personalize your spotlight events and home feed recommendations.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {availableCategories.map((genre) => {
              const isSelected = selectedGenres.includes(genre);
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-serif font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-clayBrown text-softButter border border-clayBrown shadow-dune-sm font-semibold'
                      : 'bg-darkRoast text-mutedClay border border-elevatedBorder hover:text-warmCream hover:border-clayBrown/60'
                  }`}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save Actions */}
        <div className="pt-4 border-t border-elevatedBorder flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={<Save className="w-4 h-4" />}
            disabled={saving}
          >
            {saving ? 'Saving Preferences...' : 'Save Preferences'}
          </Button>
        </div>
      </form>
    </div>
  );
}
