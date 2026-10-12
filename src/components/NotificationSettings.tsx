import React, { useState, useEffect } from 'react';
import { Save, Bell, Mail, Shield, AlertTriangle, CheckCircle2, Info, Building2 } from 'lucide-react';
import { motion } from 'motion/react';
import BankAccountManager from './BankAccountManager';
import { BankAccount } from '../types';

interface Settings {
  reminder_7_days_enabled: number;
  reminder_2_days_enabled: number;
  reminder_expiry_enabled: number;
  reminder_expiry_days: number;
  admin_weekly_report_enabled: number;
  admin_report_email: string;
  show_commissions_to_users: number;
  manual_commission_rates: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_pass: string;
  smtp_from: string;
  status_change_notify_enabled?: number;
  support_phone?: string;
  support_email?: string;
  support_website?: string;
  support_hq_address?: string;
  bank_accounts?: string;
}

export default function NotificationSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      setSettings(data);

      if (data.bank_accounts) {
        try {
          const parsed = JSON.parse(data.bank_accounts);
          if (Array.isArray(parsed)) {
            setBankAccounts(parsed);
          }
        } catch (e) {
          console.error('Banka hesapları ayrıştırılamadı:', e);
        }
      }
    } catch (error) {
      console.error('Ayarlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBankAccountsChange = async (updatedAccounts: BankAccount[]) => {
    setBankAccounts(updatedAccounts);
    if (settings) {
      const updatedSettings = {
        ...settings,
        bank_accounts: JSON.stringify(updatedAccounts)
      };
      setSettings(updatedSettings);

      try {
        const { 
          reminder_7_days_enabled, reminder_2_days_enabled, reminder_expiry_enabled, 
          reminder_expiry_days, admin_weekly_report_enabled, admin_report_email,
          show_commissions_to_users, status_change_notify_enabled,
          support_phone, support_email, support_website, support_hq_address
        } = updatedSettings;

        const payload = {
          reminder_7_days_enabled, reminder_2_days_enabled, reminder_expiry_enabled, 
          reminder_expiry_days, admin_weekly_report_enabled, admin_report_email,
          show_commissions_to_users, status_change_notify_enabled,
          support_phone, support_email, support_website, support_hq_address,
          bank_accounts: JSON.stringify(updatedAccounts)
        };

        const res = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include'
        });

        if (res.ok) {
          setMessage({ type: 'success', text: 'Banka hesap bilgileri başarıyla güncellendi ve kaydedildi.' });
        }
      } catch (e) {
        console.error('Banka hesapları otomatik kaydetme hatası:', e);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setMessage(null);

    // Sadece bildirim, destek ve banka ayarlarını gönder
    const { 
      reminder_7_days_enabled, reminder_2_days_enabled, reminder_expiry_enabled, 
      reminder_expiry_days, admin_weekly_report_enabled, admin_report_email,
      show_commissions_to_users, status_change_notify_enabled,
      support_phone, support_email, support_website, support_hq_address
    } = settings;

    const payload = {
      reminder_7_days_enabled, reminder_2_days_enabled, reminder_expiry_enabled, 
      reminder_expiry_days, admin_weekly_report_enabled, admin_report_email,
      show_commissions_to_users, status_change_notify_enabled,
      support_phone, support_email, support_website, support_hq_address,
      bank_accounts: JSON.stringify(bankAccounts)
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Tüm ayarlar ve banka hesap bilgileri başarıyla kaydedildi.' });
      } else {
        setMessage({ type: 'error', text: 'Ayarlar kaydedilirken bir hata oluştu.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Sunucuya bağlanılamadı.' });
    } finally {
      setSaving(false);
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
      <form onSubmit={handleSave} className="space-y-8">
        {/* Bildirim Tercihleri */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="p-2 bg-brand-100 text-brand-600 rounded-xl">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Otomatik Hatırlatma Tercihleri</h3>
              <p className="text-xs text-slate-400 font-medium">Müşterilere gönderilecek otomatik e-posta ayarları.</p>
            </div>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">7 Gün Kala Hatırlatma</h4>
                <p className="text-xs text-slate-500">Randevuya 1 hafta kala müşteriye bilgilendirme e-postası gönderilir.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={!!settings.reminder_7_days_enabled}
                  onChange={e => setSettings({...settings, reminder_7_days_enabled: e.target.checked ? 1 : 0})}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">2 Gün Kala Hatırlatma</h4>
                <p className="text-xs text-slate-500">Randevuya 48 saat kala son hatırlatma e-postası gönderilir.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={!!settings.reminder_2_days_enabled}
                  onChange={e => setSettings({...settings, reminder_2_days_enabled: e.target.checked ? 1 : 0})}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
              </label>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800">Vize Bitiş Hatırlatması</h4>
                  <p className="text-xs text-slate-500">Vize süresi dolmak üzere olan müşterilere yeni başvuru teklifi gönderilir.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={!!settings.reminder_expiry_enabled}
                    onChange={e => setSettings({...settings, reminder_expiry_enabled: e.target.checked ? 1 : 0})}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                </label>
              </div>
              
              {settings.reminder_expiry_enabled === 1 && (
                <div className="pt-4 border-t border-slate-200 flex items-center gap-4">
                  <label className="text-xs font-bold text-slate-600 uppercase">Kaç gün kala gönderilsin?</label>
                  <input 
                    type="number" 
                    value={settings.reminder_expiry_days}
                    onChange={e => setSettings({...settings, reminder_expiry_days: parseInt(e.target.value)})}
                    className="w-20 px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold"
                  />
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800">Haftalık Yönetici Raporu</h4>
                  <p className="text-xs text-slate-500">Her Pazartesi sabahı yöneticiye haftalık randevu listesi e-postalanır.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={!!settings.admin_weekly_report_enabled}
                    onChange={e => setSettings({...settings, admin_weekly_report_enabled: e.target.checked ? 1 : 0})}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex flex-col gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase">Raporun Gönderileceği E-posta</label>
                  <input 
                    type="email" 
                    placeholder="admin@alanadi.com"
                    value={settings.admin_report_email || ''}
                    onChange={e => setSettings({...settings, admin_report_email: e.target.value})}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>
                
                <div className="flex items-center justify-between gap-4 p-4 bg-brand-50 rounded-xl border border-brand-100">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-brand-900">Manuel Rapor Tetikleyici</p>
                    <p className="text-[10px] text-brand-700 font-medium">Bu haftanın randevularını içeren raporu anında alıcıya gönderir.</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!window.confirm('Bu haftalık raporu şimdi e-posta ile göndermek istediğinize emin misiniz?')) return;
                      
                      try {
                        const res = await fetch('/api/admin/send-weekly-report', {
                          method: 'POST',
                          credentials: 'include'
                        });
                        const data = await res.json();
                        if (res.ok) {
                          alert(data.message || 'Ülkeler başarıyla gönderildi.');
                        } else {
                          alert(data.error || 'Bir hata oluştu.');
                        }
                      } catch (err) {
                        alert('Sunucu hatası oluştu.');
                      }
                    }}
                    className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-black shadow-md hover:bg-brand-700 transition-all flex items-center gap-2"
                  >
                    <Mail size={14} />
                    ŞİMDİ GÖNDER
                  </button>
                </div>

                {!settings.admin_weekly_report_enabled && (
                  <p className="text-[10px] text-amber-600 font-bold italic">Not: Otomatik rapor gönderimi şu an kapalıdır.</p>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800">Başvuru Durumu Güncelleme Bildirimleri</h4>
                  <p className="text-xs text-slate-500">Müşterilerin başvuru durumları güncellendiğinde ilgili acente/kullanıcı ve yöneticilerin bildirim çubuğunda canlı uyarı gösterilir.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={settings.status_change_notify_enabled !== 0}
                    onChange={e => setSettings({...settings, status_change_notify_enabled: e.target.checked ? 1 : 0})}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                </label>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800">Kullanıcılar Prim Tutarlarını Görebilsin</h4>
                  <p className="text-xs text-slate-500">Aktif edilirse, admin olmayan kullanıcılar da raporlarda prim adedi ve tutarlarını görebilir.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={!!settings.show_commissions_to_users}
                    onChange={e => setSettings({...settings, show_commissions_to_users: e.target.checked ? 1 : 0})}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Destek Merkezi Bilgileri */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="p-2 bg-brand-100 text-brand-600 rounded-xl">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Destek Merkezi Bilgileri</h3>
              <p className="text-xs text-slate-400 font-medium">Destek merkezinde görüntülenecek iletişim ve adres bilgileri.</p>
            </div>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase">Destek Telefonu</label>
                <input 
                  type="text" 
                  placeholder="+90 (212) 444 0 444"
                  value={settings.support_phone || ''}
                  onChange={e => setSettings({...settings, support_phone: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase">Destek E-postası</label>
                <input 
                  type="email" 
                  placeholder="destek@sistemvize.com"
                  value={settings.support_email || ''}
                  onChange={e => setSettings({...settings, support_email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase">Web Sitesi</label>
                <input 
                  type="text" 
                  placeholder="sistemvize.com"
                  value={settings.support_website || ''}
                  onChange={e => setSettings({...settings, support_website: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase">Genel Merkez Adresi</label>
              <textarea 
                rows={3}
                placeholder="Genel Merkez adres bilgileri..."
                value={settings.support_hq_address || ''}
                onChange={e => setSettings({...settings, support_hq_address: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Banka Hesap Bilgileri Yönetim Arayüzü */}
        <BankAccountManager 
          bankAccounts={bankAccounts} 
          onChange={handleBankAccountsChange}
        />

        {/* Kaydet Butonu ve Mesaj */}
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
          <button 
            type="submit"
            disabled={saving}
            className={`flex items-center gap-2 px-8 py-3 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-100 hover:bg-brand-700 transition-all ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Save size={20} />
            {saving ? 'KAYDEDİLİYOR...' : 'AYARLARI KAYDET'}
          </button>
        </div>
      </form>

      <div className="bg-brand-50 rounded-3xl p-6 flex gap-4">
        <div className="p-3 bg-white text-brand-600 rounded-2xl shadow-sm shrink-0 h-fit">
          <Info size={24} />
        </div>
        <div className="space-y-2">
          <h4 className="font-bold text-brand-900">Bilgilendirme</h4>
          <p className="text-sm text-brand-700 leading-relaxed">
            Otomatik hatırlatmalar her gün sabah saat <strong>09:00</strong>'da sistem tarafından kontrol edilir ve 
            şartları sağlayan müşterilere otomatik olarak gönderilir. Manuel olarak hatırlatma göndermek isterseniz, 
            müşteri listesindeki e-posta ikonunu kullanabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
