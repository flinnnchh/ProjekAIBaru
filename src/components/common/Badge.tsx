import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'cyan' | 'neutral';
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  pulse = false,
  className = '',
}) => {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px] font-bold tracking-wider",
    md: "px-2.5 py-1 text-xs font-bold",
  };

  const variantStyles = {
    default: "bg-[#141E33] text-[#B8BFC9] border border-[#233863]",
    // Primary / Navy
    primary: "bg-[#233863]/60 text-white border border-[#3A4E7A]",
    // Gold
    success: "bg-[#F5B400]/20 text-[#F5B400] border border-[#F5B400]/50 shadow-sm",
    // Maroon
    danger: "bg-[#7A2530]/30 text-[#FF8E9D] border border-[#7A2530] shadow-sm",
    // Gold Lighter
    warning: "bg-[#D9A441]/20 text-[#D9A441] border border-[#D9A441]/50",
    // LUI Cyan Highlight #3DD6E8
    info: "bg-[#3DD6E8]/15 text-[#3DD6E8] border border-[#3DD6E8]/50",
    cyan: "bg-[#3DD6E8]/15 text-[#3DD6E8] border border-[#3DD6E8]/50",
    // Neutral Grey #B8BFC9
    neutral: "bg-[#141E33] text-[#B8BFC9] border border-[#233863]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full uppercase transition-colors ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      {children}
    </span>
  );
};



