import React from 'react';

/**
 * Badge component matching the Desert Ochre palette.
 *
 * @param {'terracotta' | 'butter' | 'clay' | 'elevated' | 'outline'} variant
 * @param {'sm' | 'md'} size
 */
export default function Badge({
  children,
  variant = 'terracotta',
  size = 'sm',
  className = '',
  dot = false,
}) {
  const baseStyles =
    'inline-flex items-center font-serif font-medium tracking-wider uppercase transition-colors select-none rounded';

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
  };

  const variantStyles = {
    terracotta: 'bg-terracotta/20 text-terracotta border border-terracotta/40',
    butter: 'bg-softButter/15 text-softButter border border-softButter/30',
    clay: 'bg-clayBrown/30 text-mutedClay border border-clayBrown/60',
    elevated: 'bg-elevated text-warmCream border border-elevatedBorder',
    outline: 'bg-transparent text-mutedClay border border-elevatedBorder',
  };

  const dotStyles = {
    terracotta: 'bg-terracotta',
    butter: 'bg-softButter',
    clay: 'bg-clayBrown',
    elevated: 'bg-warmCream',
    outline: 'bg-mutedClay',
  };

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.sm} ${
        variantStyles[variant] || variantStyles.terracotta
      } ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            dotStyles[variant] || dotStyles.terracotta
          } animate-pulse`}
        />
      )}
      {children}
    </span>
  );
}
