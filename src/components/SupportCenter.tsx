import React, { useState, useEffect } from 'react';
import { Building2, Mail, Phone, MapPin, Globe, Headphones, ArrowRight, ShieldCheck, X, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import { BRAND_CONFIG } from '../brandConfig';
import { User } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  user?: User | null;
}

export default function SupportCenter({ user }: Props) {
  const [settings, setSettings] = useState<any>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ticketStatus, setTicketStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: user?.username || '',
    email: user?.adminEmail || '',
    company: user?.firmaUnvani || user?.acenteAdi || '',
    subject: '',
    message: ''
  });

  // Pre-populate if user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.username || '',
        email: user.adminEmail || '',
        company: user.firmaUnvani || user.acenteAdi || '',
        subject: '',
        message: ''
      });
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Ayarlar yüklenemedi:', error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTicketStatus(null);

    try {
      const res = await fetch('/api/support-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setTicketStatus({ type: 'success', text: data.message });
        setFormData(prev => ({ ...prev, subject: '', message: '' })); // Clear message and subject
        setTimeout(() => {
          setShowModal(false);
          setTicketStatus(null);
        }, 3000);
      } else {
        setTicketStatus({ type: 'error', text: data.error || 'Talep gönderilirken hata oluştu.' });
      }
    } catch (error) {
      setTicketStatus({ type: 'error', text: 'Sunucuyla bağlantı kurulamadı.' });
    } finally {
      setSubmitting(false);
    }
  };

  const supportPhone = settings?.support_phone || "+90 (212) 444 0 444";
  const supportEmail = settings?.support_email || "destek@sistemvize.com";
  const supportWebsite = settings?.support_website || "sistemvize.com";
  const supportHqAddress = settings?.support_hq_address || "Sistem Vize Operasyon ve Yönetim Merkezi\nAtatürk Bulvarı No: 123 Kat: 4\nKadıköy / İSTANBUL";

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      {/* Header Section */}
      <div className="bg-slate-900 rounded-[40px] p-12 text-white relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-2xl">
          <span className="px-4 py-1.5 bg-brand-600 rounded-full text-[10px] font-black uppercase tracking-widest">Destek Merkezi</span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none italic">
            {BRAND_CONFIG.name} <br />
            <span className="text-slate-400">Çözüm Ortağınız</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed">
            {BRAND_CONFIG.shortName} yönetim sistemine hoş geldiniz. İşlemlerinizle ilgili teknik destek veya operasyonel sorularınız için ekibimizle dilediğiniz zaman iletişime geçebilirsiniz.
          </p>
        </div>
        {/* Background Decorative Element */}
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-brand-600/20 to-transparent pointer-events-none" />
        <Building2 className="absolute right-12 bottom-0 text-white/5 w-64 h-64 -mb-10 pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
          <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl w-fit">
            <Headphones size={24} />
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">İletişim</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.href = `tel:${supportPhone.replace(/\s+/g, '')}`}>
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-600 group-hover:text-white transition-all">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Telefon</p>
                <p className="text-sm font-bold text-slate-700">{supportPhone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.href = `mailto:${supportEmail}`}>
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-600 group-hover:text-white transition-all">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">E-posta</p>
                <p className="text-sm font-bold text-slate-700">{supportEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.open(`https://${supportWebsite}`, '_blank')}>
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-600 group-hover:text-white transition-all">
                <Globe size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Web Sitesi</p>
                <p className="text-sm font-bold text-slate-700">{supportWebsite}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Address Info */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit">
              <MapPin size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Genel Merkez</h3>
            <div className="space-y-2">
              <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                {supportHqAddress}
              </p>
            </div>
          </div>
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(supportHqAddress)}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-xs font-black text-emerald-600 uppercase tracking-widest hover:gap-3 transition-all pt-4"
          >
            Haritada Göster <ArrowRight size={14} />
          </a>
        </div>

        {/* Support Portal */}
        <div className="bg-brand-600 rounded-3xl p-8 space-y-6 text-white shadow-xl shadow-brand-200 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="p-3 bg-white/20 text-white rounded-2xl w-fit">
              <ShieldCheck size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black tracking-tight">Teknik Destek</h3>
              <p className="text-sm text-white/80 font-medium leading-relaxed">
                Sistem ile ilgili hataları veya geliştirme önerilerinizi portal üzerinden iletebilirsiniz.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="w-full py-3 bg-white text-brand-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center cursor-pointer"
          >
            Destek Talebi Oluştur
          </button>
        </div>
      </div>

      {/* Support Ticket Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!submitting) setShowModal(false); }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden relative z-10"
            >
              {/* Header */}
              <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-600 rounded-xl text-white">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Teknik Destek Talebi</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">info@brighttour.com adresine gönderilir</p>
                  </div>
                </div>
                <button 
                  disabled={submitting}
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitTicket} className="p-6 space-y-4">
                {ticketStatus && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl flex items-start gap-3 text-sm font-medium ${
                      ticketStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                    }`}
                  >
                    {ticketStatus.type === 'success' ? (
                      <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span>{ticketStatus.text}</span>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ad Soyad</label>
                    <input 
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Adınız Soyadınız"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-brand-500 text-sm font-medium text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-posta</label>
                    <input 
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="e-posta@alanadi.com"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-brand-500 text-sm font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Firma / Acente Adı</label>
                  <input 
                    type="text"
                    value={formData.company}
                    onChange={e => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Varsa Acente veya Şirket Adınız"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-brand-500 text-sm font-medium text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Konu</label>
                  <input 
                    type="text"
                    required
                    value={formData.subject}
                    onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Talebinizin Kısa Başlığı"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-brand-500 text-sm font-medium text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mesajınız</label>
                  <textarea 
                    required
                    rows={4}
                    value={formData.message}
                    onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Yaşadığınız sorunu veya talebinizi detaylıca açıklayınız..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-brand-500 text-sm font-medium text-slate-800"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button 
                    type="button"
                    disabled={submitting}
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        GÖNDERİLİYOR
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        TALEBİ GÖNDER
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
