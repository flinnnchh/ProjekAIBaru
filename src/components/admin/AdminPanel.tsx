import React, { useState, useEffect } from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { adminService, WhitelistItem, ParallelSessionSummary } from '../../services/adminService';

export const AdminPanel: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'whitelist' | 'sessions'>('whitelist');
  
  // Whitelist State
  const [whitelist, setWhitelist] = useState<WhitelistItem[]>([]);
  const [isLoadingWhitelist, setIsLoadingWhitelist] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [whitelistMessage, setWhitelistMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Sessions State
  const [sessions, setSessions] = useState<ParallelSessionSummary[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [maxCapacity, setMaxCapacity] = useState(5);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [now, setNow] = useState<number>(Date.now());

  const fetchWhitelistData = async () => {
    setIsLoadingWhitelist(true);
    const res = await adminService.getWhitelist();
    if (res.success) {
      setWhitelist(res.whitelist || []);
    }
    setIsLoadingWhitelist(false);
  };

  const fetchSessionsData = async () => {
    setIsLoadingSessions(true);
    const res = await adminService.getSessions();
    if (res.success) {
      setSessions(res.sessions || []);
      setActiveCount(res.activeCount || 0);
      setMaxCapacity(res.maxCapacity || 5);
    }
    setIsLoadingSessions(false);
  };

  useEffect(() => {
    fetchWhitelistData();
    fetchSessionsData();

    // 1-second live ticker for real-time duration updates
    const ticker = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    // Auto-refresh sessions from backend every 5 seconds
    const interval = setInterval(() => {
      fetchSessionsData();
    }, 5000);

    return () => {
      clearInterval(ticker);
      clearInterval(interval);
    };
  }, []);

  const handleAddWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setIsSubmitting(true);
    setWhitelistMessage(null);

    const res = await adminService.addWhitelist(newEmail.trim(), newNote.trim());
    if (res.success) {
      setWhitelistMessage({ text: res.message || 'Email berhasil ditambahkan ke whitelist.', type: 'success' });
      setNewEmail('');
      setNewNote('');
      fetchWhitelistData();
    } else {
      setWhitelistMessage({ text: res.message || 'Gagal menambahkan email ke whitelist.', type: 'error' });
    }
    setIsSubmitting(false);
  };

  const handleDeleteWhitelist = async (id: string, email: string) => {
    if (!window.confirm(`Hapus ${email}?\n\nTindakan ini akan menghapus akun login, sesi bot aktif, riwayat, dan izin whitelist secara permanen.`)) {
      return;
    }

    const res = await adminService.deleteWhitelist(id);
    if (res.success) {
      setWhitelistMessage({ text: res.message || `Akun ${email} berhasil dihapus total.`, type: 'success' });
      fetchWhitelistData();
    } else {
      setWhitelistMessage({ text: res.message || 'Gagal menghapus akun.', type: 'error' });
    }
  };


  const filteredWhitelist = whitelist.filter((item) =>
    item.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
    (item.note && item.note.toLowerCase().includes(searchEmail.toLowerCase()))
  );

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Admin Panel */}
      <div className="bg-[#0B1220]/80 border border-[#233863]/60 rounded-2xl p-5 shadow-lui-card backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5B400]/20 to-[#3DD6E8]/20 border border-[#F5B400]/40 flex items-center justify-center flex-shrink-0">
              <MaterialIcon icon="admin_panel_settings" size="md" className="text-[#F5B400]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white font-display">
                  Administrator Dashboard
                </h2>
                <Badge variant="warning" size="sm">Admin Only</Badge>
              </div>
              <p className="text-xs text-[#8A94A3]">
                Kelola hak akses registrasi karyawan dan pantau beban sesi server bot secara terpusat.
              </p>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center gap-1 bg-[#080E1A] p-1 rounded-xl border border-[#233863]/60">
            <button
              onClick={() => setActiveSubTab('whitelist')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'whitelist'
                  ? 'bg-gradient-to-r from-[#233863] to-[#1A2845] text-white border border-[#3DD6E8]/40 shadow-sm'
                  : 'text-[#8A94A3] hover:text-white'
              }`}
            >
              <MaterialIcon icon="mark_email_read" size="sm" className={activeSubTab === 'whitelist' ? 'text-[#3DD6E8]' : ''} />
              <span>Whitelist Email</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#141E33] border border-[#233863] font-mono">
                {whitelist.length}
              </span>
            </button>
            <button
              onClick={() => setActiveSubTab('sessions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'sessions'
                  ? 'bg-gradient-to-r from-[#233863] to-[#1A2845] text-white border border-[#3DD6E8]/40 shadow-sm'
                  : 'text-[#8A94A3] hover:text-white'
              }`}
            >
              <MaterialIcon icon="cloud_sync" size="sm" className={activeSubTab === 'sessions' ? 'text-[#3DD6E8]' : ''} />
              <span>Sesi Bot Paralel</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeCount > 0 ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 animate-pulse' : 'bg-[#141E33] border border-[#233863] text-[#8A94A3]'
              }`}>
                {activeCount}/{maxCapacity}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Subtab 1: Whitelist Email */}
      {activeSubTab === 'whitelist' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom Kiri: Form Tambah Email */}
          <div className="lg:col-span-1 bg-[#0B1220]/80 border border-[#233863]/60 rounded-2xl p-5 shadow-lui-card backdrop-blur-xl h-fit">
            <div className="flex items-center gap-2 mb-4">
              <MaterialIcon icon="person_add" size="md" className="text-[#3DD6E8]" />
              <div>
                <h3 className="text-sm font-bold text-white">Tambah Whitelist Email</h3>
                <p className="text-[11px] text-[#8A94A3]">Hanya email terdaftar yang bisa membuat akun.</p>
              </div>
            </div>

            {whitelistMessage && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 border ${
                  whitelistMessage.type === 'success'
                    ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
                    : 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30'
                }`}
              >
                <MaterialIcon
                  icon={whitelistMessage.type === 'success' ? 'check_circle' : 'error'}
                  size="sm"
                />
                <span className="flex-1">{whitelistMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleAddWhitelist} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[#8A94A3] mb-1">
                  Email Perusahaan / Karyawan <span className="text-[#EF4444]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="nama@perusahaan.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-[#080E1A] border border-[#233863] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#5A6E85] focus:outline-none focus:border-[#3DD6E8] transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#8A94A3] mb-1">
                  Catatan / Departemen (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Tim IT / Product Manager"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full bg-[#080E1A] border border-[#233863] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#5A6E85] focus:outline-none focus:border-[#3DD6E8] transition-colors"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full justify-center"
                disabled={isSubmitting || !newEmail.trim()}
                icon={<MaterialIcon icon={isSubmitting ? 'sync' : 'add'} size="sm" className={isSubmitting ? 'animate-spin' : ''} />}
              >
                {isSubmitting ? 'Menyimpan...' : 'Tambahkan ke Whitelist'}
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-[#233863]/40 text-[11px] text-[#5A6E85] space-y-1">
              <p>💡 <b>Tips Keamanan:</b></p>
              <p>Karyawan tidak akan dapat mendaftar melalui tombol register jika emailnya belum ada di daftar whitelist ini.</p>
            </div>
          </div>

          {/* Kolom Kanan: Tabel Daftar Email */}
          <div className="lg:col-span-2 bg-[#0B1220]/80 border border-[#233863]/60 rounded-2xl p-5 shadow-lui-card backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Daftar Email Terdaftar</span>
                  <span className="text-xs text-[#3DD6E8] font-mono font-normal">({filteredWhitelist.length})</span>
                </h3>
                <p className="text-[11px] text-[#8A94A3]">Daftar seluruh email yang memiliki izin registrasi.</p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Cari email atau catatan..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="w-full bg-[#080E1A] border border-[#233863] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#5A6E85] focus:outline-none focus:border-[#3DD6E8] transition-colors"
                />
                <MaterialIcon
                  icon="search"
                  size="sm"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5A6E85]"
                />
              </div>
            </div>

            {/* List / Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#233863]/60 text-[#8A94A3] font-mono text-[11px]">
                    <th className="pb-3 font-semibold">Email</th>
                    <th className="pb-3 font-semibold">Catatan</th>
                    <th className="pb-3 font-semibold">Ditambahkan Oleh</th>
                    <th className="pb-3 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#233863]/30 text-white">
                  {isLoadingWhitelist ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-[#8A94A3]">
                        <MaterialIcon icon="sync" size="md" className="animate-spin text-[#3DD6E8] mx-auto mb-2" />
                        <span>Memuat data whitelist...</span>
                      </td>
                    </tr>
                  ) : filteredWhitelist.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-[#8A94A3]">
                        <MaterialIcon icon="search_off" size="md" className="text-[#5A6E85] mx-auto mb-2" />
                        <span>Tidak ada email yang cocok dengan pencarian.</span>
                      </td>
                    </tr>
                  ) : (
                    filteredWhitelist.map((item) => (
                      <tr key={item._id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-3 font-mono font-medium text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#3DD6E8]/80 flex-shrink-0" />
                          <span>{item.email}</span>
                        </td>
                        <td className="py-3 text-[#8A94A3]">
                          {item.note ? (
                            <span className="text-xs text-white bg-[#141E33] px-2 py-0.5 rounded-md border border-[#233863]">
                              {item.note}
                            </span>
                          ) : (
                            <span className="text-[#5A6E85] italic">-</span>
                          )}
                        </td>
                        <td className="py-3 text-[#8A94A3] text-[11px]">
                          {item.addedBy || 'admin'}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleDeleteWhitelist(item._id, item.email)}
                            title="Hapus dari Whitelist"
                            className="text-[#8A94A3] hover:text-[#EF4444] p-1.5 rounded-lg hover:bg-[#EF4444]/10 transition-colors"
                          >
                            <MaterialIcon icon="delete" size="sm" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Sesi Bot Paralel */}
      {activeSubTab === 'sessions' && (
        <div className="space-y-6">
          {/* Server Capacity Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0B1220]/80 border border-[#233863]/60 rounded-2xl p-4 shadow-lui-card flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#3DD6E8]/10 border border-[#3DD6E8]/30 flex items-center justify-center text-[#3DD6E8]">
                <MaterialIcon icon="dns" size="lg" />
              </div>
              <div>
                <div className="text-[11px] text-[#8A94A3] font-bold uppercase tracking-wider">Kapasitas Sesi Paralel</div>
                <div className="text-xl font-extrabold text-white font-mono flex items-center gap-2">
                  <span>{activeCount} / {maxCapacity}</span>
                  <span className="text-xs font-normal text-[#8A94A3]">Slot Aktif</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0B1220]/80 border border-[#233863]/60 rounded-2xl p-4 shadow-lui-card flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
                <MaterialIcon icon="memory" size="lg" />
              </div>
              <div>
                <div className="text-[11px] text-[#8A94A3] font-bold uppercase tracking-wider">Status Browser Headless</div>
                <div className="text-sm font-bold text-[#10B981] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                  <span>Isolasi Multi-Tab Siap</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0B1220]/80 border border-[#233863]/60 rounded-2xl p-4 shadow-lui-card flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#F5B400]/10 border border-[#F5B400]/30 flex items-center justify-center text-[#F5B400]">
                <MaterialIcon icon="record_voice_over" size="lg" />
              </div>
              <div>
                <div className="text-[11px] text-[#8A94A3] font-bold uppercase tracking-wider">Audio STT Engine</div>
                <div className="text-sm font-bold text-[#F5B400] flex items-center gap-1">
                  <span>Deepgram Nova-2 (Live)</span>
                </div>
              </div>
            </div>
          </div>

          {/* List Sesi Aktif */}
          <div className="bg-[#0B1220]/80 border border-[#233863]/60 rounded-2xl p-5 shadow-lui-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Daftar Sesi Bot Pengguna</span>
                  <span className="text-xs text-[#3DD6E8] font-mono">({sessions.length})</span>
                </h3>
                <p className="text-[11px] text-[#8A94A3]">Memperbarui otomatis setiap 5 detik.</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={<MaterialIcon icon={isLoadingSessions ? 'sync' : 'refresh'} size="sm" className={isLoadingSessions ? 'animate-spin' : ''} />}
                onClick={fetchSessionsData}
                disabled={isLoadingSessions}
              >
                Refresh
              </Button>
            </div>

            {sessions.length === 0 ? (
              <div className="py-12 text-center text-[#8A94A3] bg-[#080E1A]/40 rounded-xl border border-[#233863]/40">
                <MaterialIcon icon="cloud_done" size="lg" className="text-[#5A6E85] mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">Tidak Ada Sesi Bot yang Berjalan</p>
                <p className="text-xs text-[#8A94A3] mt-1">Saat ada user yang melakukan Join Bot, sesinya akan tampil live di sini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessions.map((sess) => {
                  const name = sess.displayName || 'User';
                  const email = sess.email || '-';
                  const state = sess.state || 'IDLE';
                  const initials = name.slice(0, 2).toUpperCase() || 'U';

                  // Calculate live duration
                  let elapsedSec = sess.elapsedSeconds || 0;
                  if (sess.createdAt) {
                    const start = new Date(sess.createdAt).getTime();
                    if (!isNaN(start)) {
                      elapsedSec = Math.max(0, Math.floor((now - start) / 1000));
                    }
                  }

                  return (
                    <div
                      key={sess.userId}
                      className="p-4 bg-[#080E1A] border border-[#233863] rounded-xl hover:border-[#3DD6E8]/40 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#233863]/40 border border-[#3DD6E8]/30 flex items-center justify-center text-xs font-bold text-[#3DD6E8] font-mono">
                            {initials}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{name}</div>
                            <div className="text-[10px] text-[#8A94A3] font-mono">{email}</div>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${
                          state === 'RECORDING'
                            ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40'
                            : state === 'IN_ROOM_STANDBY'
                            ? 'bg-[#F5B400]/20 text-[#F5B400] border-[#F5B400]/40'
                            : 'bg-[#3DD6E8]/20 text-[#3DD6E8] border-[#3DD6E8]/40'
                        }`}>
                          {state}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-[11px] text-[#8A94A3] bg-[#0B1220] p-2.5 rounded-lg border border-[#233863]/40">
                        <div className="flex justify-between">
                          <span>Topik:</span>
                          <span className="text-white font-medium truncate max-w-[180px]">{sess.meetingTitle || 'Meeting'}</span>
                        </div>
                        {sess.meetingUrl && (
                          <div className="flex justify-between">
                            <span>URL:</span>
                            <span className="text-[#3DD6E8] font-mono truncate max-w-[180px]">{sess.meetingUrl}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Durasi:</span>
                          <span className="text-white font-mono font-bold">{formatSeconds(elapsedSec)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
