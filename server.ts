import express from "express";
import "dotenv/config";
import Database from "better-sqlite3";
import path from "path";
import fs from 'fs';
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import session from "express-session";
import { calculatePrice } from "./src/utils/price";

// Global error handlers for better debugging in iisnode
const STARTUP_LOG = path.resolve(process.cwd(), "sunucu-durumu.txt");
try {
  fs.writeFileSync(STARTUP_LOG, `[${new Date().toISOString()}] Sunucu baslatiliyor...\n`);
} catch (e) {}

process.on('unhandledRejection', (reason, promise) => {
  const msg = `Yakalanmamış Rejection: ${reason}\n`;
  console.error(msg);
  try { fs.appendFileSync(STARTUP_LOG, msg); } catch (e) {}
});

process.on('uncaughtException', (err) => {
  const msg = `Yakalanmamış Hata: ${err.message}\n${err.stack}\n`;
  console.error(msg);
  try { fs.appendFileSync(STARTUP_LOG, msg); } catch (e) {}
});

// Database and initial schema check
let db: any;
try {
  const dbPath = path.resolve(process.cwd(), "mkm_vize.db");
  db = new Database(dbPath);
  try { fs.appendFileSync(STARTUP_LOG, `Veritabanına bağlandı: ${dbPath}\n`); } catch (e) {}
} catch (error: any) {
  const msg = `VERİTABANI BAĞLANTI HATASI: ${error.message}\n`;
  console.error(msg);
  try { fs.appendFileSync(STARTUP_LOG, msg); } catch (e) {}
}

// Custom SQLite Session Store (Eliminates Windows EPERM file locking & Vite page reload loops)
class SqliteSessionStore extends session.Store {
  get = (sid: string, callback: (err?: any, session?: any) => void) => {
    try {
      const row = db.prepare('SELECT sess, expired FROM sessions WHERE sid = ?').get(sid) as any;
      if (!row) return callback(null, null);
      if (row.expired && row.expired < Date.now()) {
        db.prepare('DELETE FROM sessions WHERE sid = ?').run(sid);
        return callback(null, null);
      }
      const sess = typeof row.sess === 'string' ? JSON.parse(row.sess) : row.sess;
      callback(null, sess);
    } catch (err) {
      callback(err);
    }
  };

  set = (sid: string, sess: any, callback?: (err?: any) => void) => {
    try {
      const maxAge = sess.cookie?.maxAge || 30 * 24 * 60 * 60 * 1000;
      const expired = Date.now() + maxAge;
      const sessJson = JSON.stringify(sess);
      db.prepare(`
        INSERT INTO sessions (sid, sess, expired)
        VALUES (?, ?, ?)
        ON CONFLICT(sid) DO UPDATE SET sess = excluded.sess, expired = excluded.expired
      `).run(sid, sessJson, expired);
      if (callback) callback(null);
    } catch (err) {
      if (callback) callback(err);
    }
  };

  destroy = (sid: string, callback?: (err?: any) => void) => {
    try {
      db.prepare('DELETE FROM sessions WHERE sid = ?').run(sid);
      if (callback) callback(null);
    } catch (err) {
      if (callback) callback(err);
    }
  };

  touch = (sid: string, sess: any, callback?: (err?: any) => void) => {
    try {
      const maxAge = sess.cookie?.maxAge || 30 * 24 * 60 * 60 * 1000;
      const expired = Date.now() + maxAge;
      db.prepare('UPDATE sessions SET expired = ? WHERE sid = ?').run(expired, sid);
      if (callback) callback(null);
    } catch (err) {
      if (callback) callback(err);
    }
  };
}

declare module 'express-session' {
  interface SessionData {
    userId: number;
    username: string;
    acenteAdi?: string;
  }
}

// 1. CREATE TABLES FIRST
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    sess TEXT,
    expired INTEGER
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'admin',
    adminEmail TEXT,
    firmaUnvani TEXT,
    acenteAdi TEXT
  );

  CREATE TABLE IF NOT EXISTS applicants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    takipKodu TEXT UNIQUE,
    ad TEXT,
    soyad TEXT,
    dogumTarihi TEXT,
    ulke TEXT,
    islemDurumu TEXT,
    randevuTarihi TEXT,
    saat TEXT,
    odemeDurumu TEXT,
    pasaportNo TEXT,
    notlar TEXT,
    pasaportSkt TEXT,
    email TEXT,
    ikametSehri TEXT,
    basvuruMerkezi TEXT,
    merkezAdresi TEXT,
    kayitTarihi TEXT,
    vizeSonucu TEXT,
    vizeGecerlilikTarihi TEXT,
    firmaAdi TEXT,
    fiyat REAL DEFAULT 0,
    currency TEXT DEFAULT 'TRY',
    timeline TEXT DEFAULT '[]',
    documents TEXT DEFAULT '[]',
    extra_fields TEXT DEFAULT '{}',
    vizeKategorisi TEXT DEFAULT 'Turistik',
    hatirlatma7Gun INTEGER DEFAULT 0,
    hatirlatma2Gun INTEGER DEFAULT 0,
    hatirlatmaVizeBitis INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS accounting (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    takipKodu TEXT UNIQUE,
    adSoyad TEXT,
    islemDurumu TEXT,
    randevuBilgisi TEXT,
    kayitTarihi TEXT,
    pasaportNo TEXT,
    ulke TEXT,
    odemeDurumu TEXT,
    firma TEXT,
    netTutar REAL,
    kdv REAL,
    toplam REAL,
    faturaNo TEXT,
    faturaTarihi TEXT,
    currency TEXT DEFAULT 'TRY'
  );

  CREATE TABLE IF NOT EXISTS prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ulke TEXT UNIQUE,
    konsoloslukUcreti REAL,
    hizmetBedeli REAL,
    kdvOrani REAL DEFAULT 20,
    kdv REAL,
    toplam REAL,
    currency TEXT DEFAULT 'TRY'
  );

  CREATE TABLE IF NOT EXISTS countries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    reminder_7_days_enabled INTEGER DEFAULT 1,
    reminder_2_days_enabled INTEGER DEFAULT 1,
    reminder_expiry_enabled INTEGER DEFAULT 1,
    reminder_expiry_days INTEGER DEFAULT 30,
    admin_weekly_report_enabled INTEGER DEFAULT 1,
    admin_report_email TEXT DEFAULT 'salih@brighttour.com',
    show_commissions_to_users INTEGER DEFAULT 0,
    manual_commission_rates TEXT DEFAULT '{}',
    manual_commission_thresholds TEXT DEFAULT '{}',
    default_vat_rate REAL DEFAULT 20,
    smtp_host TEXT,
    smtp_port INTEGER,
    smtp_user TEXT,
    smtp_pass TEXT,
    smtp_from TEXT,
    is_email_active INTEGER DEFAULT 1,
    last_weekly_report_week TEXT
  );

  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT,
    username TEXT,
    action TEXT,
    details TEXT,
    timestamp TEXT,
    type TEXT DEFAULT 'info'
  );

  CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firma_unvani TEXT,
    acente_adi TEXT,
    vergi_dairesi TEXT,
    vergi_no TEXT,
    email TEXT,
    telefon TEXT,
    website TEXT,
    adres TEXT,
    yetkili_ad_soyad TEXT,
    yetkili_telefon TEXT,
    kayit_tarihi TEXT
  );
  
  CREATE TABLE IF NOT EXISTS forms (
    id TEXT PRIMARY KEY,
    name TEXT,
    fields TEXT,
    updated_at TEXT
  );

  INSERT OR IGNORE INTO settings (id) VALUES (1);
`);

// 2. RUN MIGRATIONS AFTER TABLE CREATION
const migrations = [
  // Settings table
  "ALTER TABLE settings ADD COLUMN smtp_host TEXT",
  "ALTER TABLE settings ADD COLUMN smtp_port INTEGER",
  "ALTER TABLE settings ADD COLUMN smtp_user TEXT",
  "ALTER TABLE settings ADD COLUMN smtp_pass TEXT",
  "ALTER TABLE settings ADD COLUMN smtp_from TEXT",
  "ALTER TABLE settings ADD COLUMN is_email_active INTEGER DEFAULT 1",
  "ALTER TABLE settings ADD COLUMN default_vat_rate REAL DEFAULT 20",
  "ALTER TABLE settings ADD COLUMN show_commissions_to_users INTEGER DEFAULT 0",
  "ALTER TABLE settings ADD COLUMN manual_commission_rates TEXT DEFAULT '{}'",
  "ALTER TABLE settings ADD COLUMN manual_commission_thresholds TEXT DEFAULT '{}'",
  "ALTER TABLE settings ADD COLUMN last_weekly_report_week TEXT",
  
  // Users table
  "ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'",
  "ALTER TABLE users ADD COLUMN adminEmail TEXT",
  "ALTER TABLE users ADD COLUMN firmaUnvani TEXT",
  "ALTER TABLE users ADD COLUMN acenteAdi TEXT",
  
  // Applicants table
  "ALTER TABLE applicants ADD COLUMN extra_fields TEXT DEFAULT '{}'",
  "ALTER TABLE applicants ADD COLUMN hatirlatma7Gun INTEGER DEFAULT 0",
  "ALTER TABLE applicants ADD COLUMN hatirlatma2Gun INTEGER DEFAULT 0",
  "ALTER TABLE applicants ADD COLUMN hatirlatmaVizeBitis INTEGER DEFAULT 0",
  "ALTER TABLE applicants ADD COLUMN ikametSehri TEXT",
  "ALTER TABLE applicants ADD COLUMN basvuruMerkezi TEXT",
  "ALTER TABLE applicants ADD COLUMN merkezAdresi TEXT",
  "ALTER TABLE applicants ADD COLUMN fiyat REAL DEFAULT 0",
  "ALTER TABLE applicants ADD COLUMN currency TEXT DEFAULT 'TRY'",
  "ALTER TABLE applicants ADD COLUMN timeline TEXT DEFAULT '[]'",
  "ALTER TABLE applicants ADD COLUMN documents TEXT DEFAULT '[]'",
  "ALTER TABLE applicants ADD COLUMN vizeGecerlilikTarihi TEXT",
  "ALTER TABLE applicants ADD COLUMN vizeKategorisi TEXT DEFAULT 'Turistik'",
  "ALTER TABLE applicants ADD COLUMN konsoloslukUcreti REAL DEFAULT 0",
  "ALTER TABLE applicants ADD COLUMN hizmetBedeli REAL DEFAULT 0",
  "ALTER TABLE applicants ADD COLUMN kdvOrani REAL DEFAULT 20",
  "ALTER TABLE applicants ADD COLUMN kdvTutarı REAL DEFAULT 0",
  "ALTER TABLE applicants ADD COLUMN musteriTipi TEXT DEFAULT 'Bireysel'",
  
  // Prices table
  "ALTER TABLE prices ADD COLUMN currency TEXT DEFAULT 'TRY'",
  
  // Accounting table
  "ALTER TABLE accounting ADD COLUMN currency TEXT DEFAULT 'TRY'",
  "ALTER TABLE accounting ADD COLUMN konsoloslukUcreti REAL DEFAULT 0",
  "ALTER TABLE accounting ADD COLUMN hizmetBedeli REAL DEFAULT 0",
  "ALTER TABLE accounting ADD COLUMN kdvOrani REAL DEFAULT 20",
  "ALTER TABLE accounting ADD COLUMN musteriTipi TEXT DEFAULT 'Bireysel'",

  // Custom notifications
  "ALTER TABLE settings ADD COLUMN status_change_notify_enabled INTEGER DEFAULT 1",
  "ALTER TABLE settings ADD COLUMN support_phone TEXT",
  "ALTER TABLE settings ADD COLUMN support_email TEXT",
  "ALTER TABLE settings ADD COLUMN support_website TEXT",
  "ALTER TABLE settings ADD COLUMN support_hq_address TEXT",
  "ALTER TABLE settings ADD COLUMN bank_accounts TEXT DEFAULT '[]'",
  `CREATE TABLE IF NOT EXISTS user_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    username TEXT,
    firmaAdi TEXT,
    title TEXT,
    message TEXT,
    type TEXT,
    read INTEGER DEFAULT 0,
    created_at TEXT
  )`
];

migrations.forEach(sql => {
  try {
    db.prepare(sql).run();
  } catch (e) {
    // Column already exists usually
  }
});

// Initialize default support contact values if null
try {
  const currentSettings = db.prepare("SELECT * FROM settings WHERE id = 1").get() as any;
  if (currentSettings) {
    const updates: string[] = [];
    const values: any[] = [];
    if (!currentSettings.support_phone) {
      updates.push("support_phone = ?");
      values.push("+90 (212) 444 0 444");
    }
    if (!currentSettings.support_email) {
      updates.push("support_email = ?");
      values.push("destek@sistemvize.com");
    }
    if (!currentSettings.support_website) {
      updates.push("support_website = ?");
      values.push("sistemvize.com");
    }
    if (!currentSettings.support_hq_address) {
      updates.push("support_hq_address = ?");
      values.push("Sistem Vize Operasyon ve Yönetim Merkezi\nAtatürk Bulvarı No: 123 Kat: 4\nKadıköy / İSTANBUL");
    }
    if (!currentSettings.bank_accounts || currentSettings.bank_accounts === '[]') {
      const defaultAccounts = JSON.stringify([
        {
          id: "bank_1",
          bankName: "Garanti BBVA",
          accountHolder: "MKM VİZE DANIŞMANLIK HİZMETLERİ LTD. ŞTİ.",
          iban: "TR89 0006 2000 0000 1234 5678 90",
          currency: "TRY",
          branch: "Beşiktaş Şubesi / İstanbul",
          isActive: true
        },
        {
          id: "bank_2",
          bankName: "Türkiye İş Bankası",
          accountHolder: "MKM VİZE DANIŞMANLIK HİZMETLERİ LTD. ŞTİ.",
          iban: "TR12 0006 4000 0000 9876 5432 10",
          currency: "EUR",
          branch: "Levent Şubesi / İstanbul",
          swift: "ISBTRISXXX",
          isActive: true
        }
      ]);
      updates.push("bank_accounts = ?");
      values.push(defaultAccounts);
    }
    if (updates.length > 0) {
      db.prepare(`UPDATE settings SET ${updates.join(', ')} WHERE id = 1`).run(...values);
    }
  }
} catch (e) {}

// Ensure admin role for first user or invalid roles
try {
  db.prepare("UPDATE users SET role = 'admin' WHERE role IS NULL OR role = ''").run();
} catch (e) {}


// 3. SEED DATA
// Mevcut başvurulardaki firma isimlerini şirketler tablosuna aktar (Eski kayıtlar için)
try {
  const existingApplicants = db.prepare("SELECT DISTINCT firmaAdi FROM applicants WHERE firmaAdi IS NOT NULL AND firmaAdi != ''").all() as any[];
  existingApplicants.forEach(app => {
    const exists = db.prepare("SELECT id FROM companies WHERE acente_adi = ? OR firma_unvani = ?").get(app.firmaAdi, app.firmaAdi);
    if (!exists) {
      db.prepare("INSERT INTO companies (firma_unvani, acente_adi, kayit_tarihi) VALUES (?, ?, ?)").run(app.firmaAdi, app.firmaAdi, new Date().toISOString());
    }
  });
} catch (syncError) {
  console.error("Şirket senkronizasyon hatası:", syncError);
}

// Muhasebe takipKodu unique index
try {
  db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_accounting_takipKodu ON accounting(takipKodu)").run();
} catch (e) {}

const SCHENGEN_COUNTRIES = [
  "Almanya", "Avusturya", "Belçika", "Bulgaristan", "Çek Cumhuriyeti", "Danimarka", 
  "Estonya", "Finlandiya", "Fransa", "Hırvatistan", "Hollanda", "İspanya", 
  "İsveç", "İsviçre", "İtalya", "İzlanda", "Letonya", "Litvanya", "Lüksemburg", 
  "Macaristan", "Malta", "Norveç", "Polonya", "Portekiz", "Romanya", "Slovakya", 
  "Slovenya", "Yunanistan"
];

function isSchengenCountry(countryName?: string): boolean {
  if (!countryName) return false;
  const norm = countryName.trim().toLowerCase();
  return SCHENGEN_COUNTRIES.some(
    c => c.toLowerCase() === norm || norm.includes(c.toLowerCase()) || c.toLowerCase().includes(norm)
  );
}

function getCurrencyForCountry(countryName?: string): 'EUR' | 'USD' {
  return isSchengenCountry(countryName) ? 'EUR' : 'USD';
}

function getCurrencySymbol(currency?: string, countryName?: string): string {
  let cur = currency;
  if (!cur || cur === 'TRY') {
    if (countryName) {
      cur = getCurrencyForCountry(countryName);
    } else {
      cur = 'EUR';
    }
  }
  switch (cur) {
    case 'EUR': return '€';
    case 'USD': return '$';
    case 'GBP': return '£';
    case 'TRY': return '₺';
    default: return cur === 'EUR' ? '€' : '$';
  }
}

// Seed countries if empty
const countryCount = db.prepare("SELECT COUNT(*) as count FROM countries").get() as any;
if (countryCount.count === 0) {
  const initialCountries = [
    "Almanya", "Avusturya", "Belçika", "Çek Cumhuriyeti", "Danimarka", "Estonya", "Finlandiya", "Fransa", 
    "Hollanda", "İspanya", "İsveç", "İsviçre", "İtalya", "İzlanda", "Letonya", "Litvanya", "Lüksemburg", 
    "Macaristan", "Malta", "Norveç", "Polonya", "Portekiz", "Slovakya", "Slovenya", "Yunanistan", 
    "İngiltere", "Amerika", "Kanada", "Dubai", "Mısır", "Cezayir", "Suudi Arabistan", "Çin", "Hindistan", "Vietnam"
  ];
  const insert = db.prepare("INSERT INTO countries (name) VALUES (?)");
  initialCountries.forEach(c => insert.run(c));
}

// Update/Sync currency for all existing records in prices, applicants, and accounting
try {
  const allPrices = db.prepare("SELECT id, ulke, currency FROM prices").all() as any[];
  allPrices.forEach(p => {
    const correctCurrency = getCurrencyForCountry(p.ulke);
    db.prepare("UPDATE prices SET currency = ? WHERE id = ?").run(correctCurrency, p.id);
  });

  const allApplicants = db.prepare("SELECT id, ulke, currency FROM applicants").all() as any[];
  allApplicants.forEach(a => {
    const correctCurrency = getCurrencyForCountry(a.ulke);
    db.prepare("UPDATE applicants SET currency = ? WHERE id = ?").run(correctCurrency, a.id);
  });

  const allAccounting = db.prepare("SELECT id, ulke, currency FROM accounting").all() as any[];
  allAccounting.forEach(acc => {
    const correctCurrency = getCurrencyForCountry(acc.ulke);
    db.prepare("UPDATE accounting SET currency = ? WHERE id = ?").run(correctCurrency, acc.id);
  });
} catch (curSyncErr) {
  console.error("Döviz kuru senkronizasyon hatası:", curSyncErr);
}

// Seed default admin if no users exist
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
if (userCount.count === 0) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run('admin', hashedPassword);
  console.log("Varsayılan yönetici hesabı oluşturuldu: admin / admin123");
}

const formatDateServer = (dateStr: string | undefined) => {
  if (!dateStr || dateStr === "" || dateStr === "Henüz Alınmadı" || dateStr === "Belirtilmedi") return dateStr || 'Henüz Alınmadı';
  
  // YYYY-MM-DD formatını kontrol et ve manuel parçala (Timezone sorunlarını önlemek için)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-');
    return `${d}-${m}-${y}`;
  }
  
  // Eğer zaten DD-MM-YYYY formatındaysa (basit kontrol) dokunma
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return dateStr;
  
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const logAction = (userId: string | number | undefined, username: string | undefined, action: string, details: string, type: string = 'info') => {
  try {
    db.prepare("INSERT INTO logs (userId, username, action, details, timestamp, type) VALUES (?, ?, ?, ?, ?, ?)").run(
      userId?.toString() || '0',
      username || 'Sistem',
      action,
      details,
      new Date().toISOString(),
      type
    );
  } catch (error) {
    console.error("Log kaydı hatası:", error);
  }
};

// Otomatik Proforma Fatura Oluşturma Yardımcısı
function ensureProformaInvoice(applicantData: any) {
  if (!applicantData || !applicantData.takipKodu) return;
  const status = applicantData.islemDurumu;
  if (status !== 'Randevu Alındı') return;

  try {
    const existing = db.prepare("SELECT * FROM accounting WHERE takipKodu = ?").get(applicantData.takipKodu) as any;
    
    // Fatura numarası halihazırda varsa finansal detayları ve kişisel bilgileri güncelle
    if (existing && existing.faturaNo && existing.faturaNo.trim().length > 0) {
      let konsoloslukUcreti = applicantData.konsoloslukUcreti !== undefined ? Number(applicantData.konsoloslukUcreti) : existing.konsoloslukUcreti;
      let hizmetBedeli = applicantData.hizmetBedeli !== undefined ? Number(applicantData.hizmetBedeli) : existing.hizmetBedeli;
      let kdvOrani = applicantData.kdvOrani !== undefined ? Number(applicantData.kdvOrani) : existing.kdvOrani;
      let total = applicantData.fiyat !== undefined ? Number(applicantData.fiyat) : existing.toplam;

      let calc = calculatePrice(konsoloslukUcreti, hizmetBedeli, kdvOrani, total > 0 ? total : undefined);

      db.prepare(`
        UPDATE accounting SET 
          adSoyad = ?, islemDurumu = ?, randevuBilgisi = ?, 
          pasaportNo = ?, ulke = ?, odemeDurumu = ?, firma = ?, 
          konsoloslukUcreti = ?, hizmetBedeli = ?, netTutar = ?, kdvOrani = ?, kdv = ?, toplam = ?, 
          currency = ?, musteriTipi = ?
        WHERE id = ?
      `).run(
        `${applicantData.ad || ''} ${applicantData.soyad || ''}`.trim() || existing.adSoyad,
        applicantData.islemDurumu || existing.islemDurumu,
        applicantData.randevuTarihi ? `${applicantData.randevuTarihi} ${applicantData.saat || ''}`.trim() : existing.randevuBilgisi,
        applicantData.pasaportNo || existing.pasaportNo || '',
        applicantData.ulke || existing.ulke || '',
        applicantData.odemeDurumu || existing.odemeDurumu || 'Ödenmedi',
        applicantData.firmaAdi || existing.firma || 'MKM VİZE',
        calc.konsoloslukUcreti,
        calc.hizmetBedeli,
        calc.hizmetBedeli,
        calc.kdvOrani,
        calc.kdv,
        calc.toplam,
        applicantData.currency || existing.currency || getCurrencyForCountry(applicantData.ulke),
        applicantData.musteriTipi || existing.musteriTipi || 'Bireysel',
        existing.id
      );
      return;
    }

    let konsoloslukUcreti = Number(applicantData.konsoloslukUcreti) || 0;
    let hizmetBedeli = applicantData.hizmetBedeli !== undefined && applicantData.hizmetBedeli !== null ? Number(applicantData.hizmetBedeli) : undefined;
    let kdvOrani = Number(applicantData.kdvOrani) || 20;
    let total = Number(applicantData.fiyat) || 0;

    let calc = calculatePrice(konsoloslukUcreti, hizmetBedeli, kdvOrani, total > 0 ? total : undefined);

    if (!calc.toplam || calc.toplam <= 0) {
      const countryPrice = db.prepare("SELECT * FROM prices WHERE ulke = ?").get(applicantData.ulke) as any;
      if (countryPrice) {
        calc = calculatePrice(
          countryPrice.konsoloslukUcreti || 0,
          countryPrice.hizmetBedeli,
          countryPrice.kdvOrani || 20,
          countryPrice.toplam
        );
      }
    }

    const netTutar = calc.hizmetBedeli;
    const kdv = calc.kdv;
    total = calc.toplam;
    
    const currentYear = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const faturaNo = `PRF-${currentYear}-${randomSuffix}`;
    const faturaTarihi = new Date().toISOString().split('T')[0];
    const adSoyad = `${applicantData.ad || ''} ${applicantData.soyad || ''}`.trim() || applicantData.adSoyad || 'Müşteri';
    const randevuBilgisi = applicantData.randevuTarihi ? `${applicantData.randevuTarihi} ${applicantData.saat || ''}`.trim() : '';
    const currency = applicantData.currency || existing?.currency || getCurrencyForCountry(applicantData.ulke);

    if (existing) {
      db.prepare(`
        UPDATE accounting SET 
          adSoyad = ?, islemDurumu = ?, randevuBilgisi = ?, 
          pasaportNo = ?, ulke = ?, odemeDurumu = ?, firma = ?, 
          konsoloslukUcreti = ?, hizmetBedeli = ?, netTutar = ?, kdvOrani = ?, kdv = ?, toplam = ?, 
          faturaNo = ?, faturaTarihi = ?, currency = ?, musteriTipi = ?
        WHERE id = ?
      `).run(
        adSoyad, 
        'Randevu Alındı', 
        randevuBilgisi || existing.randevuBilgisi || '',
        applicantData.pasaportNo || existing.pasaportNo || '',
        applicantData.ulke || existing.ulke || '',
        applicantData.odemeDurumu || existing.odemeDurumu || 'Ödenmedi',
        applicantData.firmaAdi || existing.firma || 'MKM VİZE',
        calc.konsoloslukUcreti,
        calc.hizmetBedeli,
        netTutar,
        calc.kdvOrani,
        kdv,
        total,
        faturaNo,
        faturaTarihi,
        currency,
        applicantData.musteriTipi || existing.musteriTipi || 'Bireysel',
        existing.id
      );
    } else {
      db.prepare(`
        INSERT INTO accounting (
          takipKodu, adSoyad, islemDurumu, randevuBilgisi, kayitTarihi,
          pasaportNo, ulke, odemeDurumu, firma, konsoloslukUcreti, hizmetBedeli, netTutar, kdvOrani, kdv, toplam,
          faturaNo, faturaTarihi, currency, musteriTipi
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        applicantData.takipKodu,
        adSoyad,
        'Randevu Alındı',
        randevuBilgisi,
        new Date().toISOString(),
        applicantData.pasaportNo || '',
        applicantData.ulke || '',
        applicantData.odemeDurumu || 'Ödenmedi',
        applicantData.firmaAdi || 'MKM VİZE',
        calc.konsoloslukUcreti,
        calc.hizmetBedeli,
        netTutar,
        calc.kdvOrani,
        kdv,
        total,
        faturaNo,
        faturaTarihi,
        currency,
        applicantData.musteriTipi || 'Bireysel'
      );
    }
    logAction(0, 'Sistem', 'Otomatik Proforma Fatura', `${adSoyad} (${applicantData.takipKodu}) için otomatik proforma fatura (${faturaNo}) oluşturuldu.`, 'info');
  } catch (err) {
    console.error("Otomatik proforma fatura oluşturma hatası:", err);
  }
}

const sendProfessionalEmail = async (to: string, subject: string, title: string, content: string, applicantData: any) => {
  const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get() as any;
  
  if (!settings || settings.is_email_active === 0) {
    console.log("E-posta gönderimi sistem ayarlarından devre dışı bırakılmış.");
    return false;
  }

  // Müşteri e-postası ve admin e-postası toplanıyor
  const recipients: string[] = [];
  if (to && typeof to === 'string' && to.includes('@')) {
    recipients.push(to.trim());
  }

  const adminEmail = settings.admin_report_email || "salih@brighttour.com";
  if (adminEmail && adminEmail.includes('@') && !recipients.includes(adminEmail.trim())) {
    recipients.push(adminEmail.trim());
  }

  if (recipients.length === 0) {
    console.log("E-posta gönderilecek geçerli bir alıcı adresi bulunamadı.");
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: settings.smtp_host || process.env.SMTP_HOST || 'smtp.yandex.com.tr',
    port: Number(settings.smtp_port || process.env.SMTP_PORT) || 465,
    secure: Number(settings.smtp_port || process.env.SMTP_PORT) === 465 || (!settings.smtp_port && !process.env.SMTP_PORT),
    auth: {
      user: settings.smtp_user || process.env.SMTP_USER,
      pass: settings.smtp_pass || process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    }
  });

  console.log(`E-posta gönderim denemesi -> Alıcılar: ${recipients.join(', ')}. Sunucu: ${settings.smtp_host || process.env.SMTP_HOST || 'smtp.yandex.com.tr'}, Port: ${Number(settings.smtp_port || process.env.SMTP_PORT) || 465}`);

  const googleMapsUrl = applicantData.merkezAdresi 
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((applicantData.basvuruMerkezi ? applicantData.basvuruMerkezi + ' ' : '') + applicantData.merkezAdresi)}`
    : null;

  let calendarLinks = '';
  if (applicantData.randevuTarihi && applicantData.saat) {
    const datePart = applicantData.randevuTarihi.replace(/-/g, '');
    const timePart = applicantData.saat.replace(/:/g, '');
    const startDateTime = `${datePart}T${timePart}00`;
    
    // Add 1 hour for end time
    const [hours, minutes] = applicantData.saat.split(':').map(Number);
    const endHours = (hours + 1).toString().padStart(2, '0');
    const endDateTime = `${datePart}T${endHours}${minutes.toString().padStart(2, '0')}00`;

    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Vize Randevusu - ' + applicantData.ulke)}&dates=${startDateTime}/${endDateTime}&details=${encodeURIComponent('MKM Vize Danışmanlığı - ' + applicantData.basvuruMerkezi)}&location=${encodeURIComponent(applicantData.merkezAdresi || '')}`;
    
    // Use the current app URL for the ICS link
    const appUrl = process.env.APP_URL || '';
    const icsUrl = `${appUrl}/api/calendar/ics/${applicantData.takipKodu}`;

    calendarLinks = `
      <div style="margin-top: 25px; display: flex; flex-wrap: wrap; gap: 10px;">
        <a href="${googleCalendarUrl}" target="_blank" style="background-color: #4285f4; color: white; padding: 10px 16px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">📅 Takvime Ekle</a>
      </div>
    `;
  }

  // Otomatik Proforma Fatura Şablonu Oluşturma
  let proformaHtml = '';
  try {
    let acc = db.prepare("SELECT * FROM accounting WHERE takipKodu = ?").get(applicantData.takipKodu) as any;
    if (!acc && applicantData.islemDurumu === 'Randevu Alındı') {
      ensureProformaInvoice(applicantData);
      acc = db.prepare("SELECT * FROM accounting WHERE takipKodu = ?").get(applicantData.takipKodu) as any;
    }

    if (acc || applicantData.islemDurumu === 'Randevu Alındı') {
      let faturaNo = acc?.faturaNo;
      let faturaTarihi = acc?.faturaTarihi || new Date().toISOString().split('T')[0];

      const countryPrice = db.prepare("SELECT * FROM prices WHERE ulke = ?").get(applicantData.ulke) as any;

      const calc = calculatePrice(
        acc?.konsoloslukUcreti ?? applicantData.konsoloslukUcreti ?? countryPrice?.konsoloslukUcreti ?? 0,
        acc?.hizmetBedeli ?? applicantData.hizmetBedeli ?? countryPrice?.hizmetBedeli,
        acc?.kdvOrani ?? applicantData.kdvOrani ?? countryPrice?.kdvOrani ?? 20,
        acc?.toplam || applicantData.fiyat || countryPrice?.toplam
      );

      if (!faturaNo) {
        faturaNo = `PRF-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      }

      const currency = acc?.currency || applicantData?.currency || getCurrencyForCountry(applicantData.ulke);
      const symbol = getCurrencySymbol(currency, applicantData.ulke);

      const formattedKons = calc.konsoloslukUcreti.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const formattedNet = calc.hizmetBedeli.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const formattedKdvHaric = calc.kdvHariçToplam.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const formattedKdv = calc.kdv.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const formattedTotal = calc.toplam.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      proformaHtml = `
        <div style="background-color: #ffffff; border: 2px dashed #e11d48; border-radius: 12px; padding: 25px; margin: 30px 0; font-family: sans-serif;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #e11d48; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">PROFORMA FATURA</h2>
            <p style="color: #64748b; font-size: 13px; margin-top: 4px; font-weight: 600;">MKM VİZE DANIŞMANLIK HİZMETLERİ</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b;">Fatura No:</td>
              <td style="padding: 10px 0; color: #0f172a; font-weight: 700; text-align: right;">${faturaNo || '-'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b;">Fatura Tarihi:</td>
              <td style="padding: 10px 0; color: #0f172a; font-weight: 600; text-align: right;">${faturaTarihi}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b;">Müşteri / Alıcı:</td>
              <td style="padding: 10px 0; color: #0f172a; font-weight: 600; text-align: right;">${applicantData.ad || ''} ${applicantData.soyad || ''}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b;">Firma Adı / Acente:</td>
              <td style="padding: 10px 0; color: #0f172a; font-weight: 600; text-align: right;">${applicantData.firmaAdi || acc?.firma || 'MKM VİZE'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b;">Hizmet Açıklaması:</td>
              <td style="padding: 10px 0; color: #0f172a; font-weight: 600; text-align: right;">${applicantData.ulke || ''} Vize Danışmanlığı</td>
            </tr>
            ${calc.konsoloslukUcreti > 0 ? `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b;">Konsolosluk Harcı (KDV İstisna):</td>
              <td style="padding: 10px 0; color: #0f172a; font-weight: 600; text-align: right;">${formattedKons} ${symbol}</td>
            </tr>` : ''}
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b;">Hizmet Bedeli (KDV Matrahı):</td>
              <td style="padding: 10px 0; color: #0f172a; text-align: right;">${formattedNet} ${symbol}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background-color: #f8fafc;">
              <td style="padding: 10px 8px; color: #0f172a; font-weight: 700;">KDV HARİÇ TUTAR (Bireysel İşlem):</td>
              <td style="padding: 10px 8px; color: #0f172a; font-weight: 800; text-align: right;">${formattedKdvHaric} ${symbol}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b;">KDV Tutarı (%${calc.kdvOrani}):</td>
              <td style="padding: 10px 0; color: #0f172a; text-align: right;">+${formattedKdv} ${symbol}</td>
            </tr>
            <tr style="background-color: #fff1f2;">
              <td style="padding: 12px 10px; color: #be123c; font-weight: 800; font-size: 15px;">KDV DAHİL TOPLAM TUTAR (Kurumsal İşlem):</td>
              <td style="padding: 12px 10px; color: #be123c; font-weight: 900; font-size: 18px; text-align: right;">${formattedTotal} ${symbol}</td>
            </tr>
          </table>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-top: 15px; font-size: 12px; color: #334155;">
            <strong>💡 Bireysel ve Kurumsal Ödeme Bilgilendirmesi:</strong>
            <ul style="margin: 6px 0 0 16px; padding: 0;">
              <li><strong>Bireysel / KDV Hariç İşlemler:</strong> Taban tutar olan <strong>${formattedKdvHaric} ${symbol}</strong> ödenmektedir.</li>
              <li><strong>Kurumsal / KDV Dahil İşlemler:</strong> Konsolosluk harcı KDV'den muaf tutularak, yalnızca ${formattedNet} ${symbol} hizmet bedeline %${calc.kdvOrani} KDV (+${formattedKdv} ${symbol}) eklenmektedir. KDV dahil genel toplam <strong>${formattedTotal} ${symbol}</strong> ödenmektedir.</li>
            </ul>
          </div>
        </div>
          <div style="padding: 12px; background-color: #fff1f2; border-left: 4px solid #e11d48; border-radius: 6px;">
            <p style="margin: 0; color: #9f1239; font-size: 13px; font-weight: 700; text-align: center;">
              Fatura bilgilerini kontrol edin ve hata varsa bildirin
            </p>
          </div>
        </div>
      `;
    }
  } catch (err) {
    console.error("E-posta proforma fatura bloğu hatası:", err);
  }

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1a202c; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 2px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">MKM VİZE</h1>
        <p style="color: rgba(255,255,255,0.8); margin-top: 10px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Profesyonel Vize Danışmanlığı</p>
      </div>
      <div style="padding: 40px 35px; background-color: #ffffff;">
        <h2 style="color: #1a202c; margin-top: 0; font-size: 22px; font-weight: 700; margin-bottom: 20px;">${title}</h2>
        <p style="line-height: 1.6; color: #4a5568; font-size: 16px;">Sayın <strong>${applicantData.ad} ${applicantData.soyad}</strong>,</p>
        <p style="line-height: 1.7; color: #4a5568; font-size: 16px; margin-bottom: 30px;">${content}</p>
        
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 30px; margin: 30px 0; border: 1px solid #edf2f7; position: relative;">
          <div style="position: absolute; top: -12px; left: 20px; background-color: #4f46e5; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase;">Başvuru Detayları</div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #718096; font-size: 14px; width: 40%;">🌍 Ülke</td>
              <td style="padding: 8px 0; color: #1a202c; font-size: 15px; font-weight: 600;">${applicantData.ulke || 'Belirtilmedi'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #718096; font-size: 14px;">📅 Randevu Tarihi</td>
              <td style="padding: 8px 0; color: #1a202c; font-size: 15px; font-weight: 600;">${formatDateServer(applicantData.randevuTarihi)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #718096; font-size: 14px;">⏰ Randevu Saati</td>
              <td style="padding: 8px 0; color: #1a202c; font-size: 15px; font-weight: 600;">${applicantData.saat || 'Henüz Alınmadı'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #718096; font-size: 14px;">🏢 Başvuru Merkezi</td>
              <td style="padding: 8px 0; color: #1a202c; font-size: 15px; font-weight: 600;">${applicantData.basvuruMerkezi || 'Henüz Alınmadı'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #718096; font-size: 14px;">📍 Adres</td>
              <td style="padding: 8px 0; color: #1a202c; font-size: 14px; font-weight: 500;">${applicantData.merkezAdresi || 'Henüz Alınmadı'}</td>
            </tr>
            ${googleMapsUrl ? `
            <tr>
              <td colspan="2" style="padding: 8px 0;">
                <a href="${googleMapsUrl}" target="_blank" style="color: #4f46e5; text-decoration: none; font-weight: 700; font-size: 14px;">🗺️ Yol Tarifi Al</a>
              </td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; color: #718096; font-size: 14px;">💰 Ödeme Durumu</td>
              <td style="padding: 8px 0; color: ${applicantData.odemeDurumu === 'Ödendi' ? '#059669' : '#dc2626'}; font-size: 15px; font-weight: 700;">${applicantData.odemeDurumu || 'Ödenmedi'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #718096; font-size: 14px;">🔖 Takip Kodu</td>
              <td style="padding: 8px 0; color: #1a202c; font-size: 15px; font-weight: 600;">${applicantData.takipKodu}</td>
            </tr>
          </table>
          ${calendarLinks}
        </div>

        ${proformaHtml}
        
        <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #edf2f7;">
          <p style="line-height: 1.6; color: #718096; font-size: 14px;">
            <strong>Önemli Not:</strong> Randevu saatinizden en az 15 dakika önce ilgili merkezde hazır bulunmanızı ve tüm evraklarınızın eksiksiz olduğundan emin olmanızı rica ederiz.
          </p>
          <p style="line-height: 1.6; color: #4a5568; font-size: 14px; margin-top: 20px;">
            Herhangi bir sorunuz olması durumunda <strong>+90 532 742 88 71</strong> numaralı telefondan veya bu e-postayı yanıtlayarak bize ulaşabilirsiniz.
          </p>
        </div>
      </div>
      <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #edf2f7;">
        <p style="margin: 0; color: #a0aec0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
          © ${new Date().getFullYear()} MKM VİZE DANIŞMANLIK HİZMETLERİ
        </p>
        <p style="margin: 10px 0 0 0; color: #cbd5e0; font-size: 10px;">Bu e-posta otomatik olarak gönderilmiştir, lütfen yanıtlamayınız.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: settings.smtp_from || process.env.SMTP_FROM || '"ANEWME BRIGHT" <no-reply@anewme.com.tr>',
      to: recipients.join(', '),
      subject,
      html
    });
    console.log(`E-posta başarıyla gönderildi -> Alıcılar: ${recipients.join(', ')}`);
    return true;
  } catch (error: any) {
    console.error("Email gönderim hatası detayı:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    return false;
  }
};

const sendProformaInvoiceEmail = async (to: string, applicantData: any) => {
  const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get() as any;
  
  if (!settings || settings.is_email_active === 0) {
    console.log("E-posta gönderimi sistem ayarlarından devre dışı bırakılmış.");
    return false;
  }

  // Müşteri e-postası ve admin e-postası toplanıyor
  const recipients: string[] = [];
  if (to && typeof to === 'string' && to.includes('@')) {
    recipients.push(to.trim());
  }

  const adminEmail = settings.admin_report_email || "salih@brighttour.com";
  if (adminEmail && adminEmail.includes('@') && !recipients.includes(adminEmail.trim())) {
    recipients.push(adminEmail.trim());
  }

  if (recipients.length === 0) {
    console.log("E-posta gönderilecek geçerli bir alıcı adresi bulunamadı.");
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: settings.smtp_host || process.env.SMTP_HOST || 'smtp.yandex.com.tr',
    port: Number(settings.smtp_port || process.env.SMTP_PORT) || 465,
    secure: Number(settings.smtp_port || process.env.SMTP_PORT) === 465 || (!settings.smtp_port && !process.env.SMTP_PORT),
    auth: {
      user: settings.smtp_user || process.env.SMTP_USER,
      pass: settings.smtp_pass || process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    }
  });

  // Proforma verilerini hazırla
  let acc = db.prepare("SELECT * FROM accounting WHERE takipKodu = ?").get(applicantData.takipKodu) as any;
  if (!acc) {
    ensureProformaInvoice(applicantData);
    acc = db.prepare("SELECT * FROM accounting WHERE takipKodu = ?").get(applicantData.takipKodu) as any;
  }

  const countryPrice = db.prepare("SELECT * FROM prices WHERE ulke = ?").get(applicantData.ulke) as any;

  const calc = calculatePrice(
    applicantData.konsoloslukUcreti ?? acc?.konsoloslukUcreti ?? countryPrice?.konsoloslukUcreti ?? 0,
    applicantData.hizmetBedeli ?? acc?.hizmetBedeli ?? countryPrice?.hizmetBedeli,
    applicantData.kdvOrani ?? acc?.kdvOrani ?? countryPrice?.kdvOrani ?? 20,
    applicantData.fiyat || acc?.toplam || countryPrice?.toplam
  );

  let faturaNo = acc?.faturaNo || `PRF-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  let faturaTarihi = acc?.faturaTarihi || new Date().toISOString().split('T')[0];
  const currency = acc?.currency || applicantData?.currency || getCurrencyForCountry(applicantData.ulke);
  const symbol = getCurrencySymbol(currency, applicantData.ulke);

  const formattedKons = calc.konsoloslukUcreti.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formattedNet = calc.hizmetBedeli.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formattedKdvHaric = calc.kdvHariçToplam.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formattedKdv = calc.kdv.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formattedTotal = calc.toplam.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const musteriTipi = applicantData.musteriTipi || acc?.musteriTipi || 'Bireysel';

  let bankAccountsList: any[] = [];
  try {
    if (settings.bank_accounts) {
      bankAccountsList = JSON.parse(settings.bank_accounts);
    }
  } catch (e) {}

  const activeBankAccounts = bankAccountsList.filter((b: any) => b.isActive !== false);

  let bankAccountsHtml = '';
  if (activeBankAccounts.length > 0) {
    bankAccountsHtml = `
      <!-- BANKA HESAP BİLGİLERİ -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; margin-bottom: 20px;">
        <p style="margin: 0 0 10px 0; font-weight: 800; font-size: 13px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px;">
          🏦 ÖDEME BİLGİLERİ (HAVALE / EFT)
        </p>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          ${activeBankAccounts.map((accItem: any) => `
            <tr style="border-bottom: 1px dashed #e2e8f0;">
              <td style="padding: 8px 0; font-weight: 700; color: #1e293b; vertical-align: top;">
                ${accItem.bankName} ${accItem.branch ? `(${accItem.branch})` : ''}
                <span style="background-color: #e2e8f0; color: #334155; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; margin-left: 6px; text-transform: uppercase;">${accItem.currency || 'TRY'}</span>
              </td>
              <td style="padding: 8px 0; text-align: right; vertical-align: top;">
                <div style="font-family: monospace; font-weight: 800; color: #0f172a; font-size: 12px;">IBAN: ${accItem.iban}</div>
                <div style="color: #64748b; font-size: 11px;">Alıcı: ${accItem.accountHolder}</div>
                ${accItem.swift ? `<div style="color: #64748b; font-size: 10px; font-family: monospace;">SWIFT: ${accItem.swift}</div>` : ''}
              </td>
            </tr>
          `).join('')}
        </table>
        <p style="margin: 10px 0 0 0; font-size: 11px; color: #64748b; font-style: italic;">
          * Havale / EFT açıklama kısmına <strong>${applicantData.ad} ${applicantData.soyad} - ${applicantData.takipKodu}</strong> yazmanızı rica ederiz.
        </p>
      </div>
    `;
  }

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);">
      
      <!-- HEADER -->
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px 25px; color: #ffffff;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td>
              <h1 style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 1px; color: #ffffff;">MKM VİZE & DANIŞMANLIK</h1>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8; font-weight: 500;">Global Vize & Danışmanlık Hizmetleri</p>
            </td>
            <td style="text-align: right;">
              <span style="background-color: #e11d48; color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">PROFORMA FATURA</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- METADATA BAR -->
      <div style="background-color: #f8fafc; padding: 12px 25px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #475569;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td><strong>Fatura No:</strong> <span style="color: #0f172a; font-weight: 700;">${faturaNo}</span></td>
            <td style="text-align: center;"><strong>Tarih:</strong> ${faturaTarihi}</td>
            <td style="text-align: right;"><strong>Takip Kodu:</strong> <span style="color: #0f172a; font-weight: 700;">${applicantData.takipKodu}</span></td>
          </tr>
        </table>
      </div>

      <!-- NOT UYARISI (Fatura No / Tarih / Takip Kodu'nun hemen altında) -->
      <div style="padding: 10px 25px; background-color: #fef2f2; border-bottom: 1px solid #fecaca;">
        <p style="margin: 0; color: #991b1b; font-size: 12px; font-weight: 700; text-align: center;">
          ⚠️ NOT: Fatura bilgilerini kontrol edin ve hata varsa bildirin.
        </p>
      </div>

      <!-- CUSTOMER & APPLICATION INFO -->
      <div style="padding: 25px;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
          <tr>
            <td style="width: 50%; vertical-align: top; padding-right: 12px;">
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; height: 100%;">
                <h3 style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 800; letter-spacing: 0.5px;">MÜŞTERİ BİLGİLERİ</h3>
                <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #0f172a;">Sayın: ${applicantData.ad || ''} ${applicantData.soyad || ''}</p>
                <p style="margin: 0 0 4px 0; font-size: 13px; color: #475569;"><strong>Firma / Acente:</strong> ${applicantData.firmaAdi || acc?.firma || 'MKM VİZE'}</p>
                <p style="margin: 0 0 4px 0; font-size: 13px; color: #475569;"><strong>Pasaport No:</strong> ${applicantData.pasaportNo || '-'}</p>
                <p style="margin: 0; font-size: 13px; color: #475569;"><strong>E-posta:</strong> ${applicantData.email || '-'}</p>
              </div>
            </td>
            <td style="width: 50%; vertical-align: top; padding-left: 12px;">
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; height: 100%;">
                <h3 style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 800; letter-spacing: 0.5px;">BAŞVURU DETAYLARI</h3>
                <p style="margin: 0 0 4px 0; font-size: 13px; color: #475569;"><strong>Hedef Ülke:</strong> <span style="font-weight: 700; color: #0f172a;">${applicantData.ulke || '-'}</span></p>
                <p style="margin: 0 0 4px 0; font-size: 13px; color: #475569;"><strong>Vize Kategorisi:</strong> ${applicantData.vizeKategorisi || 'Turistik'}</p>
                <p style="margin: 0 0 4px 0; font-size: 13px; color: #475569;"><strong>Müşteri Türü:</strong> <span style="font-weight: 700; color: #0284c7;">${musteriTipi}</span></p>
                <p style="margin: 0; font-size: 13px; color: #475569;"><strong>Ödeme Durumu:</strong> <span style="font-weight: 700; color: ${applicantData.odemeDurumu === 'Ödendi' ? '#059669' : '#e11d48'};">${applicantData.odemeDurumu || 'Ödenmedi'}</span></p>
              </div>
            </td>
          </tr>
        </table>

        <!-- ITEMS TABLE -->
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
          <thead>
            <tr style="background-color: #1e293b; color: #ffffff; text-align: left;">
              <th style="padding: 10px; width: 30px; text-align: center;">#</th>
              <th style="padding: 10px;">Hizmet / Kalem Açıklaması</th>
              <th style="padding: 10px; text-align: center;">Miktar</th>
              <th style="padding: 10px; text-align: right;">Birim Fiyat</th>
              <th style="padding: 10px; text-align: center;">KDV</th>
              <th style="padding: 10px; text-align: right;">Toplam</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px; text-align: center; color: #64748b;">1</td>
              <td style="padding: 10px; font-weight: 600; color: #0f172a;">
                <div>${applicantData.ulke || ''} Vize Başvuru Danışmanlık Hizmet Bedeli</div>
                <div style="font-size: 11px; color: #64748b; font-weight: 400; margin-top: 2px;">Konsolosluk randevusu, evrak incelemesi ve dosya hazırlama danışmanlık hizmeti.</div>
              </td>
              <td style="padding: 10px; text-align: center; color: #475569;">1 Adet</td>
              <td style="padding: 10px; text-align: right; font-family: monospace;">${formattedNet} ${symbol}</td>
              <td style="padding: 10px; text-align: center; color: #475569;">%20</td>
              <td style="padding: 10px; text-align: right; font-weight: 700; font-family: monospace;">${(calc.hizmetBedeli + calc.kdv).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}</td>
            </tr>
            ${calc.konsoloslukUcreti > 0 ? `
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #f8fafc;">
              <td style="padding: 10px; text-align: center; color: #64748b;">2</td>
              <td style="padding: 10px; font-weight: 600; color: #0f172a;">
                <div>${applicantData.ulke || ''} Konsolosluk Harcı / Ücreti</div>
                <div style="font-size: 11px; color: #64748b; font-weight: 400; margin-top: 2px;">Resmi konsolosluk ve başvuru merkezi harç tutarı (KDV'den İstisna).</div>
              </td>
              <td style="padding: 10px; text-align: center; color: #475569;">1 Adet</td>
              <td style="padding: 10px; text-align: right; font-family: monospace;">${formattedKons} ${symbol}</td>
              <td style="padding: 10px; text-align: center; color: #475569;">%0 (İstisna)</td>
              <td style="padding: 10px; text-align: right; font-weight: 700; font-family: monospace;">${formattedKons} ${symbol}</td>
            </tr>
            ` : ''}
          </tbody>
        </table>

        <!-- TOTALS BREAKDOWN -->
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 25px;">
          ${calc.konsoloslukUcreti > 0 ? `
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Konsolosluk Harcı (KDV İstisna):</td>
            <td style="padding: 6px 0; text-align: right; font-family: monospace; font-weight: 600; color: #0f172a;">${formattedKons} ${symbol}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Hizmet Bedeli (KDV Matrahı):</td>
            <td style="padding: 6px 0; text-align: right; font-family: monospace; font-weight: 600; color: #0f172a;">${formattedNet} ${symbol}</td>
          </tr>
          <tr style="background-color: ${musteriTipi === 'Bireysel' ? '#fef3c7' : '#f8fafc'}; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px 10px; font-weight: 700; color: #0f172a;">KDV HARİÇ TUTAR:</td>
            <td style="padding: 8px 10px; text-align: right; font-family: monospace; font-weight: 800; font-size: 14px; color: #0f172a;">${formattedKdvHaric} ${symbol}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">KDV Tutarı (%${calc.kdvOrani}):</td>
            <td style="padding: 6px 0; text-align: right; font-family: monospace; font-weight: 600; color: #0f172a;">+${formattedKdv} ${symbol}</td>
          </tr>
          <tr style="background-color: ${musteriTipi === 'Kurumsal' ? '#ffe4e6' : '#fff1f2'}; border-top: 2px solid #0f172a;">
            <td style="padding: 10px; font-weight: 800; font-size: 14px; color: #be123c;">KDV DAHİL TOPLAM TUTAR:</td>
            <td style="padding: 10px; text-align: right; font-family: monospace; font-weight: 900; font-size: 17px; color: #be123c;">${formattedTotal} ${symbol}</td>
          </tr>
        </table>

        ${bankAccountsHtml}

        ${applicantData.notlar && applicantData.notlar.trim().length > 0 ? `
        <!-- NOTLAR / ÖZEL İSTEKLER -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; margin-bottom: 15px; font-size: 12px; color: #334155;">
          <p style="margin: 0 0 6px 0; font-weight: 800; font-size: 12px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
            📝 NOTLAR / ÖZEL İSTEKLER
          </p>
          <p style="margin: 0; line-height: 1.5; white-space: pre-wrap; font-weight: 500;">
            ${applicantData.notlar.trim()}
          </p>
        </div>
        ` : ''}

      </div>

      <!-- FOOTER -->
      <div style="background-color: #f8fafc; padding: 20px 25px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
        <p style="margin: 0 0 6px 0; font-weight: 700; color: #334155;">MKM VİZE DANIŞMANLIK LTD. ŞTİ.</p>
        <p style="margin: 0 0 8px 0;">Telefon: <strong>+90 532 742 88 71</strong> | E-posta: <strong>info@mkmvize.com</strong></p>
        <p style="margin: 0; color: #94a3b8; font-size: 10px;">© ${new Date().getFullYear()} MKM VİZE. Bu e-posta resmi proforma fatura bilgilendirmesidir.</p>
      </div>

    </div>
  `;

  try {
    await transporter.sendMail({
      from: settings.smtp_from || process.env.SMTP_FROM || '"MKM VİZE" <info@mkmvize.com>',
      to: recipients.join(', '),
      subject: `PROFORMA FATURA - ${applicantData.ad} ${applicantData.soyad} (${applicantData.takipKodu})`,
      html
    });
    console.log(`Proforma e-postası başarıyla gönderildi -> Alıcılar: ${recipients.join(', ')}`);
    return true;
  } catch (error: any) {
    console.error("Proforma e-posta gönderim hatası detayı:", error);
    return false;
  }
};

async function startServer() {
  console.log('SUNUCU BAŞLATILIYOR...');
  const app = express();
  app.set('trust proxy', true); 
  app.use(express.json({ limit: '10mb' })); 
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Sunucunun güncel olduğunu test etmek için (BENZERSİZ TEST)
  app.get("/api/kontrol", (req, res) => {
    res.json({ 
      durum: "aktif", 
      versiyon: "1.4.5-STABLE", 
      zaman: new Date().toISOString(),
      mesaj: "Oturum yonetimi iframe destekli moda gecti (SameSite: None)." 
    });
  });

  // --- MIDDLEWARE VE YARDIMCI FONKSİYONLAR ---

  const triggerStatusChangeNotification = (applicant: any, oldStatus: string, newStatus: string) => {
    try {
      // Önce Bildirim Ayarlarını kontrol edelim
      const settings = db.prepare("SELECT status_change_notify_enabled FROM settings WHERE id = 1").get() as any;
      if (settings && settings.status_change_notify_enabled === 0) {
        return;
      }

      const title = "Başvuru Durumu Güncellendi";
      const message = `${applicant.ad} ${applicant.soyad} isimli müşterinin başvuru durumu "${oldStatus || 'Bilinmiyor'}" iken "${newStatus}" olarak güncellendi. (Takip Kodu: ${applicant.takipKodu})`;
      const created_at = new Date().toISOString();

      // Hem ilgili firma kullanıcılarını hem de tüm adminleri kapsayacak şekilde alıcıları belirleyelim
      const recipientsMap = new Map<number, { id: number, username: string }>();

      // Acente kullanıcıları
      if (applicant.firmaAdi) {
        const assocUsers = db.prepare("SELECT id, username FROM users WHERE acenteAdi = ? OR acenteAdi = ? OR firmaUnvani = ? OR firmaUnvani = ?").all(applicant.firmaAdi, applicant.firmaAdi.trim(), applicant.firmaAdi, applicant.firmaAdi.trim()) as any[];
        assocUsers.forEach(u => recipientsMap.set(u.id, { id: u.id, username: u.username }));
      }

      // Admin kullanıcıları
      const admins = db.prepare("SELECT id, username FROM users WHERE role = 'admin'").all() as any[];
      admins.forEach(u => recipientsMap.set(u.id, { id: u.id, username: u.username }));

      // Bildirimleri kaydet
      const stmt = db.prepare(`
        INSERT INTO user_notifications (userId, username, firmaAdi, title, message, type, read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?)
      `);
      
      for (const u of recipientsMap.values()) {
        stmt.run(u.id, u.username, applicant.firmaAdi || "", title, message, 'status_change', created_at);
      }
    } catch (err) {
      console.error("Hata - Bildirim Tetikleme:", err);
    }
  };

   const requireAuth = (req: any, res: any, next: any) => {
     if (!req.session.userId) {
       return res.status(401).json({ error: "Oturum açmanız gerekiyor." });
     }
     next();
   };

   const requireAdmin = (req: any, res: any, next: any) => {
     if (!req.session.userId) {
       return res.status(401).json({ error: "Oturum açmanız gerekiyor." });
     }
     const user = db.prepare("SELECT role FROM users WHERE id = ?").get(req.session.userId) as any;
     if (!user || user.role !== 'admin') {
       return res.status(403).json({ error: "Bu işlem için yetkiniz yok." });
     }
     next();
   };

  // Session dizinini oluştur (FileStore için gerekli)
  const sessionsDir = path.join(process.cwd(), 'sessions');
  if (!fs.existsSync(sessionsDir)) {
    try {
      fs.mkdirSync(sessionsDir, { recursive: true });
      fs.appendFileSync(STARTUP_LOG, "Sessions dizini oluşturuldu.\n");
    } catch (e) {
      fs.appendFileSync(STARTUP_LOG, `Sessions dizini oluşturulamadı: ${e}\n`);
    }
  } else {
    try {
      fs.accessSync(sessionsDir, fs.constants.W_OK);
      fs.appendFileSync(STARTUP_LOG, "Sessions dizini yazılabilir.\n");
    } catch (e) {
      fs.appendFileSync(STARTUP_LOG, `SESSIONS DİZİNİ YAZILAMAZ: ${e}\n`);
    }
  }

  // Veritabanı yazılabilirlik kontrolü
  try {
    const dbPath = path.resolve(process.cwd(), "mkm_vize.db");
    fs.accessSync(dbPath, fs.constants.W_OK);
    fs.appendFileSync(STARTUP_LOG, "Veritabanı dosyası yazılabilir.\n");
  } catch (e) {
    fs.appendFileSync(STARTUP_LOG, `VERİTABANI DOSYASI YAZILAMAZ: ${e}\n`);
  }

  // Session configuration (SQLite backed - Zero file lock / EPERM issues)
  fs.appendFileSync(STARTUP_LOG, "Session middleware yapılandırılıyor...\n");
  app.use(session({
    store: new SqliteSessionStore(),
    secret: 'mkm-vize-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    proxy: true,
    name: 'mkm_vize_sid',
    cookie: {
      secure: false, // İlk etapta false, middleware'de dinamik ayarlanacak
      sameSite: 'lax',
      httpOnly: true,
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000
    }
  }));

  // İstek Loglayıcı & Dinamik Çerez Güvenliği
  app.use((req, res, next) => {
    // Protokol tespiti (Plesk/Nginx arkasında HTTPS kontrolü)
    const isHTTPS = req.secure || req.headers['x-forwarded-proto'] === 'https';
    
    if (req.session && req.session.cookie) {
      // HTTPS ise Secure=true ve SameSite=None (iframe desteği için)
      // Değilse Secure=false ve SameSite=Lax (HTTP üzerinden giriş yapabilmek için)
      if (isHTTPS) {
        req.session.cookie.secure = true;
        req.session.cookie.sameSite = 'none';
      } else {
        req.session.cookie.secure = false;
        req.session.cookie.sameSite = 'lax';
      }
    }

    if (req.path.startsWith('/api/')) {
      const sessionId = req.sessionID;
      const userId = (req.session as any)?.userId;
      const hasCookie = req.headers.cookie ? 'Var' : 'Yok';
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - SID: ${sessionId} - UID: ${userId} - Cookie: ${hasCookie}`);
    }
    next();
  });

  // --- TOPLU YÜKLEME FİX ---
  const handleBatchInsert = (req: any, res: any) => {
    console.log(`TOPLU İŞLEM: ${req.path} - Kayıt sayısı: ${Array.isArray(req.body) ? req.body.length : 'Dizi değil'}`);
    const companies = req.body;
    if (!Array.isArray(companies)) {
      return res.status(400).json({ error: "Geçersiz veri formatı. Dizi bekleniyor." });
    }

    try {
      const stmt = db.prepare(`
        INSERT INTO companies (
          firma_unvani, acente_adi, vergi_dairesi, vergi_no, email, 
          telefon, website, adres, yetkili_ad_soyad, yetkili_telefon, kayit_tarihi
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertMany = db.transaction((items) => {
        for (const item of items) {
          stmt.run(
            item.firma_unvani || "", item.acente_adi || "", item.vergi_dairesi || "", 
            item.vergi_no || "", item.email || "", item.telefon || "", 
            item.website || "", item.adres || "", item.yetkili_ad_soyad || "", 
            item.yetkili_telefon || "", new Date().toISOString()
          );
        }
      });

      insertMany(companies);
      logAction((req.session as any).userId, (req.session as any).username, "Toplu İşlem", `${companies.length} adet firma işlendi.`, 'success');
      res.json({ success: true, count: companies.length });
    } catch (error: any) {
      console.error("Toplu işlem hatası:", error);
      res.status(500).json({ error: "İşlem hatası: " + error.message });
    }
  };

  app.post("/api/companies/batch", requireAuth, handleBatchInsert);
  app.post("/api/companies/bulk", requireAuth, handleBatchInsert);
  app.post("/api/batch", requireAuth, handleBatchInsert); 
  // --- END TOPLU YÜKLEME FİX ---

  // iisnode (Plesk) için PORT bir named pipe olabilir, bu yüzden string veya number olabilir.
  const PORT = process.env.PORT || 3000;

  // --- AUTH ROUTES ---
  app.post("/api/auth/register", async (req, res) => {
    const { username, password, adminEmail, firmaUnvani, acenteAdi } = req.body;
    if (!username || !password || !adminEmail) return res.status(400).json({ error: "Kullanıcı adı, e-posta ve şifre gerekli." });

    const existingUser = db.prepare("SELECT * FROM users WHERE adminEmail = ?").get(adminEmail);
    if (existingUser) {
      return res.status(400).json({ error: "Bu e-posta adresi zaten kullanımda." });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      // İlk kullanıcıyı admin yap, sonrakileri user
      const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
      const role = userCount.count === 0 ? 'admin' : 'user';
      
      db.prepare("INSERT INTO users (username, password, adminEmail, firmaUnvani, acenteAdi, role) VALUES (?, ?, ?, ?, ?, ?)").run(
        username, 
        hashedPassword,
        adminEmail || "",
        firmaUnvani || "",
        acenteAdi || "",
        role
      );
      logAction(0, 'Sistem', 'Yeni Kayıt', `Yeni kullanıcı kaydı: ${username} (${adminEmail}) - Rol: ${role}`, 'success');
      res.json({ success: true, message: "Kayıt başarılı." });
    } catch (e) {
      res.status(400).json({ error: "Bu kullanıcı adı zaten alınmış." });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    console.log(`${email} için giriş denemesi`);
    
    // Hem e-posta hem de kullanıcı adına göre ara (eski admin hesaplarını desteklemek için)
    const user = db.prepare("SELECT * FROM users WHERE adminEmail = ? OR username = ?").get(email, email) as any;

    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.log(`${email} için giriş başarısız`);
      return res.status(401).json({ error: "Geçersiz e-posta/kullanıcı adı veya şifre." });
    }

    req.session.userId = user.id;
    req.session.username = user.username;
    (req.session as any).acenteAdi = user.acenteAdi;
    
    req.session.save((err) => {
      if (err) {
        console.error("Oturum kaydetme hatası:", err);
        return res.status(500).json({ error: "Oturum kaydedilemedi." });
      }
      console.log(`${user.username} (ID: ${user.id}) başarıyla giriş yaptı, oturum kaydedildi. SID: ${req.sessionID}`);
      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          username: user.username,
          acenteAdi: user.acenteAdi,
          adminEmail: user.adminEmail,
          firmaUnvani: user.firmaUnvani,
          role: user.role
        } 
      });
    });
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    const { email } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE adminEmail = ?").get(email) as any;
    
    if (!user) {
      return res.status(404).json({ error: "Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı." });
    }

    // Gerçek bir uygulamada burada şifre sıfırlama linki gönderilir.
    // Şimdilik sadece başarılı mesajı dönüyoruz.
    res.json({ success: true, message: "Şifre sıfırlama talimatları e-posta adresinize gönderildi." });
  });

  app.post("/api/auth/update-profile", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ error: "Oturum açılmamış." });

    const { username, password, adminEmail, firmaUnvani, acenteAdi } = req.body;
    
    try {
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.prepare(`
          UPDATE users 
          SET username = ?, password = ?, adminEmail = ?, firmaUnvani = ?, acenteAdi = ?
          WHERE id = ?
        `).run(username, hashedPassword, adminEmail, firmaUnvani, acenteAdi, userId);
      } else {
        db.prepare(`
          UPDATE users 
          SET username = ?, adminEmail = ?, firmaUnvani = ?, acenteAdi = ?
          WHERE id = ?
        `).run(username, adminEmail, firmaUnvani, acenteAdi, userId);
      }

      const updatedUser = db.prepare("SELECT id, username, acenteAdi, adminEmail, firmaUnvani, role FROM users WHERE id = ?").get(userId) as any;
      logAction(userId, username, 'Profil Güncelleme', 'Kullanıcı kendi profilini güncelledi.', 'info');
      res.json({ success: true, user: updatedUser });
    } catch (e) {
      res.status(400).json({ error: "Güncelleme sırasında bir hata oluştu." });
    }
  });

   app.get("/api/auth/me", (req, res) => {
     if (!req.session.userId) {
       return res.status(401).json({ error: "Oturum açılmamış." });
     }
     const userId = (req.session as any).userId;
     console.log(`Oturum kontrolü: ${userId}, SID: ${req.sessionID}`);
     
     const user = db.prepare("SELECT id, username, acenteAdi, adminEmail, firmaUnvani, role FROM users WHERE id = ?").get(userId) as any;
     if (!user) {
       return res.status(401).json({ error: "Kullanıcı bulunamadı." });
     }
     
     res.json({ user });
   });



  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  // Auth Middleware kaldırıldı (artık en üstte)

  app.post("/api/change-password", requireAuth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = (req.session as any).userId;

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).json({ error: "Mevcut şifre hatalı." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashedPassword, userId);
    
    logAction(userId, user.username, 'Şifre Değiştirildi', 'Kullanıcı şifresini başarıyla güncelledi.', 'success');
    res.json({ success: true, message: "Şifre güncellendi." });
  });

  // requireAdmin ve logAction kaldırıldı (artık en üstte)

  // --- API ROUTES ---

  // Calendar ICS Endpoint
  app.get("/api/calendar/ics/:kod", (req, res) => {
    const { kod } = req.params;
    try {
      const applicant = db.prepare("SELECT * FROM applicants WHERE takipKodu = ?").get(kod) as any;
      
      if (!applicant || !applicant.randevuTarihi || !applicant.saat) {
        return res.status(404).send("Randevu bilgisi bulunamadı.");
      }

      const datePart = applicant.randevuTarihi.replace(/-/g, '');
      const timePart = applicant.saat.replace(/:/g, '');
      const start = `${datePart}T${timePart}00`;
      
      const [hours, minutes] = applicant.saat.split(':').map(Number);
      const endHours = (hours + 1).toString().padStart(2, '0');
      const end = `${datePart}T${endHours}${minutes.toString().padStart(2, '0')}00`;
      
      const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//MKM Vize//NONSGML v1.0//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${applicant.takipKodu}@mkmvize.com`,
        `DTSTAMP:${now}`,
        `DTSTART;TZID=Europe/Istanbul:${start}`,
        `DTEND;TZID=Europe/Istanbul:${end}`,
        `SUMMARY:Vize Randevusu - ${applicant.ulke}`,
        `DESCRIPTION:MKM Vize Danışmanlığı - ${applicant.basvuruMerkezi || ''}`,
        `LOCATION:${applicant.merkezAdresi || ''}`,
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'BEGIN:VALARM',
        'TRIGGER:-PT24H',
        'ACTION:DISPLAY',
        'DESCRIPTION:Vize Randevusu Hatırlatması',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="vize-randevu-${applicant.takipKodu}.ics"`);
      res.send(icsContent);
    } catch (error) {
      console.error("ICS generation error:", error);
      res.status(500).send("Takvim dosyası oluşturulamadı.");
    }
  });

  // Request Logging Middleware for Debugging
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - SID: ${req.sessionID} - Kullanıcı ID Mevcut mu: ${!!(req.session as any).userId}`);
      if (req.headers.cookie) {
        const cookies = req.headers.cookie.split(';').map(c => c.trim().split('=')[0]);
        console.log(`Gelen Çerezler: ${cookies.join(', ')}`);
      } else {
        console.log('İstekte çerez bulunamadı');
      }
    }
    next();
  });

  // Kullanıcılar
  app.get("/api/users", requireAdmin, (req, res) => {
    try {
      const rows = db.prepare("SELECT id, username, adminEmail, acenteAdi, firmaUnvani, role FROM users ORDER BY username ASC").all();
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: "Kullanıcılar getirilemedi." });
    }
  });

  app.post("/api/users", requireAdmin, async (req, res) => {
    const { username, password, adminEmail, acenteAdi, firmaUnvani, role } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = db.prepare(`
        INSERT INTO users (username, password, adminEmail, acenteAdi, firmaUnvani, role)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(username, hashedPassword, adminEmail, acenteAdi, firmaUnvani, role || 'user');
      
      const newUser = db.prepare("SELECT id, username, adminEmail, acenteAdi, firmaUnvani, role FROM users WHERE id = ?").get(result.lastInsertRowid);
      logAction((req.session as any).userId, (req.session as any).username, 'Kullanıcı Oluşturuldu', `Yeni kullanıcı: ${username} (${role})`, 'success');
      res.json(newUser);
    } catch (e) {
      res.status(400).json({ error: "Kullanıcı oluşturulamadı." });
    }
  });

  app.post("/api/users/delete/:id", requireAdmin, (req, res) => {
    const { id } = req.params;
    try {
      const userToDelete = db.prepare("SELECT username FROM users WHERE id = ?").get(id) as any;
      db.prepare("DELETE FROM users WHERE id = ?").run(id);
      logAction((req.session as any).userId, (req.session as any).username, 'Kullanıcı Silindi', `Kullanıcı silindi: ${userToDelete?.username || id}`, 'warning');
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Kullanıcı silinemedi." });
    }
  });

  // Firmalar
  app.get("/api/companies", requireAuth, (req, res) => {
    try {
      const rows = db.prepare("SELECT * FROM companies ORDER BY firma_unvani ASC").all();
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: "Firmalar getirilemedi." });
    }
  });

  app.post("/api/companies", requireAuth, (req, res) => {
    const data = req.body;
    try {
      db.prepare(`
        INSERT INTO companies (
          firma_unvani, acente_adi, vergi_dairesi, vergi_no, 
          email, telefon, website, adres, 
          yetkili_ad_soyad, yetkili_telefon, kayit_tarihi
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        data.firma_unvani, data.acente_adi || "", data.vergi_dairesi, data.vergi_no,
        data.email, data.telefon, data.website || "", data.adres,
        data.yetkili_ad_soyad, data.yetkili_telefon, new Date().toISOString()
      );
      logAction((req.session as any).userId, (req.session as any).username, 'Firma Kaydedildi', `Yeni firma eklendi: ${data.firma_unvani}`, 'success');
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Firma kaydedilemedi." });
    }
  });

  app.post("/api/companies/bulk-delete", requireAdmin, (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Silinecek ID listesi geçersiz." });
    }

    try {
      const stmt = db.prepare(`DELETE FROM companies WHERE id = ?`);
      const deleteMany = db.transaction((idsToDelete) => {
        for (const id of idsToDelete) {
          stmt.run(id);
        }
      });

      deleteMany(ids);
      logAction((req.session as any).userId, (req.session as any).username, "Toplu Firma Silme", `${ids.length} firma toplu olarak silindi.`, 'warning');
      res.json({ success: true, count: ids.length });
    } catch (error: any) {
      res.status(500).json({ error: "Silme işlemi sırasında hata oluştu: " + error.message });
    }
  });

  app.post("/api/companies/update/:id", requireAuth, (req, res) => {
    const data = req.body;
    try {
      db.prepare(`
        UPDATE companies SET 
          firma_unvani = ?, acente_adi = ?, vergi_dairesi = ?, vergi_no = ?, 
          email = ?, telefon = ?, website = ?, adres = ?, 
          yetkili_ad_soyad = ?, yetkili_telefon = ?
        WHERE id = ?
      `).run(
        data.firma_unvani, data.acente_adi || "", data.vergi_dairesi, data.vergi_no,
        data.email, data.telefon, data.website || "", data.adres,
        data.yetkili_ad_soyad, data.yetkili_telefon, req.params.id
      );
      logAction((req.session as any).userId, (req.session as any).username, 'Firma Güncellendi', `Firma bilgileri güncellendi: ${data.firma_unvani}`, 'info');
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Firma güncellenemedi." });
    }
  });

  app.post("/api/companies/delete/:id", requireAdmin, (req, res) => {
    try {
      const company = db.prepare("SELECT firma_unvani FROM companies WHERE id = ?").get(req.params.id) as any;
      db.prepare("DELETE FROM companies WHERE id = ?").run(req.params.id);
      if (company) {
        logAction((req.session as any).userId, (req.session as any).username, 'Firma Silindi', `Firma silindi: ${company.firma_unvani}`, 'warning');
      }
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Firma silinemedi." });
    }
  });

  // Ülkeler
  app.get("/api/countries", requireAuth, (req, res) => {
    const rows = db.prepare("SELECT * FROM countries ORDER BY name ASC").all();
    res.json(rows);
  });

  app.post("/api/countries", requireAdmin, (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Ülke adı gerekli." });
    try {
      db.prepare("INSERT INTO countries (name) VALUES (?)").run(name);
      logAction((req.session as any).userId, (req.session as any).username, 'Ülke Eklendi', `Yeni ülke eklendi: ${name}`, 'success');
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Bu ülke zaten kayıtlı." });
    }
  });

  app.post("/api/countries/delete/:id", requireAdmin, (req, res) => {
    const { id } = req.params;
    const country = db.prepare("SELECT name FROM countries WHERE id = ?").get(id) as any;
    db.prepare("DELETE FROM countries WHERE id = ?").run(id);
    logAction((req.session as any).userId, (req.session as any).username, 'Ülke Silindi', `Ülke silindi: ${country?.name || id}`, 'warning');
    res.json({ success: true });
  });

  // Tüm Kayıtları Getir
  app.get("/api/applicants", requireAuth, (req, res) => {
    const rows = db.prepare("SELECT * FROM applicants ORDER BY id DESC").all();
    res.json(rows);
  });

  // Tek Kayıt Sorgula
  app.get("/api/applicants/:query", requireAuth, (req, res) => {
    const query = req.params.query.toUpperCase();
    const row = db.prepare("SELECT * FROM applicants WHERE takipKodu = ? OR UPPER(soyad) = ?").get(query, query);
    res.json(row || { error: "Kayıt bulunamadı" });
  });

  // Yeni Kayıt veya Güncelleme
  app.post("/api/applicants", requireAuth, (req, res) => {
    try {
      const data = req.body;
      
      // Firma adını şirketler tablosuna otomatik ekle (eğer yoksa)
      if (data.firmaAdi && data.firmaAdi.trim().length > 0) {
        const companyExists = db.prepare("SELECT id FROM companies WHERE acente_adi = ? OR firma_unvani = ?").get(data.firmaAdi, data.firmaAdi);
        if (!companyExists) {
          db.prepare("INSERT INTO companies (firma_unvani, acente_adi, kayit_tarihi) VALUES (?, ?, ?)").run(data.firmaAdi, data.firmaAdi, new Date().toISOString());
        }
      }

      // Takip kodu varsa veritabanında kontrol et
      const existing = data.takipKodu ? db.prepare("SELECT * FROM applicants WHERE takipKodu = ?").get(data.takipKodu) as any : null;

      if (existing) {
        // Mevcut durumu al (e-posta gönderimi kararı için)
        const current = existing;

        // Dinamik UPDATE sorgusu oluştur (Sadece gelen alanları güncelle)
        const fieldsToUpdate = [
          'ad', 'soyad', 'dogumTarihi', 'ulke', 'islemDurumu', 
          'randevuTarihi', 'saat', 'odemeDurumu', 'pasaportNo', 
          'notlar', 'pasaportSkt', 'email', 'vizeSonucu', 
          'vizeGecerlilikTarihi', 'firmaAdi', 'ikametSehri', 'basvuruMerkezi', 'merkezAdresi',
          'timeline', 'documents', 'extra_fields', 'vizeKategorisi',
          'konsoloslukUcreti', 'hizmetBedeli', 'kdvOrani', 'kdvTutarı', 'fiyat', 'musteriTipi'
        ];

        const updates: string[] = [];
        const values: any[] = [];

        fieldsToUpdate.forEach(field => {
          if (data[field] !== undefined) {
            updates.push(`${field} = ?`);
            let val = data[field];
            if (val !== null && typeof val === 'object') {
              val = JSON.stringify(val);
            }
            values.push(val);
          }
        });

        if (updates.length > 0) {
          // Randevu tarihi veya vize bitiş tarihi değişirse hatırlatıcıları sıfırla
          if (data.randevuTarihi !== undefined && data.randevuTarihi !== current.randevuTarihi) {
            updates.push('hatirlatma7Gun = ?', 'hatirlatma2Gun = ?');
            values.push(0, 0);
          }
          if (data.vizeGecerlilikTarihi !== undefined && data.vizeGecerlilikTarihi !== current.vizeGecerlilikTarihi) {
            updates.push('hatirlatmaVizeBitis = ?');
            values.push(0);
          }

          const sql = `UPDATE applicants SET ${updates.join(', ')} WHERE takipKodu = ?`;
          values.push(data.takipKodu);
          db.prepare(sql).run(...values);

          if (data.islemDurumu !== undefined && data.islemDurumu !== current.islemDurumu) {
            triggerStatusChangeNotification(current, current.islemDurumu, data.islemDurumu);
          }
        }

        const updatedApplicant = { ...current, ...data };
        const isNewAppointment = data.randevuTarihi && (!current.randevuTarihi || current.randevuTarihi === "");
        const isStatusChangedToAppointment = data.islemDurumu === 'Randevu Alındı' && current.islemDurumu !== 'Randevu Alındı';

        // Otomatik Proforma Fatura kontrolü
        if (updatedApplicant.islemDurumu === 'Randevu Alındı') {
          ensureProformaInvoice(updatedApplicant);
        }

        if (isStatusChangedToAppointment || (updatedApplicant.islemDurumu === 'Randevu Alındı' && isNewAppointment)) {
          sendProfessionalEmail(
            updatedApplicant.email || "", 
            `MKM Vize - Proforma Fatura ve Randevu Bilgilendirmesi (${updatedApplicant.takipKodu})`, 
            "Randevunuz Onaylandı - Proforma Fatura", 
            "Vize başvurunuz için randevu bilgileriniz tanımlanmış ve proforma faturanız oluşturulmuştur. Detaylar aşağıda yer almaktadır.",
            updatedApplicant
          );
        } else if (data.email && isNewAppointment) {
          sendProfessionalEmail(
            data.email, 
            "MKM Vize - Başvuru Bilgilendirmesi", 
            "Randevunuz Onaylandı", 
            "Vize başvurunuz için randevu bilgileriniz sisteme tanımlanmıştır. Detaylar aşağıda yer almaktadır.",
            updatedApplicant
          );
        }

        logAction((req.session as any).userId, (req.session as any).username, "Başvuru Güncellendi", `${data.ad || current.ad} ${data.soyad || current.soyad} (${data.takipKodu}) güncellendi.`, 'info');
        res.json({ success: true, takipKodu: data.takipKodu });
      } else {
        // Yeni Kayıt
        const username = (req.session as any).username || 'ANW';
        const getUserInitials = (name: string) => {
          const cleanName = name.trim().toUpperCase();
          const words = cleanName.split(/\s+/);
          if (words.length >= 2) {
            return words.slice(0, 3).map((w: string) => w[0]).join('');
          }
          if (cleanName.length >= 2) {
            return cleanName.substring(0, 3);
          }
          return 'MKM';
        };
        const initials = getUserInitials(username);
        const newKod = data.takipKodu || `${initials}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        
        // Çakışma kontrolü (nadir durum)
        const collision = db.prepare("SELECT id FROM applicants WHERE takipKodu = ?").get(newKod);
        if (collision && !data.takipKodu) {
          return res.status(500).json({ error: "Kod üretme hatası, lütfen tekrar deneyin." });
        }

        const countryPrice = db.prepare("SELECT * FROM prices WHERE ulke = ?").get(data.ulke) as any;
        const calc = calculatePrice(
          data.konsoloslukUcreti ?? countryPrice?.konsoloslukUcreti ?? 0,
          data.hizmetBedeli ?? countryPrice?.hizmetBedeli,
          data.kdvOrani ?? countryPrice?.kdvOrani ?? 20,
          data.fiyat || countryPrice?.toplam
        );

        const stmt = db.prepare(`
          INSERT INTO applicants (
            takipKodu, ad, soyad, dogumTarihi, ulke, islemDurumu, 
            randevuTarihi, saat, odemeDurumu, pasaportNo, notlar, 
            pasaportSkt, email, kayitTarihi, firmaAdi, vizeSonucu, vizeGecerlilikTarihi,
            ikametSehri, basvuruMerkezi, merkezAdresi, timeline, documents, extra_fields, vizeKategorisi,
            konsoloslukUcreti, hizmetBedeli, kdvOrani, kdvTutarı, fiyat, musteriTipi
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
          newKod, data.ad, data.soyad, data.dogumTarihi, data.ulke, data.islemDurumu || "Talep Bekliyor",
          data.randevuTarihi || "", data.saat || "", data.odemeDurumu || "Ödenmedi", 
          data.pasaportNo || "", data.notlar || "", data.pasaportSkt || "",
          data.email || "", new Date().toISOString(), data.firmaAdi || "MKM VİZE",
          data.vizeSonucu || "", data.vizeGecerlilikTarihi || "",
          data.ikametSehri || "", data.basvuruMerkezi || "", data.merkezAdresi || "",
          JSON.stringify(data.timeline || []), JSON.stringify(data.documents || []),
          JSON.stringify(data.extra_fields || {}), data.vizeKategorisi || "Turistik",
          calc.konsoloslukUcreti, calc.hizmetBedeli, calc.kdvOrani, calc.kdv, calc.toplam,
          data.musteriTipi || "Bireysel"
        );

        // Otomatik Proforma Fatura kontrolü ve e-posta gönderimi
        const newApplicantData = { ...data, takipKodu: newKod, islemDurumu: data.islemDurumu || "Talep Bekliyor" };
        if (newApplicantData.islemDurumu === 'Randevu Alındı') {
          ensureProformaInvoice(newApplicantData);
          sendProfessionalEmail(
            newApplicantData.email || "",
            `MKM Vize - Proforma Fatura ve Randevu Bilgilendirmesi (${newKod})`,
            "Randevunuz Onaylandı - Proforma Fatura",
            "Vize başvurunuz ve randevu bilgileriniz kaydedilmiş, proforma faturanız oluşturulmuştur. Detaylar aşağıda yer almaktadır.",
            newApplicantData
          );
        } else if (data.email) {
          sendProfessionalEmail(
            data.email,
            "MKM Vize - Başvuru Bilgilendirmesi",
            "Başvurunuz Başarıyla Kaydedildi",
            "Vize başvuru talebiniz sistemimize başarıyla kaydedilmiştir. Takip kodunuz ile işlemlerinizi sorgulayabilirsiniz.",
            newApplicantData
          );
        }

        logAction((req.session as any).userId, (req.session as any).username, "Yeni Başvuru", `${data.ad} ${data.soyad} (${newKod}) eklendi.`, 'success');
        res.json({ success: true, takipKodu: newKod });
      }
    } catch (error: any) {
      console.error("Kayıt hatası:", error);
      res.status(500).json({ error: "Kayıt sırasında bir hata oluştu: " + error.message });
    }
  });

  app.post("/api/applicants/bulk-status", requireAdmin, (req, res) => {
    const { ids, status } = req.body;
    if (!ids || !Array.isArray(ids) || !status) return res.status(400).json({ error: "Geçersiz veri." });
    
    try {
      const placeholders = ids.map(() => '?').join(',');
      const applicantsToUpdate = db.prepare(`SELECT * FROM applicants WHERE takipKodu IN (${placeholders})`).all(...ids) as any[];

      const stmt = db.prepare("UPDATE applicants SET islemDurumu = ? WHERE takipKodu = ?");
      const transaction = db.transaction((ids, status) => {
        for (const id of ids) stmt.run(status, id);
      });
      transaction(ids, status);

      applicantsToUpdate.forEach(item => {
        if (item.islemDurumu !== status) {
          triggerStatusChangeNotification(item, item.islemDurumu, status);
        }
        if (status === 'Randevu Alındı') {
          const updated = { ...item, islemDurumu: status };
          ensureProformaInvoice(updated);
          if (item.islemDurumu !== 'Randevu Alındı') {
            sendProfessionalEmail(
              updated.email || "",
              `MKM Vize - Proforma Fatura ve Randevu Bilgilendirmesi (${updated.takipKodu})`,
              "Randevunuz Onaylandı - Proforma Fatura",
              "Vize başvurunuz için randevu durumunuz güncellenmiş ve proforma faturanız oluşturulmuştur. Detaylar aşağıda yer almaktadır.",
              updated
            );
          }
        }
      });

      logAction((req.session as any).userId, (req.session as any).username, "Toplu Durum Güncelleme", `${ids.length} kaydın durumu "${status}" yapıldı.`, 'info');
      res.json({ success: true });
    } catch (e) {
      console.error("Toplu durum güncelleme hatası:", e);
      res.status(400).json({ error: "Toplu güncelleme başarısız." });
    }
  });

  app.post("/api/applicants/bulk-delete", requireAdmin, (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: "Geçersiz veri." });
    
    try {
      const stmt = db.prepare("DELETE FROM applicants WHERE takipKodu = ?");
      const transaction = db.transaction((ids) => {
        for (const id of ids) stmt.run(id);
      });
      transaction(ids);
      logAction((req.session as any).userId, (req.session as any).username, "Toplu Silme", `${ids.length} kayıt silindi.`, 'warning');
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Toplu silme başarısız." });
    }
  });

  // Kayıt Sil
  app.post("/api/applicants/delete/:kod", requireAdmin, (req, res) => {
    const { kod } = req.params;
    db.prepare("DELETE FROM applicants WHERE takipKodu = ?").run(kod);
    logAction((req.session as any).userId, (req.session as any).username, "Başvuru Silindi", `${kod} takip kodlu başvuru silindi.`, 'warning');
    res.json({ success: true });
  });

  // Proforma Fatura E-Posta Gönder (Müşteri + Admin)
  app.post("/api/applicants/send-proforma-email", requireAuth, async (req, res) => {
    const { takipKodu } = req.body;
    if (!takipKodu) return res.status(400).json({ error: "Takip kodu gereklidir." });

    try {
      let applicant = db.prepare("SELECT * FROM applicants WHERE takipKodu = ?").get(takipKodu) as any;
      if (!applicant) {
        return res.status(404).json({ error: "Başvuru sahibi bulunamadı." });
      }

      // Proforma fatura muhasebe kaydını kontrol et / oluştur
      ensureProformaInvoice(applicant);

      // Güncellenmiş başvuru verisini al
      applicant = db.prepare("SELECT * FROM applicants WHERE takipKodu = ?").get(takipKodu) as any;

      const emailSent = await sendProformaInvoiceEmail(
        applicant.email || "",
        applicant
      );

      if (emailSent) {
        logAction((req.session as any).userId, (req.session as any).username, "Proforma E-Postası Gönderildi", `${applicant.ad} ${applicant.soyad} (${applicant.takipKodu}) proforma faturası e-posta ile gönderildi.`, 'success');
        res.json({ success: true, message: "Proforma fatura e-postası hem müşteriye hem de yöneticiye başarıyla gönderildi." });
      } else {
        res.status(500).json({ error: "E-posta gönderilemedi. Lütfen sistem e-posta (SMTP) ayarlarını kontrol edin." });
      }
    } catch (e: any) {
      console.error("Proforma e-posta gönderme hatası:", e);
      res.status(500).json({ error: "E-posta gönderilirken bir hata oluştu: " + e.message });
    }
  });

  // Muhasebe Kaydı
  app.post("/api/accounting", requireAuth, (req, res) => {
    const data = req.body;

    // Aynı takip koduna sahip bir kayıt var mı kontrol et
    const existing = db.prepare("SELECT * FROM accounting WHERE takipKodu = ?").get(data.takipKodu) as any;
    const countryName = data.ulke || existing?.ulke;
    const effectiveCurrency = (data.currency && data.currency !== 'TRY') 
      ? data.currency 
      : (existing?.currency && existing.currency !== 'TRY' ? existing.currency : getCurrencyForCountry(countryName));

    const countryPrice = db.prepare("SELECT * FROM prices WHERE ulke = ?").get(countryName) as any;
    const calc = calculatePrice(
      data.konsoloslukUcreti ?? existing?.konsoloslukUcreti ?? countryPrice?.konsoloslukUcreti ?? 0,
      data.hizmetBedeli ?? existing?.hizmetBedeli ?? countryPrice?.hizmetBedeli,
      data.kdvOrani ?? existing?.kdvOrani ?? countryPrice?.kdvOrani ?? 20,
      data.toplam || existing?.toplam
    );

    if (existing) {
      // Eğer yeni gelen veride faturaNo boşsa, eskisini koru
      const finalFaturaNo = data.faturaNo || existing.faturaNo || "";
      const finalFaturaTarihi = data.faturaTarihi || existing.faturaTarihi || "";
      
      const stmt = db.prepare(`
        UPDATE accounting SET 
          adSoyad = ?, islemDurumu = ?, randevuBilgisi = ?, 
          pasaportNo = ?, ulke = ?, odemeDurumu = ?, firma = ?, 
          konsoloslukUcreti = ?, hizmetBedeli = ?, netTutar = ?, kdvOrani = ?, kdv = ?, toplam = ?, faturaNo = ?, faturaTarihi = ?, currency = ?
        WHERE id = ?
      `);
      stmt.run(
        data.adSoyad || existing.adSoyad, 
        data.islemDurumu || existing.islemDurumu, 
        data.randevuBilgisi || existing.randevuBilgisi || "",
        data.pasaportNo || existing.pasaportNo, 
        data.ulke || existing.ulke, 
        data.odemeDurumu || existing.odemeDurumu, 
        data.firma || existing.firma, 
        calc.konsoloslukUcreti,
        calc.hizmetBedeli,
        calc.hizmetBedeli, 
        calc.kdvOrani,
        calc.kdv, 
        calc.toplam, 
        finalFaturaNo, 
        finalFaturaTarihi,
        effectiveCurrency,
        existing.id
      );
      logAction((req.session as any).userId, (req.session as any).username, "Muhasebe Güncellendi", `${data.adSoyad || existing.adSoyad} (${data.takipKodu || existing.takipKodu}) muhasebe kaydı güncellendi.`, 'info');
    } else {
      const stmt = db.prepare(`
        INSERT INTO accounting (
          takipKodu, adSoyad, islemDurumu, randevuBilgisi, kayitTarihi,
          pasaportNo, ulke, odemeDurumu, firma, konsoloslukUcreti, hizmetBedeli, netTutar, kdvOrani, kdv, toplam,
          faturaNo, faturaTarihi, currency
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        data.takipKodu, data.adSoyad, data.islemDurumu, data.randevuBilgisi || "",
        new Date().toISOString(), data.pasaportNo, data.ulke, data.odemeDurumu,
        data.firma, calc.konsoloslukUcreti, calc.hizmetBedeli, calc.hizmetBedeli, calc.kdvOrani, calc.kdv, calc.toplam, data.faturaNo || "", data.faturaTarihi || "",
        effectiveCurrency
      );
      logAction((req.session as any).userId, (req.session as any).username, "Yeni Muhasebe Kaydı", `${data.adSoyad} (${data.takipKodu}) muhasebe kaydı eklendi.`, 'success');
    }
    res.json({ success: true });
  });

  app.get("/api/accounting", requireAuth, (req, res) => {
    const rows = db.prepare("SELECT * FROM accounting ORDER BY id DESC").all();
    res.json(rows);
  });

  app.post("/api/accounting/delete/:id", requireAdmin, (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM accounting WHERE id = ?").run(id);
    logAction((req.session as any).userId, (req.session as any).username, "Muhasebe Kaydı Silindi", `ID: ${id} olan muhasebe kaydı silindi.`, 'warning');
    res.json({ success: true });
  });

  // Bildirimler
  app.get("/api/notifications", requireAuth, (req, res) => {
    const userId = (req.session as any).userId;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
    const isAdmin = user && user.role === 'admin';

    const now = new Date();
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(now.getDate() + 2);
    
    const nowStr = now.toISOString().split('T')[0];
    const twoDaysStr = twoDaysFromNow.toISOString().split('T')[0];

    let upcomingAppointments: any[] = [];
    let pendingPayments: any[] = [];
    let missingDocuments: any[] = [];

    if (isAdmin) {
      // Yaklaşan Randevular (Son 2 gün)
      upcomingAppointments = db.prepare(`
        SELECT * FROM applicants 
        WHERE randevuTarihi >= ? AND randevuTarihi <= ? 
        AND islemDurumu != 'Tamamlandı'
      `).all(nowStr, twoDaysStr);

      // Ödeme Bekleyenler (Randevusu olan ama ödenmemiş)
      pendingPayments = db.prepare(`
        SELECT * FROM applicants 
        WHERE odemeDurumu = 'Ödenmedi' 
        AND randevuTarihi != '' 
        AND randevuTarihi < ?
      `).all(twoDaysStr);

      // Eksik Belgeler / Bekleyen Talepler (3 günden fazla bekleyenler)
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(now.getDate() - 3);
      const threeDaysAgoStr = threeDaysAgo.toISOString();

      missingDocuments = db.prepare(`
        SELECT * FROM applicants 
        WHERE islemDurumu = 'Talep Bekliyor'
        AND kayitTarihi <= ?
      `).all(threeDaysAgoStr);
    } else if (user) {
      const firma = user.acenteAdi || user.firmaUnvani || "";
      if (firma) {
        // Yaklaşan Randevular
        upcomingAppointments = db.prepare(`
          SELECT * FROM applicants 
          WHERE randevuTarihi >= ? AND randevuTarihi <= ? 
          AND islemDurumu != 'Tamamlandı' AND (firmaAdi = ? OR firmaAdi = ?)
        `).all(nowStr, twoDaysStr, firma, firma.trim());

        // Ödeme Bekleyenler
        pendingPayments = db.prepare(`
          SELECT * FROM applicants 
          WHERE odemeDurumu = 'Ödenmedi' 
          AND randevuTarihi != '' 
          AND randevuTarihi < ? AND (firmaAdi = ? OR firmaAdi = ?)
        `).all(twoDaysStr, firma, firma.trim());
      }
    }

    // Her kullanıcı özelinde status_change bildirimlerini alalım
    let statusUpdates: any[] = [];
    if (user) {
      statusUpdates = db.prepare(`
        SELECT * FROM user_notifications 
        WHERE userId = ? AND read = 0
        ORDER BY id DESC
      `).all(user.id);
    }

    res.json({
      appointments: upcomingAppointments,
      payments: pendingPayments,
      missingDocs: missingDocuments,
      statusUpdates: statusUpdates,
      total: upcomingAppointments.length + pendingPayments.length + missingDocuments.length + statusUpdates.length
    });
  });

  // Bildirimleri Okundu İşaretle
  app.post("/api/notifications/read", requireAuth, (req, res) => {
    const { id } = req.body;
    const userId = (req.session as any).userId;
    try {
      if (id) {
        db.prepare("UPDATE user_notifications SET read = 1 WHERE id = ? AND userId = ?").run(id, userId);
      } else {
        db.prepare("UPDATE user_notifications SET read = 1 WHERE userId = ?").run(userId);
      }
      res.json({ success: true });
    } catch (err) {
      console.error("Bildirim okundu işaretleme hatası:", err);
      res.status(500).json({ error: "İşlem başarısız." });
    }
  });

  app.get("/api/logs", requireAdmin, (req, res) => {
    const logs = db.prepare("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100").all();
    res.json(logs);
  });

  // Otomatik Hatırlatıcı Gönderimi
  app.post("/api/reminders/send", requireAdmin, async (req, res) => {
    const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get() as any;
    const now = new Date();
    
    const getTargetDate = (days: number) => {
      const d = new Date();
      d.setDate(now.getDate() + days);
      return d.toISOString().split('T')[0];
    };

    const target7Days = getTargetDate(7);
    const target2Days = getTargetDate(2);
    const target30Days = getTargetDate(30);

    const upcoming7 = db.prepare(`
      SELECT * FROM applicants 
      WHERE randevuTarihi = ? 
      AND hatirlatma7Gun = 0 
      AND email IS NOT NULL 
      AND email != ''
    `).all(target7Days) as any[];

    const upcoming2 = db.prepare(`
      SELECT * FROM applicants 
      WHERE randevuTarihi = ? 
      AND hatirlatma2Gun = 0 
      AND email IS NOT NULL 
      AND email != ''
    `).all(target2Days) as any[];

    const upcomingExpiry = db.prepare(`
      SELECT * FROM applicants 
      WHERE vizeGecerlilikTarihi = ? 
      AND vizeSonucu = 'Onaylandı'
      AND hatirlatmaVizeBitis = 0 
      AND email IS NOT NULL 
      AND email != ''
    `).all(target30Days) as any[];

    const transporter = nodemailer.createTransport({
      host: settings.smtp_host || process.env.SMTP_HOST,
      port: Number(settings.smtp_port || process.env.SMTP_PORT) || 587,
      secure: Number(settings.smtp_port || process.env.SMTP_PORT) === 465,
      auth: {
        user: settings.smtp_user || process.env.SMTP_USER,
        pass: settings.smtp_pass || process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
      },
      authMethod: 'LOGIN'
    });

    let sentCount = 0;

    // 7 Günlük Hatırlatmalar
    for (const applicant of upcoming7) {
      try {
        await sendProfessionalEmail(
          applicant.email,
          "MKM Vize - Başvuru Bilgilendirmesi",
          "Evraklarınızı Hazırlayın - Randevunuza 1 Hafta Kaldı",
          "Vize randevunuza tam 1 hafta kaldığını hatırlatmak isteriz. Lütfen randevunuz için gerekli evraklarınızı hazırlayınız. Durumunuza uygun evrak listesini mkmvize.com web sayfamızdaki evrak listesi bölümünden seçerek bulabilirsiniz.",
          applicant
        );
        db.prepare("UPDATE applicants SET hatirlatma7Gun = 1 WHERE takipKodu = ?").run(applicant.takipKodu);
        sentCount++;
      } catch (error) {
        console.error(`7 gün hatırlatma hatası (${applicant.email}):`, error);
      }
    }

    // 2 Günlük Hatırlatmalar
    for (const applicant of upcoming2) {
      try {
        await sendProfessionalEmail(
          applicant.email,
          "MKM Vize - Başvuru Bilgilendirmesi",
          "Randevunuza 2 Gün Kaldı",
          "Vize randevunuza 2 gün kaldığını hatırlatmak isteriz. Lütfen randevu saatinden en az 15 dakika önce ilgili merkezde hazır bulununuz.",
          applicant
        );
        db.prepare("UPDATE applicants SET hatirlatma2Gun = 1 WHERE takipKodu = ?").run(applicant.takipKodu);
        sentCount++;
      } catch (error) {
        console.error(`2 gün hatırlatma hatası (${applicant.email}):`, error);
      }
    }

    // Vize Bitiş Hatırlatmalar (30 Gün Kala)
    for (const applicant of upcomingExpiry) {
      try {
        await sendProfessionalEmail(
          applicant.email,
          "MKM Vize - Vize Süresi Bilgilendirmesi",
          "Vizenizin Süresi Doluyor",
          "Vizenizin geçerlilik süresinin 1 ay sonra dolacağını hatırlatmak isteriz. Yeni vize başvurusu planlıyorsanız bizimle iletişime geçebilirsiniz.",
          applicant
        );
        db.prepare("UPDATE applicants SET hatirlatmaVizeBitis = 1 WHERE takipKodu = ?").run(applicant.takipKodu);
        sentCount++;
      } catch (error) {
        console.error(`Vize bitiş hatırlatma hatası (${applicant.email}):`, error);
      }
    }

    res.json({ message: `${sentCount} adet hatırlatma e-postası gönderildi.`, sentCount });
  });

  // Manuel Randevu Hatırlatması Gönder
  app.get("/api/reminders/manual/:kod", requireAdmin, async (req, res) => {
    const kod = req.params.kod;
    console.log(`Manual reminder requested for code: ${kod}`);
    const applicant = db.prepare("SELECT * FROM applicants WHERE takipKodu = ?").get(kod) as any;

    if (!applicant) {
      return res.status(404).json({ error: "Kayıt bulunamadı." });
    }

    if (!applicant.email) {
      return res.status(400).json({ error: "Bu kaydın e-posta adresi bulunmuyor." });
    }

    if (!applicant.randevuTarihi) {
      return res.status(400).json({ error: "Bu kaydın randevu tarihi bulunmuyor." });
    }

    try {
      console.log(`Attempting to send professional email to ${applicant.email} for code ${kod}`);
      const success = await sendProfessionalEmail(
        applicant.email,
        "MKM Vize - Başvuru Bilgilendirmesi",
        "Randevu Hatırlatması",
        "Vize başvurunuz için yaklaşan randevunuzu hatırlatmak isteriz. Randevu detaylarınız aşağıda yer almaktadır.",
        applicant
      );

      console.log(`Email sending result for ${kod}: ${success}`);

      if (success) {
        res.json({ success: true, message: "Hatırlatma e-postası başarıyla gönderildi." });
      } else {
        res.status(500).json({ error: "E-posta gönderilemedi. Lütfen SMTP ayarlarınızı kontrol edin." });
      }
    } catch (error: any) {
      console.error("Manuel hatırlatma hatası (catch):", error);
      res.status(500).json({ error: "Bir hata oluştu.", details: error.message });
    }
  });

  // Admin Haftalık Randevu Raporu
  app.post("/api/reports/weekly-admin", requireAdmin, async (req, res) => {
    const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get() as any;
    const adminEmail = settings.admin_report_email || "salih@brighttour.com";
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    
    const nowStr = now.toISOString().split('T')[0];
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    const upcomingAppointments = db.prepare(`
      SELECT * FROM applicants 
      WHERE randevuTarihi >= ? AND randevuTarihi <= ? 
      ORDER BY randevuTarihi ASC, saat ASC
    `).all(nowStr, nextWeekStr) as any[];

    if (upcomingAppointments.length === 0) {
      return res.json({ message: "Önümüzdeki hafta için randevu bulunmuyor.", sent: false });
    }

    const transporter = nodemailer.createTransport({
      host: settings.smtp_host || process.env.SMTP_HOST,
      port: Number(settings.smtp_port || process.env.SMTP_PORT) || 587,
      secure: Number(settings.smtp_port || process.env.SMTP_PORT) === 465,
      auth: {
        user: settings.smtp_user || process.env.SMTP_USER,
        pass: settings.smtp_pass || process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
      },
      authMethod: 'LOGIN'
    });

    const rowsHtml = upcomingAppointments.map(a => `
      <tr style="border-bottom: 1px solid #edf2f7;">
        <td style="padding: 12px 8px; font-size: 14px;">${formatDateServer(a.randevuTarihi)}</td>
        <td style="padding: 12px 8px; font-size: 14px;">${a.saat}</td>
        <td style="padding: 12px 8px; font-size: 14px; font-weight: 600;">${a.ad} ${a.soyad}</td>
        <td style="padding: 12px 8px; font-size: 14px;">${a.ulke}</td>
        <td style="padding: 12px 8px; font-size: 14px; color: #4f46e5; font-family: monospace;">${a.takipKodu}</td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background: #1e293b; padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Haftalık Randevu Raporu</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.8;">${nowStr} - ${nextWeekStr} Arası</p>
        </div>
        <div style="padding: 30px;">
          <p style="margin-bottom: 20px; font-size: 16px; color: #475569;">Sayın Yönetici, önümüzdeki 7 günün randevu listesi aşağıdadır:</p>
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background: #f8fafc; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                <th style="padding: 12px 8px; border-bottom: 2px solid #e2e8f0;">Tarih</th>
                <th style="padding: 12px 8px; border-bottom: 2px solid #e2e8f0;">Saat</th>
                <th style="padding: 12px 8px; border-bottom: 2px solid #e2e8f0;">Müşteri</th>
                <th style="padding: 12px 8px; border-bottom: 2px solid #e2e8f0;">Ülke</th>
                <th style="padding: 12px 8px; border-bottom: 2px solid #e2e8f0;">Kod</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div style="margin-top: 30px; padding: 20px; background: #f1f5f9; border-radius: 12px; text-align: center;">
            <p style="margin: 0; font-weight: 700; color: #1e293b;">Toplam Randevu Sayısı: ${upcomingAppointments.length}</p>
          </div>
        </div>
        <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
          MKM VİZE OTOMATİK RAPORLAMA SİSTEMİ
        </div>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: settings.smtp_from || process.env.SMTP_FROM || '"MKM VİZE" <no-reply@mkmvize.com>',
        to: adminEmail,
        subject: `Haftalık Randevu Listesi (${nowStr})`,
        html
      });
      res.json({ success: true, message: "Haftalık rapor başarıyla gönderildi.", count: upcomingAppointments.length });
    } catch (error) {
      console.error("Admin rapor hatası:", error);
      res.status(500).json({ error: "Rapor gönderilemedi." });
    }
  });

  // Ayarlar API
  app.get("/api/settings", requireAuth, (req, res) => {
    const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get() as any;
    
    // Check if user is admin
    let isAdmin = false;
    if (req.session.userId) {
      const user = db.prepare("SELECT role FROM users WHERE id = ?").get(req.session.userId) as any;
      if (user && user.role === 'admin') {
        isAdmin = true;
      }
    }

    if (!isAdmin) {
      // Return only safe settings
      return res.json({
        show_commissions_to_users: settings.show_commissions_to_users,
        manual_commission_rates: settings.manual_commission_rates,
        status_change_notify_enabled: settings.status_change_notify_enabled ?? 1,
        support_phone: settings.support_phone,
        support_email: settings.support_email,
        support_website: settings.support_website,
        support_hq_address: settings.support_hq_address,
        bank_accounts: settings.bank_accounts || '[]'
      });
    }

    res.json(settings);
  });

  app.post("/api/settings", requireAdmin, (req, res) => {
    const s = req.body;
    
    const updates: string[] = [];
    const values: any[] = [];

    const fields = [
      'reminder_7_days_enabled', 'reminder_2_days_enabled', 'reminder_expiry_enabled',
      'reminder_expiry_days', 'admin_weekly_report_enabled', 'admin_report_email',
      'show_commissions_to_users', 'manual_commission_rates', 'smtp_host',
      'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from', 'default_vat_rate', 'is_email_active',
      'status_change_notify_enabled', 'support_phone', 'support_email', 'support_website', 'support_hq_address',
      'bank_accounts'
    ];

    fields.forEach(field => {
      if (s[field] !== undefined) {
        updates.push(`${field} = ?`);
        if (typeof s[field] === 'boolean') {
          values.push(s[field] ? 1 : 0);
        } else {
          values.push(s[field]);
        }
      }
    });

    if (updates.length > 0) {
      db.prepare(`UPDATE settings SET ${updates.join(', ')} WHERE id = 1`).run(...values);
    }

    logAction((req.session as any).userId, (req.session as any).username, 'Ayarlar Güncellendi', 'Sistem ayarları güncellendi.', 'info');
    res.json({ success: true });
  });

  app.post("/api/test-email", requireAdmin, async (req, res) => {
    const s = req.body;
    const transporter = nodemailer.createTransport({
      host: s.smtp_host,
      port: Number(s.smtp_port),
      secure: Number(s.smtp_port) === 465,
      auth: {
        user: s.smtp_user,
        pass: s.smtp_pass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    try {
      await transporter.sendMail({
        from: s.smtp_from || s.smtp_user,
        to: req.body.test_target || s.smtp_user,
        subject: "MKM Vize - SMTP Test E-postası",
        text: "Bu bir test e-postasıdır. Eğer bu mesajı alıyorsanız SMTP ayarlarınız doğru yapılandırılmıştır.",
        html: `
          <div style="font-family: sans-serif; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: auto;">
            <div style="background: #4f46e5; padding: 20px; border-radius: 12px; margin-bottom: 20px; text-align: center;">
              <h2 style="color: white; margin: 0;">MKM Vize SMTP Testi</h2>
            </div>
            <p>Merhaba,</p>
            <p>Bu mesaj <b>${new Date().toLocaleString('tr-TR')}</b> tarihinde gönderilen bir bağlantı testidir.</p>
            <p style="background: #f0fdf4; color: #166534; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0;">
              <b>SMTP ayarlarınız başarıyla doğrulanmıştır!</b> Artık sistem üzerinden e-posta gönderimi yapabilirsiniz.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">Bu otomatik bir sistem mesajıdır, lütfen yanıtlamayınız.</p>
          </div>
        `
      });
      res.json({ success: true });
    } catch (error: any) {
      console.error("Test email error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Fiyatlar
  app.get("/api/prices", (req, res) => {
    const rows = db.prepare("SELECT * FROM prices").all();
    res.json(rows);
  });

  app.post("/api/prices", requireAdmin, (req, res) => {
    const data = req.body;
    const effectiveCurrency = (data.currency && data.currency !== 'TRY') ? data.currency : getCurrencyForCountry(data.ulke);
    const calc = calculatePrice(data.konsoloslukUcreti || 0, data.hizmetBedeli, data.kdvOrani || 20, data.toplam);

    if (data.id) {
      const stmt = db.prepare(`
        UPDATE prices SET 
          ulke=?, konsoloslukUcreti=?, hizmetBedeli=?, kdvOrani=?, kdv=?, toplam=?, currency=?
        WHERE id=?
      `);
      stmt.run(data.ulke, calc.konsoloslukUcreti, calc.hizmetBedeli, calc.kdvOrani, calc.kdv, calc.toplam, effectiveCurrency, data.id);
      logAction((req.session as any).userId, (req.session as any).username, 'Fiyat Güncellendi', `${data.ulke} fiyatı güncellendi.`, 'info');
    } else {
      const stmt = db.prepare(`
        INSERT INTO prices (ulke, konsoloslukUcreti, hizmetBedeli, kdvOrani, kdv, toplam, currency)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(data.ulke, calc.konsoloslukUcreti, calc.hizmetBedeli, calc.kdvOrani, calc.kdv, calc.toplam, effectiveCurrency);
      logAction((req.session as any).userId, (req.session as any).username, 'Yeni Fiyat Eklendi', `${data.ulke} için fiyat eklendi.`, 'success');
    }
    res.json({ success: true });
  });

  app.post("/api/prices/delete/:id", requireAdmin, (req, res) => {
    const { id } = req.params;
    const price = db.prepare("SELECT ulke FROM prices WHERE id = ?").get(id) as any;
    db.prepare("DELETE FROM prices WHERE id = ?").run(id);
    logAction((req.session as any).userId, (req.session as any).username, 'Fiyat Silindi', `${price?.ulke || id} fiyatı silindi.`, 'warning');
    res.json({ success: true });
  });

  // E-posta Önizleme Rotası
  app.get("/api/email-preview", (req, res) => {
    const mockData = {
      ad: "Ahmet",
      soyad: "Yılmaz",
      ulke: "Almanya",
      randevuTarihi: "2024-05-20",
      saat: "10:30",
      odemeDurumu: "Ödenmedi",
      takipKodu: "ANW-SAMPLE",
      firmaAdi: "ANEWME BRIGHT"
    };

    const title = "Başvurunuz Başarıyla Kaydedildi";
    const content = "Vize başvuru talebiniz sistemimize başarıyla kaydedilmiştir. Takip kodunuz ile işlemlerinizi sorgulayabilirsiniz.";

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1a202c; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 2px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">ANEWME BRIGHT</h1>
          <p style="color: rgba(255,255,255,0.8); margin-top: 10px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Profesyonel Yönetim Sistemi</p>
        </div>
        <div style="padding: 40px 35px; background-color: #ffffff;">
          <h2 style="color: #1a202c; margin-top: 0; font-size: 22px; font-weight: 700; margin-bottom: 20px;">${title}</h2>
          <p style="line-height: 1.6; color: #4a5568; font-size: 16px;">Sayın <strong>${mockData.ad} ${mockData.soyad}</strong>,</p>
          <p style="line-height: 1.7; color: #4a5568; font-size: 16px; margin-bottom: 30px;">${content}</p>
          
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 30px; margin: 30px 0; border: 1px solid #edf2f7; position: relative;">
            <div style="position: absolute; top: -12px; left: 20px; background-color: #4f46e5; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase;">Başvuru Detayları</div>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #718096; font-size: 14px; width: 40%;">🌍 Ülke</td>
                <td style="padding: 8px 0; color: #1a202c; font-size: 15px; font-weight: 600;">${mockData.ulke}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #718096; font-size: 14px;">📅 Randevu Tarihi</td>
                <td style="padding: 8px 0; color: #1a202c; font-size: 15px; font-weight: 600;">${formatDateServer(mockData.randevuTarihi)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #718096; font-size: 14px;">⏰ Randevu Saati</td>
                <td style="padding: 8px 0; color: #1a202c; font-size: 15px; font-weight: 600;">${mockData.saat}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #718096; font-size: 14px;">💰 Ödeme Durumu</td>
                <td style="padding: 8px 0; color: ${mockData.odemeDurumu === 'Ödendi' ? '#059669' : '#dc2626'}; font-size: 15px; font-weight: 700;">${mockData.odemeDurumu}</td>
              </tr>
              <tr>
                <td style="padding: 15px 0 0 0; color: #718096; font-size: 14px;">🔖 Takip Kodu</td>
                <td style="padding: 15px 0 0 0;">
                  <span style="background-color: #eef2ff; color: #4f46e5; padding: 6px 12px; border-radius: 8px; font-family: 'Courier New', Courier, monospace; font-weight: 800; font-size: 16px; border: 1px dashed #c7d2fe;">${mockData.takipKodu}</span>
                </td>
              </tr>
            </table>
          </div>
          
          <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #edf2f7;">
            <p style="line-height: 1.6; color: #718096; font-size: 14px;">
              <strong>Önemli Not:</strong> Randevu saatinizden en az 15 dakika önce ilgili merkezde hazır bulunmanızı ve tüm evraklarınızın eksiksiz olduğundan emin olmanızı rica ederiz.
            </p>
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #edf2f7;">
          <p style="margin: 0; color: #a0aec0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
            © ${new Date().getFullYear()} MKM VİZE DANIŞMANLIK HİZMETLERİ
          </p>
        </div>
      </div>
    `;
    res.send(html);
  });

  // Forms API
  app.get("/api/forms", requireAdmin, (req, res) => {
    const rows = db.prepare("SELECT * FROM forms").all();
    res.json(rows.map((r: any) => ({ ...r, fields: JSON.parse(r.fields) })));
  });

  app.post("/api/forms", requireAdmin, (req, res) => {
    const { id, name, fields } = req.body;
    const updatedAt = new Date().toISOString();
    const fieldsJson = JSON.stringify(fields);
    
    db.prepare(`
      INSERT INTO forms (id, name, fields, updated_at) 
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET 
        name = excluded.name, 
        fields = excluded.fields, 
        updated_at = excluded.updated_at
    `).run(id, name, fieldsJson, updatedAt);
    
    res.json({ success: true });
  });

  // Statik dosyaları servis et (Logolar vb.)
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Otomatik Hatırlatıcılar ve Raporlar
  const runAutoReminders = async () => {
    // Süresi dolmuş oturumları temizle
    try {
      db.prepare("DELETE FROM sessions WHERE expired < ?").run(Date.now());
    } catch (e) {}

    console.log("-----------------------------------------");
    console.log(`Otomatik hatırlatıcılar kontrol ediliyor... (${new Date().toLocaleString('tr-TR')})`);
    
    const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get() as any;
    if (!settings) {
      console.log("Hata: Sistem ayarları bulunamadı.");
      return;
    }
    
    if (settings.is_email_active === 0) {
      console.log("Bilgi: E-posta gönderimi sistem ayarlarından kapatılmış.");
      return;
    }

    const now = new Date();
    const currentHour = now.getHours();
    
    // Sadece sabah 09:00 - 10:00 arası veya ilk kontrolde çalışsın (isteğe bağlı ama saatlik kontrol daha iyi)
    // Şimdilik her çalıştığında işlenmemiş (track edilmemiş) kayıtları kontrol etmesi yeterli

    // 7 Gün Hatırlatması
    if (settings.reminder_7_days_enabled) {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + 7);
      const targetDateStr = targetDate.toISOString().split('T')[0];
      
      const applicants = db.prepare("SELECT * FROM applicants WHERE randevuTarihi = ? AND (hatirlatma7Gun IS NULL OR hatirlatma7Gun = 0)").all(targetDateStr) as any[];
      for (const applicant of applicants) {
        try {
          await sendProfessionalEmail(
            applicant.email,
            "MKM Vize - Randevu Hatırlatması",
            "Randevunuza 1 Hafta Kaldı",
            "Vize başvurunuz için randevunuza tam 1 hafta kalmıştır. Lütfen gerekli evraklarınızın hazır olduğundan emin olunuz.",
            applicant
          );
          db.prepare("UPDATE applicants SET hatirlatma7Gun = 1 WHERE id = ?").run(applicant.id);
        } catch (error) {
          console.error(`7 gün hatırlatması gönderilemedi (${applicant.email}):`, error);
        }
      }
    }

    // 2 Gün Hatırlatması
    if (settings.reminder_2_days_enabled) {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + 2);
      const targetDateStr = targetDate.toISOString().split('T')[0];
      
      const applicants = db.prepare("SELECT * FROM applicants WHERE randevuTarihi = ? AND (hatirlatma2Gun IS NULL OR hatirlatma2Gun = 0)").all(targetDateStr) as any[];
      for (const applicant of applicants) {
        try {
          await sendProfessionalEmail(
            applicant.email,
            "MKM Vize - Randevu Hatırlatması",
            "Randevunuza 2 Gün Kaldı",
            "Vize başvurunuz için randevunuza 2 gün kalmıştır. Lütfen randevu saatinizde ilgili merkezde hazır bulununuz.",
            applicant
          );
          db.prepare("UPDATE applicants SET hatirlatma2Gun = 1 WHERE id = ?").run(applicant.id);
        } catch (error) {
          console.error(`2 gün hatırlatması gönderilemedi (${applicant.email}):`, error);
        }
      }
    }

    // Vize Bitiş Hatırlatması
    if (settings.reminder_expiry_enabled) {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + settings.reminder_expiry_days);
      const targetDateStr = targetDate.toISOString().split('T')[0];
      
      const applicants = db.prepare("SELECT * FROM applicants WHERE vizeGecerlilikTarihi = ? AND (hatirlatmaVizeBitis IS NULL OR hatirlatmaVizeBitis = 0)").all(targetDateStr) as any[];
      for (const applicant of applicants) {
        try {
          await sendProfessionalEmail(
            applicant.email,
            "Vize Süresi Bitiş Hatırlatması",
            "Vizenizin Süresi Dolmak Üzere",
            `Vizenizin süresi ${settings.reminder_expiry_days} gün sonra dolacaktır. Yeni başvuru için bizimle iletişime geçebilirsiniz.`,
            applicant
          );
          db.prepare("UPDATE applicants SET hatirlatmaVizeBitis = 1 WHERE id = ?").run(applicant.id);
        } catch (error) {
          console.error(`Vize bitiş hatırlatması gönderilemedi (${applicant.email}):`, error);
        }
      }
    }

    // Haftalık Yönetici Raporu (Pazartesi günleri)
    if (settings.admin_weekly_report_enabled && now.getDay() === 1) {
      // Yıl ve Hafta bilgisini al (Örn: 2024-20)
      const getWeekNumber = (d: Date) => {
        const date = new Date(d.getTime());
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        const week1 = new Date(date.getFullYear(), 0, 4);
        return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
      };
      
      const currentWeekKey = `${now.getFullYear()}-W${getWeekNumber(now)}`;
      
      if (settings.last_weekly_report_week !== currentWeekKey) {
        console.log(`Haftalık rapor gönderiliyor: ${currentWeekKey}`);
        
        try {
          const nextWeek = new Date();
          nextWeek.setDate(now.getDate() + 7);
          const nowStr = now.toISOString().split('T')[0];
          const nextWeekStr = nextWeek.toISOString().split('T')[0];

          const upcoming = db.prepare(`
            SELECT * FROM applicants 
            WHERE randevuTarihi >= ? AND randevuTarihi <= ? 
            ORDER BY randevuTarihi ASC, saat ASC
          `).all(nowStr, nextWeekStr) as any[];

          const adminEmail = settings.admin_report_email || 'salih@brighttour.com';
          
          const transporter = nodemailer.createTransport({
            host: settings.smtp_host || process.env.SMTP_HOST || 'smtp.yandex.com.tr',
            port: Number(settings.smtp_port || process.env.SMTP_PORT) || 465,
            secure: Number(settings.smtp_port || process.env.SMTP_PORT) === 465 || !settings.smtp_port,
            auth: {
              user: settings.smtp_user || process.env.SMTP_USER,
              pass: settings.smtp_pass || process.env.SMTP_PASS,
            },
            tls: { 
              rejectUnauthorized: false,
              minVersion: 'TLSv1.2'
            }
          });

          const rowsHtml = upcoming.map(a => `
            <tr style="border-bottom: 1px solid #edf2f7;">
              <td style="padding: 12px 8px;">${a.randevuTarihi}</td>
              <td style="padding: 12px 8px;">${a.saat}</td>
              <td style="padding: 12px 8px; font-weight: 600;">${a.ad} ${a.soyad}</td>
              <td style="padding: 12px 8px;">${a.ulke}</td>
              <td style="padding: 12px 8px; font-family: monospace;">${a.takipKodu}</td>
            </tr>
          `).join('');

          const html = `
            <div style="font-family: sans-serif; max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
              <div style="background: #1e293b; padding: 30px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 24px;">Haftalık Randevu Raporu</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.8;">${nowStr} - ${nextWeekStr} Arası</p>
              </div>
              <div style="padding: 30px;">
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                  <thead>
                    <tr style="background: #f8fafc; color: #64748b; font-size: 12px;">
                      <th style="padding: 12px 8px; border-bottom: 2px solid #e2e8f0;">Tarih</th>
                      <th style="padding: 12px 8px; border-bottom: 2px solid #e2e8f0;">Saat</th>
                      <th style="padding: 12px 8px; border-bottom: 2px solid #e2e8f0;">Müşteri</th>
                      <th style="padding: 12px 8px; border-bottom: 2px solid #e2e8f0;">Ülke</th>
                      <th style="padding: 12px 8px; border-bottom: 2px solid #e2e8f0;">Kod</th>
                    </tr>
                  </thead>
                  <tbody>${rowsHtml}</tbody>
                </table>
              </div>
            </div>
          `;

          await transporter.sendMail({
            from: settings.smtp_from || '"MKM Vize" <no-reply@mkmvize.com>',
            to: adminEmail,
            subject: `Haftalık Randevu Listesi (${currentWeekKey})`,
            html
          });

          db.prepare("UPDATE settings SET last_weekly_report_week = ? WHERE id = 1").run(currentWeekKey);
          console.log(`Haftalık rapor başarıyla gönderildi: ${adminEmail}`);
        } catch (error) {
          console.error("Haftalık rapor gönderim hatası:", error);
        }
      }
    }
  };

  // Global API Error Handler
  app.use('/api', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('API Hatası:', err);
    res.status(500).json({ 
      error: "Sunucu tarafında bir hata oluştu.", 
      path: req.path,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  });

  // Manuel Haftalık Rapor Tetikleyici
  app.post("/api/admin/send-weekly-report", requireAdmin, async (req: any, res: any) => {
    try {
      const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get() as any;
      if (!settings) return res.status(404).json({ error: "Ayarlar bulunamadı." });

      const now = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);
      const nowStr = now.toISOString().split('T')[0];
      const nextWeekStr = nextWeek.toISOString().split('T')[0];

      const upcoming = db.prepare(`
        SELECT * FROM applicants 
        WHERE randevuTarihi >= ? AND randevuTarihi <= ? 
        ORDER BY randevuTarihi ASC, saat ASC
      `).all(nowStr, nextWeekStr) as any[];

      const adminEmail = settings.admin_report_email || 'salih@brighttour.com';
      
      const transporter = nodemailer.createTransport({
        host: settings.smtp_host || process.env.SMTP_HOST || 'smtp.yandex.com.tr',
        port: Number(settings.smtp_port || process.env.SMTP_PORT) || 465,
        secure: Number(settings.smtp_port || process.env.SMTP_PORT) === 465 || (!settings.smtp_port && !process.env.SMTP_PORT),
        auth: {
          user: settings.smtp_user || process.env.SMTP_USER,
          pass: settings.smtp_pass || process.env.SMTP_PASS,
        },
        tls: { rejectUnauthorized: false, minVersion: 'TLSv1.2' }
      });

      const rowsHtml = upcoming.map(a => `
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px 8px;">${a.randevuTarihi}</td>
          <td style="padding: 12px 8px;">${a.saat}</td>
          <td style="padding: 12px 8px; font-weight: 600;">${a.ad} ${a.soyad}</td>
          <td style="padding: 12px 8px;">${a.ulke}</td>
          <td style="padding: 12px 8px; font-family: monospace;">${a.takipKodu}</td>
        </tr>
      `).join('');

      const html = `
        <div style="font-family: sans-serif; max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
          <div style="background: #1e293b; padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Haftalık Randevu Raporu (Manuel)</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.8;">Talep Üzerine Oluşturuldu: ${now.toLocaleString('tr-TR')}</p>
            <p style="margin: 5px 0 0 0; opacity: 0.6;">Kapsam: ${nowStr} - ${nextWeekStr}</p>
          </div>
          <div style="padding: 30px;">
            ${upcoming.length > 0 ? `
              <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                  <tr style="background: #f8fafc; color: #64748b; font-size: 12px;">
                    <th style="padding: 12px 8px; border-bottom: 2px solid #e2e8f0;">Tarih</th>
                    <th style="padding: 12px 8px; border-bottom: 2px solid #e2e8f0;">Saat</th>
                    <th style="padding: 12px 8px; border-bottom: 2px solid #e2e8f0;">Müşteri</th>
                    <th style="padding: 12px 8px; border-bottom: 2px solid #e2e8f0;">Ülke</th>
                    <th style="padding: 12px 8px; border-bottom: 2px solid #e2e8f0;">Kod</th>
                  </tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
              </table>
            ` : '<p style="text-align: center; color: #64748b; padding: 20px;">Bu hafta için bekleyen randevu bulunamadı.</p>'}
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: settings.smtp_from || '"MKM Vize" <no-reply@mkmvize.com>',
        to: adminEmail,
        subject: `Manuel Haftalık Randevu Listesi - ${nowStr}`,
        html
      });

      res.json({ success: true, message: "Haftalık rapor başarıyla e-postanıza gönderildi." });
    } catch (error: any) {
      console.error("Manuel rapor hatası:", error);
      res.status(500).json({ error: "Rapor gönderilemedi: " + error.message });
    }
  });

  app.post("/api/support-ticket", requireAuth, async (req, res) => {
    try {
      const { name, email, subject, message, company } = req.body;
      
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "Lütfen tüm zorunlu alanları doldurun." });
      }

      const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get() as any;

      const transporter = nodemailer.createTransport({
        host: settings.smtp_host || process.env.SMTP_HOST || 'smtp.yandex.com.tr',
        port: Number(settings.smtp_port || process.env.SMTP_PORT) || 465,
        secure: Number(settings.smtp_port || process.env.SMTP_PORT) === 465 || (!settings.smtp_port && !process.env.SMTP_PORT),
        auth: {
          user: settings.smtp_user || process.env.SMTP_USER,
          pass: settings.smtp_pass || process.env.SMTP_PASS,
        },
        tls: { rejectUnauthorized: false, minVersion: 'TLSv1.2' }
      });

      const html = `
        <div style="font-family: sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); background-color: #ffffff;">
          <div style="background: #a11f1f; padding: 24px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 22px;">Yeni Teknik Destek Talebi</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Sistem üzerinden gönderildi</p>
          </div>
          <div style="padding: 24px; color: #1e293b;">
            <h2 style="font-size: 18px; margin-top: 0; color: #a11f1f; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">Talep Bilgileri</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 140px; color: #64748b; font-size: 14px;">Gönderen:</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b; font-size: 14px;">E-posta:</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 14px;"><a href="mailto:${email}" style="color: #a11f1f; text-decoration: none;">${email}</a></td>
              </tr>
              ${company ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b; font-size: 14px;">Firma/Acente:</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${company}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b; font-size: 14px;">Konu:</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${subject}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b; font-size: 14px;">Tarih:</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${new Date().toLocaleString('tr-TR')}</td>
              </tr>
            </table>

            <h2 style="font-size: 18px; color: #a11f1f; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-top: 24px;">Mesaj İçeriği</h2>
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #334155; border-left: 4px solid #a11f1f; white-space: pre-wrap;">${message}</div>
          </div>
          <div style="background: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
            Sistem Vize Yönetim Portalı • Otomatik Bilgilendirme
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: settings.smtp_from || process.env.SMTP_FROM || '"MKM Vize" <no-reply@mkmvize.com>',
        to: "info@brighttour.com",
        subject: `[Teknik Destek] ${subject}`,
        html
      });

      logAction((req.session as any).userId, (req.session as any).username, 'Destek Talebi Gönderildi', `Destek talebi info@brighttour.com adresine iletildi. Konu: ${subject}`, 'info');

      res.json({ success: true, message: "Destek talebiniz başarıyla gönderildi. En kısa sürede iletişime geçilecektir." });
    } catch (error: any) {
      console.error("Destek talebi mail hatası:", error);
      res.status(500).json({ error: "Talep gönderilirken hata oluştu: " + error.message });
    }
  });

  app.get("/api/ping", (req, res) => {
    res.json({ status: "alive", time: new Date().toISOString(), version: "1.3.5" });
  });

  // Final API 404 Handler (En sonda olmalı)
  app.use('/api', (req, res) => {
    res.status(404).json({ 
      error: "Aradığınız API rotası sunucuda tanımlı değil (Final Catch-all).", 
      method: req.method,
      path: req.path,
      fullUrl: req.originalUrl
    });
  });

  if (process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.error("Vite dev middleware error:", e);
    }
  } else {
    // Static frontend serving in production / dist
    const distPath = path.resolve(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api")) return next();
        const indexPath = path.join(distPath, "index.html");
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          next();
        }
      });
    }
  }

  // iisnode/Plesk desteği için hostname parametresini dinamik yönetiyoruz.
  // Eğer PORT bir named pipe ise (sayı değilse), hostname parametresi kullanılmamalıdır.
  const listenCallback = () => {
    fs.appendFileSync(STARTUP_LOG, `Sunucu ${PORT} adresinde aktif.\n`);
    console.log(`Sunucu ${PORT} adresinde çalışıyor`);
    // Her saat başı kontrol et (Hatırlatmalar için)
    setInterval(runAutoReminders, 60 * 60 * 1000);
    runAutoReminders().catch(err => console.error("Otomatik hatırlatıcı hatası:", err));
  };

  fs.appendFileSync(STARTUP_LOG, `Uygulama ${PORT} portunda dinlemeye hazirlaniyor...\n`);
  if (isNaN(Number(PORT))) {
    // Named Pipe (iisnode)
    app.listen(PORT, listenCallback);
  } else {
    // Standart TCP Port
    app.listen(Number(PORT), "0.0.0.0", listenCallback);
  }
}

startServer();
