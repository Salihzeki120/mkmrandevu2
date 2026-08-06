import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  parseISO,
  isToday
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Applicant } from '../types';

interface Props {
  applicants: Applicant[];
  onSelectApplicant: (applicant: Applicant) => void;
  onDoubleClickDay?: (day: Date) => void;
}

const parseSafeDate = (dateStr?: string): Date | null => {
  if (!dateStr) return null;
  const str = dateStr.trim();
  if (str.includes('T')) {
    const datePart = str.split('T')[0];
    const parts = datePart.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
  }
  let parts: string[] = [];
  if (str.includes('-')) parts = str.split('-');
  else if (str.includes('.')) parts = str.split('.');
  else if (str.includes('/')) parts = str.split('/');
  
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    }
  }
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
};

export default function CalendarView({ applicants, onSelectApplicant, onDoubleClickDay }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const onDateClick = (day: Date) => {
    setSelectedDate(day);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Randevu Alındı':
        return 'bg-blue-500';
      case 'Tamamlandı':
        return 'bg-emerald-500';
      case 'İptal Edildi':
        return 'bg-rose-500';
      case 'İşlemde':
      case 'Dosya Hazırlanıyor':
      case 'Konsoloslukta':
      case 'Pasaport Bekleniyor':
        return 'bg-orange-500';
      case 'Talep Bekliyor':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Randevu Alındı':
        return 'bg-blue-50 border-blue-100 text-blue-700';
      case 'Tamamlandı':
        return 'bg-emerald-50 border-emerald-100 text-emerald-700';
      case 'İptal Edildi':
        return 'bg-rose-50 border-rose-100 text-rose-700';
      case 'İşlemde':
      case 'Dosya Hazırlanıyor':
      case 'Konsoloslukta':
      case 'Pasaport Bekleniyor':
        return 'bg-orange-50 border-orange-100 text-orange-700';
      case 'Talep Bekliyor':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-100 text-blue-700';
    }
  };

  const monthCount = applicants.filter(a => {
    if (!a.randevuTarihi) return false;
    const d = parseSafeDate(a.randevuTarihi);
    if (!d) return false;
    return d.getFullYear() === currentMonth.getFullYear() && d.getMonth() === currentMonth.getMonth();
  }).length;

  const renderHeader = () => {
    return (
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-6 py-4 border-b border-slate-100 bg-white rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
            <CalendarIcon size={20} />
          </div>
          <h2 className="text-lg font-bold text-slate-800 capitalize flex items-center gap-2">
            <span>{format(currentMonth, 'MMMM yyyy', { locale: tr })}</span>
            <span className="text-red-600 font-extrabold text-base">
              - {monthCount} Vize
            </span>
          </h2>
        </div>

        {/* Yoğunluk Lejandı */}
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
          <span className="text-slate-400 uppercase tracking-wider text-[9px]">Yoğunluk:</span>
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Az (1-2)
          </span>
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Orta (3-4)
          </span>
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Yüksek (5+)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-brand-600 transition-all border border-transparent hover:border-slate-200"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1.5 text-xs font-bold text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
          >
            BUGÜN
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-brand-600 transition-all border border-transparent hover:border-slate-200"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    return (
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
        {days.map((day, idx) => (
          <div key={idx} className="py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    const rows = [];
    let days = [];

    calendarDays.forEach((day, i) => {
      const formattedDate = format(day, 'yyyy-MM-dd');
      const dayApplicants = applicants.filter(a => {
        if (!a.randevuTarihi) return false;
        const d = parseSafeDate(a.randevuTarihi);
        return d ? isSameDay(d, day) : a.randevuTarihi === formattedDate;
      });
      const hasAppointments = dayApplicants.length > 0;
      
      const statusCounts = dayApplicants.reduce((acc, curr) => {
        acc[curr.islemDurumu] = (acc[curr.islemDurumu] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const colIndex = i % 7;
      let tooltipPositionClass = "left-1/2 -translate-x-1/2";
      if (colIndex === 0 || colIndex === 1) {
        tooltipPositionClass = "left-2 translate-x-0";
      } else if (colIndex === 5 || colIndex === 6) {
        tooltipPositionClass = "right-2 left-auto translate-x-0";
      }
      
      days.push(
        <div
          key={day.toString()}
          className={`relative min-h-[100px] md:min-h-[120px] p-2 border-r border-b border-slate-100 transition-all cursor-pointer group
            ${!isSameMonth(day, monthStart) ? 'bg-slate-50/30' : 'bg-white'}
            ${isSameDay(day, selectedDate) ? 'bg-brand-50/50' : 'hover:bg-slate-50/50'}
            ${hasAppointments && isSameMonth(day, monthStart) ? 'ring-1 ring-inset ring-brand-100/50' : ''}
          `}
          onClick={() => onDateClick(day)}
          onDoubleClick={() => {
            if (onDoubleClickDay) {
              onDoubleClickDay(day);
            }
          }}
        >
          {/* Üst Çoklu Durum Yoğunluk Çubuğu */}
          {hasAppointments && (
            <div className="absolute top-0 left-0 right-0 h-1.5 flex overflow-hidden rounded-t z-10 bg-slate-100">
              {Object.entries(statusCounts).map(([status, count]) => {
                const percentage = (count / dayApplicants.length) * 100;
                return (
                  <div
                    key={status}
                    style={{ width: `${percentage}%` }}
                    className={`h-full ${getStatusColor(status)}`}
                    title={`${status}: ${count}`}
                  />
                );
              })}
            </div>
          )}

          {/* Tooltip on Hover */}
          {hasAppointments && (
            <div className={`absolute bottom-full mb-2 ${tooltipPositionClass} bg-slate-900/95 text-white text-[10px] p-2.5 rounded-xl shadow-xl opacity-0 scale-95 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-200 ease-out z-30 whitespace-nowrap border border-slate-800 flex flex-col gap-1 min-w-[130px] backdrop-blur-sm`}>
              <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1 font-black uppercase text-[8px] tracking-widest text-slate-400">
                <span>{dayApplicants.length} Randevu</span>
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
              </div>
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center gap-1.5 font-bold">
                  <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(status)}`} />
                  <span className="text-slate-300">{status}:</span>
                  <span className="ml-auto text-white font-black">{count}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mb-1 mt-1">
            <span className={`
              text-xs font-bold w-7 h-7 flex items-center justify-center rounded-full transition-all
              ${isToday(day) ? 'bg-brand-600 text-white shadow-lg shadow-brand-200' : 'text-slate-500'}
              ${isSameDay(day, selectedDate) && !isToday(day) ? 'bg-slate-200 text-slate-800' : ''}
            `}>
              {format(day, 'd')}
            </span>
            {dayApplicants.length > 0 && (
              <div className="flex items-center gap-1">
                {/* Yoğunluk Rozeti */}
                <span className={`text-[9px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5 border ${
                  dayApplicants.length >= 5 
                    ? 'bg-rose-50 text-rose-700 border-rose-200 font-black animate-pulse' 
                    : dayApplicants.length >= 3 
                      ? 'bg-amber-50 text-amber-700 border-amber-200 font-extrabold' 
                      : 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    dayApplicants.length >= 5 ? 'bg-rose-500' : dayApplicants.length >= 3 ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  {dayApplicants.length}
                </span>

                {/* Durum Noktaları */}
                <div className="flex -space-x-1">
                  {dayApplicants.slice(0, 3).map((a, idx) => (
                    <div 
                      key={idx} 
                      className={`w-2 h-2 rounded-full border border-white shadow-xs ${getStatusColor(a.islemDurumu)}`}
                      title={`${a.ad} ${a.soyad} (${a.islemDurumu})`}
                    />
                  ))}
                  {dayApplicants.length > 3 && (
                    <div className="w-2 h-2 rounded-full border border-white bg-slate-400 flex items-center justify-center text-[5px] font-bold text-white">
                      +
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-1 overflow-hidden">
            {dayApplicants.slice(0, 3).map((a, idx) => (
              <div 
                key={idx} 
                className={`text-[9px] font-bold truncate border rounded px-1.5 py-0.5 shadow-sm flex items-center gap-1 ${getStatusBg(a.islemDurumu)}`}
                title={`${a.saat} - ${a.ad} ${a.soyad} (${a.islemDurumu})`}
              >
                <span className="shrink-0 opacity-70">{a.saat}</span>
                <span className="truncate">{a.ad} {a.soyad}</span>
              </div>
            ))}
            {dayApplicants.length > 3 && (
              <div className="text-[9px] font-bold text-slate-400 pl-1">
                + {dayApplicants.length - 3} daha...
              </div>
            )}
          </div>
        </div>
      );

      if ((i + 1) % 7 === 0) {
        rows.push(
          <div className="grid grid-cols-7" key={day.toString()}>
            {days}
          </div>
        );
        days = [];
      }
    });

    return <div className="bg-white">{rows}</div>;
  };

  const selectedDayApplicants = applicants.filter(a => {
    if (!a.randevuTarihi) return false;
    const d = parseSafeDate(a.randevuTarihi);
    return d ? isSameDay(d, selectedDate) : a.randevuTarihi === format(selectedDate, 'yyyy-MM-dd');
  }).sort((a, b) => (a.saat || '').localeCompare(b.saat || ''));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800">Günlük Detay</h3>
              <p className="text-xs text-slate-400 font-medium">{format(selectedDate, 'd MMMM yyyy, EEEE', { locale: tr })}</p>
            </div>
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
              <Clock size={20} />
            </div>
          </div>

          <div className="space-y-3">
            {selectedDayApplicants.length > 0 ? (
              selectedDayApplicants.map(a => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={a.id}
                  onClick={() => onSelectApplicant(a)}
                  className={`p-4 border rounded-2xl transition-all cursor-pointer group ${getStatusBg(a.islemDurumu)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black bg-white/50 px-2 py-1 rounded-lg shadow-sm">
                        {a.saat}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-lg">
                        {a.takipKodu}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">
                      {a.islemDurumu}
                    </span>
                  </div>
                  <h4 className="font-bold group-hover:translate-x-1 transition-transform">
                    {a.ad} {a.soyad}
                  </h4>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-[10px] font-bold opacity-70">
                      <Globe size={12} />
                      {a.ulke}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold opacity-70">
                      <User size={12} />
                      {a.firmaAdi}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-12 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-3">
                  <CalendarIcon size={24} />
                </div>
                <p className="text-sm font-bold text-slate-400">Bu gün için randevu bulunmuyor.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-4">Renk Kodları</h3>
          <div className="space-y-2">
            {[
              { label: 'Randevu Alındı', color: 'bg-blue-500' },
              { label: 'Tamamlandı', color: 'bg-emerald-500' },
              { label: 'Süreçte / İşlemde', color: 'bg-orange-500' },
              { label: 'Talep Bekliyor', color: 'bg-yellow-500' },
              { label: 'İptal Edildi', color: 'bg-rose-500' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-xs font-bold text-slate-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-brand-600 rounded-2xl p-6 text-white shadow-lg shadow-brand-100">
          <h3 className="font-bold mb-2">Randevu Özeti</h3>
          <p className="text-xs text-brand-100 mb-4">Bu ay toplam randevu durumu.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Bu Ay</p>
              <p className="text-xl font-black text-rose-300">
                {monthCount}
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Bugün</p>
              <p className="text-xl font-black">
                {applicants.filter(a => {
                  if (!a.randevuTarihi) return false;
                  const d = parseSafeDate(a.randevuTarihi);
                  return d ? isSameDay(d, new Date()) : false;
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
