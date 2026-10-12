import React, { useState, useEffect } from 'react';
import { X, Printer, Download, FileText, Building2, User, Calendar, CheckCircle2, AlertCircle, Edit3, Mail, Loader2, CreditCard } from 'lucide-react';
import { Applicant, AccountingRecord, CountryPrice, BankAccount } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getCurrencyForCountry, getCurrencySymbol } from '../constants';
import { calculatePrice } from '../utils/price';

interface Props {
  applicant: Applicant;
  accountingRecord?: AccountingRecord | null;
  prices?: CountryPrice[];
  onClose: () => void;
  onEditAccounting?: () => void;
}

export default function ProformaInvoiceModal({ applicant, accountingRecord, prices, onClose, onEditAccounting }: Props) {
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.bank_accounts) {
          try {
            const parsed = JSON.parse(data.bank_accounts);
            if (Array.isArray(parsed)) {
              setBankAccounts(parsed.filter((b: BankAccount) => b.isActive !== false));
            }
          } catch (e) {
            console.error('Banka hesapları ayrıştırılamadı:', e);
          }
        }
      })
      .catch(err => console.error('Ayarlar çekilemedi:', err));
  }, []);

  // Hesaplama değerleri
  const countryPrice = prices?.find(p => p.ulke === applicant.ulke);
  const currency = applicant.currency || accountingRecord?.currency || countryPrice?.currency || getCurrencyForCountry(applicant.ulke);
  const symbol = getCurrencySymbol(currency, applicant.ulke);
  const companyName = applicant.firmaAdi || accountingRecord?.firma || 'MKM VİZE';
  
  // Merkezi calculatePrice fonksiyonu ile KDV istisnalı Konsolosluk Ücreti ve Net Hizmet Bedeli ayrımı
  const calc = calculatePrice(
    applicant.konsoloslukUcreti ?? countryPrice?.konsoloslukUcreti ?? 0,
    applicant.hizmetBedeli ?? countryPrice?.hizmetBedeli,
    applicant.kdvOrani ?? countryPrice?.kdvOrani ?? 20,
    applicant.fiyat || countryPrice?.toplam || accountingRecord?.toplam
  );

  const konsoloslukHarci = calc.konsoloslukUcreti;
  const netTutar = calc.hizmetBedeli; // NET Hizmet Bedeli (KDV Matrahı)
  const kdvOrani = calc.kdvOrani;
  const kdvHariçToplam = calc.kdvHariçToplam; // 250 €
  const kdv = calc.kdv; // 32 €
  const total = calc.toplam; // 282 €
  
  const faturaNo = accountingRecord?.faturaNo || `PRF-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const faturaTarihi = accountingRecord?.faturaTarihi || new Date().toISOString().split('T')[0];

  const formatDateString = (dateStr?: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = async () => {
    if (sendingEmail) return;
    setSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await fetch('/api/applicants/send-proforma-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ takipKodu: applicant.takipKodu }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailStatus({ 
          type: 'success', 
          message: data.message || 'Proforma fatura e-postası hem müşteriye hem de yöneticiye başarıyla gönderildi.' 
        });
      } else {
        setEmailStatus({ 
          type: 'error', 
          message: data.error || 'E-posta gönderimi başarısız oldu. SMTP ayarlarını kontrol edin.' 
        });
      }
    } catch (err: any) {
      setEmailStatus({ 
        type: 'error', 
        message: 'E-posta gönderilirken bir hata oluştu: ' + (err.message || 'Sunucuya ulaşılamadı') 
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDownloadPdf = () => {
    const trToEn = (text: string) => {
      if (!text) return '-';
      return text
        .replace(/Ğ/g, 'G').replace(/ğ/g, 'g')
        .replace(/Ü/g, 'U').replace(/ü/g, 'u')
        .replace(/Ş/g, 'S').replace(/ş/g, 's')
        .replace(/İ/g, 'I').replace(/ı/g, 'i')
        .replace(/Ö/g, 'O').replace(/ö/g, 'o')
        .replace(/Ç/g, 'C').replace(/ç/g, 'c');
    };

    const doc = new jsPDF();

    // Başlık
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text(trToEn("MKM VIZE & DANISMANLIK"), 14, 20);

    doc.setFontSize(18);
    doc.setTextColor(225, 29, 72); // rose-600 / prominent header
    doc.text("PROFORMA FATURA", 196, 20, { align: 'right' });

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(trToEn("Global Vize & Danismanlik Hizmetleri"), 14, 26);
    doc.text(trToEn(`Fatura No: ${faturaNo}`), 196, 26, { align: 'right' });
    doc.text(trToEn(`Tarih: ${formatDateString(faturaTarihi)}`), 196, 31, { align: 'right' });
    doc.text(trToEn(`Takip Kodu: ${applicant.takipKodu}`), 196, 36, { align: 'right' });

    // NOT / UYARI (Fatura No / Tarih / Takip Kodu'nun hemen altına)
    doc.setFillColor(254, 242, 242); // rose-50
    doc.setDrawColor(254, 205, 211); // rose-200
    doc.roundedRect(14, 39, 182, 7, 1.5, 1.5, 'FD');

    doc.setFontSize(8);
    doc.setTextColor(190, 18, 60); // rose-700
    doc.text(trToEn("NOT: Fatura bilgilerini kontrol edin ve hata varsa bildirin."), 105, 43.5, { align: 'center' });

    // Çizgi
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, 48, 196, 48);

    // Müşteri Bilgileri
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(trToEn("MUSTERI BILGILERI"), 14, 55);
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(trToEn(`Sayin: ${applicant.ad} ${applicant.soyad}`), 14, 62);
    doc.text(trToEn(`Firma / Acente: ${companyName}`), 14, 68);
    doc.text(trToEn(`Pasaport No: ${applicant.pasaportNo || '-'}`), 14, 74);
    doc.text(trToEn(`E-posta: ${applicant.email || '-'}`), 14, 80);

    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(trToEn("BASVURU DETAYLARI"), 110, 55);
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(trToEn(`Hedef Ulke: ${applicant.ulke}`), 110, 62);
    doc.text(trToEn(`Vize Kategorisi: ${applicant.vizeKategorisi || 'Turistik Vize'}`), 110, 68);
    doc.text(trToEn(`Randevu Tarihi: ${applicant.randevuTarihi || '-'} ${applicant.saat || ''}`), 110, 74);
    doc.text(trToEn(`Odeme Durumu: ${applicant.odemeDurumu}`), 110, 80);

    // Tablo Gövdeleri
    const tableBody = [];
    tableBody.push([
      '1',
      trToEn(`${applicant.ulke} Vize Basvuru Danismanlik Hizmet Bedeli\n(Konsolosluk randevusu, evrak incelemesi ve dosya hazirlama danismanlik hizmeti.)`),
      '1 Adet',
      `${netTutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${symbol}`,
      `%${kdvOrani}`,
      `${(netTutar + kdv).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${symbol}`
    ]);

    if (konsoloslukHarci > 0) {
      tableBody.push([
        '2',
        trToEn(`${applicant.ulke} Konsolosluk Harci / Ucreti\n(Resmi konsolosluk ve basvuru merkezi harc tutari - KDV'den Istisna)`),
        '1 Adet',
        `${konsoloslukHarci.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${symbol}`,
        '%0 (Istisna)',
        `${konsoloslukHarci.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${symbol}`
      ]);
    }

    // Tablo
    autoTable(doc, {
      startY: 86,
      head: [[trToEn('#'), trToEn('Hizmet / Aciklama'), trToEn('Miktar'), trToEn('Birim Fiyat'), trToEn('KDV'), trToEn('Toplam')]],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8.5 },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 120;

    // Toplamlar Box
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    let yPos = finalY + 12;

    if (konsoloslukHarci > 0) {
      doc.text(trToEn("Konsolosluk Harci (KDV Istisnasi):"), 20, yPos);
      doc.text(`${konsoloslukHarci.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${symbol}`, 196, yPos, { align: 'right' });
      yPos += 6;
    }

    doc.text(trToEn("Hizmet Bedeli (KDV Matrahi):"), 20, yPos);
    doc.text(`${netTutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${symbol}`, 196, yPos, { align: 'right' });
    yPos += 7;

    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(trToEn("KDV HARIC TUTAR:"), 20, yPos);
    doc.text(`${kdvHariçToplam.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${symbol}`, 196, yPos, { align: 'right' });
    yPos += 6;

    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(trToEn(`KDV Tutari (%${kdvOrani}):`), 20, yPos);
    doc.text(`+${kdv.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${symbol}`, 196, yPos, { align: 'right' });
    yPos += 8;

    doc.setFontSize(9.5);
    doc.setTextColor(225, 29, 72);
    doc.text(trToEn("KDV DAHIL TOPLAM TUTAR:"), 20, yPos);
    doc.text(`${total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${symbol}`, 196, yPos, { align: 'right' });

    // BANKA HESAP BİLGİLERİ KUTUSU (PDF)
    const bankBoxY = yPos + 10;
    const accountsToPrint = bankAccounts.filter(b => b.isActive !== false);
    const bankBoxHeight = (accountsToPrint.length > 0 ? 12 + (accountsToPrint.length * 14) : 26) + 8;

    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(14, bankBoxY, 182, bankBoxHeight, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(trToEn("ODEME BILGILERI (HAVALE / EFT):"), 18, bankBoxY + 6);

    let currentBankY = bankBoxY + 12;

    if (accountsToPrint.length === 0) {
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(trToEn("Banka: Garanti BBVA - Besiktas Subesi"), 18, currentBankY);
      doc.text(trToEn("IBAN: TR89 0006 2000 0000 1234 5678 90"), 18, currentBankY + 4.5);
      doc.text(trToEn("Alici: MKM Vize & Danismanlik A.S."), 18, currentBankY + 9);
      currentBankY += 15;
    } else {
      accountsToPrint.forEach((acc) => {
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        const branchStr = acc.branch ? ` (${acc.branch})` : '';
        doc.text(trToEn(`Banka: ${acc.bankName}${branchStr} [${acc.currency}]`), 18, currentBankY);
        doc.text(trToEn(`IBAN: ${acc.iban}`), 18, currentBankY + 4);
        doc.text(trToEn(`Alici: ${acc.accountHolder}`), 18, currentBankY + 8);
        currentBankY += 13;
      });
    }

    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(trToEn(`* Odeme aciklamasina lutfen "${applicant.ad} ${applicant.soyad} - ${applicant.takipKodu}" yaziniz.`), 18, currentBankY);

    let nextBoxY = bankBoxY + bankBoxHeight + 6;

    // NOTLAR / ÖZEL İSTEKLER (Eğer varsa)
    if (applicant.notlar && applicant.notlar.trim().length > 0) {
      const notesText = trToEn(applicant.notlar.trim());
      const splitNotes = doc.splitTextToSize(`NOTLAR / OZEL ISTEKLER: ${notesText}`, 174);
      const notesHeight = Math.max(12, splitNotes.length * 4.5 + 6);

      doc.setFillColor(248, 250, 252); // slate-50
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.roundedRect(14, nextBoxY, 182, notesHeight, 2, 2, 'FD');

      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85); // slate-700
      doc.text(splitNotes, 18, nextBoxY + 6);

      nextBoxY += notesHeight + 6;
    }

    // Alt Bilgi
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(trToEn("MKM Vize & Danismanlik Ltd. Sti. • Bu belge resmi proforma faturadir."), 105, 280, { align: 'center' });

    doc.save(`Proforma_Fatura_${faturaNo}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      {/* Printable Container */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 print:shadow-none print:m-0 print:w-full print:max-w-none print:max-h-none print:border-none print:overflow-visible">
        
        {/* Top Header Bar (Hidden on Print) */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">PROFORMA FATURA ÖNİZLEME</h3>
              <p className="text-[11px] text-slate-400 font-mono">{applicant.takipKodu} • {applicant.ad} {applicant.soyad}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEditAccounting && (
              <button 
                onClick={onEditAccounting}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 border border-slate-700"
              >
                <Edit3 size={14} />
                <span className="hidden sm:inline">Düzenle</span>
              </button>
            )}
            <button 
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 border border-slate-700"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Yazdır</span>
            </button>
            <button 
              onClick={handleDownloadPdf}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <Download size={14} />
              <span className="hidden sm:inline">PDF İndir</span>
            </button>
            <button 
              onClick={handleSendEmail}
              disabled={sendingEmail}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
              title="Hem müşteriye hem de yöneticiye proforma fatura e-postası gönderir"
            >
              {sendingEmail ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
              <span>{sendingEmail ? 'Gönderiliyor...' : 'E-Posta Gönder'}</span>
            </button>
            <button 
              onClick={onClose} 
              className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors ml-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* E-Posta Gönderim Durum Bildirimi */}
        {emailStatus && (
          <div className={`p-3 mx-4 sm:mx-8 mt-3 rounded-xl border text-xs flex items-center justify-between font-medium print:hidden ${
            emailStatus.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              {emailStatus.type === 'success' ? (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle size={18} className="text-rose-600 shrink-0" />
              )}
              <span>{emailStatus.message}</span>
            </div>
            <button onClick={() => setEmailStatus(null)} className="p-1 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Invoice Paper Canvas */}
        <div className="p-5 sm:p-8 space-y-5 bg-white text-slate-800 font-sans overflow-y-auto print:p-6 print:overflow-visible" id="invoice-printable-area">
          
          {/* Company Branding & Large Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-slate-900 pb-5">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-base tracking-tighter shadow-sm">
                  MKM
                </div>
                <div>
                  <h1 className="text-base font-black text-slate-900 tracking-tight leading-none">MKM VİZE & DANIŞMANLIK</h1>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Global Vize Başvuru Merkezi</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                Barbaros Bulvarı No: 142/A Beşiktaş / İSTANBUL<br />
                Tel: +90 (212) 555 00 00 | E-posta: info@mkmvize.com | Vergi D.: Beşiktaş V.D. 622 048 9102
              </p>
            </div>

            <div className="text-left sm:text-right space-y-0.5">
              <h2 className="text-xl sm:text-2xl font-black text-rose-600 tracking-wider uppercase">
                PROFORMA FATURA
              </h2>
              <div className="pt-0.5 text-[11px] font-mono space-y-0.5 text-slate-600">
                <p><span className="font-bold text-slate-400">Fatura No:</span> <span className="font-bold text-slate-900">{faturaNo}</span></p>
                <p><span className="font-bold text-slate-400">Tarih:</span> {formatDateString(faturaTarihi)}</p>
                <p><span className="font-bold text-slate-400">Takip Kodu:</span> {applicant.takipKodu}</p>
              </div>
            </div>
          </div>

          {/* WARNING NOTE BANNER RIGHT BELOW FATURA HEADER */}
          <div className="p-2.5 bg-rose-50/90 rounded-xl border border-rose-200 text-center shadow-2xs">
            <p className="text-xs font-black text-rose-700 tracking-wide uppercase flex items-center justify-center gap-1.5">
              ⚠️ NOT: Fatura bilgilerini kontrol edin ve hata varsa bildirin.
            </p>
          </div>

          {/* Customer & Application Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pb-1.5 border-b border-slate-200">
                <User size={13} className="text-slate-600" />
                MÜŞTERİ BİLGİLERİ
              </h3>
              <div className="text-xs space-y-1">
                <p className="text-xs font-bold text-slate-900">{applicant.ad} {applicant.soyad}</p>
                <p className="text-slate-700 font-semibold"><span className="font-semibold text-slate-500">Firma Adı / Acente:</span> <span className="font-bold text-slate-900">{companyName}</span></p>
                <p className="text-slate-600"><span className="font-semibold text-slate-500">Pasaport No:</span> {applicant.pasaportNo || '-'}</p>
                <p className="text-slate-600"><span className="font-semibold text-slate-500">E-posta:</span> {applicant.email || '-'}</p>
                {applicant.ikametSehri && (
                  <p className="text-slate-600"><span className="font-semibold text-slate-500">Şehir:</span> {applicant.ikametSehri}</p>
                )}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pb-1.5 border-b border-slate-200">
                <Building2 size={13} className="text-slate-600" />
                BAŞVURU VE DETAYLAR
              </h3>
              <div className="text-xs space-y-1">
                <p className="text-slate-700"><span className="font-semibold text-slate-500">Hedef Ülke:</span> <span className="font-bold text-slate-900">{applicant.ulke}</span></p>
                <p className="text-slate-700"><span className="font-semibold text-slate-500">Vize Kategorisi:</span> {applicant.vizeKategorisi || 'Turistik Vize'}</p>
                <p className="text-slate-700"><span className="font-semibold text-slate-500">Randevu Tarihi:</span> {applicant.randevuTarihi ? `${applicant.randevuTarihi} ${applicant.saat || ''}` : '-'}</p>
                <div className="pt-0.5 flex items-center gap-1.5">
                  <span className="font-semibold text-slate-500">Ödeme Durumu:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    applicant.odemeDurumu === 'Ödendi' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {applicant.odemeDurumu}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notlar / Özel İstekler Card */}
          {applicant.notlar && applicant.notlar.trim().length > 0 && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pb-1 border-b border-slate-200">
                <FileText size={13} className="text-slate-600" />
                NOTLAR / ÖZEL İSTEKLER
              </h3>
              <p className="text-xs text-slate-700 whitespace-pre-wrap font-medium pt-1">
                {applicant.notlar}
              </p>
            </div>
          )}

          {/* Itemized Invoice Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-2.5 text-center w-10">#</th>
                  <th className="p-2.5">Hizmet / Açıklama</th>
                  <th className="p-2.5 text-center">Miktar</th>
                  <th className="p-2.5 text-right">Birim Fiyat</th>
                  <th className="p-2.5 text-center">KDV</th>
                  <th className="p-2.5 text-right">Toplam ({symbol})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-700 text-xs">
                <tr>
                  <td className="p-2.5 text-center font-bold text-slate-400">1</td>
                  <td className="p-2.5">
                    <p className="font-bold text-slate-900">{applicant.ulke} Vize Başvuru Danışmanlık Hizmet Bedeli</p>
                    <p className="text-[10px] text-slate-500">Konsolosluk randevusu, evrak incelemesi ve dosya hazırlama danışmanlık hizmeti.</p>
                  </td>
                  <td className="p-2.5 text-center font-semibold text-xs">1 Adet</td>
                  <td className="p-2.5 text-right font-mono text-xs">{netTutar.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {symbol}</td>
                  <td className="p-2.5 text-center font-bold text-slate-500 text-xs">%{kdvOrani}</td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-900 text-xs">{(netTutar + kdv).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {symbol}</td>
                </tr>
                {konsoloslukHarci > 0 && (
                  <tr>
                    <td className="p-2.5 text-center font-bold text-slate-400">2</td>
                    <td className="p-2.5">
                      <p className="font-bold text-slate-900">{applicant.ulke} Konsolosluk Harcı / Ücreti</p>
                      <p className="text-[10px] text-slate-500">Resmi konsolosluk ve başvuru merkezi harç tutarı (KDV'den İstisna).</p>
                    </td>
                    <td className="p-2.5 text-center font-semibold text-xs">1 Adet</td>
                    <td className="p-2.5 text-right font-mono text-xs">{konsoloslukHarci.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {symbol}</td>
                    <td className="p-2.5 text-center font-bold text-emerald-600 text-xs">%0 (İstisna)</td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-900 text-xs">{konsoloslukHarci.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {symbol}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Summary Box */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-1">
            <div className="w-full sm:w-1/2 space-y-2 text-xs text-slate-500 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>ÖDEME BİLGİLERİ (HAVALE / EFT)</span>
                <span className="text-[10px] text-slate-400 font-semibold font-mono">{bankAccounts.length} Hesap</span>
              </p>
              {bankAccounts.length === 0 ? (
                <div className="space-y-1 text-[11px]">
                  <p><span className="font-semibold">Banka:</span> Garanti BBVA - Beşiktaş Şubesi</p>
                  <p><span className="font-semibold">IBAN:</span> TR89 0006 2000 0000 1234 5678 90</p>
                  <p><span className="font-semibold">Alıcı:</span> MKM Vize & Danışmanlık A.Ş.</p>
                  <p><span className="font-semibold">Açıklama:</span> {applicant.ad} {applicant.soyad} - {applicant.takipKodu}</p>
                </div>
              ) : (
                <div className="space-y-2.5 pt-0.5">
                  {bankAccounts.map((account, idx) => (
                    <div key={account.id || idx} className="space-y-0.5 text-[11px] border-b border-slate-200/60 last:border-b-0 pb-1.5 last:pb-0">
                      <p className="font-bold text-slate-900 flex items-center justify-between">
                        <span>{account.bankName} {account.branch ? `(${account.branch})` : ''}</span>
                        <span className="px-1.5 py-0.2 bg-slate-200 text-slate-800 text-[9px] font-black rounded uppercase">{account.currency}</span>
                      </p>
                      <p className="font-mono font-bold text-slate-900 tracking-wider"><span className="font-semibold text-slate-500 font-sans">IBAN:</span> {account.iban}</p>
                      <p><span className="font-semibold text-slate-500">Alıcı:</span> {account.accountHolder}</p>
                      {account.swift && <p><span className="font-semibold text-slate-500">SWIFT:</span> <span className="font-mono font-bold">{account.swift}</span></p>}
                    </div>
                  ))}
                  <p className="text-[10px] text-slate-500 font-medium italic pt-1 border-t border-slate-200/60">
                    * Ödeme açıklamasına lütfen <strong className="text-slate-800 font-bold">{applicant.ad} {applicant.soyad} - {applicant.takipKodu}</strong> yazınız.
                  </p>
                </div>
              )}
            </div>

            <div className="w-full sm:w-80 space-y-2 text-xs">
              {konsoloslukHarci > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Konsolosluk Harcı (KDV İstisnası):</span>
                  <span className="font-mono font-bold text-slate-800">{konsoloslukHarci.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {symbol}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Hizmet Bedeli (KDV Matrahı):</span>
                <span className="font-mono font-bold text-slate-800">{netTutar.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {symbol}</span>
              </div>
              <div className={`border-t border-slate-200 pt-1.5 pb-0.5 flex justify-between font-bold text-slate-900 ${applicant.musteriTipi === 'Bireysel' ? 'bg-amber-100/90 border-2 border-amber-400' : 'bg-slate-100/80'} px-2.5 py-1 rounded-lg`}>
                <span className="text-[11px] font-extrabold text-slate-800">KDV HARİÇ TUTAR:</span>
                <span className="font-mono text-xs font-black text-slate-900">{kdvHariçToplam.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {symbol}</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-0.5">
                <span>KDV Tutarı (%{kdvOrani}):</span>
                <span className="font-mono font-bold text-slate-800">+{kdv.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {symbol}</span>
              </div>
              <div className={`border-t-2 border-slate-900 pt-1.5 flex justify-between items-baseline ${applicant.musteriTipi === 'Kurumsal' ? 'bg-rose-100/90 border-2 border-rose-500' : 'bg-rose-50/60'} px-2.5 py-1.5 rounded-lg border border-rose-100`}>
                <span className="font-black text-[11px] text-rose-900 uppercase">KDV DAHİL TOPLAM TUTAR:</span>
                <span className="font-mono font-black text-base text-rose-600">{total.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {symbol}</span>
              </div>
            </div>
          </div>

          {/* Footer Signature Box */}
          <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-xs text-slate-400">
            <div>
              <p className="font-bold text-slate-600 text-xs">MKM Vize Operasyon Birimi</p>
              <p className="text-[10px]">Otomatik Sistem Çıktısı</p>
            </div>
            <div className="text-right">
              <div className="w-28 border-b border-dashed border-slate-300 mb-1"></div>
              <p className="font-bold text-slate-500 text-[11px]">Kaşe & İmza</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
