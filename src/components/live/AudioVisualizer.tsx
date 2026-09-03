import React, { useEffect, useState } from 'react';
import { MaterialIcon } from '../common/MaterialIcon';

interface AudioVisualizerProps {
  active: boolean;
  isRecording: boolean;
}

// Profil tinggi gelombang simetris (24 bar) membentuk formasi burst audio wave
// yang merepresentasikan equalizer spektrum suara di dalam ruangan
const BASE_WAVE_PROFILE = [
  4, 8, 14, 20, 26, 20, 12, 6,
  10, 16, 24, 28, 22, 16, 8,
  6, 12, 18, 24, 20, 14, 10, 6, 4
];

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ active, isRecording }) => {
  const [barHeights, setBarHeights] = useState<number[]>(() => BASE_WAVE_PROFILE.map(() => 3));

  // Animasi dinamis equalizer audio
  useEffect(() => {
    if (!isRecording) {
      setBarHeights(BASE_WAVE_PROFILE.map(() => 3));
      return;
    }

    let tick = 0;
    const interval = setInterval(() => {
      tick += 0.25;
      setBarHeights(() =>
        BASE_WAVE_PROFILE.map((maxH, idx) => {
          if (active) {
            // Suara terdeteksi dari ruangan: Bar menari aktif dengan variasi organik
            const variation = 0.4 + Math.random() * 0.7;
            const waveMod = Math.sin(tick * 2.5 + idx * 0.35) * 0.2 + 0.85;
            return Math.max(5, Math.round(maxH * variation * waveMod));
          } else {
            // Bot sedang merekam di ruangan (ambience standby): Gelombang bernapas lembut
            const ambientWave = Math.sin(tick + idx * 0.4) * 2.5 + 4;
            return Math.max(3, Math.round(ambientWave));
          }
        })
      );
    }, 75);

    return () => clearInterval(interval);
  }, [active, isRecording]);

  return (
    <div
      title={
        isRecording
          ? active
            ? 'Mendengar suara percakapan di ruangan rapat'
            : 'Mikrofon aktif — standby mendengarkan seisi ruangan'
          : 'Audio Standby (Belum Mulai)'
      }
      className={`flex items-center gap-2.5 h-10 px-3 py-1.5 rounded-xl border shadow-lui-inner transition-all duration-300 ${
        active && isRecording
          ? 'bg-[#0B1220]/95 border-[#3DD6E8]/70 shadow-[0_0_20px_rgba(61,214,232,0.3)]'
          : isRecording
          ? 'bg-[#0B1220]/90 border-[#233863] shadow-[0_0_10px_rgba(35,56,99,0.3)]'
          : 'bg-[#0B1220] border-[#233863]/60'
      }`}
    >
      {/* Icon & Label Audio */}
      <div className="flex items-center gap-1.5">
        <div className="relative flex items-center justify-center">
          <MaterialIcon
            icon="graphic_eq"
            size="sm"
            className={`transition-colors duration-300 ${
              active && isRecording
                ? 'text-[#3DD6E8] drop-shadow-[0_0_6px_rgba(61,214,232,0.8)]'
                : isRecording
                ? 'text-[#7EEAF5]/70'
                : 'text-[#6B7585]'
            }`}
          />
          {active && isRecording && (
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#3DD6E8] animate-ping" />
          )}
        </div>

        <span className="text-[10px] uppercase font-mono font-bold text-[#8A94A3] tracking-wider hidden sm:inline">
          AUDIO
        </span>

        {/* Status Chip Mini */}
        {isRecording && (
          <span
            className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded transition-all duration-300 ${
              active
                ? 'bg-[#3DD6E8]/20 text-[#3DD6E8] border border-[#3DD6E8]/40 animate-pulse'
                : 'bg-[#1E293B] text-[#94A3B8] border border-[#334155]'
            }`}
          >
            {active ? 'LIVE' : 'LISTENING'}
          </span>
        )}
      </div>

      {/* Symmetrical Audio Waveform Equalizer */}
      <div className="flex items-center gap-[2.5px] h-7 px-1">
        {barHeights.map((h, idx) => (
          <span
            key={idx}
            style={{
              height: `${h}px`,
            }}
            className={`w-[2.5px] sm:w-[3px] rounded-full transition-all duration-75 ease-out ${
              active && isRecording
                ? 'bg-gradient-to-t from-[#0284C7] via-[#3DD6E8] to-[#E0F2FE] shadow-[0_0_6px_rgba(61,214,232,0.7)]'
                : isRecording
                ? 'bg-gradient-to-t from-[#1E293B] via-[#38BDF8]/60 to-[#0284C7]/80'
                : 'bg-[#1E293B]'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
