import React from 'react';

interface MaterialIconProps {
  icon: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  filled?: boolean;
  className?: string;
}

/**
 * Material Symbols Outlined icon wrapper.
 * Uses Google Material Symbols font loaded via CDN.
 *
 * @example <MaterialIcon icon="smart_toy" size="md" />
 * @example <MaterialIcon icon="fiber_manual_record" filled className="text-red-500" />
 */
export const MaterialIcon: React.FC<MaterialIconProps> = ({
  icon,
  size = 'md',
  filled = false,
  className = '',
}) => {
  return (
    <span
      className={`material-symbols-outlined icon-${size} ${filled ? 'filled' : ''} ${className}`}
      aria-hidden="true"
    >
      {icon}
    </span>
  );
};
