import React, { useState, useRef, useEffect } from 'react';
import { Image, Upload, Globe, Sparkles, Check, AlertCircle, Info } from 'lucide-react';
import Badge from '../../common/Badge';

export default function EventArtworkStep({
  formData,
  onChange,
  errors = {},
  currentBannerImage,
}) {
  const [artworkTab, setArtworkTab] = useState(formData.artworkType || 'preset');
  const [fileError, setFileError] = useState(null);
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Curated Preset Banners matching Hopi's Desert Ochre / Live Event Aesthetic
  const presets = [
    {
      id: 'preset-concert',
      title: 'Acoustic Concert & Indie Live',
      category: 'Concerts & Gigs',
      url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'preset-comedy',
      title: 'Standup Comedy & Stage Spotlight',
      category: 'Standup Comedy',
      url: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'preset-nightlife',
      title: 'Electronic Arena & Neon Nightlife',
      category: 'Nightlife & Clubs',
      url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'preset-culinary',
      title: 'Culinary Pop-up & Cultural Arts',
      category: 'Food & Drinks',
      url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  const handleTabChange = (tab) => {
    setArtworkTab(tab);
    onChange('artworkType', tab);
    setFileError(null);
  };

  const handlePresetSelect = (preset) => {
    onChange('presetId', preset.id);
    onChange('bannerUrl', preset.url);
    onChange('localFile', null);
    onChange('localFileUrl', null);
    setFileError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFileError(null);

    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setFileError('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    // Validate size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError('File size exceeds 5 MB limit. Please compress or choose a smaller image.');
      return;
    }

    // Revoke previous blob if any
    if (formData.localFileUrl && formData.localFileUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(formData.localFileUrl);
      } catch {
        // ignore
      }
    }

    // Generate local preview blob URL
    const blobUrl = URL.createObjectURL(file);
    onChange('localFile', file);
    onChange('localFileUrl', blobUrl);
    onChange('bannerUrl', blobUrl);
  };

  const handleGalleryFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const current = formData.galleryFiles || [];
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (current.length + files.length > 5) {
      setFileError('Choose up to 5 additional photos.');
    } else if (files.some((file) => !validTypes.includes(file.type))) {
      setFileError('Additional photos must be JPEG, PNG, or WebP.');
    } else if (files.some((file) => file.size > 5 * 1024 * 1024)) {
      setFileError('Each additional photo must be 5 MB or smaller.');
    } else {
      onChange('galleryFiles', [...current, ...files]);
      setFileError(null);
    }
    e.target.value = '';
  };

  const handleUrlInput = (val) => {
    onChange('bannerUrl', val);
    onChange('localFile', null);
    onChange('localFileUrl', null);
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-terracotta font-semibold">
            Step 3 of 5
          </span>
          <span className="text-mutedClay">•</span>
          <span className="text-xs text-mutedClay">Visual Identity</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-serif font-black text-softButter mt-1">
          Event Artwork & Media
        </h3>
        <p className="text-xs sm:text-sm text-mutedClay mt-1">
          Select or preview promotional banner imagery for your live listing (recommended 16:10 aspect ratio).
        </p>
      </div>

      {/* Artwork Source Method Selector */}
      <div className="flex items-center gap-2 p-1 bg-darkRoast rounded-xl border border-elevatedBorder">
        <button
          type="button"
          onClick={() => handleTabChange('preset')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-serif font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            artworkTab === 'preset'
              ? 'bg-elevated text-softButter border border-terracotta/60 shadow-sm'
              : 'text-mutedClay hover:text-warmCream'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-terracotta" />
          <span>Curated Presets</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('file')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-serif font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            artworkTab === 'file'
              ? 'bg-elevated text-softButter border border-terracotta/60 shadow-sm'
              : 'text-mutedClay hover:text-warmCream'
          }`}
        >
          <Upload className="w-3.5 h-3.5 text-terracotta" />
          <span>Upload Image</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('url')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-serif font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            artworkTab === 'url'
              ? 'bg-elevated text-softButter border border-terracotta/60 shadow-sm'
              : 'text-mutedClay hover:text-warmCream'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-terracotta" />
          <span>Image URL</span>
        </button>
      </div>

      {/* Tab 1: Curated Presets */}
      {artworkTab === 'preset' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {presets.map((preset) => {
              const isSelected = formData.bannerUrl === preset.url;
              return (
                <div
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset)}
                  className={`group relative rounded-xl border overflow-hidden p-2.5 transition-all cursor-pointer flex items-center gap-3 ${
                    isSelected
                      ? 'bg-elevated border-terracotta shadow-dune-sm ring-1 ring-terracotta'
                      : 'bg-darkRoast border-elevatedBorder hover:border-clayBrown/70'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.title}
                    className="w-16 h-12 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono uppercase text-terracotta block truncate">
                      {preset.category}
                    </span>
                    <h5 className="text-xs font-serif font-bold text-warmCream truncate group-hover:text-softButter transition-colors">
                      {preset.title}
                    </h5>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-terracotta flex items-center justify-center text-softButter shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-mutedClay">
            Instant high-resolution photography professionally styled for Hopi's Dune aesthetic.
          </p>
        </div>
      )}

      {/* Tab 2: Local File Selector */}
      {artworkTab === 'file' && (
        <div className="space-y-4 animate-fadeIn">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-clayBrown/60 hover:border-terracotta/80 rounded-2xl p-6 sm:p-8 text-center bg-darkRoast/70 hover:bg-darkRoast transition-all cursor-pointer space-y-3 group"
          >
            <div className="w-12 h-12 rounded-full bg-elevated border border-terracotta/40 flex items-center justify-center mx-auto text-terracotta group-hover:scale-105 transition-transform shadow-inner">
              <Upload className="w-5 h-5" />
            </div>

            <div>
              <p className="text-xs sm:text-sm font-serif font-bold text-softButter">
                Click to browse and choose a local image
              </p>
              <p className="text-[11px] text-mutedClay mt-1">
                Supports JPG, PNG, and WebP (Max file size: 5 MB)
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Local-Only Honesty Notice */}
          <div className="bg-clayBrown/25 border border-terracotta/50 rounded-xl p-3.5 flex items-start gap-3 text-xs text-softButter">
            <Info className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Uploaded When You Publish</p>
              <p className="text-mutedClay text-[11px] leading-relaxed">
                Your image is uploaded to the event gallery when you publish. Use a curated preset or public image URL if you do not want to upload a file.
              </p>
            </div>
          </div>

          {fileError && (
            <p className="text-xs text-red-400 flex items-center gap-1.5 animate-fadeIn">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{fileError}</span>
            </p>
          )}

          {formData.localFile && !fileError && (
            <div className="text-xs font-mono text-softButter bg-elevated border border-elevatedBorder p-2.5 rounded-lg flex items-center justify-between">
              <span className="truncate max-w-[240px]">Selected: {formData.localFile.name}</span>
              <span className="text-mutedClay">
                ({(formData.localFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          )}
        </div>
      )}

      <section className="space-y-3 border-t border-elevatedBorder pt-4">
        <div>
          <h4 className="text-sm font-serif font-bold text-softButter">Event Photos</h4>
          <p className="text-[11px] text-mutedClay">Add up to 5 extra photos (JPEG, PNG, or WebP; 5 MB each). They appear after the banner.</p>
        </div>
        <input ref={galleryInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleGalleryFiles} className="hidden" />
        <button type="button" onClick={() => galleryInputRef.current?.click()} disabled={(formData.galleryFiles || []).length >= 5} className="rounded-lg border border-terracotta/60 px-3 py-2 text-xs text-softButter disabled:opacity-50">
          Add photos ({(formData.galleryFiles || []).length}/5)
        </button>
        {(formData.galleryFiles || []).map((file, index) => (
          <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg bg-elevated p-2 text-xs text-softButter">
            <span className="truncate">{file.name}</span>
            <button type="button" onClick={() => onChange('galleryFiles', formData.galleryFiles.filter((_, i) => i !== index))} aria-label={`Remove ${file.name}`} className="text-terracotta">Remove</button>
          </div>
        ))}
        {fileError && <p role="alert" className="text-xs text-red-400">{fileError}</p>}
      </section>

      {/* Tab 3: Custom Image URL */}
      {artworkTab === 'url' && (
        <div className="space-y-3 animate-fadeIn">
          <label
            htmlFor="banner-url"
            className="block text-xs font-serif uppercase tracking-wider text-softButter font-semibold"
          >
            Direct Image URL (HTTP / HTTPS)
          </label>
          <div className="relative">
            <input
              id="banner-url"
              type="url"
              value={formData.bannerUrl?.startsWith('blob:') ? '' : formData.bannerUrl}
              onChange={(e) => handleUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full bg-darkRoast text-warmCream placeholder-mutedClay/60 text-xs font-mono px-3.5 py-2.5 pl-10 rounded-xl border border-elevatedBorder focus:outline-none focus:border-terracotta transition-colors"
            />
            <Globe className="w-4 h-4 text-mutedClay absolute left-3.5 top-3" />
          </div>
          <p className="text-[11px] text-mutedClay">
            Enter a publicly accessible HTTPS image link from Unsplash, CDN, or cloud hosting.
          </p>
        </div>
      )}

      {errors.banner && (
        <p className="text-xs text-red-400 flex items-center gap-1.5 pt-0.5 animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errors.banner}</span>
        </p>
      )}

      {/* Current Preview Aspect Box */}
      <div className="space-y-2 pt-2 border-t border-elevatedBorder">
        <div className="flex items-center justify-between text-xs font-serif">
          <span className="text-mutedClay">Aspect Ratio 16:10 Media Stage Preview</span>
          <Badge variant="clay" size="sm">
            {artworkTab === 'preset' ? 'Preset' : artworkTab === 'file' ? 'Local File' : 'External URL'}
          </Badge>
        </div>

        <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-darkRoast border border-elevatedBorder group">
          <img
            src={currentBannerImage}
            alt="Event banner preview"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = presets[0].url;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-darkRoast/80 via-transparent to-transparent flex items-end p-4">
            <span className="text-xs font-mono text-softButter bg-darkRoast/80 backdrop-blur-md px-2.5 py-1 rounded border border-elevatedBorder">
              Hopi Event Banner Preview
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
