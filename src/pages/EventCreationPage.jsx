import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Check,
  Sparkles,
  Eye,
  Calendar,
  Layers,
  Image,
  Ticket,
  CheckCircle2,
  AlertCircle,
  Save,
  Trash2,
  X,
  ChevronRight,
  ChevronLeft,
  Building2,
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import EventBasicsStep from '../components/events/create/EventBasicsStep';
import DateVenueStep from '../components/events/create/DateVenueStep';
import EventArtworkStep from '../components/events/create/EventArtworkStep';
import TicketConfigStep from '../components/events/create/TicketConfigStep';
import EventReviewStep from '../components/events/create/EventReviewStep';
import CreateEventLivePreview from '../components/events/create/CreateEventLivePreview';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const DRAFT_STORAGE_KEY = 'hopi_event_creation_draft';

const DEFAULT_PRESET_BANNER =
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80';

export default function EventCreationPage({
  currentUser,
  onNavigate,
  selectedCity = 'Delhi NCR',
  onSelectCity,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [statusNotice, setStatusNotice] = useState(null);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Initial Form State
  const initialFormState = {
    title: '',
    category: 'Concerts & Gigs',
    description: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    venue: '',
    city: selectedCity && selectedCity !== 'All Cities' ? selectedCity : 'Delhi NCR',
    address: '',
    artworkType: 'preset',
    presetId: 'preset-concert',
    bannerUrl: DEFAULT_PRESET_BANNER,
    localFile: null,
    localFileUrl: null,
    ticketTypes: [
      {
        id: 'tier-1',
        name: 'General Admission',
        price: 999,
        totalQuantity: 100,
        perks: ['Standing lawn admission', 'Beverage counter access'],
      },
    ],
  };

  const [formData, setFormData] = useState(initialFormState);

  // Restore Draft on Mount if available
  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (parsed && typeof parsed === 'object') {
          setFormData((prev) => ({
            ...prev,
            ...parsed,
            // localFile and localFileUrl cannot be restored from localStorage
            localFile: null,
            localFileUrl: null,
            bannerUrl:
              parsed.bannerUrl && !parsed.bannerUrl.startsWith('blob:')
                ? parsed.bannerUrl
                : DEFAULT_PRESET_BANNER,
          }));
          setStatusNotice({
            title: 'Draft Restored',
            message:
              'We loaded your previously saved local browser draft. (Note: image files must be re-selected after a browser restart).',
          });
        }
      }
    } catch (e) {
      console.warn('Could not restore local event draft:', e);
    }
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (formData.localFileUrl && formData.localFileUrl.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(formData.localFileUrl);
        } catch {
          // ignore
        }
      }
    };
  }, [formData.localFileUrl]);

  // Handle Input Changes
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Ticket Tiers Operations
  const handleAddTier = () => {
    const nextIdx = formData.ticketTypes.length + 1;
    const newTier = {
      id: `tier-${Date.now()}`,
      name: nextIdx === 2 ? 'VIP Front Pit' : `Tier ${nextIdx}`,
      price: nextIdx === 2 ? 1999 : 499,
      totalQuantity: 50,
      perks: ['Priority gate access'],
    };
    setFormData((prev) => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, newTier],
    }));
  };

  const handleUpdateTier = (index, key, value) => {
    setFormData((prev) => {
      const updated = [...prev.ticketTypes];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, ticketTypes: updated };
    });
    if (errors[`tier_${index}`] || errors.tiers) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`tier_${index}`];
        delete next.tiers;
        return next;
      });
    }
  };

  const handleRemoveTier = (index) => {
    if (formData.ticketTypes.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter((_, i) => i !== index),
    }));
  };

  // Live Calculated Stats
  const totalCapacity = formData.ticketTypes.reduce(
    (sum, t) => sum + (Number(t.totalQuantity) || 0),
    0
  );

  const startingPrice =
    formData.ticketTypes.length > 0
      ? Math.min(...formData.ticketTypes.map((t) => Number(t.price) || 0))
      : 0;

  const grossPotential = formData.ticketTypes.reduce(
    (sum, t) => sum + (Number(t.price) || 0) * (Number(t.totalQuantity) || 0),
    0
  );

  // Active banner image resolution
  const currentBannerImage =
    formData.localFileUrl || formData.bannerUrl || DEFAULT_PRESET_BANNER;

  // Validation Rules
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.title.trim()) {
        newErrors.title = 'Event title is required.';
      } else if (formData.title.trim().length < 5) {
        newErrors.title = 'Event title must be at least 5 characters long.';
      } else if (formData.title.trim().length > 120) {
        newErrors.title = 'Event title cannot exceed 120 characters.';
      }

      if (!formData.category) {
        newErrors.category = 'Please select an event category.';
      }

      if (!formData.description.trim()) {
        newErrors.description = 'Event description is required.';
      } else if (formData.description.trim().length < 20) {
        newErrors.description =
          'Event description must be at least 20 characters long.';
      }
    }

    if (step === 2) {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      if (!formData.eventDate) {
        newErrors.eventDate = 'Event date is required.';
      } else if (formData.eventDate < todayStr) {
        newErrors.eventDate = 'Event date cannot be in the past.';
      }

      if (!formData.startTime) {
        newErrors.startTime = 'Doors open / start time is required.';
      } else if (formData.eventDate) {
        const startsAt = new Date(`${formData.eventDate}T${formData.startTime}`);
        if (Number.isNaN(startsAt.getTime()) || startsAt <= now) {
          newErrors.startTime = 'Choose a start time in the future.';
        }
      }

      if (formData.startTime && formData.endTime && formData.startTime === formData.endTime) {
        newErrors.endTime = 'End time cannot be identical to start time.';
      }

      if (!formData.venue.trim()) {
        newErrors.venue = 'Venue name is required.';
      } else if (formData.venue.trim().length < 3) {
        newErrors.venue = 'Venue name must be at least 3 characters.';
      }

      if (!formData.city) {
        newErrors.city = 'Please choose an operating city.';
      }
    }

    if (step === 3) {
      if (
        formData.artworkType === 'url' &&
        formData.bannerUrl &&
        !/^https?:\/\//i.test(formData.bannerUrl)
      ) {
        newErrors.banner = 'Please provide a valid HTTP or HTTPS image URL.';
      }
    }

    if (step === 4) {
      if (!formData.ticketTypes || formData.ticketTypes.length === 0) {
        newErrors.tiers = 'At least one ticket tier must be configured.';
      } else {
        formData.ticketTypes.forEach((tier, i) => {
          if (!tier.name || !tier.name.trim()) {
            newErrors[`tier_${i}`] = 'Tier name is required.';
          } else if (tier.price === '' || !Number.isFinite(Number(tier.price)) || Number(tier.price) < 1) {
            newErrors[`tier_${i}`] = 'Price must be at least ₹1 to use Razorpay checkout.';
          } else if (
            !tier.totalQuantity ||
            !Number.isInteger(Number(tier.totalQuantity)) ||
            Number(tier.totalQuantity) < 1
          ) {
            newErrors[`tier_${i}`] = 'Quantity must be at least 1 ticket.';
          }
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setErrors({});
      setCurrentStep((prev) => Math.min(5, prev + 1));
      document.getElementById('main-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(1, prev - 1));
    document.getElementById('main-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToStep = (targetStep) => {
    // Only allow skipping to previously validated steps or step 1
    if (targetStep < currentStep || validateStep(currentStep)) {
      setErrors({});
      setCurrentStep(targetStep);
      document.getElementById('main-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Save Draft to LocalStorage
  const handleSaveDraft = () => {
    try {
      const serializableDraft = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        eventDate: formData.eventDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        venue: formData.venue,
        city: formData.city,
        address: formData.address,
        artworkType: formData.artworkType,
        presetId: formData.presetId,
        bannerUrl: formData.bannerUrl?.startsWith('blob:')
          ? DEFAULT_PRESET_BANNER
          : formData.bannerUrl,
        ticketTypes: formData.ticketTypes,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(serializableDraft));
      setStatusNotice({
        title: 'Draft Saved Locally',
        message:
          'Your event configuration has been cached in your browser storage. You can safely reload or return later.',
      });
      setTimeout(() => setStatusNotice(null), 5000);
    } catch (e) {
      console.warn('Could not save event draft:', e);
    }
  };

  // Discard Draft
  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // ignore
    }
    setFormData(initialFormState);
    setCurrentStep(1);
    setErrors({});
    setShowDiscardModal(false);
    setStatusNotice({
      title: 'Draft Discarded',
      message: 'All form fields have been reset to blank defaults.',
    });
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const handlePublishEvent = async () => {
    for (const step of [1, 2, 3, 4]) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        return;
      }
    }
    if (!isSupabaseConfigured) {
      setStatusNotice({ title: 'Supabase is not configured', message: 'Connect the Supabase URL and publishable key before publishing events.' });
      return;
    }

    setIsSubmitting(true);
    setStatusNotice(null);
    let createdEventId = null;
    let uploadedBannerPath = null;
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Sign in with your real Hopi account before publishing.');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      if (profileError) throw new Error('Could not verify your account role. Please try again.');
      if (!profile || !['organizer', 'administrator'].includes(profile.role)) {
        throw new Error('Your Hopi account needs the Organizer or Administrator role to publish events.');
      }

      const startsAt = new Date(`${formData.eventDate}T${formData.startTime}`);
      let endsAt = null;
      if (formData.endTime) {
        endsAt = new Date(`${formData.eventDate}T${formData.endTime}`);
        if (endsAt <= startsAt) endsAt.setDate(endsAt.getDate() + 1);
      }

      const eventPayload = {
        created_by: user.id,
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        starts_at: startsAt.toISOString(),
        ends_at: endsAt?.toISOString() || null,
        venue: formData.address.trim()
          ? `${formData.venue.trim()}, ${formData.address.trim()}`
          : formData.venue.trim(),
        city: formData.city.trim(),
        country: 'India',
        banner_image_url: formData.localFile ? DEFAULT_PRESET_BANNER : (formData.bannerUrl || DEFAULT_PRESET_BANNER),
        status: 'draft',
      };
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert(eventPayload)
        .select('id')
        .single();
      if (eventError || !event) throw new Error(eventError?.code === '42501'
        ? 'Your account is not allowed to create events. Check that its Organizer or Administrator role is set in Supabase.'
        : eventError?.message || 'The event could not be saved.');
      createdEventId = event.id;

      const ticketRows = formData.ticketTypes.map((tier) => ({
        event_id: event.id,
        name: tier.name.trim(),
        price_inr: Number(tier.price),
        available_quantity: Number(tier.totalQuantity),
        perks: Array.isArray(tier.perks) ? tier.perks : [],
      }));
      const { error: ticketsError } = await supabase.from('ticket_types').insert(ticketRows);
      if (ticketsError) throw new Error(ticketsError.code === '42501'
        ? 'The event was saved, but Supabase did not allow its ticket tiers to be added. Check the ticket_types insert policy.'
        : ticketsError.message || 'Ticket tiers could not be saved.');

      if (formData.localFile instanceof File) {
        const extension = formData.localFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        uploadedBannerPath = `${event.id}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from('event-gallery')
          .upload(uploadedBannerPath, formData.localFile, {
            contentType: formData.localFile.type,
            upsert: false,
          });
        if (uploadError) throw new Error(`Ticket details were saved, but the banner upload failed: ${uploadError.message}`);
        const { data: publicImage } = supabase.storage.from('event-gallery').getPublicUrl(uploadedBannerPath);
        const { error: imageUpdateError } = await supabase
          .from('events')
          .update({ banner_image_url: publicImage.publicUrl })
          .eq('id', event.id);
        if (imageUpdateError) throw new Error(`The banner uploaded but could not be attached to the event: ${imageUpdateError.message}`);
      }

      const { error: publishError } = await supabase
        .from('events')
        .update({ status: 'published' })
        .eq('id', event.id);
      if (publishError) throw new Error(publishError.message || 'The event was saved, but could not be published.');

      try { localStorage.removeItem(DRAFT_STORAGE_KEY); } catch { /* ignore */ }
      setStatusNotice({ title: 'Event Published', message: 'Your event and ticket tiers are live and ready for customer checkout.' });
      setShowSubmitModal(true);
    } catch (error) {
      console.error('Event publishing failed', error instanceof Error ? error.message : 'unknown error');
      if (uploadedBannerPath) {
        try { await supabase.storage.from('event-gallery').remove([uploadedBannerPath]); } catch { /* best effort cleanup */ }
      }
      if (createdEventId) {
        const { error: cleanupError } = await supabase.from('events').delete().eq('id', createdEventId);
        if (cleanupError) console.error('Could not clean up incomplete event', cleanupError.code);
      }
      setStatusNotice({
        title: 'Event was not published',
        message: error instanceof Error ? error.message : 'Please check your connection and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, label: 'Basics', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { number: 2, label: 'Schedule & Venue', icon: <Calendar className="w-3.5 h-3.5" /> },
    { number: 3, label: 'Artwork', icon: <Image className="w-3.5 h-3.5" /> },
    { number: 4, label: 'Ticket Tiers', icon: <Ticket className="w-3.5 h-3.5" /> },
    { number: 5, label: 'Review & Verify', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-warmCream text-darkRoast font-serif py-8 px-4 sm:px-6 lg:px-8 select-text">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header & Breadcrumb Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-clayBrown/20">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-clayBrown font-semibold">
                Organiser Portal
              </span>
              <span className="text-clayBrown/40">•</span>
              <span className="text-[11px] font-mono text-clayBrown">
                New Event Listing
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-black text-darkRoast tracking-tight">
              Create a New Event
            </h1>
            <p className="text-xs sm:text-sm text-clayBrown/80 max-w-xl">
              Configure your event identity, venue schedule, promotional artwork, and tiered ticketing.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              id="back-to-organiser-btn"
              onClick={() => onNavigate && onNavigate('organiser-profile')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-serif font-bold border border-clayBrown/40 bg-warmCream text-darkRoast hover:bg-clayBrown/10 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-terracotta shrink-0" />
              <span>Back to Organiser</span>
            </button>

            <button
              type="button"
              id="save-draft-header-btn"
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-serif font-bold border border-clayBrown/60 bg-warmCream text-darkRoast hover:bg-clayBrown/10 transition-all cursor-pointer shadow-dune-sm"
              title="Save current progress to local browser storage"
            >
              <Save className="w-3.5 h-3.5 text-terracotta shrink-0" />
              <span>Save Draft</span>
            </button>
          </div>
        </div>

        {/* Global Progress Bar & Step Navigation */}
        <div className="bg-elevated border border-clayBrown/40 rounded-2xl p-3 sm:p-4 shadow-dune-md">
          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            {steps.map((s) => {
              const isActive = currentStep === s.number;
              const isPast = currentStep > s.number;
              return (
                <button
                  key={s.number}
                  type="button"
                  id={`create-step-pill-${s.number}`}
                  onClick={() => handleGoToStep(s.number)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-serif font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-clayBrown text-softButter border border-terracotta shadow-sm font-bold'
                      : isPast
                      ? 'bg-darkRoast/80 text-warmCream hover:bg-clayBrown/30 border border-elevatedBorder'
                      : 'text-mutedClay hover:text-warmCream border border-transparent'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                      isActive
                        ? 'bg-terracotta text-softButter'
                        : isPast
                        ? 'bg-softButter/20 text-softButter'
                        : 'bg-elevatedBorder text-mutedClay'
                    }`}
                  >
                    {isPast ? <Check className="w-3 h-3 stroke-[3]" /> : s.number}
                  </div>
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Preview Toggle Button */}
        <div className="lg:hidden">
          <button
            type="button"
            id="mobile-preview-toggle-btn"
            onClick={() => setShowMobilePreview(!showMobilePreview)}
            className="w-full py-2.5 px-4 rounded-xl bg-elevated border border-clayBrown/40 text-softButter text-xs font-serif font-bold flex items-center justify-between shadow-sm cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-terracotta" />
              <span>{showMobilePreview ? 'Hide Live Preview' : 'Show Live EventCard Preview'}</span>
            </div>
            <span className="text-[11px] font-mono text-terracotta">
              {showMobilePreview ? 'Close ▲' : 'Open ▼'}
            </span>
          </button>
        </div>

        {/* Main 2-Column Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Step Container (8 cols) */}
          <div className="lg:col-span-8 w-full space-y-6">
            <div className="bg-elevated border border-clayBrown/40 rounded-2xl p-6 sm:p-8 text-warmCream shadow-dune-md">
              {currentStep === 1 && (
                <EventBasicsStep
                  formData={formData}
                  onChange={handleFieldChange}
                  errors={errors}
                />
              )}

              {currentStep === 2 && (
                <DateVenueStep
                  formData={formData}
                  onChange={handleFieldChange}
                  errors={errors}
                />
              )}

              {currentStep === 3 && (
                <EventArtworkStep
                  formData={formData}
                  onChange={handleFieldChange}
                  errors={errors}
                  currentBannerImage={currentBannerImage}
                />
              )}

              {currentStep === 4 && (
                <TicketConfigStep
                  ticketTypes={formData.ticketTypes}
                  onAddTier={handleAddTier}
                  onUpdateTier={handleUpdateTier}
                  onRemoveTier={handleRemoveTier}
                  errors={errors}
                />
              )}

              {currentStep === 5 && (
                <EventReviewStep
                  formData={formData}
                  currentBannerImage={currentBannerImage}
                  startingPrice={startingPrice}
                  totalCapacity={totalCapacity}
                  grossPotential={grossPotential}
                  currentUser={currentUser}
                  onGoToStep={handleGoToStep}
                  onSaveDraft={handleSaveDraft}
                  onPublishEvent={handlePublishEvent}
                  isSubmitting={isSubmitting}
                  statusNotice={statusNotice}
                />
              )}

              {/* Bottom Navigation Buttons Bar */}
              <div className="pt-8 mt-6 border-t border-elevatedBorder flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {currentStep > 1 ? (
                    <Button
                      type="button"
                      id="step-prev-btn"
                      variant="outline"
                      size="md"
                      icon={<ChevronLeft className="w-4 h-4" />}
                      onClick={handleBack}
                    >
                      Previous Step
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      id="discard-draft-btn"
                      variant="ghost"
                      size="md"
                      className="text-mutedClay hover:text-red-400"
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => setShowDiscardModal(true)}
                    >
                      Discard Draft
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {currentStep < 5 ? (
                    <Button
                      type="button"
                      id="step-next-btn"
                      variant="primary"
                      size="md"
                      icon={<ChevronRight className="w-4 h-4" />}
                      onClick={handleNext}
                    >
                      Continue to {steps[currentStep]?.label || 'Next'}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      id="finish-review-btn"
                      variant="primary"
                      size="md"
                      icon={<CheckCircle2 className="w-4 h-4" />}
                      disabled={isSubmitting}
                      onClick={handlePublishEvent}
                    >
                      Publish Event
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Preview Sticky Sidebar (4 cols) */}
          <div
            className={`lg:col-span-4 w-full space-y-4 ${
              showMobilePreview ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="sticky top-24 bg-elevated border border-clayBrown/40 rounded-2xl p-5 sm:p-6 text-warmCream shadow-dune-md">
              <CreateEventLivePreview
                formData={formData}
                currentBannerImage={currentBannerImage}
                startingPrice={startingPrice}
                totalCapacity={totalCapacity}
                grossPotential={grossPotential}
                currentUser={currentUser}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Discard Draft Confirmation Modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-md w-full bg-elevated border border-clayBrown/60 rounded-2xl p-6 sm:p-8 space-y-4 text-warmCream shadow-dune-lg">
            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-serif font-black text-xl text-softButter">
                Discard This Event Draft?
              </h3>
              <p className="text-xs text-mutedClay leading-relaxed">
                This will clear all inputted event details, dates, and configured ticket tiers from this browser session. This action cannot be undone.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowDiscardModal(false)}
              >
                Keep Editing
              </Button>
              <Button
                variant="secondary"
                size="md"
                className="bg-red-900/60 hover:bg-red-800 text-red-200 border-red-700/60"
                onClick={handleDiscardDraft}
              >
                Discard All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Published Event Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-lg w-full bg-elevated border border-terracotta/60 rounded-2xl p-6 sm:p-8 space-y-5 text-warmCream shadow-dune-lg">
            <div className="w-14 h-14 rounded-2xl bg-clayBrown/40 border border-terracotta text-softButter flex items-center justify-center mx-auto shadow-dune-sm">
              <CheckCircle2 className="w-7 h-7 text-softButter" />
            </div>

            <div className="text-center space-y-2">
              <Badge variant="butter" size="sm">
                Event Published
              </Badge>
              <h3 className="font-serif font-black text-2xl text-softButter">
                Your Event Is Live
              </h3>
              <p className="text-xs sm:text-sm text-mutedClay leading-relaxed">
                <strong>"{formData.title}"</strong> is published with its ticket tiers and can now accept Razorpay test payments.
              </p>
            </div>

            <div className="bg-darkRoast border border-clayBrown/60 rounded-xl p-4 text-xs space-y-2 text-warmCream/90 font-serif">
              <div className="flex items-center gap-2 text-softButter font-bold">
                <Sparkles className="w-4 h-4 text-terracotta" />
                <span>Ready for Ticket Checkout</span>
              </div>
              <p className="text-[11px] text-mutedClay leading-relaxed">
                Customers can find this event in Explore Events and complete checkout using the Razorpay test keys configured for Hopi.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center"
                onClick={() => {
                  setShowSubmitModal(false);
                  if (onNavigate) onNavigate('organiser-profile');
                }}
              >
                Return to Organiser Profile
              </Button>

              <Button
                variant="outline"
                size="md"
                className="w-full justify-center"
                onClick={() => setShowSubmitModal(false)}
              >
                Continue Editing
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
