import React from 'react';
import { Check, Sparkles, AlertCircle, Plus, Minus } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

/**
 * TicketTierCard component displays an individual ticket tier with perks,
 * remaining availability, and quantity controls.
 *
 * @param {Object} tier - Tier object { name, price, availableQuantity, perks }
 * @param {number} quantity - Currently selected quantity
 * @param {Function} onQuantityChange - Callback (newQuantity) => void
 * @param {boolean} isSelected - Whether this tier is currently active
 */
export default function TicketTierCard({
  tier,
  quantity = 0,
  onQuantityChange,
  isSelected = false,
}) {
  if (!tier) return null;

  const isLowStock = tier.availableQuantity <= 25;

  return (
    <div
      className={`relative rounded-xl p-6 transition-all duration-300 flex flex-col justify-between border ${
        isSelected || quantity > 0
          ? 'bg-elevated border-terracotta shadow-terracotta-glow ring-1 ring-terracotta/40'
          : 'bg-elevated/70 border-elevatedBorder hover:border-clayBrown/80 hover:bg-elevated'
      }`}
    >
      {/* Top Header: Tier Name and Price */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-serif font-bold text-lg text-softButter">
                {tier.name}
              </h4>
              {tier.name.toLowerCase().includes('vip') || tier.name.toLowerCase().includes('royal') ? (
                <Badge variant="butter" size="sm">
                  Exclusive
                </Badge>
              ) : null}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-mutedClay">
                {tier.availableQuantity} passes available
              </span>
              {isLowStock && (
                <Badge variant="terracotta" size="sm" dot>
                  Limited
                </Badge>
              )}
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-mutedClay block uppercase font-mono">Per Guest</span>
            <div className="font-mono font-bold text-2xl text-softButter">
              ₹{tier.price.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Perks Checklist */}
        <div className="pt-3 border-t border-elevatedBorder/70 space-y-2.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-mutedClay block">
            Tier Privileges Included
          </span>
          <ul className="space-y-2">
            {tier.perks.map((perk, index) => (
              <li
                key={index}
                className="flex items-start gap-2.5 text-xs text-warmCream/90"
              >
                <div className="w-4 h-4 rounded-full bg-clayBrown/30 border border-clayBrown/60 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-softButter" />
                </div>
                <span>{perk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Selector Controls */}
      <div className="pt-6 mt-4 border-t border-elevatedBorder/70 flex items-center justify-between gap-4">
        <div className="flex items-center bg-darkRoast rounded-lg border border-elevatedBorder p-1">
          <button
            type="button"
            disabled={quantity <= 0}
            onClick={() => onQuantityChange && onQuantityChange(Math.max(0, quantity - 1))}
            className="w-8 h-8 rounded flex items-center justify-center text-mutedClay hover:text-warmCream hover:bg-elevated disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <span className="w-10 text-center font-mono font-bold text-sm text-softButter">
            {quantity}
          </span>

          <button
            type="button"
            disabled={quantity >= Math.min(tier.availableQuantity, 10)}
            onClick={() => onQuantityChange && onQuantityChange(quantity + 1)}
            className="w-8 h-8 rounded flex items-center justify-center text-mutedClay hover:text-warmCream hover:bg-elevated disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <Button
          variant={quantity > 0 ? 'primary' : 'outline'}
          size="sm"
          onClick={() => {
            if (quantity === 0) {
              onQuantityChange && onQuantityChange(1);
            }
          }}
        >
          {quantity > 0 ? `${quantity} Selected` : 'Select Tier'}
        </Button>
      </div>
    </div>
  );
}
