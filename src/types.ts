export type ApplicationStatus = 'İşlemde' | 'Randevu Alındı' | 'Tamamlandı' | 'Talep Bekliyor' | 'İptal Edildi' | 'Dosya Hazırlanıyor' | 'Konsoloslukta' | 'Pasaport Bekleniyor';
export type PaymentStatus = 'Ödendi' | 'Ödenmedi';
export type VisaResult = 'Onaylandı' | 'Red' | '';
export type Role = 'admin' | 'user';

export interface User {
  id: number;
  username: string;
  role: Role;
  adminEmail?: string;
  firmaUnvani?: string;
  acenteAdi?: string;
  logoUrl?: string;
}

export interface TimelineEvent {
  id: string;
  status: ApplicationStatus;
  date: string;
  description: string;
  user: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  category?: 'Pasaport' | 'Kimlik' | 'Fotoğraf' | 'Biyometrik' | 'Diğer';
  url: string;
  uploadDate: string;
  size: string;
}

export interface Applicant {
  id?: number;
  takipKodu: string;
  ad: string;
  soyad: string;
  dogumTarihi: string;
  ulke: string;
  islemDurumu: ApplicationStatus;
  randevuTarihi: string;
  saat: string;
  odemeDurumu: PaymentStatus;
  pasaportNo: string;
  notlar: string;
  pasaportSkt: string;
  email: string;
  kayitTarihi: string;
  vizeSonucu: VisaResult;
  vizeKategorisi?: string;
  vizeGecerlilikTarihi: string;
  firmaAdi: string;
  ikametSehri?: string;
  basvuruMerkezi?: string;
  merkezAdresi?: string;
  fiyat?: number;
  konsoloslukUcreti?: number;
  hizmetBedeli?: number;
  kdvOrani?: number;
  kdvTutarı?: number;
  currency?: string;
  timeline?: TimelineEvent[];
  documents?: Document[];
  musteriTipi?: 'Bireysel' | 'Kurumsal';
  extra_fields?: Record<string, string>;
}

export interface Log {
  id?: number;
  userId: string;
  username: string;
  action: string;
  details: string;
  timestamp: string;
  ip?: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface AccountingRecord {
  id?: number;
  takipKodu: string;
  adSoyad: string;
  islemDurumu: string;
  randevuBilgisi: string;
  kayitTarihi: string;
  pasaportNo: string;
  ulke: string;
  odemeDurumu: string;
  firma: string;
  konsoloslukUcreti?: number;
  hizmetBedeli?: number;
  netTutar: number;
  kdvOrani?: number;
  kdv: number;
  toplam: number;
  faturaNo: string;
  faturaTarihi: string;
  currency?: string;
  musteriTipi?: 'Bireysel' | 'Kurumsal';
}

export interface Country {
  id: number;
  name: string;
}

export interface CountryPrice {
  id?: number;
  ulke: string;
  konsoloslukUcreti: number;
  hizmetBedeli: number;
  kdvOrani: number;
  kdv: number;
  toplam: number;
  currency?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountHolder: string;
  iban: string;
  currency: string;
  branch?: string;
  swift?: string;
  isActive?: boolean;
}
