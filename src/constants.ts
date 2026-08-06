export const COUNTRIES = [
  "Almanya", "Amerika", "Avustralya", "Avusturya", "Belçika", "Bulgaristan", "Cezayir", "Çek Cumhuriyeti", "Çin", "Danimarka", "Dubai", "Estonya", 
  "Finlandiya", "Fransa", "Hırvatistan", "Hindistan", "Hollanda", "İngiltere", "İspanya", "İsveç", "İsviçre", "İtalya", "İzlanda", 
  "Kanada", "Letonya", "Litvanya", "Lüksemburg", "Macaristan", "Malta", "Mısır", "Norveç", "Polonya", "Portekiz", 
  "Rusya", "Slovakya", "Slovenya", "Suudi Arabistan", "Vietnam", "Yunanistan"
].sort((a, b) => a.localeCompare(b, 'tr'));

export const SCHENGEN_COUNTRIES = [
  "Almanya", "Avusturya", "Belçika", "Bulgaristan", "Çek Cumhuriyeti", "Danimarka", 
  "Estonya", "Finlandiya", "Fransa", "Hırvatistan", "Hollanda", "İspanya", 
  "İsveç", "İsviçre", "İtalya", "İzlanda", "Letonya", "Litvanya", "Lüksemburg", 
  "Macaristan", "Malta", "Norveç", "Polonya", "Portekiz", "Romanya", "Slovakya", 
  "Slovenya", "Yunanistan"
];

export function isSchengenCountry(countryName?: string): boolean {
  if (!countryName) return false;
  const norm = countryName.trim().toLowerCase();
  return SCHENGEN_COUNTRIES.some(
    c => c.toLowerCase() === norm || norm.includes(c.toLowerCase()) || c.toLowerCase().includes(norm)
  );
}

export function getCurrencyForCountry(countryName?: string): 'EUR' | 'USD' {
  return isSchengenCountry(countryName) ? 'EUR' : 'USD';
}

export function getCurrencySymbol(currency?: string, countryName?: string): string {
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

export const STATUS_OPTIONS = ["İşlemde", "Randevu Alındı", "Tamamlandı", "Talep Bekliyor", "İptal Edildi", "Dosya Hazırlanıyor", "Konsoloslukta", "Pasaport Bekleniyor"];
export const PAYMENT_OPTIONS = ["Ödendi", "Ödenmedi", "Fatura Kesildi"];
export const RESULT_OPTIONS = ["Onaylandı", "Red"];

export const CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin",
  "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur",
  "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan",
  "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul",
  "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kilis", "Kırıkkale", "Kırşehir",
  "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir",
  "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Şanlıurfa", "Siirt", "Sinop", "Sivas",
  "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak", "Kırklareli"
].sort((a, b) => a.localeCompare(b, 'tr'));

export const VISA_CENTERS = [
  {
    "kurum": "VFS Global",
    "ulkeler": ["Avustralya"],
    "yetki_alanlari": [
      { "merkez": "Ankara", "adres": "İşçi Blokları Mh. Muhsin Yazıcığlu Cd. No: 57/A, Çankaya, Ankara, Türkiye", "iller": ["Ankara", "Konya", "Kayseri", "Eskişehir", "Sivas"] },
      { "merkez": "İstanbul (Altunizade)", "adres": "Altunizade Mahallesi Mahir İz Cad. No 13/2 Ofton Plaza B Blok, Üsküdar, İstanbul", "iller": ["İstanbul", "Bursa", "Kocaeli", "Sakarya", "Yalova", "Bilecik"] },
      { "merkez": "Gaziantep", "adres": "Değirmicem Mah. 16046 Nolu Sokak, Kaplama İş Merkezi Sitesi No:1/B, Şehitkamil, Gaziantep", "iller": ["Gaziantep", "Adana", "Mersin", "Hatay", "Şanlıurfa", "Diyarbakır"] }
    ]
  },
  {
    "kurum": "VFS Global",
    "ulkeler": ["Avusturya", "Belçika", "Bulgaristan", "Hırvatistan", "Hollanda", "Slovenya"],
    "yetki_alanlari": [
      { "merkez": "Ankara", "adres": "İşçi Blokları Mahallesi, Muhsin Yazıcıoğlu Caddesi, No: 57/A, Regnum Sky Tower, Çankaya, Ankara, TÜRKİYE", "iller": ["Ankara", "Konya", "Kayseri", "Eskişehir", "Sivas"] },
      { "merkez": "İstanbul (Beyoğlu)", "adres": "Hacıahmet Mahallesi, Kurtuluş Deresi Caddesi, No:29 A, Beyoğlu, İstanbul, TÜRKİYE", "iller": ["İstanbul", "Tekirdağ", "Kırklareli"] },
      { "merkez": "İstanbul (Altunizade)", "adres": "Altunizade Mahallesi, Mahir İz Caddesi, No: 13/2, Ofton Plaza B Blok, Üsküdar, İstanbul, TÜRKİYE", "iller": ["İstanbul", "Kocaeli", "Sakarya", "Yalova", "Bilecik"] },
      { "merkez": "İzmir", "adres": "Ege Perla AVM Çınarlı, Ozan Abay Caddesi No:8, 1. Kat, Konak, İzmir", "iller": ["İzmir", "Manisa", "Aydın", "Denizli", "Muğla", "Uşak", "Afyonkarahisar", "Kütahya"] },
      { "merkez": "Antalya", "adres": "Çaybaşı Mahallesi, Cebesoy Caddesi, Doğu Garajı Kültür ve Ticaret Merkezi No: 75, Giriş Kat (Doğu Garajı AVM), Muratpaşa, Antalya", "iller": ["Antalya", "Burdur", "Isparta"] },
      { "merkez": "Gaziantep", "adres": "Değirmicem Mah. 16046 Nolu Sokak, Kaplama İş Merkezi Sitesi No:1/B, Şehitkamil, Gaziantep", "iller": ["Gaziantep", "Adana", "Mersin", "Hatay", "Şanlıurfa", "Diyarbakır"] },
      { "merkez": "Bursa", "adres": "Kükürtlü Mah. Kükürtlü Cad. Sedef Apt. No:3/2B, Osmangazi, Bursa", "iller": ["Bursa", "Çanakkale", "Balıkesir"] },
      { "merkez": "Edirne", "adres": "Cumhuriyet Caddesi Kuvayi Milliye Bulvarı No: 26, Twin Life Sitesi No: 25, Edirne", "iller": ["Edirne"] },
      { "merkez": "Trabzon", "adres": "Pazarkapı Mah. Devlet Sahil Yolu Cad. No:85/63 (Trabzon Ticaret Ve Sanayi Odası), Ortahisar, Trabzon", "iller": ["Trabzon", "Rize", "Artvin", "Samsun", "Giresun", "Ordu"] }
    ]
  },
  {
    "kurum": "VFS Global",
    "ulkeler": ["Kanada"],
    "yetki_alanlari": [
      { "merkez": "Ankara", "adres": "İşçi Blokları Mahallesi, Muhsin Yazıcıoğlu Caddesi, No: 57/A, Regnum Sky Tower, Çankaya, Ankara 06530, TÜRKİYE", "iller": ["Ankara", "Konya", "Kayseri", "Eskişehir", "Sivas", "Gaziantep", "Adana", "Antalya"] },
      { "merkez": "İstanbul (Beyoğlu)", "adres": "Hacıahmet Mahallesi, Kurtuluş Deresi Caddesi, No: 29/A, Beyoğlu, İstanbul, TÜRKİYE", "iller": ["İstanbul", "Bursa", "İzmir", "Kocaeli", "Tekirdağ", "Edirne", "Çanakkale"] }
    ]
  },
  {
    "kurum": "VFS Global",
    "ulkeler": ["Çek Cumhuriyeti", "Danimarka", "Finlandiya", "Norveç", "İsveç"],
    "yetki_alanlari": [
      { "merkez": "Ankara", "adres": "İşçi Blokları Mahallesi, Muhsin Yazıcıoğlu Caddesi, No: 57/A, Regnum Sky Tower, Çankaya, Ankara, TÜRKİYE", "iller": ["Ankara", "Konya", "Kayseri", "Eskişehir", "Sivas"] },
      { "merkez": "İstanbul (Beyoğlu)", "adres": "Hacıahmet Mahallesi, Kurtuluş Deresi Caddesi, No:29 A, Beyoğlu, İstanbul, TÜRKİYE", "iller": ["İstanbul", "Tekirdağ", "Kırklareli", "Edirne"] },
      { "merkez": "İzmir", "adres": "Ege Perla AVM Çınarlı, Ozan Abay Caddesi No:8, 1. Kat, Konak, İzmir", "iller": ["İzmir", "Manisa", "Aydın", "Denizli", "Muğla"] },
      { "merkez": "Antalya", "adres": "Çaybaşı Mahallesi, Cebesoy Caddesi, Doğu Garajı Kültür ve Ticaret Merkezi No: 75 (Doğu Garajı AVM), Muratpaşa, Antalya", "iller": ["Antalya", "Burdur", "Isparta"] }
    ]
  },
  {
    "kurum": "VFS Global",
    "ulkeler": ["Fransa"],
    "yetki_alanlari": [
      { "merkez": "İstanbul", "adres": "Astoria İş Merkezi, Kat: -2, Bölüm: M24, Esentepe, Şişli, İstanbul, TÜRKİYE", "iller": ["İstanbul", "Bursa", "Kocaeli", "Tekirdağ", "Edirne", "Kırklareli", "Sakarya", "Yalova", "Bilecik", "Çanakkale"] },
      { "merkez": "Ankara", "adres": "Mustafa Kemal Mah. Dumlupınar Bulvarı No:274-4/11, Çankaya, Ankara, Türkiye", "iller": ["Ankara", "Konya", "Kayseri", "Eskişehir", "Sivas"] },
      { "merkez": "İzmir", "adres": "İsmet Kaptan Mahallesi, 1372. Sokak No:9 B, 35210 Konak, İzmir, Türkiye", "iller": ["İzmir", "Manisa", "Aydın", "Denizli", "Muğla", "Antalya"] },
      { "merkez": "Gaziantep", "adres": "Değirmiçem Mah. Prof. Muammer Aksoy Bulvarı, Safir İş Merkezi No:28 İç Kapı No:12, Şehitkamil, Gaziantep", "iller": ["Gaziantep", "Adana", "Mersin", "Hatay", "Şanlıurfa"] }
    ]
  },
  {
    "kurum": "VFS Global",
    "ulkeler": ["Letonya", "Litvanya", "Lüksemburg", "Malta", "Polonya"],
    "yetki_alanlari": [
      { "merkez": "Ankara", "adres": "İşçi Blokları Mahallesi, Muhsin Yazıcıoğlu Caddesi, No: 57/A, Regnum Sky Tower, Çankaya, Ankara, TÜRKİYE", "iller": ["Ankara", "Konya", "Kayseri", "Eskişehir", "Sivas"] },
      { "merkez": "İstanbul (Beyoğlu)", "adres": "Hacıahmet Mahallesi, Kurtuluş Deresi Caddesi, No:29 A, Beyoğlu, İstanbul, TÜRKİYE", "iller": ["İstanbul", "Tekirdağ", "Kırklareli"] },
      { "merkez": "İstanbul (Altunizade)", "adres": "Altunizade Mahallesi, Mahir İz Caddesi, No: 13/2, Ofton Plaza B Blok, Üsküdar, İstanbul, TÜRKİYE", "iller": ["İstanbul", "Kocaeli", "Sakarya", "Yalova", "Bilecik"] },
      { "merkez": "İzmir", "adres": "Ege Perla AVM Çınarlı, Ozan Abay Caddesi No:8, 1. Kat, Konak, İzmir", "iller": ["İzmir", "Manisa", "Aydın", "Denizli", "Muğla"] },
      { "merkez": "Antalya", "adres": "Çaybaşı Mahallesi, Cebesoy Caddesi, Doğu Garajı Kültür ve Ticaret Merkezi No: 75 (Doğu Garajı AVM), Muratpaşa, Antalya", "iller": ["Antalya", "Burdur", "Isparta"] },
      { "merkez": "Gaziantep", "adres": "Değirmicem Mah. 16046 Nolu Sokak, Kaplama İş Merkezi Sitesi No:1/B, Şehitkamil, Gaziantep", "iller": ["Gaziantep", "Adana", "Mersin", "Hatay", "Şanlıurfa"] },
      { "merkez": "Bursa", "adres": "Kükürtlü Mah. Kükürtlü Cad. Sedef Apt. No:3/2B, Osmangazi, Bursa", "iller": ["Bursa", "Balıkesir"] },
      { "merkez": "Edirne", "adres": "Cumhuriyet Caddesi Kuvayi Milliye Bulvarı No: 26, Twin Life Sitesi No: 25, Edirne", "iller": ["Edirne"] },
      { "merkez": "Trabzon", "adres": "Pazarkapı Mah. Devlet Sahil Yolu Cad. No:85/63 (Trabzon Ticaret Ve Sanayi Odası), Ortahisar, Trabzon", "iller": ["Trabzon", "Samsun", "Ordu"] }
    ]
  },
  {
    "kurum": "BLS International",
    "ulkeler": ["Slovakya"],
    "yetki_alanlari": [
      { "merkez": "İstanbul", "adres": "Esentepe, Büyükdere Cad. Astoria (AVM) İş Merkezi, 34394 Şişli, İstanbul", "iller": ["İstanbul", "Bursa", "Kocaeli", "Tekirdağ", "Edirne", "Kırklareli", "Sakarya", "Yalova", "Bilecik", "Çanakkale"] },
      { "merkez": "Ankara", "adres": "Mustafa Kemal Mah. Dumlupınar Bulvarı, MAHALL İş Merkezi, Çarşı Katı 274/4 No:11-12, Çankaya, Ankara", "iller": ["Ankara", "Konya", "Kayseri", "Eskişehir", "Sivas"] },
      { "merkez": "İzmir", "adres": "Çınarlı Mah. Ozan Abay Cad. No:8 İç Kapı No:107-110, Ege Perla AVM, Konak, İzmir, Türkiye", "iller": ["İzmir", "Manisa", "Aydın", "Denizli", "Muğla"] },
      { "merkez": "Antalya", "adres": "İz Business Center, Kışla Mah. 37. Sok. No:6/102, Muratpaşa, Antalya", "iller": ["Antalya", "Burdur", "Isparta"] }
    ]
  },
  {
    "kurum": "VFS Global",
    "ulkeler": ["İsviçre"],
    "yetki_alanlari": [
      { "merkez": "İstanbul", "adres": "Esentepe, Büyükdere Caddesi, Astoria (AVM) İş Merkezi, 34394 Şişli, İstanbul", "iller": ["İstanbul", "Bursa", "Kocaeli", "Tekirdağ", "Edirne", "Kırklareli", "Sakarya", "Yalova", "Bilecik", "Çanakkale", "İzmir", "Manisa", "Aydın", "Denizli", "Muğla", "Antalya"] },
      { "merkez": "Ankara", "adres": "Mustafa Kemal Mah. Dumlupınar Bulvarı, MAHALL İş Merkezi, Çarşı Katı 274/4 No:11-12, 06530, Çankaya, Ankara", "iller": ["Ankara", "Konya", "Kayseri", "Eskişehir", "Sivas", "Gaziantep", "Adana"] }
    ]
  },
  {
    "kurum": "VFS Global",
    "ulkeler": ["İngiltere"],
    "yetki_alanlari": [
      { "merkez": "İstanbul", "adres": "Astoria İş Merkezi, Kat: B1, Bölüm: M40, Esentepe, Şişli, İstanbul, Türkiye", "iller": ["İstanbul", "Kocaeli", "Tekirdağ", "Edirne", "Kırklareli", "Sakarya", "Yalova", "Bilecik", "Çanakkale"] },
      { "merkez": "Ankara", "adres": "Farilya İş Merkezi, Kızılırmak Mah. Ufuk Üniversitesi Cad. No:8, Kat:1, No:4, Çankaya, Ankara, Türkiye", "iller": ["Ankara", "Konya", "Kayseri", "Eskişehir", "Sivas"] },
      { "merkez": "İzmir", "adres": "Ege Perla AVM, Çınarlı, Ozan Abay Cad. No:8, Kat:1, No:112, Konak, İzmir, Türkiye", "iller": ["İzmir", "Manisa", "Aydın", "Denizli", "Muğla"] },
      { "merkez": "Antalya", "adres": "Çaybaşı Mahallesi, Cebesoy Caddesi, Doğu Garajı AVM, Doğu Garajı Kültür ve Ticaret Merkezi No:307, Muratpaşa, Antalya", "iller": ["Antalya", "Burdur", "Isparta"] },
      { "merkez": "Adana", "adres": "Döşeme Mah. 60024 Sok. Yenikent Sabuncu İş Merkezi No:3, E Blok, Kat:4, Daire:13, Seyhan, Adana", "iller": ["Adana", "Mersin", "Hatay", "Osmaniye", "Niğde"] },
      { "merkez": "Bursa", "adres": "Ulubatlı Hasan Bulvarı No:5, 16200, Bursa, Türkiye (Almira Hotel)", "iller": ["Bursa"] },
      { "merkez": "Gaziantep", "adres": "İncili Pınar Mahallesi, Prof. Muammer Aksoy Bulvarı, Şehitkamil, Gaziantep 27090 (Hampton by Hilton Şehitkamil)", "iller": ["Gaziantep", "Şanlıurfa", "Kilis", "Adıyaman"] },
      { "merkez": "İstanbul (Altunizade)", "adres": "Altunizade, Oymacı Sok. No:18, 34662 Üsküdar, İstanbul (Holiday Inn Express Altunizade)", "iller": ["İstanbul", "Yalova"] },
      { "merkez": "Trabzon", "adres": "Park Dedeman Yomra, Trabzon", "iller": ["Trabzon", "Rize", "Artvin", "Samsun", "Giresun", "Ordu"] }
    ]
  },
  {
    "kurum": "ABD Büyükelçiliği ve Konsolosluğu",
    "ulkeler": ["Amerika"],
    "yetki_alanlari": [
      { "merkez": "İstanbul Başkonsolosluğu", "adres": "Poligon Mahallesi Sarıyer Caddesi No: 75 34460 İstinye İstanbul", "iller": ["İstanbul", "İzmir", "Bursa", "Kocaeli", "Tekirdağ", "Edirne", "Kırklareli", "Balıkesir", "Çanakkale", "Yalova", "Sakarya", "Bilecik", "Bolu"] },
      { "merkez": "Ankara Büyükelçiliği", "adres": "Çukurambar Mahallesi 1480 Sokak No: 1 06530 Çankaya Ankara", "iller": ["Ankara", "Adana", "Gaziantep", "Konya", "Antalya", "Kayseri", "Eskişehir", "Mersin", "Diyarbakır", "Samsun", "Denizli", "Şanlıurfa", "Malatya"] }
    ]
  },
  {
    "kurum": "iDATA (Almanya & İtalya)",
    "ulkeler": ["Almanya", "İtalya"],
    "web_sitesi": "idata.com.tr",
    "yetki_alanlari": [
      { "merkez": "İstanbul (Avrupa) Ofisi", "adres": "Esentepe Mh. Büyükdere Cd. No: 127 Astoria AVM B2 Katı, Şişli/İstanbul", "iller": ["İstanbul", "Kocaeli", "Tekirdağ", "Edirne", "Sakarya", "Kırklareli"] },
      { "merkez": "İstanbul (Asya) Ofisi", "adres": "Altunizade Mah. Kısıklı Cad. Shibuya Sok. No: 4/2 Üsküdar/İstanbul", "iller": ["İstanbul", "Kocaeli", "Yalova"] },
      { "merkez": "Ankara Ofisi", "adres": "Gaziosmanpaşa Mahallesi, İran caddesi, Karum AVM 21/ 361-362 Çankaya / Ankara", "iller": ["Ankara", "Konya", "Kayseri", "Sivas", "Kırıkkale", "Yozgat"] },
      { "merkez": "Bursa Ofisi", "adres": "Konak Mah. 1.Badem Sokak, Lotus Plaza B Blok No:26 Kat:1 D:10-12 Nilüfer/Bursa", "iller": ["Bursa", "Bilecik", "Çanakkale"] },
      { "merkez": "İzmir Ofisi", "adres": "Kıbrıs Şehitleri Cad. No:152 Zemin Kat Konak Alsancak/İzmir", "iller": ["İzmir", "Manisa", "Aydın", "Denizli", "Muğla", "Uşak", "Balıkesir"] },
      { "merkez": "Gaziantep Ofisi", "adres": "Budak Mahallesi 10031 Nolu Sk. Yasem İş Merkezi NO: 42 C / 0 Şehitkamil / Gaziantep", "iller": ["Gaziantep", "Şanlıurfa", "Mardin", "Batman", "Kilis"] },
      { "merkez": "Trabzon Ofisi", "adres": "İnönü Mah. Yavuz Selim Bulvarı Öztürkler Apt. No: 365A Ortahisar / Trabzon", "iller": ["Trabzon", "Rize", "Artvin", "Samsun", "Giresun", "Ordu"] },
      { "merkez": "Antalya Ofisi", "adres": "Çağlayan Mah. 2053. Sok. No: 28 Ateşoğulları Apt. Lara/Muratpaşa – Antalya", "iller": ["Antalya", "Burdur", "Isparta"] },
      { "merkez": "Adana Ofisi", "adres": "Çınarlı Mah.61027 Sk. Sunar Nuri Çomu İş Merkezi No:20 Kat:2 Seyhan/Adana", "iller": ["Adana", "Mersin", "Hatay", "Osmaniye", "Niğde"] }
    ]
  },
  {
    "kurum": "Kosmos Vize (Yunanistan)",
    "ulkeler": ["Yunanistan"],
    "web_sitesi": "kosmosvize.com.tr",
    "yetki_alanlari": [
      { "merkez": "İstanbul Ofisi", "adres": "Astoria AVM, Esentepe Mah. Büyükdere Cad No 127 Astoria B1 katı M32 Şişli / İstanbul", "iller": ["İstanbul", "Bursa", "Kocaeli", "Sakarya", "Tekirdağ", "Edirne", "Kırklareli", "Yalova", "Bilecik", "Bolu"] },
      { "merkez": "İzmir Ofisi", "adres": "Akdeniz Mahallesi Akdeniz Caddesi Sadullah Hamit Birsel İş Merkezi No : 14 / 201 Konak – İzmir", "iller": ["İzmir", "Aydın", "Balıkesir", "Manisa", "Muğla", "Denizli", "Uşak"] },
      { "merkez": "Ankara Ofisi", "adres": "Kavaklıdere, Şehit Ömer Haluk Sipahioğlu Sokak (Lugal Hotel içi) No:10 Ofis No:19 Çankaya/Ankara", "iller": ["Ankara", "Konya", "Kayseri", "Eskişehir", "Sivas"] },
      { "merkez": "Gaziantep Ofisi", "adres": "Mücahitler Mahallesi GTB İş Merkezi No:70 Kat:4 No:46 Şehitkamil-Gaziantep", "iller": ["Gaziantep", "Şanlıurfa", "Kilis", "Adıyaman", "Diyarbakır", "Mardin"] }
    ]
  },
  {
    "kurum": "BLS International",
    "ulkeler": ["İspanya"],
    "web_sitesi": "blsspainvisa.com",
    "yetki_alanlari": [
      { "merkez": "İstanbul Ofisi", "adres": "Yesilce Mah. , Diken Sk. No:2, 34418 Kagıthane/Istanbul", "iller": ["İstanbul", "Kocaeli", "Sakarya", "Tekirdağ", "Bursa", "Çanakkale", "Edirne", "Kırklareli", "Yalova"] },
      { "merkez": "Ankara Ofisi", "adres": "Kıbrıs Şehitleri Cad Aksoy İş Merkezi No:152 Zemin Kat Konak/İzmir (Eşleştirme)", "iller": ["Ankara", "Konya", "Kayseri", "Sivas", "Eskişehir", "Yozgat"] },
      { "merkez": "Antalya Ofisi", "adres": "Çağlayan, 2053. Sk. No:28, 07230 Muratpaşa/Antalya", "iller": ["Antalya", "Burdur", "Isparta"] }
    ]
  },
  {
    "kurum": "AS Visa Solutions",
    "ulkeler": ["Macaristan", "Portekiz", "Cezayir", "Mısır", "Slovenya", "Norveç"],
    "web_sitesi": "as-visa.com",
    "yetki_alanlari": [
      { "merkez": "İstanbul Ofisi", "adres": "Polat Piyalepaşa, İstiklal mahallesi, Baruthane Deresi Sokak No :2 C-D Blok Beyoğlu- İstanbul", "iller": ["İstanbul", "Bursa", "Kocaeli", "Yalova", "Tekirdağ", "Edirne", "Kırklareli"] },
      { "merkez": "İzmir Ofisi", "adres": "Mansuroğlu Mah. İslam Kerimov Cad. No: 1 (Lider Centrio), Bayraklı/İzmir", "iller": ["İzmir", "Aydın", "Muğla", "Manisa", "Denizli"] },
      { "merkez": "Ankara Ofisi", "adres": "Aziziye mahallesi Cinnah caddesi no:98/1 Çankaya / ANKARA", "iller": ["Ankara", "Konya", "Kayseri", "Eskişehir", "Sivas"] }
    ]
  }
];
