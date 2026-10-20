import React, { useEffect, useState } from 'react';
import { CalendarPlus, Sparkles, Layers, Clock, MapPin, Pencil, Trash2 } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { supabase } from '../../lib/supabase';

/**
 * HostedEventsTab shows the signed-in organiser's persisted event listings.
 */
export default function HostedEventsTab({ currentUser, onNavigate }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyEventId, setBusyEventId] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function loadEvents() {
      if (!currentUser?.id) {
        setEvents([]);
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', currentUser.id).maybeSingle();
      let query = supabase
        .from('events')
        .select('id,title,starts_at,venue,city,status')
        .order('created_at', { ascending: false });
      if (profile?.role !== 'administrator') query = query.eq('created_by', currentUser.id);
      const { data, error } = await query;
      if (cancelled) return;
      if (error) setLoadError('Your hosted events could not be loaded. Please refresh and try again.');
      else setEvents(data || []);
      setLoading(false);
    }
    loadEvents();
    return () => { cancelled = true; };
  }, [currentUser?.id]);

  const publishedCount = events.filter((event) => event.status === 'published').length;

  const removeEvent = async (event) => {
    if (event.status !== 'deleting' && !window.confirm('Delete this event? Events with any booking cannot be deleted.')) return;
    setActionError('');
    setBusyEventId(event.id);
    try {
      if (event.status !== 'deleting') {
        const { error } = await supabase.rpc('begin_delete_organizer_event', { p_event_id: event.id });
        if (error) throw error;
      }
      const storage = supabase.storage.from('event-gallery');
      const { data: files, error: listError } = await storage.list(event.id, { limit: 1000 });
      if (listError) throw listError;
      const paths = (files || []).filter((file) => file.id).map((file) => `${event.id}/${file.name}`);
      if (paths.length) {
        const { error } = await storage.remove(paths);
        if (error) throw error;
      }
      const { error } = await supabase.rpc('finish_delete_organizer_event', { p_event_id: event.id });
      if (error) throw error;
      setEvents((current) => current.filter((item) => item.id !== event.id));
    } catch (error) {
      setActionError(error.message?.includes('booking')
        ? 'This event has booking records and cannot be deleted.'
        : `Event deletion could not finish. ${error.message || 'Retry the deletion.'}`);
      if (event.status !== 'deleting' && !error.message?.includes('booking')) {
        const { data } = await supabase.from('events').select('status').eq('id', event.id).maybeSingle();
        if (data?.status === 'deleting') setEvents((current) => current.map((item) => item.id === event.id ? { ...item, status: 'deleting' } : item));
      }
    } finally {
      setBusyEventId('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-elevatedBorder">
        <div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-softButter">
            Hosted Events & Listings
          </h3>
          <p className="text-xs sm:text-sm text-mutedClay mt-1">
            Manage your published tour dates, upcoming festival schedules, and box office listings.
          </p>
        </div>

        <Badge variant="clay" size="sm">
          {publishedCount} Active {publishedCount === 1 ? 'Listing' : 'Listings'}
        </Badge>
      </div>

      {loading ? (
        <div className="bg-darkRoast/70 border border-elevatedBorder rounded-2xl p-8 text-center text-sm text-mutedClay">Loading your events…</div>
      ) : loadError ? (
        <div role="alert" className="bg-darkRoast/70 border border-terracotta/50 rounded-2xl p-8 text-center text-sm text-softButter">{loadError}</div>
      ) : events.length > 0 ? (
        <div className="space-y-4">
          {actionError && <p role="alert" className="rounded-lg border border-terracotta/50 p-3 text-sm text-softButter">{actionError}</p>}
          {events.map((event) => (
            <article key={event.id} className="bg-darkRoast/70 border border-elevatedBorder rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-serif font-bold text-softButter">{event.title}</h4>
                  <Badge variant={event.status === 'published' ? 'butter' : 'clay'} size="sm">{event.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-mutedClay">
                  <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-terracotta" />{new Date(event.starts_at).toLocaleString()}</span>
                  <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-terracotta" />{event.venue}, {event.city}</span>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                {event.status === 'deleting' ? (
                  <Button type="button" variant="outline" size="sm" disabled={busyEventId === event.id} onClick={() => removeEvent(event)}>
                    {busyEventId === event.id ? 'Retrying…' : 'Retry Delete'}
                  </Button>
                ) : <>
                  <Button type="button" variant="outline" size="sm" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => onNavigate?.(`edit-event:${event.id}`)}>Edit Event</Button>
                  <Button type="button" variant="outline" size="sm" icon={<Trash2 className="h-3.5 w-3.5" />} disabled={busyEventId === event.id} onClick={() => removeEvent(event)}>
                    {busyEventId === event.id ? 'Deleting…' : 'Delete'}
                  </Button>
                </>}
              </div>
            </article>
          ))}
        </div>
      ) : (
      <div className="bg-darkRoast/70 border border-elevatedBorder rounded-2xl p-8 sm:p-12 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-elevated border border-clayBrown/60 flex items-center justify-center mx-auto text-terracotta shadow-dune-sm">
          <CalendarPlus className="w-7 h-7" />
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <h4 className="font-serif font-bold text-lg sm:text-xl text-softButter">
            You Haven't Created Any Events Yet
          </h4>
          <p className="text-xs sm:text-sm text-mutedClay leading-relaxed">
            Events you publish will appear here with their current status and schedule.
          </p>
        </div>

        {/* Informational Future Scope Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-elevated border border-elevatedBorder text-[11px] font-mono text-softButter">
          <Layers className="w-3.5 h-3.5 text-terracotta" />
          <span>Launch new event listings with our 5-step guided wizard</span>
        </div>

        {/* Active Create an Event CTA Button */}
        <div className="pt-2">
          <Button
            type="button"
            id="create-event-cta-btn"
            variant="primary"
            size="md"
            icon={<Sparkles className="w-4 h-4 text-softButter" />}
            onClick={() => onNavigate && onNavigate('create-event')}
          >
            Create an Event
          </Button>
        </div>
      </div>
      )}

      {publishedCount > 0 && (
        <div className="pt-2 flex justify-center">
          <Button type="button" variant="primary" size="md" icon={<Sparkles className="w-4 h-4" />} onClick={() => onNavigate?.('create-event')}>
            Add Event
          </Button>
        </div>
      )}
    </div>
  );
}
