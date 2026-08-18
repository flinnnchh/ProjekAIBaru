import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'danger' | 'warning' | 'success' | 'outline' | 'ghost' | 'navy';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B1220] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none";

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  };

  const variantStyles = {
    // Primary CTA is Gold #F5B400 with dark navy text #0B1220 (as recommended for LUI)
    primary: "bg-[#F5B400] hover:bg-[#E5A800] text-[#0B1220] font-extrabold shadow-md shadow-[#F5B400]/25 focus:ring-[#F5B400]",
    // Accent CTA is also Gold
    accent: "bg-[#F5B400] hover:bg-[#E5A800] text-[#0B1220] font-extrabold shadow-md shadow-[#F5B400]/25 focus:ring-[#F5B400]",
    // Pause button is lighter gold #D9A441 with dark navy text #0B1220
    warning: "bg-[#D9A441] hover:bg-[#C89430] text-[#0B1220] font-extrabold shadow-md shadow-[#D9A441]/25 focus:ring-[#D9A441]",
    // Record button is LUI Red Maroon #7A2530
    danger: "bg-[#7A2530] hover:bg-[#992E3C] text-white border border-[#992E3C]/60 shadow-md shadow-[#7A2530]/40 focus:ring-[#992E3C]",
    // Stop & Save or Navy is LUI Navy Terang #3A4E7A
    navy: "bg-[#3A4E7A] hover:bg-[#4A6296] text-white border border-[#233863] shadow-md shadow-black/30 focus:ring-[#3DD6E8]",
    secondary: "bg-[#141E33] hover:bg-[#1C2C4C] text-[#B8BFC9] hover:text-white border border-[#233863] focus:ring-[#3DD6E8]",
    success: "bg-[#F5B400] hover:bg-[#E5A800] text-[#0B1220] font-extrabold shadow-md shadow-[#F5B400]/25 focus:ring-[#F5B400]",
    outline: "border border-[#233863] hover:border-[#3DD6E8]/70 text-[#B8BFC9] hover:text-white bg-transparent focus:ring-[#3DD6E8]",
    ghost: "text-[#B8BFC9] hover:text-white hover:bg-white/10 focus:ring-white/30",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : (
        icon
      )}
      {children}
    </button>
  );
};



