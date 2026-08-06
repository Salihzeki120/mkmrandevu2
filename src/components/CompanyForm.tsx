import React, { useState, useEffect, useRef } from 'react';
import { Building2, Mail, Phone, MapPin, Save, User as UserIcon, Globe, AlertCircle, CheckCircle2, Trash2, Search, Edit3, X, Upload, FileDown, FileText, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const initialFormState = {
  firma_unvani: '',
  vergi_dairesi: '',
  vergi_no: '',
  email: '',
  telefon: '',
  adres: '',
  yetkili_ad_soyad: '',
  yetkili_telefon: ''
};

export default function CompanyForm({ initialCompany, onSave }: { initialCompany?: any, onSave?: () => void }) {
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkData, setBulkData] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const headers = ['Firma Resmi Ünvanı', 'Vergi Dairesi', 'Vergi / TCKN', 'Telefon', 'E-Posta', 'Diğer İletişim', 'Yetkili', 'Adres'];
    const csvContent = headers.join(',') + '\n' + 
      "Örnek Firma Ltd. Şti.,Büyük Mükellefler,1234567890,02121234567,info@firma.com,05321234567,Ahmet Yılmaz,İstanbul Türkiye";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'firma_yukleme_sablonu.csv');
    link.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("Dosya seçildi:", file.name, file.size, "bytes");

    const reader = new FileReader();
    
    // We'll define a function to process the text once read
    const processContent = (text: string, currentEncoding: string) => {
      try {
        let processedText = text;
        
        // Check for replacement characters () which indicate wrong encoding
        // If we find them and we haven't tried windows-1254 yet, we retry
        if (processedText.includes('') && currentEncoding === 'UTF-8') {
          console.log("UTF-8 kodlamasında bozuk karakterler saptandı, windows-1254 deneniyor...");
          reader.readAsText(file, 'windows-1254');
          return true; // Indicating we are retrying
        }

        // Remove BOM if exists
        if (processedText.startsWith('\uFEFF')) {
          processedText = processedText.substring(1);
          console.log("BOM temizlendi.");
        }

        const lines = processedText.split(/\r?[\n\r]/).filter(line => line.trim() !== '');
        console.log("Toplam satır sayısı:", lines.length);

        if (lines.length < 2) {
          setMessage({ type: 'error', text: 'CSV dosyası boş veya başlık satırı dışında veri içermiyor.' });
          return false;
        }

        // Advanced Separator Detection
        const firstLine = lines[0];
        const counts = {
          ';': (firstLine.match(/;/g) || []).length,
          ',': (firstLine.match(/,/g) || []).length,
          '\t': (firstLine.match(/\t/g) || []).length
        };
        
        let separator = ',';
        if (counts[';'] >= counts[','] && counts[';'] >= counts['\t']) separator = ';';
        else if (counts['\t'] >= counts[','] && counts['\t'] >= counts[';']) separator = '\t';
        
        console.log(`Ayırıcı olarak '${separator === '\t' ? 'TAB' : separator}' seçildi. Kodlama: ${currentEncoding}`);

        // Clean headers: remove quotes, trim, lowercase
        const cleanStr = (s: string) => s.replace(/["']/g, '').trim().toLowerCase();
        const headers = firstLine.split(separator).map(cleanStr);

        const data = lines.slice(1).map((line, lineIdx) => {
          const values = line.split(separator).map(v => v.replace(/["']/g, '').trim());
          const rawObj: any = {};
          headers.forEach((header, index) => {
            if (header) {
              rawObj[header] = values[index] || '';
            }
          });
          
          // Advanced Fuzzy Key Finder
          const findValue = (keywords: string[]) => {
            const foundKey = headers.find(h => 
              keywords.some(kw => {
                const kwLower = kw.toLowerCase();
                return h === kwLower || h.includes(kwLower) || kwLower.includes(h);
              })
            );
            return foundKey ? rawObj[foundKey] : '';
          };
          
          return {
            firma_unvani: findValue(['unvan', 'firma ismi', 'resmi unvan', 'şirket', 'firma resmi']),
            telefon: findValue(['telefon', 'tel']),
            email: findValue(['email', 'e-posta', 'eposta', 'mail']),
            yetkili_telefon: findValue(['diğer', 'cep', 'gsm', 'ek telefon']),
            vergi_dairesi: findValue(['daire', 'vergi dairesi']),
            vergi_no: findValue(['vergi no', 'tckn', 'vergi n', 'v.n']),
            yetkili_ad_soyad: findValue(['yetkili', 'ilgili', 'ad soyad']),
            adres: findValue(['adres'])
          };
        });

        const validData = data.filter(d => d.firma_unvani && d.firma_unvani.trim() !== '');
        setBulkData(validData);
        
        if (validData.length === 0) {
          setMessage({ type: 'error', text: 'Firma Ünvanı sütunu bulunamadı.' });
        }
        return false;
      } catch (err) {
        console.error("Dosya işleme hatası:", err);
        setMessage({ type: 'error', text: 'Dosya işlenirken teknik bir hata oluştu.' });
        return false;
      }
    };

    let triedWindows1254 = false;
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const encodingUsed = triedWindows1254 ? 'windows-1254' : 'UTF-8';
      const isRetrying = processContent(text, encodingUsed);
      if (isRetrying) {
        triedWindows1254 = true;
      }
    };

    // Start with UTF-8
    reader.readAsText(file, 'UTF-8');
  };

  const handleBulkSubmit = async () => {
    if (bulkData.length === 0) {
      console.warn("Yüklenecek veri yok.");
      return;
    }
    
    console.log("Toplu yükleme başlatılıyor. Toplam firma:", bulkData.length);
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/companies/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkData),
        credentials: 'include'
      });

      console.log("Sunucu yanıtı:", res.status, res.statusText);

      if (res.ok) {
        const result = await res.json();
        console.log("Başarılı yükleme sonucu:", result);
        setMessage({ 
          type: 'success', 
          text: `${result.count || bulkData.length} adet firma başarıyla yüklendi.` 
        });
        setBulkData([]);
        setShowBulkUpload(false);
        fetchCompanies();
        if (onSave) onSave();
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Bilinmeyen hata' }));
        console.error("Yükleme hatası detayı:", errorData);
        setMessage({ 
          type: 'error', 
          text: `Toplu yükleme hatası: ${errorData.error || 'Sunucu hatası'}` 
        });
      }
    } catch (error) {
      console.error("Toplu yükleme istisnası:", error);
      setMessage({ type: 'error', text: 'Sunucuya bağlanılamadı. İnternet bağlantınızı veya oturumunuzu kontrol edin.' });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (initialCompany) {
      setEditingId(initialCompany.id);
      setFormData({
        firma_unvani: initialCompany.firma_unvani || '',
        vergi_dairesi: initialCompany.vergi_dairesi || '',
        vergi_no: initialCompany.vergi_no || '',
        email: initialCompany.email || '',
        telefon: initialCompany.telefon || '',
        adres: initialCompany.adres || '',
        yetkili_ad_soyad: initialCompany.yetkili_ad_soyad || '',
        yetkili_telefon: initialCompany.yetkili_telefon || ''
      });
    }
  }, [initialCompany]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/companies', { credentials: 'include' });
      if (!res.ok) {
        const text = await res.text();
        console.error('API Hatası (Companies):', res.status, text.substring(0, 500));
        return;
      }
      const data = await res.json();
      setCompanies(data);
    } catch (error) {
      console.error('Firmalar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const url = editingId ? `/api/companies/update/${editingId}` : '/api/companies';
      const method = 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      if (res.ok) {
        setMessage({ 
          type: 'success', 
          text: editingId ? 'Firma bilgileri güncellendi.' : 'Firma kaydı başarıyla oluşturuldu.' 
        });
        setFormData(initialFormState);
        setEditingId(null);
        fetchCompanies();
        if (onSave) onSave();
      } else {
        setMessage({ type: 'error', text: 'İşlem sırasında bir hata oluştu.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Sunucuya bağlanılamadı.' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (company) => {
    setEditingId(company.id);
    setFormData({
      firma_unvani: company.firma_unvani || '',
      vergi_dairesi: company.vergi_dairesi || '',
      vergi_no: company.vergi_no || '',
      email: company.email || '',
      telefon: company.telefon || '',
      adres: company.adres || '',
      yetkili_ad_soyad: company.yetkili_ad_soyad || '',
      yetkili_telefon: company.yetkili_telefon || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu firmayı silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/companies/delete/${id}`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        setCompanies(companies.filter(c => c.id !== id));
        setSelectedIds(prev => prev.filter(sid => sid !== id));
      }
    } catch (error) {
      console.error('Silme hatası:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`${selectedIds.length} adet firmayı toplu olarak silmek istediğinize emin misiniz?`)) return;
    
    setSaving(true);
    try {
      const res = await fetch('/api/companies/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
        credentials: 'include'
      });
      
      if (res.ok) {
        setCompanies(companies.filter(c => !selectedIds.includes(c.id)));
        setSelectedIds([]);
        setMessage({ type: 'success', text: 'Seçili firmalar başarıyla silindi.' });
      } else {
        setMessage({ type: 'error', text: 'Toplu silme sırasında bir hata oluştu.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Sunucuya bağlanılamadı.' });
    } finally {
      setSaving(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCompanies.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCompanies.map(c => c.id));
    }
  };

  const filteredCompanies = companies.filter(c => 
    (c.firma_unvani || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-10">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => setShowBulkUpload(false)}
          className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[28px] font-black text-xs uppercase tracking-widest transition-all ${!showBulkUpload ? 'bg-brand-600 text-white shadow-lg shadow-brand-100' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}
        >
          <Edit3 size={18} />
          Tekil Kayıt
        </button>
        <button
          onClick={() => setShowBulkUpload(true)}
          className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[28px] font-black text-xs uppercase tracking-widest transition-all ${showBulkUpload ? 'bg-brand-600 text-white shadow-lg shadow-brand-100' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}
        >
          <Upload size={18} />
          Toplu CSV Yükle
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showBulkUpload ? (
          <motion.div
            key="bulk"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden p-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-emerald-100 text-emerald-600 rounded-[24px]">
                    <FileText size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Toplu Firma İçerİ Aktar</h2>
                    <p className="text-sm text-slate-500 font-medium">CSV formatındaki dosyanızla yüzlerce firmayı tek seferde sisteme ekleyebilirsiniz.</p>
                  </div>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs hover:bg-slate-200 transition-all uppercase tracking-widest"
                >
                  <FileDown size={18} />
                  Şablonu İndir
                </button>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-4 border-dashed border-slate-100 rounded-[32px] p-20 text-center hover:border-brand-200 hover:bg-brand-50/30 transition-all cursor-pointer group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv"
                  className="hidden"
                />
                <div className="max-w-xs mx-auto space-y-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-brand-100 transition-all">
                    <Upload className="text-slate-300 group-hover:text-brand-600" size={32} />
                  </div>
                  <h3 className="text-lg font-black text-slate-800">Dosyayı Buraya Bırakın</h3>
                  <p className="text-sm text-slate-500 font-medium italic underline">Veya bilgisayarınızdan seçmek için tıklayın.</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Sadece .CSV dosyaları desteklenir</p>
                </div>
              </div>

              {bulkData.length > 0 && (
                <div className="mt-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Yüklenecek Verİ Önizlemesİ ({bulkData.length} Firma)</h4>
                    <button 
                      onClick={() => setBulkData([])}
                      className="text-xs font-bold text-rose-500 hover:underline"
                    >
                      Listeyi Temizle
                    </button>
                  </div>
                  <div className="max-h-[400px] overflow-auto border border-slate-100 rounded-3xl">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 sticky top-0">
                        <tr>
                      <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase">Firma Resmi Ünvanı</th>
                          <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase">Yetkİlİ</th>
                          <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase">E-Posta / Telefon</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {bulkData.slice(0, 10).map((row, i) => (
                          <tr key={i}>
                            <td className="px-6 py-3 text-xs font-bold text-slate-700">{row.firma_unvani}</td>
                            <td className="px-6 py-3 text-xs text-slate-500">{row.email}</td>
                            <td className="px-6 py-3 text-xs text-slate-500">{row.telefon}</td>
                          </tr>
                        ))}
                        {bulkData.length > 10 && (
                          <tr>
                            <td colSpan={3} className="px-6 py-3 text-xs text-slate-400 italic text-center">
                              ... ve diğer {bulkData.length - 10} satır daha
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <button
                    onClick={handleBulkSubmit}
                    disabled={saving}
                    className={`w-full flex items-center justify-center gap-3 py-5 bg-emerald-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-100 hover:opacity-90 transition-all ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <CheckCircle2 size={20} />
                    {saving ? 'YÜKLENİYOR...' : `${bulkData.length} FİRMAYI SİSTEME AKTAR`}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="single"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-4 ${editingId ? 'bg-brand-600' : 'bg-brand-600'} text-white rounded-[24px] shadow-lg shadow-brand-200 transition-colors`}>
                    <Building2 size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                      {editingId ? 'Firma Düzenle' : 'Yeni Firma Kaydı'}
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">Birlikte çalışacağınız acente veya çözüm ortağı firmalarını sisteme tanımlayın.</p>
                  </div>
                </div>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs hover:bg-slate-200 transition-all uppercase tracking-widest"
                  >
                    <X size={16} />
                    Düzenlemeyi İptal Et
                  </button>
                )}
              </div>

              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Firma Bilgileri */}
                <div className="space-y-8">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="w-1.5 h-6 bg-brand-600 rounded-full" />
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Temel Bilgiler</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic underline">Firma Resmi Ünvanı (Zorunlu)</label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="text"
                          required
                          value={formData.firma_unvani}
                          onChange={e => setFormData({...formData, firma_unvani: e.target.value})}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm font-bold"
                          placeholder="Firma tam ünvanı"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 text-slate-400">Vergi Dairesi</label>
                        <input
                          type="text"
                          value={formData.vergi_dairesi}
                          onChange={e => setFormData({...formData, vergi_dairesi: e.target.value})}
                          className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm font-bold"
                          placeholder="Daire adı"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 text-slate-400">Vergi / TCKN</label>
                        <input
                          type="text"
                          value={formData.vergi_no}
                          onChange={e => setFormData({...formData, vergi_no: e.target.value})}
                          className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm font-bold"
                          placeholder="10 veya 11 hane"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* İletişim Bilgileri */}
                <div className="space-y-8">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">İletişim ve Adres</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 text-slate-400">E-Posta</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm font-bold"
                            placeholder="eposta@domain.com"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 text-slate-400">Telefon</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            type="tel"
                            value={formData.telefon}
                            onChange={e => setFormData({...formData, telefon: e.target.value})}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm font-bold"
                            placeholder="0212..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Diğer İletişim</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="text"
                          value={formData.yetkili_telefon}
                          onChange={e => setFormData({...formData, yetkili_telefon: e.target.value})}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm font-bold"
                          placeholder="Alternatif no veya not"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 text-slate-400">Adres</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                        <textarea
                          value={formData.adres}
                          onChange={e => setFormData({...formData, adres: e.target.value})}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm font-bold min-h-[100px]"
                          placeholder="Açık adres..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Yetkili Bilgileri */}
                <div className="md:col-span-2 space-y-8 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="w-1.5 h-6 bg-brand-500 rounded-full" />
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Yetkili Bilgileri</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 text-slate-400">Yetkili</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="text"
                          value={formData.yetkili_ad_soyad}
                          onChange={e => setFormData({...formData, yetkili_ad_soyad: e.target.value})}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm font-bold"
                          placeholder="Yetkili adı"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 text-slate-400">Yetkili Cep Telefonu</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="tel"
                          value={formData.yetkili_telefon}
                          onChange={e => setFormData({...formData, yetkili_telefon: e.target.value})}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm font-bold"
                          placeholder="05xx..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <AnimatePresence>
                  {message && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`flex items-center gap-3 px-6 py-4 rounded-3xl text-sm font-black shadow-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}
                    >
                      {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                      {message.text}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <button
                type="submit"
                disabled={saving}
                className={`flex items-center gap-3 px-10 py-5 ${editingId ? 'bg-brand-600' : 'bg-slate-900'} text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-slate-200 hover:opacity-90 transition-all hover:-translate-y-1 active:scale-95 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Save size={20} />
                {saving ? (editingId ? 'GÜNCELLENİYOR...' : 'KAYDEDİLİYOR...') : (editingId ? 'DEĞİŞİKLİKLERİ KAYDET' : 'FİRMAYI KAYDET')}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Firma Listesi */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-100 text-brand-600 rounded-2xl">
              <Building2 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Kayıtlı Firmalar</h3>
              <p className="text-xs text-slate-500 font-medium">Toplam {companies.length} firma tanımlı.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {selectedIds.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl font-bold text-xs hover:bg-rose-600 transition-all shadow-lg shadow-rose-100"
              >
                <Trash2 size={16} />
                {selectedIds.length} Firmayı Sil
              </motion.button>
            )}
            <div className="relative group min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Firma ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm font-bold shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                <th className="pl-6 py-4 w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === filteredCompanies.length && filteredCompanies.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                </th>
                <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">İsim / Unvan</th>
                <th className="px-2 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Bilgiler</th>
                <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">İletişim</th>
                <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Yetkili</th>
                <th className="pr-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company) => (
                <tr key={company.id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-all group ${selectedIds.includes(company.id) ? 'bg-brand-50/30' : ''} ${editingId === company.id ? 'bg-brand-50/50' : ''}`}>
                  <td className="pl-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(company.id)}
                      onChange={() => toggleSelect(company.id)}
                      className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-black text-slate-800 tracking-tight block max-w-[200px] truncate" title={company.firma_unvani}>
                      {company.firma_unvani}
                    </span>
                  </td>
                  <td className="px-2 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase">TCKN/Vergi No</span>
                      <span className="text-xs font-bold text-slate-600 truncate max-w-[120px]">{company.vergi_no || '-'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 truncate max-w-[150px]">
                        <Mail size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">{company.email || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                        <Phone size={12} className="text-slate-400 shrink-0" />
                        <span>{company.telefon || '-'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-black text-slate-700 truncate max-w-[120px]">{company.yetkili_ad_soyad || '-'}</span>
                      <span className="text-[10px] font-bold text-slate-400">{company.yetkili_telefon}</span>
                    </div>
                  </td>
                  <td className="pr-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleEdit(company)}
                        className="p-1.5 text-brand-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                        title="Düzenle"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(company.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCompanies.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-sm font-bold text-slate-400">Henüz firma kaydı bulunmuyor.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
