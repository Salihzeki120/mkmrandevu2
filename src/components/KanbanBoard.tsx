import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  FileText, 
  Activity, 
  Calendar, 
  Building2, 
  Compass, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit3, 
  Wallet, 
  FileSpreadsheet, 
  Trash2, 
  Copy, 
  Check, 
  ArrowRight, 
  MoreVertical, 
  Sparkles, 
  User as UserIcon, 
  RefreshCw,
  X,
  MapPin,
  Tag,
  Kanban as KanbanIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Applicant, ApplicationStatus, Country, CountryPrice, AccountingRecord, User } from '../types';
import { STATUS_OPTIONS, getCurrencySymbol } from '../constants';

interface KanbanColumnDef {
  id: ApplicationStatus;
  title: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  darkBgColor: string;
  darkBorderColor: string;
  accentColor: string;
  description: string;
}

const KANBAN_COLUMNS: KanbanColumnDef[] = [
  {
    id: 'Talep Bekliyor',
    title: 'Talep Bekliyor',
    icon: Clock,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-200 dark:border-amber-900/50',
    darkBgColor: 'dark:bg-amber-950/20',
    darkBorderColor: 'dark:border-amber-800/40',
    accentColor: 'bg-amber-500',
    description: 'Yeni gelen ve değerlendirme bekleyen başvurular'
  },
  {
    id: 'Dosya Hazırlanıyor',
    title: 'Dosya Hazırlanıyor',
    icon: FileText,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-200 dark:border-blue-900/50',
    darkBgColor: 'dark:bg-blue-950/20',
    darkBorderColor: 'dark:border-blue-800/40',
    accentColor: 'bg-blue-500',
    description: 'Evrak ve form hazırlık aşamasında'
  },
  {
    id: 'İşlemde',
    title: 'İşlemde',
    icon: Activity,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-200 dark:border-indigo-900/50',
    darkBgColor: 'dark:bg-indigo-950/20',
    darkBorderColor: 'dark:border-indigo-800/40',
    accentColor: 'bg-indigo-500',
    description: 'Süreç aktif olarak yürütülüyor'
  },
  {
    id: 'Randevu Alındı',
    title: 'Randevu Alındı',
    icon: Calendar,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-200 dark:border-orange-900/50',
    darkBgColor: 'dark:bg-orange-950/20',
    darkBorderColor: 'dark:border-orange-800/40',
    accentColor: 'bg-orange-500',
    description: 'Randevu tarihi ve saati belirlendi'
  },
  {
    id: 'Konsoloslukta',
    title: 'Konsoloslukta / VFS',
    icon: Building2,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-200 dark:border-purple-900/50',
    darkBgColor: 'dark:bg-purple-950/20',
    darkBorderColor: 'dark:border-purple-800/40',
    accentColor: 'bg-purple-500',
    description: 'Konsolosluk veya merkez incelemesinde'
  },
  {
    id: 'Pasaport Bekleniyor',
    title: 'Pasaport Bekleniyor',
    icon: Compass,
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-200 dark:border-cyan-900/50',
    darkBgColor: 'dark:bg-cyan-950/20',
    darkBorderColor: 'dark:border-cyan-800/40',
    accentColor: 'bg-cyan-500',
    description: 'Pasaport teslimi veya kargosu bekleniyor'
  },
  {
    id: 'Tamamlandı',
    title: 'Tamamlandı',
    icon: CheckCircle2,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-200 dark:border-emerald-900/50',
    darkBgColor: 'dark:bg-emerald-950/20',
    darkBorderColor: 'dark:border-emerald-800/40',
    accentColor: 'bg-emerald-500',
    description: 'Vize sonuçlandı ve işlem tamamlandı'
  },
  {
    id: 'İptal Edildi',
    title: 'İptal Edildi',
    icon: AlertCircle,
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-200 dark:border-rose-900/50',
    darkBgColor: 'dark:bg-rose-950/20',
    darkBorderColor: 'dark:border-rose-800/40',
    accentColor: 'bg-rose-500',
    description: 'İptal edilen veya durdurulan dosyalar'
  }
];

interface Props {
  applicants: Applicant[];
  countries: Country[];
  prices?: CountryPrice[];
  accounting?: AccountingRecord[];
  user?: User | null;
  darkMode?: boolean;
  onUpdateStatus: (applicant: Applicant, newStatus: ApplicationStatus, appointmentDetails?: { date?: string; time?: string; visaResult?: '' | 'Onaylandı' | 'Red' }) => Promise<void>;
  onSelectApplicant: (applicant: Applicant) => void;
  onEditApplicant: (applicant: Applicant) => void;
  onDeleteApplicant: (kod: string) => void;
  onOpenAccounting?: (applicant: Applicant) => void;
  onOpenProforma?: (applicant: Applicant) => void;
  onAddNew?: () => void;
  onRefresh?: () => void;
}

export default function KanbanBoard({
  applicants,
  countries,
  prices = [],
  accounting = [],
  user,
  darkMode = false,
  onUpdateStatus,
  onSelectApplicant,
  onEditApplicant,
  onDeleteApplicant,
  onOpenAccounting,
  onOpenProforma,
  onAddNew,
  onRefresh
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('Tümü');
  const [selectedPayment, setSelectedPayment] = useState('Tümü');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [viewScope, setViewScope] = useState<'all' | 'active'>('active'); // 'active' hides Tamamlandı/İptal by default or filters
  const [draggedApplicant, setDraggedApplicant] = useState<Applicant | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ApplicationStatus | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeMenuApplicantId, setActiveMenuApplicantId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Quick appointment modal state when dropped into "Randevu Alındı"
  const [appointmentModalData, setAppointmentModalData] = useState<{
    applicant: Applicant;
    newStatus: ApplicationStatus;
    date: string;
    time: string;
  } | null>(null);

  // Quick completion modal state when dropped into "Tamamlandı"
  const [completionModalData, setCompletionModalData] = useState<{
    applicant: Applicant;
    newStatus: ApplicationStatus;
    visaResult: '' | 'Onaylandı' | 'Red';
  } | null>(null);

  // Copy tracking code helper
  const handleCopyCode = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  // Filtered applicants
  const filteredApplicants = useMemo(() => {
    return applicants.filter(a => {
      const name = `${a.ad || ''} ${a.soyad || ''}`.toLowerCase();
      const code = (a.takipKodu || '').toUpperCase();
      const pass = (a.pasaportNo || '').toLowerCase();
      const query = searchQuery.trim().toLowerCase();

      const matchesSearch = !query || name.includes(query) || code.includes(query.toUpperCase()) || pass.includes(query);
      const matchesCountry = selectedCountry === 'Tümü' || a.ulke === selectedCountry;
      const matchesPayment = selectedPayment === 'Tümü' || (a.odemeDurumu || 'Ödenmedi') === selectedPayment;
      const matchesCategory = selectedCategory === 'Tümü' || (a.vizeKategorisi || 'Turistik') === selectedCategory;

      return matchesSearch && matchesCountry && matchesPayment && matchesCategory;
    });
  }, [applicants, searchQuery, selectedCountry, selectedPayment, selectedCategory]);

  // Group applicants by status
  const groupedApplicants = useMemo(() => {
    const map = new Map<ApplicationStatus, Applicant[]>();
    KANBAN_COLUMNS.forEach(col => {
      map.set(col.id, []);
    });

    filteredApplicants.forEach(app => {
      const status = app.islemDurumu || 'Talep Bekliyor';
      if (map.has(status)) {
        map.get(status)!.push(app);
      } else {
        // Fallback to Talep Bekliyor if unexpected status
        const defaultCol = map.get('Talep Bekliyor');
        if (defaultCol) defaultCol.push(app);
      }
    });

    return map;
  }, [filteredApplicants]);

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, applicant: Applicant) => {
    setDraggedApplicant(applicant);
    e.dataTransfer.setData('text/plain', applicant.takipKodu);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: ApplicationStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, columnId: ApplicationStatus) => {
    // Only clear if leaving the main container
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverColumn === columnId) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: ApplicationStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const applicant = draggedApplicant;
    setDraggedApplicant(null);

    if (!applicant || applicant.islemDurumu === targetStatus) return;

    // Special case 1: Drop into Randevu Alındı -> prompt for appointment date & time if missing or desired
    if (targetStatus === 'Randevu Alındı') {
      setAppointmentModalData({
        applicant,
        newStatus: targetStatus,
        date: applicant.randevuTarihi || new Date().toISOString().split('T')[0],
        time: applicant.saat || '09:00'
      });
      return;
    }

    // Special case 2: Drop into Tamamlandı -> prompt for visa result
    if (targetStatus === 'Tamamlandı' && !applicant.vizeSonucu) {
      setCompletionModalData({
        applicant,
        newStatus: targetStatus,
        visaResult: 'Onaylandı'
      });
      return;
    }

    // Normal direct status transition
    try {
      setIsUpdating(true);
      await onUpdateStatus(applicant, targetStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmAppointmentDrop = async () => {
    if (!appointmentModalData) return;
    const { applicant, newStatus, date, time } = appointmentModalData;
    setAppointmentModalData(null);
    try {
      setIsUpdating(true);
      await onUpdateStatus(applicant, newStatus, { date, time });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmCompletionDrop = async () => {
    if (!completionModalData) return;
    const { applicant, newStatus, visaResult } = completionModalData;
    setCompletionModalData(null);
    try {
      setIsUpdating(true);
      await onUpdateStatus(applicant, newStatus, { visaResult });
    } finally {
      setIsUpdating(false);
    }
  };

  // Visible columns based on viewScope
  const visibleColumns = useMemo(() => {
    if (viewScope === 'active') {
      // Show all active pipeline stages, keep Tamamlandı & İptal accessible via toggle
      return KANBAN_COLUMNS;
    }
    return KANBAN_COLUMNS;
  }, [viewScope]);

  // Overall counts
  const totalCount = applicants.length;
  const inProgressCount = applicants.filter(a => ['Talep Bekliyor', 'Dosya Hazırlanıyor', 'İşlemde', 'Randevu Alındı', 'Konsoloslukta', 'Pasaport Bekleniyor'].includes(a.islemDurumu)).length;
  const completedCount = applicants.filter(a => a.islemDurumu === 'Tamamlandı').length;
  const appointmentCount = applicants.filter(a => a.islemDurumu === 'Randevu Alındı').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Center */}
      <div className={`p-6 rounded-3xl border shadow-sm transition-all ${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                <KanbanIcon size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-slate-800'} tracking-tight`}>
                    Vize Başvuruları Kanban Panosu
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-50 text-brand-600 border border-brand-200">
                    Sürükle & Bırak
                  </span>
                </div>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} font-medium mt-0.5`}>
                  Başvuru kartlarını fareyle ilgili aşama sütununa taşıyarak durumlarını anında güncelleyin.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 ${
              darkMode ? 'bg-slate-900/60 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <span className="text-xs font-bold text-slate-400">Toplam:</span>
              <span className="text-sm font-black text-brand-600">{totalCount}</span>
            </div>

            <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 ${
              darkMode ? 'bg-indigo-950/30 border-indigo-900/50 text-indigo-300' : 'bg-indigo-50/80 border-indigo-100 text-indigo-700'
            }`}>
              <Activity size={14} className="text-indigo-500 animate-pulse" />
              <span className="text-xs font-bold">İşlemde:</span>
              <span className="text-sm font-black">{inProgressCount}</span>
            </div>

            <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 ${
              darkMode ? 'bg-orange-950/30 border-orange-900/50 text-orange-300' : 'bg-orange-50/80 border-orange-100 text-orange-700'
            }`}>
              <Calendar size={14} className="text-orange-500" />
              <span className="text-xs font-bold">Randevu:</span>
              <span className="text-sm font-black">{appointmentCount}</span>
            </div>

            <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 ${
              darkMode ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-300' : 'bg-emerald-50/80 border-emerald-100 text-emerald-700'
            }`}>
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span className="text-xs font-bold">Tamamlandı:</span>
              <span className="text-sm font-black">{completedCount}</span>
            </div>

            {onAddNew && (
              <button
                onClick={onAddNew}
                className="ml-auto lg:ml-2 px-5 py-2.5 bg-brand-600 text-white text-xs font-black rounded-xl hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all flex items-center gap-2 active:scale-95"
              >
                <Plus size={16} />
                YENİ BAŞVURU
              </button>
            )}

            {onRefresh && (
              <button
                onClick={onRefresh}
                className={`p-2.5 rounded-xl border transition-all ${
                  darkMode ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                title="Yenile"
              >
                <RefreshCw size={16} className={isUpdating ? 'animate-spin' : ''} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="İsim, Soyisim, Takip Kodu veya Pasaport No ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-bold outline-none border transition-all ${
                darkMode 
                  ? 'bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-brand-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Country Selector */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
            darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}>
            <Filter size={14} className="text-slate-400" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className={`bg-transparent text-xs font-bold outline-none cursor-pointer ${
                darkMode ? 'text-slate-200' : 'text-slate-700'
              }`}
            >
              <option value="Tümü" className={darkMode ? 'bg-slate-800 text-white' : ''}>Tüm Ülkeler</option>
              {countries.map(c => (
                <option key={c.id} value={c.name} className={darkMode ? 'bg-slate-800 text-white' : ''}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status Selector */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
            darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}>
            <Wallet size={14} className="text-slate-400" />
            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              className={`bg-transparent text-xs font-bold outline-none cursor-pointer ${
                darkMode ? 'text-slate-200' : 'text-slate-700'
              }`}
            >
              <option value="Tümü" className={darkMode ? 'bg-slate-800 text-white' : ''}>Ödeme (Tümü)</option>
              <option value="Ödendi" className={darkMode ? 'bg-slate-800 text-white' : ''}>Ödendi</option>
              <option value="Ödenmedi" className={darkMode ? 'bg-slate-800 text-white' : ''}>Ödenmedi</option>
            </select>
          </div>

          {/* Visa Category Selector */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
            darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}>
            <Tag size={14} className="text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`bg-transparent text-xs font-bold outline-none cursor-pointer ${
                darkMode ? 'text-slate-200' : 'text-slate-700'
              }`}
            >
              <option value="Tümü" className={darkMode ? 'bg-slate-800 text-white' : ''}>Kategori (Tümü)</option>
              <option value="Turistik" className={darkMode ? 'bg-slate-800 text-white' : ''}>Turistik</option>
              <option value="Ticari" className={darkMode ? 'bg-slate-800 text-white' : ''}>Ticari</option>
              <option value="Aile Ziyareti" className={darkMode ? 'bg-slate-800 text-white' : ''}>Aile Ziyareti</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board Columns Container */}
      <div className="overflow-x-auto pb-6 custom-scrollbar">
        <div className="flex gap-4 min-w-[1700px] items-start">
          {visibleColumns.map((col) => {
            const Icon = col.icon;
            const items = groupedApplicants.get(col.id) || [];
            const isDragOver = dragOverColumn === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={(e) => handleDragLeave(e, col.id)}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`flex-1 min-w-[280px] max-w-[340px] rounded-3xl border transition-all duration-200 flex flex-col ${
                  darkMode ? 'bg-slate-900/60' : 'bg-slate-50/70'
                } ${
                  isDragOver 
                    ? `ring-2 ring-brand-500 scale-[1.01] shadow-xl ${darkMode ? 'bg-brand-950/30' : 'bg-brand-50/40'} ${col.borderColor}`
                    : darkMode ? 'border-slate-800' : 'border-slate-200/80'
                }`}
              >
                {/* Column Header */}
                <div className={`p-4 border-b rounded-t-3xl flex items-center justify-between transition-colors ${
                  darkMode ? 'border-slate-800 bg-slate-800/40' : 'border-slate-200/60 bg-white/70'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl ${col.bgColor} ${col.darkBgColor} flex items-center justify-center border ${col.borderColor}`}>
                      <Icon size={16} className={col.color} />
                    </div>
                    <div>
                      <h4 className={`text-xs font-black uppercase tracking-wider ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        {col.title}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                        {items.length} Kayıt
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                    items.length > 0 
                      ? `${col.bgColor} ${col.color} border ${col.borderColor}`
                      : darkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {items.length}
                  </span>
                </div>

                {/* Column Body / Cards List */}
                <div className="p-3 space-y-3 min-h-[500px] max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar flex-1">
                  {isDragOver && (
                    <div className={`p-4 rounded-2xl border-2 border-dashed ${col.borderColor} ${col.bgColor} flex items-center justify-center text-xs font-black ${col.color} animate-pulse`}>
                      Buraya Bırakın
                    </div>
                  )}

                  {items.length > 0 ? (
                    items.map((app) => {
                      const isBeingDragged = draggedApplicant?.takipKodu === app.takipKodu;
                      const hasAppointment = !!app.randevuTarihi;
                      const isPaid = app.odemeDurumu === 'Ödendi';

                      return (
                        <div
                          key={app.takipKodu || app.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, app)}
                          onClick={() => onSelectApplicant(app)}
                          onDoubleClick={(e) => {
                            const target = e.target as HTMLElement;
                            if (target.closest('button') || target.closest('input') || target.closest('a')) return;
                            e.stopPropagation();
                            onEditApplicant(app);
                          }}
                          className={`p-4 rounded-2xl border shadow-sm transition-all duration-200 cursor-grab active:cursor-grabbing group relative ${
                            darkMode 
                              ? 'bg-slate-800/90 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800' 
                              : 'bg-white border-slate-200/80 hover:border-brand-300 hover:shadow-md'
                          } ${
                            isBeingDragged ? 'opacity-40 scale-95' : 'opacity-100'
                          }`}
                          title="Detay için tıklayın, düzenlemek için çift tıklayın"
                        >
                          {/* Card Top: Tracking Code & Status Badge */}
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <button
                              onClick={(e) => handleCopyCode(e, app.takipKodu)}
                              className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-lg border flex items-center gap-1 transition-all ${
                                copiedCode === app.takipKodu
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                  : darkMode 
                                    ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white' 
                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                              title="Takip kodunu kopyala"
                            >
                              {copiedCode === app.takipKodu ? <Check size={10} /> : <Copy size={10} />}
                              {app.takipKodu}
                            </button>

                            {/* Country Badge */}
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-tight ${
                              darkMode ? 'bg-slate-900 border-slate-700 text-brand-400' : 'bg-brand-50 border-brand-100 text-brand-700'
                            }`}>
                              {app.ulke || 'Belirtilmedi'}
                            </span>
                          </div>

                          {/* Card Main: Full Name */}
                          <div className="mb-2">
                            <h5 className={`text-sm font-black uppercase tracking-tight line-clamp-1 ${
                              darkMode ? 'text-white' : 'text-slate-900'
                            }`}>
                              {app.ad} {app.soyad}
                            </h5>
                            {app.firmaAdi && (
                              <p className="text-[10px] font-semibold text-slate-400 truncate mt-0.5">
                                {app.firmaAdi}
                              </p>
                            )}
                          </div>

                          {/* Details Badges */}
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {/* Passport */}
                            {app.pasaportNo && (
                              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                darkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-600'
                              }`}>
                                🛂 {app.pasaportNo}
                              </span>
                            )}

                            {/* Category */}
                            {app.vizeKategorisi && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                darkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {app.vizeKategorisi}
                              </span>
                            )}

                            {/* Payment status badge */}
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                              isPaid 
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}>
                              {isPaid ? '● Ödendi' : '○ Ödenmedi'}
                            </span>

                            {/* Visa Result if set */}
                            {app.vizeSonucu && (
                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                                app.vizeSonucu === 'Onaylandı' 
                                  ? 'bg-emerald-500 text-white' 
                                  : 'bg-rose-500 text-white'
                              }`}>
                                {app.vizeSonucu}
                              </span>
                            )}
                          </div>

                          {/* Appointment Date pill if set */}
                          {hasAppointment && (
                            <div className={`mb-3 px-2.5 py-1.5 rounded-xl border flex items-center justify-between text-[10px] font-bold ${
                              darkMode ? 'bg-orange-950/20 border-orange-900/40 text-orange-300' : 'bg-orange-50/80 border-orange-100 text-orange-700'
                            }`}>
                              <span className="flex items-center gap-1.5">
                                <Calendar size={12} className="text-orange-500" />
                                {app.randevuTarihi}
                              </span>
                              {app.saat && (
                                <span className="font-mono bg-white/60 dark:bg-black/20 px-1.5 py-0.5 rounded text-[9px]">
                                  {app.saat}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Quick Action Footer on Card */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectApplicant(app);
                                }}
                                className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-slate-700 rounded-lg transition-all"
                                title="Detay Kartı"
                              >
                                <Eye size={13} />
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditApplicant(app);
                                }}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg transition-all"
                                title="Düzenle"
                              >
                                <Edit3 size={13} />
                              </button>

                              {onOpenAccounting && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenAccounting(app);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-lg transition-all"
                                  title="Muhasebe / Tahsilat"
                                >
                                  <Wallet size={13} />
                                </button>
                              )}

                              {onOpenProforma && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenProforma(app);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-lg transition-all"
                                  title="Proforma Fatura"
                                >
                                  <FileSpreadsheet size={13} />
                                </button>
                              )}
                            </div>

                            {/* Move to status select dropdown (Alternative to drag & drop for mobile / touch) */}
                            <div className="relative">
                              <select
                                value={app.islemDurumu}
                                onClick={(e) => e.stopPropagation()}
                                onChange={async (e) => {
                                  e.stopPropagation();
                                  const target = e.target.value as ApplicationStatus;
                                  if (target !== app.islemDurumu) {
                                    if (target === 'Randevu Alındı') {
                                      setAppointmentModalData({
                                        applicant: app,
                                        newStatus: target,
                                        date: app.randevuTarihi || new Date().toISOString().split('T')[0],
                                        time: app.saat || '09:00'
                                      });
                                    } else if (target === 'Tamamlandı' && !app.vizeSonucu) {
                                      setCompletionModalData({
                                        applicant: app,
                                        newStatus: target,
                                        visaResult: 'Onaylandı'
                                      });
                                    } else {
                                      setIsUpdating(true);
                                      await onUpdateStatus(app, target);
                                      setIsUpdating(false);
                                    }
                                  }
                                }}
                                className={`text-[9px] font-extrabold px-1.5 py-1 rounded-lg border outline-none cursor-pointer ${
                                  darkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                                title="Aşama Değiştir"
                              >
                                {STATUS_OPTIONS.map((st) => (
                                  <option key={st} value={st}>
                                    ➔ {st}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-16 text-center">
                      <div className={`w-10 h-10 rounded-full ${col.bgColor} ${col.darkBgColor} flex items-center justify-center mx-auto mb-2 border ${col.borderColor}`}>
                        <Icon size={16} className={`opacity-40 ${col.color}`} />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Dosya Yok
                      </p>
                      <p className="text-[9px] text-slate-400 mt-0.5">
                        Kartı buraya sürükleyin
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Quick Appointment Setter when dropped into Randevu Alındı */}
      <AnimatePresence>
        {appointmentModalData && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`w-full max-w-md rounded-3xl shadow-2xl border overflow-hidden ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-900'
              }`}
            >
              <div className="p-6 bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/20 rounded-xl">
                    <Calendar size={22} />
                  </div>
                  <div>
                    <h3 className="font-black text-base">Randevu Bilgisi Belirleyin</h3>
                    <p className="text-xs text-orange-100 font-medium">
                      {appointmentModalData.applicant.ad} {appointmentModalData.applicant.soyad}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAppointmentModalData(null)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Başvuru durumu <strong>"Randevu Alındı"</strong> olarak güncelleniyor. Randevu tarih ve saatini şimdi tanımlayabilir veya daha sonra güncelleyebilirsiniz.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Randevu Tarihi</label>
                    <input
                      type="date"
                      value={appointmentModalData.date}
                      onChange={(e) => setAppointmentModalData({ ...appointmentModalData, date: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border outline-none ${
                        darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Randevu Saati</label>
                    <input
                      type="time"
                      value={appointmentModalData.time}
                      onChange={(e) => setAppointmentModalData({ ...appointmentModalData, time: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border outline-none ${
                        darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    onClick={() => {
                      // Save without appointment date/time override
                      const app = appointmentModalData.applicant;
                      const st = appointmentModalData.newStatus;
                      setAppointmentModalData(null);
                      onUpdateStatus(app, st);
                    }}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${
                      darkMode ? 'border-slate-700 text-slate-400 hover:bg-slate-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Şimdilik Tarihsiz Kaydet
                  </button>

                  <button
                    onClick={handleConfirmAppointmentDrop}
                    className="flex-1 py-3 bg-orange-600 text-white text-xs font-black rounded-xl hover:bg-orange-700 shadow-lg shadow-orange-500/20 transition-all"
                  >
                    Randevuyu Onayla & Kaydet
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Quick Completion Setter when dropped into Tamamlandı */}
      <AnimatePresence>
        {completionModalData && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`w-full max-w-md rounded-3xl shadow-2xl border overflow-hidden ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-900'
              }`}
            >
              <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/20 rounded-xl">
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <h3 className="font-black text-base">Vize Sonucu Belirleyin</h3>
                    <p className="text-xs text-emerald-100 font-medium">
                      {completionModalData.applicant.ad} {completionModalData.applicant.soyad}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCompletionModalData(null)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Başvuru <strong>"Tamamlandı"</strong> durumuna alınıyor. Vize sonucunu belirleyin:
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCompletionModalData({ ...completionModalData, visaResult: 'Onaylandı' })}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                      completionModalData.visaResult === 'Onaylandı'
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    <CheckCircle2 size={24} className="text-emerald-500" />
                    <span className="text-xs font-black uppercase">VİZE ONAYLANDI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCompletionModalData({ ...completionModalData, visaResult: 'Red' })}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                      completionModalData.visaResult === 'Red'
                        ? 'border-rose-500 bg-rose-50/50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 ring-2 ring-rose-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    <AlertCircle size={24} className="text-rose-500" />
                    <span className="text-xs font-black uppercase">VİZE REDDİ</span>
                  </button>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    onClick={() => {
                      const app = completionModalData.applicant;
                      const st = completionModalData.newStatus;
                      setCompletionModalData(null);
                      onUpdateStatus(app, st);
                    }}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${
                      darkMode ? 'border-slate-700 text-slate-400 hover:bg-slate-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Sonuçsuz Tamamla
                  </button>

                  <button
                    onClick={handleConfirmCompletionDrop}
                    className="flex-1 py-3 bg-emerald-600 text-white text-xs font-black rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
