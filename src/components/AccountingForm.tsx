import React, { useState, useEffect } from 'react';
import { X, Wallet, CheckCircle2, AlertCircle } from 'lucide-react';
import { Applicant, CountryPrice } from '../types';
import { getCurrencyForCountry, getCurrencySymbol } from '../constants';
import { calculatePrice } from '../utils/price';

interface Props {
  applicant: Applicant;
  prices: CountryPrice[];
  accounting: any[];
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function AccountingForm({ applicant, prices, accounting, onClose, onSave }: Props) {
  const countryPrice = prices.find(p => p.ulke === applicant.ulke);
  const existingRecord = accounting.find(a => a.takipKodu === applicant.takipKodu);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cur = applicant.currency || existingRecord?.currency || countryPrice?.currency || getCurrencyForCountry(applicant.ulke);
  const symbol = getCurrencySymbol(cur, applicant.ulke);

  const [formData, setFormData] = useState({
    faturaNo: existingRecord?.faturaNo || '',
    tutar: existingRecord?.toplam || applicant.fiyat || countryPrice?.toplam || 0, // Önce mevcut kayıt, yoksa başvuru fiyatı
    tarih: existingRecord?.faturaTarihi || new Date().toISOString().split('T')[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'tutar' ? Number(value) : value
    }));
  };

  const handleSubmit = async (tip: 'FATURA_KAYDI' | 'TAHSILAT_TAMAM') => {
    if (isSubmitting) return;
    if (formData.tutar <= 0) {
      alert("Lütfen geçerli bir fatura tutarı giriniz.");
      return;
    }
    setIsSubmitting(true);

    const total = Number(formData.tutar);
    const konsoloslukUcreti = applicant.konsoloslukUcreti ?? countryPrice?.konsoloslukUcreti ?? 0;
    const kdvOrani = applicant.kdvOrani || countryPrice?.kdvOrani || 20;

    const calc = calculatePrice(konsoloslukUcreti, undefined, kdvOrani, total);

    try {
      await onSave({
        ...formData,
        islemTipi: tip,
        takipKodu: applicant.takipKodu,
        adSoyad: `${applicant.ad} ${applicant.soyad}`,
        ulke: applicant.ulke,
        islemDurumu: applicant.islemDurumu,
        pasaportNo: applicant.pasaportNo,
        firma: applicant.firmaAdi,
        konsoloslukUcreti: calc.konsoloslukUcreti,
        hizmetBedeli: calc.hizmetBedeli,
        netTutar: calc.hizmetBedeli,
        kdvOrani: calc.kdvOrani,
        kdv: calc.kdv,
        toplam: calc.toplam,
        faturaTarihi: formData.tarih,
        odemeDurumu: tip === 'TAHSILAT_TAMAM' ? 'Ödendi' : applicant.odemeDurumu,
        currency: cur
      });
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-600 text-white">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Wallet size={24} />
            Fatura & Tahsilat Yönetimi
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Müşteri</p>
                <p className="font-bold text-slate-800">{applicant.ad} {applicant.soyad}</p>
                <p className="text-xs text-slate-500 font-mono">{applicant.takipKodu} • {applicant.ulke}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Ödeme Durumu</p>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                  applicant.odemeDurumu === 'Ödendi' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {applicant.odemeDurumu}
                </span>
              </div>
            </div>
            
            {countryPrice && (
              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">ÜLKE FİYATI (REFERANS):</span>
                <span className="text-sm font-black text-brand-600">
                  {countryPrice.toplam.toLocaleString('tr-TR')} {getCurrencySymbol(countryPrice.currency, countryPrice.ulke)}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Fatura No</label>
              <input 
                name="faturaNo" 
                value={formData.faturaNo} 
                onChange={handleChange} 
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                placeholder="MKM-2026-..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Fatura Tutarı ({symbol})</label>
                <div className="relative">
                  <input 
                    type="number" 
                    name="tutar" 
                    value={formData.tutar || ''} 
                    onChange={handleChange} 
                    autoComplete="off"
                    placeholder="0.00"
                    className="w-full pl-4 pr-10 py-2.5 bg-white border-2 border-emerald-100 rounded-xl focus:border-emerald-500 outline-none font-bold text-emerald-700" 
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-emerald-600">{symbol}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Fatura Tarihi</label>
                <input 
                  type="date" 
                  name="tarih" 
                  value={formData.tarih} 
                  onChange={handleChange} 
                  autoComplete="off"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" 
                />
              </div>
            </div>
          </div>

          {applicant.odemeDurumu === 'Ödenmedi' && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
              <AlertCircle className="text-amber-600 shrink-0" size={20} />
              <p className="text-xs text-amber-700 leading-relaxed">
                <span className="font-bold">Ödeme Alındı</span> butonuna tıkladığınızda müşteri ödeme durumu otomatik olarak <span className="font-bold">"Ödendi"</span> olarak güncellenecektir.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4">
            <button 
              onClick={() => handleSubmit('FATURA_KAYDI')}
              disabled={isSubmitting}
              className="px-4 py-3 border-2 border-emerald-600 text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? 'İŞLENİYOR...' : 'FATURA KESİLDİ'}
            </button>
            <button 
              onClick={() => handleSubmit('TAHSILAT_TAMAM')}
              disabled={isSubmitting}
              className="px-4 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 size={20} />}
              {isSubmitting ? 'İŞLENİYOR...' : 'ÖDEME ALINDI'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
