export interface PriceCalculationResult {
  konsoloslukUcreti: number;
  hizmetBedeli: number;     // NET hizmet bedeli (KDV matrahı)
  kdvOrani: number;         // KDV oranı (%)
  kdvHariçToplam: number;   // KDV Hariç Taban Tutar / Faturasız Tutar (Konsolosluk + Hizmet Bedeli)
  kdv: number;              // KDV Tutarı (Yalnızca Hizmet Bedeli üzerinden %20)
  toplam: number;           // KDV Dahil Genel Toplam / Faturalı Tutar
}

/**
 * Vize Başvuru Sistemi - Merkezi Fiyat Hesaplama Fonksiyonu (calculatePrice)
 * 
 * İŞ KURALLARI:
 * 1. Konsolosluk Ücreti: Resmi konsolosluk harcıdır (örn: 90€). KDV'den İSTİSNADIR (KDV Eklenmez).
 * 2. Hizmet Bedeli: Şirket danışmanlık ücretidir (örn: 160€). Yalnızca bu tutar KDV matrahıdır.
 * 3. KDV Hariç Tutar (Taban/Faturasız Fiyat): Konsolosluk Ücreti (90€) + Hizmet Bedeli (160€) = 250€.
 *    (Fatura istemeyen şahıs müşteriler bu tutarı öder).
 * 4. KDV Tutarı: Yalnızca Hizmet Bedeli üzerinden hesaplanır (160€ * %20 = 32€).
 * 5. KDV Dahil Genel Toplam (Faturalı/Firma Fiyatı): 250€ + 32€ = 282€.
 *    (Fatura isteyen firmalar/müşteriler bu tutarı öder).
 */
export function calculatePrice(
  konsoloslukUcreti: number = 0,
  hizmetBedeli?: number,
  kdvOrani: number = 20,
  toplamInput?: number
): PriceCalculationResult {
  const kons = Math.max(0, Number(konsoloslukUcreti) || 0);
  const oran = Number(kdvOrani) >= 0 ? Number(kdvOrani) : 20;

  let hiz = 0;
  
  if (hizmetBedeli !== undefined && hizmetBedeli !== null) {
    hiz = Math.max(0, Number(hizmetBedeli) || 0);
  } else if (toplamInput !== undefined && toplamInput !== null && Number(toplamInput) > 0) {
    const tot = Math.max(0, Number(toplamInput) || 0);
    // Eğer girilen toplam KDV Dahil ise
    const kalanTutar = Math.max(0, tot - kons);
    hiz = kalanTutar / (1 + oran / 100);
  }

  const roundedKons = Math.round(kons * 100) / 100;
  const roundedHiz = Math.round(hiz * 100) / 100;
  const kdvHariçToplam = Math.round((roundedKons + roundedHiz) * 100) / 100;
  const kdv = Math.round((roundedHiz * (oran / 100)) * 100) / 100;
  const toplam = Math.round((kdvHariçToplam + kdv) * 100) / 100;

  return {
    konsoloslukUcreti: roundedKons,
    hizmetBedeli: roundedHiz,
    kdvOrani: oran,
    kdvHariçToplam,
    kdv,
    toplam,
  };
}
