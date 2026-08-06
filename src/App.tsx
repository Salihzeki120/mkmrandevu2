import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { BRAND_CONFIG } from './brandConfig';
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart as ReLineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Wallet, 
  PieChart, 
  BarChart, 
  Settings, 
  Search, 
  PlusCircle,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowUpDown,
  LogOut,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  Filter,
  Bell,
  Trash2,
  RefreshCw,
  Edit,
  Calendar,
  Download,
  Mail,
  ShieldCheck,
  TrendingUp,
  Activity,
  Menu,
  X,
  Plus,
  FileDown,
  FileWarning,
  Moon,
  Sun,
  History,
  FileSearch,
  Upload,
  Building2,
  Lock,
  LifeBuoy,
  Phone,
  User as UserIcon,
  Bot,
  Globe,
  Headphones,
  Key,
  Calculator,
  FileJson,
  ClipboardList,
  ExternalLink,
  Tag,
  Volume2,
  VolumeX,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Applicant, AccountingRecord, CountryPrice, Country, Log, TimelineEvent, Document, ApplicationStatus, User } from './types';
import { COUNTRIES, STATUS_OPTIONS, PAYMENT_OPTIONS, getCurrencyForCountry, getCurrencySymbol as getCurrencySymbolConst } from './constants';
import ApplicantForm from './components/ApplicantForm';
import AccountingForm from './components/AccountingForm';
import ProformaInvoiceModal from './components/ProformaInvoiceModal';
import PriceForm from './components/PriceForm';
import Auth from './components/Auth';
import FinancialSummaryModal from './components/FinancialSummaryModal';
import CalendarView from './components/CalendarView';
import NotificationSettings from './components/NotificationSettings';
import EmailHosting from './components/EmailHosting';
import FormManagement from './components/FormManagement';
import PasswordManagement from './components/PasswordManagement';
import SupportCenter from './components/SupportCenter';
import UserProfile from './components/UserProfile';
import CompanyForm from './components/CompanyForm';
import ApplicantCard from './components/ApplicantCard';
import WeeklyAppointmentsModal from './components/WeeklyAppointmentsModal';

// --- Components ---

const ReportListView = ({ title, data, icon: Icon, color, bg, border, setSelectedApplicant, setShowApplicantCard }: { title: string, data: Applicant[], icon: any, color: string, bg: string, border: string, setSelectedApplicant: (a: Applicant) => void, setShowApplicantCard: (b: boolean) => void }) => (
  <div className={`bg-white rounded-3xl border ${border} shadow-xl overflow-hidden`}>
    <div className={`px-8 py-6 ${bg} border-b ${border} flex items-center justify-between`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center border ${border} shadow-sm`}>
          <Icon size={24} className={color} />
        </div>
        <div>
          <h3 className={`font-black uppercase text-lg tracking-tight ${color}`}>{title}</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sistemdeki Tüm Kayıtlar</p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className={`text-4xl font-black ${color} leading-none`}>{data.length}</span>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">TOPLAM KAYIT</span>
      </div>
    </div>
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.length > 0 ? (
          data.map((a, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-lg hover:shadow-slate-100 transition-all group">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-black text-slate-800 uppercase truncate">{a.ad} {a.soyad}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[9px] font-black bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">{a.ulke}</span>
                  <span className="text-[9px] font-black bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">{a.takipKodu}</span>
                  {a.randevuTarihi && <span className="text-[9px] font-black bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">{a.randevuTarihi}</span>}
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedApplicant(a);
                  setShowApplicantCard(true);
                }}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-brand-600 rounded-xl transition-all shadow-sm bg-white border border-slate-100"
              >
                <Search size={18} />
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center">
            <div className={`w-16 h-16 rounded-full ${bg} flex items-center justify-center mx-auto mb-4 border ${border}`}>
              <Icon size={32} className={`opacity-20 ${color}`} />
            </div>
            <p className="text-sm font-black text-slate-300 uppercase tracking-widest">HİÇ KAYIT BULUNAMADI</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick, darkMode, count, hasSubmenu, isSubmenuOpen, isCollapsed }: { icon: any, label: string, active: boolean, onClick: () => void, darkMode?: boolean, count?: number, hasSubmenu?: boolean, isSubmenuOpen?: boolean, isCollapsed?: boolean }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'} rounded-xl transition-all duration-200 ${
      active && !hasSubmenu
        ? 'bg-brand-600 text-white shadow-lg shadow-brand-200' 
        : darkMode 
          ? 'text-slate-400 hover:bg-slate-800 hover:text-brand-400'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`}
    title={isCollapsed ? label : undefined}
  >
    <Icon size={20} className={active && !hasSubmenu ? 'text-white' : 'text-slate-400'} />
    {!isCollapsed && (
      <>
        <span className={`font-bold flex-1 text-left text-xs uppercase tracking-wider ${active ? (darkMode ? 'text-white' : 'text-slate-900') : (darkMode ? 'text-slate-400' : 'text-slate-500')}`}>
          {label}
          {count !== undefined && count > 0 && (
            <span className={`ml-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full ${active ? 'bg-white text-brand-600' : 'bg-brand-100 text-brand-600'}`}>
              {count}
            </span>
          )}
        </span>
        {hasSubmenu && (
          <ChevronDown 
            size={14} 
            className={`transition-transform duration-200 ${isSubmenuOpen ? 'rotate-180' : ''} ${active ? 'text-slate-900' : 'text-slate-400'}`} 
          />
        )}
        {active && !hasSubmenu && <motion.div layoutId="active-pill" className="ml-auto"><div className="w-1.5 h-1.5 rounded-full bg-white" /></motion.div>}
      </>
    )}
  </button>
);

const StatCard = ({ label, value, subValue, icon: Icon, color, onClick, darkMode }: { label: string, value: string | number | React.ReactNode, subValue?: string, icon: any, color: string, onClick?: () => void, darkMode?: boolean }) => (
  <div 
    onClick={onClick}
    className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-4 md:p-6 rounded-2xl border shadow-sm flex items-center gap-3 md:gap-4 transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md hover:border-brand-100 active:scale-95' : ''}`}
  >
    <div className={`p-2.5 md:p-3 rounded-xl ${color} shrink-0`}>
      <Icon size={20} className="text-white md:hidden" />
      <Icon size={24} className="text-white hidden md:block" />
    </div>
    <div className="min-w-0">
      <p className={`text-[10px] md:text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} font-bold uppercase tracking-tight truncate`} title={label}>{label}</p>
      <h3 className={`text-lg md:text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-800'} leading-tight whitespace-pre-line`}>{value}</h3>
      {subValue && <p className="text-[10px] md:text-[11px] font-bold text-brand-600 mt-0.5 whitespace-pre-line">{subValue}</p>}
    </div>
  </div>
);

// --- Main App ---

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-rose-100">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Bir Hata Oluştu</h2>
            <p className="text-slate-500 text-sm mb-6">
              Uygulama yüklenirken bir sorunla karşılaşıldı. Lütfen sayfayı yenileyin veya yöneticiye başvurun.
            </p>
            <div className="bg-slate-50 p-3 rounded-lg text-left mb-6 overflow-auto max-h-32">
              <code className="text-[10px] text-rose-600 font-mono">
                {this.state.error?.toString()}
              </code>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-brand-600 text-white py-2.5 rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
            >
              Yeniden Yükle
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function MainApp() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const [user, setUser] = useState<User | null>(null);
  const isAdmin = user?.role === 'admin';
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('calendar');
  const [applicantInitialData, setApplicantInitialData] = useState<Partial<Applicant> | null>(null);
  const [showWeeklyAppointments, setShowWeeklyAppointments] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  const toggleSubmenu = (menu: string) => {
    setOpenSubmenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [accounting, setAccounting] = useState<AccountingRecord[]>([]);
  const [prices, setPrices] = useState<CountryPrice[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('Tümü');
  const [selectedStatus, setSelectedStatus] = useState('Tümü');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('Tümü');
  const [selectedVisaCategory, setSelectedVisaCategory] = useState('Tümü');
  
  // Modals
  const [showApplicantForm, setShowApplicantForm] = useState(false);
  const [showAccountingForm, setShowAccountingForm] = useState(false);
  const [showProformaModal, setShowProformaModal] = useState(false);
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [showApplicantCard, setShowApplicantCard] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<CountryPrice | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [notifications, setNotifications] = useState<{ 
    appointments: Applicant[], 
    payments: Applicant[], 
    missingDocs: Applicant[],
    statusUpdates?: any[],
    total: number 
  }>({ appointments: [], payments: [], missingDocs: [], statusUpdates: [], total: 0 });
  const [settings, setSettings] = useState<any>(null);
  const [reportDetailModal, setReportDetailModal] = useState<{
    title: string;
    status: string;
    applicants: Applicant[];
  } | null>(null);

  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('notificationSoundEnabled');
    return saved !== 'false';
  });

  const prevApplicantIdsRef = React.useRef<Set<string | number>>(new Set());
  const prevAppointmentIdsRef = React.useRef<Set<string>>(new Set());
  const isInitialFetchDoneRef = React.useRef<boolean>(false);

  const playNotificationSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain1.gain.setValueAtTime(0, ctx.currentTime);
      gain1.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.4);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
      gain2.gain.setValueAtTime(0, ctx.currentTime + 0.08);
      gain2.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.13);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.08);
      osc2.stop(ctx.currentTime + 0.6);
    } catch (error) {
      console.warn("Ses calinamadi:", error);
    }
  };

  const handleToggleSound = () => {
    const newVal = !soundEnabled;
    setSoundEnabled(newVal);
    localStorage.setItem('notificationSoundEnabled', String(newVal));
    if (newVal) {
      setTimeout(() => {
        try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.2);
        } catch (e) {
          console.warn(e);
        }
      }, 50);
    }
  };

  useEffect(() => {
    if (!user) {
      isInitialFetchDoneRef.current = false;
      prevApplicantIdsRef.current = new Set();
      prevAppointmentIdsRef.current = new Set();
      return;
    }

    const currentApplicantIds = new Set(applicants.map(a => a.id || a.takipKodu));
    const currentAppointmentIds = new Set(
      (notifications?.appointments || []).map(a => `${a.takipKodu || ''}-${a.randevuTarihi || ''}-${a.saat || ''}`)
    );

    if (!isInitialFetchDoneRef.current) {
      if (applicants.length > 0 || (notifications?.appointments || []).length > 0) {
        prevApplicantIdsRef.current = currentApplicantIds;
        prevAppointmentIdsRef.current = currentAppointmentIds;
        isInitialFetchDoneRef.current = true;
      }
      return;
    }

    let hasNewApplicant = false;
    for (const id of currentApplicantIds) {
      if (!prevApplicantIdsRef.current.has(id)) {
        hasNewApplicant = true;
        break;
      }
    }

    let hasNewAppointmentNotification = false;
    for (const key of currentAppointmentIds) {
      if (!prevAppointmentIdsRef.current.has(key)) {
        hasNewAppointmentNotification = true;
        break;
      }
    }

    if (hasNewApplicant || hasNewAppointmentNotification) {
      playNotificationSound();
    }

    prevApplicantIdsRef.current = currentApplicantIds;
    prevAppointmentIdsRef.current = currentAppointmentIds;
  }, [applicants, notifications, user]);

  // Periodic background polling for live updates (every 45 seconds)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetchData(true);
    }, 45000);
    return () => clearInterval(interval);
  }, [user]);

  const markNotificationAsRead = async (id?: number) => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
        credentials: 'include'
      });
      fetchData();
    } catch (err) {
      console.error('Bildirim okundu işaretleme hatası:', err);
    }
  };

  const [showNotifications, setShowNotifications] = useState(false);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAdminEmailModal, setShowAdminEmailModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isUpdatingAdminEmail, setIsUpdatingAdminEmail] = useState(false);
  const [isSendingReminders, setIsSendingReminders] = useState(false);
  const [isSendingAdminReport, setIsSendingAdminReport] = useState(false);
  const [selectedApplicantIds, setSelectedApplicantIds] = useState<string[]>([]);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string, end: string }>({ start: '', end: '' });
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<ApplicationStatus | ''>('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [showBulkStatusMenu, setShowBulkStatusMenu] = useState(false);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId) 
        : [...prev, groupId]
    );
  };
  const [showFinancialSummary, setShowFinancialSummary] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [applicantSortField, setApplicantSortField] = useState<'ad' | 'ulke' | 'islemDurumu' | 'randevuTarihi' | null>(null);
  const [applicantSortOrder, setApplicantSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: 'ad' | 'ulke' | 'islemDurumu' | 'randevuTarihi') => {
    if (applicantSortField === field) {
      setApplicantSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setApplicantSortField(field);
      setApplicantSortOrder('asc');
    }
  };
  const [showCommissionDetailModal, setShowCommissionDetailModal] = useState(false);
  const [selectedCommissionInfo, setSelectedCommissionInfo] = useState<{
    username: string;
    monthKey: string;
    applicants: Applicant[];
    totalBonus: number;
    monthName: string;
  } | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', adminEmail: '', acenteAdi: '', firmaUnvani: '', role: 'user' });
  const [logs, setLogs] = useState<any[]>([]);
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportCountry, setReportCountry] = useState('Tümü');
  const [reportStatus, setReportStatus] = useState('Tümü');
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportTableMode, setReportTableMode] = useState<'monthly' | 'yearly_comparison'>('monthly');
  const [manualCommissionRates, setManualCommissionRates] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('manualCommissionRates');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [manualCommissionThresholds, setManualCommissionThresholds] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('manualCommissionThresholds');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    if (settings) {
      if (settings.manual_commission_rates) {
        try {
          const rates = typeof settings.manual_commission_rates === 'string' 
            ? JSON.parse(settings.manual_commission_rates) 
            : settings.manual_commission_rates;
          setManualCommissionRates(rates);
        } catch (e) {
          console.error('Prim oranları yüklenemedi', e);
        }
      }
      if (settings.manual_commission_thresholds) {
        try {
          const thresholds = typeof settings.manual_commission_thresholds === 'string' 
            ? JSON.parse(settings.manual_commission_thresholds) 
            : settings.manual_commission_thresholds;
          setManualCommissionThresholds(thresholds);
        } catch (e) {
          console.error('Prim eşikleri yüklenemedi', e);
        }
      }
    }
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('manualCommissionRates', JSON.stringify(manualCommissionRates));
    localStorage.setItem('manualCommissionThresholds', JSON.stringify(manualCommissionThresholds));
  }, [manualCommissionRates, manualCommissionThresholds]);

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDateTime = (date: string | Date | undefined) => {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  const getCityFromCenter = (center?: string) => {
    if (!center) return '';
    const parts = center.split('-');
    if (parts.length > 1) {
      const cityPart = parts[parts.length - 1].trim();
      return cityPart.split(' ')[0].trim();
    }
    return center.trim();
  };

  const parseSafeDate = (dateStr: string | undefined) => {
    if (!dateStr) return null;
    
    // Eğer dateStr ISO string ise (T içeriyorsa), timezone kaymasını önlemek için 
    // sadece tarih kısmını (YYYY-MM-DD) alıp yerel saat diliminde parse ediyoruz.
    if (dateStr.includes('T')) {
      const datePart = dateStr.split('T')[0];
      const parts = datePart.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      }
    }
    
    // YYYY-MM-DD veya DD-MM-YYYY formatlarını ayır
    let parts: string[] = [];
    if (dateStr.includes('-')) parts = dateStr.split('-');
    else if (dateStr.includes('.')) parts = dateStr.split('.');
    else if (dateStr.includes('/')) parts = dateStr.split('/');
    
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD -> Yerel tarih olarak oluştur
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else {
        // DD-MM-YYYY -> Yerel tarih olarak oluştur
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    }
    
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  const getCurrencySymbol = (currency?: string, countryName?: string) => {
    return getCurrencySymbolConst(currency, countryName);
  };

  const accountingMap = React.useMemo(() => new Map(accounting.map(a => [a.takipKodu, a])), [accounting]);

  const fetchWithAuth = (url: string, options: RequestInit = {}) => {
    console.log(`Yetkili İstek: ${url}`);
    return fetch(url, {
      ...options,
      credentials: 'include'
    });
  };

  // Dashboard Customization
  const [showDashboardSettings, setShowDashboardSettings] = useState(false);
  const [dashboardWidgets, setDashboardWidgets] = useState({
    stats: true,
    totalCollection: true,
    reminders: true,
    pendingApplicants: true,
    recentAccounting: true,
    charts: true
  });

  useEffect(() => {
    checkAuth();
    const savedWidgets = localStorage.getItem('dashboardWidgets');
    if (savedWidgets) {
      try {
        setDashboardWidgets(JSON.parse(savedWidgets));
      } catch (e) {
        console.error('Widget ayarları yüklenemedi');
      }
    }
    // Build Timestamp: 2026-03-04 11:55
    console.log("MKM Vize Uygulaması v1.3 - POST Silme Modu Aktif");
  }, []);

  useEffect(() => {
    if (user) {
      // Small delay to ensure session is fully established in iframe context
      const timer = setTimeout(() => {
        fetchData();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const res = await fetchWithAuth('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        console.log('Oturum kontrolü başarılı. Kullanıcı:', data.user);
        setUser(data.user);
      } else {
        console.log('Oturum kontrolü başarısız, giriş sayfasına yönlendiriliyor.');
        setUser(null);
      }
    } catch (e) {
      console.error('Auth check error:', e);
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm('Çıkış yapmak istediğinize emin misiniz?')) return;
    try {
      await fetchWithAuth('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const toggleWidget = (widgetId: keyof typeof dashboardWidgets) => {
    const newWidgets = { ...dashboardWidgets, [widgetId]: !dashboardWidgets[widgetId] };
    setDashboardWidgets(newWidgets);
    localStorage.setItem('dashboardWidgets', JSON.stringify(newWidgets));
  };

  const handleBulkUpdateStatus = async (statusOverride?: string) => {
    const finalStatus = statusOverride || bulkStatus;
    if (!finalStatus || selectedApplicantIds.length === 0) return;
    if (!confirm(`${selectedApplicantIds.length} kaydın durumunu "${finalStatus}" olarak güncellemek istediğinize emin misiniz?`)) return;
    
    setLoading(true);
    try {
      const response = await fetchWithAuth('/api/applicants/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedApplicantIds, status: finalStatus })
      });
      
      if (!response.ok) throw new Error('Toplu güncelleme başarısız');
      
      setSelectedApplicantIds([]);
      setBulkStatus('');
      setShowBulkStatusMenu(false);
      fetchData();
    } catch (error) {
      console.error('Toplu güncelleme hatası:', error);
      alert('Toplu güncelleme sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedApplicantIds.length === 0) return;
    if (!confirm(`${selectedApplicantIds.length} kaydı silmek istediğinize emin misiniz?`)) return;
    
    setLoading(true);
    try {
      const response = await fetchWithAuth('/api/applicants/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedApplicantIds })
      });
      
      if (!response.ok) throw new Error('Toplu silme başarısız');
      
      setSelectedApplicantIds([]);
      fetchData();
    } catch (error) {
      console.error('Toplu silme hatası:', error);
      alert('Toplu silme sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (isSilent: boolean | any = false) => {
    const silent = isSilent === true;
    if (!user) return;
    if (!silent) setLoading(true);
    try {
      console.log('Veriler çekiliyor. Kullanıcı:', user.username, 'Rol:', user.role);
      
      const isAdmin = user.role === 'admin';
      const endpoints = ['/api/applicants', '/api/countries', '/api/settings', '/api/companies', '/api/notifications'];
      
      if (isAdmin) {
        endpoints.push('/api/accounting', '/api/prices', '/api/users');
      }

      const responses = await Promise.all(endpoints.map(url => fetchWithAuth(url)));

      const unauthorizedResponse = responses.find(r => r.status === 401);
      if (unauthorizedResponse) {
        console.warn(`Unauthorized access to ${unauthorizedResponse.url}. Logging out.`);
        setUser(null);
        return;
      }

      const allOk = responses.every(r => r.ok || r.status === 403);
      if (!allOk) {
        const failed = responses.find(r => !r.ok && r.status !== 403);
        throw new Error(`Bazı veriler çekilemedi: ${failed?.url} (${failed?.status})`);
      }

      const dataResults = await Promise.all(responses.map(async (r) => {
        if (r.status === 403) return null;
        try {
          return await r.json();
        } catch (e) {
          console.error(`JSON parse error for ${r.url}:`, e);
          return null;
        }
      }));
      
      endpoints.forEach((url, index) => {
        const item = dataResults[index];
        if (item === null) return;

        if (url === '/api/applicants') {
          const processedApplicants = (Array.isArray(item) ? item : []).map(a => ({
            ...a,
            timeline: typeof a.timeline === 'string' ? JSON.parse(a.timeline) : (a.timeline || []),
            documents: typeof a.documents === 'string' ? JSON.parse(a.documents) : (a.documents || [])
          }));
          setApplicants(processedApplicants);
        }
        if (url === '/api/accounting') setAccounting(Array.isArray(item) ? item : []);
        if (url === '/api/prices') setPrices(Array.isArray(item) ? item : []);
        if (url === '/api/notifications') {
          if (item && typeof item === 'object' && !Array.isArray(item)) {
            setNotifications({
              appointments: Array.isArray(item.appointments) ? item.appointments : [],
              payments: Array.isArray(item.payments) ? item.payments : [],
              missingDocs: Array.isArray(item.missingDocs) ? item.missingDocs : [],
              statusUpdates: Array.isArray(item.statusUpdates) ? item.statusUpdates : [],
              total: typeof item.total === 'number' ? item.total : 0
            });
          } else {
            console.warn('Invalid notifications data received:', item);
            setNotifications({ appointments: [], payments: [], missingDocs: [], statusUpdates: [], total: 0 });
          }
        }
        if (url === '/api/countries') {
          const countriesArr = Array.isArray(item) ? item : [];
          setCountries(countriesArr.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || '', 'tr')));
        }
        if (url === '/api/users') setUsers(Array.isArray(item) ? item : []);
        if (url === '/api/settings') setSettings(item && typeof item === 'object' ? item : null);
        if (url === '/api/companies') setCompanies(Array.isArray(item) ? item : []);
      });

      if (isAdmin || user?.adminEmail === 'salih@brighttour.com' || user?.username === 'admin') {
        fetchLogs();
      }
    } catch (error) {
      console.error('Veri çekme hatası:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetchWithAuth('/api/logs');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setLogs(data);
        }
      }
    } catch (error) {
      console.error('Log çekme hatası:', error);
    }
  };

  const handleSaveCountry = async (name: string) => {
    if (!name.trim()) return;
    try {
      const res = await fetchWithAuth('/api/countries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Ülke eklenemedi');
      }
    } catch (error) {
      console.error('Ülke ekleme hatası:', error);
    }
  };

  const handleDeleteCountry = async (id: number) => {
    if (!confirm('Bu ülkeyi silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetchWithAuth(`/api/countries/delete/${id}`, { method: 'POST' });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Ülke silme hatası:', error);
    }
  };

  const handleSaveApplicant = async (data: Partial<Applicant>) => {
    try {
      const res = await fetchWithAuth('/api/applicants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setShowApplicantForm(false);
        setSelectedApplicant(null);
        setApplicantInitialData(null);
        fetchData();
      } else {
        alert(result.error || 'Başvuru kaydedilemedi.');
      }
    } catch (error) {
      console.error('Kayıt hatası:', error);
      alert('Bir hata oluştu, lütfen tekrar deneyin.');
    }
  };

  const handleDeleteApplicant = async (kod: string) => {
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetchWithAuth(`/api/applicants/delete/${kod}`, { method: 'POST' });
      if (res.ok) {
        setShowApplicantForm(false);
        setSelectedApplicant(null);
        fetchData();
      }
    } catch (error) {
      console.error('Silme hatası:', error);
    }
  };

  const handleSaveAccounting = async (data: any) => {
    try {
      const res = await fetchWithAuth('/api/accounting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        // Eğer ödeme alındıysa başvuru durumunu da güncelle
        if (data.islemTipi === 'TAHSILAT_TAMAM') {
          await handleSaveApplicant({ 
            takipKodu: data.takipKodu, 
            odemeDurumu: 'Ödendi' 
          } as any);
        }
        setShowAccountingForm(false);
        setSelectedApplicant(null);
        fetchData();
      }
    } catch (error) {
      console.error('Muhasebe hatası:', error);
    }
  };

  const handleAddTimeline = async (kod: string, content: string, status?: ApplicationStatus, date?: string) => {
    if (!content.trim()) return;
    try {
      const applicant = applicants.find(a => a.takipKodu === kod);
      if (!applicant) return;

      const newEvent: TimelineEvent = {
        id: Math.random().toString(36).substring(2, 9),
        status: status || applicant.islemDurumu,
        date: date || new Date().toISOString(),
        description: content,
        user: user?.username || 'Sistem'
      };

      const updatedTimeline = [newEvent, ...(applicant.timeline || [])];
      
      const res = await fetchWithAuth('/api/applicants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          takipKodu: kod,
          timeline: updatedTimeline
        })
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Timeline ekleme hatası:', error);
    }
  };

  const handleUpdateDocuments = async (kod: string, documents: Document[]) => {
    try {
      const res = await fetchWithAuth('/api/applicants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          takipKodu: kod,
          documents
        })
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Belge güncelleme hatası:', error);
    }
  };

  const handleDeleteAccounting = async (id: number) => {
    if (!confirm('Bu muhasebe kaydını silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetchWithAuth(`/api/accounting/delete/${id}`, { method: 'POST' });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Muhasebe silme hatası:', error);
    }
  };

  const handleSavePrice = async (data: Partial<CountryPrice>) => {
    try {
      const res = await fetchWithAuth('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setShowPriceForm(false);
        setSelectedPrice(null);
        fetchData();
      }
    } catch (error) {
      console.error('Fiyat kayıt hatası:', error);
    }
  };

  const handleDeletePrice = async (id: number) => {
    if (!confirm('Bu fiyat tanımını silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetchWithAuth(`/api/prices/delete/${id}`, { method: 'POST' });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Fiyat silme hatası:', error);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetchWithAuth(`/api/users/delete/${id}`, { method: 'POST' });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Silme işlemi başarısız.');
      }
    } catch (err) {
      alert('Sunucuya bağlanılamadı.');
    }
  };

  const handleDeleteCompany = async (id: number) => {
    if (!window.confirm('Bu firmayı silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetchWithAuth(`/api/companies/delete/${id}`, { method: 'POST' });
      if (res.ok) {
        setCompanies(prev => prev.filter(c => c.id !== id));
      } else {
        alert('Firma silinemedi.');
      }
    } catch (e) {
      console.error('Firma silme hatası:', e);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        setShowUserForm(false);
        setNewUser({ username: '', password: '', adminEmail: '', acenteAdi: '', firmaUnvani: '', role: 'user' });
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Kullanıcı oluşturulamadı.');
      }
    } catch (err) {
      alert('Sunucuya bağlanılamadı.');
    }
  };

  const handleSendReminders = async () => {
    setIsSendingReminders(true);
    try {
      const res = await fetchWithAuth('/api/reminders/send', { method: 'POST' });
      const data = await res.json();
      alert(data.message);
    } catch (error) {
      console.error('Hatırlatma gönderim hatası:', error);
      alert('Hatırlatmalar gönderilirken bir hata oluştu.');
    } finally {
      setIsSendingReminders(false);
    }
  };

  const handleSendAdminReport = async () => {
    setIsSendingAdminReport(true);
    try {
      const res = await fetchWithAuth('/api/reports/weekly-admin', { method: 'POST' });
      
      // JSON kontrolü
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        if (res.ok) {
          alert(data.message);
        } else {
          alert(data.error || 'Rapor gönderilemedi.');
        }
      } else {
        const text = await res.text();
        console.error('Sunucu hatası (JSON değil):', text);
        alert(`Sunucu hatası oluştu (Durum: ${res.status}). Lütfen SMTP ayarlarınızı kontrol edin.`);
      }
    } catch (error) {
      console.error('Admin rapor hatası:', error);
      alert('Rapor gönderilirken bir hata oluştu.');
    } finally {
      setIsSendingAdminReport(false);
    }
  };

  const handleSendManualReminder = async (kod: string) => {
    try {
      const res = await fetchWithAuth(`/api/reminders/manual/${kod}`, { method: 'GET' });
      
      // JSON kontrolü
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        if (data.success) {
          alert(data.message);
        } else {
          alert(data.error || 'E-posta gönderilemedi.');
        }
      } else {
        const text = await res.text();
        console.error('Sunucu hatası (JSON değil):', text);
        alert(`Sunucu hatası oluştu (Durum: ${res.status}). Lütfen SMTP ayarlarınızı kontrol edin.`);
      }
    } catch (error) {
      console.error('Manuel hatırlatma hatası:', error);
      alert('Bir hata oluştu. Sunucu yanıtı JSON formatında değil.');
    }
  };

  const exportToExcel = (data: any[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Liste");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const generateAccountingPdf = (a: AccountingRecord) => {
    const trToEn = (text: string) => {
      if (!text) return '-';
      return text
        .replace(/Ğ/g, 'G')
        .replace(/ğ/g, 'g')
        .replace(/Ü/g, 'U')
        .replace(/ü/g, 'u')
        .replace(/Ş/g, 'S')
        .replace(/ş/g, 's')
        .replace(/İ/g, 'I')
        .replace(/ı/g, 'i')
        .replace(/Ö/g, 'O')
        .replace(/ö/g, 'o')
        .replace(/Ç/g, 'C')
        .replace(/ç/g, 'c');
    };

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(225, 29, 72); // rose-600
    doc.text("PROFORMA FATURA", 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(trToEn(`MKM Vize & Danismanlik Services`), 105, 27, { align: 'center' });
    doc.text(trToEn(`Olusturulma Tarihi: ${formatDate(new Date())}`), 105, 32, { align: 'center' });

    // Details Table
    autoTable(doc, {
      startY: 40,
      head: [[trToEn('Bilgi'), trToEn('Detay')]],
      body: [
        [trToEn('Fatura No'), trToEn(a.faturaNo)],
        [trToEn('Fatura Tarihi'), trToEn(a.faturaTarihi)],
        [trToEn('Musteri Ad Soyad'), trToEn(a.adSoyad)],
        [trToEn('Pasaport No'), trToEn(a.pasaportNo)],
        [trToEn('Ulke'), trToEn(a.ulke)],
        [trToEn('Firma'), trToEn(a.firma)],
        [trToEn('Islem Durumu'), trToEn(a.islemDurumu)],
        [trToEn('Net Tutar'), `${a.netTutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${getCurrencySymbol(a.currency)}`],
        [trToEn('KDV'), `${a.kdv.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${getCurrencySymbol(a.currency)}`],
        [trToEn('Toplam Tutar'), `${a.toplam.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${getCurrencySymbol(a.currency)}`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [30, 41, 59] },
      styles: { font: 'helvetica', fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
      }
    });

    // Note Box & Footer
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 205, 211);
    doc.roundedRect(14, finalY + 10, 182, 14, 2, 2, 'FD');

    doc.setFontSize(10);
    doc.setTextColor(190, 18, 60);
    doc.text(trToEn("NOT: Fatura bilgilerini kontrol edin ve hata varsa bildirin"), 105, finalY + 19, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(trToEn("Bu belge sistem tarafindan otomatik olarak olusturulmustur."), 105, finalY + 32, { align: 'center' });

    doc.save(`Proforma_Fatura_${a.faturaNo || a.id}.pdf`);
  };

  const renderContent = () => {
    // Role based access control for tabs
    const adminOnlyTabs = ['accounting', 'prices', 'users', 'logs', 'settings'];
    if (adminOnlyTabs.includes(activeTab) && user?.role !== 'admin') {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
            <ShieldCheck size={40} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Yetkisiz Erişim</h3>
            <p className="text-slate-500">Bu sayfayı görüntülemek için yönetici yetkisine sahip olmanız gerekmektedir.</p>
          </div>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="px-6 py-2 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all"
          >
            Panele Dön
          </button>
        </div>
      );
    }

    const getStatusTotal = (status: string | 'Tümü') => {
      const statusApplicants = status === 'Tümü' 
        ? applicants 
        : applicants.filter(a => a.islemDurumu === status);
      
      const codes = new Set(statusApplicants.map(a => a.takipKodu));
      const accountingRecords = accounting.filter(acc => codes.has(acc.takipKodu));
      
      const totalsByCurrency: Record<string, number> = {};
      
      accountingRecords.forEach(acc => {
        const cur = acc.currency || 'TRY';
        totalsByCurrency[cur] = (totalsByCurrency[cur] || 0) + acc.toplam;
      });
      
      const accountingTakipKodus = new Set(accountingRecords.map(a => a.takipKodu));
      const paidWithoutAccounting = statusApplicants.filter(a => 
        a.odemeDurumu === 'Ödendi' && !accountingTakipKodus.has(a.takipKodu)
      );
      
      paidWithoutAccounting.forEach(applicant => {
        const price = prices.find(p => p.ulke === applicant.ulke);
        if (price) {
          const cur = price.currency || 'EUR';
          totalsByCurrency[cur] = (totalsByCurrency[cur] || 0) + price.toplam;
        }
      });
      
      const currencies = Object.keys(totalsByCurrency).filter(c => totalsByCurrency[c] > 0);
      if (currencies.length === 0) return '0,00 €';
      
      return currencies.map(cur => 
        `${totalsByCurrency[cur].toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${getCurrencySymbol(cur)}`
      ).join('\n');
    };

    const totalCollectionByCurrency = (() => {
      let totalTL = 0;
      const otherTotals: Record<string, number> = {};
      
      // 1. Gerçekleşen (Faturası kesilmiş) TL tutarlar
      accounting.forEach(acc => {
        totalTL += acc.toplam;
      });
      
      const accountingTakipKodus = new Set(accounting.map(a => a.takipKodu));
      
      // 2. Beklenen (Faturası henüz kesilmemiş ama ödendi işaretlenmiş) Döviz tutarlar
      const paidWithoutAccounting = applicants.filter(a => 
        a.odemeDurumu === 'Ödendi' && !accountingTakipKodus.has(a.takipKodu)
      );
      
      paidWithoutAccounting.forEach(applicant => {
        const price = prices.find(p => p.ulke === applicant.ulke);
        if (price) {
          const cur = price.currency || 'TRY';
          if (cur === 'TRY') {
            totalTL += price.toplam;
          } else {
            otherTotals[cur] = (otherTotals[cur] || 0) + price.toplam;
          }
        }
      });
      
      // Sonuçları birleştir
      const results: string[] = [];
      if (totalTL > 0 || Object.keys(otherTotals).length === 0) {
        results.push(`${totalTL.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`);
      }
      
      Object.keys(otherTotals).forEach(cur => {
        results.push(`${otherTotals[cur].toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${getCurrencySymbol(cur)}`);
      });
      
      return results.join('\n');
    })();

    const formatTotalCollection = (value: string) => value;

    const months = [
      'OCAK', 'ŞUBAT', 'MART', 'NİSAN', 'MAYIS', 'HAZİRAN',
      'TEMMUZ', 'AĞUSTOS', 'EYLÜL', 'EKİM', 'KASIM', 'ARALIK'
    ];

    // Raporlama Verileri (Switch'ten önce hesapla ki tüm rapor alt sekmeleri görebilsin)
    let countryFilteredApplicants: Applicant[] = [];
    let yearFilteredApplicants: Applicant[] = [];
    let filteredYearReportApplicants: Applicant[] = [];
    let monthlyBreakdown: any = {};
    let userMonthlyBreakdown: any = {};
    let countryChartData: any[] = [];
    let visasIssued: Applicant[] = [];
    let visasRejected: Applicant[] = [];
    let inProgressApps: Applicant[] = [];
    let trendChartData: any[] = [];
    let revenueChartData: any[] = [];
    let commissionTrendData: any[] = [];
    let yearlyComparisonChartData: any[] = [];
    let totalYearlyApps = 0;
    let totalYearlyGeneralApps = 0;
    let totalYearlyCommission = 0;

    const getReportMonthKey = (curr: Applicant) => {
      let commissionMonthKey = '';
      let reportMonthKey = '';

      // Prim için fatura tarihini baz al (fatura kesilmişse)
      const acc = accountingMap.get(curr.takipKodu);
      if (acc && acc.faturaNo && acc.faturaTarihi) {
        const fd = parseSafeDate(acc.faturaTarihi);
        if (fd) {
          commissionMonthKey = `${fd.getFullYear()}-${(fd.getMonth() + 1).toString().padStart(2, '0')}`;
        }
      }

      if (curr.randevuTarihi) {
        const rd = parseSafeDate(curr.randevuTarihi);
        if (rd) {
          reportMonthKey = `${rd.getFullYear()}-${(rd.getMonth() + 1).toString().padStart(2, '0')}`;
        }
      }
      
      if (!reportMonthKey) {
        const kd = parseSafeDate(curr.kayitTarihi);
        if (kd) reportMonthKey = `${kd.getFullYear()}-${(kd.getMonth() + 1).toString().padStart(2, '0')}`;
      }

      return { 
        reportMonthKey: reportMonthKey || '', 
        commissionMonthKey: commissionMonthKey || '' 
      };
    };

    if (activeTab.startsWith('reports')) {
      countryFilteredApplicants = (applicants as Applicant[]).filter(a => {
        return reportCountry === 'Tümü' || a.ulke === reportCountry;
      });

      yearFilteredApplicants = countryFilteredApplicants.filter(a => {
        const { reportMonthKey } = getReportMonthKey(a);
        return reportMonthKey && reportMonthKey.startsWith(`${reportYear}-`);
      });

      filteredYearReportApplicants = yearFilteredApplicants.filter(a => {
        return reportStatus === 'Tümü' || a.islemDurumu === reportStatus;
      });

      // 12 ayı seçilen yıl için önceden tanımla
      for (let i = 1; i <= 12; i++) {
        const mKey = `${reportYear}-${i.toString().padStart(2, '0')}`;
        monthlyBreakdown[mKey] = { 
          total: 0, 
          appointmentsCount: 0,
          completedCount: 0,
          inProgressCount: 0,
          commissions: {} as Record<string, number>,
          countries: {}, 
          monthName: months[i-1],
          year: reportYear
        };
      }

      // 1. Genel Raporlama Döngüsü (ReportMonthKey bazlı)
      yearFilteredApplicants.forEach(curr => {
        const { reportMonthKey } = getReportMonthKey(curr);
        
        if (reportMonthKey && monthlyBreakdown[reportMonthKey]) {
          if (curr.islemDurumu === 'Tamamlandı') monthlyBreakdown[reportMonthKey].completedCount++;
          if (curr.islemDurumu === 'İşlemde') monthlyBreakdown[reportMonthKey].inProgressCount++;

          const matchesStatus = reportStatus === 'Tümü' || curr.islemDurumu === reportStatus;
          if (matchesStatus) {
            monthlyBreakdown[reportMonthKey].total++;
            const country = curr.ulke || 'Belirtilmedi';
            if (!monthlyBreakdown[reportMonthKey].countries[country]) {
              monthlyBreakdown[reportMonthKey].countries[country] = { count: 0, applicants: [] };
            }
            monthlyBreakdown[reportMonthKey].countries[country].count++;
            monthlyBreakdown[reportMonthKey].countries[country].applicants.push(curr);
          }
        }
      });

      // 2. Prim Hesaplama Döngüsü (Fatura bazlı - Takip kodu başına 1 sayım)
      const uniqueCommissions = new Map<string, { monthKey: string, handler: string, applicant: Applicant }>();

      applicants.forEach(curr => {
        const acc = accountingMap.get(curr.takipKodu);
        // Sadece faturası kesilmiş (faturaNo ve faturaTarihi olan) kayıtlar prim hesaplamasına dahil edilir
        // Kesinleşmiş alacak (fatura kesilmesi) mantığı baz alınmıştır
        if (acc && acc.faturaNo && acc.faturaTarihi) {
          const fd = parseSafeDate(acc.faturaTarihi);
          if (fd && fd.getFullYear() === reportYear) {
            const mKey = `${fd.getFullYear()}-${(fd.getMonth() + 1).toString().padStart(2, '0')}`;
            
            if (!uniqueCommissions.has(curr.takipKodu)) {
              // Prim hakedişi için randevu alan kişiyi bul (yoksa kaydı açan)
              const appointmentEvent = curr.timeline?.find((te: any) => te.status === 'Randevu Alındı');
              const handlerUser = appointmentEvent?.user || (curr.timeline && curr.timeline.length > 0 ? curr.timeline[0].user : 'Sistem');
              
              uniqueCommissions.set(curr.takipKodu, {
                monthKey: mKey,
                handler: handlerUser,
                applicant: curr
              });
            }
          }
        }
      });

      // Map sonuçlarını aylık ve personel dökümüne işle
      uniqueCommissions.forEach((data) => {
        const { monthKey, handler, applicant } = data;
        
        if (monthlyBreakdown[monthKey]) {
          monthlyBreakdown[monthKey].appointmentsCount++;
          const cur = applicant.currency || 'TRY';
          // Prim tutarı yerine referans fiyatı topluyoruz (opsiyonel gösterim için)
          monthlyBreakdown[monthKey].commissions[cur] = (monthlyBreakdown[monthKey].commissions[cur] || 0) + (applicant.fiyat || 0);

          if (handler) {
            if (!userMonthlyBreakdown[handler]) userMonthlyBreakdown[handler] = {};
            if (!userMonthlyBreakdown[handler][monthKey]) {
              userMonthlyBreakdown[handler][monthKey] = { 
                count: 0, 
                applicants: [],
                totalPrice: 0 
              };
            }
            userMonthlyBreakdown[handler][monthKey].count++;
            userMonthlyBreakdown[handler][monthKey].applicants.push(applicant);
          }
        }
      });

      countryChartData = Object.entries(
        filteredYearReportApplicants.reduce((acc: any, curr) => {
          const country = curr.ulke || 'Belirtilmedi';
          acc[country] = (acc[country] || 0) + 1;
          return acc;
        }, {})
      )
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count);

      visasIssued = filteredYearReportApplicants.filter(a => a.vizeSonucu === 'Onaylandı');
      visasRejected = filteredYearReportApplicants.filter(a => a.vizeSonucu === 'Red');
      inProgressApps = filteredYearReportApplicants.filter(a => a.islemDurumu === 'İşlemde');

      trendChartData = Object.keys(monthlyBreakdown).sort().map(monthKey => ({
        name: monthlyBreakdown[monthKey].monthName,
        count: monthlyBreakdown[monthKey].total
      }));

      const filteredAccounting = (accounting as AccountingRecord[]).filter(a => {
        const date = parseSafeDate(a.kayitTarihi);
        const matchesYear = date && date.getFullYear() === reportYear;
        const matchesCountry = reportCountry === 'Tümü' || a.ulke === reportCountry;
        const matchesStatus = reportStatus === 'Tümü' || a.islemDurumu === reportStatus;
        return matchesYear && matchesCountry && matchesStatus;
      });

      revenueChartData = Object.entries(
        filteredAccounting.reduce((acc, curr) => {
          const date = parseSafeDate(curr.kayitTarihi);
          const month = date ? date.toLocaleString('tr-TR', { month: 'short' }).toUpperCase() : 'BİLİNMEYEN';
          acc[month] = (acc[month] || 0) + curr.toplam;
          return acc;
        }, {} as Record<string, number>)
      ).map(([name, amount]) => ({ name, amount }));

      commissionTrendData = Object.keys(monthlyBreakdown).sort().map(monthKey => {
        const mData = monthlyBreakdown[monthKey];
        const count = mData.appointmentsCount;
        const threshold = manualCommissionThresholds[monthKey] === undefined ? 20 : (manualCommissionThresholds[monthKey] || 0);
        const rate = manualCommissionRates[monthKey] === undefined ? 20 : (manualCommissionRates[monthKey] || 0);
        const excessCount = Math.max(0, count - threshold);
        return { name: mData.monthName, commission: excessCount * rate };
      });

      totalYearlyGeneralApps = (Object.values(monthlyBreakdown) as any[]).reduce((acc: number, m: any) => acc + (m.total || 0), 0);
      totalYearlyApps = (Object.values(monthlyBreakdown) as any[]).reduce((acc: number, m: any) => acc + (m.appointmentsCount || 0), 0);
      totalYearlyCommission = Object.keys(monthlyBreakdown).reduce((acc, monthKey) => {
        const mData = monthlyBreakdown[monthKey];
        const count = mData.appointmentsCount;
        const threshold = manualCommissionThresholds[monthKey] === undefined ? 20 : (manualCommissionThresholds[monthKey] || 0);
        const rate = manualCommissionRates[monthKey] === undefined ? 20 : (manualCommissionRates[monthKey] || 0);
        const excessCount = Math.max(0, count - threshold);
        return acc + (excessCount * rate);
      }, 0);

      // Yıllık Karşılaştırma Grafiği Verisi
      const prevYear = reportYear - 1;
      yearlyComparisonChartData = months.map((monthName, index) => {
        const indexStr = (index + 1).toString().padStart(2, '0');
        const mKeyCurrent = `${reportYear}-${indexStr}`;
        const mKeyPrev = `${prevYear}-${indexStr}`;

        const monthlyAppsCurrent = countryFilteredApplicants.filter(a => {
          const { reportMonthKey } = getReportMonthKey(a);
          return reportMonthKey === mKeyCurrent;
        });

        const monthlyAppsPrev = countryFilteredApplicants.filter(a => {
          const { reportMonthKey } = getReportMonthKey(a);
          return reportMonthKey === mKeyPrev;
        });

        return {
          name: monthName,
          [prevYear]: monthlyAppsPrev.length,
          [reportYear]: monthlyAppsCurrent.length,
          prevApproved: monthlyAppsPrev.filter(a => a.vizeSonucu === 'Onaylandı').length,
          currentApproved: monthlyAppsCurrent.filter(a => a.vizeSonucu === 'Onaylandı').length,
          prevRejected: monthlyAppsPrev.filter(a => a.vizeSonucu === 'Red').length,
          currentRejected: monthlyAppsCurrent.filter(a => a.vizeSonucu === 'Red').length,
          prevInProgress: monthlyAppsPrev.filter(a => a.islemDurumu === 'İşlemde').length,
          currentInProgress: monthlyAppsCurrent.filter(a => a.islemDurumu === 'İşlemde').length,
        };
      });
    }

    switch (activeTab) {
      case 'dashboard': {
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                label="Toplam Başvuru" 
                value={applicants.length} 
                icon={FileText} 
                color="bg-brand-500" 
                onClick={() => setActiveTab('applicants')}
                darkMode={darkMode}
              />
              <StatCard 
                label="Bekleyen Başvuru" 
                value={applicants.filter(a => a.islemDurumu === 'Talep Bekliyor' || a.islemDurumu === 'İşlemde').length} 
                icon={Clock} 
                color="bg-amber-400" 
                onClick={() => setActiveTab('pending')}
                darkMode={darkMode}
              />
              <StatCard 
                label="Tamamlanan" 
                value={applicants.filter(a => a.islemDurumu === 'Tamamlandı').length} 
                icon={CheckCircle2} 
                color="bg-emerald-500" 
                onClick={() => setActiveTab('applicants')}
                darkMode={darkMode}
              />
            </div>

            {/* Embedded Calendar on Dashboard */}
            <div className={`p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-2xl border shadow-sm`}>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-brand-600" />
                  <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Randevu Takvimi</h3>
                </div>
                <button 
                  onClick={() => setActiveTab('calendar')}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline uppercase"
                >
                  Tam Ekranda Aç
                </button>
              </div>
              <CalendarView 
                applicants={applicants.filter(a => a.randevuTarihi)} 
                onSelectApplicant={(a) => {
                  setSelectedApplicant(a);
                  setShowApplicantForm(true);
                }}
                onDoubleClickDay={(day) => {
                  const year = day.getFullYear();
                  const month = String(day.getMonth() + 1).padStart(2, '0');
                  const date = String(day.getDate()).padStart(2, '0');
                  const formattedDate = `${year}-${month}-${date}`;
                  
                  setSelectedApplicant(null);
                  setApplicantInitialData({ 
                    randevuTarihi: formattedDate,
                    islemDurumu: 'Randevu Alındı'
                  });
                  setShowApplicantForm(true);
                }}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className={`lg:col-span-8 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-2xl border shadow-sm overflow-hidden`}>
                <div className="bg-brand-500 p-4 flex items-center gap-2">
                  <Clock size={18} className="text-white" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Son Başvurular</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-slate-400 bg-slate-800/50' : 'text-slate-500 bg-slate-50/50'}`}>
                        <th className="px-6 py-3 border-b border-slate-100">Ad Soyad</th>
                        <th className="px-6 py-3 border-b border-slate-100">Ülke</th>
                        <th className="px-6 py-3 border-b border-slate-100">Durum</th>
                        <th className="px-6 py-3 border-b border-slate-100">Tarih</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {applicants.slice(0, 7).map(a => (
                        <tr key={a.takipKodu} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-3 text-xs font-bold text-slate-700">{a.ad} {a.soyad}</td>
                          <td className="px-6 py-3 text-xs text-slate-500 uppercase">{a.ulke}</td>
                          <td className="px-6 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              a.islemDurumu === 'Tamamlandı' ? 'bg-emerald-100 text-emerald-700' :
                              a.islemDurumu === 'Randevu Alındı' ? 'bg-brand-100 text-brand-700' :
                              a.islemDurumu === 'Talep Bekliyor' ? 'bg-amber-100 text-amber-700' :
                              'bg-brand-100 text-brand-700'
                            }`}>
                              {a.islemDurumu.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-xs text-slate-500">{a.kayitTarihi?.split('T')[0]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={`lg:col-span-4 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-2xl border shadow-sm overflow-hidden`}>
                <div className="bg-brand-500 p-4 flex items-center gap-2">
                  <Calendar size={18} className="text-white" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Son Randevular</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-slate-400 bg-slate-800/50' : 'text-slate-500 bg-slate-50/50'}`}>
                        <th className="px-6 py-3 border-b border-slate-100">Ad Soyad</th>
                        <th className="px-6 py-3 border-b border-slate-100">Ülke</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {applicants.filter(a => a.islemDurumu === 'Randevu Alındı').slice(0, 7).map(a => (
                        <tr key={a.takipKodu} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-3 text-xs font-bold text-slate-700">{a.ad} {a.soyad}</td>
                          <td className="px-6 py-3 text-xs text-slate-500 uppercase">{a.ulke}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div 
              onClick={() => setShowWeeklyAppointments(true)}
              className={`p-6 ${darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-750' : 'bg-white border-slate-100 hover:bg-slate-50'} rounded-2xl border shadow-sm cursor-pointer transition-all active:scale-[0.98] group`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Calendar size={20} className="text-brand-500" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Bu Haftanın Randevularım</h3>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              
              <div className="grid grid-cols-5 gap-4">
                {['PZT', 'SAL', 'ÇAR', 'PER', 'CUM'].map((day, idx) => {
                  const today = new Date();
                  const currentDay = today.getDay(); // 1 (Mon) to 5 (Fri)
                  const startOfWeek = new Date(today);
                  startOfWeek.setDate(today.getDate() - (currentDay - 1) + idx);
                  const dateString = startOfWeek.getDate();
                  
                  const dayAppointments = applicants.filter(a => {
                    if (a.islemDurumu !== 'Randevu Alındı' || !a.randevuTarihi) return false;
                    const randevuDate = new Date(a.randevuTarihi);
                    return randevuDate.getDate() === startOfWeek.getDate() && 
                           randevuDate.getMonth() === startOfWeek.getMonth() &&
                           randevuDate.getFullYear() === startOfWeek.getFullYear();
                  });

                  return (
                    <div key={day} className="flex flex-col items-center gap-2">
                      <p className="text-[10px] font-bold text-slate-400">{day}</p>
                      <div className={`w-full aspect-video rounded-xl border-2 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'} flex flex-col items-center justify-center gap-1 p-2`}>
                        <span className={`text-lg font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>{dateString}</span>
                        {dayAppointments.length > 0 ? (
                          <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-bold rounded-full">
                            {dayAppointments.length} Randevu
                          </span>
                        ) : (
                          <div className="w-8 h-1.5 bg-slate-200 rounded-full" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }

      case 'companies':
        return <CompanyForm initialCompany={selectedCompany} onSave={() => { fetchData(); setSelectedCompany(null); }} />;

      case 'forms':
        return <FormManagement />;

      case 'passwords':
        return <PasswordManagement />;

      case 'hosting':
        return <EmailHosting />;

      case 'support':
        return <SupportCenter user={user} />;

      case 'profile':
        return <UserProfile user={user} onLogout={handleLogout} />;
      case 'logs':
        return (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Sistem Kayıtları</h3>
              <button 
                onClick={fetchLogs}
                className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 bg-brand-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                YENİLE
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                    <th className="px-6 py-4 border-b border-slate-100">Tarih</th>
                    <th className="px-6 py-4 border-b border-slate-100">Kullanıcı</th>
                    <th className="px-6 py-4 border-b border-slate-100">İşlem</th>
                    <th className="px-6 py-4 border-b border-slate-100">Detay</th>
                    <th className="px-6 py-4 border-b border-slate-100">Tip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-[10px] font-bold text-brand-600">
                            {log.username?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{log.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-800">{log.action}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-600 max-w-md truncate" title={log.details}>{log.details}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                          log.type === 'success' ? 'bg-emerald-100 text-emerald-700' :
                          log.type === 'warning' ? 'bg-rose-100 text-rose-700' :
                          'bg-brand-100 text-brand-700'
                        }`}>
                          {log.type === 'success' ? 'BAŞARILI' : 
                          log.type === 'warning' ? 'UYARI' : 
                          'BİLGİ'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                        Henüz sistem kaydı bulunmuyor.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'applicants':
      case 'pending':
      case 'appointments':
        const filteredApplicants = applicants.filter(a => {
          const matchesSearch = ((a.ad || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 (a.soyad || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 (a.takipKodu || '').includes(searchQuery.toUpperCase()));
          const matchesCountry = (selectedCountry === 'Tümü' ? true : a.ulke === selectedCountry);
          
          const matchesPayment = (selectedPaymentStatus === 'Tümü' ? true : 
                                  selectedPaymentStatus === 'Fatura Kesildi' ? accounting.some(acc => acc.takipKodu === a.takipKodu) :
                                  (a.odemeDurumu || 'Ödenmedi') === selectedPaymentStatus);
          
          const matchesCategory = (selectedVisaCategory === 'Tümü' ? true : 
                                   (a.vizeKategorisi || 'Turistik') === selectedVisaCategory);
          
          const matchesDate = (!dateRange.start || !dateRange.end) ? true : (() => {
            const start = parseSafeDate(dateRange.start);
            const end = parseSafeDate(dateRange.end);
            if (!start || !end) return true;
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);

            const kayitDate = parseSafeDate(a.kayitTarihi);
            const randevuDate = parseSafeDate(a.randevuTarihi);

            if (activeTab === 'appointments') {
              return !!(randevuDate && randevuDate >= start && randevuDate <= end);
            }
            if (activeTab === 'pending') {
              return !!(kayitDate && kayitDate >= start && kayitDate <= end);
            }
            
            // Tüm Kayıtlar sekmesinde her iki tarihten biri aralıktaysa göster
            const kayitMatches = !!(kayitDate && kayitDate >= start && kayitDate <= end);
            const randevuMatches = !!(randevuDate && randevuDate >= start && randevuDate <= end);
            return kayitMatches || randevuMatches;
          })();

          if (activeTab === 'pending') {
            return a.islemDurumu === 'Talep Bekliyor' && matchesSearch && matchesCountry && matchesPayment && matchesDate && matchesCategory;
          }
          if (activeTab === 'appointments') {
            return a.islemDurumu === 'Randevu Alındı' && matchesSearch && matchesCountry && matchesPayment && matchesDate && matchesCategory;
          }
          
          const matchesStatus = (selectedStatus === 'Tümü' ? true : a.islemDurumu === selectedStatus);
          return matchesStatus && matchesSearch && matchesCountry && matchesPayment && matchesDate && matchesCategory;
        });

        // Uygulanan sıralama (Ad Soyad, Ülke, Durum, Randevu)
        if (applicantSortField) {
          filteredApplicants.sort((a, b) => {
            let comparison = 0;
            if (applicantSortField === 'ad') {
              const nameA = `${a.ad || ''} ${a.soyad || ''}`.trim();
              const nameB = `${b.ad || ''} ${b.soyad || ''}`.trim();
              comparison = nameA.localeCompare(nameB, 'tr');
            } else if (applicantSortField === 'ulke') {
              comparison = (a.ulke || '').localeCompare(b.ulke || '', 'tr');
            } else if (applicantSortField === 'islemDurumu') {
              comparison = (a.islemDurumu || '').localeCompare(b.islemDurumu || '', 'tr');
            } else if (applicantSortField === 'randevuTarihi') {
              const dateA = parseSafeDate(a.randevuTarihi);
              const dateB = parseSafeDate(b.randevuTarihi);
              
              if (!dateA && !dateB) comparison = 0;
              else if (!dateA) comparison = 1;
              else if (!dateB) comparison = -1;
              else {
                const timeA = dateA.getTime();
                const timeB = dateB.getTime();
                if (timeA !== timeB) {
                  comparison = timeA - timeB;
                } else {
                  comparison = (a.saat || '').localeCompare(b.saat || '');
                }
              }
            }
            return applicantSortOrder === 'asc' ? comparison : -comparison;
          });
        }

        const getTitle = () => {
          if (activeTab === 'pending') return 'Talep Bekleyenler';
          if (activeTab === 'appointments') return 'Randevu Alınanlar';
          return 'Tüm Kayıtlar';
        };

        return (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 space-y-6">
              {/* Row 1: Title and Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-bold text-slate-800">{getTitle()}</h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={fetchData}
                      className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 bg-brand-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                      YENİLE
                    </button>
                    <button 
                      onClick={() => {
                        const exportData = filteredApplicants.map(a => ({
                          'Takip Kodu': a.takipKodu,
                          'Ad': a.ad,
                          'Soyad': a.soyad,
                          'E-posta': a.email,
                          'Ülke': a.ulke,
                          'Durum': a.islemDurumu,
                          'Randevu Tarihi': a.randevuTarihi,
                          'Randevu Saati': a.saat,
                          'Ödeme Durumu': a.odemeDurumu,
                          'Pasaport No': a.pasaportNo,
                          'Firma': a.firmaAdi,
                          'Kayıt Tarihi': a.kayitTarihi
                        }));
                        exportToExcel(exportData, getTitle());
                      }}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Download size={14} />
                      EXCEL'E AKTAR
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 2: Filters Side by Side */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
                  <Filter size={14} className="text-slate-400" />
                  <select 
                    className="bg-transparent text-sm font-bold outline-none text-slate-700 cursor-pointer"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                  >
                    <option value="Tümü">Tüm Ülkeler</option>
                    {countries.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                
                {activeTab === 'applicants' && (
                  <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
                    <Clock size={14} className="text-slate-400" />
                    <select 
                      className="bg-transparent text-sm font-bold outline-none text-slate-700 cursor-pointer"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="Tümü">Tüm Durumlar</option>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                {(activeTab === 'applicants' || activeTab === 'appointments') && (
                  <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
                    <Wallet size={14} className="text-slate-400" />
                    <select 
                      className="bg-transparent text-sm font-bold outline-none text-slate-700 cursor-pointer"
                      value={selectedPaymentStatus}
                      onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                    >
                      <option value="Tümü">Ödeme Durumu</option>
                      {PAYMENT_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                )}

                {(activeTab === 'applicants' || activeTab === 'pending' || activeTab === 'appointments') && (
                  <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
                    <Tag size={14} className="text-slate-400" />
                    <select 
                      className="bg-transparent text-sm font-bold outline-none text-slate-700 cursor-pointer"
                      value={selectedVisaCategory}
                      onChange={(e) => setSelectedVisaCategory(e.target.value)}
                    >
                      <option value="Tümü">Vize Kategorisi (Tümü)</option>
                      <option value="Turistik">Turistik</option>
                      <option value="Ticari">Ticari</option>
                      <option value="Aile Ziyareti">Aile Ziyareti</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
                  <Calendar size={14} className="text-slate-400" />
                  <div className="flex items-center gap-1">
                    <input 
                      type="date" 
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="bg-transparent text-[10px] font-bold outline-none text-slate-700 cursor-pointer w-24"
                    />
                    <span className="text-slate-400">-</span>
                    <input 
                      type="date" 
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="bg-transparent text-[10px] font-bold outline-none text-slate-700 cursor-pointer w-24"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Search Bar Below */}
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="İsim veya Takip Kodu ile ara..." 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    {user?.role === 'admin' && (
                      <th className="px-6 py-4 font-semibold w-10">
                        <div className="flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                            checked={filteredApplicants.length > 0 && selectedApplicantIds.length === filteredApplicants.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedApplicantIds(filteredApplicants.map(a => a.takipKodu));
                              } else {
                                setSelectedApplicantIds([]);
                              }
                            }}
                          />
                        </div>
                      </th>
                    )}
                    <th className="px-6 py-4 font-semibold">Takip Kodu</th>
                    <th 
                      onClick={() => handleSort('ad')}
                      className="px-6 py-4 font-semibold cursor-pointer hover:bg-slate-100 select-none group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Ad Soyad</span>
                        <ArrowUpDown 
                          size={14} 
                          className={`transition-colors ${
                            applicantSortField === 'ad' 
                              ? 'text-brand-600 font-bold' 
                              : 'text-slate-300 group-hover:text-slate-500'
                          }`} 
                        />
                        {applicantSortField === 'ad' && (
                          <span className="text-[10px] text-brand-500 font-bold lowercase">
                            ({applicantSortOrder === 'asc' ? 'a-z' : 'z-a'})
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('ulke')}
                      className="px-6 py-4 font-semibold cursor-pointer hover:bg-slate-100 select-none group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Ülke</span>
                        <ArrowUpDown 
                          size={14} 
                          className={`transition-colors ${
                            applicantSortField === 'ulke' 
                              ? 'text-brand-600 font-bold' 
                              : 'text-slate-300 group-hover:text-slate-500'
                          }`} 
                        />
                        {applicantSortField === 'ulke' && (
                          <span className="text-[10px] text-brand-500 font-bold lowercase">
                            ({applicantSortOrder === 'asc' ? 'a-z' : 'z-a'})
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('islemDurumu')}
                      className="px-6 py-4 font-semibold cursor-pointer hover:bg-slate-100 select-none group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Durum</span>
                        <ArrowUpDown 
                          size={14} 
                          className={`transition-colors ${
                            applicantSortField === 'islemDurumu' 
                              ? 'text-brand-600 font-bold' 
                              : 'text-slate-300 group-hover:text-slate-500'
                          }`} 
                        />
                        {applicantSortField === 'islemDurumu' && (
                          <span className="text-[10px] text-brand-500 font-bold lowercase">
                            ({applicantSortOrder === 'asc' ? 'a-z' : 'z-a'})
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('randevuTarihi')}
                      className="px-6 py-4 font-semibold cursor-pointer hover:bg-slate-100 select-none group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Randevu</span>
                        <ArrowUpDown 
                          size={14} 
                          className={`transition-colors ${
                            applicantSortField === 'randevuTarihi' 
                              ? 'text-brand-600 font-bold' 
                              : 'text-slate-300 group-hover:text-slate-500'
                          }`} 
                        />
                        {applicantSortField === 'randevuTarihi' && (
                          <span className="text-[10px] text-brand-500 font-bold lowercase">
                            ({applicantSortOrder === 'asc' ? 'eski-yeni' : 'yeni-eski'})
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 font-semibold">Tutar</th>
                    <th className="px-6 py-4 font-semibold">Ödeme</th>
                    <th className="px-6 py-4 font-semibold text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApplicants.map(a => (
                    <tr key={a.takipKodu} className={`hover:bg-slate-50 transition-colors ${selectedApplicantIds.includes(a.takipKodu) ? 'bg-brand-50/50' : ''}`}>
                      {user?.role === 'admin' && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                              checked={selectedApplicantIds.includes(a.takipKodu)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedApplicantIds(prev => [...prev, a.takipKodu]);
                                } else {
                                  setSelectedApplicantIds(prev => prev.filter(id => id !== a.takipKodu));
                                }
                              }}
                            />
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 font-mono text-xs font-bold text-brand-600">{a.takipKodu}</td>
                      <td className="px-6 py-4 font-medium">{a.ad} {a.soyad}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-700">{a.ulke}</span>
                          {a.basvuruMerkezi && (
                            <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                              {getCityFromCenter(a.basvuruMerkezi)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase whitespace-nowrap inline-block ${
                          a.islemDurumu === 'Tamamlandı' ? 'bg-emerald-100 text-emerald-700' :
                          a.islemDurumu === 'Talep Bekliyor' ? 'bg-amber-100 text-amber-700' :
                          'bg-brand-100 text-brand-700'
                        }`}>
                          {a.islemDurumu}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-700">{formatDate(a.randevuTarihi)}</span>
                          {a.saat && (
                            <span className="text-[10px] font-medium text-brand-600 bg-brand-50 dark:bg-brand-950/40 px-1.5 py-0.5 rounded self-start mt-0.5">
                              {a.saat}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const acc = accounting.find(r => r.takipKodu === a.takipKodu);
                          if (acc) {
                            return (
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-emerald-600 whitespace-nowrap">
                                  {acc.toplam.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {getCurrencySymbol(acc.currency, acc.ulke)}
                                </span>
                                <span className="text-[9px] text-slate-400 uppercase font-bold">FATURALANDI</span>
                              </div>
                            );
                          }
                          if (a.fiyat !== undefined && a.fiyat > 0) {
                            return (
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-700 whitespace-nowrap">
                                  {a.fiyat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {getCurrencySymbol(a.currency)}
                                </span>
                                <span className="text-[9px] text-slate-400 uppercase font-bold">BEKLENEN</span>
                              </div>
                            );
                          }
                          const price = prices.find(p => p.ulke === a.ulke);
                          if (price) {
                            return (
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-700 whitespace-nowrap">
                                  {price.toplam.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {getCurrencySymbol(price.currency)}
                                </span>
                                <span className="text-[9px] text-slate-400 uppercase font-bold">BEKLENEN</span>
                              </div>
                            );
                          }
                          return <span className="text-slate-400">-</span>;
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold ${a.odemeDurumu === 'Ödendi' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {a.odemeDurumu}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => {
                              setSelectedApplicant(a);
                              setShowProformaModal(true);
                            }}
                            className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-all flex items-center gap-1.5 text-xs font-extrabold shadow-sm"
                            title="Proforma Fatura Görüntüle / Indir"
                          >
                            <FileText size={15} />
                            <span>Proforma</span>
                          </button>
                          {user?.role === 'admin' && (
                            <button 
                              onClick={() => {
                                setSelectedApplicant(a);
                                setShowAccountingForm(true);
                              }}
                              className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                              title="Muhasebe Kaydı Oluştur"
                            >
                              <Wallet size={16} />
                            </button>
                          )}
                          {user?.role === 'admin' && a.randevuTarihi && (
                            <button 
                              onClick={() => handleSendManualReminder(a.takipKodu)}
                              className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                              title="Hatırlatma E-postası Gönder"
                            >
                              <Mail size={16} />
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              setSelectedApplicant(a);
                              setShowApplicantCard(true);
                            }}
                            className="p-2 bg-brand-50 text-brand-600 hover:bg-brand-100 rounded-lg transition-colors"
                            title="Müşteri Kartı"
                          >
                            <UserIcon size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedApplicant(a);
                              setShowApplicantForm(true);
                            }}
                            className="p-2 bg-brand-50 text-brand-600 hover:bg-brand-100 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <Edit size={16} />
                          </button>
                          {user?.role === 'admin' && (
                            <button 
                              onClick={() => handleDeleteApplicant(a.takipKodu)}
                              className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                              title="Sil"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'accounting':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard label="Toplam Fatura" value={accounting.length} icon={FileText} color="bg-brand-500" darkMode={darkMode} />
              <StatCard label="Tahsil Edilen" value={formatTotalCollection(totalCollectionByCurrency)} icon={CheckCircle2} color="bg-emerald-500" darkMode={darkMode} />
              <StatCard label="Bekleyen Ödeme" value={`${applicants.filter(a => a.odemeDurumu === 'Ödenmedi').length} Kayıt`} icon={AlertCircle} color="bg-rose-500" darkMode={darkMode} />
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold">Muhasebe Kayıtları</h3>
                <button 
                  onClick={fetchData}
                  className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 bg-brand-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  YENİLE
                </button>
                {user?.role === 'admin' && (
                  <button 
                    onClick={() => setShowFinancialSummary(true)}
                    className="text-xs font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <TrendingUp size={14} />
                    FİNANSAL ÖZET
                  </button>
                )}
                <button 
                  onClick={() => {
                    const exportData = accounting.map(a => ({
                      'Fatura No': a.faturaNo,
                      'Müşteri': a.adSoyad,
                      'Ülke': a.ulke,
                      'İşlem Durumu': a.islemDurumu,
                      'Net Tutar': a.netTutar,
                      'KDV': a.kdv,
                      'Toplam': a.toplam,
                      'Para Birimi': a.currency || 'TRY',
                      'Tarih': a.faturaTarihi,
                      'Pasaport No': a.pasaportNo,
                      'Firma': a.firma
                    }));
                    exportToExcel(exportData, 'Muhasebe_Kayitlari');
                  }}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Download size={14} />
                  EXCEL'E AKTAR
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-semibold">Fatura No</th>
                      <th className="px-6 py-4 font-semibold">Müşteri</th>
                      <th className="px-6 py-4 font-semibold">Ülke</th>
                      <th className="px-6 py-4 font-semibold">Tutar</th>
                      <th className="px-6 py-4 font-semibold">KDV</th>
                      <th className="px-6 py-4 font-semibold">Toplam</th>
                      <th className="px-6 py-4 font-semibold">Tarih</th>
                      <th className="px-6 py-4 font-semibold text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {accounting.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-bold">{a.faturaNo || '-'}</td>
                        <td className="px-6 py-4 font-medium">{a.adSoyad}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{a.ulke}</td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">{a.netTutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {getCurrencySymbol(a.currency, a.ulke)}</td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">{a.kdv.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {getCurrencySymbol(a.currency, a.ulke)}</td>
                        <td className="px-6 py-4 font-bold text-brand-600 whitespace-nowrap">{a.toplam.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {getCurrencySymbol(a.currency, a.ulke)}</td>
                        <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{a.faturaTarihi || '-'}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => {
                                let applicant = applicants.find(app => app.takipKodu === a.takipKodu);
                                if (!applicant) {
                                  const parts = (a.adSoyad || '').split(' ');
                                  applicant = {
                                    takipKodu: a.takipKodu,
                                    ad: parts[0] || '',
                                    soyad: parts.slice(1).join(' ') || '',
                                    dogumTarihi: '',
                                    ulke: a.ulke,
                                    islemDurumu: a.islemDurumu as any,
                                    randevuTarihi: a.randevuBilgisi,
                                    saat: '',
                                    odemeDurumu: a.odemeDurumu as any,
                                    pasaportNo: a.pasaportNo,
                                    notlar: '',
                                    pasaportSkt: '',
                                    email: '',
                                    kayitTarihi: a.kayitTarihi,
                                    vizeSonucu: '',
                                    vizeGecerlilikTarihi: '',
                                    firmaAdi: a.firma
                                  };
                                }
                                setSelectedApplicant(applicant);
                                setShowProformaModal(true);
                              }}
                              className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-all flex items-center gap-1.5 font-extrabold text-xs shadow-sm"
                              title="Proforma Fatura Görüntüle"
                            >
                              <FileText size={15} />
                              <span>Proforma Fatura</span>
                            </button>
                            <button 
                              onClick={() => generateAccountingPdf(a)}
                              className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                              title="PDF İndir"
                            >
                              <FileDown size={16} />
                            </button>
                            <button 
                              onClick={() => {
                                const applicant = applicants.find(app => app.takipKodu === a.takipKodu);
                                if (applicant) {
                                  setSelectedApplicant(applicant);
                                  setShowAccountingForm(true);
                                }
                              }}
                              className="p-2 bg-brand-50 text-brand-600 hover:bg-brand-100 rounded-lg transition-colors"
                              title="Düzenle"
                            >
                              <Edit size={16} />
                            </button>
                            {user?.role === 'admin' && (
                              <button 
                                onClick={() => a.id && handleDeleteAccounting(a.id)}
                                className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                                title="Sil"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'prices':
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-fit">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold">Ülke Bazlı Fiyat Listesi</h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      const exportData = prices.map(p => ({
                        'Ülke': p.ulke,
                        'Konsolosluk Ücreti': p.konsoloslukUcreti,
                        'Hizmet Bedeli': p.hizmetBedeli,
                        'KDV': p.kdv,
                        'Toplam': p.toplam,
                        'Para Birimi': p.currency || 'TRY'
                      }));
                      exportToExcel(exportData, 'Fiyat_Listesi');
                    }}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Download size={14} />
                    EXCEL'E AKTAR
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedPrice(null);
                      setShowPriceForm(true);
                    }}
                    className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
                  >
                    <PlusCircle size={18} />
                    YENİ FİYAT EKLE
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-semibold">Ülke</th>
                      <th className="px-6 py-4 font-semibold">Kur</th>
                      <th className="px-6 py-4 font-semibold">Konsolosluk Ücreti</th>
                      <th className="px-6 py-4 font-semibold">Hizmet Bedeli</th>
                      <th className="px-6 py-4 font-semibold">KDV</th>
                      <th className="px-6 py-4 font-semibold">Toplam</th>
                      <th className="px-6 py-4 font-semibold text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {prices.length > 0 ? prices.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold">{p.ulke}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md">
                            {p.currency || 'TRY'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">{p.konsoloslukUcreti.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {p.currency === 'TRY' || !p.currency ? '₺' : getCurrencySymbol(p.currency)}</td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">{p.hizmetBedeli.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {p.currency === 'TRY' || !p.currency ? '₺' : getCurrencySymbol(p.currency)}</td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">{p.kdv.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {p.currency === 'TRY' || !p.currency ? '₺' : getCurrencySymbol(p.currency)}</td>
                        <td className="px-6 py-4 font-bold text-brand-600 whitespace-nowrap">{p.toplam.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {p.currency === 'TRY' || !p.currency ? '₺' : getCurrencySymbol(p.currency)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => {
                                setSelectedPrice(p);
                                setShowPriceForm(true);
                              }}
                              className="p-2 bg-brand-50 text-brand-600 hover:bg-brand-100 rounded-lg transition-colors"
                              title="Düzenle"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => p.id && handleDeletePrice(p.id)}
                              className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                              title="Sil"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-slate-400">Henüz fiyat tanımlanmamış.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-fit max-w-2xl">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold">Ülke Yönetimi</h3>
                <p className="text-xs text-slate-500">Sistemdeki aktif ülkeleri yönetin.</p>
              </div>
              <div className="p-6 space-y-4">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.currentTarget.elements.namedItem('countryName') as HTMLInputElement;
                    handleSaveCountry(input.value);
                    input.value = '';
                  }}
                  className="flex gap-2"
                >
                  <input 
                    name="countryName"
                    type="text" 
                    placeholder="Yeni Ülke Adı..." 
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                  <button type="submit" className="p-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors">
                    <PlusCircle size={20} />
                  </button>
                </form>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {countries.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                      <span className="text-sm font-medium text-slate-700">{c.name}</span>
                      <button 
                        onClick={() => handleDeleteCountry(c.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'reports': {
        return (
          <div className="space-y-8">
            {/* Üst Kontrol Paneli */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="flex-1 md:w-48 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Yıl Seçimi</label>
                    <select 
                      value={reportYear}
                      onChange={(e) => setReportYear(Number(e.target.value))}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-brand-500 transition-all"
                    >
                      {[2023, 2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="flex-1 md:w-56 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Ülke Seçimi</label>
                    <select 
                      value={reportCountry}
                      onChange={(e) => setReportCountry(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer"
                    >
                      <option value="Tümü">🌏 Tüm Ülkeler</option>
                      {countries.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => {
                      const exportData = filteredYearReportApplicants.map(a => ({
                        'Ad Soyad': `${a.ad} ${a.soyad}`,
                        'Ülke': a.ulke,
                        'Durum': a.islemDurumu,
                        'Kayıt Tarihi': a.kayitTarihi ? formatDate(a.kayitTarihi) : '-',
                        'Randevu Tarihi': a.randevuTarihi || '-',
                        'Ödeme': a.odemeDurumu,
                        'Takip Kodu': a.takipKodu
                      }));
                      exportToExcel(exportData, `MKM_Rapor_${formatDate(new Date())}`);
                    }}
                    className="flex-1 md:flex-none bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
                  >
                    <FileDown size={18} />
                    EXCEL'E AKTAR
                  </button>
                </div>
              </div>
            </div>

            {/* Yıllık Prim Özeti */}
            {(user?.role === 'admin' || settings?.show_commissions_to_users === 1) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-brand-600 p-6 rounded-3xl text-white shadow-xl shadow-brand-200 relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Yıllık Toplam Kayıt</p>
                    <h4 className="text-4xl font-black">
                      {totalYearlyGeneralApps}
                    </h4>
                    <p className="text-[10px] font-bold mt-2 opacity-80 uppercase">TOPLAM KAYIT ADEDİ</p>
                  </div>
                  <TrendingUp className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 rotate-12" />
                </div>
                
                {/* Yıllık Personel Primi Hesabı */}
                <div className="bg-emerald-600 p-6 rounded-3xl text-white shadow-xl shadow-emerald-200 relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Yıllık Personel Primi</p>
                    <h4 className="text-4xl font-black">
                      {totalYearlyCommission.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      <span className="text-sm ml-1 opacity-70">€</span>
                    </h4>
                    <p className="text-[10px] font-bold mt-2 opacity-80 uppercase">TOPLAM PERSONEL HAKEDİŞİ</p>
                  </div>
                  <Calculator className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 rotate-12" />
                </div>
              </div>
            )}

            {/* Grafikler */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-lg">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="text-brand-600" size={16} />
                  Ülke Bazlı Başvuru Dağılımı
                </h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart data={countryChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 10 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 10 }}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#f8fafc' }}
                      />
                      <Bar dataKey="count" name="Başvuru Sayısı" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </ReBarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-lg">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <Activity className="text-emerald-600" size={16} />
                  Aylık Başvuru Trendi
                </h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReLineChart data={trendChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 10 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 10 }}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        name="Başvuru Sayısı" 
                        stroke="#10b981" 
                        strokeWidth={3} 
                        dot={{ r: 3, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                      />
                    </ReLineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-lg">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <Wallet className="text-brand-600" size={16} />
                  Aylık Prim Kazanç Dağılımı (€)
                </h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart data={commissionTrendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 10 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 10 }}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`${value.toLocaleString('tr-TR')} €`, 'Prim Kazancı']}
                      />
                      <Bar dataKey="commission" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </ReBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Yıllık Değişim Grafiği (BarChart) */}
            <div className={`${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-800'} p-6 rounded-3xl border shadow-lg space-y-4`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-150/80">
                <div>
                  <h3 className={`text-base font-black ${darkMode ? 'text-white' : 'text-slate-800'} flex items-center gap-2 uppercase tracking-tight`}>
                    <BarChart className="text-brand-600 dark:text-brand-400" size={20} />
                    Yıllık Değişim Grafiği
                  </h3>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} font-semibold mt-1`}>
                    Seçilen yıl <span className="text-brand-600 font-black">({reportYear})</span> ile bir önceki yılın <span className="text-brand-600 font-black">({reportYear - 1})</span> aylık başvuru hacimlerinin karşılaştırmalı dağılımı.
                  </p>
                </div>
              </div>

              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={yearlyComparisonChartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#334155" : "#f1f5f9"} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 10 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 10 }}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const currentYearVal = reportYear;
                          const prevYearVal = reportYear - 1;
                          return (
                            <div className={`${darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'} p-4 rounded-2xl border shadow-xl space-y-2`}>
                              <p className="font-extrabold text-xs text-brand-600 dark:text-brand-400">{label}</p>
                              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-xs">
                                <div>
                                  <p className="font-black text-slate-400 uppercase tracking-widest text-[9px]">{prevYearVal} Yılı</p>
                                  <p className={`font-bold text-sm mt-0.5 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Toplam: <span className="font-black">{data[prevYearVal]}</span></p>
                                  <p className="text-emerald-505 font-semibold">Onaylanan: {data.prevApproved}</p>
                                  <p className="text-rose-505 font-semibold">Reddedilen: {data.prevRejected}</p>
                                  <p className="text-amber-505 font-semibold">İşlemde: {data.prevInProgress}</p>
                                </div>
                                <div className={`border-l pl-4 ${darkMode ? 'border-slate-700' : 'border-slate-150'}`}>
                                  <p className="font-black text-slate-400 uppercase tracking-widest text-[9px]">{currentYearVal} Yılı</p>
                                  <p className={`font-bold text-sm mt-0.5 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Toplam: <span className="font-black">{data[currentYearVal]}</span></p>
                                  <p className="text-emerald-505 font-semibold">Onaylanan: {data.currentApproved}</p>
                                  <p className="text-rose-505 font-semibold">Reddedilen: {data.currentRejected}</p>
                                  <p className="text-amber-505 font-semibold">İşlemde: {data.currentInProgress}</p>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36} 
                      iconType="circle"
                      wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                    />
                    <Bar dataKey={reportYear - 1} name={`${reportYear - 1} Yılı Üye/Müşteri Başvuruları`} fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    <Bar dataKey={reportYear} name={`${reportYear} Yılı Üye/Müşteri Başvuruları`} fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Karşılaştırmalı Özet Tablo */}
            {(() => {
              const prevYear = reportYear - 1;
              const compData = months.map((monthName, index) => {
                const indexStr = (index + 1).toString().padStart(2, '0');
                const mKeyCurrent = `${reportYear}-${indexStr}`;
                const mKeyPrev = `${prevYear}-${indexStr}`;
                
                // Get month's applicants for current year (already filtered by reportCountry)
                const monthlyAppsCurrent = countryFilteredApplicants.filter(a => {
                  const { reportMonthKey } = getReportMonthKey(a);
                  return reportMonthKey === mKeyCurrent;
                });

                // Get month's applicants for previous year (already filtered by reportCountry)
                const monthlyAppsPrev = countryFilteredApplicants.filter(a => {
                  const { reportMonthKey } = getReportMonthKey(a);
                  return reportMonthKey === mKeyPrev;
                });
                
                const approvedCurrent = monthlyAppsCurrent.filter(a => a.vizeSonucu === 'Onaylandı').length;
                const rejectedCurrent = monthlyAppsCurrent.filter(a => a.vizeSonucu === 'Red').length;
                const inProgressCurrent = monthlyAppsCurrent.filter(a => a.islemDurumu === 'İşlemde').length;
                const totalCurrent = monthlyAppsCurrent.length;

                const approvedPrev = monthlyAppsPrev.filter(a => a.vizeSonucu === 'Onaylandı').length;
                const rejectedPrev = monthlyAppsPrev.filter(a => a.vizeSonucu === 'Red').length;
                const inProgressPrev = monthlyAppsPrev.filter(a => a.islemDurumu === 'İşlemde').length;
                const totalPrev = monthlyAppsPrev.length;
                
                return {
                  monthName,
                  approved: approvedCurrent,
                  rejected: rejectedCurrent,
                  inProgress: inProgressCurrent,
                  total: totalCurrent,
                  prevApproved: approvedPrev,
                  prevRejected: rejectedPrev,
                  prevInProgress: inProgressPrev,
                  prevTotal: totalPrev
                };
              });

              // Totals
              const totalApproved = compData.reduce((sum, d) => sum + d.approved, 0);
              const totalRejected = compData.reduce((sum, d) => sum + d.rejected, 0);
              const totalInProgress = compData.reduce((sum, d) => sum + d.inProgress, 0);
              const grandTotal = compData.reduce((sum, d) => sum + d.total, 0);

              const prevTotalApproved = compData.reduce((sum, d) => sum + d.prevApproved, 0);
              const prevTotalRejected = compData.reduce((sum, d) => sum + d.prevRejected, 0);
              const prevTotalInProgress = compData.reduce((sum, d) => sum + d.prevInProgress, 0);
              const prevGrandTotal = compData.reduce((sum, d) => sum + d.prevTotal, 0);

              const selectedCountryLabel = reportCountry === 'Tümü' ? 'Tüm Ülkeler' : reportCountry;

              const calculatePercentageChange = (current: number, previous: number) => {
                if (previous === 0) {
                  if (current === 0) return { text: '%0', val: 0 };
                  return { text: '+%100', val: 100 };
                }
                const diff = current - previous;
                const pct = Math.round((diff / previous) * 100);
                if (pct > 0) {
                  return { text: `+%${pct}`, val: pct };
                } else if (pct < 0) {
                  return { text: `-%${Math.abs(pct)}`, val: pct };
                } else {
                  return { text: '%0', val: 0 };
                }
              };

              const renderComparisonCell = (
                currentVal: number, 
                previousVal: number, 
                type: 'approved' | 'rejected' | 'in_progress' | 'total', 
                monthName: string, 
                monthIdx?: number
              ) => {
                const diffInfo = calculatePercentageChange(currentVal, previousVal);

                const handlePrevClick = () => {
                  if (previousVal === 0) return;
                  const yearVal = reportYear - 1;
                  let filtered = countryFilteredApplicants.filter(a => {
                    const { reportMonthKey } = getReportMonthKey(a);
                    if (monthIdx !== undefined) {
                      return reportMonthKey === `${yearVal}-${(monthIdx + 1).toString().padStart(2, '0')}`;
                    } else {
                      return reportMonthKey && reportMonthKey.startsWith(`${yearVal}-`);
                    }
                  });
                  
                  let statusLabel = '';
                  if (type === 'approved') {
                    filtered = filtered.filter(a => a.vizeSonucu === 'Onaylandı');
                    statusLabel = 'Onaylanan Başvurular';
                  } else if (type === 'rejected') {
                    filtered = filtered.filter(a => a.vizeSonucu === 'Red');
                    statusLabel = 'Reddedilen Başvurular';
                  } else if (type === 'in_progress') {
                    filtered = filtered.filter(a => a.islemDurumu === 'İşlemde');
                    statusLabel = 'İşlemde Olan Başvurular';
                  } else {
                    statusLabel = 'Toplam Başvurular';
                  }

                  setReportDetailModal({
                    title: `${monthName} ${yearVal} - ${statusLabel}`,
                    status: type === 'approved' ? 'Onaylandı' : type === 'rejected' ? 'Red' : type === 'in_progress' ? 'İşlemde' : 'Tümü',
                    applicants: filtered
                  });
                };

                const handleCurrentClick = () => {
                  if (currentVal === 0) return;
                  const yearVal = reportYear;
                  let filtered = countryFilteredApplicants.filter(a => {
                    const { reportMonthKey } = getReportMonthKey(a);
                    if (monthIdx !== undefined) {
                      return reportMonthKey === `${yearVal}-${(monthIdx + 1).toString().padStart(2, '0')}`;
                    } else {
                      return reportMonthKey && reportMonthKey.startsWith(`${yearVal}-`);
                    }
                  });
                  
                  let statusLabel = '';
                  if (type === 'approved') {
                    filtered = filtered.filter(a => a.vizeSonucu === 'Onaylandı');
                    statusLabel = 'Onaylanan Başvurular';
                  } else if (type === 'rejected') {
                    filtered = filtered.filter(a => a.vizeSonucu === 'Red');
                    statusLabel = 'Reddedilen Başvurular';
                  } else if (type === 'in_progress') {
                    filtered = filtered.filter(a => a.islemDurumu === 'İşlemde');
                    statusLabel = 'İşlemde Olan Başvurular';
                  } else {
                    statusLabel = 'Toplam Başvurular';
                  }

                  setReportDetailModal({
                    title: `${monthName} ${yearVal} - ${statusLabel}`,
                    status: type === 'approved' ? 'Onaylandı' : type === 'rejected' ? 'Red' : type === 'in_progress' ? 'İşlemde' : 'Tümü',
                    applicants: filtered
                  });
                };

                return (
                  <div className="flex flex-col items-center justify-center py-1">
                    <div className="flex items-center gap-2 font-medium">
                      <span 
                        onClick={handlePrevClick}
                        className={`text-slate-400 dark:text-slate-500 text-xs line-through ${previousVal > 0 ? 'cursor-pointer hover:text-brand-600 dark:hover:text-brand-400 hover:scale-105 active:scale-95 transition-all' : ''}`} 
                        title={`${prevYear} yılı (Detaylar için tıklayın)`}
                      >
                        {previousVal}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">➔</span>
                      <span 
                        onClick={handleCurrentClick}
                        className={`text-sm font-extrabold ${darkMode ? 'text-slate-100 hover:text-brand-400' : 'text-slate-800 hover:text-brand-600'} ${currentVal > 0 ? 'cursor-pointer hover:scale-105 active:scale-95 transition-all' : ''}`} 
                        title={`${reportYear} yılı (Detaylar için tıklayın)`}
                      >
                        {currentVal}
                      </span>
                    </div>
                    <div className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md mt-1 flex items-center gap-0.5 ${
                      diffInfo.val > 0 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : diffInfo.val < 0 
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' 
                          : 'bg-slate-500/10 text-slate-500 dark:text-slate-400'
                    }`}>
                      {diffInfo.val > 0 ? '↑' : diffInfo.val < 0 ? '↓' : ''} {diffInfo.text}
                    </div>
                  </div>
                );
              };

              return (
                <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-6 rounded-3xl border shadow-lg space-y-6`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-150/80">
                    <div>
                      <h3 className={`text-base font-black ${darkMode ? 'text-white' : 'text-slate-800'} flex items-center gap-2 uppercase tracking-tight`}>
                        <ClipboardList className="text-brand-600 animate-pulse" size={18} />
                        Vize Sonuçları Karşılaştırma Özet Tablosu
                      </h3>
                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} font-semibold mt-1`}>
                        {reportTableMode === 'monthly' ? (
                          <>
                            <span className="text-brand-600 font-bold">{reportYear}</span> yılı <span className="text-brand-600 font-bold">({selectedCountryLabel})</span> başvuru sonuçlarının karşılaştırmalı dökümü.
                          </>
                        ) : (
                          <>
                            <span className="text-brand-600 font-bold">{reportYear}</span> ile <span className="text-brand-600 font-bold">{prevYear}</span> yılları <span className="text-brand-600 font-bold">({selectedCountryLabel})</span> vize sonuçlarının yıllık karşılaştırması ve yüzde değişimi.
                          </>
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Görünüm Değiştirici */}
                      <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800">
                        <button
                          onClick={() => setReportTableMode('monthly')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            reportTableMode === 'monthly'
                              ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                          }`}
                        >
                          Aylık Dağılım
                        </button>
                        <button
                          onClick={() => setReportTableMode('yearly_comparison')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            reportTableMode === 'yearly_comparison'
                              ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                          }`}
                        >
                          Yıllık Karşılaştırma
                        </button>
                      </div>

                      {reportTableMode === 'monthly' ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <div className="px-3 py-1 bg-emerald-500/15 text-emerald-600 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-emerald-500/20">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Onay: {totalApproved}
                          </div>
                          <div className="px-3 py-1 bg-rose-500/15 text-rose-600 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-rose-500/20">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            Red: {totalRejected}
                          </div>
                          <div className="px-3 py-1 bg-amber-500/15 text-amber-600 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-amber-500/20">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            İşlemde: {totalInProgress}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <div className="px-3 py-1 bg-emerald-500/15 text-emerald-600 rounded-lg text-xs font-bold flex items-center gap-1 border border-emerald-500/20">
                            <span>{prevTotalApproved}</span>
                            <span>➔</span>
                            <span className="font-extrabold">{totalApproved}</span>
                          </div>
                          <div className="px-3 py-1 bg-rose-500/15 text-rose-600 rounded-lg text-xs font-bold flex items-center gap-1 border border-rose-500/20">
                            <span>{prevTotalRejected}</span>
                            <span>➔</span>
                            <span className="font-extrabold">{totalRejected}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-150 dark:border-slate-700">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className={`${darkMode ? 'bg-slate-900/60 text-slate-300' : 'bg-slate-50/80 text-slate-600'} text-xs font-bold uppercase border-b border-slate-150 dark:border-slate-700`}>
                          <th className="px-6 py-4">Dönem / Ay</th>
                          {reportTableMode === 'monthly' ? (
                            <>
                              <th className="px-6 py-4 text-center">Onaylanan Başvurular</th>
                              <th className="px-6 py-4 text-center">Reddedilen Başvurular</th>
                              <th className="px-6 py-4 text-center">İşlemde Olan Başvurular</th>
                              <th className="px-6 py-4 text-right">Toplam Başvuru</th>
                            </>
                          ) : (
                            <>
                              <th className="px-6 py-4 text-center">Onaylanan ({prevYear} ➔ {reportYear})</th>
                              <th className="px-6 py-4 text-center">Reddedilen ({prevYear} ➔ {reportYear})</th>
                              <th className="px-6 py-4 text-center">İşlemde ({prevYear} ➔ {reportYear})</th>
                              <th className="px-6 py-4 text-right">Toplam ({prevYear} ➔ {reportYear})</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                        {compData.map((row, idx) => (
                          <tr 
                            key={idx} 
                            className={`transition-colors ${
                              (row.approved > 0 || row.rejected > 0 || row.inProgress > 0 || row.prevApproved > 0 || row.prevRejected > 0 || row.prevInProgress > 0)
                                ? `${darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-brand-50/20'}`
                                : 'opacity-65'
                            }`}
                          >
                            <td className={`px-6 py-3.5 font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                              {row.monthName}
                            </td>
                            {reportTableMode === 'monthly' ? (
                              <>
                                <td className="px-6 py-3.5 text-center">
                                  {row.approved > 0 ? (
                                    <span 
                                      onClick={() => {
                                        const monthlyApps = countryFilteredApplicants.filter(a => {
                                          const { reportMonthKey } = getReportMonthKey(a);
                                          return reportMonthKey === `${reportYear}-${(idx + 1).toString().padStart(2, '0')}`;
                                        });
                                        setReportDetailModal({
                                          title: `${row.monthName} ${reportYear} - Onaylanan Başvurular`,
                                          status: 'Onaylandı',
                                          applicants: monthlyApps.filter(a => a.vizeSonucu === 'Onaylandı')
                                        });
                                      }}
                                      className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 min-w-[40px] cursor-pointer hover:bg-emerald-200 dark:hover:bg-emerald-900 hover:scale-110 active:scale-95 transition-all"
                                      title="Detayları görmek için tıklayın"
                                    >
                                      {row.approved}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300 dark:text-slate-600">-</span>
                                  )}
                                </td>
                                <td className="px-6 py-3.5 text-center">
                                  {row.rejected > 0 ? (
                                    <span 
                                      onClick={() => {
                                        const monthlyApps = countryFilteredApplicants.filter(a => {
                                          const { reportMonthKey } = getReportMonthKey(a);
                                          return reportMonthKey === `${reportYear}-${(idx + 1).toString().padStart(2, '0')}`;
                                        });
                                        setReportDetailModal({
                                          title: `${row.monthName} ${reportYear} - Reddedilen Başvurular`,
                                          status: 'Red',
                                          applicants: monthlyApps.filter(a => a.vizeSonucu === 'Red')
                                        });
                                      }}
                                      className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 min-w-[40px] cursor-pointer hover:bg-rose-200 dark:hover:bg-rose-900 hover:scale-110 active:scale-95 transition-all"
                                      title="Detayları görmek için tıklayın"
                                    >
                                      {row.rejected}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300 dark:text-slate-600">-</span>
                                  )}
                                </td>
                                <td className="px-6 py-3.5 text-center">
                                  {row.inProgress > 0 ? (
                                    <span 
                                      onClick={() => {
                                        const monthlyApps = countryFilteredApplicants.filter(a => {
                                          const { reportMonthKey } = getReportMonthKey(a);
                                          return reportMonthKey === `${reportYear}-${(idx + 1).toString().padStart(2, '0')}`;
                                        });
                                        setReportDetailModal({
                                          title: `${row.monthName} ${reportYear} - İşlemde Olan Başvurular`,
                                          status: 'İşlemde',
                                          applicants: monthlyApps.filter(a => a.islemDurumu === 'İşlemde')
                                        });
                                      }}
                                      className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 min-w-[40px] cursor-pointer hover:bg-amber-200 dark:hover:bg-amber-900 hover:scale-110 active:scale-95 transition-all"
                                      title="Detayları görmek için tıklayın"
                                    >
                                      {row.inProgress}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300 dark:text-slate-600">-</span>
                                  )}
                                </td>
                                <td className={`px-6 py-3.5 text-right font-black ${darkMode ? 'text-slate-350' : 'text-slate-800'}`}>
                                  {row.total > 0 ? (
                                    <span 
                                      onClick={() => {
                                        const monthlyApps = countryFilteredApplicants.filter(a => {
                                          const { reportMonthKey } = getReportMonthKey(a);
                                          return reportMonthKey === `${reportYear}-${(idx + 1).toString().padStart(2, '0')}`;
                                        });
                                        setReportDetailModal({
                                          title: `${row.monthName} ${reportYear} - Toplam Başvurular`,
                                          status: 'Tümü',
                                          applicants: monthlyApps
                                        });
                                      }}
                                      className="text-brand-600 font-extrabold cursor-pointer hover:underline transition-all hover:scale-105 inline-block"
                                      title="Tüm liste detaylarını gör"
                                    >
                                      {row.total}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300 dark:text-slate-600">-</span>
                                  )}
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-6 py-3.5 text-center">
                                  {renderComparisonCell(row.approved, row.prevApproved, 'approved', row.monthName, idx)}
                                </td>
                                <td className="px-6 py-3.5 text-center">
                                  {renderComparisonCell(row.rejected, row.prevRejected, 'rejected', row.monthName, idx)}
                                </td>
                                <td className="px-6 py-3.5 text-center">
                                  {renderComparisonCell(row.inProgress, row.prevInProgress, 'in_progress', row.monthName, idx)}
                                </td>
                                <td className="px-6 py-3.5 text-right">
                                  {renderComparisonCell(row.total, row.prevTotal, 'total', row.monthName, idx)}
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                        {/* Genel Toplam Satırı */}
                        <tr className={`${darkMode ? 'bg-slate-900/80 text-slate-100' : 'bg-slate-100/50 text-slate-950'} font-bold border-t-2 border-slate-200 dark:border-slate-600 text-xs uppercase`}>
                          <th className="px-6 py-4 rounded-bl-2xl text-left">Yıllık Genel Toplam</th>
                          {reportTableMode === 'monthly' ? (
                            <>
                              <th className="px-6 py-4 text-center">
                                <span 
                                  onClick={() => {
                                    const yearApps = countryFilteredApplicants.filter(a => {
                                      const { reportMonthKey } = getReportMonthKey(a);
                                      return reportMonthKey && reportMonthKey.startsWith(`${reportYear}-`);
                                    });
                                    setReportDetailModal({
                                      title: `Yıllık Genel Toplam (${reportYear}) - Onaylanan Başvurular`,
                                      status: 'Onaylandı',
                                      applicants: yearApps.filter(a => a.vizeSonucu === 'Onaylandı')
                                    });
                                  }}
                                  className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl text-xs font-black bg-emerald-600 text-white shadow-sm min-w-[50px] cursor-pointer hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all"
                                  title="Detayları görmek için tıklayın"
                                >
                                  {totalApproved}
                                </span>
                              </th>
                              <th className="px-6 py-4 text-center">
                                <span 
                                  onClick={() => {
                                    const yearApps = countryFilteredApplicants.filter(a => {
                                      const { reportMonthKey } = getReportMonthKey(a);
                                      return reportMonthKey && reportMonthKey.startsWith(`${reportYear}-`);
                                    });
                                    setReportDetailModal({
                                      title: `Yıllık Genel Toplam (${reportYear}) - Reddedilen Başvurular`,
                                      status: 'Red',
                                      applicants: yearApps.filter(a => a.vizeSonucu === 'Red')
                                    });
                                  }}
                                  className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl text-xs font-black bg-rose-600 text-white shadow-sm min-w-[50px] cursor-pointer hover:bg-rose-700 hover:scale-105 active:scale-95 transition-all"
                                  title="Detayları görmek için tıklayın"
                                >
                                  {totalRejected}
                                </span>
                              </th>
                              <th className="px-6 py-4 text-center">
                                <span 
                                  onClick={() => {
                                    const yearApps = countryFilteredApplicants.filter(a => {
                                      const { reportMonthKey } = getReportMonthKey(a);
                                      return reportMonthKey && reportMonthKey.startsWith(`${reportYear}-`);
                                    });
                                    setReportDetailModal({
                                      title: `Yıllık Genel Toplam (${reportYear}) - İşlemde Olan Başvurular`,
                                      status: 'İşlemde',
                                      applicants: yearApps.filter(a => a.islemDurumu === 'İşlemde')
                                    });
                                  }}
                                  className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl text-xs font-black bg-amber-500 text-white shadow-sm min-w-[50px] cursor-pointer hover:bg-amber-600 hover:scale-105 active:scale-95 transition-all"
                                  title="Detayları görmek için tıklayın"
                                >
                                  {totalInProgress}
                                </span>
                              </th>
                              <th className="px-6 py-4 text-right rounded-br-2xl text-brand-700 font-black text-sm">
                                <span 
                                  onClick={() => {
                                    const yearApps = countryFilteredApplicants.filter(a => {
                                      const { reportMonthKey } = getReportMonthKey(a);
                                      return reportMonthKey && reportMonthKey.startsWith(`${reportYear}-`);
                                    });
                                    setReportDetailModal({
                                      title: `Yıllık Genel Toplam (${reportYear}) - Tüm Başvurular`,
                                      status: 'Tümü',
                                      applicants: yearApps
                                    });
                                  }}
                                  className="text-brand-705 cursor-pointer hover:underline transition-all hover:scale-105 inline-block"
                                  title="Tüm liste detaylarını gör"
                                >
                                  {grandTotal}
                                </span>
                              </th>
                            </>
                          ) : (
                            <>
                              <th className="px-6 py-4 text-center">
                                {renderComparisonCell(totalApproved, prevTotalApproved, 'approved', 'Yıllık Genel Toplam')}
                              </th>
                              <th className="px-6 py-4 text-center">
                                {renderComparisonCell(totalRejected, prevTotalRejected, 'rejected', 'Yıllık Genel Toplam')}
                              </th>
                              <th className="px-6 py-4 text-center">
                                {renderComparisonCell(totalInProgress, prevTotalInProgress, 'in_progress', 'Yıllık Genel Toplam')}
                              </th>
                              <th className="px-6 py-4 text-right rounded-br-2xl">
                                {renderComparisonCell(grandTotal, prevGrandTotal, 'total', 'Yıllık Genel Toplam')}
                              </th>
                            </>
                          )}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            {/* Finansal Özet Paneli */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-4">
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-emerald-200">
                    <TrendingUp size={24} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 text-center sm:text-left">Toplam Tahsilat (TL)</p>
                  <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                    <h4 className="text-4xl font-black text-slate-800 tracking-tighter">
                      {accounting.reduce((sum, acc) => {
                        const date = parseSafeDate(acc.faturaTarihi);
                        return (date && date.getFullYear() === reportYear) ? sum + acc.toplam : sum;
                      }, 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </h4>
                    <span className="text-xl font-bold text-slate-400">₺</span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-amber-200">
                    <History size={24} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 text-center sm:text-left">Bekleyen Ödemeler</p>
                  <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                    <h4 className="text-4xl font-black text-slate-800 tracking-tighter">
                      {applicants.reduce((sum, app) => {
                        const { reportMonthKey } = getReportMonthKey(app);
                        if (reportMonthKey && reportMonthKey.startsWith(`${reportYear}-`) && !accountingMap.has(app.takipKodu)) {
                          const price = prices.find(p => p.ulke === app.ulke);
                          return sum + (price?.toplam || 0);
                        }
                        return sum;
                      }, 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </h4>
                    <span className="text-xl font-bold text-slate-400">₺</span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-brand-200">
                    <PieChart size={24} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 text-center sm:text-left">Tahsilat Durumu</p>
                  {(() => {
                    const collected = accounting.reduce((sum, acc) => {
                      const date = parseSafeDate(acc.faturaTarihi);
                      return (date && date.getFullYear() === reportYear) ? sum + acc.toplam : sum;
                    }, 0);
                    const pending = applicants.reduce((sum, app) => {
                      const { reportMonthKey } = getReportMonthKey(app);
                      if (reportMonthKey && reportMonthKey.startsWith(`${reportYear}-`) && !accountingMap.has(app.takipKodu)) {
                        const price = prices.find(p => p.ulke === app.ulke);
                        return sum + (price?.toplam || 0);
                      }
                      return sum;
                    }, 0);
                    const total = collected + pending;
                    const rate = total > 0 ? (collected / total) * 100 : 0;
                    return (
                      <div>
                        <div className="flex items-baseline gap-2 justify-center sm:justify-start mb-4">
                          <h4 className="text-4xl font-black text-slate-800 tracking-tighter">
                            %{rate.toFixed(1)}
                          </h4>
                        </div>
                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${rate}%` }}
                            className="h-full bg-brand-600 rounded-full shadow-[0_0_10px_rgba(124,58,237,0.5)]"
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            </div>

            {/* Analiz Raporu */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 border-b-4 border-brand-600 pb-6 gap-6">
                <h2 className="text-2xl md:text-3xl font-black text-brand-600 uppercase tracking-tight">
                  MKM VİZE {reportYear} YILI ANALİZ RAPORU
                </h2>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-8 lg:text-right">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Toplam Randevu</p>
                    <p className="text-5xl font-black text-slate-800 leading-none">{totalYearlyApps}</p>
                  </div>
                  {user?.role === 'admin' && (
                    <div>
                      <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Toplam Prim Kazancı</p>
                      <p className="text-5xl font-black text-brand-600 leading-none">
                        {totalYearlyCommission.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        <span className="text-2xl ml-1 text-brand-300">€</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Object.keys(monthlyBreakdown).sort().map(monthKey => {
                  const data = monthlyBreakdown[monthKey];
                  return (
                    <div key={monthKey} className="bg-slate-50/50 border border-slate-100 rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-[450px]">
                      <div className="px-6 py-5 bg-brand-50/50 border-b border-brand-100">
                        <div className="flex flex-col gap-3 mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <h3 className="font-black text-slate-800 uppercase text-lg tracking-tighter italic whitespace-nowrap">
                                {data.monthName} {data.year}
                              </h3>
                              <span className="w-8 h-8 flex items-center justify-center text-xs font-black rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-200">
                                {data.total}
                              </span>
                            </div>
                          </div>
                          
                          {/* Kart İçi Filtreler - Ay Başlığı Altında */}
                          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                            <div className="relative flex-1 min-w-[120px]">
                              <select 
                                value={reportCountry}
                                onChange={(e) => setReportCountry(e.target.value)}
                                className="w-full bg-white border border-slate-100 rounded-lg pl-2 pr-6 py-1.5 text-[9px] font-bold text-slate-500 appearance-none focus:ring-1 focus:ring-brand-500 shadow-sm transition-all cursor-pointer"
                              >
                                <option value="Tümü">🌏 Ülke Seçimi</option>
                                {countries.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                              </select>
                              <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                            </div>
                            <div className="relative flex-1 min-w-[120px]">
                              <select 
                                value={reportStatus}
                                onChange={(e) => setReportStatus(e.target.value)}
                                className="w-full bg-white border border-slate-100 rounded-lg pl-2 pr-6 py-1.5 text-[9px] font-bold text-slate-500 appearance-none focus:ring-1 focus:ring-brand-500 shadow-sm transition-all cursor-pointer"
                              >
                                <option value="Tümü">📋 Durum Seçimi</option>
                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                              <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 flex-1 overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-slate-200">
                        <div className="space-y-2">
                          {Object.entries(data.countries).length > 0 ? (
                            Object.entries(data.countries)
                              .sort((a: any, b: any) => b[1].count - a[1].count)
                              .map(([country, cData]: [string, any]) => {
                                const groupId = `${monthKey}-${country}`;
                                const isExpanded = expandedGroups.includes(groupId);
                                return (
                                  <div key={country} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                                    <button
                                      onClick={() => toggleGroup(groupId)}
                                      className="w-full flex items-center justify-between p-3 hover:bg-brand-50/30 transition-colors"
                                    >
                                      <div className="flex items-center gap-3">
                                        {isExpanded ? (
                                          <ChevronDown size={16} className="text-brand-600" />
                                        ) : (
                                          <ChevronRight size={16} className="text-slate-400" />
                                        )}
                                        <span className="text-xs font-bold text-slate-700">{country}</span>
                                      </div>
                                      <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                        {cData.count}
                                      </span>
                                    </button>
                                    {isExpanded && (
                                      <div className="px-4 pb-3 pt-1 space-y-2 border-t border-slate-50">
                                        {cData.applicants.map((app: any, idx: number) => (
                                          <button 
                                            key={idx} 
                                            onClick={() => {
                                              setSelectedApplicant(app);
                                              setShowApplicantCard(true);
                                            }}
                                            className="w-full flex items-start gap-2 hover:bg-brand-50 p-1.5 rounded-lg transition-colors group/name text-left"
                                          >
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-300 mt-1.5 shrink-0 group-hover/name:bg-brand-500" />
                                            <div className="flex flex-col">
                                              <p className="text-[10px] text-slate-700 font-bold leading-relaxed group-hover/name:text-brand-700 transition-colors">
                                                {app.ad} {app.soyad}
                                              </p>
                                              <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter group-hover/name:text-brand-300">
                                                {app.islemDurumu}
                                              </span>
                                            </div>
                                            <ChevronRight size={10} className="ml-auto mt-1 text-slate-300 opacity-0 group-hover/name:opacity-100 transition-all" />
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center py-12 opacity-20">
                              <p className="text-4xl font-black text-slate-400">0</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Aylık Özet Alt Bilgi */}
                      {(user?.role === 'admin' || settings?.show_commissions_to_users === 1) && (
                        <div className="p-5 bg-white border-t border-slate-100 space-y-3">
                          <div className="grid grid-cols-1 gap-2">
                            {user?.role === 'admin' && (
                              <div className="space-y-1 mb-2">
                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                                  <span className="text-slate-400">Tamamlanan İşlemler</span>
                                  <span className="text-emerald-600">{data.completedCount}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                                  <span className="text-slate-400">İşlemde Olanlar</span>
                                  <span className="text-brand-600">{data.inProgressCount}</span>
                                </div>
                              </div>
                            )}

                            {/* Toplam Prim Adedi ve Manuel Girişler */}
                            <div className="mt-2 pt-2 border-t border-slate-50 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Toplam Prim Adedi</span>
                                <span className="text-sm font-black text-slate-900">
                                  {data.appointmentsCount}
                                </span>
                              </div>
                              
                              {user?.role === 'admin' && (
                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Min. Prim Eşiği</span>
                                  <input 
                                    type="number"
                                    value={manualCommissionThresholds[monthKey] === undefined ? 20 : manualCommissionThresholds[monthKey]}
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? 20 : Number(e.target.value);
                                      setManualCommissionThresholds(prev => ({ ...prev, [monthKey]: val }));
                                    }}
                                    placeholder="20"
                                    className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-right text-xs font-bold focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                  />
                                </div>
                              )}

                              {user?.role === 'admin' && (
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Birim Prim (€)</span>
                                    <button 
                                      onClick={async () => {
                                        try {
                                          const res = await fetchWithAuth('/api/settings', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                              ...settings,
                                              manual_commission_rates: JSON.stringify(manualCommissionRates),
                                              manual_commission_thresholds: JSON.stringify(manualCommissionThresholds)
                                            })
                                          });
                                          if (res.ok) {
                                            alert('Prim ayarları kaydedildi.');
                                            fetchData();
                                          }
                                        } catch (e) {
                                          alert('Kaydedilemedi.');
                                        }
                                      }}
                                      className="text-[8px] font-black text-brand-600 hover:underline text-left uppercase"
                                    >
                                      Sisteme Kaydet
                                    </button>
                                  </div>
                                  <input 
                                    type="number"
                                    value={manualCommissionRates[monthKey] === undefined ? 20 : manualCommissionRates[monthKey]}
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? 0 : Number(e.target.value);
                                      setManualCommissionRates(prev => ({ ...prev, [monthKey]: val }));
                                    }}
                                    placeholder="20"
                                    className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-right text-xs font-bold focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                  />
                                </div>
                              )}

                              <div className="bg-brand-50 p-3 rounded-2xl border border-brand-100">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Toplam Prim Tutarı</span>
                                  <div className="text-right">
                                    <span className="text-lg font-black text-brand-700">
                                      {(() => {
                                        const count = data.appointmentsCount;
                                        const threshold = manualCommissionThresholds[monthKey] === undefined ? 20 : (manualCommissionThresholds[monthKey] || 0);
                                        const rate = manualCommissionRates[monthKey] === undefined ? 20 : (manualCommissionRates[monthKey] || 0);
                                        const excessCount = Math.max(0, count - threshold);
                                        return (excessCount * rate).toLocaleString('tr-TR', { minimumFractionDigits: 2 });
                                      })()}
                                    </span>
                                    <span className="text-xs font-bold text-brand-400 ml-1">€</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {user?.role === 'admin' && (
                            <div className="pt-3 border-t border-slate-50">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ciro ve Prim Özeti</p>
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Toplam Ciro (Fiyat)</span>
                                  <div className="flex flex-col items-end">
                                    {Object.entries(data.commissions).map(([cur, amount]: [string, any]) => (
                                      <span key={cur} className="text-xs font-black text-slate-700">
                                        {amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {getCurrencySymbol(cur)}
                                      </span>
                                    ))}
                                    {Object.keys(data.commissions).length === 0 && <span className="text-xs font-bold text-slate-300">0.00 ₺</span>}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Hak Edilen Prim</span>
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-base font-black text-brand-600">
                                      {(() => {
                                        const count = data.appointmentsCount;
                                        const threshold = manualCommissionThresholds[monthKey] === undefined ? 20 : (manualCommissionThresholds[monthKey] || 0);
                                        const rate = manualCommissionRates[monthKey] === undefined ? 20 : (manualCommissionRates[monthKey] || 0);
                                        const excessCount = Math.max(0, count - threshold);
                                        return (excessCount * rate).toLocaleString('tr-TR', { minimumFractionDigits: 2 });
                                      })()}
                                    </span>
                                    <span className="text-[10px] font-bold text-brand-400">€</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }

      case 'reports-commissions': {
        return (
          <div className="space-y-8">
            {/* Filtreler */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex flex-col md:flex-row items-end gap-4">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Yıl</label>
                  <select 
                    value={reportYear}
                    onChange={(e) => setReportYear(Number(e.target.value))}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-brand-500 transition-all"
                  >
                    {[2023, 2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Ülke</label>
                  <select 
                    value={reportCountry}
                    onChange={(e) => setReportCountry(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-brand-500 transition-all"
                  >
                    <option value="Tümü">Tüm Ülkeler</option>
                    {countries.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Durum</label>
                  <select 
                    value={reportStatus}
                    onChange={(e) => setReportStatus(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-brand-500 transition-all"
                  >
                    <option value="Tümü">Tüm Durumlar</option>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setReportCountry('Tümü');
                      setReportStatus('Tümü');
                    }}
                    className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors"
                    title="Filtreleri Temizle"
                  >
                    <RefreshCw size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Yıllık Prim Özeti */}
            {(user?.role === 'admin' || settings?.show_commissions_to_users === 1) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-brand-600 p-6 rounded-3xl text-white shadow-xl shadow-brand-200 relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Yıllık Kesilen Fatura</p>
                    <h4 className="text-4xl font-black">
                      {totalYearlyApps}
                    </h4>
                    <p className="text-[10px] font-bold mt-2 opacity-80 uppercase">KESİLEN FATURA ADEDİ</p>
                  </div>
                  <TrendingUp className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 rotate-12" />
                </div>
                
                <div className="bg-emerald-600 p-6 rounded-3xl text-white shadow-xl shadow-emerald-200 relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Yıllık Personel Primi</p>
                    <h4 className="text-4xl font-black">
                      {totalYearlyCommission.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      <span className="text-sm ml-1 opacity-70">€</span>
                    </h4>
                    <p className="text-[10px] font-bold mt-2 opacity-80 uppercase">TOPLAM PERSONEL HAKEDİŞİ</p>
                  </div>
                  <Calculator className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 rotate-12" />
                </div>
              </div>
            )}

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden min-h-[600px]">
              <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-600 text-white rounded-2xl">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Personel Prim Hesaplama</h3>
                    <p className="text-xs text-slate-500 font-medium">{reportYear} yılı için çalışanların aylık hak ediş ve prim dökümleri.</p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(userMonthlyBreakdown).map(([username, monthsData]: [string, any]) => (
                    <div key={username} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm flex flex-col">
                      <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-black text-white">
                            {username.substring(0, 1).toUpperCase()}
                          </div>
                          <h3 className="font-black text-white uppercase text-xs tracking-widest">{username}</h3>
                        </div>
                      </div>
                      <div className="p-6 space-y-4">
                        {Object.entries(monthsData)
                          .filter(([mKey]) => mKey.startsWith(`${reportYear}-`))
                          .sort((a, b) => b[0].localeCompare(a[0]))
                          .map(([mKey, mData]: [string, any]) => {
                            const monthIdx = parseInt(mKey.split('-')[1]) - 1;
                            const monthName = months[monthIdx] || mKey;
                            const threshold = manualCommissionThresholds[mKey] === undefined ? 20 : (manualCommissionThresholds[mKey] || 0);
                            const rate = manualCommissionRates[mKey] === undefined ? 20 : (manualCommissionRates[mKey] || 0);
                            const excess = Math.max(0, mData.count - threshold);
                            const totalBonus = excess * rate;

                            return (
                              <div key={mKey} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{monthName} {reportYear}</span>
                                  <span className="text-xs font-black text-slate-800">{mData.count} Fatura</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-slate-400 uppercase">Limit</span>
                                    <span className="text-slate-700">{threshold} Üstü</span>
                                  </div>
                                  <div className="flex flex-col gap-0.5 items-end">
                                    <span className="text-slate-400 uppercase">Birim Prim</span>
                                    <span className="text-slate-700">{rate} €</span>
                                  </div>
                                </div>
                                <div 
                                  className="pt-2 flex items-center justify-between cursor-pointer hover:bg-brand-100/50 -mx-4 px-4 py-2 rounded-xl transition-all group"
                                  onClick={() => {
                                    setSelectedCommissionInfo({
                                      username,
                                      monthKey: mKey,
                                      applicants: mData.applicants,
                                      totalBonus,
                                      monthName
                                    });
                                    setShowCommissionDetailModal(true);
                                  }}
                                >
                                  <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                    Hak Edilen <ExternalLink size={10} />
                                  </span>
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-black text-brand-600">{totalBonus.toLocaleString('tr-TR')}</span>
                                    <span className="text-xs font-bold text-brand-400">€</span>
                                  </div>
                                </div>
                              </div>
                            );
                        })}
                        {Object.keys(monthsData).filter(mk => mk.startsWith(`${reportYear}-`)).length === 0 && (
                          <div className="py-8 text-center opacity-30">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bu yıl için veri yok</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {Object.keys(userMonthlyBreakdown).length === 0 && (
                    <div className="col-span-full py-20 text-center">
                      <p className="text-slate-300 font-bold uppercase tracking-widest">Henüz prim kaydı bulunmuyor</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'reports-issued': {
        const data = applicants.filter(a => a.vizeSonucu === 'Onaylandı');
        return <div className="space-y-6"><ReportListView title="Vizesi Çıkan Müşteriler" data={data} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" border="border-emerald-100" setSelectedApplicant={setSelectedApplicant} setShowApplicantCard={setShowApplicantCard} /></div>;
      }

      case 'reports-rejected': {
        const data = applicants.filter(a => a.vizeSonucu === 'Red');
        return <div className="space-y-6"><ReportListView title="Red Alan Müşteriler" data={data} icon={AlertCircle} color="text-rose-600" bg="bg-rose-50" border="border-rose-100" setSelectedApplicant={setSelectedApplicant} setShowApplicantCard={setShowApplicantCard} /></div>;
      }

      case 'reports-progress': {
        const data = applicants.filter(a => a.islemDurumu === 'İşlemde');
        return <div className="space-y-6"><ReportListView title="İşlemdeki Başvurular" data={data} icon={Clock} color="text-brand-600" bg="bg-brand-50" border="border-brand-100" setSelectedApplicant={setSelectedApplicant} setShowApplicantCard={setShowApplicantCard} /></div>;
      }

      case 'company-list': {
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-600 text-white rounded-2xl">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Firma Listesi</h3>
                    <p className="text-xs text-slate-500 font-medium">Sistemdeki tüm kayıtlı firmalar ve yetkili bilgileri.</p>
                  </div>
                </div>

                {/* Arama Bölümü */}
                <div className="flex-1 max-w-md relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-600 transition-colors">
                    <Search size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Firma adı, yetkili veya vergi no ara..."
                    value={companySearchQuery}
                    onChange={(e) => setCompanySearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all shadow-sm"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1.5 rounded-full border border-slate-100">Toplam {companies.length} Firma</span>
                  {selectedCompanyIds && selectedCompanyIds.length > 0 && (
                    <button 
                      onClick={async () => {
                        if (!confirm(`${selectedCompanyIds.length} firmayı silmek istediğinize emin misiniz?`)) return;
                        try {
                          const res = await fetchWithAuth('/api/companies/bulk-delete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ids: selectedCompanyIds })
                          });
                          if (res.ok) {
                            setSelectedCompanyIds([]);
                            fetchData();
                          }
                        } catch (e) {
                          alert('Silme işlemi başarısız.');
                        }
                      }}
                      className="px-4 py-2 bg-rose-600 text-white text-[10px] font-black rounded-xl hover:bg-rose-700 transition-colors uppercase tracking-widest"
                    >
                      {selectedCompanyIds.length} Firmayı Sil
                    </button>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
                <table className="w-full border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/30">
                      <th className="pl-6 py-4 w-10">
                        <input 
                          type="checkbox" 
                          checked={selectedCompanyIds && selectedCompanyIds.length === companies.length && companies.length > 0}
                          onChange={() => {
                            if (selectedCompanyIds && selectedCompanyIds.length === companies.length) {
                              setSelectedCompanyIds([]);
                            } else {
                              setSelectedCompanyIds(companies.map(c => c.id));
                            }
                          }}
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
                    {companies
                      .filter(company => {
                        const searchLower = companySearchQuery.toLowerCase();
                        return (
                          (company.firma_unvani || "").toLowerCase().includes(searchLower) ||
                          (company.acente_adi || "").toLowerCase().includes(searchLower) ||
                          (company.yetkili_ad_soyad || "").toLowerCase().includes(searchLower) ||
                          (company.vergi_no || "").toLowerCase().includes(searchLower) ||
                          (company.email || "").toLowerCase().includes(searchLower) ||
                          (company.telefon || "").toLowerCase().includes(searchLower)
                        );
                      })
                      .map((company) => (
                      <tr key={company.id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-all group ${selectedCompanyIds?.includes(company.id) ? 'bg-brand-50/30' : ''}`}>
                        <td className="pl-6 py-4">
                          <input 
                            type="checkbox" 
                            checked={selectedCompanyIds?.includes(company.id)}
                            onChange={() => {
                              setSelectedCompanyIds(prev => 
                                (prev || []).includes(company.id) 
                                  ? (prev || []).filter(id => id !== company.id) 
                                  : [...(prev || []), company.id]
                              );
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-black text-slate-800 tracking-tight block max-w-[200px] truncate" title={company.firma_unvani || company.acente_adi}>
                            {company.firma_unvani || company.acente_adi}
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
                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 truncate max-w-[150px]" title={company.email || '-'}>
                              <Mail size={12} className="text-slate-400 shrink-0 shadow-sm" />
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
                            <span className="text-xs font-black text-slate-700 truncate max-w-[120px]" title={company.yetkili_ad_soyad || '-'}>{company.yetkili_ad_soyad || '-'}</span>
                            <span className="text-[10px] font-bold text-slate-400">{company.yetkili_telefon}</span>
                          </div>
                        </td>
                        <td className="pr-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => {
                                setSelectedCompany(company);
                                setActiveTab('companies');
                              }}
                              className="p-1.5 text-brand-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                              title="Düzenle"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={async () => {
                                if (!confirm('Bu firmayı silmek istediğinize emin misiniz?')) return;
                                try {
                                  const res = await fetchWithAuth(`/api/companies/delete/${company.id}`, { method: 'POST' });
                                  if (res.ok) fetchData();
                                } catch (e) {
                                  alert('Silme hatası.');
                                }
                              }}
                              className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                              title="Sil"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {companies.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-8 py-20 text-center">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <Building2 className="text-slate-200" size={32} />
                          </div>
                          <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Henüz firma kaydı bulunmuyor.</p>
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

      case 'email-list': {
        const companyEmails = companies.filter(c => c.email).map(c => ({ 
          email: c.email, 
          source: 'Firma', 
          name: c.acente_adi || c.firma_unvani,
          contact: c.yetkili_ad_soyad 
        }));
        const applicantEmails = applicants.filter(a => a.email).map(a => ({ 
          email: a.email, 
          source: 'Müşteri', 
          name: `${a.ad} ${a.soyad}`,
          contact: a.takipKodu
        }));
        
        // Combine and dedup
        const allEmailsMap = new Map();
        [...companyEmails, ...applicantEmails].forEach(item => {
          if (!allEmailsMap.has(item.email.toLowerCase())) {
            allEmailsMap.set(item.email.toLowerCase(), item);
          }
        });
        const allEmails = Array.from(allEmailsMap.values()).sort((a, b) => a.email.localeCompare(b.email));

        return (
          <div className="space-y-8">
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-600 text-white rounded-2xl">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">E-Posta Listesi</h3>
                    <p className="text-xs text-slate-500 font-medium">Sistemdeki tüm firma ve müşteri e-posta adresleri.</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const csvContent = "Email,Tip,İsim,Detay\n" + 
                      allEmails.map(e => `"${e.email}","${e.source}","${e.name}","${e.contact}"`).join("\n");
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.setAttribute("href", url);
                    link.setAttribute("download", `Eposta_Listesi_${formatDate(new Date())}.csv`);
                    link.click();
                  }}
                  className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 text-xs uppercase tracking-widest"
                >
                  <Download size={18} />
                  CSV OLARAK İNDİR
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">E-Posta Adresi</th>
                      <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Kaynak Tipi</th>
                      <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">İlgili Kişi / Kurum</th>
                      <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allEmails.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all group">
                        <td className="px-8 py-5">
                          <span className="text-sm font-black text-brand-600 tracking-tight">{item.email}</span>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${item.source === 'Firma' ? 'bg-brand-50 text-brand-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {item.source}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700">{item.name}</span>
                            <span className="text-[10px] font-medium text-slate-400 uppercase">{item.contact}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => {
                              window.location.href = `mailto:${item.email}`;
                            }}
                            className="p-2 text-slate-400 hover:text-brand-600 transition-all"
                            title="E-posta Gönder"
                          >
                            <Mail size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {allEmails.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-8 py-20 text-center italic text-slate-300">Mail adresi bulunamadı.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }

      case 'users':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold">Kullanıcı Yönetimi</h3>
                <button 
                  onClick={() => setShowUserForm(true)}
                  className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
                >
                  <PlusCircle size={18} />
                  YENİ KULLANICI EKLE
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-semibold">Kullanıcı Adı</th>
                      <th className="px-6 py-4 font-semibold">E-posta</th>
                      <th className="px-6 py-4 font-semibold">Acente / Firma</th>
                      <th className="px-6 py-4 font-semibold">Yetki</th>
                      <th className="px-6 py-4 font-semibold text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.length > 0 ? (
                      users.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium">{u.username}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{u.adminEmail}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {u.acenteAdi} <br />
                            <span className="text-[10px] text-slate-400">{u.firmaUnvani}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-600'}`}>
                              {u.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleDeleteUser(u.id)}
                              className="text-rose-600 hover:text-rose-800 font-bold text-xs"
                            >
                              SİL
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                          Kayıtlı kullanıcı bulunamadı.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <AnimatePresence>
              {showUserForm && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
                  >
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                      <h3 className="font-bold text-slate-800">Yeni Kullanıcı Tanımla</h3>
                      <button onClick={() => setShowUserForm(false)} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-colors">
                        <X size={20} />
                      </button>
                    </div>
                    <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Kullanıcı Adı</label>
                          <input 
                            required
                            type="text" 
                            value={newUser.username}
                            onChange={e => setNewUser({...newUser, username: e.target.value})}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Şifre</label>
                          <input 
                            required
                            type="password" 
                            value={newUser.password}
                            onChange={e => setNewUser({...newUser, password: e.target.value})}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">E-posta</label>
                        <input 
                          required
                          type="email" 
                          value={newUser.adminEmail}
                          onChange={e => setNewUser({...newUser, adminEmail: e.target.value})}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Acente Adı</label>
                        <input 
                          type="text" 
                          value={newUser.acenteAdi}
                          onChange={e => setNewUser({...newUser, acenteAdi: e.target.value})}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Firma Ünvanı</label>
                        <input 
                          type="text" 
                          value={newUser.firmaUnvani}
                          onChange={e => setNewUser({...newUser, firmaUnvani: e.target.value})}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Yetki</label>
                        <select 
                          value={newUser.role}
                          onChange={e => setNewUser({...newUser, role: e.target.value})}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                        >
                          <option value="user">Kullanıcı</option>
                          <option value="admin">Yönetici</option>
                        </select>
                      </div>
                      <button 
                        type="submit"
                        className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-100 hover:bg-brand-700 transition-all mt-4"
                      >
                        KULLANICIYI OLUŞTUR
                      </button>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        );

      case 'settings':
        return <NotificationSettings />;

      case 'calendar':
        return (
          <CalendarView 
            applicants={applicants.filter(a => a.randevuTarihi)} 
            onSelectApplicant={(a) => {
              setSelectedApplicant(a);
              setShowApplicantForm(true);
            }}
            onDoubleClickDay={(day) => {
              const year = day.getFullYear();
              const month = String(day.getMonth() + 1).padStart(2, '0');
              const date = String(day.getDate()).padStart(2, '0');
              const formattedDate = `${year}-${month}-${date}`;
              
              setSelectedApplicant(null);
              setApplicantInitialData({ 
                randevuTarihi: formattedDate,
                islemDurumu: 'Randevu Alındı'
              });
              setShowApplicantForm(true);
            }}
          />
        );

      default:
        return <div className="text-center py-20 text-slate-400">Bu sayfa yakında eklenecek.</div>;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-brand-600/30 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-slate-900' : 'bg-slate-50'} relative overflow-x-hidden transition-colors duration-300`}>
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 ${isSidebarCollapsed ? 'w-20' : 'w-72'} ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-r flex flex-col transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:h-screen ${isSidebarCollapsed ? 'md:w-20' : 'md:w-72'}
      `}>
        <div className="p-4 md:p-6 transition-all duration-300">
          <div className={`flex items-center ${isSidebarCollapsed ? 'flex-col gap-4 justify-center' : 'justify-between px-2'}`}>
            {!isSidebarCollapsed && (
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <h1 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-800'} tracking-tight`}>{BRAND_CONFIG.name}</h1>
                  <span className="text-brand-600 text-xs font-bold self-start mt-1">v2</span>
                </div>
                <p className="text-[9px] text-brand-600 font-extrabold tracking-[0.1em] uppercase ml-1">
                  {BRAND_CONFIG.acenteUnvani}
                </p>
              </div>
            )}
            
            {/* Sidebar Collapse/Expand Toggle Button (Desktop Only) */}
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`hidden md:flex p-2 rounded-xl transition-all ${
                darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
              }`}
              title={isSidebarCollapsed ? "Menüyü Aç" : "Menüyü Kapat"}
            >
              {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>

            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 md:hidden"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pb-6">
          <SidebarItem icon={LayoutDashboard} label="Anasayfa" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} darkMode={darkMode} isCollapsed={isSidebarCollapsed} />
          
          <div>
            <SidebarItem 
              icon={FileText} 
              label="Başvurular" 
              active={activeTab === 'applicants' || activeTab === 'pending' || activeTab === 'appointments'} 
              onClick={() => toggleSubmenu('applications')} 
              darkMode={darkMode} 
              hasSubmenu={true}
              isSubmenuOpen={openSubmenus['applications']}
              isCollapsed={isSidebarCollapsed}
            />
            {openSubmenus['applications'] && !isSidebarCollapsed && (
              <div className={`ml-9 mt-1 space-y-1 border-l-2 ${darkMode ? 'border-slate-700' : 'border-slate-100'} pl-2`}>
                <button onClick={() => { setActiveTab('applicants'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-[10px] uppercase font-black tracking-widest rounded-lg transition-all ${activeTab === 'applicants' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>Tüm Başvurular</button>
                <button onClick={() => { setActiveTab('pending'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-[10px] uppercase font-black tracking-widest rounded-lg transition-all ${activeTab === 'pending' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>Talep Bekleyenler</button>
                <button onClick={() => { setActiveTab('appointments'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-[10px] uppercase font-black tracking-widest rounded-lg transition-all ${activeTab === 'appointments' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>Randevu Alınanlar</button>
              </div>
            )}
          </div>

          <div>
            <SidebarItem 
              icon={Building2} 
              label="Firmalar" 
              active={['companies', 'company-list', 'email-list'].includes(activeTab)} 
              onClick={() => toggleSubmenu('companies')} 
              darkMode={darkMode} 
              hasSubmenu={true}
              isSubmenuOpen={openSubmenus['companies']}
              isCollapsed={isSidebarCollapsed}
            />
            {openSubmenus['companies'] && !isSidebarCollapsed && (
              <div className={`ml-9 mt-1 space-y-1 border-l-2 ${darkMode ? 'border-slate-700' : 'border-slate-100'} pl-2`}>
                <button onClick={() => { setActiveTab('companies'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-[10px] uppercase font-black tracking-widest rounded-lg transition-all ${activeTab === 'companies' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>Yeni Firma Kaydı</button>
                <button onClick={() => { setActiveTab('company-list'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-[10px] uppercase font-black tracking-widest rounded-lg transition-all ${activeTab === 'company-list' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>Firma Listesi</button>
                <button onClick={() => { setActiveTab('email-list'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-[10px] uppercase font-black tracking-widest rounded-lg transition-all ${activeTab === 'email-list' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>E-Posta Listesi</button>
              </div>
            )}
          </div>

          <SidebarItem icon={Key} label="Şifre Yönetimi" active={activeTab === 'passwords'} onClick={() => { setActiveTab('passwords'); setIsMobileMenuOpen(false); }} darkMode={darkMode} isCollapsed={isSidebarCollapsed} />
          
          <SidebarItem icon={Wallet} label="Muhasebe" active={activeTab === 'accounting'} onClick={() => { setActiveTab('accounting'); setIsMobileMenuOpen(false); }} darkMode={darkMode} isCollapsed={isSidebarCollapsed} />
          
          <div>
            <SidebarItem 
              icon={BarChart} 
              label="Raporlar" 
              active={['reports', 'reports-commissions', 'reports-issued', 'reports-rejected', 'reports-progress'].includes(activeTab)} 
              onClick={() => toggleSubmenu('reports')} 
              darkMode={darkMode} 
              hasSubmenu={true}
              isSubmenuOpen={openSubmenus['reports']}
              isCollapsed={isSidebarCollapsed}
            />
            {openSubmenus['reports'] && !isSidebarCollapsed && (
              <div className={`ml-9 mt-1 space-y-1 border-l-2 ${darkMode ? 'border-slate-700' : 'border-slate-100'} pl-2`}>
                <button onClick={() => { setActiveTab('reports'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-[10px] uppercase font-black tracking-widest rounded-lg transition-all ${activeTab === 'reports' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>Genel Özet</button>
                <button onClick={() => { setActiveTab('reports-commissions'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-[10px] uppercase font-black tracking-widest rounded-lg transition-all ${activeTab === 'reports-commissions' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>Prim Hesaplama</button>
                <button onClick={() => { setActiveTab('reports-issued'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-[10px] uppercase font-black tracking-widest rounded-lg transition-all ${activeTab === 'reports-issued' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>Vizesi Çıkanlar</button>
                <button onClick={() => { setActiveTab('reports-rejected'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-[10px] uppercase font-black tracking-widest rounded-lg transition-all ${activeTab === 'reports-rejected' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>Red Olanlar</button>
                <button onClick={() => { setActiveTab('reports-progress'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-[10px] uppercase font-black tracking-widest rounded-lg transition-all ${activeTab === 'reports-progress' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>İşlemde Olanlar</button>
              </div>
            )}
          </div>

          {user?.role === 'admin' && (
            <SidebarItem 
              icon={Mail} 
              label="E-posta Ayarları" 
              active={activeTab === 'hosting'} 
              onClick={() => { setActiveTab('hosting'); setIsMobileMenuOpen(false); }} 
              darkMode={darkMode} 
              isCollapsed={isSidebarCollapsed}
            />
          )}

          <div>
            <SidebarItem 
              icon={Settings} 
              label="Ayarlar" 
              active={activeTab === 'settings' || activeTab === 'prices' || activeTab === 'users' || activeTab === 'logs'} 
              onClick={() => toggleSubmenu('settings')} 
              darkMode={darkMode} 
              hasSubmenu={true}
              isSubmenuOpen={openSubmenus['settings']}
              isCollapsed={isSidebarCollapsed}
            />
            {openSubmenus['settings'] && !isSidebarCollapsed && (
              <div className={`ml-9 mt-1 space-y-1 border-l-2 ${darkMode ? 'border-slate-700' : 'border-slate-100'} pl-2`}>
                <button onClick={() => { setActiveTab('prices'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-[10px] uppercase font-black tracking-widest rounded-lg transition-all ${activeTab === 'prices' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>Fiyat Listesi</button>
                <button onClick={() => { setActiveTab('users'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-[10px] uppercase font-black tracking-widest rounded-lg transition-all ${activeTab === 'users' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>Kullanıcı Yönetimi</button>
                <button onClick={() => { setActiveTab('logs'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-[10px] uppercase font-black tracking-widest rounded-lg transition-all ${activeTab === 'logs' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>İşlem Logları</button>
                <button onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-[10px] uppercase font-black tracking-widest rounded-lg transition-all ${activeTab === 'settings' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>Bildirim Ayarları</button>
              </div>
            )}
          </div>

          <SidebarItem icon={Headphones} label="Destek Merkezi" active={activeTab === 'support'} onClick={() => { setActiveTab('support'); setIsMobileMenuOpen(false); }} darkMode={darkMode} isCollapsed={isSidebarCollapsed} />
          
          <SidebarItem icon={UserIcon} label="Profil" active={activeTab === 'profile'} onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }} darkMode={darkMode} isCollapsed={isSidebarCollapsed} />
        </nav>

        <div className="p-4 border-t border-slate-100 mb-2">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 ${isSidebarCollapsed ? 'px-2 py-2.5' : 'px-4 py-2.5'} rounded-xl border ${darkMode ? 'border-rose-900/30 text-rose-400 hover:bg-rose-900/20' : 'border-rose-100 text-rose-600 hover:bg-rose-50'} transition-all`}
            title={isSidebarCollapsed ? "Çıkış" : undefined}
          >
            <LogOut size={18} />
            {!isSidebarCollapsed && <span className="font-bold text-sm">Çıkış</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-4 md:p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className={`p-2 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'} border rounded-xl md:hidden shadow-sm`}
              >
                <Menu size={24} />
              </button>
              <div>
                <h2 className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  {activeTab === 'dashboard' && 'Kontrol Paneli'}
                  {activeTab === 'pending' && 'Talep Bekleyenler'}
                  {activeTab === 'calendar' && 'Randevu Takvimi'}
                  {activeTab === 'appointments' && 'Randevu Alınanlar'}
                  {activeTab === 'applicants' && 'Müşteri Kayıtları'}
                  {activeTab === 'accounting' && 'Muhasebe Yönetimi'}
                  {activeTab === 'users' && 'Kullanıcı Yönetimi'}
                  {activeTab === 'logs' && 'Sistem İşlem Logları'}
                  {activeTab === 'settings' && 'Bildirim Ayarları'}
                  {activeTab === 'companies' && 'Firma Yönetimi'}
                  {activeTab === 'all-appointments' && 'Tüm Randevular'}
                  {activeTab === 'forms' && 'Form Yönetimi'}
                  {activeTab === 'passwords' && 'Şifre Yönetimi'}
                  {activeTab === 'hosting' && 'E-posta Ayarları'}
                  {activeTab === 'support' && 'Destek Merkezi'}
                  {activeTab === 'profile' && 'Kullanıcı Profili'}
                  {activeTab === 'reports-issued' && 'Vizesi Çıkan Müşteriler'}
                  {activeTab === 'reports-rejected' && 'Red Alan Müşteriler'}
                  {activeTab === 'reports-progress' && 'İşlemdeki Başvurular'}
                </h2>
                <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} text-xs md:text-sm`}>Sistemdeki güncel veriler ve işlemler.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:hidden">
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-xl transition-all ${darkMode ? 'bg-slate-800 text-amber-400 border border-slate-700' : 'bg-white border border-slate-200 text-slate-400 shadow-sm'}`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-xl transition-all relative ${showNotifications ? 'bg-brand-100 text-brand-600' : darkMode ? 'bg-slate-800 border border-slate-700 text-slate-400' : 'bg-white border border-slate-200 text-slate-400 shadow-sm'}`}
              >
                <Bell size={20} />
                {(notifications?.total || 0) > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {notifications?.total}
                  </span>
                )}
              </button>
              <button 
                onClick={() => {
                  setSelectedApplicant(null);
                  setShowApplicantForm(true);
                }}
                className="p-2 bg-brand-600 text-white rounded-xl shadow-lg shadow-brand-200"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl transition-all ${darkMode ? 'bg-slate-800 text-amber-400 border border-slate-700 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-400 hover:text-brand-600 shadow-sm'}`}
              title={darkMode ? 'Aydınlık Mod' : 'Karanlık Mod'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2.5 rounded-xl transition-all ${showNotifications ? 'bg-brand-100 text-brand-600' : darkMode ? 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-brand-400' : 'bg-white border border-slate-200 text-slate-400 hover:text-brand-600 shadow-sm'}`}
              >
                <Bell size={20} />
                {(notifications?.total || 0) > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {notifications?.total}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                  >
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <h4 className="font-bold text-slate-800">Bildirimler</h4>
                      {notifications?.statusUpdates && notifications.statusUpdates.length > 0 ? (
                        <button 
                          onClick={() => markNotificationAsRead()} 
                          className="text-[10px] font-extrabold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg uppercase tracking-tight transition-all active:scale-95"
                        >
                          Tümünü Oku
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full uppercase">Canlı</span>
                      )}
                    </div>
                    <div className="px-4 py-2 bg-teal-50/50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={handleToggleSound}
                          className={`p-1 rounded-lg transition-colors flex items-center justify-center ${soundEnabled ? 'text-teal-600 hover:bg-teal-100' : 'text-slate-400 hover:bg-slate-200'}`}
                          title={soundEnabled ? 'Bildirim sesini kapat' : 'Bildirim sesini aç'}
                        >
                          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                        </button>
                        <span>Sesli Bildirim: {soundEnabled ? 'Açık' : 'Kapalı'}</span>
                      </div>
                      <button 
                        onClick={playNotificationSound}
                        disabled={!soundEnabled}
                        className="text-[10px] font-bold text-teal-600 hover:text-teal-800 disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-tight bg-white border border-teal-100 shadow-sm px-2 py-1 rounded-lg transition-all active:scale-95"
                      >
                        Sesi Test Et
                      </button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {(notifications?.total || 0) === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                          <CheckCircle2 size={32} className="mx-auto mb-2 opacity-20" />
                          <p className="text-sm">Yeni bildirim bulunmuyor.</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-50">
                          {(notifications?.statusUpdates || []).map((notif, idx) => (
                            <div 
                              key={`not-su-${notif.id || idx}`} 
                              className="p-4 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 relative group"
                              onClick={() => {
                                markNotificationAsRead(notif.id);
                                setActiveTab('applicants');
                                setShowNotifications(false);
                              }}
                            >
                              <div className="flex gap-3">
                                <div className="w-8 h-8 bg-brand-100 text-brand-600 rounded-lg flex items-center justify-center shrink-0">
                                  <RefreshCw size={16} />
                                </div>
                                <div className="flex-1 pr-6">
                                  <p className="text-xs font-bold text-slate-800">{notif.title || 'Durum Güncellemesi'}</p>
                                  <p className="text-[10px] text-slate-500 mt-0.5 whitespace-pre-line leading-relaxed">{notif.message}</p>
                                  <p className="text-[9px] text-slate-400 mt-1 font-medium">
                                    {notif.created_at ? new Date(notif.created_at).toLocaleDateString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}
                                  </p>
                                </div>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markNotificationAsRead(notif.id);
                                }}
                                className="absolute right-3 top-4 text-[10px] font-bold text-brand-600 hover:text-brand-800 opacity-60 hover:opacity-100 transition-opacity"
                                title="Okundu işaretle"
                              >
                                ✓
                              </button>
                            </div>
                          ))}
                          {(notifications?.appointments || []).map((a, idx) => (
                            <div key={`not-app-${a.takipKodu || idx}`} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => { setActiveTab('applicants'); setShowNotifications(false); }}>
                              <div className="flex gap-3">
                                <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
                                  <Clock size={16} />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-800">Yaklaşan Randevu</p>
                                  <p className="text-[11px] text-slate-500 mt-0.5">{a.ad} {a.soyad} - {a.ulke}</p>
                                  <p className="text-[10px] font-bold text-amber-600 mt-1">{a.randevuTarihi} {a.saat}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                          {(notifications?.payments || []).map((a, idx) => (
                            <div key={`not-pay-${a.takipKodu || idx}`} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => { setActiveTab('accounting'); setShowNotifications(false); }}>
                              <div className="flex gap-3">
                                <div className="w-8 h-8 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center shrink-0">
                                  <Wallet size={16} />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-800">Ödeme Bekliyor</p>
                                  <p className="text-[11px] text-slate-500 mt-0.5">{a.ad} {a.soyad} - {a.ulke}</p>
                                  <p className="text-[10px] font-bold text-rose-600 mt-1">Tahsilat yapılmadı</p>
                                </div>
                              </div>
                            </div>
                          ))}
                          {(notifications?.missingDocs || []).map((a, idx) => (
                            <div key={`not-miss-${a.takipKodu || idx}`} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => { setActiveTab('applicants'); setShowNotifications(false); }}>
                              <div className="flex gap-3">
                                <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
                                  <FileWarning size={16} />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-800">Eksik Belge / Bekleyen Talep</p>
                                  <p className="text-[11px] text-slate-500 mt-0.5">{a.ad} {a.soyad} - {a.ulke}</p>
                                  <p className="text-[10px] font-bold text-amber-600 mt-1">3 günden fazladır bekliyor</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <button 
              onClick={() => setShowProfileModal(true)}
              className="p-2 text-slate-400 hover:text-brand-600 transition-colors"
            >
              <Settings size={20} />
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <button 
              onClick={() => {
                setSelectedApplicant(null);
                setShowApplicantForm(true);
              }}
              className="bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all flex items-center gap-2"
            >
              <PlusCircle size={20} />
              YENİ KAYIT
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>

        {showAdminEmailModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 bg-brand-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Mail size={20} />
                  </div>
                  <h3 className="font-bold">Rapor Alıcısını Güncelle</h3>
                </div>
                <button onClick={() => setShowAdminEmailModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-600">
                  Haftalık yönetici raporunun gönderileceği e-posta adresini buradan değiştirebilirsiniz.
                </p>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">E-posta Adresi</label>
                  <input 
                    type="email" 
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="admin@alanadi.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setShowAdminEmailModal(false)}
                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                  >
                    İPTAL
                  </button>
                  <button 
                    onClick={async () => {
                      if (!newAdminEmail) return;
                      setIsUpdatingAdminEmail(true);
                      try {
                        const res = await fetch('/api/settings', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ ...settings, admin_report_email: newAdminEmail }),
                          credentials: 'include'
                        });
                        if (res.ok) {
                          setSettings({ ...settings, admin_report_email: newAdminEmail } as any);
                          setShowAdminEmailModal(false);
                          alert('Rapor e-posta adresi başarıyla güncellendi.');
                        } else {
                          alert('Güncelleme sırasında bir hata oluştu.');
                        }
                      } catch (err) {
                        alert('Sunucuya bağlanılamadı.');
                      } finally {
                        setIsUpdatingAdminEmail(false);
                      }
                    }}
                    disabled={isUpdatingAdminEmail}
                    className="flex-1 px-4 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-100 disabled:opacity-50"
                  >
                    {isUpdatingAdminEmail ? 'GÜNCELLENİYOR...' : 'GÜNCELLE'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showProfileModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 bg-brand-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Settings size={20} />
                  </div>
                  <h3 className="font-bold">Kullanıcı Ayarları</h3>
                </div>
                <button onClick={() => setShowProfileModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const payload = Object.fromEntries(formData.entries());
                  
                  try {
                    const res = await fetch('/api/auth/update-profile', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                      credentials: 'include'
                    });
                    
                    if (res.ok) {
                      const data = await res.json();
                      setUser(data.user);
                      alert('Profil başarıyla güncellendi.');
                      setShowProfileModal(false);
                    } else {
                      const data = await res.json();
                      alert(data.error || 'Bir hata oluştu.');
                    }
                  } catch (err) {
                    alert('Sunucuya bağlanılamadı.');
                  }
                }} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Kullanıcı Adı</label>
                    <input 
                      required
                      name="username"
                      type="text" 
                      defaultValue={user?.username}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">E-posta Adresi</label>
                    <input 
                      required
                      name="adminEmail"
                      type="email" 
                      defaultValue={user?.adminEmail}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Firma Ünvanı</label>
                    <input 
                      required
                      name="firmaUnvani"
                      type="text" 
                      defaultValue={user?.firmaUnvani}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Acente Adı</label>
                    <input 
                      required
                      name="acenteAdi"
                      type="text" 
                      defaultValue={user?.acenteAdi}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Yeni Şifre (Boş bırakılırsa değişmez)</label>
                    <input 
                      name="password"
                      type="password" 
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-brand-600 text-white font-bold rounded-2xl shadow-lg shadow-brand-100 hover:bg-brand-700 transition-all mt-4"
                  >
                    BİLGİLERİ GÜNCELLE
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {showApplicantForm && (
          <ApplicantForm 
            applicant={selectedApplicant || undefined} 
            initialData={applicantInitialData || undefined}
            countries={countries}
            prices={prices}
            onClose={() => {
              setShowApplicantForm(false);
              setSelectedApplicant(null);
              setApplicantInitialData(null);
            }}
            onSave={handleSaveApplicant}
            onDelete={handleDeleteApplicant}
            onOpenAccounting={(a) => {
              setShowApplicantForm(false);
              setSelectedApplicant(a);
              setApplicantInitialData(null);
              setShowAccountingForm(true);
            }}
            onOpenProforma={(a) => {
              setSelectedApplicant(a);
              setShowProformaModal(true);
            }}
            darkMode={darkMode}
            user={user}
          />
        )}

        {showApplicantCard && selectedApplicant && (
          <ApplicantCard 
            applicant={selectedApplicant}
            onClose={() => {
              setShowApplicantCard(false);
              setSelectedApplicant(null);
            }}
            onEdit={(a) => {
              setShowApplicantCard(false);
              setSelectedApplicant(a);
              setShowApplicantForm(true);
            }}
            onAddTimeline={handleAddTimeline}
            onUpdateDocuments={handleUpdateDocuments}
            onOpenProforma={(a) => {
              setSelectedApplicant(a);
              setShowProformaModal(true);
            }}
            darkMode={darkMode}
          />
        )}

        {showAccountingForm && selectedApplicant && (
          <AccountingForm 
            applicant={selectedApplicant}
            prices={prices}
            accounting={accounting}
            onClose={() => {
              setShowAccountingForm(false);
              setSelectedApplicant(null);
            }}
            onSave={handleSaveAccounting}
          />
        )}

        {showProformaModal && selectedApplicant && (
          <ProformaInvoiceModal
            applicant={selectedApplicant}
            accountingRecord={accounting.find(a => a.takipKodu === selectedApplicant.takipKodu)}
            prices={prices}
            onClose={() => {
              setShowProformaModal(false);
              setSelectedApplicant(null);
            }}
            onEditAccounting={() => {
              setShowProformaModal(false);
              setShowAccountingForm(true);
            }}
          />
        )}

        {showFinancialSummary && (
          <FinancialSummaryModal 
            isOpen={showFinancialSummary}
            onClose={() => setShowFinancialSummary(false)}
            applicants={applicants}
            accounting={accounting}
            prices={prices}
          />
        )}

        {showCommissionDetailModal && selectedCommissionInfo && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col border border-white/20"
            >
              <div className="px-8 py-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-xl font-black shadow-lg shadow-brand-500/20">
                    {selectedCommissionInfo.username.substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight italic">
                      {selectedCommissionInfo.username} - {selectedCommissionInfo.monthName} {reportYear}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Prim Hakediş Detayları</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Toplam Prim</p>
                    <div className="flex items-baseline gap-1 justify-end">
                      <span className="text-2xl font-black text-brand-400">{selectedCommissionInfo.totalBonus.toLocaleString('tr-TR')}</span>
                      <span className="text-sm font-bold text-brand-500">€</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowCommissionDetailModal(false)}
                    className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all group shadow-inner"
                  >
                    <PlusCircle size={24} className="rotate-45 text-slate-400 group-hover:text-white transition-colors" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-8 bg-slate-50/50">
                <div className="grid grid-cols-1 gap-4">
                  {selectedCommissionInfo.applicants.map((app, idx) => {
                    const accRecord = accountingMap.get(app.takipKodu);
                    return (
                      <div key={app.id || idx} className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all group flex items-center gap-6">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center font-bold text-xs border border-slate-100 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                          {idx + 1}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-0.5 truncate">
                            {app.ad} {app.soyad}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                              {app.takipKodu}
                            </span>
                            <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-100">
                              {app.ulke}
                            </span>
                          </div>
                        </div>

                        <div className="hidden sm:block">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Fatura Tarihi</p>
                          <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 text-xs font-bold">
                            {accRecord?.faturaTarihi ? formatDate(accRecord.faturaTarihi) : '-'}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 min-w-[120px]">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Dosya Durumu</p>
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                            app.islemDurumu === 'Tamamlandı' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-brand-50 text-brand-600 border border-brand-100'
                          }`}>
                            {app.islemDurumu}
                          </span>
                        </div>

                        <button 
                          onClick={() => {
                            setSelectedApplicant(app);
                            setShowApplicantCard(true);
                          }}
                          className="p-3 bg-slate-50 text-slate-400 hover:bg-brand-600 hover:text-white rounded-2xl transition-all shadow-sm active:scale-95"
                          title="Detayı Gör"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="px-8 py-6 bg-white border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400">
                  Toplam <span className="text-slate-800">{selectedCommissionInfo.applicants.length}</span> kayıt listelendi.
                </p>
                <button 
                  onClick={() => setShowCommissionDetailModal(false)}
                  className="px-8 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                >
                  Kapat
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showPriceForm && (
          <PriceForm 
            price={selectedPrice || undefined}
            countries={countries}
            onClose={() => {
              setShowPriceForm(false);
              setSelectedPrice(null);
            }}
            onSave={handleSavePrice}
            defaultVatRate={settings?.default_vat_rate || 20}
          />
        )}

        {/* Panel Customization Modal */}
        <AnimatePresence>
          {showDashboardSettings && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Panel Ayarları</h3>
                    <p className="text-xs text-slate-500 font-medium">Görmek istediğiniz bölümleri seçin.</p>
                  </div>
                  <button 
                    onClick={() => setShowDashboardSettings(false)}
                    className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                  >
                    <PlusCircle size={24} className="rotate-45" />
                  </button>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
                        <LayoutDashboard size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">İstatistik Kartları</p>
                        <p className="text-[10px] text-slate-500">Toplam kayıt, bekleyen talep vb.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleWidget('stats')}
                      className={`w-12 h-6 rounded-full transition-all relative ${dashboardWidgets.stats ? 'bg-brand-600' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${dashboardWidgets.stats ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                        <Wallet size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">Toplam Tahsilat</p>
                        <p className="text-[10px] text-slate-500">Güncel tahsilat göstergesi.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleWidget('totalCollection')}
                      className={`w-12 h-6 rounded-full transition-all relative ${dashboardWidgets.totalCollection ? 'bg-brand-600' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${dashboardWidgets.totalCollection ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                        <Bell size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">Hatırlatıcı Paneli</p>
                        <p className="text-[10px] text-slate-500">E-posta hatırlatma butonu.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleWidget('reminders')}
                      className={`w-12 h-6 rounded-full transition-all relative ${dashboardWidgets.reminders ? 'bg-brand-600' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${dashboardWidgets.reminders ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">Son Bekleyen Talepler</p>
                        <p className="text-[10px] text-slate-500">En son eklenen bekleyen kayıtlar.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleWidget('pendingApplicants')}
                      className={`w-12 h-6 rounded-full transition-all relative ${dashboardWidgets.pendingApplicants ? 'bg-brand-600' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${dashboardWidgets.pendingApplicants ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                        <Wallet size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">Son Muhasebe Hareketleri</p>
                        <p className="text-[10px] text-slate-500">Son yapılan tahsilatlar.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleWidget('recentAccounting')}
                      className={`w-12 h-6 rounded-full transition-all relative ${dashboardWidgets.recentAccounting ? 'bg-brand-600' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${dashboardWidgets.recentAccounting ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
                        <PieChart size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">İstatistik Grafikleri</p>
                        <p className="text-[10px] text-slate-500">Ülke dağılımı, trendler ve gelir grafikleri.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleWidget('charts')}
                      className={`w-12 h-6 rounded-full transition-all relative ${dashboardWidgets.charts ? 'bg-brand-600' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${dashboardWidgets.charts ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100">
                  <button 
                    onClick={() => setShowDashboardSettings(false)}
                    className="w-full py-3 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-900 transition-all"
                  >
                    AYARLARI KAYDET
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Rapor Detay (Ülke Dağılımı ve Başvuru Listesi) Modali */}
        <AnimatePresence>
          {reportDetailModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className={`${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white text-slate-805'} rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[85vh] flex flex-col`}
              >
                {/* Header */}
                <div className={`p-6 border-b ${darkMode ? 'border-slate-700 bg-slate-900/30' : 'border-slate-100 bg-slate-50'} flex items-center justify-between`}>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        reportDetailModal.status === 'Onaylandı' ? 'bg-emerald-500 animate-pulse' :
                        reportDetailModal.status === 'Red' ? 'bg-rose-500' : 'bg-amber-500'
                      }`} />
                      {reportDetailModal.title}
                    </h3>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} font-semibold mt-1`}>
                      Toplam: <span className="font-extrabold text-brand-600 dark:text-brand-400">{reportDetailModal.applicants.length} Adet İşlem</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => setReportDetailModal(null)}
                    className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-400 hover:text-slate-200' : 'hover:bg-white text-slate-400 hover:text-slate-600'}`}
                  >
                    <PlusCircle size={24} className="rotate-45" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 min-h-0">
                  {reportDetailModal.applicants.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 font-bold">
                      Gösterilecek veri bulunamadı.
                    </div>
                  ) : (
                    <>
                      {/* Ülke Dağılımı Kartı */}
                      <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900/40 border-slate-700' : 'bg-slate-50 border-slate-100'} space-y-4`}>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-450">Ülke Bazlı Dağılım</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(() => {
                            const countryGroups: Record<string, number> = {};
                            reportDetailModal.applicants.forEach(a => {
                              const countryLabel = a.ulke || 'Bilinmeyen Ülke';
                              countryGroups[countryLabel] = (countryGroups[countryLabel] || 0) + 1;
                            });

                            const totalCount = reportDetailModal.applicants.length;
                            const sortedCountries = Object.entries(countryGroups)
                              .map(([country, count]) => ({
                                country,
                                count,
                                percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
                              }))
                              .sort((a, b) => b.count - a.count);

                            return sortedCountries.map((item, idx) => (
                              <div key={idx} className="space-y-1 p-2 rounded-xl border border-slate-100/10 hover:bg-slate-500/5 transition-colors">
                                <div className="flex items-center justify-between text-xs font-bold">
                                  <span className={darkMode ? 'text-slate-200' : 'text-slate-700'}>{item.country}</span>
                                  <div className="flex items-center gap-2">
                                    <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>{item.count} Adet</span>
                                    <span className="text-brand-600 dark:text-brand-400 font-extrabold">%{item.percentage}</span>
                                  </div>
                                </div>
                                <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-200/60'}`}>
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.percentage}%` }}
                                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                                    className={`h-full rounded-full ${
                                      reportDetailModal.status === 'Onaylandı' ? 'bg-emerald-500' :
                                      reportDetailModal.status === 'Red' ? 'bg-rose-500' : 'bg-amber-500'
                                    }`}
                                  />
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>

                      {/* Başvuru Sahipleri Listesi */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-450">İşlem Detayları</h4>
                        
                        <div className="overflow-x-auto rounded-2xl border border-slate-150 dark:border-slate-700 max-h-[300px]">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead className="sticky top-0 z-10">
                              <tr className={`${darkMode ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-600'} font-bold uppercase border-b border-slate-150 dark:border-slate-750`}>
                                <th className="px-4 py-3">Takip Kodu</th>
                                <th className="px-4 py-3">Müşteri Adı Soyadı</th>
                                <th className="px-4 py-3">Ülke</th>
                                <th className="px-4 py-3">Acente / Firma</th>
                                <th className="px-4 py-3 text-right">Randevu Tarihi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-medium">
                              {reportDetailModal.applicants.map((app, appIdx) => (
                                <tr key={appIdx} className={`hover:bg-slate-50/50 dark:hover:bg-slate-700/50 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                  <td className="px-4 py-3.5 font-bold font-mono text-brand-600 dark:text-brand-400">
                                    {app.takipKodu}
                                  </td>
                                  <td className="px-4 py-3.5 font-bold">
                                    {app.ad} {app.soyad}
                                  </td>
                                  <td className="px-4 py-3.5">
                                    <span className="px-2 py-0.5 bg-brand-605/10 text-brand-600 dark:text-brand-400 rounded-md font-bold text-[10px] uppercase border border-brand-550/10">
                                      {app.ulke}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3.5">
                                    {app.firmaAdi || '-'}
                                  </td>
                                  <td className="px-4 py-3.5 text-right font-bold text-slate-500 dark:text-slate-400">
                                    {app.randevuTarihi || app.kayitTarihi || '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className={`p-4 border-t ${darkMode ? 'border-slate-700 bg-slate-900/20' : 'border-slate-100 bg-slate-50'} flex justify-end`}>
                  <button
                    onClick={() => setReportDetailModal(null)}
                    className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-[10px] uppercase tracking-[0.15em] rounded-xl transition-all shadow-md active:scale-95 shadow-brand-200 dark:shadow-none"
                  >
                    Kapat
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

        {selectedApplicantIds.length > 0 && user?.role === 'admin' && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[150] bg-slate-900 text-white rounded-[24px] shadow-2xl border border-slate-700/50 px-6 py-4 flex items-center gap-6 min-w-[450px] backdrop-blur-md"
          >
            <div className="flex items-center gap-3 pr-6 border-r border-slate-700">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center font-black text-lg shadow-lg shadow-brand-500/20">
                {selectedApplicantIds.length}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 block">Seçili Kayıt</span>
                <span className="text-xs font-bold text-slate-300">Toplu İşlemler</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button 
                  onClick={() => setShowBulkStatusMenu(!showBulkStatusMenu)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-inner border border-slate-700"
                >
                  Durum Güncelle <ChevronDown size={14} className={showBulkStatusMenu ? 'rotate-180 transition-transform' : 'transition-transform'} />
                </button>
                
                <AnimatePresence>
                  {showBulkStatusMenu && (
                    <motion.div 
                      key="bulk-status-menu"
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute bottom-full mb-3 left-0 w-56 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden py-2 z-[200]"
                    >
                      {STATUS_OPTIONS.map(status => (
                        <button
                          key={status}
                          onClick={() => handleBulkUpdateStatus(status)}
                          className="w-full text-left px-4 py-2.5 text-[10px] font-black text-slate-300 hover:bg-brand-600 hover:text-white transition-all uppercase tracking-wider"
                        >
                          {status}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-rose-500/20 shadow-sm"
              >
                <Trash2 size={14} /> Kayıtları Sil
              </button>

              <div className="w-px h-6 bg-slate-700 mx-1" />

              <button 
                onClick={() => setSelectedApplicantIds([])}
                className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                title="Seçimi İptal Et"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
        <WeeklyAppointmentsModal 
          isOpen={showWeeklyAppointments}
          onClose={() => setShowWeeklyAppointments(false)}
          applicants={applicants}
          darkMode={darkMode}
          onSelectApplicant={(a) => {
            setSelectedApplicant(a);
            setShowApplicantCard(true);
          }}
        />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
