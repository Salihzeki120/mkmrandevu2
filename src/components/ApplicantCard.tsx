import React from 'react';
import { 
  X, 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  FileText, 
  History, 
  Upload, 
  Wallet, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Download,
  Trash2,
  ExternalLink,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Applicant, TimelineEvent, Document } from '../types';

interface Props {
  applicant: Applicant;
  onClose: () => void;
  onEdit: (applicant: Applicant) => void;
  onAddTimeline: (kod: string, content: string, status?: any, date?: string) => void;
  onUpdateDocuments: (kod: string, documents: Document[]) => void;
  onOpenProforma?: (applicant: Applicant) => void;
  darkMode?: boolean;
}

export default function ApplicantCard({ applicant, onClose, onEdit, onAddTimeline, onUpdateDocuments, onOpenProforma, darkMode }: Props) {
  const [manualStatus, setManualStatus] = React.useState(applicant.islemDurumu);
  const [manualDate, setManualDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [manualContent, setManualContent] = React.useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Tamamlandı': return 'bg-emerald-500 text-white';
      case 'Talep Bekliyor': return 'bg-amber-500 text-white';
      case 'Dosya Hazırlanıyor': return 'bg-brand-500 text-white';
      case 'Randevu Alındı': return 'bg-brand-500 text-white';
      case 'Konsoloslukta': return 'bg-brand-500 text-white';
      case 'Pasaport Bekleniyor': return 'bg-rose-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-';
    // DD-MM-YYYY or ISO
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts[0].length === 4) { // YYYY-MM-DD
         return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return dateStr;
    }
    return dateStr;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newDocs: Document[] = Array.from(files).map((file: any) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file), // In a real app, upload to server/storage
      uploadDate: new Date().toISOString(),
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
    }));

    onUpdateDocuments(applicant.takipKodu, [...(applicant.documents || []), ...newDocs]);
  };

  const removeDocument = (id: string) => {
    onUpdateDocuments(applicant.takipKodu, (applicant.documents || []).filter(d => d.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[60] p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`w-full max-w-6xl max-h-[90vh] ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-[40px] shadow-2xl border overflow-hidden flex flex-col`}
      >
        {/* Header Section */}
        <div className={`p-8 md:p-10 border-b ${darkMode ? 'border-slate-800' : 'border-slate-200'} flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-20 bg-brand-600/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="flex items-center gap-6 z-10">
            <div className="w-20 h-20 rounded-3xl bg-brand-600 flex items-center justify-center text-white shadow-xl shadow-brand-200 shrink-0">
              <User size={40} strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className={`text-2xl md:text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  {applicant.ad} {applicant.soyad}
                </h2>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(applicant.islemDurumu)}`}>
                  {applicant.islemDurumu}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-bold text-slate-400">
                <span className="flex items-center gap-1.5 font-mono text-brand-600 tracking-tighter">
                  <ShieldCheck size={14} /> {applicant.takipKodu}
                </span>
                <span className="flex items-center gap-1.5 uppercase">
                  <MapPin size={14} /> {applicant.ulke}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail size={14} /> {applicant.email}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 z-10 self-start md:self-center">
            {onOpenProforma && (
              <button 
                onClick={() => onOpenProforma(applicant)}
                className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl transition-all text-sm uppercase tracking-wider shadow-lg shadow-rose-200 flex items-center gap-2"
                title="Proforma Fatura Gör"
              >
                <FileText size={18} />
                <span>PROFORMA FATURA</span>
              </button>
            )}
            <button 
              onClick={() => onEdit(applicant)}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all text-sm uppercase tracking-wider"
            >
              PROFİLİ DÜZENLE
            </button>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-slate-100 rounded-2xl transition-colors text-slate-400"
            >
              <X size={28} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Details & Payments */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Pasaport No */}
                <div className={`p-5 rounded-[24px] ${darkMode ? 'bg-slate-800' : 'bg-slate-50'} border ${darkMode ? 'border-slate-700' : 'border-slate-300'} hover:border-brand-400 transition-all shadow-sm`}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Pasaport No</p>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
                      <FileText size={20} />
                    </div>
                    <h4 className={`text-base font-black ${darkMode ? 'text-white' : 'text-slate-800'} truncate`}>
                      {applicant.pasaportNo || '-'}
                    </h4>
                  </div>
                </div>

                {/* Randevu Tarihi */}
                <div className={`p-5 rounded-[24px] ${darkMode ? 'bg-slate-800' : 'bg-slate-50'} border ${darkMode ? 'border-slate-700' : 'border-slate-300'} hover:border-brand-400 transition-all shadow-sm`}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Randevu Tarihi</p>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
                      <Calendar size={20} />
                    </div>
                    <h4 className={`text-base font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      {formatDate(applicant.randevuTarihi)}
                    </h4>
                  </div>
                </div>

                {/* Randevu Saati */}
                <div className={`p-5 rounded-[24px] ${darkMode ? 'bg-slate-800' : 'bg-slate-50'} border ${darkMode ? 'border-slate-700' : 'border-slate-300'} hover:border-brand-400 transition-all shadow-sm`}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Randevu Saati</p>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                      <Clock size={20} />
                    </div>
                    <h4 className={`text-base font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      {applicant.saat || '-'}
                    </h4>
                  </div>
                </div>

                {/* Ödeme Durumu */}
                <div className={`p-5 rounded-[24px] ${darkMode ? 'bg-slate-800' : 'bg-slate-50'} border ${darkMode ? 'border-slate-700' : 'border-slate-300'} hover:border-brand-400 transition-all shadow-sm`}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Ödeme Durumu</p>
                  <div className="flex items-center gap-3">
                    {applicant.odemeDurumu === 'Ödendi' ? (
                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                        <CheckCircle2 size={20} />
                      </div>
                    ) : (
                      <div className="p-2 bg-rose-100 text-rose-600 rounded-lg animate-pulse">
                        <AlertTriangle size={20} />
                      </div>
                    )}
                    <h4 className={`text-base font-black ${applicant.odemeDurumu === 'Ödendi' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {applicant.odemeDurumu}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Ücret Detayları */}
              <div className={`p-6 rounded-[32px] ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300 shadow-sm'} border`}>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="p-1.5 bg-brand-100 text-brand-600 rounded-lg">
                    <CreditCard size={18} />
                  </div>
                  <h3 className={`text-sm font-black uppercase tracking-wider ${darkMode ? 'text-white' : 'text-slate-800'}`}>Ücret Detayları</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-3 ${darkMode ? 'bg-slate-900/40 border-slate-700' : 'bg-slate-50/50 border-slate-300'} rounded-xl border`}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Konsolosluk</p>
                    <p className={`text-sm font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {applicant.konsoloslukUcreti?.toLocaleString('tr-TR') || 0} {applicant.currency || 'TRY'}
                    </p>
                  </div>
                  <div className={`p-3 ${darkMode ? 'bg-slate-900/40 border-slate-700' : 'bg-slate-50/50 border-slate-300'} rounded-xl border`}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hizmet Bedeli</p>
                    <p className={`text-sm font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {applicant.hizmetBedeli?.toLocaleString('tr-TR') || 0} {applicant.currency || 'TRY'}
                    </p>
                  </div>
                  <div className={`p-3 ${darkMode ? 'bg-slate-900/40 border-slate-700' : 'bg-slate-50/50 border-slate-300'} rounded-xl border`}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">KDV (%{applicant.kdvOrani || 20})</p>
                    <p className={`text-sm font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {applicant.kdvTutarı?.toLocaleString('tr-TR') || 0} {applicant.currency || 'TRY'}
                    </p>
                  </div>
                  <div className={`p-3 ${darkMode ? 'bg-brand-950/20 border-brand-800/30 text-brand-400' : 'bg-brand-50 text-brand-700 border-brand-300'} rounded-xl border`}>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-brand-400' : 'text-brand-400'}`}>TOPLAM TUTAR</p>
                    <p className="text-sm font-black">
                      {applicant.fiyat?.toLocaleString('tr-TR')} {applicant.currency || 'TRY'}
                    </p>
                  </div>
                </div>

                {onOpenProforma && (
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onOpenProforma(applicant)}
                      className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                    >
                      <FileText size={16} />
                      <span>PROFORMA FATURA GÖRÜNTÜLE / PDF</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Document Management */}
              <div className={`p-8 rounded-[40px] border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-600 text-white rounded-xl shadow-lg">
                      <FileText size={20} />
                    </div>
                    <h3 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>Yüklenen Belgeler</h3>
                  </div>
                  <label className="cursor-pointer flex items-center gap-2 text-xs font-black text-brand-600 uppercase tracking-widest hover:bg-brand-50 px-4 py-2 rounded-xl transition-all">
                    <Plus size={16} /> Yeni Belge Ekle
                    <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {applicant.documents && applicant.documents.length > 0 ? (
                    applicant.documents.map((doc) => (
                      <div 
                        key={doc.id} 
                        className={`p-5 rounded-3xl border ${darkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-300'} group flex items-center justify-between hover:border-brand-300 transition-all`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-400 group-hover:text-brand-600 transition-colors">
                            <FileText size={24} />
                          </div>
                          <div className="min-w-0">
                            <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-800'} truncate px-1`}>{doc.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{doc.size} • {formatDate(doc.uploadDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <a href={doc.url} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-brand-600 hover:bg-white rounded-lg"><Download size={18} /></a>
                          <button onClick={() => removeDocument(doc.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg"><Trash2 size={18} /></button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 py-12 text-center border-2 border-dashed border-slate-300 rounded-[32px]">
                       <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                         <Upload size={32} />
                       </div>
                       <p className="text-sm font-medium text-slate-400 italic">Henüz belge yüklenmemiş.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Applicant Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className={`p-8 rounded-[40px] border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'} space-y-6`}>
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Kişisel Detaylar</h3>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center py-1 border-b border-slate-300/50">
                        <span className="text-sm text-slate-500 font-medium">Pasaport No</span>
                        <span className="text-sm font-bold text-slate-800">{applicant.pasaportNo || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-300/50">
                        <span className="text-sm text-slate-500 font-medium">Doğum Tarihi</span>
                        <span className="text-sm font-bold text-slate-800">{formatDate(applicant.dogumTarihi)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-300/50">
                        <span className="text-sm text-slate-500 font-medium">İkamet Şehri</span>
                        <span className="text-sm font-bold text-slate-800">{applicant.ikametSehri || '-'}</span>
                      </div>
                   </div>
                </div>

                <div className={`p-8 rounded-[40px] border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'} space-y-6`}>
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Randevu Merkezi</h3>
                   <div className="space-y-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Merkez Adı</span>
                        <span className="text-sm font-bold text-slate-800 leading-tight">{applicant.basvuruMerkezi || '-'}</span>
                      </div>
                      <div className="flex flex-col gap-1 pt-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Adres Bilgisi</span>
                        <span className="text-xs font-medium text-slate-500 leading-relaxed italic line-clamp-2">{applicant.merkezAdresi || 'Belirtilmedi'}</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Right Column: Timeline / History */}
            <div className="lg:col-span-4 space-y-8">
              <div className={`h-full p-8 rounded-[40px] border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-brand-600 text-white shadow-xl shadow-brand-200'} flex flex-col`}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <History size={20} />
                    </div>
                    <h3 className="text-xl font-black">İşlem Geçmişi</h3>
                  </div>
                </div>

                <div className="flex-1 space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/20 overflow-y-auto pr-4 custom-scrollbar lg:max-h-[600px]">
                  {applicant.timeline && applicant.timeline.length > 0 ? (
                    applicant.timeline.map((event, idx) => (
                      <div key={event.id} className="relative pl-12 group">
                        <div className={`absolute left-2.5 top-1 w-3 h-3 rounded-full border-2 border-white ${idx === 0 ? 'bg-white animate-pulse' : 'bg-brand-600'} z-10`} />
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-white/60 tracking-widest uppercase">
                            {new Date(event.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-sm font-bold leading-snug">{event.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-0.5 bg-white/10 rounded-md text-[9px] font-black uppercase tracking-tighter">Durum Değişti</span>
                            <span className="text-[10px] text-white/50 font-medium">Birim: {event.user || 'Sistem'}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 opacity-40 text-center">
                      <Clock size={48} strokeWidth={1} />
                      <p className="mt-4 text-xs font-bold uppercase tracking-widest font-mono">Veri Kaydı Yok</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                   <div className="flex items-center gap-2 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" />
                      <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Manuel Geçmiş Kaydı Ekle</p>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-3">
                      <select 
                        value={manualStatus}
                        onChange={(e) => setManualStatus(e.target.value as any)}
                        className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-[11px] font-bold text-white outline-none focus:bg-white/20 transition-all"
                      >
                        <option value="Talep Bekliyor">Talep Bekliyor</option>
                        <option value="İşlemde">İşlemde</option>
                        <option value="Dosya Hazırlanıyor">Dosya Hazırlanıyor</option>
                        <option value="Randevu Alındı">Randevu Alındı</option>
                        <option value="Konsoloslukta">Konsoloslukta</option>
                        <option value="Pasaport Bekleniyor">Pasaport Bekleniyor</option>
                        <option value="Tamamlandı">Tamamlandı</option>
                      </select>
                      <input 
                        type="date"
                        value={manualDate}
                        onChange={(e) => setManualDate(e.target.value)}
                        className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-[11px] font-bold text-white outline-none focus:bg-white/20 transition-all"
                      />
                   </div>

                   <div className="relative group">
                      <input 
                        type="text" 
                        placeholder="İşlem kaydı ekleyin..."
                        value={manualContent}
                        onChange={(e) => setManualContent(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && manualContent.trim()) {
                            onAddTimeline(applicant.takipKodu, manualContent, manualStatus, manualDate);
                            setManualContent('');
                          }
                        }}
                        className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:bg-white/20 focus:border-white/40 transition-all text-white placeholder:text-white/40"
                      />
                      <button 
                        onClick={() => {
                          if (manualContent.trim()) {
                            onAddTimeline(applicant.takipKodu, manualContent, manualStatus, manualDate);
                            setManualContent('');
                          }
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-xl transition-all text-white"
                      >
                        <ArrowRight size={18} />
                      </button>
                   </div>
                   <p className="text-[9px] text-white/40 text-center uppercase font-bold tracking-widest">Açıklama yazıp Enter'a basarak kaydedin</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
