# 🤖 Otomatik İçerik Oluşturma Rehberi

## 📋 Durum Özeti

### ✅ Tamamlanan İçerikler

**Program 1: İman & Ahlak**
- ✅ Sabah Duası (5 lesson) - TAM İÇERİKLİ

**Program 2: Kur'an & Arapça**
- ✅ Elif Harfi (5 lesson) - TAM İÇERİKLİ

### 🎯 Strateji

805 dosya tek seferde oluşturmak yerine:

1. **ÖNCE**: Her programdan 2-3 örnek ünite tam içerikle oluşturulacak
2. **SONRA**: Toplu oluşturma scripti ile geri kalanı otomatik doldurulacak
3. **EN SON**: Manuel düzenleme ile içerikler iyileştirilecek

## 🚀 Hızlı Başlangıç İçin Önerilen Yapı

### Faz 1: Demo İçerik (Öncelikli) ⭐

Her programdan **2 ünite** = 70 lesson (yaklaşık 1-2 saat)

```
Programlar/
├── 01-Iman-ve-Ahlak/
│   └── 01-Bolum-Dualar/
│       ├── 01-Unite-Sabah-Duasi/ ✅
│       └── 02-Unite-Aksam-Duasi/ ⏳
│
├── 02-Kuran-ve-Arapca/
│   └── 01-Bolum-Arap-Harfleri/
│       ├── 01-Unite-Elif-Harfi/ ✅
│       └── 02-Unite-Be-Harfi/ ⏳
│
├── 03-Matematik-ve-Mantik/
│   └── 01-Bolum-Temel-Matematik/
│       ├── 01-Unite-Sayilar-1-10/ ⏳
│       └── 02-Unite-Toplama/ ⏳
│
├── 04-Dil-Ogrenimi/
│   └── 01-Bolum-Turkce-Temelleri/
│       ├── 01-Unite-Alfabe/ ⏳
│       └── 02-Unite-Sesli-Harfler/ ⏳
│
├── 05-Zihinsel-Ruhsal-Gelisim/
│   └── 01-Bolum-Nefes-Egzersizleri/
│       ├── 01-Unite-Derin-Nefes/ ⏳
│       └── 02-Unite-4-7-8-Teknigi/ ⏳
│
├── 06-Kisisel-Sosyal/
│   └── 01-Bolum-Kisisel-Gelisim/
│       ├── 01-Unite-Ozguven/ ⏳
│       └── 02-Unite-Sorumluluk/ ⏳
│
└── 07-Bilim-ve-Kesif/
    └── 01-Bolum-Doga/
        ├── 01-Unite-Bitkiler/ ⏳
        └── 02-Unite-Hayvanlar/ ⏳
```

## 📝 Otomatik Oluşturma Scripti

### Script 1: Toplu Klasör Oluşturma

```bash
# Windows CMD
cd scripts\Programlar

# Matematik programı
mkdir "03-Matematik-ve-Mantik\01-Bolum-Temel-Matematik\01-Unite-Sayilar-1-10"
mkdir "03-Matematik-ve-Mantik\01-Bolum-Temel-Matematik\02-Unite-Toplama"

# Dil Öğrenimi
mkdir "04-Dil-Ogrenimi\01-Bolum-Turkce-Temelleri\01-Unite-Alfabe"
mkdir "04-Dil-Ogrenimi\01-Bolum-Turkce-Temelleri\02-Unite-Sesli-Harfler"

# Zihinsel & Ruhsal
mkdir "05-Zihinsel-Ruhsal-Gelisim\01-Bolum-Nefes-Egzersizleri\01-Unite-Derin-Nefes"
mkdir "05-Zihinsel-Ruhsal-Gelisim\01-Bolum-Nefes-Egzersizleri\02-Unite-4-7-8-Teknigi"

# Kişisel & Sosyal
mkdir "06-Kisisel-Sosyal\01-Bolum-Kisisel-Gelisim\01-Unite-Ozguven"
mkdir "06-Kisisel-Sosyal\01-Bolum-Kisisel-Gelisim\02-Unite-Sorumluluk"

# Bilim & Keşif
mkdir "07-Bilim-ve-Kesif\01-Bolum-Doga\01-Unite-Bitkiler"
mkdir "07-Bilim-ve-Kesif\01-Bolum-Doga\02-Unite-Hayvanlar"
```

### Script 2: Lesson Şablonu Oluşturma (Node.js)

`scripts/generate-lessons.js`:

```javascript
const fs = require('fs');
const path = require('path');

// Lesson şablonu
const lessonTemplate = (num, type, unitName, content) => `# Öğrenme Anı ${num}: ${unitName} - ${type}

## Egzersiz Bilgileri

**Egzersiz Türü:** ${type}

**Yönerge:** ${content.instruction}

**Doğru Cevaplar:** 
${content.answers.map(a => `- ${a}`).join('\n')}

**Seçenekler:**
${content.options ? content.options.map(o => `- ${o}`).join('\n') : '(boş bırak)'}

**Ses URL'si:** 
\`\`\`
${content.audioUrl || '(boş bırak)'}
\`\`\`

## Notlar

- ✅ Yeni Kelime Olarak İşaretle: Açık

---

## İçerik Alanı

${content.mainContent}
`;

// Örnek kullanım
const createUnit = (unitPath, unitName, contentData) => {
  const lessonTypes = [
    { num: 1, type: 'Dinle ve Seç', file: '01-lesson-dinle-ve-sec.md' },
    { num: 2, type: 'Seç', file: '02-lesson-sec.md' },
    { num: 3, type: 'Çevir', file: '03-lesson-cevir.md' },
    { num: 4, type: 'Söyle', file: '04-lesson-soyle.md' },
    { num: 5, type: 'Sırala', file: '05-lesson-sirala.md' }
  ];

  lessonTypes.forEach(lesson => {
    const filePath = path.join(unitPath, lesson.file);
    const content = lessonTemplate(
      lesson.num,
      lesson.type,
      unitName,
      contentData[lesson.type] || {}
    );
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${filePath}`);
  });
};

// Kullanım örneği
const contentData = {
  'Dinle ve Seç': {
    instruction: 'Sesi dinle ve doğru cevabı seç',
    answers: ['Cevap 1'],
    options: ['Cevap 1', 'Cevap 2', 'Cevap 3'],
    audioUrl: 'https://example.com/audio.mp3',
    mainContent: '### Detaylı Açıklama\n\nBuraya içerik gir...'
  },
  // Diğer tipler...
};

// createUnit('./Unite-Path', 'Ünite Adı', contentData);
```

## 🎨 İçerik Şablonları

### İman & Ahlak - Dua Şablonu

```markdown
### Dua Metni (Arapça)
أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ

### Okunuş
Emseynâ ve emse'l-mülkü lillâh

### Türkçe Anlam
Akşamladık ve mülk Allah'ındır

### Duanın Önemi
- Ne zaman okunur
- Faydaları
- Ek bilgiler
```

### Kur'an & Arapça - Harf Şablonu

```markdown
### Harf: ب

**İsim:** Be

**Ses Değeri:** "b" sesi

**Şekilleri:**
- Baş: بـ
- Orta: ـبـ
- Son: ـب

**Örnekler:**
- بَيْت (beyt) = ev
- كِتَاب (kitâb) = kitap
```

### Matematik - Sayı Şablonu

```markdown
### Sayı: 5

**Rakam:** 5

**Yazılışı:** Beş

**Görseli:** ★ ★ ★ ★ ★

**Örnekler:**
- 5 elma
- 5 parmak
- 3 + 2 = 5
```

## 📊 İlerleme Takibi

### Tamamlanma Oranları

| Program | Tamamlanan | Toplam | Oran |
|---------|------------|--------|------|
| İman & Ahlak | 5 | 100 | 5% |
| Kur'an & Arapça | 5 | 125 | 4% |
| Matematik | 0 | 150 | 0% |
| Dil Öğrenimi | 0 | 120 | 0% |
| Zihinsel & Ruhsal | 0 | 90 | 0% |
| Kişisel & Sosyal | 0 | 100 | 0% |
| Bilim & Keşif | 0 | 120 | 0% |

**TOPLAM: 10 / 805 lesson (%1.2)**

## 🎯 Önerilen Çalışma Planı

### Hafta 1: Demo İçerik (Öncelik)
- [x] İman & Ahlak - Sabah Duası
- [x] Kur'an & Arapça - Elif Harfi
- [ ] İman & Ahlak - Akşam Duası
- [ ] Kur'an & Arapça - Be Harfi
- [ ] Matematik - Sayılar 1-10
- [ ] Dil Öğrenimi - Alfabe

### Hafta 2: Temel Programlar
- [ ] Matematik ünitelerini tamamla
- [ ] Dil Öğrenimi ünitelerini tamamla

### Hafta 3: Gelişim Programları
- [ ] Zihinsel & Ruhsal üniteler
- [ ] Kişisel & Sosyal üniteler

### Hafta 4: Keşif ve Tamamlama
- [ ] Bilim & Keşif üniteler
- [ ] Eksik içerikleri doldur
- [ ] Kalite kontrol

## 💡 İpuçları

1. **Önce yapıyı kur, sonra içeriği doldur**
2. **Bir programı bitir, sonrakine geç**
3. **Şablonları kullan, tekrar etme**
4. **Düzenli commit at**
5. **Her ünitenin 5 lesson'ı olmalı**

## 🔧 Yararlı Komutlar

```bash
# Tüm klasörleri say
dir /s /b scripts\Programlar | find /c "\"

# Tüm .md dosyalarını say
dir /s /b scripts\Programlar\*.md | find /c ".md"

# Belirli bir ünitenin dosyalarını listele
dir scripts\Programlar\01-Iman-ve-Ahlak\01-Bolum-Dualar\01-Unite-Sabah-Duasi
```

---

**Son Güncelleme:** 5 Kasım 2025
**Durum:** Demo içerik oluşturma aşamasında