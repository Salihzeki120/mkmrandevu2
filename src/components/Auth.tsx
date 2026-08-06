import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  Building2, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle, 
  Globe, 
  FileCheck,
  TrendingUp,
  Fingerprint
} from 'lucide-react';
import { BRAND_CONFIG } from '../brandConfig';

interface AuthProps {
  onLogin: (user: any) => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [firmaUnvani, setFirmaUnvani] = useState('');
  const [acenteAdi, setAcenteAdi] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    let endpoint = '';
    let payload: any = {};
    let isMultipart = false;

    if (isForgotPassword) {
      endpoint = '/api/auth/forgot-password';
      payload = { email: adminEmail };
    } else if (isLogin) {
      endpoint = '/api/auth/login';
      payload = { email: adminEmail, password };
    } else {
      endpoint = '/api/auth/register';
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('adminEmail', adminEmail);
      formData.append('firmaUnvani', firmaUnvani);
      formData.append('acenteAdi', acenteAdi);
      payload = formData;
      isMultipart = true;
    }
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: isMultipart ? {} : { 'Content-Type': 'application/json' },
        body: isMultipart ? payload : JSON.stringify(payload),
        credentials: 'include'
      });
      
      const data = await res.json();
      
      if (res.ok) {
        if (isForgotPassword) {
          setSuccess(data.message || 'Sıfırlama e-postası başarıyla gönderildi.');
          setTimeout(() => {
            setIsForgotPassword(false);
            setIsLogin(true);
          }, 3000);
        } else if (isLogin) {
          onLogin(data.user);
        } else {
          setSuccess('Kayıt başarıyla tamamlandı! Giriş yapabilirsiniz.');
          setTimeout(() => {
            setIsLogin(true);
            setPassword('');
          }, 2000);
        }
      } else {
        setError(data.error || 'İşlem başarısız oldu. Bilgilerinizi kontrol edin.');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('Bağlantı hatası oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-0 md:p-6 lg:p-12 selection:bg-brand-500 selection:text-white">
      {/* Container */}
      <div className="w-full max-w-6xl bg-white md:rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(15,23,42,0.1)] border border-slate-100 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[100vh] md:min-h-[700px]">
        
        {/* Left Side: Branding & Info */}
        <div 
          className="md:col-span-5 relative overflow-hidden p-8 md:p-12 flex flex-col justify-between text-white border-b md:border-b-0 md:border-r border-brand-800"
          style={{ backgroundColor: '#a11f1f' }}
        >
          {/* Ambient background glows */}
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-white/10 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-black/30 blur-[100px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-white/5 blur-[80px] pointer-events-none" />

          {/* Logo & Header */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg shadow-black/10">
                <Globe size={26} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent leading-none">
                  {BRAND_CONFIG.name}
                </h1>
                <p className="text-[9px] text-white/80 uppercase tracking-widest font-extrabold mt-0.5">
                  {BRAND_CONFIG.acenteUnvani}
                </p>
              </div>
            </div>
          </div>

          {/* Core App value propositions */}
          <div className="relative z-10 my-8 md:my-0 space-y-8">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30">
                <Sparkles size={12} className="text-white" />
                <span>Sürüm 2.4 Güncel</span>
              </span>
              <h2 className="text-2xl md:text-3xl font-black leading-tight text-white">
                Profesyonel vize danışmanlığı artık çok kolay.
              </h2>
              <p className="text-white/95 text-sm leading-relaxed font-medium">
                Başvurularınızı, cari hesaplarınızı, randevularınızı ve tüm süreçlerinizi akıllı sistemimizle tek bir merkezden güvenle yönetin.
              </p>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mt-0.5 border border-white/15">
                  <FileCheck size={16} className="text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Gelişmiş Başvuru Takibi</h4>
                  <p className="text-xs text-white/85 mt-0.5">Vize süreçlerindeki her adımı detaylı durum kartlarıyla kontrol edin.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mt-0.5 border border-white/15">
                  <TrendingUp size={16} className="text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Entegre Cari & Muhasebe</h4>
                  <p className="text-xs text-white/85 mt-0.5">Gelir, gider ve bakiye durumlarınızı anlık grafiklerle izleyin.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mt-0.5 border border-white/15">
                  <Fingerprint size={16} className="text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Güvenli Altyapı</h4>
                  <p className="text-xs text-white/85 mt-0.5">Verileriniz üst düzey güvenlik önlemleri ve yetkilendirmeyle korunur.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer of left side */}
          <div className="relative z-10 text-xs text-white/80 flex justify-between items-center pt-4 md:pt-0 border-t border-white/20 md:border-0">
            <span className="font-semibold">© {new Date().getFullYear()} {BRAND_CONFIG.shortName}</span>
            <div className="flex gap-4 font-semibold">
              <span className="hover:text-white cursor-pointer transition-all">Güvenlik</span>
              <span className="hover:text-white cursor-pointer transition-all">Destek</span>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Forms */}
        <div className="md:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-slate-50/50">
          
          <div className="w-full max-w-md mx-auto space-y-8">
            <AnimatePresence mode="wait">
              {isForgotPassword ? (
                // Forgot Password Component Layout
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <button 
                      onClick={() => setIsForgotPassword(false)}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-all group"
                    >
                      <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                      <span>Giriş ekranına geri dön</span>
                    </button>
                    <h2 className="text-2xl font-bold text-slate-900 mt-4">Şifremi Unuttum</h2>
                    <p className="text-slate-500 text-sm">
                      Sisteme kayıtlı e-posta adresinizi girerek şifre sıfırlama talimatlarını talep edebilirsiniz.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">E-posta Adresi</label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors">
                          <Mail size={18} />
                        </div>
                        <input 
                          required
                          type="email" 
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all shadow-sm font-medium text-slate-800 text-sm placeholder:text-slate-400"
                          placeholder="admin@firma.com"
                        />
                      </div>
                    </div>

                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3.5 bg-rose-50 border border-rose-100 text-xs text-rose-600 rounded-xl font-semibold flex gap-2 items-center"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}

                    {success && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3.5 bg-emerald-50 border border-emerald-100 text-xs text-emerald-600 rounded-xl font-semibold flex gap-2 items-center"
                      >
                        <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                        <span>{success}</span>
                      </motion.div>
                    )}

                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-brand-600 text-white font-bold rounded-2xl shadow-lg shadow-brand-600/15 hover:bg-brand-700 hover:shadow-brand-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'SIFIRLAMA BAĞLANTISI GÖNDER'
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                // Login / Register Form Controls
                <motion.div
                  key={isLogin ? "login" : "register"}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                      {isLogin ? 'Hoş Geldiniz' : 'Hesap Oluşturun'}
                    </h2>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      {isLogin 
                        ? 'Sisteme erişmek için kimlik bilgilerinizi girin.' 
                        : 'Yönetim merkezine katılmak için firmanızı ve hesabınızı kaydedin.'}
                    </p>
                  </div>

                  {/* Switcher Tab */}
                  <div className="p-1 bg-slate-200/60 rounded-2xl flex">
                    <button 
                      type="button"
                      onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
                      className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Giriş Yap
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
                      className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${!isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Kayıt Ol
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Registration Only: Username */}
                    {!isLogin && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">Kullanıcı Adı</label>
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors">
                            <User size={18} />
                          </div>
                          <input 
                            required
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all shadow-sm font-medium text-slate-800 text-sm placeholder:text-slate-400"
                            placeholder="Kullanıcı adınız"
                          />
                        </div>
                      </div>
                    )}

                    {/* Email / Login Identifier */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">
                        {isLogin ? 'E-posta veya Kullanıcı Adı' : 'E-posta Adresi'}
                      </label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors">
                          <Mail size={18} />
                        </div>
                        <input 
                          required
                          type={isLogin ? "text" : "email"} 
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all shadow-sm font-medium text-slate-800 text-sm placeholder:text-slate-400"
                          placeholder={isLogin ? "E-posta veya kullanıcı adı" : "admin@firma.com"}
                          autoComplete={isLogin ? "username" : "email"}
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">Şifre</label>
                        {isLogin && (
                          <button 
                            type="button"
                            onClick={() => setIsForgotPassword(true)}
                            className="text-[11px] font-bold text-brand-600 hover:text-brand-800 transition-colors"
                          >
                            Şifremi Unuttum
                          </button>
                        )}
                      </div>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors">
                          <Lock size={18} />
                        </div>
                        <input 
                          required
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all shadow-sm font-medium text-slate-800 text-sm placeholder:text-slate-400"
                          placeholder="••••••••"
                          autoComplete="current-password"
                        />
                      </div>
                    </div>

                    {/* Registration Only: Company Info */}
                    {!isLogin && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 pt-1"
                      >
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">Firma Ünvanı</label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors">
                              <Building2 size={18} />
                            </div>
                            <input 
                              required
                              type="text" 
                              value={firmaUnvani}
                              onChange={(e) => setFirmaUnvani(e.target.value)}
                              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all shadow-sm font-medium text-slate-800 text-sm placeholder:text-slate-400"
                              placeholder="Örn. MKM Vize Limited Şirketi"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">Acente Adı</label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors">
                              <Globe size={18} />
                            </div>
                            <input 
                              required
                              type="text" 
                              value={acenteAdi}
                              onChange={(e) => setAcenteAdi(e.target.value)}
                              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all shadow-sm font-medium text-slate-800 text-sm placeholder:text-slate-400"
                              placeholder="Örn. mkmvize"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3.5 bg-rose-50 border border-rose-100 text-xs text-rose-600 rounded-xl font-semibold flex gap-2 items-center"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}

                    {success && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3.5 bg-emerald-50 border border-emerald-100 text-xs text-emerald-600 rounded-xl font-semibold flex gap-2 items-center"
                      >
                        <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                        <span>{success}</span>
                      </motion.div>
                    )}

                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-brand-600 text-white font-bold rounded-2xl shadow-lg shadow-brand-600/15 hover:bg-brand-700 hover:shadow-brand-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                          <span>{isLogin ? 'OTURUM AÇ' : 'KAYIT OL'}</span>
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
        
      </div>
    </div>
  );
}
