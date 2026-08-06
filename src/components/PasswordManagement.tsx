import React, { useState } from 'react';
import { Key, Save, AlertTriangle, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PasswordManagement() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      // API call to change password
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: 'include'
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Şifreniz başarıyla güncellendi.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Şifre değiştirilirken bir hata oluştu.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Sunucuya bağlanılamadı.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
          <div className="p-3 bg-brand-100 text-brand-600 rounded-2xl shadow-sm">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Şifre Değiştir</h2>
            <p className="text-sm text-slate-500 font-medium tracking-tight">Hesap güvenliğiniz için şifrenizi düzenli olarak güncelleyin.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Mevcut Şifre</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm font-semibold"
                  placeholder="Mevcut şifrenizi girin"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="relative group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Yeni Şifre</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm font-semibold"
                    placeholder="Yeni şifre"
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Şifre Tekrar</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm font-semibold"
                    placeholder="Yeni şifre (tekrar)"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col items-center gap-4">
            <AnimatePresence>
              {message && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-black ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}
                >
                  {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={saving}
              className={`w-full bg-slate-900 text-white flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 group ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Save size={20} className="group-hover:scale-110 transition-transform" />
              {saving ? 'ŞİFRE GÜNCELLENİYOR...' : 'ŞİFREYİ GÜNCELLE'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="mt-8 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4">
        <div className="p-2 bg-white text-amber-500 rounded-xl shadow-sm h-fit">
          <AlertTriangle size={20} />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-black text-amber-900">Önemli Bilgi</h4>
          <p className="text-xs text-amber-700 leading-relaxed font-medium">
            Şifreniz en az 8 karakter uzunluğunda olmalı ve en az bir harf ve rakam içermelidir. 
            Güvenliğiniz için şifrelerinizi kimseyle paylaşmayın.
          </p>
        </div>
      </div>
    </div>
  );
}
