import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { CountryPrice, Country } from '../types';
import { getCurrencyForCountry, getCurrencySymbol } from '../constants';
import { calculatePrice } from '../utils/price';

interface Props {
  price?: CountryPrice;
  countries: Country[];
  onClose: () => void;
  onSave: (data: Partial<CountryPrice>) => void;
  defaultVatRate?: number;
}

export default function PriceForm({ price, countries, onClose, onSave, defaultVatRate = 20 }: Props) {
  const initialCurrency = (price?.currency && price.currency !== 'TRY')
    ? price.currency
    : (price?.ulke ? getCurrencyForCountry(price.ulke) : 'EUR');

  const initialCalc = calculatePrice(
    price?.konsoloslukUcreti || 0,
    price?.hizmetBedeli || 0,
    price?.kdvOrani || defaultVatRate,
    price?.toplam
  );

  const [formData, setFormData] = useState<Partial<CountryPrice>>({
    ulke: '',
    konsoloslukUcreti: initialCalc.konsoloslukUcreti,
    hizmetBedeli: initialCalc.hizmetBedeli,
    kdvOrani: initialCalc.kdvOrani,
    kdv: initialCalc.kdv,
    toplam: initialCalc.toplam,
    currency: initialCurrency,
    ...price
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numValue = e.target.type === 'number' ? Number(value) : value;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: numValue };

      if (name === 'ulke' && typeof value === 'string') {
        newData.currency = getCurrencyForCountry(value);
      }
      
      // KDV ve Toplamı merkezi calculatePrice fonksiyonu ile otomatik hesapla
      if (name === 'hizmetBedeli' || name === 'konsoloslukUcreti' || name === 'kdvOrani') {
        const h = name === 'hizmetBedeli' ? Number(value) : (prev.hizmetBedeli || 0);
        const k = name === 'konsoloslukUcreti' ? Number(value) : (prev.konsoloslukUcreti || 0);
        const r = name === 'kdvOrani' ? Number(value) : (prev.kdvOrani || defaultVatRate);
        
        const calc = calculatePrice(k, h, r);
        newData.konsoloslukUcreti = calc.konsoloslukUcreti;
        newData.hizmetBedeli = calc.hizmetBedeli;
        newData.kdvOrani = calc.kdvOrani;
        newData.kdv = calc.kdv;
        newData.toplam = calc.toplam;
      }
      
      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const symbol = getCurrencySymbol(formData.currency, formData.ulke);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-brand-600 text-white">
          <h3 className="text-xl font-bold">{price ? 'Fiyat Güncelle' : 'Yeni Fiyat Tanımla'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Ülke</label>
              <select 
                required 
                name="ulke" 
                value={formData.ulke} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="">Seçiniz...</option>
                {countries.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Para Birimi</label>
              <select 
                required 
                name="currency" 
                value={formData.currency} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="EUR">Euro (€)</option>
                <option value="USD">Dolar ($)</option>
                <option value="GBP">Sterlin (£)</option>
                <option value="TRY">TL (₺)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Konsolosluk Ücreti ({symbol})</label>
              <input 
                type="number" 
                required 
                name="konsoloslukUcreti" 
                value={formData.konsoloslukUcreti} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Hizmet Bedeli ({symbol})</label>
              <input 
                type="number" 
                required 
                name="hizmetBedeli" 
                value={formData.hizmetBedeli} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">KDV Oranı (%)</label>
              <input 
                type="number" 
                required 
                name="kdvOrani" 
                value={formData.kdvOrani} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">KDV Tutarı ({symbol})</label>
              <input 
                type="number" 
                readOnly
                name="kdv" 
                value={formData.kdv?.toFixed(2)} 
                className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl outline-none cursor-not-allowed text-slate-500" 
              />
            </div>
          </div>

          <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100 flex justify-between items-center">
            <span className="text-sm font-bold text-brand-600 uppercase tracking-widest">Toplam</span>
            <span className="text-xl font-black text-brand-700">{(formData.toplam || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {symbol}</span>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-200 rounded-xl transition-all">İPTAL</button>
            <button type="submit" className="flex-1 flex items-center justify-center gap-2 px-8 py-2.5 bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all">
              <Save size={20} />
              KAYDET
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
