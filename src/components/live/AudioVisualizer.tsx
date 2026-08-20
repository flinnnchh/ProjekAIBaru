import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';

interface AudioVisualizerProps {
  active: boolean;
  isRecording: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ active, isRecording }) => {
  const bars = [12, 24, 16, 32, 28, 40, 20, 36, 14, 30, 26, 38, 18, 22, 16, 28];

  return (
    <div className={`flex items-center gap-2 h-10 px-3 py-1.5 rounded-xl border shadow-lui-inner transition-all duration-300 ${
      active && isRecording
        ? 'bg-[#0B1220] border-[#3DD6E8]/30 glow-cyan'
        : 'bg-[#0B1220] border-[#233863]'
    }`}>
      <div className="text-[10px] uppercase font-mono font-bold text-[#8A94A3] mr-1 flex items-center gap-1.5">
        <MaterialIcon
          icon="graphic_eq"
          size="sm"
          filled={active}
          className={`transition-colors duration-200 ${active ? 'text-[#3DD6E8]' : 'text-[#6B7585]'}`}
        />
        <span className="hidden sm:inline">AUDIO</span>
      </div>
      <div className="flex items-center gap-[2px] h-full">
        {bars.map((maxH, idx) => {
          const dynamicHeight = active && isRecording
            ? `${Math.max(4, Math.random() * maxH)}px`
            : '3px';

          return (
            <span
              key={idx}
              style={{
                height: active && isRecording ? undefined : '3px',
                animationDelay: `${idx * 0.08}s`,
              }}
              className={`w-[3px] rounded-full transition-all duration-150 ${
                active && isRecording
                  ? 'bg-gradient-to-t from-[#233863] via-[#3DD6E8] to-[#7EEAF5] animate-pulse shadow-sm shadow-[#3DD6E8]/40'
                  : isRecording
                  ? 'bg-[#233863]'
                  : 'bg-[#1A2845]'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
