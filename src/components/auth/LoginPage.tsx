import React, { useState } from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { authService } from '../../services/authService';
import { AuthUser } from '../../types/auth';

interface LoginPageProps {
  onSuccess: (user: AuthUser) => void;
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Harap isi email dan password.');
      return;
    }

    setIsLoading(true);
    const res = await authService.login(email, password, rememberMe);
    setIsLoading(false);

    if (res.success && res.user) {
      onSuccess(res.user);
    } else {
      setErrorMessage(res.message || 'Gagal login. Periksa email dan password.');
    }
  };

  const handleQuickFill = (testEmail: string) => {
    setEmail(testEmail);
    setPassword('admin123');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center p-4 relative overflow-hidden selection:bg-[#F5B400] selection:text-[#0B1220]">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#233863]/40 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-32 right-1/4 w-[450px] h-[450px] bg-[#3DD6E8]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-[#F5B400]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full relative z-10 animate-fade-in">
        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1A2845] via-[#233863] to-[#3DD6E8]/20 border border-[#3DD6E8]/30 shadow-lg shadow-[#3DD6E8]/10 mb-3">
            <img src="/chatbot-icon.png" alt="Chatbot" className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            AI Meeting Bot
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#3DD6E8]/10 text-[#3DD6E8] border border-[#3DD6E8]/30 uppercase tracking-widest">
              Multi-User
            </span>
          </h1>
          <p className="text-xs text-[#8A94A3] mt-1">
            Masuk dengan akun email perusahaan Anda
          </p>
        </div>

        {/* Card Container */}
        <div className="glass-card-strong p-6 sm:p-8 rounded-2xl border border-[#233863]/80 shadow-2xl backdrop-blur-xl">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#7A2530]/40 border border-[#FF8E9D]/30 text-[#FF8E9D] text-xs flex items-start gap-2.5 animate-slide-up">
              <MaterialIcon icon="error" size="sm" className="shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-[#8A94A3] uppercase tracking-wider mb-1.5">
                Email Perusahaan
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A94A3]">
                  <MaterialIcon icon="mail" size="sm" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@perusahaan.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0D1629]/90 border border-[#233863] focus:border-[#3DD6E8] focus:ring-1 focus:ring-[#3DD6E8] rounded-xl text-sm text-white placeholder-[#8A94A3]/50 transition-all outline-none"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-[#8A94A3] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A94A3]">
                  <MaterialIcon icon="lock" size="sm" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 bg-[#0D1629]/90 border border-[#233863] focus:border-[#3DD6E8] focus:ring-1 focus:ring-[#3DD6E8] rounded-xl text-sm text-white placeholder-[#8A94A3]/50 transition-all outline-none"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8A94A3] hover:text-white transition-colors"
                >
                  <MaterialIcon icon={showPassword ? 'visibility_off' : 'visibility'} size="sm" />
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs py-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#8A94A3] hover:text-white transition-colors select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#233863] bg-[#0D1629] text-[#3DD6E8] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#3DD6E8]"
                />
                <span>Ingat saya di perangkat ini</span>
              </label>
              <span className="text-[11px] text-[#6B7585]">
                {rememberMe ? 'Sesi disimpan permanen' : 'Otomatis keluar saat browser ditutup'}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#233863] via-[#1E3A6E] to-[#3DD6E8]/30 hover:to-[#3DD6E8]/50 border border-[#3DD6E8]/40 text-white font-bold text-sm shadow-lg shadow-[#3DD6E8]/10 hover:shadow-[#3DD6E8]/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                <>
                  <MaterialIcon icon="login" size="sm" />
                  Masuk ke Dashboard
                </>
              )}
            </button>
          </form>

          {/* Quick Testing Dummy Accounts */}
          <div className="mt-6 pt-5 border-t border-[#233863]/60">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#8A94A3] uppercase tracking-wider mb-2.5">
              <MaterialIcon icon="science" size="xs" className="text-[#F5B400]" />
              Akun Testing Cepat (Klik untuk Isi):
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin1@perusahaan.com')}
                className="p-2 rounded-lg bg-[#141E33] hover:bg-[#1A2845] border border-[#233863] hover:border-[#3DD6E8]/40 text-left transition-all group"
              >
                <div className="text-[11px] font-bold text-white group-hover:text-[#3DD6E8] flex items-center justify-between">
                  Admin 1
                  <MaterialIcon icon="arrow_forward" size="xs" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[10px] text-[#8A94A3] truncate">admin1@perusahaan.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin2@perusahaan.com')}
                className="p-2 rounded-lg bg-[#141E33] hover:bg-[#1A2845] border border-[#233863] hover:border-[#3DD6E8]/40 text-left transition-all group"
              >
                <div className="text-[11px] font-bold text-white group-hover:text-[#3DD6E8] flex items-center justify-between">
                  Admin 2
                  <MaterialIcon icon="arrow_forward" size="xs" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[10px] text-[#8A94A3] truncate">admin2@perusahaan.com</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer switch to Register */}
        <div className="text-center mt-5 text-xs text-[#8A94A3]">
          Belum punya akun?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-[#3DD6E8] hover:underline font-semibold"
          >
            Daftar Akun Baru
          </button>
        </div>
      </div>
    </div>
  );
};
