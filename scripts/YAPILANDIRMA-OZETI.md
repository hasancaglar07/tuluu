# 📚 Eğitim İçeriği Yapılandırma Özeti

Bu dokümanda, oluşturulan eğitim içerik yapısının tam özeti bulunmaktadır.

## 🎯 Oluşturulan Yapı

```
scripts/
├── Programlar/
│   ├── README.md
│   ├── 01-Iman-ve-Ahlak/
│   │   └── 01-Bolum-Dualar/
│   │       └── 01-Unite-Sabah-Duasi/
│   │           ├── 01-lesson-dinle-ve-sec.md
│   │           ├── 02-lesson-sec.md
│   │           ├── 03-lesson-cevir.md
│   │           ├── 04-lesson-soyle.md
│   │           └── 05-lesson-sirala.md
│   └── 02-Kuran-ve-Arapca/
│       └── 01-Bolum-Arap-Harfleri/
│           └── 01-Unite-Elif-Harfi/
│               ├── 01-lesson-dinle-ve-sec.md
│               ├── 02-lesson-hangisi-elif.md
│               ├── 03-lesson-harf-adi-nedir.md
│               ├── 04-lesson-soyle.md
│               └── 05-lesson-yazim-adimlari.md
└── örnekler.txt (referans dosyası)
```

## 📋 Hiyerarşi Kuralları

### 4 Seviyeli Yapı

1. **📁 Programlar** - Ana klasör
2. **🎓 Program** - Eğitim programı (İman & Ahlak, Kur'an & Arapça, vb.)
3. **📖 Bölüm** - Program içindeki ana konular
4. **🎯 Ünite** - Bölüm içindeki alt konular
5. **📝 Lesson** - Egzersiz dosyaları (her ünitede 5 adet)

## 🎮 Lesson Türleri (Her Ünite için 5 Tip)

### 1. Listen (Dinle ve Seç)
- **Dosya:** `01-lesson-dinle-ve-sec.md`
- **Özellik:** Ses dinleme + çoktan seçmeli
- **İçerir:** Ses URL'si, seçenekler, doğru cevap

### 2. Select (Seç)
- **Dosya:** `02-lesson-sec.md` veya özelleştirilmiş isim
- **Özellik:** Görsel/metin seçimi
- **İçerir:** Seçenekler, doğru cevap

### 3. Translate (Çevir)
- **Dosya:** `03-lesson-cevir.md` veya özelleştirilmiş isim
- **Özellik:** Serbest metin girişi
- **İçerir:** Çevrilecek metin, doğru cevaplar

### 4. Speak (Söyle)
- **Dosya:** `04-lesson-soyle.md`
- **Özellik:** Ses kaydı + tanıma
- **İçerir:** Model ses URL'si, doğru telaffuzlar

### 5. Arrange (Sırala)
- **Dosya:** `05-lesson-sirala.md` veya özelleştirilmiş isim
- **Özellik:** Sıralama egzersizi
- **İçerir:** Karışık seçenekler, doğru sıra

## 📝 Lesson Dosya Yapısı

Her lesson dosyası şu bölümleri içerir:

```markdown
# Öğrenme Anı Başlığı

## Egzersiz Bilgileri
- Egzersiz Türü: [Listen/Select/Translate/Speak/Arrange]
- Yönerge: [Kullanıcıya talimat]
- Doğru Cevaplar: [Kabul edilecek cevaplar]
- Seçenekler: [Varsa seçenekler]
- Ses URL'si: [Varsa ses dosyası]

## Notlar
- Özel kurallar ve açıklamalar
- ✅ Yeni Kelime Olarak İşaretle

## İçerik Alanı
- Detaylı açıklamalar
- Örnekler
- Görsel açıklamalar
- Ek bilgiler
```

## 🎯 Oluşturulan İçerikler

### Program 1: İman & Ahlak

#### Bölüm: Dualar
**Ünite: Sabah Duası** (5 lesson)
1. ✅ Dinle ve Seç - Sabah duasını tanıma
2. ✅ Seç - Duanın anlamını kavrama
3. ✅ Çevir - Arapça kelimeleri çevirme
4. ✅ Söyle - Telaffuz pratiği
5. ✅ Sırala - Dua kelimelerini doğru sıralama

**İçerik Özellikleri:**
- Tam Arapça metin
- Okunuş (Latin harfleri)
- Türkçe çeviri
- Kelime analizi
- Duanın önemi ve faydaları

### Program 2: Kur'an & Arapça

#### Bölüm: Arap Harfleri
**Ünite: Elif Harfi (ا)** (5 lesson)
1. ✅ Dinle ve Seç - Elif sesini tanıma
2. ✅ Seç - Elif harfini görsel olarak ayırt etme
3. ✅ Çevir - Harf adını öğrenme
4. ✅ Söyle - Elif telaffuzu
5. ✅ Sırala - Elif yazma adımları

**İçerik Özellikleri:**
- Harf şekli ve özellikleri
- Sesli değeri
- Kelime örnekleri
- Yazım teknikleri
- Farklı yazı stillerinde görünümü

## 🚀 Kullanım Talimatları

### Manuel İçerik Girişi İçin:

1. **İlgili lesson dosyasını aç**
   - Örnek: `01-lesson-dinle-ve-sec.md`

2. **"İçerik Alanı" bölümünü bul**
   - `## İçerik Alanı` başlığının altı

3. **Kendi içeriğini ekle**
   - Mevcut .md dosyalarından copy-paste yapabilirsin
   - Veya yeni içerik yazabilirsin

4. **Egzersiz bilgilerini güncelle**
   - Doğru cevapları belirt
   - Seçenekleri ekle
   - Ses URL'lerini güncelle

### Yeni Ünite Ekleme:

```bash
# 1. Yeni ünite klasörü oluştur
mkdir "scripts/Programlar/[Program]/[Bölüm]/[XX-Unite-Adi]"

# 2. 5 lesson dosyası oluştur
# Her dosya için:
# - 01-lesson-dinle-ve-sec.md
# - 02-lesson-sec.md
# - 03-lesson-cevir.md
# - 04-lesson-soyle.md
# - 05-lesson-sirala.md
```

## 📊 İstatistikler

- **Toplam Program:** 2
- **Toplam Bölüm:** 2
- **Toplam Ünite:** 2
- **Toplam Lesson:** 10
- **Egzersiz Türü:** 5

## 🎨 Özelleştirme İpuçları

### Dosya Adları
- Numaralandırma kullan: `01-`, `02-`, `03-`...
- Açıklayıcı isimler: `lesson-dinle-ve-sec`, `lesson-harf-adi-nedir`
- Türkçe karakter kullanabilirsin

### İçerik Formatı
- Markdown formatı kullan
- Başlıklar ile yapılandır (H1, H2, H3)
- Kod blokları için \`\`\` kullan
- Listeler için `-` veya `1.` kullan
- Emoji kullanarak görsellik kat: ✅ ❌ 📚 🎯

### Ses Dosyaları
- URL formatında sakla
- CDN kullanımı önerilir
- Dosya formatları: .mp3, .ogg
- Opsiyonel alanlar boş bırakılabilir

## 📞 Sonraki Adımlar

1. ✅ Yapı oluşturuldu
2. ⏭️ İçerik girişi yapılacak (manuel)
3. ⏭️ Yeni üniteleler eklenecek
4. ⏭️ Diğer programlar oluşturulacak:
   - Matematik & Mantık
   - Dil Öğrenimi
   - Zihinsel & Ruhsal Gelişim
   - Kişisel & Sosyal
   - Bilim & Keşif

## 💡 Önemli Notlar

- Her ünite tam 5 lesson içermelidir
- Lesson sırası önemlidir (1'den 5'e)
- Tüm lesson dosyaları .md (markdown) formatındadır
- "İçerik Alanı" bölümü esnek ve genişletilebilirdir
- Ses URL'leri opsiyoneldir ancak önerilir

---

**Oluşturma Tarihi:** 5 Kasım 2025
**Son Güncelleme:** 5 Kasım 2025
**Durum:** ✅ Tamamlandı - İçerik girişi için hazır