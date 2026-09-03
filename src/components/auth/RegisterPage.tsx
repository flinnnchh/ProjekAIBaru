import React, { useState } from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { authService } from '../../services/authService';
import { AuthUser } from '../../types/auth';

interface RegisterPageProps {
  onSuccess: (user: AuthUser) => void;
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!displayName || !email || !password || !confirmPassword) {
      setErrorMessage('Harap lengkapi semua kolom.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password minimal 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok.');
      return;
    }

    setIsLoading(true);
    const res = await authService.register(email, password, displayName);
    setIsLoading(false);

    if (res.success && res.user) {
      onSuccess(res.user);
    } else {
      setErrorMessage(res.message || 'Gagal mendaftar.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center p-4 relative overflow-hidden selection:bg-[#F5B400] selection:text-[#0B1220]">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-[#233863]/40 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-32 left-1/4 w-[450px] h-[450px] bg-[#3DD6E8]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-[#F5B400]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full relative z-10 animate-fade-in">
        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1A2845] via-[#233863] to-[#3DD6E8]/20 border border-[#3DD6E8]/30 shadow-lg shadow-[#3DD6E8]/10 mb-3">
            <MaterialIcon icon="person_add" size="xl" className="text-[#3DD6E8]" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            Daftar Akun Baru
          </h1>
          <p className="text-xs text-[#8A94A3] mt-1">
            Gunakan email yang sudah didaftarkan ke sistem perusahaan
          </p>
        </div>

        {/* Card Container */}
        <div className="glass-card-strong p-6 sm:p-8 rounded-2xl border border-[#233863]/80 shadow-2xl backdrop-blur-xl">
          {/* Whitelist Info Notice */}
          <div className="mb-4 p-3 rounded-xl bg-[#141E33] border border-[#233863] text-[11px] text-[#8A94A3] flex items-start gap-2">
            <MaterialIcon icon="verified_user" size="xs" className="text-[#3DD6E8] shrink-0 mt-0.5" />
            <span>
              Hanya email yang sudah ada di <strong>Whitelist Database</strong> yang dapat mendaftar.
            </span>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#7A2530]/40 border border-[#FF8E9D]/30 text-[#FF8E9D] text-xs flex items-start gap-2.5 animate-slide-up">
              <MaterialIcon icon="error" size="sm" className="shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Display Name Field */}
            <div>
              <label className="block text-xs font-semibold text-[#8A94A3] uppercase tracking-wider mb-1">
                Nama Lengkap / Tampilan
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A94A3]">
                  <MaterialIcon icon="badge" size="sm" />
                </div>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Budi Santoso"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0D1629]/90 border border-[#233863] focus:border-[#3DD6E8] focus:ring-1 focus:ring-[#3DD6E8] rounded-xl text-sm text-white placeholder-[#8A94A3]/50 transition-all outline-none"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-[#8A94A3] uppercase tracking-wider mb-1">
                Email Perusahaan (Whitelisted)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A94A3]">
                  <MaterialIcon icon="mail" size="sm" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="budi@perusahaan.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0D1629]/90 border border-[#233863] focus:border-[#3DD6E8] focus:ring-1 focus:ring-[#3DD6E8] rounded-xl text-sm text-white placeholder-[#8A94A3]/50 transition-all outline-none"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-[#8A94A3] uppercase tracking-wider mb-1">
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
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-10 pr-11 py-2.5 bg-[#0D1629]/90 border border-[#233863] focus:border-[#3DD6E8] focus:ring-1 focus:ring-[#3DD6E8] rounded-xl text-sm text-white placeholder-[#8A94A3]/50 transition-all outline-none"
                  autoComplete="new-password"
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

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs font-semibold text-[#8A94A3] uppercase tracking-wider mb-1">
                Konfirmasi Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A94A3]">
                  <MaterialIcon icon="lock_reset" size="sm" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0D1629]/90 border border-[#233863] focus:border-[#3DD6E8] focus:ring-1 focus:ring-[#3DD6E8] rounded-xl text-sm text-white placeholder-[#8A94A3]/50 transition-all outline-none"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#233863] via-[#1E3A6E] to-[#3DD6E8]/30 hover:to-[#3DD6E8]/50 border border-[#3DD6E8]/40 text-white font-bold text-sm shadow-lg shadow-[#3DD6E8]/10 hover:shadow-[#3DD6E8]/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-3"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mendaftarkan...
                </>
              ) : (
                <>
                  <MaterialIcon icon="person_add" size="sm" />
                  Buat Akun Saya
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer switch to Login */}
        <div className="text-center mt-5 text-xs text-[#8A94A3]">
          Sudah punya akun?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-[#3DD6E8] hover:underline font-semibold"
          >
            Masuk Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};
