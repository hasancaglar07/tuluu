# 🕋 İman & Ahlak Programı - MongoDB Import Script

## 📋 Genel Bakış

Bu script, **İman & Ahlak** eğitim programının tamamını (10 bölüm, 124 ders, 1,612 egzersiz) MongoDB veritabanına otomatik olarak yükler.

### Özellikler
- ✅ **10 Bölüm:** Allah'ı Tanımak'tan Hayata Taşıyorum'a kadar
- ✅ **124 Ders:** Progressif zorluk seviyesi
- ✅ **1,612 Egzersiz:** 6 farklı tip (translate, select, arrange, match, listen, speak)
- ✅ **22,737 XP:** Toplam kazanılabilir deneyim puanı
- ✅ **Transaction Safety:** Hata durumunda otomatik rollback
- ✅ **Gamification:** XP sistemi, premium içerik, value points

---

## 🎯 Program Yapısı

### Bölümler (Chapters)
1. **Allah'ı Tanımak** (12 ders, 156 egzersiz) - ⭐ Beginner - Ücretsiz
2. **Peygamberler** (13 ders, 169 egzersiz) - ⭐ Beginner - Ücretsiz
3. **Melekler ve Kitaplar** (12 ders, 156 egzersiz) - ⭐⭐ Intermediate - Ücretsiz
4. **Ahiret İnancı** (12 ders, 156 egzersiz) - ⭐⭐ Intermediate - Ücretsiz
5. **Namaz İbadeti** (13 ders, 169 egzersiz) - ⭐⭐ Intermediate - Ücretsiz
6. **Oruç ve Zekat** (12 ders, 156 egzersiz) - ⭐⭐⭐ Advanced - 💎 Premium
7. **Sabır ve Şükür** (13 ders, 169 egzersiz) - ⭐⭐⭐ Advanced - 💎 Premium
8. **Doğruluk ve Güven** (12 ders, 156 egzersiz) - ⭐⭐⭐ Advanced - 💎 Premium
9. **Merhamet ve Adalet** (13 ders, 169 egzersiz) - ⭐⭐⭐⭐ Expert - 💎 Premium
10. **Hayata Taşıyorum** (12 ders, 156 egzersiz) - ⭐⭐⭐⭐ Expert - 💎 Premium

### Egzersiz Dağılımı
**Bölüm 1-2 (Beginner):**
- 6 translate + 4 select + 2 match + 1 listen = **13 egzersiz/ders**

**Bölüm 3-5 (Intermediate):**
- 4 translate + 4 select + 3 arrange + 2 match = **13 egzersiz/ders**

**Bölüm 6-8 (Advanced):**
- 3 translate + 3 select + 4 arrange + 2 match + 1 speak = **13 egzersiz/ders**

**Bölüm 9-10 (Expert):**
- 2 translate + 2 select + 5 arrange + 3 match + 1 speak = **13 egzersiz/ders**

---

## 🚀 Kurulum ve Kullanım

### Gereksinimler
- Node.js v18+
- MongoDB bağlantısı (MongoDB URI)
- npm veya yarn

### Adım 1: Bağımlılıkları Yükle
```bash
cd scripts
npm install
```

### Adım 2: MongoDB URI'yi Kontrol Et
Script içinde MongoDB URI zaten tanımlı:
```javascript
const MONGODB_URI = "mongodb+srv://tarfyazilim_db_user:rVJhMF2Xvm0eYXvb@tulu0.ztsglsx.mongodb.net/?appName=tulu0";
```

**Önemli:** Güvenlik nedeniyle production'da bu URI'yi `.env` dosyasından okuyun!

### Adım 3: Script'i Çalıştır
```bash
npm run import
# veya
node import-iman-ahlak.js
```

---

## 📊 Beklenen Çıktı

```
🚀 İman & Ahlak Programı Import Başlıyor...

📡 MongoDB'ye bağlanılıyor...
✅ MongoDB bağlantısı başarılı

🔄 Transaction başlatıldı

📚 Program oluşturuluyor...
✅ Program oluşturuldu: iman & ahlak (ID: ...)

📖 Bölüm 1: allah'ı tanımak
   ✅ Bölüm oluşturuldu (ID: ...)
   📂 Ünite: allah birdir (4 ders)
      📝 Ders: tevhid nedir? (10 XP)
         ✅ 13 egzersiz eklendi
      ...

📖 Bölüm 2: peygamberler
   ...

✅ Transaction commit edildi

═══════════════════════════════════════════════════════
🎉 İMPORT BAŞARILI! 🎉
═══════════════════════════════════════════════════════
📚 Program: iman & ahlak (ID: ...)
📖 Bölüm: 10
📂 Ünite: 30
📝 Ders: 124
🎯 Egzersiz: 1,612
⭐ Toplam XP: 22,737
═══════════════════════════════════════════════════════

🔌 MongoDB bağlantısı kapatıldı
```

---

## ⚙️ Teknik Detaylar

### MongoDB Transaction
Script, MongoDB transaction kullanarak veri bütünlüğünü garanti eder:
- ✅ Tüm işlemler başarılı → Commit
- ❌ Herhangi bir hata → Rollback (hiçbir veri eklenmez)

### Model Hiyerarşisi
```
Language (Program)
  └─ Chapter (Bölüm)
      └─ Unit (Ünite)
          └─ Lesson (Ders)
              └─ Exercise (Egzersiz)
```

### Validation Kuralları
- `correctAnswer`: Mutlaka array `["cevap"]`
- `options`: translate/select/arrange/match için DOLU (min 5 seçenek)
- `options`: listen/speak için BOŞ `[]`
- `audioUrl`: Her egzersizde mevcut (şimdilik `""`)
- Tüm metinler: lowercase

### Egzersiz Tipleri
1. **translate** - Çeviri (Türkçe ↔ Arapça)
2. **select** - Çoktan seçmeli
3. **arrange** - Kelime sıralama
4. **match** - Eşleştirme
5. **listen** - Dinleme (audioUrl gerekli)
6. **speak** - Konuşma (audioUrl gerekli)

---

## ⚠️ Önemli Notlar

### Güvenlik
- 🔐 MongoDB URI'yi **asla** public repository'lere commit etmeyin
- 🔐 Production'da mutlaka `.env` dosyası kullanın:
  ```javascript
  const MONGODB_URI = process.env.MONGODB_URI;
  ```

### Tekrar Çalıştırma
- Script tekrar çalıştırıldığında **duplicate key error** alırsınız
- Temiz import için önce veritabanını temizleyin:
  ```bash
  # MongoDB shell veya Compass ile:
  db.languages.deleteMany({ name: "iman & ahlak" })
  db.chapters.deleteMany({ ... })
  db.units.deleteMany({ ... })
  db.lessons.deleteMany({ ... })
  db.exercises.deleteMany({ ... })
  ```

### Audio Dosyaları
- Şu anda tüm `audioUrl` field'ları boş string (`""`)
- İleride gerçek audio URL'leri eklenebilir
- listen/speak egzersizleri için audio entegrasyonu gerekecek

---

## 🐛 Hata Giderme

### Error: "Connection failed"
- MongoDB URI'yi kontrol edin
- Network bağlantınızı kontrol edin
- MongoDB Atlas'ta IP whitelist ayarlarını kontrol edin

### Error: "E11000 duplicate key error"
- Veritabanında zaten aynı program var
- Önce mevcut veriyi silin veya farklı bir database kullanın

### Error: "Options are required for this exercise type"
- Egzersiz tipi ile options array'i uyumsuz
- translate/select/arrange/match için options DOLU olmalı
- listen/speak için options BOŞ olmalı

---

## 📈 İstatistikler

### Toplam İçerik
- **Bölüm:** 10
- **Ünite:** 30 (ortalama 3/bölüm)

---

## 📚 Story Kitap Import'u

### Adım 1: Vercel Blob Kurulumu

1. **Vercel Dashboard'a git:**
   - [Vercel Dashboard](https://vercel.com/dashboard) > Storage > Blob
   - "Create Store" butonuna tıkla
   - Store adı: `tulu-stories` (veya istediğin)

2. **Token'ı kopyala:**
   - Store oluşturduktan sonra "Copy Token" butonuna tıkla
   - Token'ı kopyala (örn: `vercel_blob_rw_xxxxx`)

3. **Environment dosyası oluştur:**
   ```bash
   cd scripts
   cp .env.example .env
   ```
   
   `.env` dosyasına token'ı ekle:
   ```bash
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxx
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tulu-platform
   ```

4. **Bağımlılıkları yükle:**
   ```bash
   npm install
   ```

### Adım 2: Varlıkları Vercel Blob'a Yükle

Kitap görsellerini ve audio dosyalarını Vercel Blob'a yükle:

```bash
npm run upload:assets
```

Bu komut:
- ✅ `scripts/Books/*/cover.jpg` dosyalarını yükler
- ✅ `scripts/Books/*/pages/*.jpg` dosyalarını yükler
- ✅ `scripts/Books/*/audio/*.mp3` dosyalarını yükler (varsa)
- ✅ Manifest dosyalarını Vercel Blob URL'leri ile otomatik günceller

**Beklenen çıktı:**
```
🚀 Vercel Blob Upload başlıyor...

📚 Yükleniyor: hersey-olabilen-zurafa...
  ✅ Kapak: https://xxxxx.public.blob.vercel-storage.com/books/hersey-olabilen-zurafa/cover.jpg
  📄 36 sayfa yükleniyor...
  ✅ page-001.jpg
  ✅ page-002.jpg
  ...
  ✅ page-036.jpg
✨ hersey-olabilen-zurafa tamamlandı!

==================================================
🎉 Upload işlemi tamamlandı!
✅ Başarılı: 1 kitap
📝 Manifest dosyaları güncellendi.
==================================================
```

### Adım 3: Kitapları MongoDB'ye Import Et

Manifest'leri güncellenmiş kitapları MongoDB'ye aktar:

```bash
npm run import:stories
```

Script `scripts/Books/*/manifest.json` dosyalarını okuyarak her kitabı `story` içerik tipinde Chapter/Unit/Lesson olarak içeri aktarır ve sayfa görsellerini `Lesson.storyPages` alanına işler.

**Not:** Manifest örneği `scripts/Books/hersey-olabilen-zurafa/manifest.json` dosyasında güncel tutulmaktadır.
- **Ders:** 124
- **Egzersiz:** 1,612
- **Toplam XP:** 22,737

### Premium İçerik
- **Ücretsiz:** Bölüm 1-5 (62 ders, 806 egzersiz)
- **Premium:** Bölüm 6-10 (62 ders, 806 egzersiz)

### XP Dağılımı
- **Beginner (1-2):** 10 XP/ders × 25 ders = 250 XP
- **Intermediate (3-5):** 12 XP/ders × 37 ders = 444 XP
- **Advanced (6-8):** 15 XP/ders × 37 ders = 555 XP
- **Expert (9-10):** 20 XP/ders × 25 ders = 500 XP

---

## 🎯 Sonraki Adımlar

### Frontend'de Görüntüleme
1. Admin panelde "İman & Ahlak" programını görün
2. Bölümleri, üniteleri ve dersleri browse edin
3. Egzersizleri test edin

### Audio Dosyaları Ekleme
1. Türkçe-Arapça kelimeler için TTS (Text-to-Speech) kullanın
2. Audio dosyalarını cloud storage'a yükleyin
3. `audioUrl` field'larını güncelleyin

### Diğer Programlar
Bu script'i template olarak kullanarak diğer 6 programı da oluşturun:
- 📖 Kur'an & Arapça
- ➕ Matematik & Mantık
- 🔭 Bilim & Keşif
- 🗣️ Dil Öğrenimi
- 🌿 Zihinsel Gelişim
- 👭 Kişisel Sosyal

---

## 📚 İlgili Dökümanlar

- `IMAN_AHLAK_COMPLETE_GUIDE.md` - Komple uygulama kılavuzu (800+ satır)
- `BULK_IMPORT_IMPLEMENTATION_STRATEGY.md` - Backend/Frontend implementasyon
- `IMPLEMENTATION_SUMMARY.md` - Proje özeti
- `IMAN_AHLAK_IMPORT_SYSTEM.md` - JSON şema detayları

---

## 🤝 Katkıda Bulunma

Bu script'i geliştirmek için:
1. Yeni egzersiz tipleri ekleyin
2. Daha zengin içerik üretin
3. Audio entegrasyonu yapın
4. Validation kurallarını iyileştirin

---

## 📝 Lisans

MIT License

---

## 👥 İletişim

- **Proje:** TULU - Türkçe Dil Öğrenme Platformu
- **Team:** Tarfy Yazılım

---

**Hazırlanma Tarihi:** 2025-11-05
**Versiyon:** 1.0.0
**Durum:** ✅ Prod Ready

---

## 🎉 Başarılar!

Script'inizi kullanarak 1,612 egzersizlik bir eğitim programını tek komutla import edebilirsiniz! 🚀
