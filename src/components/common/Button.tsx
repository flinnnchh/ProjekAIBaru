import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'danger' | 'warning' | 'success' | 'outline' | 'ghost' | 'navy' | 'tonal';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = [
    "inline-flex items-center justify-center font-bold",
    "rounded-xl",
    "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
    "focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3DD6E8]",
    "active:scale-[0.97]",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
    "ripple-container",
    "select-none",
    "relative overflow-hidden",
  ].join(' ');

  const sizeStyles: Record<string, string> = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5",
    md: "px-4.5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-sm gap-2.5",
  };

  const variantStyles: Record<string, string> = {
    // M3 Filled — Gold Primary CTA
    primary: [
      "bg-gradient-to-b from-[#F5B400] to-[#E5A800] text-[#0B1220]",
      "font-extrabold",
      "shadow-md shadow-[#F5B400]/20",
      "hover:shadow-lg hover:shadow-[#F5B400]/30 hover:from-[#FFc520] hover:to-[#F5B400]",
      "ripple-dark",
    ].join(' '),
    // Same as primary
    accent: [
      "bg-gradient-to-b from-[#F5B400] to-[#E5A800] text-[#0B1220]",
      "font-extrabold",
      "shadow-md shadow-[#F5B400]/20",
      "hover:shadow-lg hover:shadow-[#F5B400]/30 hover:from-[#FFc520] hover:to-[#F5B400]",
      "ripple-dark",
    ].join(' '),
    success: [
      "bg-gradient-to-b from-[#F5B400] to-[#E5A800] text-[#0B1220]",
      "font-extrabold",
      "shadow-md shadow-[#F5B400]/20",
      "hover:shadow-lg hover:shadow-[#F5B400]/30 hover:from-[#FFc520] hover:to-[#F5B400]",
      "ripple-dark",
    ].join(' '),
    // M3 Filled — Warning/Pause
    warning: [
      "bg-gradient-to-b from-[#D9A441] to-[#C89430] text-[#0B1220]",
      "font-extrabold",
      "shadow-md shadow-[#D9A441]/20",
      "hover:shadow-lg hover:shadow-[#D9A441]/30",
      "ripple-dark",
    ].join(' '),
    // M3 Filled — Danger/Record (Maroon)
    danger: [
      "bg-gradient-to-b from-[#8A2B38] to-[#7A2530] text-white",
      "border border-[#992E3C]/40",
      "shadow-md shadow-[#7A2530]/30",
      "hover:shadow-lg hover:shadow-[#7A2530]/40 hover:from-[#992E3C] hover:to-[#8A2B38]",
    ].join(' '),
    // M3 Tonal — Navy
    navy: [
      "bg-gradient-to-b from-[#3F5585] to-[#3A4E7A] text-white",
      "border border-[#4A6296]/30",
      "shadow-md shadow-black/20",
      "hover:shadow-lg hover:shadow-black/30 hover:from-[#4A6296] hover:to-[#3F5585]",
    ].join(' '),
    // M3 Tonal — Subtle tonal
    tonal: [
      "bg-[#1A2845] text-[#3DD6E8]",
      "border border-[#233863]",
      "hover:bg-[#1F3050] hover:text-white hover:border-[#3DD6E8]/40",
    ].join(' '),
    // M3 Outlined
    secondary: [
      "bg-[#141E33]/80 text-[#B8BFC9]",
      "border border-[#233863]",
      "hover:text-white hover:bg-[#1A2845] hover:border-[#3A4E7A]",
    ].join(' '),
    outline: [
      "bg-transparent text-[#B8BFC9]",
      "border border-[#233863]",
      "hover:text-white hover:border-[#3DD6E8]/50 hover:bg-[#141E33]/60",
    ].join(' '),
    // M3 Text / Ghost
    ghost: [
      "text-[#B8BFC9]",
      "hover:text-white hover:bg-white/8",
    ].join(' '),
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="material-symbols-outlined icon-sm animate-spin">progress_activity</span>
      ) : (
        icon
      )}
      {children}
      {iconRight}
    </button>
  );
};
