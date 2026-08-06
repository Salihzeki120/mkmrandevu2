import React, { useState, useEffect } from 'react';
import { Save, Mail, AlertTriangle, CheckCircle2, Info, Send, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface Settings {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_pass: string;
  smtp_from: string;
  is_email_active: number;
}

export default function EmailHosting() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmailTarget, setTestEmailTarget] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings', {
        credentials: 'include'
      });
      const data = await res.json();
      setSettings({
        smtp_host: data.smtp_host || '',
        smtp_port: data.smtp_port || 587,
        smtp_user: data.smtp_user || '',
        smtp_pass: data.smtp_pass || '',
        smtp_from: data.smtp_from || '',
        is_email_active: data.is_email_active ?? 1
      });
    } catch (error) {
      console.error('Ayarlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
        credentials: 'include'
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'SMTP ayarları başarıyla kaydedildi.' });
      } else {
        const errorData = await res.json();
        setMessage({ type: 'error', text: errorData.error || 'Ayarlar kaydedilirken bir hata oluştu.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Sunucuya bağlanılamadı.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!settings || !testEmailTarget) return;
    setTesting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, test_target: testEmailTarget }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Test e-postası başarıyla gönderildi. Lütfen gelen kutunuzu kontrol edin.' });
      } else {
        setMessage({ type: 'error', text: `Hata: ${data.details || data.error || 'Bağlantı başarısız.'}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Sunucuya ulaşılamadı.' });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-600/30 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-slate-800">E-posta Ayarları (SMTP)</h2>
        <p className="text-sm text-slate-500">Sistemin otomatik bilgilendirme ve randevu e-postaları için kullanacağı sunucu yapılandırması.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-[20px] shadow-sm transition-all duration-500 ${settings.is_email_active ? 'bg-emerald-500 text-white shadow-emerald-200 ring-4 ring-emerald-50' : 'bg-slate-200 text-slate-500'}`}>
                <Mail size={24} className={settings.is_email_active ? 'animate-pulse' : ''} />
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">E-posta Servis Yönetimi</h3>
                <p className="text-sm text-slate-500 font-medium">Sistem genelinde otomatik ve manuel e-postaları kontrol edin.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm self-stretch md:self-auto">
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${settings.is_email_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                SİSTEM {settings.is_email_active ? 'ŞU AN AKTİF' : 'ŞU AN PASİF'}
              </span>
              <button
                type="button"
                onClick={() => setSettings({...settings, is_email_active: settings.is_email_active ? 0 : 1})}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-brand-500/20 ${settings.is_email_active ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-500 ${settings.is_email_active ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className={`p-6 rounded-[32px] border-2 border-dashed ${settings.is_email_active ? 'border-brand-100 bg-brand-50/30' : 'border-slate-100 bg-slate-50'} space-y-6`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center">
                  <Send size={20} />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 uppercase tracking-tight">Bağlantı Testi</h4>
                  <p className="text-xs text-slate-500 font-medium font-mono">Yapılandırmayı kaydettikten sonra smtp durumunu buradan doğrulayın.</p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-Posta Teslimat Adresi</label>
                  <input 
                    type="email" 
                    placeholder="test@firmaadi.com"
                    value={testEmailTarget}
                    onChange={(e) => setTestEmailTarget(e.target.value)}
                    className="w-full px-5 py-3.5 bg-white border border-slate-300 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-bold text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleTestEmail}
                  disabled={testing || !testEmailTarget}
                  className="px-8 py-3.5 bg-brand-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-brand-100 hover:bg-brand-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-95"
                >
                  {testing ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  {testing ? 'TEST EDİLİYOR...' : 'TEST GÖNDER'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">SMTP Host</label>
                <input 
                  type="text" 
                  placeholder="mail.alanadi.com"
                  value={settings.smtp_host}
                  onChange={e => setSettings({...settings, smtp_host: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">SMTP Port</label>
                <input 
                  type="number" 
                  placeholder="465 veya 587"
                  value={settings.smtp_port}
                  onChange={e => setSettings({...settings, smtp_port: parseInt(e.target.value)})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">SMTP Kullanıcı</label>
                <input 
                  type="text" 
                  placeholder="info@alanadi.com"
                  value={settings.smtp_user}
                  onChange={e => setSettings({...settings, smtp_user: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">SMTP Şifre</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={settings.smtp_pass}
                  onChange={e => setSettings({...settings, smtp_pass: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Gönderen E-posta (From)</label>
                <input 
                  type="text" 
                  placeholder='"MKM VİZE" <info@alanadi.com>'
                  value={settings.smtp_from}
                  onChange={e => setSettings({...settings, smtp_from: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            {message && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}
              >
                {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                {message.text}
              </motion.div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={handleTestEmail}
              disabled={testing || saving}
              className={`flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all ${testing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Mail size={20} />
              {testing ? 'GÖNDERİLİYOR...' : 'TEST GÖNDER'}
            </button>
            <button 
              type="submit"
              disabled={saving || testing}
              className={`flex items-center gap-2 px-8 py-3 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-100 hover:bg-brand-700 transition-all ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Save size={20} />
              {saving ? 'KAYDEDİLİYOR...' : 'HOSTİNG AYARLARINI KAYDET'}
            </button>
          </div>
        </div>
      </form>

      <div className="bg-brand-50 rounded-3xl p-6 flex gap-4">
        <div className="p-3 bg-white text-brand-600 rounded-2xl shadow-sm shrink-0 h-fit">
          <Info size={24} />
        </div>
        <div className="space-y-2">
          <h4 className="font-bold text-brand-900">Neden SMTP Ayarları Önemli?</h4>
          <p className="text-sm text-brand-700 leading-relaxed">
            Sistemin gönderdiği pasaport teslim, randevu hatırlatma ve vize sonuç e-postalarının müşterilerinizin 
            gereksiz (spam) kutusuna düşmemesi için kendi kurumsal SMTP ayarlarınızı kullanmanız önerilir.
          </p>
        </div>
      </div>
    </div>
  );
}
