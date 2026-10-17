import React, { useState } from 'react';
import { Check, Copy, Shield } from 'lucide-react';

/**
 * CodeSlots component displays segmented monospace character slots for ticket access codes,
 * OTP verification, and cryptographic stub IDs.
 *
 * @param {string} code - The code string to render (e.g., 'TRX-8842')
 * @param {boolean} copyable - Enables one-click copy to clipboard
 * @param {string} label - Context label above slots
 */
export default function CodeSlots({
  code = 'TRX-9481',
  copyable = true,
  label = 'TICKET VERIFICATION HASH',
  size = 'md',
}) {
  const [copied, setCopied] = useState(false);

  const characters = code.split('');

  const handleCopy = () => {
    if (!copyable) return;
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const slotSize = {
    sm: 'w-7 h-9 text-xs',
    md: 'w-9 h-11 text-sm',
    lg: 'w-11 h-14 text-base font-bold',
  };

  return (
    <div className="flex flex-col items-center sm:items-start gap-2">
      {label && (
        <div className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase font-serif text-mutedClay">
          <Shield className="w-3 h-3 text-terracotta" />
          <span>{label}</span>
        </div>
      )}

      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {characters.map((char, index) => {
            const isDash = char === '-' || char === ' ';
            if (isDash) {
              return (
                <span
                  key={index}
                  className="font-mono text-mutedClay font-bold px-0.5 select-none"
                >
                  —
                </span>
              );
            }

            return (
              <div
                key={index}
                className={`${slotSize[size] || slotSize.md} flex items-center justify-center font-mono font-bold text-softButter bg-darkRoast rounded border border-elevatedBorder shadow-inner transition-all hover:border-terracotta`}
              >
                {char}
              </div>
            );
          })}
        </div>

        {copyable && (
          <button
            type="button"
            onClick={handleCopy}
            title="Copy verification code"
            className="p-2 ml-1 rounded bg-elevated hover:bg-elevatedBorder border border-elevatedBorder text-mutedClay hover:text-warmCream transition-colors flex items-center justify-center"
          >
            {copied ? (
              <Check className="w-4 h-4 text-softButter" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {copied && (
        <span className="text-[11px] font-mono text-softButter tracking-wider animate-fadeIn">
          ✓ Pass hash copied to clipboard
        </span>
      )}
    </div>
  );
}
