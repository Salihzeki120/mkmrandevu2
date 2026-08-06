import React from 'react';
import { User, Shield, Building2, Mail, Hash, UserCircle2, Settings2, LogOut } from 'lucide-react';
import { User as UserType } from '../types';

interface UserProfileProps {
  user: UserType;
  onLogout: () => void;
}

export default function UserProfile({ user, onLogout }: UserProfileProps) {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="relative">
          <div className="w-32 h-32 rounded-[32px] bg-gradient-to-br from-brand-500 to-fuchsia-500 flex items-center justify-center text-white text-5xl font-black shadow-xl shrink-0">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 text-white rounded-xl shadow-lg border-4 border-white">
            <Shield size={16} />
          </div>
        </div>
        
        <div className="text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">{user.username}</h2>
            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit mx-auto md:mx-0 ${user.role === 'admin' ? 'bg-rose-100 text-rose-600' : 'bg-brand-100 text-brand-600'}`}>
              {user.role === 'admin' ? 'Sistem Yöneticisi' : 'Kullanıcı'}
            </span>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Profil ve Hesap Bilgileri</p>
        </div>

        <button 
          onClick={onLogout}
          className="md:ml-auto p-4 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all group"
          title="Çıkış Yap"
        >
          <LogOut size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Details */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <Settings2 size={20} className="text-slate-400" />
            <h3 className="font-bold text-slate-800">Hesap Detayları</h3>
          </div>
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl">
                <UserCircle2 size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Kullanıcı Adı</p>
                <p className="text-sm font-bold text-slate-800">{user.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Admin E-posta</p>
                <p className="text-sm font-bold text-slate-800">{user.adminEmail || 'Tanımlanmamış'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl">
                <Hash size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Kullanıcı ID</p>
                <p className="text-sm font-bold text-slate-800">#{user.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Corporate Details */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <Building2 size={20} className="text-slate-400" />
            <h3 className="font-bold text-slate-800">Kurumsal Bilgiler</h3>
          </div>
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl">
                <Building2 size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Firma Ünvanı</p>
                <p className="text-sm font-bold text-slate-800">{user.firmaUnvani || 'Tanımlanmamış'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl">
                <UserCircle2 size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Acente Adı</p>
                <p className="text-sm font-bold text-slate-800">{user.acenteAdi || 'Tanımlanmamış'}</p>
              </div>
            </div>
            
            <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100">
              <p className="text-[10px] text-brand-700 font-medium leading-relaxed italic">
                Kurumsal bilgilerinizi güncellemek için sistem yöneticisine başvurun.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
