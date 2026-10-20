import React, { useState, useEffect } from 'react';
import { Building2, Mail, Phone, MapPin, Globe, FileText, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import Button from '../common/Button';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export default function OrganizationDetailsTab({
  currentUser,
  onUserUpdate,
  selectedCity,
  onSelectCity,
}) {
  const meta = currentUser?.userMetadata || {};

  const [orgName, setOrgName] = useState(meta.organization_name || currentUser?.name || '');
  const [businessEmail, setBusinessEmail] = useState(meta.business_email || currentUser?.email || '');
  const [businessPhone, setBusinessPhone] = useState(meta.business_phone || currentUser?.phone || '');
  const [operatingCity, setOperatingCity] = useState(
    meta.preferred_city || currentUser?.preferredCity || selectedCity || 'Delhi NCR'
  );
  const [websiteUrl, setWebsiteUrl] = useState(meta.website_url || '');
  const [bio, setBio] = useState(meta.organizer_bio || '');

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

  // Sync state if currentUser changes
  useEffect(() => {
    if (currentUser) {
      const m = currentUser.userMetadata || {};
      setOrgName(m.organization_name || currentUser.name || '');
      setBusinessEmail(m.business_email || currentUser.email || '');
      setBusinessPhone(m.business_phone || currentUser.phone || '');
      setOperatingCity(m.preferred_city || currentUser.preferredCity || selectedCity || 'Delhi NCR');
      setWebsiteUrl(m.website_url || '');
      setBio(m.organizer_bio || '');
    }
  }, [currentUser, selectedCity]);

  const handleCancel = () => {
    const m = currentUser?.userMetadata || {};
    setOrgName(m.organization_name || currentUser?.name || '');
    setBusinessEmail(m.business_email || currentUser?.email || '');
    setBusinessPhone(m.business_phone || currentUser?.phone || '');
    setOperatingCity(m.preferred_city || currentUser?.preferredCity || selectedCity || 'Delhi NCR');
    setWebsiteUrl(m.website_url || '');
    setBio(m.organizer_bio || '');
    setStatusMessage(null);
    setErrorMessage(null);
  };

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const validateUrl = (val) => {
    if (!val) return true;
    try {
      const url = val.startsWith('http://') || val.startsWith('https://') ? val : `https://${val}`;
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);

    // Validation
    if (!orgName.trim()) {
      setErrorMessage('Organization or brand name is required.');
      return;
    }

    if (businessEmail.trim() && !validateEmail(businessEmail.trim())) {
      setErrorMessage('Please provide a valid business email address.');
      return;
    }

    if (businessPhone.trim() && !/^[+0-9\s\-()]{7,16}$/.test(businessPhone.trim())) {
      setErrorMessage('Please provide a valid support phone number (7 to 15 digits).');
      return;
    }

    if (websiteUrl.trim() && !validateUrl(websiteUrl.trim())) {
      setErrorMessage('Please provide a valid website or social profile URL.');
      return;
    }

    setSaving(true);

    const existingMeta = currentUser?.userMetadata || {};
    const updatedMetadata = {
      ...existingMeta,
      organization_name: orgName.trim(),
      business_email: businessEmail.trim(),
      business_phone: businessPhone.trim(),
      preferred_city: operatingCity,
      website_url: websiteUrl.trim(),
      organizer_bio: bio.trim(),
    };

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.updateUser({
          data: updatedMetadata,
        });

        if (error) throw error;

        if (onUserUpdate) {
          onUserUpdate({
            userMetadata: updatedMetadata,
            preferredCity: operatingCity,
          });
        }

        if (onSelectCity && operatingCity !== 'All Cities') {
          onSelectCity(operatingCity);
        }

        setStatusMessage('Organization details updated successfully.');
      } else {
        // Offline / Demo mode
        if (onUserUpdate) {
          onUserUpdate({
            userMetadata: updatedMetadata,
            preferredCity: operatingCity,
          });
        }

        if (onSelectCity && operatingCity !== 'All Cities') {
          onSelectCity(operatingCity);
        }

        setStatusMessage(
          'Organization details updated in local session (Supabase backend is currently operating in offline/demo mode).'
        );
      }
    } catch (err) {
      setErrorMessage(
        err.message || 'Unable to save organization details. Please check your network connection.'
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
          Organization & Brand Details
        </h3>
        <p className="text-xs sm:text-sm text-mutedClay mt-1">
          Configure your public organizer profile, attendee support channels, and production bio.
        </p>
      </div>

      {/* Status Banners */}
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

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Organization Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="org-name"
            className="block text-xs font-serif uppercase tracking-wider text-softButter font-semibold"
          >
            Organization / Brand Name
          </label>
          <div className="relative">
            <input
              id="org-name"
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. Silhouettes Live Entertainment"
              className="w-full bg-darkRoast text-warmCream placeholder-mutedClay/60 text-sm font-serif px-3.5 py-2.5 pl-10 rounded-xl border border-elevatedBorder focus:outline-none focus:border-terracotta transition-colors"
            />
            <Building2 className="w-4 h-4 text-mutedClay absolute left-3.5 top-3" />
          </div>
          <p className="text-[11px] text-mutedClay">
            Displayed as the primary hosting label on event listings and ticket passes.
          </p>
        </div>

        {/* Business Support Email */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="org-email"
              className="block text-xs font-serif uppercase tracking-wider text-softButter font-semibold"
            >
              Public Support Email
            </label>
            <span className="text-[11px] font-mono text-mutedClay">
              Attendee Contact Channel
            </span>
          </div>
          <div className="relative">
            <input
              id="org-email"
              type="email"
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
              placeholder="support@yourbrand.com"
              className="w-full bg-darkRoast text-warmCream placeholder-mutedClay/60 text-sm font-mono px-3.5 py-2.5 pl-10 rounded-xl border border-elevatedBorder focus:outline-none focus:border-terracotta transition-colors"
            />
            <Mail className="w-4 h-4 text-mutedClay absolute left-3.5 top-3" />
          </div>
          <p className="text-[11px] text-mutedClay">
            Inquiries from ticket buyers will be directed to this address (keeps your login email private).
          </p>
        </div>

        {/* Support Phone Number */}
        <div className="space-y-1.5">
          <label
            htmlFor="org-phone"
            className="block text-xs font-serif uppercase tracking-wider text-softButter font-semibold"
          >
            Organizer Support Phone
          </label>
          <div className="relative">
            <input
              id="org-phone"
              type="tel"
              value={businessPhone}
              onChange={(e) => setBusinessPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full bg-darkRoast text-warmCream placeholder-mutedClay/60 text-sm font-mono px-3.5 py-2.5 pl-10 rounded-xl border border-elevatedBorder focus:outline-none focus:border-terracotta transition-colors"
            />
            <Phone className="w-4 h-4 text-mutedClay absolute left-3.5 top-3" />
          </div>
          <p className="text-[11px] text-mutedClay">
            Used for urgent venue coordination and day-of-show communication.
          </p>
        </div>

        {/* Operating City */}
        <div className="space-y-1.5">
          <label
            htmlFor="org-city"
            className="block text-xs font-serif uppercase tracking-wider text-softButter font-semibold"
          >
            Primary Operating City
          </label>
          <div className="relative">
            <select
              id="org-city"
              value={operatingCity}
              onChange={(e) => setOperatingCity(e.target.value)}
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
            The regional hub where your production team primarily hosts gigs and events.
          </p>
        </div>

        {/* Website or Social URL */}
        <div className="space-y-1.5">
          <label
            htmlFor="org-website"
            className="block text-xs font-serif uppercase tracking-wider text-softButter font-semibold"
          >
            Official Website or Social Profile
          </label>
          <div className="relative">
            <input
              id="org-website"
              type="text"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://yourbrand.com or instagram.com/brand"
              className="w-full bg-darkRoast text-warmCream placeholder-mutedClay/60 text-sm font-serif px-3.5 py-2.5 pl-10 rounded-xl border border-elevatedBorder focus:outline-none focus:border-terracotta transition-colors"
            />
            <Globe className="w-4 h-4 text-mutedClay absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Description / Bio */}
        <div className="space-y-1.5">
          <label
            htmlFor="org-bio"
            className="block text-xs font-serif uppercase tracking-wider text-softButter font-semibold"
          >
            Organization Bio / Promoter Statement
          </label>
          <div className="relative">
            <textarea
              id="org-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Briefly describe your collective, music roster, comedy festival, or production focus..."
              className="w-full bg-darkRoast text-warmCream placeholder-mutedClay/60 text-sm font-serif px-3.5 py-2.5 pl-10 rounded-xl border border-elevatedBorder focus:outline-none focus:border-terracotta transition-colors resize-none"
            />
            <FileText className="w-4 h-4 text-mutedClay absolute left-3.5 top-3" />
          </div>
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
            {saving ? 'Saving Details...' : 'Save Organization Details'}
          </Button>
        </div>
      </form>
    </div>
  );
}
