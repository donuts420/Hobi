import React, { useState } from 'react';
import { Ticket, Plus, Trash2, Check, Sparkles, DollarSign, Users, AlertCircle, Tag, X } from 'lucide-react';
import Button from '../../common/Button';
import Badge from '../../common/Badge';

export default function TicketConfigStep({
  ticketTypes,
  onAddTier,
  onUpdateTier,
  onRemoveTier,
  errors = {},
}) {
  const [newPerkInputs, setNewPerkInputs] = useState({});

  const handleAddPerk = (tierIndex) => {
    const perkText = (newPerkInputs[tierIndex] || '').trim();
    if (!perkText) return;

    const currentTier = ticketTypes[tierIndex];
    const updatedPerks = [...(currentTier.perks || []), perkText];
    onUpdateTier(tierIndex, 'perks', updatedPerks);
    setNewPerkInputs((prev) => ({ ...prev, [tierIndex]: '' }));
  };

  const handleRemovePerk = (tierIndex, perkIndex) => {
    const currentTier = ticketTypes[tierIndex];
    const updatedPerks = (currentTier.perks || []).filter((_, i) => i !== perkIndex);
    onUpdateTier(tierIndex, 'perks', updatedPerks);
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-elevatedBorder">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-terracotta font-semibold">
              Step 4 of 5
            </span>
            <span className="text-mutedClay">•</span>
            <span className="text-xs text-mutedClay">Ticketing & Pricing</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-black text-softButter mt-1">
            Ticket Tiers & Capacity
          </h3>
          <p className="text-xs sm:text-sm text-mutedClay mt-1">
            Configure passes, seating zones, allocation limits, and ticket prices in Indian Rupees (₹).
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5 text-softButter" />}
          onClick={onAddTier}
        >
          Add Ticket Tier
        </Button>
      </div>

      {errors.tiers && (
        <div className="bg-darkRoast border border-red-500/60 rounded-xl p-3.5 text-xs text-red-300 flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errors.tiers}</span>
        </div>
      )}

      {/* Ticket Tier Cards List */}
      <div className="space-y-4">
        {ticketTypes.map((tier, index) => {
          const tierError = errors[`tier_${index}`];
          return (
            <div
              key={tier.id || index}
              className="bg-darkRoast/80 rounded-2xl border border-elevatedBorder p-5 sm:p-6 space-y-4 relative group hover:border-clayBrown/70 transition-all"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between gap-4 pb-3 border-b border-elevatedBorder">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-clayBrown/40 border border-clayBrown/80 flex items-center justify-center text-xs font-mono font-bold text-softButter">
                    {index + 1}
                  </div>
                  <h4 className="font-serif font-bold text-warmCream text-sm">
                    {tier.name || `Tier ${index + 1}`}
                  </h4>
                  {Number(tier.price) === 0 && (
                    <Badge variant="butter" size="sm">
                      Free RSVP
                    </Badge>
                  )}
                </div>

                {ticketTypes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveTier(index)}
                    className="p-1.5 rounded-lg text-mutedClay hover:text-red-400 hover:bg-elevated transition-colors cursor-pointer"
                    title="Remove this ticket tier"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Tier Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Tier Name */}
                <div className="space-y-1 sm:col-span-1">
                  <label className="block text-[11px] font-serif uppercase tracking-wider text-softButter font-semibold">
                    Tier Name <span className="text-terracotta">*</span>
                  </label>
                  <input
                    type="text"
                    value={tier.name}
                    onChange={(e) => onUpdateTier(index, 'name', e.target.value)}
                    placeholder="e.g. General Admission, Gold Fan Pit"
                    className="w-full bg-elevated text-warmCream placeholder-mutedClay/60 text-xs font-serif px-3 py-2 rounded-xl border border-elevatedBorder focus:outline-none focus:border-terracotta transition-colors"
                  />
                </div>

                {/* Price (INR) */}
                <div className="space-y-1 sm:col-span-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-serif uppercase tracking-wider text-softButter font-semibold">
                      Price (₹ INR) <span className="text-terracotta">*</span>
                    </label>
                    <span className="text-[10px] text-mutedClay font-mono">₹0 = Free</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={tier.price}
                      onChange={(e) => onUpdateTier(index, 'price', e.target.value)}
                      placeholder="e.g. 999"
                      className="w-full bg-elevated text-warmCream text-xs font-mono px-3 py-2 pl-7 rounded-xl border border-elevatedBorder focus:outline-none focus:border-terracotta transition-colors"
                    />
                    <span className="text-mutedClay text-xs font-mono absolute left-2.5 top-2">
                      ₹
                    </span>
                  </div>
                </div>

                {/* Total Capacity Allocation */}
                <div className="space-y-1 sm:col-span-1">
                  <label className="block text-[11px] font-serif uppercase tracking-wider text-softButter font-semibold">
                    Pass Allocation <span className="text-terracotta">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={tier.totalQuantity}
                      onChange={(e) => onUpdateTier(index, 'totalQuantity', e.target.value)}
                      placeholder="e.g. 150"
                      className="w-full bg-elevated text-warmCream text-xs font-mono px-3 py-2 pl-7 rounded-xl border border-elevatedBorder focus:outline-none focus:border-terracotta transition-colors"
                    />
                    <Users className="w-3.5 h-3.5 text-mutedClay absolute left-2.5 top-2.5" />
                  </div>
                </div>
              </div>

              {tierError && (
                <p className="text-xs text-red-400 flex items-center gap-1.5 pt-0.5 animate-fadeIn">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{tierError}</span>
                </p>
              )}

              {/* Tier Privileges / Perks Tag List */}
              <div className="space-y-2 pt-2 border-t border-elevatedBorder/60">
                <span className="block text-[11px] font-serif uppercase tracking-wider text-mutedClay">
                  Included Privileges & Amenities (Optional)
                </span>

                <div className="flex flex-wrap gap-1.5">
                  {(tier.perks || []).map((perk, perkIdx) => (
                    <span
                      key={perkIdx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-serif bg-elevated text-warmCream border border-elevatedBorder"
                    >
                      <Check className="w-3 h-3 text-softButter" />
                      <span>{perk}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePerk(index, perkIdx)}
                        className="text-mutedClay hover:text-red-400 cursor-pointer p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add Perk Input */}
                <div className="flex items-center gap-2 max-w-md pt-1">
                  <input
                    type="text"
                    value={newPerkInputs[index] || ''}
                    onChange={(e) =>
                      setNewPerkInputs((prev) => ({ ...prev, [index]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPerk(index);
                      }
                    }}
                    placeholder="e.g. Dedicated gate entry, Free welcome drink"
                    className="flex-1 bg-elevated text-warmCream placeholder-mutedClay/60 text-xs font-serif px-3 py-1.5 rounded-lg border border-elevatedBorder focus:outline-none focus:border-terracotta transition-colors"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddPerk(index)}
                  >
                    Add Perk
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Tier Action Button at Bottom */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onAddTier}
          className="w-full py-3 px-4 rounded-xl border border-dashed border-clayBrown/60 hover:border-terracotta text-softButter text-xs font-serif font-bold flex items-center justify-center gap-2 hover:bg-darkRoast transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-terracotta" />
          <span>Add Another Ticket Tier</span>
        </button>
      </div>
    </div>
  );
}
