import express from "express";
import "dotenv/config";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import session from "express-session";
import createSqliteStore from "connect-sqlite3";
process.on("unhandledRejection", (reason, promise) => {
  console.error("Yakalanmam\u0131\u015F Rejection:", promise, "neden:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Yakalanmam\u0131\u015F Hata:", err);
});
const SQLiteStore = createSqliteStore(session);
const db = new Database(path.resolve(process.cwd(), "mkm_vize.db"));
try {
  db.prepare("ALTER TABLE settings ADD COLUMN smtp_host TEXT").run();
} catch (e) {
}
try {
  db.prepare("ALTER TABLE settings ADD COLUMN smtp_port INTEGER").run();
} catch (e) {
}
try {
  db.prepare("ALTER TABLE settings ADD COLUMN smtp_user TEXT").run();
} catch (e) {
}
try {
  db.prepare("ALTER TABLE settings ADD COLUMN smtp_pass TEXT").run();
} catch (e) {
}
try {
  db.prepare("ALTER TABLE settings ADD COLUMN smtp_from TEXT").run();
} catch (e) {
}
try {
  db.prepare("ALTER TABLE settings ADD COLUMN is_email_active INTEGER DEFAULT 1").run();
} catch (e) {
}
try {
  db.prepare("ALTER TABLE settings ADD COLUMN default_vat_rate REAL DEFAULT 20").run();
} catch (e) {
}
try {
  db.prepare("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'admin'").run();
} catch (e) {
}
try {
  db.prepare("UPDATE users SET role = 'admin' WHERE role IS NULL OR role = ''").run();
} catch (e) {
}
try {
  db.prepare("ALTER TABLE applicants ADD COLUMN extra_fields TEXT").run();
} catch (e) {
}
try {
  db.prepare("ALTER TABLE applicants ADD COLUMN hatirlatma7Gun INTEGER DEFAULT 0").run();
} catch (e) {
}
try {
  db.prepare("ALTER TABLE applicants ADD COLUMN hatirlatma2Gun INTEGER DEFAULT 0").run();
} catch (e) {
}
try {
  db.prepare("ALTER TABLE applicants ADD COLUMN hatirlatmaVizeBitis INTEGER DEFAULT 0").run();
} catch (e) {
}
db.exec(`
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
    default_vat_rate REAL DEFAULT 20,
    smtp_host TEXT,
    smtp_port INTEGER,
    smtp_user TEXT,
    smtp_pass TEXT,
    smtp_from TEXT
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
try {
  const existingApplicants = db.prepare("SELECT DISTINCT firmaAdi FROM applicants WHERE firmaAdi IS NOT NULL AND firmaAdi != ''").all();
  existingApplicants.forEach((app) => {
    const exists = db.prepare("SELECT id FROM companies WHERE acente_adi = ? OR firma_unvani = ?").get(app.firmaAdi, app.firmaAdi);
    if (!exists) {
      db.prepare("INSERT INTO companies (firma_unvani, acente_adi, kayit_tarihi) VALUES (?, ?, ?)").run(app.firmaAdi, app.firmaAdi, (/* @__PURE__ */ new Date()).toISOString());
    }
  });
} catch (syncError) {
  console.error("\u015Eirket senkronizasyon hatas\u0131:", syncError);
}
try {
  db.prepare("ALTER TABLE applicants ADD COLUMN hatirlatma7Gun INTEGER DEFAULT 0").run();
} catch (e) {
}
try {
  db.prepare("ALTER TABLE applicants ADD COLUMN hatirlatma2Gun INTEGER DEFAULT 0").run();
} catch (e) {
}
try {
  db.prepare("ALTER TABLE applicants ADD COLUMN hatirlatmaVizeBitis INTEGER DEFAULT 0").run();
} catch (e) {
}
try {
  db.prepare("ALTER TABLE applicants ADD COLUMN ikametSehri TEXT").run();
} catch (e) {
}
try {
  db.prepare("ALTER TABLE applicants ADD COLUMN basvuruMerkezi TEXT").run();
} catch (e) {
}
try {
  db.prepare("ALTER TABLE applicants ADD COLUMN merkezAdresi TEXT").run();
} catch (e) {
}
try {
  db.prepare("ALTER TABLE applicants ADD COLUMN fiyat REAL DEFAULT 0").run();
} catch (e) {
}
try {
  db.prepare("ALTER TABLE applicants ADD COLUMN currency TEXT DEFAULT 'TRY'").run();
} catch (e) {
}
try {
  db.prepare("ALTER TABLE applicants ADD COLUMN timeline TEXT DEFAULT '[]'").run();
} catch (e) {
}
try {
  db.prepare("ALTER TABLE applicants ADD COLUMN documents TEXT DEFAULT '[]'").run();
} catch (e) {
}
try {
  db.prepare("ALTER TABLE applicants ADD COLUMN vizeGecerlilikTarihi TEXT").run();
} catch (e) {
}
try {
  db.prepare("ALTER TABLE settings ADD COLUMN show_commissions_to_users INTEGER DEFAULT 0").run();
} catch (e) {
}
try {
  db.prepare("ALTER TABLE settings ADD COLUMN manual_commission_rates TEXT DEFAULT '{}'").run();
} catch (e) {
}
try {
  db.prepare("ALTER TABLE users ADD COLUMN adminEmail TEXT").run();
} catch (e) {
}
try {
  db.prepare("ALTER TABLE users ADD COLUMN firmaUnvani TEXT").run();
} catch (e) {
}
try {
  db.prepare("ALTER TABLE users ADD COLUMN acenteAdi TEXT").run();
} catch (e) {
}
try {
  db.prepare("ALTER TABLE prices ADD COLUMN currency TEXT DEFAULT 'TRY'").run();
} catch (e) {
}
try {
  db.prepare("ALTER TABLE accounting ADD COLUMN currency TEXT DEFAULT 'TRY'").run();
} catch (e) {
}
try {
  db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_accounting_takipKodu ON accounting(takipKodu)").run();
} catch (e) {
}
const countryCount = db.prepare("SELECT COUNT(*) as count FROM countries").get();
if (countryCount.count === 0) {
  const initialCountries = [
    "Almanya",
    "Avusturya",
    "Bel\xE7ika",
    "\xC7ek Cumhuriyeti",
    "Danimarka",
    "Estonya",
    "Finlandiya",
    "Fransa",
    "Hollanda",
    "\u0130spanya",
    "\u0130sve\xE7",
    "\u0130svi\xE7re",
    "\u0130talya",
    "\u0130zlanda",
    "Letonya",
    "Litvanya",
    "L\xFCksemburg",
    "Macaristan",
    "Malta",
    "Norve\xE7",
    "Polonya",
    "Portekiz",
    "Slovakya",
    "Slovenya",
    "Yunanistan",
    "\u0130ngiltere",
    "Amerika",
    "Kanada",
    "Dubai",
    "M\u0131s\u0131r",
    "Cezayir",
    "Suudi Arabistan",
    "\xC7in",
    "Hindistan",
    "Vietnam"
  ];
  const insert = db.prepare("INSERT INTO countries (name) VALUES (?)");
  initialCountries.forEach((c) => insert.run(c));
}
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
if (userCount.count === 0) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run("admin", hashedPassword);
  console.log("Varsay\u0131lan y\xF6netici hesab\u0131 olu\u015Fturuldu: admin / admin123");
}
const formatDateServer = (dateStr) => {
  if (!dateStr || dateStr === "" || dateStr === "Hen\xFCz Al\u0131nmad\u0131" || dateStr === "Belirtilmedi") return dateStr || "Hen\xFCz Al\u0131nmad\u0131";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d2] = dateStr.split("-");
    return `${d2}-${m}-${y}`;
  }
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};
const sendProfessionalEmail = async (to, subject, title, content, applicantData) => {
  if (!to || !to.includes("@")) return;
  const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get();
  if (settings.is_email_active === 0) {
    console.log("E-posta g\xF6nderimi sistem ayarlar\u0131ndan devre d\u0131\u015F\u0131 b\u0131rak\u0131lm\u0131\u015F.");
    return false;
  }
  const smtpConfig = {
    host: settings.smtp_host || process.env.SMTP_HOST,
    port: Number(settings.smtp_port || process.env.SMTP_PORT) || 587,
    user: settings.smtp_user || process.env.SMTP_USER,
    pass: settings.smtp_pass || process.env.SMTP_PASS
  };
  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.port === 465,
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.pass
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: "TLSv1.2"
    },
    authMethod: "LOGIN"
  });
  console.log(`${to} adresine e-posta g\xF6nderim denemesi. Sunucu: ${settings.smtp_host || process.env.SMTP_HOST}, Port: ${Number(settings.smtp_port || process.env.SMTP_PORT) || 587}`);
  const googleMapsUrl = applicantData.merkezAdresi ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((applicantData.basvuruMerkezi ? applicantData.basvuruMerkezi + " " : "") + applicantData.merkezAdresi)}` : null;
  let calendarLinks = "";
  if (applicantData.randevuTarihi && applicantData.saat) {
    const datePart = applicantData.randevuTarihi.replace(/-/g, "");
    const timePart = applicantData.saat.replace(/:/g, "");
    const startDateTime = `${datePart}T${timePart}00`;
    const [hours, minutes] = applicantData.saat.split(":").map(Number);
    const endHours = (hours + 1).toString().padStart(2, "0");
    const endDateTime = `${datePart}T${endHours}${minutes.toString().padStart(2, "0")}00`;
    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Vize Randevusu - " + applicantData.ulke)}&dates=${startDateTime}/${endDateTime}&details=${encodeURIComponent("MKM Vize Dan\u0131\u015Fmanl\u0131\u011F\u0131 - " + applicantData.basvuruMerkezi)}&location=${encodeURIComponent(applicantData.merkezAdresi || "")}`;
    const appUrl = process.env.APP_URL || "";
    const icsUrl = `${appUrl}/api/calendar/ics/${applicantData.takipKodu}`;
    calendarLinks = `
      <div style="margin-top: 25px; display: flex; flex-wrap: wrap; gap: 10px;">
        <a href="${googleCalendarUrl}" target="_blank" style="background-color: #4285f4; color: white; padding: 10px 16px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">\u{1F4C5} Takvime Ekle</a>
      </div>
    `;
  }
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1a202c; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 2px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">MKM V\u0130ZE</h1>
        <p style="color: rgba(255,255,255,0.8); margin-top: 10px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Profesyonel Vize Dan\u0131\u015Fmanl\u0131\u011F\u0131</p>
      </div>
      <div style="padding: 40px 35px; background-color: #ffffff;">
        <h2 style="color: #1a202c; margin-top: 0; font-size: 22px; font-weight: 700; margin-bottom: 20px;">${title}</h2>
        <p style="line-height: 1.6; color: #4a5568; font-size: 16px;">Say\u0131n <strong>${applicantData.ad} ${applicantData.soyad}</strong>,</p>
        <p style="line-height: 1.7; color: #4a5568; font-size: 16px; margin-bottom: 30px;">${content}</p>
        
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 30px; margin: 30px 0; border: 1px solid #edf2f7; position: relative;">
          <div style="position: absolute; top: -12px; left: 20px; background-color: #4f46e5; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase;">Ba\u015Fvuru Detaylar\u0131</div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #718096; font-size: 14px; width: 40%;">\u{1F30D} \xDClke</td>
              <td style="padding: 8px 0; color: #1a202c; font-size: 15px; font-weight: 600;">${applicantData.ulke || "Belirtilmedi"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #718096; font-size: 14px;">\u{1F4C5} Randevu Tarihi</td>
              <td style="padding: 8px 0; color: #1a202c; font-size: 15px; font-weight: 600;">${formatDateServer(applicantData.randevuTarihi)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #718096; font-size: 14px;">\u23F0 Randevu Saati</td>
              <td style="padding: 8px 0; color: #1a202c; font-size: 15px; font-weight: 600;">${applicantData.saat || "Hen\xFCz Al\u0131nmad\u0131"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #718096; font-size: 14px;">\u{1F3E2} Ba\u015Fvuru Merkezi</td>
              <td style="padding: 8px 0; color: #1a202c; font-size: 15px; font-weight: 600;">${applicantData.basvuruMerkezi || "Hen\xFCz Al\u0131nmad\u0131"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #718096; font-size: 14px;">\u{1F4CD} Adres</td>
              <td style="padding: 8px 0; color: #1a202c; font-size: 14px; font-weight: 500;">${applicantData.merkezAdresi || "Hen\xFCz Al\u0131nmad\u0131"}</td>
            </tr>
            ${googleMapsUrl ? `
            <tr>
              <td colspan="2" style="padding: 8px 0;">
                <a href="${googleMapsUrl}" target="_blank" style="color: #4f46e5; text-decoration: none; font-weight: 700; font-size: 14px;">\u{1F5FA}\uFE0F Yol Tarifi Al</a>
              </td>
            </tr>
            ` : ""}
            <tr>
              <td style="padding: 8px 0; color: #718096; font-size: 14px;">\u{1F4B0} \xD6deme Durumu</td>
              <td style="padding: 8px 0; color: ${applicantData.odemeDurumu === "\xD6dendi" ? "#059669" : "#dc2626"}; font-size: 15px; font-weight: 700;">${applicantData.odemeDurumu || "\xD6denmedi"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #718096; font-size: 14px;">\u{1F516} Takip Kodu</td>
              <td style="padding: 8px 0; color: #1a202c; font-size: 15px; font-weight: 600;">${applicantData.takipKodu}</td>
            </tr>
          </table>
          ${calendarLinks}
        </div>
        
        <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #edf2f7;">
          <p style="line-height: 1.6; color: #718096; font-size: 14px;">
            <strong>\xD6nemli Not:</strong> Randevu saatinizden en az 15 dakika \xF6nce ilgili merkezde haz\u0131r bulunman\u0131z\u0131 ve t\xFCm evraklar\u0131n\u0131z\u0131n eksiksiz oldu\u011Fundan emin olman\u0131z\u0131 rica ederiz.
          </p>
          <p style="line-height: 1.6; color: #4a5568; font-size: 14px; margin-top: 20px;">
            Herhangi bir sorunuz olmas\u0131 durumunda <strong>+90 532 742 88 71</strong> numaral\u0131 telefondan veya bu e-postay\u0131 yan\u0131tlayarak bize ula\u015Fabilirsiniz.
          </p>
        </div>
      </div>
      <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #edf2f7;">
        <p style="margin: 0; color: #a0aec0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
          \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} MKM V\u0130ZE DANI\u015EMANLIK H\u0130ZMETLER\u0130
        </p>
        <p style="margin: 10px 0 0 0; color: #cbd5e0; font-size: 10px;">Bu e-posta otomatik olarak g\xF6nderilmi\u015Ftir, l\xFCtfen yan\u0131tlamay\u0131n\u0131z.</p>
      </div>
    </div>
  `;
  try {
    await transporter.sendMail({
      from: settings.smtp_from || process.env.SMTP_FROM || '"MKM V\u0130ZE" <no-reply@mkmvize.com>',
      to,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error("Email g\xF6nderim hatas\u0131 detay\u0131:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    return false;
  }
};
async function startServer() {
  console.log("SUNUCU BA\u015ELATILIYOR...");
  const app = express();
  app.set("trust proxy", 1);
  app.use(express.json());
  app.use(session({
    store: new SQLiteStore({
      db: "sessions.db",
      dir: "."
    }),
    secret: "mkm-vize-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    proxy: true,
    name: "mkm_vize_sid",
    cookie: {
      secure: false,
      // Start as false, tighten in middleware if HTTPS
      sameSite: "lax",
      // Start as lax, tighten in middleware if HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  }));
  app.use((req, res, next) => {
    const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";
    if (req.session && req.session.cookie) {
      req.session.cookie.secure = isSecure;
      req.session.cookie.sameSite = isSecure ? "none" : "lax";
      if (isSecure) {
        req.session.cookie.partitioned = true;
      }
    }
    const sessionId = req.sessionID;
    const userId = req.session?.userId;
    if (req.path.startsWith("/api/")) {
      console.log(`${(/* @__PURE__ */ new Date()).toISOString()} - ${req.method} ${req.url} - SID: ${sessionId} - UID: ${userId} - Secure: ${isSecure}`);
    }
    next();
  });
  const PORT = process.env.PORT || 3e3;
  app.post("/api/auth/register", async (req, res) => {
    const { username, password, adminEmail, firmaUnvani, acenteAdi } = req.body;
    if (!username || !password || !adminEmail) return res.status(400).json({ error: "Kullan\u0131c\u0131 ad\u0131, e-posta ve \u015Fifre gerekli." });
    const existingUser = db.prepare("SELECT * FROM users WHERE adminEmail = ?").get(adminEmail);
    if (existingUser) {
      return res.status(400).json({ error: "Bu e-posta adresi zaten kullan\u0131mda." });
    }
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const userCount2 = db.prepare("SELECT COUNT(*) as count FROM users").get();
      const role = userCount2.count === 0 ? "admin" : "user";
      db.prepare("INSERT INTO users (username, password, adminEmail, firmaUnvani, acenteAdi, role) VALUES (?, ?, ?, ?, ?, ?)").run(
        username,
        hashedPassword,
        adminEmail || "",
        firmaUnvani || "",
        acenteAdi || "",
        role
      );
      logAction(0, "Sistem", "Yeni Kay\u0131t", `Yeni kullan\u0131c\u0131 kayd\u0131: ${username} (${adminEmail}) - Rol: ${role}`, "success");
      res.json({ success: true, message: "Kay\u0131t ba\u015Far\u0131l\u0131." });
    } catch (e) {
      res.status(400).json({ error: "Bu kullan\u0131c\u0131 ad\u0131 zaten al\u0131nm\u0131\u015F." });
    }
  });
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    console.log(`${email} i\xE7in giri\u015F denemesi`);
    const user = db.prepare("SELECT * FROM users WHERE adminEmail = ? OR username = ?").get(email, email);
    if (!user || !await bcrypt.compare(password, user.password)) {
      console.log(`${email} i\xE7in giri\u015F ba\u015Far\u0131s\u0131z`);
      return res.status(401).json({ error: "Ge\xE7ersiz e-posta/kullan\u0131c\u0131 ad\u0131 veya \u015Fifre." });
    }
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.acenteAdi = user.acenteAdi;
    req.session.save((err) => {
      if (err) {
        console.error("Oturum kaydetme hatas\u0131:", err);
        return res.status(500).json({ error: "Oturum kaydedilemedi." });
      }
      console.log(`${email} ba\u015Far\u0131yla giri\u015F yapt\u0131, oturum kaydedildi.`);
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
    const user = db.prepare("SELECT * FROM users WHERE adminEmail = ?").get(email);
    if (!user) {
      return res.status(404).json({ error: "Bu e-posta adresiyle kay\u0131tl\u0131 kullan\u0131c\u0131 bulunamad\u0131." });
    }
    res.json({ success: true, message: "\u015Eifre s\u0131f\u0131rlama talimatlar\u0131 e-posta adresinize g\xF6nderildi." });
  });
  app.post("/api/auth/update-profile", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: "Oturum a\xE7\u0131lmam\u0131\u015F." });
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
      const updatedUser = db.prepare("SELECT id, username, acenteAdi, adminEmail, firmaUnvani, role FROM users WHERE id = ?").get(userId);
      logAction(userId, username, "Profil G\xFCncelleme", "Kullan\u0131c\u0131 kendi profilini g\xFCncelledi.", "info");
      res.json({ success: true, user: updatedUser });
    } catch (e) {
      res.status(400).json({ error: "G\xFCncelleme s\u0131ras\u0131nda bir hata olu\u015Ftu." });
    }
  });
  app.get("/api/auth/me", (req, res) => {
    const userId = req.session.userId;
    console.log(`Oturum kontrol\xFC: ${userId}, SID: ${req.sessionID}`);
    if (!userId) {
      return res.status(401).json({ error: "Oturum a\xE7\u0131lmam\u0131\u015F." });
    }
    const user = db.prepare("SELECT id, username, acenteAdi, adminEmail, firmaUnvani, role FROM users WHERE id = ?").get(userId);
    if (!user) {
      return res.status(401).json({ error: "Kullan\u0131c\u0131 bulunamad\u0131." });
    }
    res.json({ user });
  });
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });
  const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
      console.log(`${req.path} adresine yetkisiz eri\u015Fim denemesi - SID: ${req.sessionID}`);
      return res.status(401).json({ error: "Yetkisiz eri\u015Fim. L\xFCtfen giri\u015F yap\u0131n." });
    }
    next();
  };
  app.post("/api/change-password", requireAuth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.session.userId;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    if (!user || !await bcrypt.compare(currentPassword, user.password)) {
      return res.status(401).json({ error: "Mevcut \u015Fifre hatal\u0131." });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashedPassword, userId);
    logAction(userId, user.username, "\u015Eifre De\u011Fi\u015Ftirildi", "Kullan\u0131c\u0131 \u015Fifresini ba\u015Far\u0131yla g\xFCncelledi.", "success");
    res.json({ success: true, message: "\u015Eifre g\xFCncellendi." });
  });
  const requireAdmin = (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Yetkisiz eri\u015Fim. L\xFCtfen giri\u015F yap\u0131n." });
    }
    const user = db.prepare("SELECT role FROM users WHERE id = ?").get(req.session.userId);
    if (!user || user.role !== "admin") {
      console.log(`${req.session.userId} kullan\u0131c\u0131s\u0131 i\xE7in ${req.path} - Y\xF6netici eri\u015Fimi reddedildi`);
      return res.status(403).json({ error: "Bu i\u015Flem i\xE7in y\xF6netici yetkisi gereklidir." });
    }
    next();
  };
  const logAction = (userId, username, action, details, type = "info") => {
    try {
      db.prepare("INSERT INTO logs (userId, username, action, details, timestamp, type) VALUES (?, ?, ?, ?, ?, ?)").run(
        userId?.toString() || "0",
        username || "Sistem",
        action,
        details,
        (/* @__PURE__ */ new Date()).toISOString(),
        type
      );
    } catch (error) {
      console.error("Log kayd\u0131 hatas\u0131:", error);
    }
  };
  app.get("/api/calendar/ics/:kod", (req, res) => {
    const { kod } = req.params;
    try {
      const applicant = db.prepare("SELECT * FROM applicants WHERE takipKodu = ?").get(kod);
      if (!applicant || !applicant.randevuTarihi || !applicant.saat) {
        return res.status(404).send("Randevu bilgisi bulunamad\u0131.");
      }
      const datePart = applicant.randevuTarihi.replace(/-/g, "");
      const timePart = applicant.saat.replace(/:/g, "");
      const start = `${datePart}T${timePart}00`;
      const [hours, minutes] = applicant.saat.split(":").map(Number);
      const endHours = (hours + 1).toString().padStart(2, "0");
      const end = `${datePart}T${endHours}${minutes.toString().padStart(2, "0")}00`;
      const now = (/* @__PURE__ */ new Date()).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//MKM Vize//NONSGML v1.0//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `UID:${applicant.takipKodu}@mkmvize.com`,
        `DTSTAMP:${now}`,
        `DTSTART;TZID=Europe/Istanbul:${start}`,
        `DTEND;TZID=Europe/Istanbul:${end}`,
        `SUMMARY:Vize Randevusu - ${applicant.ulke}`,
        `DESCRIPTION:MKM Vize Dan\u0131\u015Fmanl\u0131\u011F\u0131 - ${applicant.basvuruMerkezi || ""}`,
        `LOCATION:${applicant.merkezAdresi || ""}`,
        "STATUS:CONFIRMED",
        "SEQUENCE:0",
        "BEGIN:VALARM",
        "TRIGGER:-PT24H",
        "ACTION:DISPLAY",
        "DESCRIPTION:Vize Randevusu Hat\u0131rlatmas\u0131",
        "END:VALARM",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");
      res.setHeader("Content-Type", "text/calendar; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="vize-randevu-${applicant.takipKodu}.ics"`);
      res.send(icsContent);
    } catch (error) {
      console.error("ICS generation error:", error);
      res.status(500).send("Takvim dosyas\u0131 olu\u015Fturulamad\u0131.");
    }
  });
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      console.log(`[${(/* @__PURE__ */ new Date()).toISOString()}] ${req.method} ${req.path} - SID: ${req.sessionID} - Kullan\u0131c\u0131 ID Mevcut mu: ${!!req.session.userId}`);
      if (req.headers.cookie) {
        const cookies = req.headers.cookie.split(";").map((c) => c.trim().split("=")[0]);
        console.log(`Gelen \xC7erezler: ${cookies.join(", ")}`);
      } else {
        console.log("\u0130stekte \xE7erez bulunamad\u0131");
      }
    }
    next();
  });
  app.get("/api/users", requireAdmin, (req, res) => {
    try {
      const rows = db.prepare("SELECT id, username, adminEmail, acenteAdi, firmaUnvani, role FROM users ORDER BY username ASC").all();
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: "Kullan\u0131c\u0131lar getirilemedi." });
    }
  });
  app.post("/api/users", requireAdmin, async (req, res) => {
    const { username, password, adminEmail, acenteAdi, firmaUnvani, role } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = db.prepare(`
        INSERT INTO users (username, password, adminEmail, acenteAdi, firmaUnvani, role)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(username, hashedPassword, adminEmail, acenteAdi, firmaUnvani, role || "user");
      const newUser = db.prepare("SELECT id, username, adminEmail, acenteAdi, firmaUnvani, role FROM users WHERE id = ?").get(result.lastInsertRowid);
      logAction(req.session.userId, req.session.username, "Kullan\u0131c\u0131 Olu\u015Fturuldu", `Yeni kullan\u0131c\u0131: ${username} (${role})`, "success");
      res.json(newUser);
    } catch (e) {
      res.status(400).json({ error: "Kullan\u0131c\u0131 olu\u015Fturulamad\u0131." });
    }
  });
  app.post("/api/users/delete/:id", requireAdmin, (req, res) => {
    const { id } = req.params;
    try {
      const userToDelete = db.prepare("SELECT username FROM users WHERE id = ?").get(id);
      db.prepare("DELETE FROM users WHERE id = ?").run(id);
      logAction(req.session.userId, req.session.username, "Kullan\u0131c\u0131 Silindi", `Kullan\u0131c\u0131 silindi: ${userToDelete?.username || id}`, "warning");
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Kullan\u0131c\u0131 silinemedi." });
    }
  });
  app.get("/api/companies", requireAuth, (req, res) => {
    try {
      const rows = db.prepare("SELECT * FROM companies ORDER BY acente_adi ASC").all();
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
        data.firma_unvani,
        data.acente_adi,
        data.vergi_dairesi,
        data.vergi_no,
        data.email,
        data.telefon,
        data.website,
        data.adres,
        data.yetkili_ad_soyad,
        data.yetkili_telefon,
        (/* @__PURE__ */ new Date()).toISOString()
      );
      logAction(req.session.userId, req.session.username, "Firma Kaydedildi", `Yeni firma eklendi: ${data.acente_adi}`, "success");
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Firma kaydedilemedi." });
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
        data.firma_unvani,
        data.acente_adi,
        data.vergi_dairesi,
        data.vergi_no,
        data.email,
        data.telefon,
        data.website,
        data.adres,
        data.yetkili_ad_soyad,
        data.yetkili_telefon,
        req.params.id
      );
      logAction(req.session.userId, req.session.username, "Firma G\xFCncellendi", `Firma bilgileri g\xFCncellendi: ${data.acente_adi || data.firma_unvani}`, "info");
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Firma g\xFCncellenemedi." });
    }
  });
  app.post("/api/companies/delete/:id", requireAdmin, (req, res) => {
    try {
      const company = db.prepare("SELECT acente_adi FROM companies WHERE id = ?").get(req.params.id);
      db.prepare("DELETE FROM companies WHERE id = ?").run(req.params.id);
      if (company) {
        logAction(req.session.userId, req.session.username, "Firma Silindi", `Firma silindi: ${company.acente_adi}`, "warning");
      }
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Firma silinemedi." });
    }
  });
  app.get("/api/countries", requireAuth, (req, res) => {
    const rows = db.prepare("SELECT * FROM countries ORDER BY name ASC").all();
    res.json(rows);
  });
  app.post("/api/countries", requireAdmin, (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "\xDClke ad\u0131 gerekli." });
    try {
      db.prepare("INSERT INTO countries (name) VALUES (?)").run(name);
      logAction(req.session.userId, req.session.username, "\xDClke Eklendi", `Yeni \xFClke eklendi: ${name}`, "success");
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Bu \xFClke zaten kay\u0131tl\u0131." });
    }
  });
  app.post("/api/countries/delete/:id", requireAdmin, (req, res) => {
    const { id } = req.params;
    const country = db.prepare("SELECT name FROM countries WHERE id = ?").get(id);
    db.prepare("DELETE FROM countries WHERE id = ?").run(id);
    logAction(req.session.userId, req.session.username, "\xDClke Silindi", `\xDClke silindi: ${country?.name || id}`, "warning");
    res.json({ success: true });
  });
  app.get("/api/applicants", requireAuth, (req, res) => {
    const rows = db.prepare("SELECT * FROM applicants ORDER BY id DESC").all();
    res.json(rows);
  });
  app.get("/api/applicants/:query", requireAuth, (req, res) => {
    const query = req.params.query.toUpperCase();
    const row = db.prepare("SELECT * FROM applicants WHERE takipKodu = ? OR UPPER(soyad) = ?").get(query, query);
    res.json(row || { error: "Kay\u0131t bulunamad\u0131" });
  });
  app.post("/api/applicants", requireAuth, (req, res) => {
    try {
      const data = req.body;
      if (data.firmaAdi && data.firmaAdi.trim().length > 0) {
        const companyExists = db.prepare("SELECT id FROM companies WHERE acente_adi = ? OR firma_unvani = ?").get(data.firmaAdi, data.firmaAdi);
        if (!companyExists) {
          db.prepare("INSERT INTO companies (firma_unvani, acente_adi, kayit_tarihi) VALUES (?, ?, ?)").run(data.firmaAdi, data.firmaAdi, (/* @__PURE__ */ new Date()).toISOString());
        }
      }
      const existing = data.takipKodu ? db.prepare("SELECT * FROM applicants WHERE takipKodu = ?").get(data.takipKodu) : null;
      if (existing) {
        const current = existing;
        const fieldsToUpdate = [
          "ad",
          "soyad",
          "dogumTarihi",
          "ulke",
          "islemDurumu",
          "randevuTarihi",
          "saat",
          "odemeDurumu",
          "pasaportNo",
          "notlar",
          "pasaportSkt",
          "email",
          "vizeSonucu",
          "vizeGecerlilikTarihi",
          "firmaAdi",
          "ikametSehri",
          "basvuruMerkezi",
          "merkezAdresi",
          "timeline",
          "documents",
          "extra_fields"
        ];
        const updates = [];
        const values = [];
        fieldsToUpdate.forEach((field) => {
          if (data[field] !== void 0) {
            updates.push(`${field} = ?`);
            let val = data[field];
            if (val !== null && typeof val === "object") {
              val = JSON.stringify(val);
            }
            values.push(val);
          }
        });
        if (updates.length > 0) {
          if (data.randevuTarihi !== void 0 && data.randevuTarihi !== current.randevuTarihi) {
            updates.push("hatirlatma7Gun = ?", "hatirlatma2Gun = ?");
            values.push(0, 0);
          }
          if (data.vizeGecerlilikTarihi !== void 0 && data.vizeGecerlilikTarihi !== current.vizeGecerlilikTarihi) {
            updates.push("hatirlatmaVizeBitis = ?");
            values.push(0);
          }
          const sql = `UPDATE applicants SET ${updates.join(", ")} WHERE takipKodu = ?`;
          values.push(data.takipKodu);
          db.prepare(sql).run(...values);
        }
        const isNewAppointment = data.randevuTarihi && (!current.randevuTarihi || current.randevuTarihi === "");
        const isStatusChangedToAppointment = data.islemDurumu === "Randevu Al\u0131nd\u0131" && current.islemDurumu !== "Randevu Al\u0131nd\u0131";
        if (data.email && (isNewAppointment || isStatusChangedToAppointment)) {
          sendProfessionalEmail(
            data.email,
            "MKM Vize - Ba\u015Fvuru Bilgilendirmesi",
            "Randevunuz Onayland\u0131",
            "Vize ba\u015Fvurunuz i\xE7in randevu bilgileriniz sisteme tan\u0131mlanm\u0131\u015Ft\u0131r. Detaylar a\u015Fa\u011F\u0131da yer almaktad\u0131r.",
            { ...current, ...data }
            // Mevcut verilerle birleştirerek gönder
          );
        }
        logAction(req.session.userId, req.session.username, "Ba\u015Fvuru G\xFCncellendi", `${data.ad || current.ad} ${data.soyad || current.soyad} (${data.takipKodu}) g\xFCncellendi.`, "info");
        res.json({ success: true, takipKodu: data.takipKodu });
      } else {
        const newKod = data.takipKodu || `MKM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const collision = db.prepare("SELECT id FROM applicants WHERE takipKodu = ?").get(newKod);
        if (collision && !data.takipKodu) {
          return res.status(500).json({ error: "Kod \xFCretme hatas\u0131, l\xFCtfen tekrar deneyin." });
        }
        const stmt = db.prepare(`
          INSERT INTO applicants (
            takipKodu, ad, soyad, dogumTarihi, ulke, islemDurumu, 
            randevuTarihi, saat, odemeDurumu, pasaportNo, notlar, 
            pasaportSkt, email, kayitTarihi, firmaAdi, vizeSonucu, vizeGecerlilikTarihi,
            ikametSehri, basvuruMerkezi, merkezAdresi, timeline, documents, extra_fields
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
          newKod,
          data.ad,
          data.soyad,
          data.dogumTarihi,
          data.ulke,
          data.islemDurumu || "Talep Bekliyor",
          data.randevuTarihi || "",
          data.saat || "",
          data.odemeDurumu || "\xD6denmedi",
          data.pasaportNo || "",
          data.notlar || "",
          data.pasaportSkt || "",
          data.email || "",
          (/* @__PURE__ */ new Date()).toISOString(),
          data.firmaAdi || "MKM V\u0130ZE",
          data.vizeSonucu || "",
          data.vizeGecerlilikTarihi || "",
          data.ikametSehri || "",
          data.basvuruMerkezi || "",
          data.merkezAdresi || "",
          JSON.stringify(data.timeline || []),
          JSON.stringify(data.documents || []),
          JSON.stringify(data.extra_fields || {})
        );
        if (data.email) {
          sendProfessionalEmail(
            data.email,
            "MKM Vize - Ba\u015Fvuru Bilgilendirmesi",
            "Ba\u015Fvurunuz Ba\u015Far\u0131yla Kaydedildi",
            "Vize ba\u015Fvuru talebiniz sistemimize ba\u015Far\u0131yla kaydedilmi\u015Ftir. Takip kodunuz ile i\u015Flemlerinizi sorgulayabilirsiniz.",
            { ...data, takipKodu: newKod }
          );
        }
        logAction(req.session.userId, req.session.username, "Yeni Ba\u015Fvuru", `${data.ad} ${data.soyad} (${newKod}) eklendi.`, "success");
        res.json({ success: true, takipKodu: newKod });
      }
    } catch (error) {
      console.error("Kay\u0131t hatas\u0131:", error);
      res.status(500).json({ error: "Kay\u0131t s\u0131ras\u0131nda bir hata olu\u015Ftu: " + error.message });
    }
  });
  app.post("/api/applicants/bulk-status", requireAdmin, (req, res) => {
    const { ids, status } = req.body;
    if (!ids || !Array.isArray(ids) || !status) return res.status(400).json({ error: "Ge\xE7ersiz veri." });
    try {
      const stmt = db.prepare("UPDATE applicants SET islemDurumu = ? WHERE takipKodu = ?");
      const transaction = db.transaction((ids2, status2) => {
        for (const id of ids2) stmt.run(status2, id);
      });
      transaction(ids, status);
      logAction(req.session.userId, req.session.username, "Toplu Durum G\xFCncelleme", `${ids.length} kayd\u0131n durumu "${status}" yap\u0131ld\u0131.`, "info");
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Toplu g\xFCncelleme ba\u015Far\u0131s\u0131z." });
    }
  });
  app.post("/api/applicants/bulk-delete", requireAdmin, (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: "Ge\xE7ersiz veri." });
    try {
      const stmt = db.prepare("DELETE FROM applicants WHERE takipKodu = ?");
      const transaction = db.transaction((ids2) => {
        for (const id of ids2) stmt.run(id);
      });
      transaction(ids);
      logAction(req.session.userId, req.session.username, "Toplu Silme", `${ids.length} kay\u0131t silindi.`, "warning");
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Toplu silme ba\u015Far\u0131s\u0131z." });
    }
  });
  app.post("/api/applicants/delete/:kod", requireAdmin, (req, res) => {
    const { kod } = req.params;
    db.prepare("DELETE FROM applicants WHERE takipKodu = ?").run(kod);
    logAction(req.session.userId, req.session.username, "Ba\u015Fvuru Silindi", `${kod} takip kodlu ba\u015Fvuru silindi.`, "warning");
    res.json({ success: true });
  });
  app.post("/api/accounting", requireAuth, (req, res) => {
    const data = req.body;
    const existing = db.prepare("SELECT * FROM accounting WHERE takipKodu = ?").get(data.takipKodu);
    if (existing) {
      const finalFaturaNo = data.faturaNo || existing.faturaNo || "";
      const finalFaturaTarihi = data.faturaTarihi || existing.faturaTarihi || "";
      const stmt = db.prepare(`
        UPDATE accounting SET 
          adSoyad = ?, islemDurumu = ?, randevuBilgisi = ?, 
          pasaportNo = ?, ulke = ?, odemeDurumu = ?, firma = ?, 
          netTutar = ?, kdv = ?, toplam = ?, faturaNo = ?, faturaTarihi = ?, currency = ?
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
        data.netTutar || existing.netTutar,
        data.kdv || existing.kdv,
        data.toplam || existing.toplam,
        finalFaturaNo,
        finalFaturaTarihi,
        data.currency || existing.currency || "TRY",
        existing.id
      );
      logAction(req.session.userId, req.session.username, "Muhasebe G\xFCncellendi", `${data.adSoyad || existing.adSoyad} (${data.takipKodu || existing.takipKodu}) muhasebe kayd\u0131 g\xFCncellendi.`, "info");
    } else {
      const stmt = db.prepare(`
        INSERT INTO accounting (
          takipKodu, adSoyad, islemDurumu, randevuBilgisi, kayitTarihi,
          pasaportNo, ulke, odemeDurumu, firma, netTutar, kdv, toplam,
          faturaNo, faturaTarihi, currency
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        data.takipKodu,
        data.adSoyad,
        data.islemDurumu,
        data.randevuBilgisi || "",
        (/* @__PURE__ */ new Date()).toISOString(),
        data.pasaportNo,
        data.ulke,
        data.odemeDurumu,
        data.firma,
        data.netTutar,
        data.kdv,
        data.toplam,
        data.faturaNo || "",
        data.faturaTarihi || "",
        data.currency || "TRY"
      );
      logAction(req.session.userId, req.session.username, "Yeni Muhasebe Kayd\u0131", `${data.adSoyad} (${data.takipKodu}) muhasebe kayd\u0131 eklendi.`, "success");
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
    logAction(req.session.userId, req.session.username, "Muhasebe Kayd\u0131 Silindi", `ID: ${id} olan muhasebe kayd\u0131 silindi.`, "warning");
    res.json({ success: true });
  });
  app.get("/api/notifications", requireAdmin, (req, res) => {
    const now = /* @__PURE__ */ new Date();
    const twoDaysFromNow = /* @__PURE__ */ new Date();
    twoDaysFromNow.setDate(now.getDate() + 2);
    const nowStr = now.toISOString().split("T")[0];
    const twoDaysStr = twoDaysFromNow.toISOString().split("T")[0];
    const upcomingAppointments = db.prepare(`
      SELECT * FROM applicants 
      WHERE randevuTarihi >= ? AND randevuTarihi <= ? 
      AND islemDurumu != 'Tamamland\u0131'
    `).all(nowStr, twoDaysStr);
    const pendingPayments = db.prepare(`
      SELECT * FROM applicants 
      WHERE odemeDurumu = '\xD6denmedi' 
      AND randevuTarihi != '' 
      AND randevuTarihi < ?
    `).all(twoDaysStr);
    const threeDaysAgo = /* @__PURE__ */ new Date();
    threeDaysAgo.setDate(now.getDate() - 3);
    const threeDaysAgoStr = threeDaysAgo.toISOString();
    const missingDocuments = db.prepare(`
      SELECT * FROM applicants 
      WHERE islemDurumu = 'Talep Bekliyor'
      AND kayitTarihi <= ?
    `).all(threeDaysAgoStr);
    res.json({
      appointments: upcomingAppointments,
      payments: pendingPayments,
      missingDocs: missingDocuments,
      total: upcomingAppointments.length + pendingPayments.length + missingDocuments.length
    });
  });
  app.get("/api/logs", requireAdmin, (req, res) => {
    const logs = db.prepare("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100").all();
    res.json(logs);
  });
  app.post("/api/reminders/send", requireAdmin, async (req, res) => {
    const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get();
    const now = /* @__PURE__ */ new Date();
    const getTargetDate = (days) => {
      const d = /* @__PURE__ */ new Date();
      d.setDate(now.getDate() + days);
      return d.toISOString().split("T")[0];
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
    `).all(target7Days);
    const upcoming2 = db.prepare(`
      SELECT * FROM applicants 
      WHERE randevuTarihi = ? 
      AND hatirlatma2Gun = 0 
      AND email IS NOT NULL 
      AND email != ''
    `).all(target2Days);
    const upcomingExpiry = db.prepare(`
      SELECT * FROM applicants 
      WHERE vizeGecerlilikTarihi = ? 
      AND vizeSonucu = '\xC7\u0131kt\u0131'
      AND hatirlatmaVizeBitis = 0 
      AND email IS NOT NULL 
      AND email != ''
    `).all(target30Days);
    const transporter = nodemailer.createTransport({
      host: settings.smtp_host || process.env.SMTP_HOST,
      port: Number(settings.smtp_port || process.env.SMTP_PORT) || 587,
      secure: Number(settings.smtp_port || process.env.SMTP_PORT) === 465,
      auth: {
        user: settings.smtp_user || process.env.SMTP_USER,
        pass: settings.smtp_pass || process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: "TLSv1.2"
      },
      authMethod: "LOGIN"
    });
    let sentCount = 0;
    for (const applicant of upcoming7) {
      try {
        await sendProfessionalEmail(
          applicant.email,
          "MKM Vize - Ba\u015Fvuru Bilgilendirmesi",
          "Evraklar\u0131n\u0131z\u0131 Haz\u0131rlay\u0131n - Randevunuza 1 Hafta Kald\u0131",
          "Vize randevunuza tam 1 hafta kald\u0131\u011F\u0131n\u0131 hat\u0131rlatmak isteriz. L\xFCtfen randevunuz i\xE7in gerekli evraklar\u0131n\u0131z\u0131 haz\u0131rlay\u0131n\u0131z. Durumunuza uygun evrak listesini mkmvize.com web sayfam\u0131zdaki evrak listesi b\xF6l\xFCm\xFCnden se\xE7erek bulabilirsiniz.",
          applicant
        );
        db.prepare("UPDATE applicants SET hatirlatma7Gun = 1 WHERE takipKodu = ?").run(applicant.takipKodu);
        sentCount++;
      } catch (error) {
        console.error(`7 g\xFCn hat\u0131rlatma hatas\u0131 (${applicant.email}):`, error);
      }
    }
    for (const applicant of upcoming2) {
      try {
        await sendProfessionalEmail(
          applicant.email,
          "MKM Vize - Ba\u015Fvuru Bilgilendirmesi",
          "Randevunuza 2 G\xFCn Kald\u0131",
          "Vize randevunuza 2 g\xFCn kald\u0131\u011F\u0131n\u0131 hat\u0131rlatmak isteriz. L\xFCtfen randevu saatinden en az 15 dakika \xF6nce ilgili merkezde haz\u0131r bulununuz.",
          applicant
        );
        db.prepare("UPDATE applicants SET hatirlatma2Gun = 1 WHERE takipKodu = ?").run(applicant.takipKodu);
        sentCount++;
      } catch (error) {
        console.error(`2 g\xFCn hat\u0131rlatma hatas\u0131 (${applicant.email}):`, error);
      }
    }
    for (const applicant of upcomingExpiry) {
      try {
        await sendProfessionalEmail(
          applicant.email,
          "MKM Vize - Vize S\xFCresi Bilgilendirmesi",
          "Vizenizin S\xFCresi Doluyor",
          "Vizenizin ge\xE7erlilik s\xFCresinin 1 ay sonra dolaca\u011F\u0131n\u0131 hat\u0131rlatmak isteriz. Yeni vize ba\u015Fvurusu planl\u0131yorsan\u0131z bizimle ileti\u015Fime ge\xE7ebilirsiniz.",
          applicant
        );
        db.prepare("UPDATE applicants SET hatirlatmaVizeBitis = 1 WHERE takipKodu = ?").run(applicant.takipKodu);
        sentCount++;
      } catch (error) {
        console.error(`Vize biti\u015F hat\u0131rlatma hatas\u0131 (${applicant.email}):`, error);
      }
    }
    res.json({ message: `${sentCount} adet hat\u0131rlatma e-postas\u0131 g\xF6nderildi.`, sentCount });
  });
  app.get("/api/reminders/manual/:kod", requireAdmin, async (req, res) => {
    const kod = req.params.kod;
    console.log(`Manual reminder requested for code: ${kod}`);
    const applicant = db.prepare("SELECT * FROM applicants WHERE takipKodu = ?").get(kod);
    if (!applicant) {
      return res.status(404).json({ error: "Kay\u0131t bulunamad\u0131." });
    }
    if (!applicant.email) {
      return res.status(400).json({ error: "Bu kayd\u0131n e-posta adresi bulunmuyor." });
    }
    if (!applicant.randevuTarihi) {
      return res.status(400).json({ error: "Bu kayd\u0131n randevu tarihi bulunmuyor." });
    }
    try {
      console.log(`Attempting to send professional email to ${applicant.email} for code ${kod}`);
      const success = await sendProfessionalEmail(
        applicant.email,
        "MKM Vize - Ba\u015Fvuru Bilgilendirmesi",
        "Randevu Hat\u0131rlatmas\u0131",
        "Vize ba\u015Fvurunuz i\xE7in yakla\u015Fan randevunuzu hat\u0131rlatmak isteriz. Randevu detaylar\u0131n\u0131z a\u015Fa\u011F\u0131da yer almaktad\u0131r.",
        applicant
      );
      console.log(`Email sending result for ${kod}: ${success}`);
      if (success) {
        res.json({ success: true, message: "Hat\u0131rlatma e-postas\u0131 ba\u015Far\u0131yla g\xF6nderildi." });
      } else {
        res.status(500).json({ error: "E-posta g\xF6nderilemedi. L\xFCtfen SMTP ayarlar\u0131n\u0131z\u0131 kontrol edin." });
      }
    } catch (error) {
      console.error("Manuel hat\u0131rlatma hatas\u0131 (catch):", error);
      res.status(500).json({ error: "Bir hata olu\u015Ftu.", details: error.message });
    }
  });
  app.post("/api/reports/weekly-admin", requireAdmin, async (req, res) => {
    const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get();
    const adminEmail = settings.admin_report_email || "salih@brighttour.com";
    const now = /* @__PURE__ */ new Date();
    const nextWeek = /* @__PURE__ */ new Date();
    nextWeek.setDate(now.getDate() + 7);
    const nowStr = now.toISOString().split("T")[0];
    const nextWeekStr = nextWeek.toISOString().split("T")[0];
    const upcomingAppointments = db.prepare(`
      SELECT * FROM applicants 
      WHERE randevuTarihi >= ? AND randevuTarihi <= ? 
      ORDER BY randevuTarihi ASC, saat ASC
    `).all(nowStr, nextWeekStr);
    if (upcomingAppointments.length === 0) {
      return res.json({ message: "\xD6n\xFCm\xFCzdeki hafta i\xE7in randevu bulunmuyor.", sent: false });
    }
    const transporter = nodemailer.createTransport({
      host: settings.smtp_host || process.env.SMTP_HOST,
      port: Number(settings.smtp_port || process.env.SMTP_PORT) || 587,
      secure: Number(settings.smtp_port || process.env.SMTP_PORT) === 465,
      auth: {
        user: settings.smtp_user || process.env.SMTP_USER,
        pass: settings.smtp_pass || process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: "TLSv1.2"
      },
      authMethod: "LOGIN"
    });
    const rowsHtml = upcomingAppointments.map((a) => `
      <tr style="border-bottom: 1px solid #edf2f7;">
        <td style="padding: 12px 8px; font-size: 14px;">${formatDateServer(a.randevuTarihi)}</td>
        <td style="padding: 12px 8px; font-size: 14px;">${a.saat}</td>
        <td style="padding: 12px 8px; font-size: 14px; font-weight: 600;">${a.ad} ${a.soyad}</td>
        <td style="padding: 12px 8px; font-size: 14px;">${a.ulke}</td>
        <td style="padding: 12px 8px; font-size: 14px; color: #4f46e5; font-family: monospace;">${a.takipKodu}</td>
      </tr>
    `).join("");
    const html = `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background: #1e293b; padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Haftal\u0131k Randevu Raporu</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.8;">${nowStr} - ${nextWeekStr} Aras\u0131</p>
        </div>
        <div style="padding: 30px;">
          <p style="margin-bottom: 20px; font-size: 16px; color: #475569;">Say\u0131n Y\xF6netici, \xF6n\xFCm\xFCzdeki 7 g\xFCn\xFCn randevu listesi a\u015Fa\u011F\u0131dad\u0131r:</p>
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background: #f8fafc; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                <th style="padding: 12px 8px; border-bottom: 2px solid #e2e8f0;">Tarih</th>
                <th style="padding: 12px 8px; border-bottom: 2px solid #e2e8f0;">Saat</th>
                <th style="padding: 12px 8px; border-bottom: 2px solid #e2e8f0;">M\xFC\u015Fteri</th>
                <th style="padding: 12px 8px; border-bottom: 2px solid #e2e8f0;">\xDClke</th>
                <th style="padding: 12px 8px; border-bottom: 2px solid #e2e8f0;">Kod</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div style="margin-top: 30px; padding: 20px; background: #f1f5f9; border-radius: 12px; text-align: center;">
            <p style="margin: 0; font-weight: 700; color: #1e293b;">Toplam Randevu Say\u0131s\u0131: ${upcomingAppointments.length}</p>
          </div>
        </div>
        <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
          MKM V\u0130ZE OTOMAT\u0130K RAPORLAMA S\u0130STEM\u0130
        </div>
      </div>
    `;
    try {
      await transporter.sendMail({
        from: settings.smtp_from || process.env.SMTP_FROM || '"MKM V\u0130ZE" <no-reply@mkmvize.com>',
        to: adminEmail,
        subject: `Haftal\u0131k Randevu Listesi (${nowStr})`,
        html
      });
      res.json({ success: true, message: "Haftal\u0131k rapor ba\u015Far\u0131yla g\xF6nderildi.", count: upcomingAppointments.length });
    } catch (error) {
      console.error("Admin rapor hatas\u0131:", error);
      res.status(500).json({ error: "Rapor g\xF6nderilemedi." });
    }
  });
  app.get("/api/settings", requireAuth, (req, res) => {
    const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get();
    let isAdmin = false;
    if (req.session.userId) {
      const user = db.prepare("SELECT role FROM users WHERE id = ?").get(req.session.userId);
      if (user && user.role === "admin") {
        isAdmin = true;
      }
    }
    if (!isAdmin) {
      return res.json({
        show_commissions_to_users: settings.show_commissions_to_users,
        manual_commission_rates: settings.manual_commission_rates
      });
    }
    res.json(settings);
  });
  app.post("/api/settings", requireAdmin, (req, res) => {
    const s = req.body;
    const updates = [];
    const values = [];
    const fields = [
      "reminder_7_days_enabled",
      "reminder_2_days_enabled",
      "reminder_expiry_enabled",
      "reminder_expiry_days",
      "admin_weekly_report_enabled",
      "admin_report_email",
      "show_commissions_to_users",
      "manual_commission_rates",
      "smtp_host",
      "smtp_port",
      "smtp_user",
      "smtp_pass",
      "smtp_from",
      "default_vat_rate",
      "is_email_active"
    ];
    fields.forEach((field) => {
      if (s[field] !== void 0) {
        updates.push(`${field} = ?`);
        if (typeof s[field] === "boolean") {
          values.push(s[field] ? 1 : 0);
        } else {
          values.push(s[field]);
        }
      }
    });
    if (updates.length > 0) {
      db.prepare(`UPDATE settings SET ${updates.join(", ")} WHERE id = 1`).run(...values);
    }
    logAction(req.session.userId, req.session.username, "Ayarlar G\xFCncellendi", "Sistem ayarlar\u0131 g\xFCncellendi.", "info");
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
        pass: s.smtp_pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    try {
      await transporter.sendMail({
        from: s.smtp_from || s.smtp_user,
        to: req.body.test_target || s.smtp_user,
        subject: "MKM Vize - SMTP Test E-postas\u0131",
        text: "Bu bir test e-postas\u0131d\u0131r. E\u011Fer bu mesaj\u0131 al\u0131yorsan\u0131z SMTP ayarlar\u0131n\u0131z do\u011Fru yap\u0131land\u0131r\u0131lm\u0131\u015Ft\u0131r.",
        html: `
          <div style="font-family: sans-serif; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: auto;">
            <div style="background: #4f46e5; padding: 20px; border-radius: 12px; margin-bottom: 20px; text-align: center;">
              <h2 style="color: white; margin: 0;">MKM Vize SMTP Testi</h2>
            </div>
            <p>Merhaba,</p>
            <p>Bu mesaj <b>${(/* @__PURE__ */ new Date()).toLocaleString("tr-TR")}</b> tarihinde g\xF6nderilen bir ba\u011Flant\u0131 testidir.</p>
            <p style="background: #f0fdf4; color: #166534; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0;">
              <b>SMTP ayarlar\u0131n\u0131z ba\u015Far\u0131yla do\u011Frulanm\u0131\u015Ft\u0131r!</b> Art\u0131k sistem \xFCzerinden e-posta g\xF6nderimi yapabilirsiniz.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">Bu otomatik bir sistem mesaj\u0131d\u0131r, l\xFCtfen yan\u0131tlamay\u0131n\u0131z.</p>
          </div>
        `
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Test email error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/prices", (req, res) => {
    const rows = db.prepare("SELECT * FROM prices").all();
    res.json(rows);
  });
  app.post("/api/prices", requireAdmin, (req, res) => {
    const data = req.body;
    if (data.id) {
      const stmt = db.prepare(`
        UPDATE prices SET 
          ulke=?, konsoloslukUcreti=?, hizmetBedeli=?, kdvOrani=?, kdv=?, toplam=?, currency=?
        WHERE id=?
      `);
      stmt.run(data.ulke, data.konsoloslukUcreti, data.hizmetBedeli, data.kdvOrani, data.kdv, data.toplam, data.currency || "TRY", data.id);
      logAction(req.session.userId, req.session.username, "Fiyat G\xFCncellendi", `${data.ulke} fiyat\u0131 g\xFCncellendi.`, "info");
    } else {
      const stmt = db.prepare(`
        INSERT INTO prices (ulke, konsoloslukUcreti, hizmetBedeli, kdvOrani, kdv, toplam, currency)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(data.ulke, data.konsoloslukUcreti, data.hizmetBedeli, data.kdvOrani, data.kdv, data.toplam, data.currency || "TRY");
      logAction(req.session.userId, req.session.username, "Yeni Fiyat Eklendi", `${data.ulke} i\xE7in fiyat eklendi.`, "success");
    }
    res.json({ success: true });
  });
  app.post("/api/prices/delete/:id", requireAdmin, (req, res) => {
    const { id } = req.params;
    const price = db.prepare("SELECT ulke FROM prices WHERE id = ?").get(id);
    db.prepare("DELETE FROM prices WHERE id = ?").run(id);
    logAction(req.session.userId, req.session.username, "Fiyat Silindi", `${price?.ulke || id} fiyat\u0131 silindi.`, "warning");
    res.json({ success: true });
  });
  app.get("/api/email-preview", (req, res) => {
    const mockData = {
      ad: "Ahmet",
      soyad: "Y\u0131lmaz",
      ulke: "Almanya",
      randevuTarihi: "2024-05-20",
      saat: "10:30",
      odemeDurumu: "\xD6denmedi",
      takipKodu: "MKM-SAMPLE",
      firmaAdi: "MKM V\u0130ZE"
    };
    const title = "Ba\u015Fvurunuz Ba\u015Far\u0131yla Kaydedildi";
    const content = "Vize ba\u015Fvuru talebiniz sistemimize ba\u015Far\u0131yla kaydedilmi\u015Ftir. Takip kodunuz ile i\u015Flemlerinizi sorgulayabilirsiniz.";
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1a202c; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 2px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">MKM V\u0130ZE</h1>
          <p style="color: rgba(255,255,255,0.8); margin-top: 10px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Profesyonel Vize Dan\u0131\u015Fmanl\u0131\u011F\u0131</p>
        </div>
        <div style="padding: 40px 35px; background-color: #ffffff;">
          <h2 style="color: #1a202c; margin-top: 0; font-size: 22px; font-weight: 700; margin-bottom: 20px;">${title}</h2>
          <p style="line-height: 1.6; color: #4a5568; font-size: 16px;">Say\u0131n <strong>${mockData.ad} ${mockData.soyad}</strong>,</p>
          <p style="line-height: 1.7; color: #4a5568; font-size: 16px; margin-bottom: 30px;">${content}</p>
          
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 30px; margin: 30px 0; border: 1px solid #edf2f7; position: relative;">
            <div style="position: absolute; top: -12px; left: 20px; background-color: #4f46e5; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase;">Ba\u015Fvuru Detaylar\u0131</div>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #718096; font-size: 14px; width: 40%;">\u{1F30D} \xDClke</td>
                <td style="padding: 8px 0; color: #1a202c; font-size: 15px; font-weight: 600;">${mockData.ulke}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #718096; font-size: 14px;">\u{1F4C5} Randevu Tarihi</td>
                <td style="padding: 8px 0; color: #1a202c; font-size: 15px; font-weight: 600;">${formatDateServer(mockData.randevuTarihi)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #718096; font-size: 14px;">\u23F0 Randevu Saati</td>
                <td style="padding: 8px 0; color: #1a202c; font-size: 15px; font-weight: 600;">${mockData.saat}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #718096; font-size: 14px;">\u{1F4B0} \xD6deme Durumu</td>
                <td style="padding: 8px 0; color: ${mockData.odemeDurumu === "\xD6dendi" ? "#059669" : "#dc2626"}; font-size: 15px; font-weight: 700;">${mockData.odemeDurumu}</td>
              </tr>
              <tr>
                <td style="padding: 15px 0 0 0; color: #718096; font-size: 14px;">\u{1F516} Takip Kodu</td>
                <td style="padding: 15px 0 0 0;">
                  <span style="background-color: #eef2ff; color: #4f46e5; padding: 6px 12px; border-radius: 8px; font-family: 'Courier New', Courier, monospace; font-weight: 800; font-size: 16px; border: 1px dashed #c7d2fe;">${mockData.takipKodu}</span>
                </td>
              </tr>
            </table>
          </div>
          
          <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #edf2f7;">
            <p style="line-height: 1.6; color: #718096; font-size: 14px;">
              <strong>\xD6nemli Not:</strong> Randevu saatinizden en az 15 dakika \xF6nce ilgili merkezde haz\u0131r bulunman\u0131z\u0131 ve t\xFCm evraklar\u0131n\u0131z\u0131n eksiksiz oldu\u011Fundan emin olman\u0131z\u0131 rica ederiz.
            </p>
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #edf2f7;">
          <p style="margin: 0; color: #a0aec0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
            \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} MKM V\u0130ZE DANI\u015EMANLIK H\u0130ZMETLER\u0130
          </p>
        </div>
      </div>
    `;
    res.send(html);
  });
  app.get("/api/forms", requireAdmin, (req, res) => {
    const rows = db.prepare("SELECT * FROM forms").all();
    res.json(rows.map((r) => ({ ...r, fields: JSON.parse(r.fields) })));
  });
  app.post("/api/forms", requireAdmin, (req, res) => {
    const { id, name, fields } = req.body;
    const updatedAt = (/* @__PURE__ */ new Date()).toISOString();
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
  app.use("/api", (req, res) => {
    res.status(404).json({ error: `API rotas\u0131 bulunamad\u0131: ${req.method} ${req.originalUrl}` });
  });
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  if (process.env.NODE_ENV !== "production") {
    console.log("Vite middleware ba\u015Flat\u0131l\u0131yor...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("Vite middleware ba\u015Flat\u0131ld\u0131.");
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath, { index: false }));
    app.get("*", (req, res) => {
      if (req.originalUrl.includes("/api/") || req.path.startsWith("/api")) {
        return res.status(404).json({
          error: "API rotas\u0131 bulunamad\u0131 (Fallback)",
          path: req.path,
          originalUrl: req.originalUrl,
          method: req.method
        });
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  const runAutoReminders = async () => {
    console.log("Otomatik hat\u0131rlat\u0131c\u0131lar kontrol ediliyor...");
    const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get();
    if (!settings) return;
    const now = /* @__PURE__ */ new Date();
    if (settings.reminder_7_days_enabled) {
      const targetDate = /* @__PURE__ */ new Date();
      targetDate.setDate(now.getDate() + 7);
      const targetDateStr = targetDate.toISOString().split("T")[0];
      const applicants = db.prepare("SELECT * FROM applicants WHERE randevuTarihi = ? AND (hatirlatma7Gun IS NULL OR hatirlatma7Gun = 0)").all(targetDateStr);
      for (const applicant of applicants) {
        try {
          await sendProfessionalEmail(
            applicant.email,
            "Randevu Hat\u0131rlatmas\u0131 (7 G\xFCn Kald\u0131)",
            "Randevunuza 7 G\xFCn Kald\u0131",
            "Vize ba\u015Fvurunuz i\xE7in randevunuza 1 hafta kalm\u0131\u015Ft\u0131r. L\xFCtfen evraklar\u0131n\u0131z\u0131 kontrol ediniz.",
            applicant
          );
          db.prepare("UPDATE applicants SET hatirlatma7Gun = 1 WHERE id = ?").run(applicant.id);
        } catch (error) {
          console.error(`7 g\xFCn hat\u0131rlatmas\u0131 g\xF6nderilemedi (${applicant.email}):`, error);
        }
      }
    }
    if (settings.reminder_2_days_enabled) {
      const targetDate = /* @__PURE__ */ new Date();
      targetDate.setDate(now.getDate() + 2);
      const targetDateStr = targetDate.toISOString().split("T")[0];
      const applicants = db.prepare("SELECT * FROM applicants WHERE randevuTarihi = ? AND (hatirlatma2Gun IS NULL OR hatirlatma2Gun = 0)").all(targetDateStr);
      for (const applicant of applicants) {
        try {
          await sendProfessionalEmail(
            applicant.email,
            "Randevu Hat\u0131rlatmas\u0131 (2 G\xFCn Kald\u0131)",
            "Randevunuza 2 G\xFCn Kald\u0131",
            "Vize ba\u015Fvurunuz i\xE7in randevunuza 2 g\xFCn kalm\u0131\u015Ft\u0131r. L\xFCtfen randevu saatinizde haz\u0131r bulununuz.",
            applicant
          );
          db.prepare("UPDATE applicants SET hatirlatma2Gun = 1 WHERE id = ?").run(applicant.id);
        } catch (error) {
          console.error(`2 g\xFCn hat\u0131rlatmas\u0131 g\xF6nderilemedi (${applicant.email}):`, error);
        }
      }
    }
    if (settings.reminder_expiry_enabled) {
      const targetDate = /* @__PURE__ */ new Date();
      targetDate.setDate(now.getDate() + settings.reminder_expiry_days);
      const targetDateStr = targetDate.toISOString().split("T")[0];
      const applicants = db.prepare("SELECT * FROM applicants WHERE vizeGecerlilikTarihi = ? AND (hatirlatmaVizeBitis IS NULL OR hatirlatmaVizeBitis = 0)").all(targetDateStr);
      for (const applicant of applicants) {
        try {
          await sendProfessionalEmail(
            applicant.email,
            "Vize S\xFCresi Biti\u015F Hat\u0131rlatmas\u0131",
            "Vizenizin S\xFCresi Dolmak \xDCzere",
            `Vizenizin s\xFCresi ${settings.reminder_expiry_days} g\xFCn sonra dolacakt\u0131r. Yeni ba\u015Fvuru i\xE7in bizimle ileti\u015Fime ge\xE7ebilirsiniz.`,
            applicant
          );
          db.prepare("UPDATE applicants SET hatirlatmaVizeBitis = 1 WHERE id = ?").run(applicant.id);
        } catch (error) {
          console.error(`Vize biti\u015F hat\u0131rlatmas\u0131 g\xF6nderilemedi (${applicant.email}):`, error);
        }
      }
    }
    if (settings.admin_weekly_report_enabled && now.getDay() === 1) {
      console.log("Pazartesi: Haftal\u0131k rapor g\xF6nderim g\xFCn\xFC.");
    }
  };
  app.use("/api", (err, req, res, next) => {
    console.error("API Hatas\u0131:", err);
    res.status(500).json({
      error: "Sunucu taraf\u0131nda bir hata olu\u015Ftu.",
      path: req.path,
      details: process.env.NODE_ENV === "development" ? err.message : void 0
    });
  });
  app.get("/api/ping", (req, res) => {
    res.json({ status: "alive", time: (/* @__PURE__ */ new Date()).toISOString(), version: "1.3.1" });
  });
  const listenCallback = () => {
    console.log(`Sunucu ${PORT} adresinde \xE7al\u0131\u015F\u0131yor`);
    setInterval(runAutoReminders, 24 * 60 * 60 * 1e3);
    runAutoReminders().catch((err) => console.error("Otomatik hat\u0131rlat\u0131c\u0131 hatas\u0131:", err));
  };
  if (isNaN(Number(PORT))) {
    app.listen(PORT, listenCallback);
  } else {
    app.listen(Number(PORT), "0.0.0.0", listenCallback);
  }
}
startServer();
