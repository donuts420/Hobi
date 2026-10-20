import React, { useState } from 'react';
import { Bell, Ticket, MessageSquare, AlertCircle, CheckCircle2, Save, Receipt, RefreshCw } from 'lucide-react';
import Button from '../common/Button';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

/**
 * OrganiserNotificationsTab provides settings for organiser communication channels.
 * Configures notification preferences only; does not claim emails are actively dispatched.
 */
export default function OrganiserNotificationsTab({ currentUser, onUserUpdate }) {
  const meta = currentUser?.userMetadata || {};
  const existingPrefs = meta.organizer_notifications || {};

  const [ticketSalesAlerts, setTicketSalesAlerts] = useState(
    existingPrefs.ticketSalesAlerts !== undefined ? existingPrefs.ticketSalesAlerts : true
  );
  const [attendeeInquiries, setAttendeeInquiries] = useState(
    existingPrefs.attendeeInquiries !== undefined ? existingPrefs.attendeeInquiries : true
  );
  const [eventPolicyUpdates, setEventPolicyUpdates] = useState(
    existingPrefs.eventPolicyUpdates !== undefined ? existingPrefs.eventPolicyUpdates : true
  );
  const [payoutDispatches, setPayoutDispatches] = useState(
    existingPrefs.payoutDispatches !== undefined ? existingPrefs.payoutDispatches : false
  );

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);
    setSaving(true);

    const updatedOrganizerNotifications = {
      ticketSalesAlerts,
      attendeeInquiries,
      eventPolicyUpdates,
      payoutDispatches,
    };

    const existingMeta = currentUser?.userMetadata || {};
    const updatedMetadata = {
      ...existingMeta,
      organizer_notifications: updatedOrganizerNotifications,
    };

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.updateUser({
          data: updatedMetadata,
        });

        if (error) throw error;

        if (onUserUpdate) {
          onUserUpdate({ userMetadata: updatedMetadata });
        }
        setStatusMessage('Organiser notification preferences have been saved to your account.');
      } else {
        if (onUserUpdate) {
          onUserUpdate({ userMetadata: updatedMetadata });
        }
        setStatusMessage(
          'Notification preferences updated in local session (Supabase backend is currently operating in offline/demo mode).'
        );
      }
    } catch (err) {
      setErrorMessage(
        err.message || 'Unable to save notification preferences. Please check your network connection.'
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
          Organiser Notification Preferences
        </h3>
        <p className="text-xs sm:text-sm text-mutedClay mt-1">
          Select which operational dispatches, ticket sale receipts, and attendee questions you receive.
        </p>
      </div>

      {/* Status Messages */}
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

      <form onSubmit={handleSave} className="space-y-4">
        {/* Toggle 1: Ticket Purchase Notifications */}
        <label className="flex items-start justify-between p-4 rounded-xl bg-darkRoast border border-elevatedBorder gap-4 cursor-pointer hover:border-clayBrown/60 transition-colors">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-terracotta shrink-0" />
              <span className="text-sm font-serif font-bold text-warmCream">
                Ticket Purchase Notifications
              </span>
            </div>
            <p className="text-xs text-mutedClay leading-relaxed">
              Receive immediate confirmation when attendees reserve passes or VIP packages for your events.
            </p>
          </div>
          <input
            type="checkbox"
            checked={ticketSalesAlerts}
            onChange={(e) => setTicketSalesAlerts(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-elevatedBorder text-terracotta accent-terracotta focus:ring-terracotta cursor-pointer"
          />
        </label>

        {/* Toggle 2: Attendee Enquiries */}
        <label className="flex items-start justify-between p-4 rounded-xl bg-darkRoast border border-elevatedBorder gap-4 cursor-pointer hover:border-clayBrown/60 transition-colors">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-softButter shrink-0" />
              <span className="text-sm font-serif font-bold text-warmCream">
                Attendee Enquiries & Support Forwarding
              </span>
            </div>
            <p className="text-xs text-mutedClay leading-relaxed">
              Forward customer ticket transfer inquiries and venue gate queries to your public support email.
            </p>
          </div>
          <input
            type="checkbox"
            checked={attendeeInquiries}
            onChange={(e) => setAttendeeInquiries(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-elevatedBorder text-terracotta accent-terracotta focus:ring-terracotta cursor-pointer"
          />
        </label>

        {/* Toggle 3: Event-Related Updates */}
        <label className="flex items-start justify-between p-4 rounded-xl bg-darkRoast border border-elevatedBorder gap-4 cursor-pointer hover:border-clayBrown/60 transition-colors">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-terracotta shrink-0" />
              <span className="text-sm font-serif font-bold text-warmCream">
                Venue Policy & Regulatory Updates
              </span>
            </div>
            <p className="text-xs text-mutedClay leading-relaxed">
              Notices regarding municipal guidelines, venue sound restrictions, and box office regulations.
            </p>
          </div>
          <input
            type="checkbox"
            checked={eventPolicyUpdates}
            onChange={(e) => setEventPolicyUpdates(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-elevatedBorder text-terracotta accent-terracotta focus:ring-terracotta cursor-pointer"
          />
        </label>

        {/* Toggle 4: Payout Status Notifications */}
        <label className="flex items-start justify-between p-4 rounded-xl bg-darkRoast border border-elevatedBorder gap-4 cursor-pointer hover:border-clayBrown/60 transition-colors">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-softButter shrink-0" />
              <span className="text-sm font-serif font-bold text-warmCream">
                Payout Settlement Notifications
              </span>
            </div>
            <p className="text-xs text-mutedClay leading-relaxed">
              Confirmations when ticket revenue batches are queued or released for bank settlement.
            </p>
          </div>
          <input
            type="checkbox"
            checked={payoutDispatches}
            onChange={(e) => setPayoutDispatches(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-elevatedBorder text-terracotta accent-terracotta focus:ring-terracotta cursor-pointer"
          />
        </label>

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
