# Programlar - Eğitim İçerik Yapısı

Bu klasör, eğitim platformu için hazırlanmış program içeriklerini barındırır.

## 📚 Hiyerarşi Yapısı

```
Programlar/
├── Program-1/
│   ├── Bölüm-1/
│   │   ├── Ünite-1/
│   │   │   ├── 01-lesson-xxx.md
│   │   │   ├── 02-lesson-xxx.md
│   │   │   ├── 03-lesson-xxx.md
│   │   │   ├── 04-lesson-xxx.md
│   │   │   └── 05-lesson-xxx.md
│   │   └── Ünite-2/
│   └── Bölüm-2/
└── Program-2/
```

### Yapı Açıklaması

1. **Programlar** - Ana klasör
2. **Program** - Eğitim programı (örn: İman & Ahlak, Kur'an & Arapça)
3. **Bölüm** - Programın ana bölümleri (örn: Dualar, Arap Harfleri)
4. **Ünite** - Bölümün alt konuları (örn: Sabah Duası, Elif Harfi)
5. **Lesson (Öğrenme Anı)** - Egzersiz dosyaları (.md formatında)

## 🎯 Mevcut Programlar

### 1. İman & Ahlak
- **Açıklama:** Dualar, peygamberler ve değer oyunlarıyla iman temelli yolculuk.
- **Bölümler:**
  - Dualar
    - Sabah Duası (5 lesson)

### 2. Kur'an & Arapça
- **Açıklama:** Tecvid, süreler ve Arapça kelimelerle Kur'an odaklı öğrenme.
- **Bölümler:**
  - Arap Harfleri
    - Elif Harfi (5 lesson)

## 📝 Lesson (Öğrenme Anı) Türleri

Her ünite altında 5 farklı egzersiz türü bulunur:

### 1. Listen (Dinle ve Seç)
- Ses dinleme ve doğru cevabı seçme
- Ses URL'si içerir
- Çoktan seçmeli

### 2. Select (Seç)
- Görsel veya metin tabanlı seçim
- Doğru şıkkı bulma
- Çoktan seçmeli

### 3. Translate (Çevir)
- Kelime veya cümle çevirisi
- Kullanıcı yazarak cevap verir
- Serbest metin girişi

### 4. Speak (Söyle)
- Mikrofona konuşma
- Ses tanıma ile kontrol
- Telaffuz pratiği

### 5. Arrange (Sırala)
- Öğeleri doğru sıraya dizme
- Sürükle-bırak veya seçim
- Sıralama egzersizi

## 📋 Lesson Dosya Formatı

Her lesson dosyası şu bölümleri içerir:

```markdown
# Öğrenme Anı Başlığı

## Egzersiz Bilgileri
- Egzersiz Türü
- Yönerge
- Doğru Cevaplar
- Seçenekler
- Ses URL'si

## Notlar
- Ek bilgiler ve kurallar

## İçerik Alanı
- Detaylı açıklamalar
- Örnekler
- Görsel/Ses materyalleri
```

## 🚀 Nasıl Kullanılır?

1. İlgili programa git
2. Öğrenmek istediğin bölümü seç
3. Üniteyi aç
4. Lesson dosyalarını sırayla takip et
5. Her lesson'daki içeriği kendi sisteminize entegre edin

## ✏️ Yeni İçerik Ekleme

Yeni içerik eklerken:

1. Doğru hiyerarşiyi takip edin: `Program → Bölüm → Ünite → Lesson`
2. Lesson dosyalarını numaralandırın: `01-`, `02-`, vb.
3. Dosya adlarını açıklayıcı yapın: `01-lesson-dinle-ve-sec.md`
4. Her lesson için tam içerik doldurun
5. Egzersiz türlerinin hepsini kullanın (5 tür)

## 📞 İletişim

İçerik ile ilgili sorularınız için proje sahibiyle iletişime geçin.

---

**Not:** Bu yapı, manuel içerik girişi için hazırlanmıştır. Her lesson dosyasının "İçerik Alanı" bölümüne ilgili .md dosyalarından copy-paste yaparak içerik girebilirsiniz.