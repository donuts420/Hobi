import React, { useEffect, useState } from 'react';
import { ArrowLeft, ImagePlus, X } from 'lucide-react';
import Button from '../components/common/Button';
import { supabase } from '../lib/supabase';

const validImage = (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && file.size <= 5 * 1024 * 1024;
const localDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};
const storagePath = (url, eventId) => {
  try {
    const path = decodeURIComponent(new URL(url).pathname.split('/event-gallery/')[1] || '');
    return path.startsWith(`${eventId}/`) ? path : null;
  } catch { return null; }
};

export default function EventEditPage({ eventId, currentUser, onNavigate }) {
  const [event, setEvent] = useState(null);
  const [title, setTitle] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerFile, setBannerFile] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!currentUser?.id) { setError('Sign in with an authorized account to edit this event.'); setLoading(false); return; }
      const { data, error: queryError } = await supabase.from('events')
        .select('id,title,starts_at,ends_at,banner_image_url,gallery_images')
        .eq('id', eventId).maybeSingle();
      if (cancelled) return;
      if (queryError || !data) setError(queryError?.message || 'Event not found or you do not have access.');
      else {
        setEvent(data);
        setTitle(data.title || '');
        setStartsAt(localDateTime(data.starts_at));
        setEndsAt(localDateTime(data.ends_at));
        setBannerUrl(data.banner_image_url || '');
        const listed = Array.isArray(data.gallery_images) ? data.gallery_images.filter((url) => typeof url === 'string') : [];
        const { data: files, error: filesError } = await supabase.storage.from('event-gallery').list(eventId, { limit: 1000 });
        if (filesError) { setError(`Event loaded, but its photos could not be listed: ${filesError.message}`); setLoading(false); return; }
        const folderUrls = (files || []).filter((file) => file.id).map((file) => supabase.storage.from('event-gallery').getPublicUrl(`${eventId}/${file.name}`).data.publicUrl);
        if (!cancelled) setGallery([...new Set([...listed, ...folderUrls])].filter((url) => url !== data.banner_image_url).slice(0, 5));
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [eventId, currentUser?.id]);

  const save = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !startsAt) {
      setError('Enter an event name and start time.'); return;
    }
    if (gallery.length + galleryFiles.length > 5 || (bannerFile && !validImage(bannerFile)) || galleryFiles.some((file) => !validImage(file))) {
      setError('Use JPEG, PNG, or WebP images under 5 MB each, with up to five extra photos.'); return;
    }
    setSaving(true);
    const bucket = supabase.storage.from('event-gallery');
    const uploadedPaths = [];
    try {
      const upload = async (file) => {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const path = `${eventId}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await bucket.upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) throw uploadError;
        uploadedPaths.push(path);
        return bucket.getPublicUrl(path).data.publicUrl;
      };
      const nextBanner = bannerFile ? await upload(bannerFile) : bannerUrl;
      const nextGallery = [...gallery, ...await Promise.all(galleryFiles.map(upload))];
      const start = new Date(startsAt);
      const end = endsAt ? new Date(endsAt) : null;
      if (end && end <= start) end.setDate(end.getDate() + 1);
      const { error: updateError } = await supabase.rpc('update_organizer_event_details', {
        p_event_id: eventId,
        p_title: title.trim(),
        p_starts_at: start.toISOString(),
        p_ends_at: end?.toISOString() || null,
        p_banner_image_url: nextBanner,
        p_gallery_images: nextGallery,
      });
      if (updateError) throw updateError;
      const keep = new Set([nextBanner, ...nextGallery].map((url) => storagePath(url, eventId)).filter(Boolean));
      const oldPaths = [event.banner_image_url, ...(event.gallery_images || [])].map((url) => storagePath(url, eventId)).filter((path) => path && !keep.has(path));
      if (oldPaths.length) {
        const { error: removeError } = await bucket.remove(oldPaths);
        if (removeError) setError(`Event saved, but old photos could not be removed: ${removeError.message}`);
      }
      onNavigate?.('organiser-events');
    } catch (saveError) {
      if (uploadedPaths.length) await bucket.remove(uploadedPaths);
      setError(saveError.message || 'The event could not be updated.');
    } finally { setSaving(false); }
  };

  if (loading) return <p className="mx-auto max-w-3xl p-8 text-mutedClay">Loading event…</p>;
  if (!event) return <div className="mx-auto max-w-3xl space-y-4 p-8"><p role="alert" className="text-softButter">{error}</p><Button variant="outline" onClick={() => onNavigate?.('organiser-events')}>Back to Hosted Events</Button></div>;

  return <form onSubmit={save} className="mx-auto max-w-3xl space-y-6 px-4 py-10">
    <Button type="button" variant="outline" size="sm" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => onNavigate?.('organiser-events')}>Hosted Events</Button>
    <header><h1 className="text-3xl font-serif font-bold text-softButter">Edit Event</h1><p className="mt-2 text-sm text-mutedClay">Update the name, schedule, and event photos.</p></header>
    {error && <p role="alert" className="rounded-lg border border-terracotta/50 p-3 text-sm text-softButter">{error}</p>}
    <section className="space-y-4 rounded-2xl border border-elevatedBorder bg-darkRoast/70 p-5">
      <h2 className="font-serif text-lg font-bold text-softButter">Event details</h2>
      <label className="block text-xs text-mutedClay">Event name<input required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-elevatedBorder bg-darkRoast px-3 py-2 text-sm text-warmCream" /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs text-mutedClay">Starts<input required type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="mt-1 w-full rounded-lg border border-elevatedBorder bg-darkRoast px-3 py-2 text-sm text-warmCream" /></label>
        <label className="text-xs text-mutedClay">Ends (optional)<input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="mt-1 w-full rounded-lg border border-elevatedBorder bg-darkRoast px-3 py-2 text-sm text-warmCream" /></label>
      </div>
    </section>
    <section className="space-y-4 rounded-2xl border border-elevatedBorder bg-darkRoast/70 p-5">
      <h2 className="font-serif text-lg font-bold text-softButter">Event photos</h2>
      <label className="block text-xs text-mutedClay">Banner image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setBannerFile(e.target.files?.[0] || null)} className="mt-2 block text-xs" /></label>
      {bannerUrl && <img src={bannerUrl} alt="Event banner preview" className="h-40 w-full rounded-xl object-cover" />}
      {bannerFile && <p className="text-xs text-mutedClay">New banner: {bannerFile.name}</p>}
      <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-softButter">Gallery photos ({gallery.length + galleryFiles.length}/5)</h3><label className="cursor-pointer rounded-lg border border-terracotta/60 px-3 py-2 text-xs text-softButter"><ImagePlus className="mr-1 inline h-4 w-4" />Add photos<input type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={gallery.length + galleryFiles.length >= 5} onChange={(e) => { const selected = Array.from(e.target.files || []); if (gallery.length + galleryFiles.length + selected.length > 5 || selected.some((file) => !validImage(file))) setError('Choose up to five JPEG, PNG, or WebP photos under 5 MB each.'); else { setGalleryFiles([...galleryFiles, ...selected]); setError(''); } e.target.value = ''; }} className="hidden" /></label></div>
      <p className="text-xs text-mutedClay">JPEG, PNG, or WebP; up to 5 MB each.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{gallery.map((url) => <div key={url} className="relative"><img src={url} alt="Event gallery" className="h-28 w-full rounded-lg object-cover" /><button type="button" aria-label="Remove photo" onClick={() => setGallery(gallery.filter((item) => item !== url))} className="absolute right-1 top-1 rounded-full bg-darkRoast p-1 text-softButter"><X className="h-4 w-4" /></button></div>)}{galleryFiles.map((file, index) => <div key={`${file.name}-${index}`} className="flex min-h-16 items-center justify-between gap-2 rounded-lg border border-elevatedBorder p-2 text-xs text-softButter"><span className="truncate">{file.name}</span><button type="button" aria-label={`Remove ${file.name}`} onClick={() => setGalleryFiles(galleryFiles.filter((_, i) => i !== index))} className="shrink-0 text-terracotta"><X className="h-4 w-4" /></button></div>)}</div>
    </section>
    <div className="flex justify-end"><Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button></div>
  </form>;
}
