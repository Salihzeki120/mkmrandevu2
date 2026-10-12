import React, { useState } from 'react';
import { 
  format, 
  startOfWeek as startOfDateWeek, 
  endOfWeek as endOfDateWeek,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  addWeeks,
  subWeeks
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { X, Calendar as CalendarIcon, Clock, Globe, User, MapPin, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Applicant } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  applicants: Applicant[];
  onSelectApplicant: (applicant: Applicant) => void;
  darkMode?: boolean;
}

export default function WeeklyAppointmentsModal({ isOpen, onClose, applicants, onSelectApplicant, darkMode }: Props) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  
  const startOfWeek = startOfDateWeek(currentDate, { weekStartsOn: 1 });
  const endOfWeek = endOfDateWeek(currentDate, { weekStartsOn: 1 });

  const goToNextWeek = () => setCurrentDate(prev => addWeeks(prev, 1));
  const goToPrevWeek = () => setCurrentDate(prev => subWeeks(prev, 1));
  const goToToday = () => setCurrentDate(today);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      goToPrevWeek();
    } else if (info.offset.x < -100) {
      goToNextWeek();
    }
  };

  const weekDays = eachDayOfInterval({
    start: startOfWeek,
    end: endOfWeek
  }).slice(0, 5); // Monday to Friday

  const getDayAppointments = (day: Date) => {
    return applicants.filter(a => {
      if (a.islemDurumu !== 'Randevu Alındı' || !a.randevuTarihi) return false;
      try {
        const randevuDate = parseISO(a.randevuTarihi);
        return isSameDay(randevuDate, day);
      } catch (e) {
        return false;
      }
    }).sort((a, b) => (a.saat || '').localeCompare(b.saat || ''));
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Randevu Alındı':
        return 'bg-brand-50 border-brand-100 text-brand-700';
      case 'Tamamlandı':
        return 'bg-emerald-50 border-emerald-100 text-emerald-700';
      default:
        return 'bg-brand-50 border-brand-100 text-brand-700';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="weekly-appointments-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            key="weekly-appointments-content"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-5xl max-h-[90vh] ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-[32px] shadow-2xl border overflow-hidden flex flex-col`}
          >
          {/* Header */}
          <motion.div 
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            className={`p-6 border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'} flex items-center justify-between cursor-grab active:cursor-grabbing select-none relative z-10`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-200">
                <CalendarIcon size={24} />
              </div>
              <div>
                <h2 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-slate-800'} uppercase tracking-tight`}>Bu Haftanın Randevuları</h2>
                <div className="flex items-center gap-2">
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} font-bold`}>
                    {format(startOfWeek, 'd MMMM', { locale: tr })} - {format(endOfWeek, 'd MMMM yyyy', { locale: tr })}
                  </p>
                  {!isSameDay(startOfWeek, startOfDateWeek(today, { weekStartsOn: 1 })) && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); goToToday(); }}
                      className="text-[9px] font-black uppercase bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded-md hover:bg-brand-100 transition-colors"
                    >
                      Bügün
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevWeek(); }}
                className={`p-2.5 rounded-xl ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-50 text-slate-400'} transition-colors`}
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNextWeek(); }}
                className={`p-2.5 rounded-xl ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-50 text-slate-400'} transition-colors`}
              >
                <ChevronRight size={22} />
              </button>
              <div className={`w-px h-6 mx-1 ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`} />
              <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className={`p-2.5 rounded-xl ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-50 text-slate-400 font-bold'} transition-colors`}
              >
                <X size={22} />
              </button>
            </div>
          </motion.div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {weekDays.map((day) => {
                const appointments = getDayAppointments(day);
                const isTodayDate = isSameDay(day, today);

                return (
                  <div key={day.toString()} className="flex flex-col gap-4">
                    <div className={`text-center p-3 rounded-2xl ${isTodayDate ? 'bg-brand-600 text-white shadow-lg shadow-brand-100' : darkMode ? 'bg-slate-900 text-slate-400 border border-slate-700' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                      <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{format(day, 'EEEE', { locale: tr })}</p>
                      <p className="text-lg font-black leading-none">{format(day, 'd')}</p>
                    </div>

                    <div className="space-y-3">
                      {appointments.length > 0 ? (
                        appointments.map((a) => (
                          <motion.div
                            key={a.id}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => {
                              onSelectApplicant(a);
                              onClose();
                            }}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                              darkMode 
                                ? 'bg-slate-900/50 border-slate-700 hover:border-brand-500/50' 
                                : 'bg-white border-slate-100 hover:border-brand-200 hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${darkMode ? 'bg-slate-800 text-brand-400' : 'bg-brand-50 text-brand-600'}`}>
                                {a.saat}
                              </span>
                              <div className={`w-2 h-2 rounded-full bg-brand-500`} />
                            </div>
                            <h4 className={`text-xs font-black ${darkMode ? 'text-white' : 'text-slate-800'} mb-2 leading-tight uppercase`}>
                              {a.ad} {a.soyad}
                            </h4>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase">
                                <Globe size={10} className="shrink-0" />
                                <span className="truncate">{a.ulke}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase">
                                <Building2 size={10} className="shrink-0" />
                                <span className="truncate">{a.firmaAdi || '-'}</span>
                              </div>
                              {a.basvuruMerkezi && (
                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-brand-400 uppercase">
                                  <MapPin size={10} className="shrink-0" />
                                  <span className="truncate">{a.basvuruMerkezi}</span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className={`text-center py-6 px-4 rounded-2xl border border-dashed ${darkMode ? 'border-slate-700 text-slate-600' : 'border-slate-100 text-slate-300'}`}>
                          <p className="text-[10px] font-bold uppercase italic tracking-tighter">İşlemsiz Gün</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className={`p-4 text-center border-t ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
            <p className={`text-[10px] uppercase font-black tracking-[0.2em] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>MKM VİZE RANDEVU BİLGİ SİSTEMİ</p>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}


