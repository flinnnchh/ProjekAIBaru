import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

interface VpnStatusBadgeProps {
  connected: boolean;
  ip?: string;
}

export const VpnStatusBadge: React.FC<VpnStatusBadgeProps> = ({
  connected,
  ip = '10.24.0.12 (VPC Private)'
}) => {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium backdrop-blur-md transition-all ${
      connected 
        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 shadow-sm shadow-emerald-500/10' 
        : 'bg-red-950/40 border-red-500/30 text-red-300'
    }`}>
      {connected ? (
        <>
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>VPN PERUSAHAAN: <strong className="font-mono text-emerald-200">{ip}</strong></span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </>
      ) : (
        <>
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span>VPN TERPUTUS</span>
          <span className="w-2 h-2 rounded-full bg-red-400"></span>
        </>
      )}
    </div>
  );
};
