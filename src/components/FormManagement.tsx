import React, { useState, useEffect } from 'react';
import { FileText, Globe, Building2, Plus, ArrowRight, Settings2, Trash2, Edit3, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type FormType = 'customer' | 'country' | 'company' | null;

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'date';
  required: boolean;
}

export default function FormManagement() {
  const [selectedType, setSelectedType] = useState<FormType>(null);
  const [fields, setFields] = useState<Record<string, FormField[]>>({
    customer: [
      { id: '1', label: 'Ad Soyad / Firma Ünvanı', type: 'text', required: true },
      { id: '2', label: 'E-posta Adresi', type: 'email', required: true },
      { id: '3', label: 'Telefon Numarası', type: 'number', required: true },
    ],
    country: [
      { id: '1', label: 'Ülke Adı', type: 'text', required: true },
      { id: '2', label: 'Vize Ücreti', type: 'number', required: true },
    ],
    company: [
      { id: '1', label: 'Firma Resmi Ünvanı', type: 'text', required: true },
      { id: '2', label: 'Vergi Numarası', type: 'text', required: true },
    ]
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const res = await fetch('/api/forms', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          const newFields = { ...fields };
          data.forEach((f: any) => {
            if (newFields[f.id]) {
              newFields[f.id] = f.fields;
            }
          });
          setFields(newFields);
        }
      }
    } catch (e) {
      console.error('Formlar yüklenemedi:', e);
    } finally {
      setLoading(false);
    }
  };

  const addField = () => {
    if (!selectedType) return;
    const newField: FormField = {
      id: Math.random().toString(36).substr(2, 9),
      label: 'Yeni Alan',
      type: 'text',
      required: false
    };
    setFields({
      ...fields,
      [selectedType]: [...fields[selectedType], newField]
    });
    setEditingId(newField.id);
  };

  const deleteField = (id: string) => {
    if (!selectedType) return;
    setFields({
      ...fields,
      [selectedType]: fields[selectedType].filter(f => f.id !== id)
    });
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    if (!selectedType) return;
    setFields({
      ...fields,
      [selectedType]: fields[selectedType].map(f => f.id === id ? { ...f, ...updates } : f)
    });
  };

  const handleSaveForm = async () => {
    if (!selectedType) return;
    setSaving(true);
    setMessage(null);
    const typeLabels: Record<string, string> = {
      customer: 'Müşteri',
      country: 'Ülke',
      company: 'Firma'
    };
    
    const formName = `${typeLabels[selectedType!] || selectedType} Başvuru Formu`;

    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedType,
          name: formName,
          fields: fields[selectedType]
        }),
        credentials: 'include'
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Form yapılandırması başarıyla güncellendi.' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error('Hata');
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Form kaydedilirken bir hata oluştu.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-600/30 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  const renderInitialView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <FormCard 
        title="Müşteri Başvuru Formu" 
        description="Müşteri kayıt ve vize başvuru bilgilerini toplamak için kullanılan ana form."
        icon={FileText}
        color="bg-brand-500"
        onClick={() => setSelectedType('customer')}
      />
      <FormCard 
        title="Ülke Tanımlama Formu" 
        description="Vize başvurusu yapılan ülkelerin ve konsolosluk bilgilerinin yönetildiği form."
        icon={Globe}
        color="bg-brand-500"
        onClick={() => setSelectedType('country')}
      />
      <FormCard 
        title="Firma Kayıt Formu" 
        description="Alt acenteler ve çözüm ortağı firmaların bilgilerinin kaydedildiği form."
        icon={Building2}
        color="bg-emerald-500"
        onClick={() => setSelectedType('company')}
      />
    </div>
  );

  const renderFormEditor = () => {
    const titles = {
      customer: 'Müşteri Formu Yapılandırması',
      country: 'Ülke Formu Yapılandırması',
      company: 'Firma Formu Yapılandırması'
    };

    const activeFields = fields[selectedType!] || [];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setSelectedType(null)}
            className="text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center gap-2"
          >
            ← Geri Dön
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={addField}
              className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-all flex items-center gap-2"
            >
              <Plus size={16} /> YENİ ALAN EKLE
            </button>
            <button 
              onClick={handleSaveForm}
              className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition-all flex items-center gap-2"
            >
              <Save size={16} /> FORMU YAYINLA
            </button>
          </div>
        </div>

        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl flex items-center gap-2 text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}
          >
            <Save size={18} />
            {message.text}
          </motion.div>
        )}

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">{titles[selectedType!]}</h3>
            <span className="px-3 py-1 bg-brand-100 text-brand-600 text-[10px] font-black rounded-full uppercase">Düzenleme Modu</span>
          </div>
          
          <div className="p-6 space-y-4">
            {activeFields.map((field) => (
              <div key={field.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                {editingId === field.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Alan Etiketi</label>
                        <input 
                          autoFocus
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Veri Tipi</label>
                        <select 
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                          value={field.type}
                          onChange={(e) => updateField(field.id, { type: e.target.value as any })}
                        >
                          <option value="text">Kısa Metin</option>
                          <option value="email">E-posta</option>
                          <option value="number">Sayısal / Tel</option>
                          <option value="date">Tarih</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={field.required}
                          onChange={(e) => updateField(field.id, { required: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-xs font-bold text-slate-600 uppercase">Zorunlu Alan</span>
                      </label>
                      <button 
                        onClick={() => setEditingId(null)}
                        className="px-4 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 transition-colors"
                      >
                        Tamamlandı
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm group-hover:border-brand-200 group-hover:text-brand-500 transition-all">
                        <Settings2 size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{field.label}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                          {field.type === 'text' ? 'METİN' : field.type === 'email' ? 'E-POSTA' : field.type === 'number' ? 'NUMARA' : 'TARİH'} 
                          <span className="mx-2">•</span>
                          {field.required ? <span className="text-rose-500">ZORUNLU</span> : <span className="text-slate-300">OPSİYONEL</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => setEditingId(field.id)}
                        className="p-2 text-slate-400 hover:text-brand-600 hover:bg-white rounded-lg transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => deleteField(field.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <button 
              onClick={addField}
              className="w-full py-8 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 text-xs font-bold hover:border-brand-300 hover:text-brand-500 hover:bg-brand-50/30 transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-brand-100 group-hover:text-brand-600 transition-all">
                <Plus size={20} />
              </div>
              YENİ FORM ALANI EKLE
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-6">
      <AnimatePresence mode="wait">
        {selectedType ? (
          <motion.div 
            key="editor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderFormEditor()}
          </motion.div>
        ) : (
          <motion.div 
            key="initial"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {renderInitialView()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const FormCard = ({ title, description, icon: Icon, color, onClick }: { title: string, description: string, icon: any, color: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 text-left group flex flex-col items-start gap-6"
  >
    <div className={`p-5 rounded-2xl ${color} text-white shadow-xl group-hover:rotate-6 transition-all duration-500`}>
      <Icon size={32} />
    </div>
    <div className="space-y-3">
      <h3 className="text-xl font-black text-slate-800 leading-tight">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed font-medium">{description}</p>
    </div>
    <div className="mt-2 flex items-center gap-3 text-xs font-black text-brand-600 uppercase tracking-[0.2em]">
      Düzenlemeye Başla <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
    </div>
  </button>
);
