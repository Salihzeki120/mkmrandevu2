import React, { useState } from 'react';
import { Building2, Plus, Trash2, Edit2, Check, Copy, CreditCard, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BankAccount } from '../types';

interface Props {
  bankAccounts: BankAccount[];
  onChange: (accounts: BankAccount[]) => void;
  onSave?: () => void;
  saving?: boolean;
}

const CURRENCIES = [
  { code: 'TRY', symbol: '₺', label: 'Türk Lirası (TRY)' },
  { code: 'EUR', symbol: '€', label: 'Euro (EUR)' },
  { code: 'USD', symbol: '$', label: 'Amerikan Doları (USD)' },
  { code: 'GBP', symbol: '£', label: 'İngiliz Sterlini (GBP)' }
];

export default function BankAccountManager({ bankAccounts, onChange, onSave, saving }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<BankAccount>>({
    bankName: '',
    accountHolder: 'MKM VİZE DANIŞMANLIK LTD. ŞTİ.',
    iban: '',
    currency: 'TRY',
    branch: '',
    swift: '',
    isActive: true
  });

  const handleCopyIban = (iban: string, id: string) => {
    navigator.clipboard.writeText(iban);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartAdd = () => {
    setFormData({
      bankName: '',
      accountHolder: 'MKM VİZE DANIŞMANLIK LTD. ŞTİ.',
      iban: 'TR',
      currency: 'TRY',
      branch: '',
      swift: '',
      isActive: true
    });
    setEditingId(null);
    setIsAddingNew(true);
  };

  const handleStartEdit = (account: BankAccount) => {
    setFormData({ ...account });
    setEditingId(account.id);
    setIsAddingNew(false);
  };

  const handleSaveAccount = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!formData.bankName || !formData.accountHolder || !formData.iban) {
      alert('Lütfen Banka Adı, Hesap Sahibi ve IBAN alanlarını doldurunuz.');
      return;
    }

    // Clean up IBAN formatting
    let cleanedIban = formData.iban.trim().toUpperCase();
    if (!cleanedIban.startsWith('TR')) {
      cleanedIban = 'TR' + cleanedIban;
    }

    const updatedAccount: BankAccount = {
      id: editingId || `bank_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      bankName: formData.bankName.trim(),
      accountHolder: formData.accountHolder.trim(),
      iban: cleanedIban,
      currency: formData.currency || 'TRY',
      branch: formData.branch?.trim() || '',
      swift: formData.swift?.trim() || '',
      isActive: formData.isActive !== false
    };

    if (editingId) {
      onChange(bankAccounts.map(acc => acc.id === editingId ? updatedAccount : acc));
    } else {
      onChange([...bankAccounts, updatedAccount]);
    }

    setIsAddingNew(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bu banka hesabını silmek istediğinize emin misiniz? Proforma fatura PDF çıktılarında görünmeyecektir.')) {
      onChange(bankAccounts.filter(acc => acc.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    onChange(bankAccounts.map(acc => {
      if (acc.id === id) {
        return { ...acc, isActive: acc.isActive === false ? true : false };
      }
      return acc;
    }));
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-2xl border border-rose-500/20">
            <Building2 size={22} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">Firma Banka Hesap Bilgileri</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Proforma fatura PDF çıktılarına ve e-postalarına eklenecek resmi banka hesapları.
            </p>
          </div>
        </div>

        {!isAddingNew && !editingId && (
          <button
            type="button"
            onClick={handleStartAdd}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-2 shrink-0"
          >
            <Plus size={16} />
            <span>YENİ BANKA HESABI EKLE</span>
          </button>
        )}
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Form Modal/Card for Add & Edit */}
        <AnimatePresence>
          {(isAddingNew || editingId) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 bg-slate-900 text-white rounded-3xl shadow-xl space-y-5 border border-slate-800"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-rose-400 flex items-center gap-2">
                  <CreditCard size={18} />
                  {isAddingNew ? 'Yeni Banka Hesabı Ekle' : 'Banka Hesabını Düzenle'}
                </h4>
                <button
                  type="button"
                  onClick={() => { setIsAddingNew(false); setEditingId(null); }}
                  className="text-xs text-slate-400 hover:text-white underline font-semibold"
                >
                  Vazgeç
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Banka Adı *</label>
                  <input
                    type="text"
                    required
                    placeholder="ör. Garanti BBVA, Türkiye İş Bankası, Ziraat"
                    value={formData.bankName || ''}
                    onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 text-sm text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Para Birimi *</label>
                  <select
                    value={formData.currency || 'TRY'}
                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 text-sm text-white"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Hesap Sahibi / Alıcı Unvanı *</label>
                  <input
                    type="text"
                    required
                    placeholder="ör. MKM VİZE DANIŞMANLIK HİZMETLERİ LTD. ŞTİ."
                    value={formData.accountHolder || ''}
                    onChange={e => setFormData({ ...formData, accountHolder: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 text-sm text-white font-semibold"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">IBAN Numarası *</label>
                  <input
                    type="text"
                    required
                    placeholder="TR89 0006 2000 0000 1234 5678 90"
                    value={formData.iban || ''}
                    onChange={e => setFormData({ ...formData, iban: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 text-sm text-white font-mono font-bold tracking-wider"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Şube / Şehir (Opsiyonel)</label>
                  <input
                    type="text"
                    placeholder="ör. Beşiktaş Şubesi / İstanbul"
                    value={formData.branch || ''}
                    onChange={e => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 text-sm text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">SWIFT / BIC Kodu (Opsiyonel)</label>
                  <input
                    type="text"
                    placeholder="ör. TCZBTR2A"
                    value={formData.swift || ''}
                    onChange={e => setFormData({ ...formData, swift: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 text-sm text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.isActive !== false}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                  />
                  <span>Proforma Fatura PDF ve e-postalarında aktif olarak gösterilsin</span>
                </label>

                <button
                  type="button"
                  onClick={handleSaveAccount}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                  <Check size={16} />
                  <span>{editingId ? 'GÜNCELLE' : 'KAYDET'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bank Accounts List */}
        {bankAccounts.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">Henüz tanımlanmış bir banka hesabı yok.</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Müşterilerinize oluşturulan proforma faturalarda görünecek hesaplarınızı eklemek için "Yeni Banka Hesabı Ekle" butonunu kullanın.
              </p>
            </div>
            <button
              type="button"
              onClick={handleStartAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
            >
              <Plus size={14} />
              <span>İlk Banka Hesabını Ekle</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bankAccounts.map((account) => {
              const isInactive = account.isActive === false;
              const currencyObj = CURRENCIES.find(c => c.code === account.currency) || { symbol: account.currency };

              return (
                <div
                  key={account.id}
                  className={`relative p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                    isInactive
                      ? 'bg-slate-50/60 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                        {currencyObj.symbol}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{account.bankName}</h4>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-black rounded-full uppercase border border-slate-200">
                            {account.currency}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]" title={account.accountHolder}>
                          {account.accountHolder}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(account.id)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                          isInactive ? 'text-slate-400 hover:text-slate-600 bg-slate-200/50' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                        }`}
                        title={isInactive ? 'Aktifleştir' : 'Pasife Al'}
                      >
                        {isInactive ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(account)}
                        className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(account.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* IBAN Box */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
                    <div className="space-y-0.5 overflow-hidden">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">IBAN</p>
                      <p className="text-xs font-mono font-bold text-slate-900 truncate tracking-wider">
                        {account.iban}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyIban(account.iban, account.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                        copiedId === account.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-xs'
                      }`}
                    >
                      {copiedId === account.id ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedId === account.id ? 'Kopyalandı' : 'Kopyala'}</span>
                    </button>
                  </div>

                  {/* Extra Details */}
                  {(account.branch || account.swift) && (
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      {account.branch && (
                        <span><strong className="text-slate-700">Şube:</strong> {account.branch}</span>
                      )}
                      {account.swift && (
                        <span><strong className="text-slate-700">SWIFT:</strong> <span className="font-mono font-bold text-slate-800">{account.swift}</span></span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
