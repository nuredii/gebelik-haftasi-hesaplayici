# Gebelik Haftası ve Tahmini Doğum Tarihi Hesaplayıcı

> ⚠️ **Eğitim amaçlıdır, klinik karar için kullanılmaz.** Gerçek hastalarda gebelik haftası ve doğum tarihi kararı hekim/ebe değerlendirmesi ile verilmelidir.

Ebelik öğrencileri için hazırlanmış, Türkçe arayüzlü, tek sayfalık bir eğitim aracıdır. Gebelik haftasının ve tahmini doğum tarihinin (TDT) son adet tarihine (SAT) göre nasıl hesaplandığını adım adım gösterir ve alıştırma vakalarıyla pekiştirme sağlar.

## Ne işe yarar?

### Bölüm 1 – Hesaplayıcı
| Hesaplama | Girdiler | Çıktılar |
|---|---|---|
| **Son adet tarihi (SAT)** | SAT, değerlendirme tarihi | TDT (SAT + 280 gün), gebelik haftası (hafta+gün), trimester, Naegele kuralı ile karşılaştırma ve aradaki farkın nedeni |

### Bölüm 2 – Alıştırma modu
Hepsi SAT tabanlı 10 vaka: Naegele kuralıyla TDT (3), gebelik haftası hafta+gün (3), yıl geçişi (1), artık yıl / Şubat sonu (1), Naegele ile 280 gün yönteminin farklı sonuç verdiği vaka (1) ve trimester belirleme (1). Öğrenci cevabını girer, **Kontrol et** ile doğru/yanlış ve adım adım çözüm görür; sonda toplam puan gösterilir. İlerleme yalnızca sayfada (bellekte) tutulur.

## Nasıl kullanılır?

1. `index.html` dosyasını herhangi bir modern tarayıcıda açın (çift tıklamak yeterli). İnternet bağlantısı gerekmez; kurulum yoktur.
2. Tarihleri **GG.AA.YYYY** biçiminde yazın (noktalar otomatik eklenir) ya da 📅 düğmesiyle takvimden seçin.
3. **Hesapla**'ya basın; ayrıntılı takvim sayımı için "Adım adım" bölümünü açın.
4. **Alıştırma Modu** sekmesinden vakaları çözün.

## Gizlilik

Hiçbir kullanıcı verisi toplanmaz, saklanmaz veya bir sunucuya gönderilmez. Dış kütüphane, çerez, analitik ya da ağ isteği yoktur; tüm hesaplamalar tarayıcıda yapılır.

## Doğrulama (testler)

Tarih hesapları, saat dilimi kaynaklı bir günlük kaymaları önlemek için saat bilgisi içermeyen "gün numaraları" (UTC) ile yapılır. `tests.js`, `index.html` içindeki hesap modülünü doğrudan okuyup test eder:

```bash
node tests.js
```

Test kapsamı: artık yıl (29 Şubat; 1900/2000/2100 kuralları), ay sonları (31 Ocak + …), yıl geçişleri, yaz saati geçişleri, Naegele kuralı (ay sonu sabitleme dahil), trimester sınırları, alıştırma vakalarının cevap anahtarı ve 1990–2060 arasındaki her günün bağımsız bir Julian gün numarası algoritmasıyla karşılaştırılması. Testler ayrıca 7 farklı saat diliminde (UTC−11 … UTC+14) tekrar çalıştırılır.

## Sorumluluk reddi

- Bu araç **yalnızca eğitim amaçlıdır**; ebelik öğrencilerinin hesaplama yöntemlerini öğrenmesi ve alıştırma yapması için hazırlanmıştır.
- **Klinik kullanım için tasarlanmamıştır.** Gerçek hastalarda gebelik haftası ve doğum tarihi kararı, tüm klinik bulgular dikkate alınarak hekim/ebe değerlendirmesi ile verilmelidir.
- Yazılım "olduğu gibi" sunulmaktadır; doğruluğu, eksiksizliği veya belirli bir amaca uygunluğu konusunda **hiçbir garanti verilmez**. Geliştirici, aracın kullanımından doğabilecek sonuçlardan sorumlu tutulamaz (ayrıntılar için [LICENSE](LICENSE)).

## Kaynak

American College of Obstetricians and Gynecologists, American Institute of Ultrasound in Medicine, Society for Maternal-Fetal Medicine. *Methods for Estimating the Due Date.* ACOG Committee Opinion No. 700. Obstet Gynecol. 2017;129(5):e150–e154. (2022'de yeniden onaylanmıştır.)

## Geliştiren

**Nur Üredi** — Ege Üniversitesi Ebelik Doktora Programı

## Lisans

[MIT](LICENSE)
