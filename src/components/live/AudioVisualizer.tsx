import React from 'react';

interface AudioVisualizerProps {
  active: boolean;
  isRecording: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ active, isRecording }) => {
  // Generate 16 visualizer bars
  const bars = [12, 24, 16, 32, 28, 40, 20, 36, 14, 30, 26, 38, 18, 22, 16, 28];

  return (
    <div className="flex items-center gap-1 h-8 px-3 py-1 bg-slate-950/80 rounded-lg border border-slate-800">
      <div className="text-[10px] uppercase font-mono text-slate-500 mr-2 flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
        AUDIO STREAM
      </div>
      <div className="flex items-center gap-[3px] h-full">
        {bars.map((maxH, idx) => {
          const height = active && isRecording ? `${Math.max(4, (idx % 4 + 1) * 6)}px` : '4px';
          return (
            <span
              key={idx}
              style={{
                height: active && isRecording ? undefined : '4px',
                animationDelay: `${idx * 0.08}s`
              }}
              className={`w-[3px] rounded-full transition-all duration-150 ${
                active && isRecording
                  ? 'bg-gradient-to-t from-blue-500 to-cyan-300 animate-pulse'
                  : isRecording
                  ? 'bg-slate-700'
                  : 'bg-slate-800'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
