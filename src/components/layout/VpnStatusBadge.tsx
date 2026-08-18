import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

interface VpnStatusBadgeProps {
  connected: boolean;
  ip?: string;
}

export const VpnStatusBadge: React.FC<VpnStatusBadgeProps> = ({ connected, ip }) => {
  if (connected) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141E33] border border-[#233863] text-xs font-mono shadow-sm">
        <ShieldCheck className="w-4 h-4 text-[#3DD6E8]" />
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#3DD6E8] animate-pulse" />
          <span className="text-[#B8BFC9] text-[11px] font-bold">VPC SECURE:</span>
          <span className="text-white font-bold text-[11px]">{ip || '10.24.0.12'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7A2530]/20 border border-[#7A2530] text-xs font-mono shadow-sm">
      <ShieldAlert className="w-4 h-4 text-[#FF8E9D]" />
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#7A2530]" />
        <span className="text-[#FF8E9D] font-bold text-[11px]">VPN OFF</span>
      </div>
    </div>
  );
};
