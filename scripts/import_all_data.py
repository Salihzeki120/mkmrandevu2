import sqlite3
import re
import datetime
from html.parser import HTMLParser

class SimpleTableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_td = False
        self.current_row = []
        self.rows = []

    def handle_starttag(self, tag, attrs):
        if tag in ('td', 'th'):
            self.in_td = True
            self.data_parts = []
        elif tag == 'tr':
            self.current_row = []

    def handle_endtag(self, tag):
        if tag in ('td', 'th'):
            self.in_td = False
            cell_text = " ".join("".join(self.data_parts).split())
            self.current_row.append(cell_text)
        elif tag == 'tr':
            if any(c.strip() for c in self.current_row):
                self.rows.append(self.current_row)

    def handle_data(self, data):
        if self.in_td:
            self.data_parts.append(data)

def parse_html_table(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    parser = SimpleTableParser()
    parser.feed(content)
    return parser.rows

def clean_money(val_str):
    if not val_str:
        return 0.0, 'TRY'
    val = val_str.strip()
    curr = 'TRY'
    if 'TRY' in val or 'TL' in val or '₺' in val:
        curr = 'TRY'
    elif 'USD' in val or '$' in val or 'DOLAR' in val:
        curr = 'USD'
    elif 'EUR' in val or '€' in val or 'EURO' in val:
        curr = 'EUR'
    elif 'GBP' in val or '£' in val or 'POUND' in val or 'STR' in val:
        curr = 'GBP'

    # Remove currency words
    clean = re.sub(r'[^\d,\.\-]', '', val)
    if not clean:
        return 0.0, curr

    # Turkish format: 47.927,35 -> 47927.35 or 4,639.76
    if ',' in clean and '.' in clean:
        if clean.rfind(',') > clean.rfind('.'):
            clean = clean.replace('.', '').replace(',', '.')
        else:
            clean = clean.replace(',', '')
    elif ',' in clean:
        clean = clean.replace(',', '.')
    
    try:
        return float(clean), curr
    except:
        return 0.0, curr

def main():
    db = sqlite3.connect('mkm_vize.db')
    cursor = db.cursor()

    # 1. Ensure new tables exist
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        faturaNo TEXT,
        faturaTarihi TEXT,
        faturaBedeli REAL DEFAULT 0,
        currency TEXT DEFAULT 'TRY',
        talepTarihi TEXT,
        firma TEXT,
        ulke TEXT,
        kisi TEXT,
        created_at TEXT
    );
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS country_costs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ulke TEXT,
        kategori TEXT DEFAULT 'İstanbul İçi',
        ucret TEXT,
        kur REAL,
        konsolosluk_kdvsiz TEXT,
        konsolosluk_tl REAL,
        kdvli_kisim TEXT,
        kdvli_tl REAL,
        kdv_doviz REAL,
        kdv_tl REAL,
        kdvsiz_toplam_tl REAL,
        toplam_tl REAL
    );
    ''')

    # Add extra columns to accounting if not exist
    existing_acc_cols = [row[1] for row in cursor.execute("PRAGMA table_info(accounting)").fetchall()]
    if 'talepTarihi' not in existing_acc_cols:
        try: cursor.execute("ALTER TABLE accounting ADD COLUMN talepTarihi TEXT");
        except: pass
    if 'vizeTuru' not in existing_acc_cols:
        try: cursor.execute("ALTER TABLE accounting ADD COLUMN vizeTuru TEXT");
        except: pass
    if 'takipEden' not in existing_acc_cols:
        try: cursor.execute("ALTER TABLE accounting ADD COLUMN takipEden TEXT");
        except: pass
    if 'vizeSuresi' not in existing_acc_cols:
        try: cursor.execute("ALTER TABLE accounting ADD COLUMN vizeSuresi TEXT");
        except: pass
    if 'vizeUcreti' not in existing_acc_cols:
        try: cursor.execute("ALTER TABLE accounting ADD COLUMN vizeUcreti TEXT");
        except: pass

    # 2. Parse & Insert Table 1 (Invoices - 431 records)
    t1_rows = parse_html_table('scripts/table1.html')
    print(f"Parsing Table 1: {len(t1_rows)} rows found.")
    t1_inserted = 0
    t1_updated = 0

    for i, row in enumerate(t1_rows):
        if i == 0 or len(row) < 3:
            continue
        fatura_no = row[0].strip() if len(row) > 0 else ''
        fatura_tarihi = row[1].strip() if len(row) > 1 else ''
        fatura_bedeli_str = row[2].strip() if len(row) > 2 else ''
        talep_tarihi = row[3].strip() if len(row) > 3 else ''
        firma = row[4].strip() if len(row) > 4 else ''
        ulke = row[5].strip() if len(row) > 5 else ''
        kisi = row[6].strip() if len(row) > 6 else ''

        if not fatura_no and not kisi:
            continue

        bedel, curr = clean_money(fatura_bedeli_str)

        # Check existing in invoices
        exist = cursor.execute("SELECT id FROM invoices WHERE faturaNo = ? AND kisi = ?", (fatura_no, kisi)).fetchone()
        if not exist:
            cursor.execute('''
                INSERT INTO invoices (faturaNo, faturaTarihi, faturaBedeli, currency, talepTarihi, firma, ulke, kisi, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (fatura_no, fatura_tarihi, bedel, curr, talep_tarihi, firma, ulke, kisi, datetime.datetime.now().isoformat()))
            t1_inserted += 1
        else:
            t1_updated += 1

    print(f"Invoices table: {t1_inserted} inserted, {t1_updated} already existed.")

    # 3. Parse & Insert Table 2 (Country Pricing & Costs)
    t2_rows = parse_html_table('scripts/table2.html')
    print(f"Parsing Table 2: {len(t2_rows)} rows found.")
    t2_count = 0
    current_category = 'İstanbul İçi'

    for i, row in enumerate(t2_rows):
        if i == 0 or len(row) < 3:
            continue
        ulke_name = row[0].strip() if len(row) > 0 else ''
        if 'İstanbul Dışı' in ulke_name:
            current_category = 'İstanbul Dışı'
        
        ucret = row[1].strip() if len(row) > 1 else ''
        kur_str = row[2].strip() if len(row) > 2 else ''
        kur, _ = clean_money(kur_str)
        kons_doviz = row[3].strip() if len(row) > 3 else ''
        kons_tl, _ = clean_money(row[4] if len(row) > 4 else '')
        kdvli_doviz = row[5].strip() if len(row) > 5 else ''
        kdvli_tl, _ = clean_money(row[6] if len(row) > 6 else '')
        kdv_doviz, _ = clean_money(row[7] if len(row) > 7 else '')
        kdv_tl, _ = clean_money(row[8] if len(row) > 8 else '')
        kdvsiz_toplam, _ = clean_money(row[9] if len(row) > 9 else '')
        toplam, _ = clean_money(row[10] if len(row) > 10 else '')

        if not ulke_name or ulke_name == 'ÜLKE':
            continue

        exist_cost = cursor.execute("SELECT id FROM country_costs WHERE ulke = ? AND kategori = ?", (ulke_name, current_category)).fetchone()
        if not exist_cost:
            cursor.execute('''
                INSERT INTO country_costs (ulke, kategori, ucret, kur, konsolosluk_kdvsiz, konsolosluk_tl, kdvli_kisim, kdvli_tl, kdv_doviz, kdv_tl, kdvsiz_toplam_tl, toplam_tl)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (ulke_name, current_category, ucret, kur, kons_doviz, kons_tl, kdvli_doviz, kdvli_tl, kdv_doviz, kdv_tl, kdvsiz_toplam, toplam))
            t2_count += 1

    print(f"Country costs table: {t2_count} inserted.")

    # 4. Parse & Insert Table 3 (743 Tracking & Accounting rows)
    t3_p1 = parse_html_table('scripts/table3_part1.html')
    t3_p2 = parse_html_table('scripts/table3_part2.html')
    all_t3 = t3_p1[1:] + t3_p2 # Skip header on p1
    print(f"Parsing Table 3: {len(all_t3)} total tracking rows.")

    app_inserted = 0
    app_updated = 0
    acc_inserted = 0
    acc_updated = 0

    code_counter = 1000

    for idx, row in enumerate(all_t3):
        if not row or not any(row):
            continue
        
        ad_soyad = row[0].strip() if len(row) > 0 else ''
        if not ad_soyad or ad_soyad == 'Başvuru sahibinin adı':
            continue
        
        durum = row[1].strip() if len(row) > 1 else 'Tamamlandı'
        randevu_tarihi_saat = row[2].strip() if len(row) > 2 else ''
        gelis_tarihi = row[3].strip() if len(row) > 3 else ''
        pasaport_no = row[4].strip() if len(row) > 4 else ''
        ulke = row[5].strip() if len(row) > 5 else ''
        vize_turu = row[6].strip() if len(row) > 6 else 'Turistik'
        takip_eden = row[7].strip() if len(row) > 7 else ''
        vize_suresi = row[8].strip() if len(row) > 8 else ''
        vize_ucreti = row[9].strip() if len(row) > 9 else ''
        odeme_takip = row[10].strip() if len(row) > 10 else ''
        odeme = row[11].strip() if len(row) > 11 else ''
        fatura_firma = row[12].strip() if len(row) > 12 else ''
        fatura_no_veya_tarih = row[13].strip() if len(row) > 13 else ''
        fatura_tarihi_veya_tutari = row[14].strip() if len(row) > 14 else ''
        fatura_tutari_str = row[15].strip() if len(row) > 15 else ''

        # Map invoice no, date, and amount accurately
        fatura_no = ''
        fatura_tarihi = ''
        tutar_str = ''

        # Check which column contains invoice number (e.g. AAA..., GIB..., BBB..., MKA..., MKF..., PRF...)
        for val in [fatura_firma, fatura_no_veya_tarih, fatura_tarihi_veya_tutari, fatura_tutari_str]:
            if re.match(r'^[A-Z]{3,4}\d{10,}', val) or re.match(r'^[A-Z]{3}\d{8,}', val) or 'GIB' in val or 'BBB' in val:
                fatura_no = val
                break
        
        if not fatura_no:
            if re.match(r'^[A-Z]{3}\d+', fatura_no_veya_tarih):
                fatura_no = fatura_no_veya_tarih
            elif re.match(r'^[A-Z]{3}\d+', fatura_firma):
                fatura_no = fatura_firma

        # Check date (DD.MM.YYYY)
        for val in [randevu_tarihi_saat, fatura_no_veya_tarih, fatura_tarihi_veya_tutari, fatura_tutari_str]:
            if re.search(r'\d{2}[\./\-]\d{2}[\./\-]\d{4}', val) or re.search(r'\d{4}[\./\-]\d{2}[\./\-]\d{2}', val):
                if not fatura_tarihi:
                    fatura_tarihi = val

        # Check amount
        for val in [fatura_tutari_str, fatura_tarihi_veya_tutari, vize_ucreti]:
            if 'TRY' in val or 'TL' in val or 'EURO' in val or 'USD' in val or '€' in val or '$' in val:
                tutar_str = val
                break

        tutar, curr = clean_money(tutar_str)

        # Separate name into ad and soyad
        parts = ad_soyad.split()
        if len(parts) > 1:
            ad = " ".join(parts[:-1])
            soyad = parts[-1]
        else:
            ad = ad_soyad
            soyad = ''

        # Clean status
        app_status = 'Tamamlandı'
        if 'RANDEVU ALINDI' in durum.upper():
            app_status = 'Randevu Alındı'
        elif 'TALEP' in durum.upper() or 'BEKLE' in durum.upper() or 'ATAMA' in durum.upper():
            app_status = 'Talep Bekliyor'
        elif 'İŞLEMDE' in durum.upper():
            app_status = 'İşlemde'
        elif 'İPTAL' in durum.upper():
            app_status = 'İptal Edildi'
        elif 'RED' in durum.upper() or 'RET' in durum.upper():
            app_status = 'Tamamlandı'

        # Payment status
        odeme_durumu = 'Ödenmedi'
        if 'ÖDENDİ' in durum.upper() or 'ÖDENDİ' in odeme_takip.upper() or 'ÖDENDİ' in odeme.upper():
            odeme_durumu = 'Ödendi'
        elif 'FATURA' in odeme.upper() or fatura_no:
            odeme_durumu = 'Fatura Kesildi'

        # Find existing applicant by ad + soyad + ulke
        existing_app = cursor.execute('''
            SELECT id, takipKodu, randevuTarihi FROM applicants 
            WHERE (ad = ? AND soyad = ?) OR (ad = ? AND ulke = ?)
        ''', (ad, soyad, ad, ulke)).fetchone()

        if existing_app:
            app_id, takip_kodu, existing_randevu = existing_app
            # Update missing fields without overwriting
            cursor.execute('''
                UPDATE applicants SET 
                    pasaportNo = COALESCE(NULLIF(pasaportNo, ''), ?),
                    firmaAdi = COALESCE(NULLIF(firmaAdi, ''), ?),
                    vizeKategorisi = COALESCE(NULLIF(vizeKategorisi, ''), ?),
                    randevuTarihi = COALESCE(NULLIF(randevuTarihi, ''), ?)
                WHERE id = ?
            ''', (pasaport_no, fatura_firma, vize_turu, randevu_tarihi_saat, app_id))
            app_updated += 1
        else:
            code_counter += 1
            takip_kodu = f"TRK-{code_counter:05d}"
            cursor.execute('''
                INSERT INTO applicants (
                    takipKodu, ad, soyad, dogumTarihi, ulke, islemDurumu, randevuTarihi, saat,
                    odemeDurumu, pasaportNo, notlar, pasaportSkt, email, kayitTarihi,
                    vizeSonucu, vizeGecerlilikTarihi, firmaAdi, fiyat, currency, vizeKategorisi
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                takip_kodu, ad, soyad, '', ulke, app_status, randevu_tarihi_saat, '',
                'Ödendi' if odeme_durumu == 'Ödendi' else 'Ödenmedi',
                pasaport_no, f"Takip: {takip_eden} | {odeme_takip} | {odeme}", '', '',
                datetime.date.today().isoformat(),
                'Red' if ('RED' in durum.upper() or 'RET' in durum.upper()) else '',
                vize_suresi,
                fatura_firma or 'Bireysel',
                tutar,
                curr,
                vize_turu
            ))
            app_inserted += 1

        # Now check accounting record
        existing_acc = cursor.execute('SELECT id, faturaNo FROM accounting WHERE takipKodu = ?', (takip_kodu,)).fetchone()
        net_tutar = tutar / 1.2 if tutar > 0 else 0
        kdv = tutar - net_tutar

        if existing_acc:
            acc_id, ex_fatura = existing_acc
            cursor.execute('''
                UPDATE accounting SET 
                    faturaNo = COALESCE(NULLIF(faturaNo, ''), ?),
                    faturaTarihi = COALESCE(NULLIF(faturaTarihi, ''), ?),
                    firma = COALESCE(NULLIF(firma, ''), ?),
                    vizeTuru = ?,
                    takipEden = ?,
                    vizeSuresi = ?,
                    vizeUcreti = ?
                WHERE id = ?
            ''', (fatura_no, fatura_tarihi, fatura_firma, vize_turu, takip_eden, vize_suresi, vize_ucreti, acc_id))
            acc_updated += 1
        else:
            cursor.execute('''
                INSERT INTO accounting (
                    takipKodu, adSoyad, islemDurumu, randevuBilgisi, kayitTarihi, pasaportNo,
                    ulke, odemeDurumu, firma, netTutar, kdv, toplam, faturaNo, faturaTarihi,
                    currency, vizeTuru, takipEden, vizeSuresi, vizeUcreti
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                takip_kodu, ad_soyad, app_status, randevu_tarihi_saat, datetime.date.today().isoformat(),
                pasaport_no, ulke, odeme_durumu, fatura_firma or 'Bireysel',
                net_tutar, kdv, tutar, fatura_no, fatura_tarihi, curr,
                vize_turu, takip_eden, vize_suresi, vize_ucreti
            ))
            acc_inserted += 1

    db.commit()
    db.close()

    print("=== IMPORT COMPLETED SUCCESSFULLY ===")
    print(f"Applicants: {app_inserted} new inserted, {app_updated} updated.")
    print(f"Accounting: {acc_inserted} new inserted, {acc_updated} updated.")

if __name__ == '__main__':
    main()
