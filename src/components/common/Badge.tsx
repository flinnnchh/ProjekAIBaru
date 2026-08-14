import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'purple' | 'cyan';
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
    sm: "px-2 py-0.5 text-[10px] font-semibold tracking-wider",
    md: "px-2.5 py-1 text-xs font-medium",
  };

  const variantStyles = {
    default: "bg-slate-800 text-slate-300 border border-slate-700/60",
    success: "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30",
    danger: "bg-red-950/80 text-red-300 border border-red-500/30",
    warning: "bg-amber-950/80 text-amber-300 border border-amber-500/30",
    info: "bg-blue-950/80 text-blue-300 border border-blue-500/30",
    purple: "bg-purple-950/80 text-purple-300 border border-purple-500/30",
    cyan: "bg-cyan-950/80 text-cyan-300 border border-cyan-500/30",
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
