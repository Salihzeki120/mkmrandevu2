import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, TrendingUp, Wallet, PieChart as PieChartIcon, ArrowUpRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Applicant, AccountingRecord, CountryPrice } from '../types';

interface FinancialSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicants: Applicant[];
  accounting: AccountingRecord[];
  prices: CountryPrice[];
}

export default function FinancialSummaryModal({ isOpen, onClose, applicants, accounting, prices }: FinancialSummaryModalProps) {
  const getCurrencySymbol = (currency?: string) => {
    switch (currency) {
      case 'EUR': return '€';
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'TRY': return '₺';
      default: return '€';
    }
  };

  // Calculate Financials
  const totalsCollected: Record<string, number> = {};
  const totalsPotential: Record<string, number> = {};

  // 1. Collected from accounting (Always TL)
  accounting.forEach(item => {
    const cur = 'TRY';
    totalsCollected[cur] = (totalsCollected[cur] || 0) + item.toplam;
  });

  const accountingTakipKodus = new Set(accounting.map(a => a.takipKodu));
  
  // 2. Collected from applicants marked as 'Ödendi' but not in accounting (FX)
  const paidWithoutAccounting = applicants.filter(a => 
    a.odemeDurumu === 'Ödendi' && !accountingTakipKodus.has(a.takipKodu)
  );
  
  paidWithoutAccounting.forEach(applicant => {
    const price = prices.find(p => p.ulke === applicant.ulke);
    if (price) {
      const cur = price.currency || 'TRY';
      totalsCollected[cur] = (totalsCollected[cur] || 0) + price.toplam;
    }
  });

  // 3. Potential revenue
  applicants
    .filter(a => ['Randevu Alındı', 'İşlemde', 'Tamamlandı'].includes(a.islemDurumu))
    .forEach(applicant => {
      // If already has accounting, it's already "collected" in TL
      if (accountingTakipKodus.has(applicant.takipKodu)) {
        // We don't add it to potential if it's already collected
        return;
      }
      
      const price = prices.find(p => p.ulke === applicant.ulke);
      if (price) {
        const cur = price.currency || 'TRY';
        totalsPotential[cur] = (totalsPotential[cur] || 0) + price.toplam;
      }
    });

  // Pending is Potential - Collected (but only for the same currency)
  // Actually, it's simpler to just show them separately as "Expected FX" and "Actual TL"
  
  const formatTotals = (totals: Record<string, number>) => {
    const currencies = Object.keys(totals).filter(c => totals[c] > 0);
    if (currencies.length === 0) return '0,00 ₺';
    return currencies.map(cur => 
      `${totals[cur].toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${getCurrencySymbol(cur)}`
    ).join(' + ');
  };

  // For chart, we sum everything (rough estimate if mixed)
  const totalCollectedSum = Object.values(totalsCollected).reduce((a, b) => a + b, 0);
  const totalPotentialSum = totalCollectedSum + Object.values(totalsPotential).reduce((a, b) => a + b, 0);
  const totalPendingSum = totalPotentialSum - totalCollectedSum;
  const collectionRate = totalPotentialSum > 0 ? (totalCollectedSum / totalPotentialSum) * 100 : 0;

  const chartData = [
    { name: 'Tahsil Edilen', value: totalCollectedSum, color: '#ef4444' },
    { name: 'Bekleyen Alacak', value: totalPendingSum, color: '#f59e0b' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="financial-summary-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <motion.div
            key="financial-summary-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
          >
          {/* Header */}
          <div className="bg-[#2c3e50] p-4 text-center relative shrink-0">
            <h2 className="text-white text-sm md:text-xl font-bold tracking-widest uppercase">
              MKM VİZE FİNANSAL ANALİZ PANELİ
            </h2>
            <button 
              onClick={onClose}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-1"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-4 md:p-8 space-y-6 md:space-y-8 overflow-y-auto">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-slate-200 rounded-lg overflow-hidden">
              <div className="border-r border-b md:border-b-0 border-slate-200 text-center">
                <div className="bg-slate-50 py-2 border-b border-slate-200">
                  <span className="text-[9px] md:text-[10px] font-bold text-slate-600 uppercase">TOPLAM TAHSİLAT</span>
                </div>
                <div className="p-3 md:p-4">
                  <span className="text-base md:text-xl font-bold text-emerald-600">
                    {formatTotals(totalsCollected)}
                  </span>
                </div>
              </div>
              <div className="border-b md:border-r md:border-b-0 border-slate-200 text-center">
                <div className="bg-slate-50 py-2 border-b border-slate-200">
                  <span className="text-[9px] md:text-[10px] font-bold text-slate-600 uppercase">BEKLEYEN ALACAK</span>
                </div>
                <div className="p-3 md:p-4">
                  <span className="text-base md:text-xl font-bold text-rose-500">
                    {formatTotals(totalsPotential)}
                  </span>
                </div>
              </div>
              <div className="border-r border-slate-200 text-center">
                <div className="bg-slate-50 py-2 border-b border-slate-200">
                  <span className="text-[9px] md:text-[10px] font-bold text-slate-600 uppercase">POTANSİYEL CİRO</span>
                </div>
                <div className="p-3 md:p-4">
                  <span className="text-base md:text-xl font-bold text-slate-800">
                    {formatTotals({...totalsCollected, ...totalsPotential})}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-slate-50 py-2 border-b border-slate-200">
                  <span className="text-[9px] md:text-[10px] font-bold text-slate-600 uppercase">TAHSİLAT %</span>
                </div>
                <div className="p-3 md:p-4">
                  <span className="text-base md:text-xl font-bold text-brand-600">
                    {collectionRate.toLocaleString('tr-TR', { maximumFractionDigits: 1 })}%
                  </span>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="border border-slate-200 rounded-xl p-4 md:p-6 bg-white">
              <h3 className="text-slate-500 text-sm font-medium mb-4">Genel Finansal Durum</h3>
              <div className="h-[300px] md:h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={140}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `${value.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Footer Info */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-4 border-t border-slate-100">
              <span>MKM VİZE FİNANSAL ANALİZ SİSTEMİ</span>
              <span>SON GÜNCELLEME: {(() => {
                const d = new Date();
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
              })()}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
