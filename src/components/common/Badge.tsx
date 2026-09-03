import React from 'react';
import { MaterialIcon } from './MaterialIcon';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'cyan' | 'neutral';
  size?: 'sm' | 'md';
  pulse?: boolean;
  icon?: string; // Material Symbols icon name (mapped to Lucide)
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  pulse = false,
  icon,
  className = '',
}) => {
  const sizeStyles: Record<string, string> = {
    sm: "px-2 py-0.5 text-[10px] font-bold tracking-wider gap-1",
    md: "px-2.5 py-1 text-[11px] font-bold gap-1.5",
  };

  const variantStyles: Record<string, string> = {
    default: "bg-[#141E33] text-[#B8BFC9] border border-[#233863]",
    primary: "bg-gradient-to-r from-[#233863]/70 to-[#2D4A7A]/50 text-white border border-[#3A4E7A]/60",
    success: "bg-gradient-to-r from-[#F5B400]/15 to-[#F5B400]/5 text-[#F5B400] border border-[#F5B400]/40",
    danger: "bg-gradient-to-r from-[#7A2530]/30 to-[#7A2530]/10 text-[#FF8E9D] border border-[#7A2530]/60",
    warning: "bg-gradient-to-r from-[#D9A441]/20 to-[#D9A441]/5 text-[#D9A441] border border-[#D9A441]/40",
    info: "bg-gradient-to-r from-[#3DD6E8]/15 to-[#3DD6E8]/5 text-[#3DD6E8] border border-[#3DD6E8]/40",
    cyan: "bg-gradient-to-r from-[#3DD6E8]/15 to-[#3DD6E8]/5 text-[#3DD6E8] border border-[#3DD6E8]/40",
    neutral: "bg-[#0B1220] text-[#B8BFC9] border border-[#233863]",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full uppercase transition-all duration-200 ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-60"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current"></span>
        </span>
      )}
      {icon && (
        <MaterialIcon icon={icon} size="xs" />
      )}
      {children}
    </span>
  );
};
