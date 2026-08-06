import React, { useState } from 'react';
import { X, Save, Trash2, History, FileText, User, Upload, FileSearch, Trash, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Applicant, Country, TimelineEvent, Document, CountryPrice } from '../types';
import { COUNTRIES, STATUS_OPTIONS, PAYMENT_OPTIONS, RESULT_OPTIONS, CITIES, VISA_CENTERS, getCurrencyForCountry, getCurrencySymbol } from '../constants';
import Timeline from './Timeline';
import { calculatePrice } from '../utils/price';

interface Props {
  applicant?: Applicant;
  initialData?: Partial<Applicant>;
  countries: Country[];
  prices: CountryPrice[];
  onClose: () => void;
  onSave: (data: Partial<Applicant>) => void;
  onDelete?: (kod: string) => void;
  onOpenAccounting?: (applicant: Applicant) => void;
  onOpenProforma?: (applicant: Applicant) => void;
  darkMode?: boolean;
  user?: any;
}

type Tab = 'info' | 'history' | 'documents';

export default function ApplicantForm({ applicant, initialData, countries, prices, onClose, onSave, onDelete, onOpenAccounting, onOpenProforma, darkMode, user }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [manualTimeline, setManualTimeline] = useState({
    status: 'İşlemde',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [formFields, setFormFields] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const getUserInitials = (user: any) => {
    if (!user) return 'MKM';
    const name = user.username || user.acenteAdi || 'MKM';
    const cleanName = name.trim().toUpperCase();
    const words = cleanName.split(/\s+/);
    if (words.length >= 2) {
      return words.slice(0, 3).map((w: string) => w[0]).join('');
    }
    if (cleanName.length >= 2) {
      return cleanName.substring(0, 3);
    }
    return 'MKM';
  };

  const [formData, setFormData] = useState<Partial<Applicant>>({
    takipKodu: applicant?.takipKodu || initialData?.takipKodu || (() => {
      const initials = getUserInitials(user);
      return `${initials}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    })(),
    ad: initialData?.ad || '',
    soyad: initialData?.soyad || '',
    dogumTarihi: initialData?.dogumTarihi || '',
    ulke: initialData?.ulke || '',
    islemDurumu: initialData?.islemDurumu || 'Talep Bekliyor',
    randevuTarihi: initialData?.randevuTarihi || '',
    saat: initialData?.saat || '',
    odemeDurumu: initialData?.odemeDurumu || 'Ödenmedi',
    pasaportNo: initialData?.pasaportNo || '',
    notlar: initialData?.notlar || '',
    pasaportSkt: initialData?.pasaportSkt || '',
    email: initialData?.email || '',
    vizeSonucu: initialData?.vizeSonucu || '',
    vizeKategorisi: applicant?.vizeKategorisi || initialData?.vizeKategorisi || '',
    vizeGecerlilikTarihi: initialData?.vizeGecerlilikTarihi || '',
    ikametSehri: applicant?.ikametSehri || initialData?.ikametSehri || '',
    basvuruMerkezi: applicant?.basvuruMerkezi || initialData?.basvuruMerkezi || '',
    merkezAdresi: applicant?.merkezAdresi || initialData?.merkezAdresi || '',
    musteriTipi: applicant?.musteriTipi || initialData?.musteriTipi || 'Bireysel',
    firmaAdi: initialData?.firmaAdi || 'MKM VİZE',
    extra_fields: applicant?.extra_fields ? (typeof applicant.extra_fields === 'string' ? JSON.parse(applicant.extra_fields) : applicant.extra_fields) : (initialData?.extra_fields || {}),
    fiyat: (applicant?.fiyat !== undefined && applicant?.fiyat !== null && applicant.fiyat > 0) 
      ? applicant.fiyat 
      : (initialData?.fiyat !== undefined ? initialData.fiyat : (applicant?.ulke ? (prices.find(p => p.ulke === applicant.ulke)?.toplam ?? 0) : 0)),
    konsoloslukUcreti: applicant?.konsoloslukUcreti || initialData?.konsoloslukUcreti || (applicant?.ulke ? (prices.find(p => p.ulke === applicant.ulke)?.konsoloslukUcreti ?? 0) : 0),
    hizmetBedeli: applicant?.hizmetBedeli || initialData?.hizmetBedeli || (applicant?.ulke ? (prices.find(p => p.ulke === applicant.ulke)?.hizmetBedeli ?? 0) : 0),
    kdvOrani: applicant?.kdvOrani || initialData?.kdvOrani || (applicant?.ulke ? (prices.find(p => p.ulke === applicant.ulke)?.kdvOrani ?? 20) : 20),
    kdvTutarı: applicant?.kdvTutarı || initialData?.kdvTutarı || (applicant?.ulke ? (prices.find(p => p.ulke === applicant.ulke)?.kdv ?? 0) : 0),
    currency: (applicant?.currency && applicant.currency !== 'TRY') 
      ? applicant.currency 
      : (initialData?.currency && initialData.currency !== 'TRY' 
        ? initialData.currency 
        : (applicant?.ulke 
          ? (prices.find(p => p.ulke === applicant.ulke)?.currency || getCurrencyForCountry(applicant.ulke)) 
          : getCurrencyForCountry(initialData?.ulke))),
    timeline: (() => {
      const t = applicant?.timeline || initialData?.timeline;
      if (typeof t === 'string') return JSON.parse(t);
      return t || [];
    })(),
    documents: (() => {
      const d = applicant?.documents || initialData?.documents;
      if (typeof d === 'string') return JSON.parse(d);
      return d || [];
    })(),
    ...Object.fromEntries(Object.entries(applicant || {}).filter(([k, v]) => k !== 'timeline' && k !== 'documents' && v !== undefined && v !== null))
  });

  React.useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const [formsRes, companiesRes] = await Promise.all([
          fetch('/api/forms', { credentials: 'include' }),
          fetch('/api/companies', { credentials: 'include' })
        ]);

        if (formsRes.ok) {
          const forms = await formsRes.json();
          const customerForm = forms.find((f: any) => f.id === 'customer');
          if (customerForm) {
            setFormFields(customerForm.fields);
          }
        } else {
          const text = await formsRes.text();
          console.error('API Hatası (Forms):', formsRes.status, text.substring(0, 500));
        }

        if (companiesRes.ok) {
          const companiesData = await companiesRes.json();
          setCompanies(companiesData);
        } else {
          const text = await companiesRes.text();
          console.error('API Hatası (Companies):', companiesRes.status, text.substring(0, 500));
        }
      } catch (error) {
        console.error('Yapılandırmalar yüklenemedi:', error);
      }
    };
    fetchConfigs();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCompanyDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getAutoCenter = (country?: string, city?: string) => {
    if (!country || !city) return null;
    const visaCenter = VISA_CENTERS.find(vc => vc.ulkeler.includes(country));
    if (!visaCenter) return null;
    const area = visaCenter.yetki_alanlari.find(a => a.iller.includes(city));
    if (!area) return null;
    return {
      merkez: `${visaCenter.kurum} - ${area.merkez}`,
      adres: area.adres || ''
    };
  };

  const autoCenter = getAutoCenter(formData.ulke, formData.ikametSehri);
  const isAutoDetermined = !!autoCenter;

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError('');
    try {
      const res = await fetch(`/api/applicants/${searchQuery}`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.error) {
        setSearchError('Kayıt bulunamadı.');
      } else {
        const processedData = {
          ...data,
          timeline: typeof data.timeline === 'string' ? JSON.parse(data.timeline) : (data.timeline || []),
          documents: typeof data.documents === 'string' ? JSON.parse(data.documents) : (data.documents || [])
        };
        setFormData(prev => ({ ...prev, ...processedData }));
        setSearchError('');
      }
    } catch (error) {
      setSearchError('Arama sırasında bir hata oluştu.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const numValue = name === 'fiyat' ? (value === '' ? 0 : Number(value)) : value;
      const newData = { ...prev, [name]: numValue };
      
      // Değişikliği taslak olarak localStorage'da sakla (aktif olarak yazarken yedekleme)
      if (!applicant) {
        localStorage.setItem('mkm_applicant_draft', JSON.stringify(newData));
      }
      
      // If country changes, auto-fill price
      if (name === 'ulke') {
        const countryPrice = prices.find(p => p.ulke === value);
        if (countryPrice) {
          const calc = calculatePrice(countryPrice.konsoloslukUcreti, countryPrice.hizmetBedeli, countryPrice.kdvOrani || 20);
          newData.fiyat = calc.toplam;
          newData.konsoloslukUcreti = calc.konsoloslukUcreti;
          newData.hizmetBedeli = calc.hizmetBedeli;
          newData.kdvOrani = calc.kdvOrani;
          newData.kdvTutarı = calc.kdv;
          newData.currency = (countryPrice.currency && countryPrice.currency !== 'TRY') ? countryPrice.currency : getCurrencyForCountry(value as string);
        } else {
          newData.currency = getCurrencyForCountry(value as string);
        }
        
        // Reset city, center and address when country changes
        newData.ikametSehri = '';
        newData.basvuruMerkezi = '';
        newData.merkezAdresi = '';
      }

      // If city changes, auto-fill application center
      if (name === 'ikametSehri') {
        const selectedCountry = newData.ulke;
        if (selectedCountry && value) {
          const visaCenter = VISA_CENTERS.find(vc => vc.ulkeler.includes(selectedCountry));
          if (visaCenter) {
            const area = visaCenter.yetki_alanlari.find(a => a.iller.includes(value));
            if (area) {
              newData.basvuruMerkezi = `${visaCenter.kurum} - ${area.merkez}`;
              newData.merkezAdresi = area.adres || '';
            } else {
              newData.basvuruMerkezi = 'Yetki Alanı Dışında';
              newData.merkezAdresi = '';
            }
          } else {
            newData.basvuruMerkezi = 'Merkez Belirlenemedi';
            newData.merkezAdresi = '';
          }
        } else {
          newData.basvuruMerkezi = '';
          newData.merkezAdresi = '';
        }
      }

      // If center changes manually
      if (name === 'basvuruMerkezi') {
        const selectedCountry = newData.ulke;
        if (selectedCountry && value && value !== 'Merkez Belirlenemedi' && value !== 'Yetki Alanı Dışında') {
          const visaCenter = VISA_CENTERS.find(vc => vc.ulkeler.includes(selectedCountry));
          if (visaCenter) {
            const area = visaCenter.yetki_alanlari.find(a => `${visaCenter.kurum} - ${a.merkez}` === value);
            if (area) {
              newData.merkezAdresi = area.adres || '';
            }
          }
        } else if (value === 'Merkez Belirlenemedi' || value === 'Yetki Alanı Dışında') {
          // Keep the address if it was already set manually, or clear it if it was auto-filled
          // Actually, let's clear it to let user type
          newData.merkezAdresi = '';
        }
      }

      // If status changes, add to timeline
      if (name === 'islemDurumu' && value !== prev.islemDurumu) {
        const newEvent: TimelineEvent = {
          id: Math.random().toString(36).substring(2, 9),
          status: value as any,
          date: new Date().toISOString(),
          description: `İşlem durumu "${prev.islemDurumu}" iken "${value}" olarak güncellendi.`,
          user: 'Sistem' // In a real app, this would be the logged-in user
        };
        newData.timeline = [newEvent, ...(prev.timeline || [])];
      }

      // Vize sonucu 'Onaylandı' değilse geçerlilik tarihini temizle
      if (name === 'vizeSonucu' && value !== 'Onaylandı') {
        newData.vizeGecerlilikTarihi = '';
      }
      return newData;
    });
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

    setFormData(prev => ({
      ...prev,
      documents: [...(prev.documents || []), ...newDocs]
    }));
  };

  const removeDocument = (id: string) => {
    setFormData(prev => ({
      ...prev,
      documents: (prev.documents || []).filter(d => d.id !== id)
    }));
  };

  const addManualTimeline = () => {
    if (!manualTimeline.description.trim()) return;
    
    const newEvent: TimelineEvent = {
      id: Math.random().toString(36).substring(2, 9),
      status: manualTimeline.status as any,
      date: new Date(manualTimeline.date).toISOString(),
      description: manualTimeline.description,
      user: user?.username || 'Yönetici'
    };
    
    setFormData(prev => ({
      ...prev,
      timeline: [newEvent, ...(prev.timeline || [])]
    }));
    
    setManualTimeline(prev => ({ ...prev, description: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('mkm_last_success_applicant', JSON.stringify(formData));
    localStorage.removeItem('mkm_applicant_draft');
    onSave(formData);
  };

  const getCurrencySymbolHelper = (currency?: string) => {
    return getCurrencySymbol(currency, formData.ulke);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col transition-all duration-300`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-brand-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <User size={20} />
            </div>
            <h3 className="text-xl font-bold">{applicant ? 'Kayıt Güncelle' : 'Yeni Başvuru Kaydı'}</h3>
          </div>
          <div className="flex items-center gap-2">
            {onOpenProforma && (applicant || formData.takipKodu) && (
              <button 
                type="button" 
                onClick={() => onOpenProforma((applicant || formData) as Applicant)} 
                className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs rounded-xl transition-all shadow flex items-center gap-1.5"
              >
                <FileText size={15}/>
                <span>PROFORMA FATURA</span>
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex border-b ${darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50'} px-6`}>
          <button 
            onClick={() => setActiveTab('info')}
            className={`px-6 py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'info' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <FileText size={18} />
            BİLGİLER
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'history' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <History size={18} />
            GEÇMİŞ
          </button>
          <button 
            onClick={() => setActiveTab('documents')}
            className={`px-6 py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'documents' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <Upload size={18} />
            BELGELER
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'info' && (
            <form onSubmit={handleSubmit} className="space-y-8">
              {!applicant && (
                <div className={`p-6 ${darkMode ? 'bg-slate-900/50 border border-slate-700' : 'bg-slate-50 border border-slate-300'} rounded-2xl space-y-3`}>
                  <label className={`text-sm font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Kayıt Bul / Getir (Takip Kodu veya Soyadı)</label>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder="Kod veya Soyadı giriniz..." 
                      className={`flex-1 px-4 py-2.5 ${darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-white border border-slate-300'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                    />
                    <button 
                      type="button"
                      onClick={handleSearch}
                      disabled={isSearching}
                      className="px-6 py-2.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSearching ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sorgula'}
                    </button>
                  </div>
                  {searchError && <p className="text-xs font-bold text-rose-600">{searchError}</p>}
                </div>
              )}

              <section className={`p-6 ${darkMode ? 'bg-slate-900/30 border border-slate-700/50' : 'bg-slate-50/50 border border-slate-200'} rounded-2xl`}>
                <div className="flex items-center gap-2 mb-4 border-b pb-2 border-slate-100/50">
                  <User className="text-brand-600 w-4 h-4" />
                  <h4 className={`text-xs font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'} uppercase tracking-widest`}>1. Zorunlu Başvuru Sahibi Bilgileri</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Ad */}
                  <div className="space-y-1">
                    <label className={`text-sm font-semibold flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Ad <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input required name="ad" value={formData.ad || ''} onChange={handleChange} className={`w-full px-4 py-2.5 ${darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-white border border-slate-300'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all`} />
                  </div>

                  {/* Soyad */}
                  <div className="space-y-1">
                    <label className={`text-sm font-semibold flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Soyad <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input required name="soyad" value={formData.soyad || ''} onChange={handleChange} className={`w-full px-4 py-2.5 ${darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-white border border-slate-300'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all`} />
                  </div>

                  {/* Müşteri Türü / İşlem Tipi */}
                  <div className="space-y-1">
                    <label className={`text-sm font-semibold flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Müşteri Türü <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <select 
                      required 
                      name="musteriTipi" 
                      value={formData.musteriTipi || 'Bireysel'} 
                      onChange={handleChange} 
                      className={`w-full px-4 py-2.5 ${darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-white border border-slate-300'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-bold text-brand-600`}
                    >
                      <option value="Bireysel">Bireysel (KDV Hariç Tutar)</option>
                      <option value="Kurumsal">Kurumsal (KDV Dahil Tutar)</option>
                    </select>
                  </div>

                  {/* E-posta */}
                  <div className="space-y-1">
                    <label className={`text-sm font-semibold flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      E-posta <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input type="email" required name="email" value={formData.email || ''} onChange={handleChange} className={`w-full px-4 py-2.5 ${darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-white border border-slate-300'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all`} />
                  </div>

                  {/* Vize Kategorisi */}
                  <div className="space-y-1">
                    <label className={`text-sm font-semibold flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Vize Kategorisi <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <select required name="vizeKategorisi" value={formData.vizeKategorisi || ''} onChange={handleChange} className={`w-full px-4 py-2.5 ${darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-white border border-slate-300'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all`}>
                      <option value="">Seçiniz...</option>
                      <option value="Turistik">Turistik</option>
                      <option value="Ticari">Ticari</option>
                      <option value="Aile Ziyareti">Aile Ziyareti</option>
                    </select>
                  </div>

                  {/* Hedef Ülke */}
                  <div className="space-y-1">
                    <label className={`text-sm font-semibold flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Hedef Ülke <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <select required name="ulke" value={formData.ulke || ''} onChange={handleChange} className={`w-full px-4 py-2.5 ${darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-white border border-slate-300'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all`}>
                      <option value="">Seçiniz...</option>
                      {countries.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>

                  {/* İkamet Şehri */}
                  <div className="space-y-1">
                    <label className={`text-sm font-semibold flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      İkamet Şehri <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <select 
                      required 
                      name="ikametSehri" 
                      value={formData.ikametSehri || ''} 
                      onChange={handleChange} 
                      disabled={!formData.ulke}
                      className={`w-full px-4 py-2.5 ${darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-white border border-slate-300'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <option value="">Seçiniz...</option>
                      {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              <section className={`p-6 ${darkMode ? 'bg-slate-900/10 border border-slate-700/30' : 'bg-slate-50/20 border border-slate-300'} rounded-2xl`}>
                <div className="flex items-center gap-2 mb-4 border-b pb-2 border-slate-100/50">
                  <FileText className="text-brand-600 w-4 h-4" />
                  <h4 className={`text-xs font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'} uppercase tracking-widest`}>2. Pasaport & Randevu Detayları</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Takip Kodu */}
                  <div className="space-y-1">
                    <label className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Takip Kodu (Otomatik)</label>
                    <input 
                      readOnly 
                      name="takipKodu" 
                      value={formData.takipKodu || ''} 
                      className={`w-full px-4 py-2.5 ${darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-slate-100 border border-slate-300'} rounded-xl outline-none font-mono text-brand-600 font-bold cursor-not-allowed`} 
                    />
                  </div>

                  {/* Doğum Tarihi */}
                  <div className="space-y-1">
                    <label className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Doğum Tarihi</label>
                    <input type="date" name="dogumTarihi" value={formData.dogumTarihi || ''} onChange={handleChange} className={`w-full px-4 py-2.5 ${darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-white border border-solid border-slate-300'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all`} />
                  </div>

                  {/* Pasaport No */}
                  <div className="space-y-1">
                    <label className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Pasaport No</label>
                    <input name="pasaportNo" value={formData.pasaportNo || ''} onChange={handleChange} className={`w-full px-4 py-2.5 ${darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-white border border-solid border-slate-300'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all`} />
                  </div>

                  {/* Pasaport SKT */}
                  <div className="space-y-1">
                    <label className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Pasaport SKT</label>
                    <input type="date" name="pasaportSkt" value={formData.pasaportSkt || ''} onChange={handleChange} className={`w-full px-4 py-2.5 ${darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-white border border-solid border-slate-300'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all`} />
                  </div>

                  {/* Firma Adı */}
                  <div className="space-y-1 relative" ref={dropdownRef}>
                    <label className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Firma Adı</label>
                    <div className="relative">
                      <input 
                        name="firmaAdi" 
                        value={formData.firmaAdi || ''} 
                        onChange={(e) => {
                          handleChange(e);
                          setShowCompanyDropdown(true);
                        }} 
                        onFocus={() => setShowCompanyDropdown(true)}
                        onClick={() => setShowCompanyDropdown(true)}
                        autoComplete="off"
                        className={`w-full px-4 py-2.5 ${darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-white border border-solid border-slate-300'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-bold`} 
                      />
                      <AnimatePresence>
                        {showCompanyDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`absolute left-0 right-0 top-full mt-2 rounded-2xl shadow-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} z-[70] max-h-64 overflow-y-auto py-2 custom-scrollbar`}
                          >
                            {companies
                              .filter(c => {
                                const input = (formData.firmaAdi || '').toLowerCase();
                                if (!input) return true;
                                return (c.acente_adi?.toLowerCase() || '').includes(input) ||
                                       (c.firma_unvani?.toLowerCase() || '').includes(input);
                              })
                              .map((company) => (
                                <button
                                  key={company.id}
                                  type="button"
                                  onClick={() => {
                                    setFormData({ 
                                      ...formData, 
                                      firmaAdi: company.acente_adi || company.firma_unvani,
                                      email: company.email || formData.email
                                    });
                                    setShowCompanyDropdown(false);
                                  }}
                                  className={`w-full text-left px-4 py-3 text-sm font-bold transition-all ${darkMode ? 'hover:bg-slate-700 text-white border-b border-white/5' : 'hover:bg-white text-slate-800 border-b border-slate-100'}`}
                                >
                                  <div className="flex flex-col">
                                    <span className="truncate">{company.acente_adi || company.firma_unvani}</span>
                                    {company.acente_adi && company.firma_unvani && company.acente_adi !== company.firma_unvani && (
                                      <span className="text-[10px] text-slate-400 font-medium truncate italic">{company.firma_unvani}</span>
                                    )}
                                  </div>
                                </button>
                              ))}
                            {companies.length > 0 && companies.filter(c => {
                              const input = (formData.firmaAdi || '').toLowerCase();
                              return (c.acente_adi?.toLowerCase() || '').includes(input) ||
                                     (c.firma_unvani?.toLowerCase() || '').includes(input);
                            }).length === 0 && (
                              <div className="px-4 py-6 text-center">
                                <p className="text-xs text-slate-400 font-bold italic">Kayıtlı firma bulunamadı.</p>
                                <p className="text-[10px] text-slate-500 mt-1">Yazmaya devam ederek yeni firma olarak kaydedebilirsiniz.</p>
                              </div>
                            )}
                            {companies.length === 0 && (
                                <p className="px-4 py-3 text-xs text-slate-400 font-bold italic text-center">Henüz kayıtlı firma yok.</p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* İşlem Durumu */}
                  <div className="space-y-1">
                    <label className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>İşlem Durumu</label>
                    <select name="islemDurumu" value={formData.islemDurumu || ''} onChange={handleChange} className={`w-full px-4 py-2.5 ${darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-white border border-solid border-slate-300'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all`}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {formData.islemDurumu === 'Randevu Alındı' && (
                      <div className="p-3 mt-2 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 text-xs flex items-center justify-between gap-2 shadow-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          <span><strong>Otomatik Proforma Fatura:</strong> "Randevu Alındı" seçildiğinde müşteri adına otomatik proforma fatura düzenlenmektedir.</span>
                        </div>
                        {onOpenProforma && (
                          <button
                            type="button"
                            onClick={() => onOpenProforma((applicant || formData) as Applicant)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-extrabold text-xs transition-colors shrink-0 flex items-center gap-1 shadow-sm"
                          >
                            <FileText size={14} />
                            <span>Proforma Gör</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Randevu Tarihi */}
                  <div className="space-y-1">
                    <label className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Randevu Tarihi</label>
                    <input type="date" name="randevuTarihi" value={formData.randevuTarihi || ''} onChange={handleChange} className={`w-full px-4 py-2.5 ${darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-white border border-solid border-slate-300'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all`} />
                  </div>

                  {/* Randevu Saati */}
                  <div className="space-y-1">
                    <label className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Randevu Saati</label>
                    <input type="time" name="saat" value={formData.saat || ''} onChange={handleChange} className={`w-full px-4 py-2.5 ${darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-white border border-solid border-slate-300'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all`} />
                  </div>

                  {/* Ödeme Durumu */}
                  <div className="space-y-1">
                    <label className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Ödeme Durumu</label>
                    <select name="odemeDurumu" value={formData.odemeDurumu || ''} onChange={handleChange} className={`w-full px-4 py-2.5 ${darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-white border border-solid border-slate-300'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all`}>
                      {PAYMENT_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  {/* Başvuru Merkezi */}
                  <div className="space-y-1 md:col-span-2">
                    <label className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Başvuru Merkezi</label>
                    <select 
                      name="basvuruMerkezi" 
                      value={formData.basvuruMerkezi || ''} 
                      onChange={handleChange}
                      disabled={!formData.ulke}
                      className={`w-full px-4 py-2.5 ${darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-white border border-slate-300'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all`}
                    >
                      <option value="">Seçiniz...</option>
                      {formData.ulke && (
                        <>
                          {VISA_CENTERS.find(vc => vc.ulkeler.includes(formData.ulke!))?.yetki_alanlari.map(area => {
                            const centerName = `${VISA_CENTERS.find(vc => vc.ulkeler.includes(formData.ulke!))?.kurum} - ${area.merkez}`;
                            return <option key={centerName} value={centerName}>{centerName}</option>;
                          })}
                          <option value="Merkez Belirlenemedi">Merkez Belirlenemedi</option>
                          <option value="Yetki Alanı Dışında">Yetki Alanı Dışında</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Adres */}
                  {(formData.merkezAdresi || formData.basvuruMerkezi === 'Merkez Belirlenemedi' || formData.basvuruMerkezi === 'Yetki Alanı Dışında') && (
                    <div className="space-y-1 md:col-span-2">
                      <label className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Adres</label>
                      {(formData.basvuruMerkezi === 'Merkez Belirlenemedi' || formData.basvuruMerkezi === 'Yetki Alanı Dışında') ? (
                        <input 
                          name="merkezAdresi"
                          value={formData.merkezAdresi || ''}
                          onChange={handleChange}
                          placeholder="Başvuru merkezi adresini buraya yazabilirsiniz..."
                          className={`w-full px-4 py-2.5 ${darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-white border border-slate-300'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none`}
                        />
                      ) : (
                        <div className={`w-full px-4 py-2.5 ${darkMode ? 'bg-slate-900/50 border border-slate-700 text-slate-300' : 'bg-slate-50 border border-slate-300 text-slate-600'} rounded-xl text-sm italic`}>
                          {formData.merkezAdresi || 'Adres bilgisi bulunamadı.'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>

              <section className={`p-6 ${darkMode ? 'bg-slate-900/20 border border-slate-700/50' : 'bg-slate-50/10 border border-slate-300'} rounded-2xl`}>
                <div className="flex items-center gap-2 mb-4 border-b pb-2 border-slate-100/50">
                  <FileSearch className="text-brand-600 w-4 h-4" />
                  <h4 className={`text-xs font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'} uppercase tracking-widest`}>3. Ücret & Finansal Detaylar</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Konsolosluk Ücreti */}
                  <div className="space-y-1">
                    <label className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Konsolosluk Ücreti</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        name="konsoloslukUcreti" 
                        value={formData.konsoloslukUcreti || 0} 
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setFormData(prev => {
                            const hizmet = prev.hizmetBedeli || 0;
                            const kdvOran = prev.kdvOrani || 20;
                            const calc = calculatePrice(val, hizmet, kdvOran);
                            return {
                              ...prev,
                              konsoloslukUcreti: calc.konsoloslukUcreti,
                              kdvTutarı: calc.kdv,
                              fiyat: calc.toplam
                            };
                          });
                        }}
                        className={`w-full px-4 py-2.5 ${darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-white border border-slate-300'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none`} 
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                        {getCurrencySymbolHelper(formData.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Hizmet Bedeli */}
                  <div className="space-y-1">
                    <label className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Hizmet Bedeli</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        name="hizmetBedeli" 
                        value={formData.hizmetBedeli || 0} 
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setFormData(prev => {
                            const konsolosluk = prev.konsoloslukUcreti || 0;
                            const kdvOran = prev.kdvOrani || 20;
                            const calc = calculatePrice(konsolosluk, val, kdvOran);
                            return {
                              ...prev,
                              hizmetBedeli: calc.hizmetBedeli,
                              kdvTutarı: calc.kdv,
                              fiyat: calc.toplam
                            };
                          });
                        }}
                        className={`w-full px-4 py-2.5 ${darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-white border border-slate-300'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none`} 
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                        {getCurrencySymbolHelper(formData.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Toplam Fiyat */}
                  <div className="space-y-1">
                    <label className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Toplam Fiyat ({getCurrencySymbolHelper(formData.currency)})</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        name="fiyat" 
                        value={formData.fiyat || 0} 
                        onChange={handleChange} 
                        className={`w-full px-4 py-2.5 ${darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-white border border-slate-300'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-bold text-brand-600`} 
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                        {getCurrencySymbolHelper(formData.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {formData.islemDurumu === 'Tamamlandı' && (
                <section className={`p-6 ${darkMode ? 'bg-brand-900/20 border-brand-900/30' : 'bg-brand-50 border-brand-100'} rounded-2xl border`}>
                  <h4 className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-4">3. Vize Sonuç Bilgisi</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Vize Sonucu</label>
                      <select name="vizeSonucu" value={formData.vizeSonucu} onChange={handleChange} className={`w-full px-4 py-2.5 ${darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-white border border-slate-300'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none`}>
                        <option value="">Seçiniz...</option>
                        {RESULT_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    {formData.vizeSonucu === 'Onaylandı' && (
                      <div className="space-y-1">
                        <label className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Vize Geçerlilik Tarihi</label>
                        <input type="date" name="vizeGecerlilikTarihi" value={formData.vizeGecerlilikTarihi} onChange={handleChange} className={`w-full px-4 py-2.5 ${darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-white border border-slate-300'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none`} />
                      </div>
                    )}
                  </div>
                </section>
              )}

              <div className="space-y-1">
                <label className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Notlar / Özel İstekler</label>
                <textarea name="notlar" value={formData.notlar} onChange={handleChange} rows={3} className={`w-full px-4 py-2.5 ${darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-white border border-slate-300'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none`} placeholder="Müşteri notlarını buraya ekleyin..." />
              </div>

              {formFields.length > 0 && (
                <section className="pt-6 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Ek Bilgiler (Özel Alanlar)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {formFields.map(field => {
                      // Standart alanları atla (zaten yukarıda var)
                      const standardFields = ['ad', 'soyad', 'email', 'pasaportNo', 'dogumTarihi', 'pasaportSkt'];
                      if (standardFields.includes(field.label.toLowerCase().replace(/ /g, ''))) return null;
                      if (['Ad Soyad / Firma Ünvanı', 'E-posta Adresi', 'Telefon Numarası'].includes(field.label)) return null;

                      return (
                        <div key={field.id} className="space-y-1">
                          <label className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            {field.label} {field.required && <span className="text-rose-500">*</span>}
                          </label>
                          <input 
                            type={field.type}
                            required={field.required}
                            value={formData.extra_fields?.[field.id] || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              extra_fields: {
                                ...formData.extra_fields,
                                [field.id]: e.target.value
                              }
                            })}
                            className={`w-full px-4 py-2.5 ${darkMode ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-white border border-slate-300'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none`} 
                          />
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </form>
          )}

          {activeTab === 'history' && (
            <div className="py-4 space-y-8">
              {/* Manual Entry Form */}
              <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-300'} space-y-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <PlusCircle size={18} className="text-brand-600" />
                  <h4 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-800 uppercase'}`}>Manuel Geçmiş Kaydı Ekle</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={`text-[10px] font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'} uppercase ml-1`}>İşlem Durumu</label>
                    <select 
                      value={manualTimeline.status}
                      onChange={(e) => setManualTimeline({ ...manualTimeline, status: e.target.value as any })}
                      className={`w-full px-4 py-2 text-sm rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'} focus:ring-2 focus:ring-brand-500 outline-none`}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={`text-[10px] font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'} uppercase ml-1`}>İşlem Tarihi</label>
                    <input 
                      type="date"
                      value={manualTimeline.date}
                      onChange={(e) => setManualTimeline({ ...manualTimeline, date: e.target.value })}
                      className={`w-full px-4 py-2 text-sm rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'} focus:ring-2 focus:ring-brand-500 outline-none`}
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className={`text-[10px] font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'} uppercase ml-1`}>İşlem Açıklaması</label>
                  <div className="flex gap-3">
                    <input 
                      type="text"
                      placeholder="Örn: Vize başvurusu yapıldı, Randevu tarihi alındı vb..."
                      value={manualTimeline.description}
                      onChange={(e) => setManualTimeline({ ...manualTimeline, description: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addManualTimeline())}
                      className={`flex-1 px-4 py-2 text-sm rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'} focus:ring-2 focus:ring-brand-500 outline-none`}
                    />
                    <button 
                      type="button"
                      onClick={addManualTimeline}
                      className="px-6 py-2 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all flex items-center gap-2 text-sm"
                    >
                      EKLE
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-medium italic">* Prim hesaplamalarının doğru çalışması için geçmişteki "Randevu Alındı" ve "Tamamlandı" durumlarını buradan ekleyebilirsiniz.</p>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <Timeline events={formData.timeline || []} darkMode={darkMode} />
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className={`p-8 border-2 border-dashed ${darkMode ? 'border-slate-700 bg-slate-900/30' : 'border-slate-200 bg-slate-50'} rounded-3xl text-center`}>
                <input 
                  type="file" 
                  id="file-upload" 
                  multiple 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
                <label 
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <div className="p-4 bg-brand-600 text-white rounded-2xl shadow-lg shadow-brand-200">
                    <Upload size={32} />
                  </div>
                  <div>
                    <p className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Dosya Yükle</p>
                    <p className="text-sm text-slate-500">Sürükle bırak veya tıklayarak seç</p>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(formData.documents || []).map(doc => (
                  <div key={doc.id} className={`p-4 ${darkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-white border-slate-100'} border rounded-2xl flex items-center gap-4 group transition-all hover:shadow-md`}>
                    <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
                      <FileSearch size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-800'} truncate`}>{doc.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">{doc.size} • {(() => {
                        const d = new Date(doc.uploadDate);
                        const day = String(d.getDate()).padStart(2, '0');
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        const year = d.getFullYear();
                        return `${day}-${month}-${year}`;
                      })()}</p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={doc.url} target="_blank" rel="noreferrer" className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg">
                        <FileSearch size={18} />
                      </a>
                      <button onClick={() => removeDocument(doc.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg">
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {(formData.documents || []).length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <FileText size={48} className="mx-auto mb-3 opacity-20" />
                  <p>Henüz belge yüklenmemiş.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={`p-6 border-t ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-slate-50'} flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            {applicant && onDelete && user?.role === 'admin' && (
              <button 
                type="button"
                onClick={() => onDelete(applicant.takipKodu)}
                className="flex items-center gap-2 px-6 py-2.5 text-rose-600 font-bold hover:bg-rose-50 rounded-xl transition-all"
              >
                <Trash2 size={20} />
                KAYDI SİL
              </button>
            )}
            {applicant && onOpenAccounting && user?.role === 'admin' && (
              <button 
                type="button"
                onClick={() => onOpenAccounting(applicant)}
                className="flex items-center gap-2 px-6 py-2.5 text-emerald-600 font-bold hover:bg-emerald-50 rounded-xl transition-all"
              >
                <FileText size={20} />
                MUHASEBE
              </button>
            )}
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <button onClick={onClose} className={`px-6 py-2.5 ${darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-200'} font-bold rounded-xl transition-all`}>İPTAL</button>
            <button onClick={handleSubmit} className="flex items-center gap-2 px-8 py-2.5 bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all">
              <Save size={20} />
              {applicant ? 'GÜNCELLE' : 'KAYDET'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
