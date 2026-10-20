import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, CheckCircle2, AlertCircle, Save, X } from 'lucide-react';
import Button from '../common/Button';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export default function PersonalDetailsTab({
  currentUser,
  onUserUpdate,
  selectedCity,
  onSelectCity,
}) {
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [preferredCity, setPreferredCity] = useState(
    currentUser?.preferredCity || selectedCity || 'Delhi NCR'
  );

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const popularCities = [
    'All Cities',
    'Delhi NCR',
    'Mumbai',
    'Bengaluru',
    'Jaipur',
    'Pune',
    'Hyderabad',
    'Goa',
  ];

  // Sync state whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      if (currentUser.preferredCity) {
        setPreferredCity(currentUser.preferredCity);
      }
    }
  }, [currentUser]);

  const handleCancel = () => {
    setFullName(currentUser?.name || '');
    setPhone(currentUser?.phone || '');
    setPreferredCity(currentUser?.preferredCity || selectedCity || 'Delhi NCR');
    setStatusMessage(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);

    // Validation
    if (!fullName.trim()) {
      setErrorMessage('Full name is required and cannot be blank.');
      return;
    }

    if (phone.trim() && !/^[+0-9\s\-()]{7,16}$/.test(phone.trim())) {
      setErrorMessage('Please enter a valid phone number (7 to 15 digits).');
      return;
    }

    setSaving(true);

    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.updateUser({
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            preferred_city: preferredCity,
          },
        });

        if (error) throw error;

        // Propagate update to parent state
        if (onUserUpdate) {
          onUserUpdate({
            name: fullName.trim(),
            phone: phone.trim(),
            preferredCity,
          });
        }

        if (onSelectCity && preferredCity !== 'All Cities') {
          onSelectCity(preferredCity);
        }

        setStatusMessage('Your personal details have been updated successfully.');
      } else {
        // Supabase is operating in offline/demo mode
        if (onUserUpdate) {
          onUserUpdate({
            name: fullName.trim(),
            phone: phone.trim(),
            preferredCity,
          });
        }
        if (onSelectCity && preferredCity !== 'All Cities') {
          onSelectCity(preferredCity);
        }
        setStatusMessage(
          'Profile updated in local session (Supabase backend is currently operating in offline/demo mode).'
        );
      }
    } catch (err) {
      setErrorMessage(
        err.message || 'Unable to update profile. Please verify your connection.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl sm:text-2xl font-serif font-bold text-softButter">
          Personal Details
        </h3>
        <p className="text-xs sm:text-sm text-mutedClay mt-1">
          Update your attendee name, contact coordinates, and preferred discovery hub.
        </p>
      </div>

      {/* Feedback Alerts */}
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="profile-fullname"
            className="block text-xs font-serif uppercase tracking-wider text-softButter font-semibold"
          >
            Full Name
          </label>
          <div className="relative">
            <input
              id="profile-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              className="w-full bg-darkRoast text-warmCream placeholder-mutedClay/60 text-sm font-serif px-3.5 py-2.5 pl-10 rounded-xl border border-elevatedBorder focus:outline-none focus:border-terracotta transition-colors"
            />
            <User className="w-4 h-4 text-mutedClay absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Email Address (Read-only) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="profile-email"
              className="block text-xs font-serif uppercase tracking-wider text-softButter font-semibold"
            >
              Email Address
            </label>
            <span className="text-[11px] font-mono text-mutedClay">
              Authenticated Identity
            </span>
          </div>
          <div className="relative">
            <input
              id="profile-email"
              type="email"
              readOnly
              value={currentUser?.email || ''}
              className="w-full bg-darkRoast/50 text-mutedClay text-sm font-mono px-3.5 py-2.5 pl-10 rounded-xl border border-elevatedBorder/60 cursor-not-allowed select-text"
            />
            <Mail className="w-4 h-4 text-mutedClay/60 absolute left-3.5 top-3" />
          </div>
          <p className="text-[11px] text-mutedClay">
            Your login email is bound to your Supabase security session.
          </p>
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <label
            htmlFor="profile-phone"
            className="block text-xs font-serif uppercase tracking-wider text-softButter font-semibold"
          >
            Phone Number (Optional)
          </label>
          <div className="relative">
            <input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full bg-darkRoast text-warmCream placeholder-mutedClay/60 text-sm font-mono px-3.5 py-2.5 pl-10 rounded-xl border border-elevatedBorder focus:outline-none focus:border-terracotta transition-colors"
            />
            <Phone className="w-4 h-4 text-mutedClay absolute left-3.5 top-3" />
          </div>
          <p className="text-[11px] text-mutedClay">
            Used for emergency event time changes and direct SMS notifications.
          </p>
        </div>

        {/* Preferred City */}
        <div className="space-y-1.5">
          <label
            htmlFor="profile-city"
            className="block text-xs font-serif uppercase tracking-wider text-softButter font-semibold"
          >
            Preferred Event Hub / City
          </label>
          <div className="relative">
            <select
              id="profile-city"
              value={preferredCity}
              onChange={(e) => setPreferredCity(e.target.value)}
              className="w-full bg-darkRoast text-warmCream text-sm font-serif px-3.5 py-2.5 pl-10 rounded-xl border border-elevatedBorder focus:outline-none focus:border-terracotta transition-colors cursor-pointer appearance-none"
            >
              {popularCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <MapPin className="w-4 h-4 text-mutedClay absolute left-3.5 top-3 pointer-events-none" />
          </div>
          <p className="text-[11px] text-mutedClay">
            Hopi will automatically prioritize live events occurring in this metropolitan area.
          </p>
        </div>

        {/* Inline Feedback Banner for Scrolled View */}
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

        {/* Actions */}
        <div className="pt-4 border-t border-elevatedBorder flex flex-wrap items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={<Save className="w-4 h-4" />}
            disabled={saving}
          >
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
