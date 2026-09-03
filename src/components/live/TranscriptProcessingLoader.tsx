import React, { useState, useEffect } from 'react';
import { MaterialIcon } from '../common/MaterialIcon';

interface TranscriptProcessingLoaderProps {
  currentStep: number;
  currentMessage: string;
}

const STEPS = [
  { icon: '🎧', label: 'Menganalisis gelombang audio & mengenali pembicara...' },
  { icon: '✍️', label: 'Menyempurnakan tanda baca & merapikan transkrip...' },
  { icon: '✨', label: 'Menyusun notulen rapat & daftar tugas...' },
];

export const TranscriptProcessingLoader: React.FC<TranscriptProcessingLoaderProps> = ({
  currentStep,
  currentMessage,
}) => {
  const [dots, setDots] = useState('');

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card-strong flex flex-col items-center justify-center h-[540px] scroll-mt-20 overflow-hidden">
      <div className="processing-card p-8 sm:p-10 max-w-md mx-auto text-center">
        {/* Pen & Paper Animation */}
        <div className="relative w-32 h-32 mx-auto mb-6 animate-float-gentle">
          {/* AI Sparkles */}
          <div className="absolute -top-2 -right-2 w-3 h-3 text-[#3DD6E8] animate-ai-sparkle" style={{ animationDelay: '0s' }}>
            <MaterialIcon icon="star" size="sm" filled className="text-[#3DD6E8]" />
          </div>
          <div className="absolute top-4 -left-3 w-2 h-2 animate-ai-sparkle" style={{ animationDelay: '0.7s' }}>
            <MaterialIcon icon="star" size="xs" filled className="text-[#F5B400]" />
          </div>
          <div className="absolute -bottom-1 right-4 w-2 h-2 animate-ai-sparkle" style={{ animationDelay: '1.4s' }}>
            <MaterialIcon icon="auto_awesome" size="xs" className="text-[#7EEAF5]" />
          </div>

          {/* Paper */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-24 h-28 bg-gradient-to-b from-[#1C2C4C] to-[#141E33] border border-[#3A4E7A]/40 rounded-xl shadow-2xl overflow-hidden">
              {/* Paper lines */}
              <div className="absolute top-5 left-3 right-3 space-y-2.5">
                <div className="h-[2px] bg-[#233863]/60 rounded-full animate-pen-line" style={{ animationDelay: '0s' }} />
                <div className="h-[2px] bg-[#233863]/60 rounded-full animate-pen-line" style={{ animationDelay: '0.4s' }} />
                <div className="h-[2px] bg-[#233863]/60 rounded-full animate-pen-line" style={{ animationDelay: '0.8s' }} />
                <div className="h-[2px] bg-[#233863]/40 rounded-full animate-pen-line" style={{ animationDelay: '1.2s' }} />
                <div className="h-[2px] bg-[#233863]/30 rounded-full animate-pen-line" style={{ animationDelay: '1.6s' }} />
              </div>

              {/* Subtle glow overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#3DD6E8]/5 to-transparent rounded-xl" />
            </div>
          </div>

          {/* Pen */}
          <div className="absolute bottom-4 right-2 animate-pen-writing origin-bottom-left">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Pen body */}
              <rect x="8" y="2" width="6" height="26" rx="2" fill="url(#penGradient)" stroke="#3A4E7A" strokeWidth="0.5" />
              {/* Pen tip */}
              <polygon points="8,28 14,28 11,35" fill="#F5B400" />
              {/* Pen cap */}
              <rect x="7" y="0" width="8" height="5" rx="1.5" fill="#3DD6E8" opacity="0.8" />
              {/* Pen clip */}
              <rect x="14" y="3" width="2" height="10" rx="1" fill="#3DD6E8" opacity="0.4" />
              <defs>
                <linearGradient id="penGradient" x1="8" y1="2" x2="14" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#2D4A7A" />
                  <stop offset="1" stopColor="#1C2C4C" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Status Text */}
        <div className="mb-6">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-display mb-1">
            AI Sedang Menyusun{dots}
          </h3>
          <p className="text-xs text-[#8A94A3] leading-relaxed">
            Transkrip akurasi tinggi sedang diproses oleh Deepgram Nova-2
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-2.5 text-left max-w-xs mx-auto">
          {STEPS.map((step, idx) => {
            const stepNum = idx + 1;
            const isActive = stepNum === currentStep;
            const isDone = stepNum < currentStep;

            return (
              <div
                key={stepNum}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-500 ${
                  isActive
                    ? 'bg-[#233863]/60 border border-[#3DD6E8]/20'
                    : isDone
                    ? 'bg-[#233863]/20 opacity-60'
                    : 'opacity-30'
                }`}
              >
                {/* Step indicator */}
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                  isDone
                    ? 'bg-[#3DD6E8]/20'
                    : isActive
                    ? 'bg-[#F5B400]/20'
                    : 'bg-[#233863]/40'
                }`}>
                  {isDone ? (
                    <MaterialIcon icon="check_circle" size="sm" filled className="text-[#3DD6E8]" />
                  ) : isActive ? (
                    <span className="text-sm">{step.icon}</span>
                  ) : (
                    <span className="text-[10px] font-bold text-[#6B7585]">{stepNum}</span>
                  )}
                </div>

                {/* Step text */}
                <span className={`text-[11px] leading-snug transition-colors duration-500 ${
                  isActive
                    ? 'text-white font-bold'
                    : isDone
                    ? 'text-[#8A94A3] line-through decoration-[#3DD6E8]/40'
                    : 'text-[#6B7585]'
                }`}>
                  {isActive ? currentMessage || step.label : step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-5 mx-auto max-w-xs">
          <div className="h-1.5 bg-[#0B1220] rounded-full overflow-hidden border border-[#233863]/40">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${Math.min((currentStep / 3) * 100, 100)}%`,
                background: 'linear-gradient(90deg, #3DD6E8, #F5B400)',
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[9px] text-[#6B7585] font-mono">Step {currentStep}/3</span>
            <span className="text-[9px] text-[#3DD6E8] font-mono font-bold">
              {Math.round((currentStep / 3) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
