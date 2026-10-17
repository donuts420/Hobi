import React from 'react';

/**
 * Button component configured with the Dune / Desert Ochre design system tokens.
 *
 * @param {'primary' | 'secondary' | 'outline' | 'ghost' | 'butter'} variant
 * @param {'sm' | 'md' | 'lg'} size
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon = null,
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-serif font-semibold tracking-wide rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-terracotta/50 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-terracotta text-softButter hover:bg-terracottaHover border border-terracotta/40 shadow-dune-sm hover:shadow-terracotta-glow',
    secondary:
      'bg-clayBrown text-warmCream hover:bg-[#7e3f33] border border-clayBrown/70 shadow-dune-sm',
    outline:
      'bg-transparent text-warmCream border border-clayBrown hover:border-terracotta hover:text-softButter hover:bg-elevated',
    ghost:
      'bg-transparent text-mutedClay hover:text-warmCream hover:bg-elevated/60',
    butter:
      'bg-softButter text-darkRoast hover:bg-[#fff6c2] border border-softButter/60 shadow-dune-sm font-bold',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
