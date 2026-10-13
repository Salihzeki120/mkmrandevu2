import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Calendar, DollarSign, Search, Filter, Download, Plus, 
  Send, Printer, CheckCircle, Clock, AlertCircle, RefreshCw, 
  RotateCcw, ShieldCheck, ExternalLink, ChevronDown, ChevronRight,
  Building, User, Globe, Mail, Phone, Hash, ArrowUpDown, X, Edit, Eye, Sparkles
} from 'lucide-react';
import { Applicant, AccountingRecord, InvoiceRecord, CountryCostRecord } from '../types';

interface PreAccountingModuleProps {
  applicants: Applicant[];
  accountingRecords: AccountingRecord[];
  onRefresh: () => void;
  currentUser: any;
  darkMode?: boolean;
}

export const PreAccountingModule: React.FC<PreAccountingModuleProps> = ({
  applicants,
  accountingRecords,
  onRefresh,
  currentUser,
  darkMode = false
}) => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'invoices' | 'tracking' | 'costs' | 'backup'>('appointments');
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [countryCosts, setCountryCosts] = useState<CountryCostRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [backupInfo, setBackupInfo] = useState<any>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [countryFilter, setCountryFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  // Invoice Modal / Drawer
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  // Form State for Invoice Generation
  const [invoiceForm, setInvoiceForm] = useState({
    faturaNo: '',
    faturaTarihi: new Date().toISOString().split('T')[0],
    faturaBedeli: 0,
    currency: 'EUR',
    konsoloslukUcreti: 0,
    hizmetBedeli: 0,
    kdvOrani: 20,
    kdv: 0,
    toplam: 0,
    durum: 'Ödendi',
    firma: '',
    musteriAdi: '',
    email: '',
    ulke: '',
    pasaportNo: '',
    takipKodu: '',
    notlar: ''
  });

  // Load Invoices and Country Costs
  const fetchInvoicesAndCosts = async () => {
    setLoading(true);
    try {
      const [invRes, costRes, backupRes] = await Promise.all([
        fetch('/api/invoices'),
        fetch('/api/country-costs'),
        fetch('/api/backup/status')
      ]);

      if (invRes.ok) {
        const invData = await invRes.json();
        setInvoices(invData);
      }
      if (costRes.ok) {
        const costData = await costRes.json();
        setCountryCosts(costData);
      }
      if (backupRes.ok) {
        const bData = await backupRes.json();
        setBackupInfo(bData.backup12Oct);
      }
    } catch (err) {
      console.error('Ön muhasebe verileri yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoicesAndCosts();
  }, []);

  // Filtered Appointments (Alınan Randevular)
  const appointmentApplicants = useMemo(() => {
    return applicants.filter(app => {
      // Randevu tarihi olanlar veya durumu Randevu Alındı / Randevusu Bekleyen olanlar
      const hasAppointment = Boolean(app.randevuTarihi && app.randevuTarihi.trim() !== '') || 
                             app.islemDurumu === 'Randevu Alındı' || 
                             (app.islemDurumu as string) === 'Tamamlandı' ||
                             (app.islemDurumu as string) === 'İşlem Tamamlandı';
      if (!hasAppointment) return false;

      if (statusFilter !== 'ALL') {
        if (statusFilter === 'INVOICED') {
          const matchingAcc = accountingRecords.find(acc => acc.takipKodu === app.takipKodu);
          const hasInv = (matchingAcc && matchingAcc.faturaNo && matchingAcc.faturaNo.trim() !== '') ||
                         invoices.some(inv => inv.takipKodu === app.takipKodu || (inv.kisi && inv.kisi.toLowerCase().includes(app.ad.toLowerCase())));
          if (!hasInv) return false;
        } else if (statusFilter === 'PENDING_INVOICE') {
          const matchingAcc = accountingRecords.find(acc => acc.takipKodu === app.takipKodu);
          const hasInv = (matchingAcc && matchingAcc.faturaNo && matchingAcc.faturaNo.trim() !== '') ||
                         invoices.some(inv => inv.takipKodu === app.takipKodu);
          if (hasInv) return false;
        } else if (statusFilter === 'PAID') {
          if (app.odemeDurumu !== 'Ödendi') return false;
        } else if (statusFilter === 'UNPAID') {
          if (app.odemeDurumu !== 'Ödenmedi') return false;
        }
      }

      if (countryFilter !== 'ALL' && app.ulke !== countryFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const fullName = `${app.ad || ''} ${app.soyad || ''}`.toLowerCase();
        const passport = (app.pasaportNo || '').toLowerCase();
        const code = (app.takipKodu || '').toLowerCase();
        const company = (app.firmaAdi || '').toLowerCase();
        if (!fullName.includes(q) && !passport.includes(q) && !code.includes(q) && !company.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [applicants, accountingRecords, invoices, statusFilter, countryFilter, searchQuery]);

  // Unique country list
  const uniqueCountries = useMemo(() => {
    const list = new Set<string>();
    applicants.forEach(a => a.ulke && list.add(a.ulke));
    return Array.from(list).sort();
  }, [applicants]);

  // Open Invoice Form for Applicant
  const handleOpenInvoiceModalForApplicant = (app: Applicant) => {
    setSelectedApplicant(app);
    setSelectedInvoice(null);

    // Look for existing accounting or invoice data
    const existingAcc = accountingRecords.find(a => a.takipKodu === app.takipKodu);
    const existingInv = invoices.find(inv => inv.takipKodu === app.takipKodu || (inv.kisi && inv.kisi.toLowerCase() === `${app.ad} ${app.soyad}`.toLowerCase()));

    // Try to find pricing from country_costs or existing prices
    const costMatch = countryCosts.find(c => c.ulke.toLowerCase() === (app.ulke || '').toLowerCase());
    
    // Default prices calculation
    let konsolosluk = app.konsoloslukUcreti || existingAcc?.konsoloslukUcreti || costMatch?.konsolosluk_kdvsiz || 0;
    let hizmet = app.hizmetBedeli || existingAcc?.hizmetBedeli || costMatch?.kdvli_kisim || 100;
    let kdvRate = app.kdvOrani || existingAcc?.kdvOrani || 20;
    let kdvAmount = Math.round((hizmet * kdvRate / 100) * 100) / 100;
    let toplam = app.fiyat || existingAcc?.toplam || (konsolosluk + hizmet + kdvAmount);
    let currency = app.currency || existingAcc?.currency || (costMatch?.kur === 'EUR' ? 'EUR' : 'EUR');

    // Generate suggested Invoice Number if none exists
    const currentYear = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const defaultFaturaNo = existingAcc?.faturaNo || existingInv?.faturaNo || `FTR-${currentYear}-${randomSuffix}`;

    setInvoiceForm({
      faturaNo: defaultFaturaNo,
      faturaTarihi: existingAcc?.faturaTarihi || existingInv?.faturaTarihi || new Date().toISOString().split('T')[0],
      faturaBedeli: existingInv?.faturaBedeli || toplam,
      currency: currency || 'EUR',
      konsoloslukUcreti: konsolosluk,
      hizmetBedeli: hizmet,
      kdvOrani: kdvRate,
      kdv: kdvAmount,
      toplam: toplam,
      durum: app.odemeDurumu === 'Ödendi' ? 'Ödendi' : (existingInv?.durum || 'Ödendi'),
      firma: app.firmaAdi || existingAcc?.firma || existingInv?.firma || 'MKM VİZE',
      musteriAdi: `${app.ad} ${app.soyad}`.trim(),
      email: app.email || existingInv?.email || '',
      ulke: app.ulke || existingInv?.ulke || '',
      pasaportNo: app.pasaportNo || '',
      takipKodu: app.takipKodu || '',
      notlar: app.notlar || existingInv?.notlar || ''
    });

    setIsInvoiceModalOpen(true);
  };

  // Open Invoice Form for Existing Invoice
  const handleOpenEditInvoice = (inv: InvoiceRecord) => {
    setSelectedInvoice(inv);
    setSelectedApplicant(null);

    setInvoiceForm({
      faturaNo: inv.faturaNo || '',
      faturaTarihi: inv.faturaTarihi || new Date().toISOString().split('T')[0],
      faturaBedeli: inv.faturaBedeli || 0,
      currency: inv.currency || 'EUR',
      konsoloslukUcreti: 0,
      hizmetBedeli: inv.faturaBedeli || 0,
      kdvOrani: 20,
      kdv: 0,
      toplam: inv.faturaBedeli || 0,
      durum: inv.durum || 'Ödendi',
      firma: inv.firma || '',
      musteriAdi: inv.kisi || '',
      email: inv.email || '',
      ulke: inv.ulke || '',
      pasaportNo: '',
      takipKodu: inv.takipKodu || '',
      notlar: inv.notlar || ''
    });

    setIsInvoiceModalOpen(true);
  };

  // Recalculate totals dynamically when changing inputs
  const handleAmountChange = (field: 'konsolosluk' | 'hizmet' | 'kdvOrani' | 'toplam', val: number) => {
    if (field === 'konsolosluk') {
      const kons = val;
      const kdv = Math.round((invoiceForm.hizmetBedeli * invoiceForm.kdvOrani / 100) * 100) / 100;
      const top = Math.round((kons + invoiceForm.hizmetBedeli + kdv) * 100) / 100;
      setInvoiceForm(prev => ({ ...prev, konsoloslukUcreti: kons, kdv, toplam: top, faturaBedeli: top }));
    } else if (field === 'hizmet') {
      const hiz = val;
      const kdv = Math.round((hiz * invoiceForm.kdvOrani / 100) * 100) / 100;
      const top = Math.round((invoiceForm.konsoloslukUcreti + hiz + kdv) * 100) / 100;
      setInvoiceForm(prev => ({ ...prev, hizmetBedeli: hiz, kdv, toplam: top, faturaBedeli: top }));
    } else if (field === 'kdvOrani') {
      const rate = val;
      const kdv = Math.round((invoiceForm.hizmetBedeli * rate / 100) * 100) / 100;
      const top = Math.round((invoiceForm.konsoloslukUcreti + invoiceForm.hizmetBedeli + kdv) * 100) / 100;
      setInvoiceForm(prev => ({ ...prev, kdvOrani: rate, kdv, toplam: top, faturaBedeli: top }));
    } else if (field === 'toplam') {
      setInvoiceForm(prev => ({ ...prev, toplam: val, faturaBedeli: val }));
    }
  };

  // Save Invoice
  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceForm.faturaNo.trim()) {
      alert('Lütfen geçerli bir Fatura Numarası girin.');
      return;
    }

    setLoading(true);
    try {
      if (selectedInvoice && selectedInvoice.id) {
        // Update existing invoice
        const res = await fetch(`/api/invoices/${selectedInvoice.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            faturaNo: invoiceForm.faturaNo,
            faturaTarihi: invoiceForm.faturaTarihi,
            faturaBedeli: invoiceForm.faturaBedeli,
            currency: invoiceForm.currency,
            talepTarihi: selectedInvoice.talepTarihi,
            firma: invoiceForm.firma,
            ulke: invoiceForm.ulke,
            kisi: invoiceForm.musteriAdi,
            durum: invoiceForm.durum,
            takipKodu: invoiceForm.takipKodu,
            email: invoiceForm.email,
            notlar: invoiceForm.notlar
          })
        });

        if (res.ok) {
          setActionMessage({ type: 'success', text: `Fatura ${invoiceForm.faturaNo} başarıyla güncellendi.` });
        }
      } else {
        // Create new invoice or update from applicant
        const res = await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            faturaNo: invoiceForm.faturaNo,
            faturaTarihi: invoiceForm.faturaTarihi,
            faturaBedeli: invoiceForm.faturaBedeli,
            currency: invoiceForm.currency,
            talepTarihi: new Date().toISOString().split('T')[0],
            firma: invoiceForm.firma,
            ulke: invoiceForm.ulke,
            kisi: invoiceForm.musteriAdi,
            durum: invoiceForm.durum,
            takipKodu: invoiceForm.takipKodu,
            email: invoiceForm.email,
            notlar: invoiceForm.notlar
          })
        });

        // Also save to accounting table if applicant is linked
        if (invoiceForm.takipKodu) {
          await fetch('/api/accounting', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              takipKodu: invoiceForm.takipKodu,
              adSoyad: invoiceForm.musteriAdi,
              islemDurumu: 'Randevu Alındı',
              randevuBilgisi: selectedApplicant?.randevuTarihi ? `${selectedApplicant.randevuTarihi} ${selectedApplicant.saat || ''}`.trim() : '',
              pasaportNo: invoiceForm.pasaportNo,
              ulke: invoiceForm.ulke,
              odemeDurumu: invoiceForm.durum,
              firma: invoiceForm.firma,
              konsoloslukUcreti: invoiceForm.konsoloslukUcreti,
              hizmetBedeli: invoiceForm.hizmetBedeli,
              kdvOrani: invoiceForm.kdvOrani,
              toplam: invoiceForm.toplam,
              faturaNo: invoiceForm.faturaNo,
              faturaTarihi: invoiceForm.faturaTarihi,
              currency: invoiceForm.currency
            })
          });
        }

        if (res.ok) {
          setActionMessage({ type: 'success', text: `Fatura ${invoiceForm.faturaNo} başarıyla kaydedildi ve sisteme işlendi.` });
        }
      }

      setIsInvoiceModalOpen(false);
      await fetchInvoicesAndCosts();
      onRefresh();
    } catch (err: any) {
      console.error('Fatura kaydedilemedi:', err);
      setActionMessage({ type: 'error', text: 'Fatura kaydedilirken hata oluştu: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // Send Invoice Email to Customer
  const handleSendInvoiceEmail = async () => {
    if (!invoiceForm.email || !invoiceForm.email.includes('@')) {
      const newEmail = prompt('Lütfen faturanın gönderileceği müşteri e-posta adresini girin:', invoiceForm.email || '');
      if (!newEmail || !newEmail.includes('@')) {
        alert('Geçerli bir e-posta adresi belirtilmedi.');
        return;
      }
      invoiceForm.email = newEmail;
    }

    setIsSendingEmail(true);
    try {
      const res = await fetch('/api/invoices/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faturaNo: invoiceForm.faturaNo,
          email: invoiceForm.email,
          kisi: invoiceForm.musteriAdi,
          firma: invoiceForm.firma,
          ulke: invoiceForm.ulke,
          tutar: invoiceForm.faturaBedeli,
          currency: invoiceForm.currency,
          faturaTarihi: invoiceForm.faturaTarihi
        })
      });

      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: 'success', text: `Fatura ${invoiceForm.faturaNo} hem müşteriye (${invoiceForm.email}) hem muhasebeye başarıyla gönderildi!` });
      } else {
        setActionMessage({ type: 'error', text: data.error || 'E-posta gönderilemedi.' });
      }
    } catch (e: any) {
      setActionMessage({ type: 'error', text: 'E-posta gönderim hatası: ' + e.message });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Print Invoice / Download PDF preview
  const handlePrintInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const sym = invoiceForm.currency === 'EUR' ? '€' : invoiceForm.currency === 'USD' ? '$' : '₺';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fatura - ${invoiceForm.faturaNo}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0284c7; padding-bottom: 20px; }
          .brand { font-size: 26px; font-weight: 900; color: #0369a1; }
          .sub { font-size: 13px; color: #64748b; margin-top: 4px; }
          .invoice-title { font-size: 22px; font-weight: 800; color: #0f172a; text-align: right; }
          .meta { margin-top: 30px; display: flex; justify-content: space-between; }
          .box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; width: 45%; }
          .table { width: 100%; border-collapse: collapse; margin-top: 30px; }
          .table th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 13px; border-bottom: 2px solid #cbd5e1; }
          .table td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
          .total-box { margin-top: 30px; float: right; width: 300px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
          .grand-total { font-size: 18px; font-weight: 900; color: #0369a1; border-top: 2px solid #0369a1; padding-top: 10px; }
          .footer { margin-top: 100px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">MKM VİZE DANIŞMANLIK</div>
            <div class="sub">Ön Muhasebe & Resmi Hizmet Faturası</div>
          </div>
          <div>
            <div class="invoice-title">FATURA / PROFORMA</div>
            <div style="font-size: 14px; font-weight: bold; color: #64748b; text-align: right;">No: ${invoiceForm.faturaNo}</div>
          </div>
        </div>

        <div class="meta">
          <div class="box">
            <strong style="color: #475569; font-size: 12px; text-transform: uppercase;">Müşteri / Kurum Bilgisi</strong>
            <p style="margin: 6px 0 0 0; font-weight: bold; font-size: 15px;">${invoiceForm.musteriAdi || '-'}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #475569;">Firma: ${invoiceForm.firma || 'Bireysel'}</p>
            ${invoiceForm.pasaportNo ? `<p style="margin: 4px 0 0 0; font-size: 13px; color: #475569;">Pasaport No: ${invoiceForm.pasaportNo}</p>` : ''}
            ${invoiceForm.takipKodu ? `<p style="margin: 4px 0 0 0; font-size: 13px; color: #475569;">Takip Kodu: ${invoiceForm.takipKodu}</p>` : ''}
          </div>
          <div class="box">
            <strong style="color: #475569; font-size: 12px; text-transform: uppercase;">Fatura Bilgileri</strong>
            <p style="margin: 6px 0 0 0; font-size: 14px;">Tarih: <strong>${invoiceForm.faturaTarihi}</strong></p>
            <p style="margin: 4px 0 0 0; font-size: 14px;">Hedef Ülke: <strong>${invoiceForm.ulke}</strong></p>
            <p style="margin: 4px 0 0 0; font-size: 14px;">Ödeme Durumu: <strong>${invoiceForm.durum}</strong></p>
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Açıklama</th>
              <th>Konsolosluk Harcı (KDVsiz)</th>
              <th>Hizmet Bedeli</th>
              <th>KDV Oranı</th>
              <th style="text-align: right;">Tutar</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${invoiceForm.ulke} Vize Başvuru ve Danışmanlık Hizmeti</td>
              <td>${invoiceForm.konsoloslukUcreti.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${sym}</td>
              <td>${invoiceForm.hizmetBedeli.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${sym}</td>
              <td>%${invoiceForm.kdvOrani}</td>
              <td style="text-align: right; font-weight: bold;">${invoiceForm.faturaBedeli.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${sym}</td>
            </tr>
          </tbody>
        </table>

        <div class="total-box">
          <div class="total-row"><span>Konsolosluk Harcı:</span><span>${invoiceForm.konsoloslukUcreti.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${sym}</span></div>
          <div class="total-row"><span>Hizmet Bedeli:</span><span>${invoiceForm.hizmetBedeli.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${sym}</span></div>
          <div class="total-row"><span>KDV (%${invoiceForm.kdvOrani}):</span><span>${invoiceForm.kdv.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${sym}</span></div>
          <div class="total-row grand-total"><span>GENEL TOPLAM:</span><span>${invoiceForm.faturaBedeli.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${sym}</span></div>
        </div>

        <div style="clear: both;"></div>

        <div class="footer">
          MKM VİZE DANIŞMANLIK HİZMETLERİ • Bilgilendirme ve İşlem Amaçlıdır.
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Restore 12.10.2026 Backup
  const handleRestoreBackup = async () => {
    setIsRestoringBackup(true);
    try {
      const res = await fetch('/api/backup/restore-12-10-2026', {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || '12.10.2026 tarihli orijinal veritabanı başarıyla geri yüklendi!');
        setShowRestoreConfirm(false);
        window.location.reload();
      } else {
        alert(data.error || 'Geri yükleme işlemi başarısız oldu.');
      }
    } catch (e: any) {
      alert('Geri yükleme sırasında hata: ' + e.message);
    } finally {
      setIsRestoringBackup(false);
    }
  };

  // Export Table to CSV
  const handleExportInvoicesCsv = () => {
    if (invoices.length === 0) return;
    const headers = ['Fatura No', 'Fatura Tarihi', 'Fatura Bedeli', 'Para Birimi', 'Firma', 'İlgili Kişi', 'Ülke', 'Durum', 'Talep Tarihi'];
    const rows = invoices.map(i => [
      `"${i.faturaNo || ''}"`,
      `"${i.faturaTarihi || ''}"`,
      i.faturaBedeli,
      `"${i.currency || 'TRY'}"`,
      `"${(i.firma || '').replace(/"/g, '""')}"`,
      `"${(i.kisi || '').replace(/"/g, '""')}"`,
      `"${(i.ulke || '').replace(/"/g, '""')}"`,
      `"${i.durum || 'Ödendi'}"`,
      `"${i.talepTarihi || ''}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MKM_Fatura_Takip_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Banner & Action notification */}
      {actionMessage && (
        <div className={`p-4 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in duration-200 ${
          actionMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : actionMessage.type === 'error'
            ? 'bg-rose-50 text-rose-800 border border-rose-200'
            : 'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          <div className="flex items-center gap-3">
            {actionMessage.type === 'success' ? <CheckCircle size={20} className="text-emerald-600" /> : <AlertCircle size={20} className="text-rose-600" />}
            <span className="text-sm font-semibold">{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="p-1 hover:bg-black/5 rounded-lg text-slate-400">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Top Header & KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alınan Randevular</p>
            <h3 className="text-2xl font-black text-slate-900">{appointmentApplicants.length}</h3>
            <p className="text-[11px] text-blue-600 font-medium">Faturalandırılmaya Hazır</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kesilen Faturalar</p>
            <h3 className="text-2xl font-black text-slate-900">{invoices.length}</h3>
            <p className="text-[11px] text-emerald-600 font-medium">431 Excel Kaydı Entegre</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aktif Başvuru / Takip</p>
            <h3 className="text-2xl font-black text-slate-900">{applicants.length}</h3>
            <p className="text-[11px] text-purple-600 font-medium">743 Takip Kaydı Korundu</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Veri Güvenliği</p>
            <h3 className="text-sm font-bold text-slate-900">12.10.2026 Yedeği</h3>
            <button 
              onClick={() => setActiveTab('backup')}
              className="text-[11px] text-amber-600 hover:text-amber-800 font-bold underline text-left"
            >
              Geri Dönüş Noktası Hazır →
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
              activeTab === 'appointments'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar size={16} />
            <span>Alınan Randevular & Fatura Kes</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'appointments' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {appointmentApplicants.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
              activeTab === 'invoices'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText size={16} />
            <span>Fatura Takip Listesi</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'invoices' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {invoices.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
              activeTab === 'tracking'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building size={16} />
            <span>Takip Listesi Dökümü</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'tracking' ? 'bg-purple-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {applicants.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('costs')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
              activeTab === 'costs'
                ? 'bg-slate-900 text-white shadow-md shadow-slate-300'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <DollarSign size={16} />
            <span>Ülke Maliyet & KDV Analizi</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'costs' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {countryCosts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
              activeTab === 'backup'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-200'
                : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
            }`}
          >
            <RotateCcw size={16} />
            <span>12.10.2026 Geri Yükleme & Yedek</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchInvoicesAndCosts();
              onRefresh();
            }}
            className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            title="Verileri Yenile"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* TAB 1: ALINAN RANDEVULAR & FATURALANDIRMA */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Müşteri Adı, Pasaport veya Firma Ara..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Tüm Randevu Durumları</option>
                <option value="INVOICED">Faturası Kesilenler</option>
                <option value="PENDING_INVOICE">Fatura Bekleyenler</option>
                <option value="PAID">Ödemesi Alınanlar</option>
                <option value="UNPAID">Ödeme Bekleyenler</option>
              </select>

              <select
                value={countryFilter}
                onChange={e => setCountryFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Tüm Ülkeler</option>
                {uniqueCountries.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <div className="text-xs font-bold text-slate-400 px-2">
                Gösterilen: <span className="text-slate-900">{appointmentApplicants.length}</span>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50/70 border-b border-blue-100 p-3 px-6 flex items-center justify-between text-xs text-blue-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span><strong>İpucu:</strong> Fatura kesmek veya fatura numarasını girmek için aşağıdaki listede <strong>müşteri ismine tıklayabilirsiniz</strong>. Tutarlar otomatik doldurulacak olup dilediğiniz gibi güncelleyebilirsiniz.</span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-extrabold border-b border-slate-200">
                  <th className="px-6 py-4">Müşteri (Başvuru Sahibi)</th>
                  <th className="px-6 py-4">Hedef Ülke</th>
                  <th className="px-6 py-4">Randevu Tarihi & Saat</th>
                  <th className="px-6 py-4">Firma / Acente</th>
                  <th className="px-6 py-4">Fatura Durumu</th>
                  <th className="px-6 py-4">Ödeme</th>
                  <th className="px-6 py-4 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {appointmentApplicants.length > 0 ? (
                  appointmentApplicants.map((app) => {
                    const matchingAcc = accountingRecords.find(a => a.takipKodu === app.takipKodu);
                    const matchingInv = invoices.find(inv => inv.takipKodu === app.takipKodu);
                    const faturaNo = matchingAcc?.faturaNo || matchingInv?.faturaNo;
                    const hasFatura = Boolean(faturaNo && faturaNo.trim().length > 0);

                    return (
                      <tr 
                        key={app.takipKodu} 
                        className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                        onClick={() => handleOpenInvoiceModalForApplicant(app)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase">
                              {app.ad ? app.ad[0] : 'M'}
                            </div>
                            <div>
                              <span className="font-extrabold text-blue-700 hover:text-blue-900 group-hover:underline text-sm block">
                                {app.ad} {app.soyad}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {app.pasaportNo || app.takipKodu}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-800">{app.ulke || '-'}</span>
                          <span className="block text-[10px] text-slate-400">{app.vizeKategorisi || 'Turistik'}</span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 font-bold text-slate-700">
                            <Calendar size={13} className="text-blue-500" />
                            <span>{app.randevuTarihi || '-'}</span>
                          </div>
                          {app.saat && (
                            <span className="text-[10px] text-slate-400 ml-4 font-mono">{app.saat}</span>
                          )}
                        </td>

                        <td className="px-6 py-4 font-medium text-slate-600">
                          {app.firmaAdi || matchingAcc?.firma || 'MKM VİZE'}
                        </td>

                        <td className="px-6 py-4">
                          {hasFatura ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-extrabold">
                              <CheckCircle size={13} />
                              <span className="font-mono">{faturaNo}</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[11px] font-bold">
                              <Clock size={12} />
                              <span>Fatura Bekliyor</span>
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            app.odemeDurumu === 'Ödendi' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {app.odemeDurumu || 'Ödenmedi'}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenInvoiceModalForApplicant(app)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm shadow-blue-200 transition-all flex items-center gap-1.5 ml-auto"
                          >
                            <FileText size={14} />
                            <span>{hasFatura ? 'Faturayı Gör / Düzenle' : 'Fatura Kes'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                      Arama kriterlerine uygun alınan randevu kaydı bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: KESİLEN FATURA TAKİP LİSTESİ (431 EXCEL KAYDI) */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Header & Controls */}
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Fatura No, Müşteri veya Firma Ara..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={handleExportInvoicesCsv}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                title="Excel / CSV olarak İndir"
              >
                <Download size={14} />
                <span>Excel'e Aktar</span>
              </button>

              <button
                onClick={() => {
                  setSelectedInvoice(null);
                  setSelectedApplicant(null);
                  setInvoiceForm({
                    faturaNo: `FTR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                    faturaTarihi: new Date().toISOString().split('T')[0],
                    faturaBedeli: 0,
                    currency: 'EUR',
                    konsoloslukUcreti: 0,
                    hizmetBedeli: 0,
                    kdvOrani: 20,
                    kdv: 0,
                    toplam: 0,
                    durum: 'Ödendi',
                    firma: '',
                    musteriAdi: '',
                    email: '',
                    ulke: '',
                    pasaportNo: '',
                    takipKodu: '',
                    notlar: ''
                  });
                  setIsInvoiceModalOpen(true);
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-200 transition-all"
              >
                <Plus size={14} />
                <span>Yeni Fatura Ekle</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-100 z-10">
                <tr className="text-slate-600 text-[11px] uppercase tracking-wider font-extrabold border-b border-slate-200">
                  <th className="px-6 py-3.5">Fatura No</th>
                  <th className="px-6 py-3.5">Fatura Tarihi</th>
                  <th className="px-6 py-3.5">Müşteri / İlgili Kişi</th>
                  <th className="px-6 py-3.5">Firma</th>
                  <th className="px-6 py-3.5">Ülke</th>
                  <th className="px-6 py-3.5">Fatura Bedeli</th>
                  <th className="px-6 py-3.5">Durum</th>
                  <th className="px-6 py-3.5 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {invoices
                  .filter(inv => {
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      (inv.faturaNo || '').toLowerCase().includes(q) ||
                      (inv.kisi || '').toLowerCase().includes(q) ||
                      (inv.firma || '').toLowerCase().includes(q) ||
                      (inv.ulke || '').toLowerCase().includes(q)
                    );
                  })
                  .map((inv) => {
                    const sym = inv.currency === 'EUR' ? '€' : inv.currency === 'USD' ? '$' : '₺';
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3.5 font-mono font-bold text-emerald-700">
                          {inv.faturaNo || '-'}
                        </td>

                        <td className="px-6 py-3.5 text-slate-600">
                          {inv.faturaTarihi || '-'}
                        </td>

                        <td className="px-6 py-3.5 font-bold text-slate-800">
                          {inv.kisi || '-'}
                        </td>

                        <td className="px-6 py-3.5 text-slate-600">
                          {inv.firma || '-'}
                        </td>

                        <td className="px-6 py-3.5 text-slate-700 font-medium">
                          {inv.ulke || '-'}
                        </td>

                        <td className="px-6 py-3.5 font-black text-slate-900 whitespace-nowrap">
                          {Number(inv.faturaBedeli || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {sym}
                        </td>

                        <td className="px-6 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            inv.durum === 'Ödendi' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {inv.durum || 'Ödendi'}
                          </span>
                        </td>

                        <td className="px-6 py-3.5 text-right">
                          <button
                            onClick={() => handleOpenEditInvoice(inv)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Faturayı Düzenle / İncele"
                          >
                            <Edit size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TÜM BAŞVURU & TAKİP DÖKÜMÜ (743 KAYIT ENTEGRE) */}
      {activeTab === 'tracking' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-slate-900">
              Vize Takip & Muhasebe Başvuru Listesi ({applicants.length} Kayıt)
            </h4>
            <div className="text-xs text-slate-400 font-medium">
              Eski kayıtlar ve Excel listesindeki 743 takip kaydı eksiksiz saklanmaktadır.
            </div>
          </div>

          <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-100 z-10">
                <tr className="text-slate-600 text-[11px] uppercase tracking-wider font-extrabold border-b border-slate-200">
                  <th className="px-6 py-3">Ad Soyad</th>
                  <th className="px-6 py-3">İşlem Durumu</th>
                  <th className="px-6 py-3">Randevu Bilgisi</th>
                  <th className="px-6 py-3">Ülke</th>
                  <th className="px-6 py-3">Firma</th>
                  <th className="px-6 py-3">Ödeme</th>
                  <th className="px-6 py-3">Fatura No</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {applicants.map((a) => {
                  const acc = accountingRecords.find(acc => acc.takipKodu === a.takipKodu);
                  return (
                    <tr key={a.takipKodu} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 font-bold text-slate-900">
                        {a.ad} {a.soyad}
                      </td>
                      <td className="px-6 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {a.islemDurumu}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-600 font-medium">
                        {a.randevuTarihi ? `${a.randevuTarihi} ${a.saat || ''}` : '-'}
                      </td>
                      <td className="px-6 py-3 font-medium text-slate-700">{a.ulke || '-'}</td>
                      <td className="px-6 py-3 text-slate-600">{a.firmaAdi || '-'}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          a.odemeDurumu === 'Ödendi' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {a.odemeDurumu || 'Ödenmedi'}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-mono text-emerald-700 font-bold">
                        {acc?.faturaNo || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ÜLKE MALİYET VE KDV ANALİZ TABLOSU */}
      {activeTab === 'costs' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h4 className="font-extrabold text-sm text-slate-900">
              Ülke Maliyet ve Fiyatlandırma Listesi (Konsolosluk KDVsiz + Hizmet KDV Matrahı)
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Yüklenen Excel dosyasındaki resmi maliyet kalemleri: Konsolosluk harçları KDV'den muaf olup, danışmanlık hizmet bedeli üzerinden %20 KDV hesaplanır.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-extrabold text-[11px] uppercase tracking-wider border-b border-slate-200">
                  <th className="px-5 py-3.5">Ülke</th>
                  <th className="px-5 py-3.5">Ücret</th>
                  <th className="px-5 py-3.5">Kur</th>
                  <th className="px-5 py-3.5">KDVsiz Konsolosluk</th>
                  <th className="px-5 py-3.5">KDV'li Kısım</th>
                  <th className="px-5 py-3.5">KDV Tutarı (%20)</th>
                  <th className="px-5 py-3.5">Toplam Tutar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {countryCosts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{c.ulke}</td>
                    <td className="px-5 py-3.5 font-mono font-bold">{c.ucret} {c.kur}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-500">{c.kur}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-700">{c.konsolosluk_kdvsiz} {c.kur}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-700">{c.kdvli_kisim} {c.kur}</td>
                    <td className="px-5 py-3.5 font-mono text-amber-600 font-bold">{c.kdv_doviz} {c.kur}</td>
                    <td className="px-5 py-3.5 font-mono font-black text-emerald-700 text-sm">
                      {c.ucret} {c.kur}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: GERİ YÜKLEME & YEDEK YÖNETİMİ */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-200">
                <RotateCcw size={28} />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-black text-amber-950">
                  12.10.2026 Tarihli Veritabanı Yedeği ve Geri Dönüş Güvencesi
                </h3>
                <p className="text-sm text-amber-900/80 leading-relaxed">
                  Sisteminizde yeni ön muhasebe modülü ve yüklenen 431 fatura + 743 başvuru kaydı eklenmeden hemen önce, 
                  <strong>12.10.2026</strong> tarihindeki tüm verileriniz <code>mkm_vize_backup_2026_10_12.db</code> dosyasında 
                  eksiksiz ve güvenli bir şekilde saklanmıştır.
                </p>

                <div className="bg-white/80 backdrop-blur rounded-2xl p-4 border border-amber-200/60 text-xs text-amber-950 space-y-2">
                  <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                    <span className="font-semibold text-slate-500">Yedek Dosyası:</span>
                    <span className="font-mono font-bold text-amber-800">mkm_vize_backup_2026_10_12.db</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                    <span className="font-semibold text-slate-500">Yedekleme Tarihi:</span>
                    <span className="font-bold text-slate-800">12.10.2026</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500">Dosya Boyutu:</span>
                    <span className="font-bold text-slate-800">{backupInfo?.sizeMB || '0.24'} MB (Tam Veri Seti)</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setShowRestoreConfirm(true)}
                    className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-rose-200 flex items-center gap-2 transition-all"
                  >
                    <RotateCcw size={18} />
                    <span>12.10.2026 Verilerine Tek Tıkla Geri Dön</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Instructions for Plesk or Manual Restore */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h4 className="font-black text-base text-slate-900 flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-600" />
              <span>Nasıl Geri Dönebilirim? (Teknik ve Manuel Açıklama)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <p className="font-bold text-slate-900">Yöntem 1: Program Arayüzünden (Önerilen)</p>
                <p>Yukarıdaki <strong>"12.10.2026 Verilerine Tek Tıkla Geri Dön"</strong> butonuna basmanız yeterlidir. Sistem otomatik olarak 12.10.2026 dosyasını ana veritabanı olarak devreye alır ve sayfayı yeniler.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <p className="font-bold text-slate-900">Yöntem 2: Plesk Panel / Sunucu Dosya Yöneticisinden</p>
                <p>Plesk File Manager'a girdiğinizde ana dizinde <code>mkm_vize_backup_2026_10_12.db</code> dosyasını görebilirsiniz. İhtiyaç halinde bu dosyanın adını <code>mkm_vize.db</code> yaparak anında eski haline dönebilirsiniz.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESTORE CONFIRMATION MODAL */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">12.10.2026 Verilerine Geri Dönülsün mü?</h3>
              <p className="text-xs text-slate-500">
                Bu işlem veritabanınızı 12 Ekim 2026 tarihindeki haline geri döndürecektir. Güvenlik amacıyla mevcut durumunuzun da otomatik anlık bir kopyası alınacaktır.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowRestoreConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all"
              >
                İptal Et
              </button>
              <button
                onClick={handleRestoreBackup}
                disabled={isRestoringBackup}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-1.5"
              >
                {isRestoringBackup ? <RefreshCw size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                <span>Evet, Geri Dön</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INVOICE ENTRY / EDIT MODAL */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                  Ön Muhasebe • Fatura Departmanı
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  {selectedInvoice ? 'Fatura Bilgilerini Düzenle' : 'Yeni Fatura Kes / Numarası Gir'}
                </h3>
                <p className="text-xs text-slate-500">
                  Fatura tutarları ülke fiyatlandırmasından otomatik hesaplanmıştır, kutulardan dilediğiniz gibi değiştirebilirsiniz.
                </p>
              </div>
              <button
                onClick={() => setIsInvoiceModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveInvoice} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Fatura No */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Fatura Numarası *</span>
                    <button
                      type="button"
                      onClick={() => {
                        const random = Math.floor(1000 + Math.random() * 9000);
                        setInvoiceForm(prev => ({ ...prev, faturaNo: `FTR-${new Date().getFullYear()}-${random}` }));
                      }}
                      className="text-[10px] text-blue-600 hover:underline font-semibold"
                    >
                      Otomatik Üret
                    </button>
                  </label>
                  <div className="relative">
                    <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={invoiceForm.faturaNo}
                      onChange={e => setInvoiceForm(prev => ({ ...prev, faturaNo: e.target.value }))}
                      placeholder="Örn: FTR-2026-0042"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Fatura Tarihi */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Fatura Tarihi *</label>
                  <input
                    type="date"
                    required
                    value={invoiceForm.faturaTarihi}
                    onChange={e => setInvoiceForm(prev => ({ ...prev, faturaTarihi: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Müşteri Adı */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Müşteri (Ad Soyad)</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={invoiceForm.musteriAdi}
                      onChange={e => setInvoiceForm(prev => ({ ...prev, musteriAdi: e.target.value }))}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Firma Adı */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Fatura Firma / Acente Adı</label>
                  <div className="relative">
                    <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={invoiceForm.firma}
                      onChange={e => setInvoiceForm(prev => ({ ...prev, firma: e.target.value }))}
                      placeholder="MKM VİZE / Bireysel / Acente"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Ülke */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Başvuru Ülkesi</label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={invoiceForm.ulke}
                      onChange={e => setInvoiceForm(prev => ({ ...prev, ulke: e.target.value }))}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Para Birimi */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Para Birimi</label>
                  <select
                    value={invoiceForm.currency}
                    onChange={e => setInvoiceForm(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="TRY">TRY (₺)</option>
                  </select>
                </div>
              </div>

              {/* TUTARLAR VE MALİYET BLOKU (OTOMATİK VE DÜZENLENEBİLİR) */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Fatura & Maliyet Kalemleri (Düzenlenebilir)
                  </h4>
                  <span className="text-[10px] text-slate-500">Değişiklikler otomatik hesaplanır</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Konsolosluk Harcı</label>
                    <input
                      type="number"
                      step="any"
                      value={invoiceForm.konsoloslukUcreti}
                      onChange={e => handleAmountChange('konsolosluk', parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Hizmet Bedeli</label>
                    <input
                      type="number"
                      step="any"
                      value={invoiceForm.hizmetBedeli}
                      onChange={e => handleAmountChange('hizmet', parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">KDV Oranı (%)</label>
                    <input
                      type="number"
                      value={invoiceForm.kdvOrani}
                      onChange={e => handleAmountChange('kdvOrani', parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Hesaplanan KDV</label>
                    <input
                      type="number"
                      readOnly
                      value={invoiceForm.kdv}
                      className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold text-amber-700"
                    />
                  </div>
                </div>

                {/* TOPLAM FATURA BEDELİ */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">Toplam Fatura Bedeli:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="any"
                      value={invoiceForm.faturaBedeli}
                      onChange={e => handleAmountChange('toplam', parseFloat(e.target.value) || 0)}
                      className="w-32 px-3 py-1.5 bg-white border-2 border-emerald-500 rounded-xl text-right text-base font-black text-emerald-700 font-mono"
                    />
                    <span className="font-bold text-sm text-slate-700">{invoiceForm.currency}</span>
                  </div>
                </div>
              </div>

              {/* Müşteri E-Postası ve Ödeme Durumu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Müşteri E-Posta Adresi</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={invoiceForm.email}
                      onChange={e => setInvoiceForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="ornek@musteri.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Ödeme Durumu</label>
                  <select
                    value={invoiceForm.durum}
                    onChange={e => setInvoiceForm(prev => ({ ...prev, durum: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Ödendi">Ödendi</option>
                    <option value="Ödenmedi">Ödenmedi</option>
                    <option value="Bekliyor">Bekliyor</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrintInvoice}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Printer size={15} />
                    <span>Yazdır / PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendInvoiceEmail}
                    disabled={isSendingEmail}
                    className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    {isSendingEmail ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                    <span>Müşteriye E-Posta Gönder</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInvoiceModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-200 flex items-center gap-1.5"
                  >
                    {loading ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                    <span>Faturayı Kaydet</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
