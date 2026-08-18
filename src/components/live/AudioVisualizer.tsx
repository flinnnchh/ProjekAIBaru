import React from 'react';

interface AudioVisualizerProps {
  active: boolean;
  isRecording: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ active, isRecording }) => {
  // Generate 16 visualizer bars
  const bars = [12, 24, 16, 32, 28, 40, 20, 36, 14, 30, 26, 38, 18, 22, 16, 28];

  return (
    <div className="flex items-center gap-1.5 h-9 px-3 py-1 bg-[#0B1220] rounded-xl border border-[#233863] shadow-inner">
      <div className="text-[10px] uppercase font-mono font-bold text-[#B8BFC9] mr-2 flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${active ? 'bg-[#3DD6E8] animate-ping' : 'bg-slate-600'}`} />
        AUDIO STREAM
      </div>
      <div className="flex items-center gap-[3px] h-full">
        {bars.map((maxH, idx) => {
          return (
            <span
              key={idx}
              style={{
                height: active && isRecording ? undefined : '4px',
                animationDelay: `${idx * 0.08}s`
              }}
              className={`w-[3px] rounded-full transition-all duration-150 ${
                active && isRecording
                  ? 'bg-gradient-to-t from-[#233863] via-[#3A4E7A] to-[#3DD6E8] shadow-sm shadow-[#3DD6E8] animate-pulse'
                  : isRecording
                  ? 'bg-[#233863]'
                  : 'bg-[#141E33]'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};



