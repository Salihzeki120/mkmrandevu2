import React from 'react';
import { Clock, CheckCircle2, AlertCircle, RefreshCw, User } from 'lucide-react';
import { TimelineEvent } from '../types';

interface Props {
  events: TimelineEvent[];
  darkMode?: boolean;
}

export default function Timeline({ events, darkMode }: Props) {
  if (!events || events.length === 0) {
    return (
      <div className={`p-8 text-center ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
        <Clock size={32} className="mx-auto mb-2 opacity-20" />
        <p className="text-sm italic">Henüz bir işlem geçmişi bulunmuyor.</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Tamamlandı': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'Talep Bekliyor': return <AlertCircle size={16} className="text-amber-500" />;
      case 'İşlemde': return <RefreshCw size={16} className="text-brand-500 animate-spin-slow" />;
      case 'Randevu Alındı': return <Clock size={16} className="text-brand-500" />;
      default: return <Clock size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent dark:before:via-slate-700">
      {events.map((event, index) => (
        <div key={event.id} className="relative flex items-start gap-6 group">
          <div className={`absolute left-0 w-10 h-10 rounded-full border-4 ${darkMode ? 'bg-slate-800 border-slate-900' : 'bg-white border-slate-50'} flex items-center justify-center z-10 shadow-sm group-hover:scale-110 transition-transform`}>
            {getStatusIcon(event.status)}
          </div>
          
          <div className={`flex-1 pt-1 ml-10`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-1">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                event.status === 'Tamamlandı' ? 'text-emerald-600' :
                event.status === 'Talep Bekliyor' ? 'text-amber-600' :
                event.status === 'İşlemde' ? 'text-brand-600' : 'text-brand-600'
              }`}>
                {event.status}
              </span>
              <span className={`text-[10px] font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                {(() => {
                  const d = new Date(event.date);
                  const day = String(d.getDate()).padStart(2, '0');
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const year = d.getFullYear();
                  const hours = String(d.getHours()).padStart(2, '0');
                  const minutes = String(d.getMinutes()).padStart(2, '0');
                  return `${day}-${month}-${year} ${hours}:${minutes}`;
                })()}
              </span>
            </div>
            
            <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'} leading-relaxed`}>
              {event.description}
            </p>
            
            <div className="flex items-center gap-1.5 mt-2">
              <User size={12} className={darkMode ? 'text-slate-500' : 'text-slate-400'} />
              <span className={`text-[10px] font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'} uppercase`}>
                {event.user}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
