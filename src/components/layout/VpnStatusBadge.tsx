import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';

interface VpnStatusBadgeProps {
  connected: boolean;
  ip?: string;
}

export const VpnStatusBadge: React.FC<VpnStatusBadgeProps> = ({ connected, ip }) => {
  if (connected) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141E33]/80 backdrop-blur-sm border border-[#233863] text-xs font-mono shadow-sm group hover:border-[#3DD6E8]/40 transition-all duration-200 cursor-default">
        <MaterialIcon icon="vpn_lock" size="sm" className="text-[#3DD6E8]" />
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3DD6E8] opacity-50"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3DD6E8]"></span>
          </span>
          <span className="text-[#B8BFC9] text-[11px] font-bold">VPC:</span>
          <span className="text-white font-bold text-[11px]">{ip || 'VPC PERUSAHAAN'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#7A2530]/15 border border-[#7A2530]/50 text-xs font-mono shadow-sm">
      <MaterialIcon icon="vpn_lock" size="sm" className="text-[#FF8E9D]" />
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#7A2530]" />
        <span className="text-[#FF8E9D] font-bold text-[11px]">VPN OFF</span>
      </div>
    </div>
  );
};
